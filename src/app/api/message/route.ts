import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { pineconeIndex } from "@/lib/pinecone";

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
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY!,
    })

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessage = await db.message.findMany({
        where: {
            fileId,
        },
        orderBy: {
            createdAt: 'asc',
        },
        take: 6,
    })

    const formattedPrevMessages = prevMessage.map((msg) => ({
        role: msg.isUserMessage
            ? ("user" as const)
            : ("assistant" as const),
        content: msg.text
    }))
}
