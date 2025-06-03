import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = await getKindeServerSession();
        const user = await getUser();

        if (!user || !user.email)
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });

        // TODO: Check if user exists in database, if not create a new user

        return { success: true }
    })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;