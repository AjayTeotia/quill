import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    const body = await req.json();

    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userId = user.id;

    const { fileId, message } = SendMessageValidator.parse(body)

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId
        }
    })

    if (!file) {
        return new Response('File not found', { status: 404 });
    }

    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            fileId,
            userId
        }
    })

    // 1: vectorize message
    

}
