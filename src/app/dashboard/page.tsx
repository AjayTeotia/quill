import { Dashboard } from "@/components/dashboard/dashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) redirect("auth-callback?origin=dashboard");

    const dbUser = await db.user.findUnique({
        where: {
            id: user.id,
        },
    });

    if (!dbUser) redirect('/auth-callback?origin=dashboard')

    return <Dashboard />;
}