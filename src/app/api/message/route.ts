import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { pineconeIndex } from "@/lib/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const POST = async (req: NextRequest) => {
    const body = await req.json();

    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = user.id;
    const { fileId, message } = SendMessageValidator.parse(body);

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId,
        },
    });

    if (!file) {
        return new Response("File not found", { status: 404 });
    }

    // Save user's message
    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            fileId,
            userId,
        },
    });

    // Embed message
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessages = await db.message.findMany({
        where: { fileId },
        orderBy: { createdAt: "asc" },
        take: 6,
    });

    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" : "model",
        content: msg.text,
    }));

    // Create prompt for Gemini
    const promptParts = [
        {
            text: `Use the following previous conversation and context to answer the user's question in markdown. If unsure, say "I don't know."\n\n---\n\nPREVIOUS CONVERSATION:\n` +
                formattedPrevMessages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n") +
                `\n\n---\n\nCONTEXT:\n${results.map(r => r.pageContent).join("\n\n")}` +
                `\n\nUSER QUESTION: ${message}`
        }
    ];

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", // Or gemini-1.5-pro for higher quality
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500,
            },
        });

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: promptParts,
                },
            ],
        });

        const responseText = await result.response.text();

        // Save Gemini's response
        await db.message.create({
            data: {
                text: responseText,
                isUserMessage: false,
                fileId,
                userId,
            },
        });

        return new Response(responseText, {
            status: 200,
        });
    } catch (error) {
        console.error("Error from Gemini:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
