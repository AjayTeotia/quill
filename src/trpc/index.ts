import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod';

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = await getKindeServerSession();
        const user = await getUser();

        if (!user || !user.email)
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });

        // Check if user exists in database, if not create a new user
        const dbUser = await db.user.findUnique({
            where: {
                id: user.id,
            }
        })

        // if user does not exist, create a new user
        if (!dbUser) {
            // create a new user
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                },
            })
        }

        return { success: true }
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
        })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;