import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) redirect("auth-callback?origin=dashboard");

    return (
        <div>
            Hello Dashboard!
            <p>This is the dashboard page.</p>

            <p>
                Welcome, {user.given_name || user.family_name || "User"}! Your
                email is {user.email}.
            </p>
        </div>
    )
}