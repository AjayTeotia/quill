import { ChatWrapper } from "@/components/chat/chat-wrapper";
import { PDFRenderer } from "@/components/dashboard/pdf-renderer";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function FileIdPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params; // ✅ Properly awaiting `params`

    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        redirect(`/auth-callback?origin=dashboard/${id}`);
    }

    const file = await db.file.findUnique({
        where: {
            id,
            userId: user.id,
        },
    });

    if (!file) notFound();

    const plan = await getUserSubscriptionPlan()

    return (
        <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
                {/* LEFT SIDEBAR & MAIN WRAPPER */}
                <div className="flex-1 xl:flex">
                    <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
                        {/* Main area */}
                        <PDFRenderer pdfUrl={file.url} />
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="'shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
                    <ChatWrapper fileId={id} isSubscribed={plan.isSubscribed} />
                </div>
            </div>
        </div>
    );
}
