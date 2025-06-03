import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';

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
    })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;