import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod';
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';
import { absoluteUrl } from '@/lib/utils';
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe';
import { PLANS } from '@/config/stripe';

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = await getKindeServerSession();
        const user = await getUser();

        if (!user || !user.email)
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });

        // Check if user exists in database
        let dbUser = await db.user.findUnique({
            where: {
                id: user.id,
            }
        });

        // If user does not exist, create one and send Ping Panda event
        if (!dbUser) {
            dbUser = await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                },
            });

            // Send event to Ping Panda
            await fetch('https://pingpanda-aj.vercel.app/api/v1/events', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer cm4frib3u0001144zbuk0fyqh',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: 'quill_users',
                    fields: {
                        userId: user.id,
                        userEmail: user.email,
                        userName: user.given_name || "Unknown",
                    },
                }),
            }).catch((err) => {
                console.error("Ping Panda event failed:", err);
            });
        }

        return { success: true };
    }),


    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx

        return await db.file.findMany({
            where: {
                userId,
            },
            include: {
                messages: true,
            },
        })
    }),

    getFile: privateProcedure
        .input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx

            const file = await db.file.findFirst({
                where: {
                    key: input.key,
                    userId,
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            return file
        }),

    deleteFile: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const file = await db.file.findUnique({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!file) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'File not found or you do not have permission to delete it.',
                });
            }

            // Delete the file and its associated messages
            await db.file.delete({
                where: {
                    id: input.id,
                },
            });

            return file;
        }),

    getFileUploadStatus: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ ctx, input }) => {
            const file = await db.file.findUnique({
                where: {
                    id: input.fileId,
                    userId: ctx.userId,
                }
            })

            if (!file) return { status: "PENDING" as const }

            return { status: file.uploadStatus }
        }),

    getFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),
                fileId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { userId } = ctx
            const { fileId, cursor } = input
            const limit = input.limit ?? INFINITE_QUERY_LIMIT

            const file = db.file.findFirst({
                where: {
                    id: fileId,
                    userId,
                }
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            const messages = await db.message.findMany({
                take: limit + 1,
                where: {
                    fileId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                cursor: cursor ? { id: cursor } : undefined,
                select: {
                    id: true,
                    isUserMessage: true,
                    createdAt: true,
                    text: true,
                }
            })

            let nextCursor: typeof cursor | undefined = undefined
            if (messages.length > limit) {
                const nextItem = messages.pop()
                nextCursor = nextItem?.id
            }

            return {
                messages,
                nextCursor,
            }
        }),

    createStripeSession: privateProcedure
        .mutation(async ({ ctx }) => {
            const { userId } = ctx
            if (!userId)
                throw new TRPCError({ code: 'UNAUTHORIZED' })

            const dbUser = await db.user.findFirst({
                where: {
                    id: userId,
                }
            })
            if (!dbUser)
                throw new TRPCError({ code: 'UNAUTHORIZED' })

            const billingUrl = absoluteUrl("/dashboard/billing")

            const subscriptionPlan = await getUserSubscriptionPlan();

            if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
                const stripeSession = await stripe.billingPortal.sessions.create({
                    customer: dbUser.stripeCustomerId,
                    return_url: billingUrl,
                })

                return {
                    url: stripeSession.url,
                }
            }

            const stripeSession = await stripe.checkout.sessions.create({
                success_url: billingUrl,
                cancel_url: billingUrl,
                payment_method_types: ["card"],
                mode: "subscription",
                billing_address_collection: "auto",
                line_items: [
                    {
                        price: PLANS.find(
                            (plan) => plan.name === 'Pro'
                        )?.price.priceIds.test,
                        quantity: 1,
                    }
                ],
                metadata: {
                    userId: userId,
                },
            })

            return {
                url: stripeSession.url,
            }
        }),
});

export type AppRouter = typeof appRouter;