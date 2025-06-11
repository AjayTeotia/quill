import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pineconeIndex } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();

const middleware = async () => {
    const { getUser } = await getKindeServerSession(); // ✅ no req passed
    const user = await getUser();

    if (!user || !user.id) {
        throw new UploadThingError("Unauthorized");
    }

    const subscriptionPlan = await getUserSubscriptionPlan()

    return { subscriptionPlan, userId: user.id }
}

const onUploadComplete = async ({
    metadata,
    file,
}: {
    metadata: Awaited<ReturnType<typeof middleware>>
    file: {
        key: string
        name: string
        url: string
    }
}) => {
    const isFileExist = await db.file.findFirst({
        where: {
            key: file.key,
        },
    })

    if (isFileExist) return

    const createdFile = await db.file.create({
        data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: file.url,
            uploadStatus: 'PROCESSING',
        },
    })

    console.log("File uploaded successfully:", createdFile);

    try {
        const response = await fetch(file.url)

        const blob = await response.blob()
        const loader = new PDFLoader(blob)

        const pageLevelDocs = await loader.load()
        const pagesAmt = pageLevelDocs.length

        const { subscriptionPlan } = metadata
        const { isSubscribed } = subscriptionPlan

        const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === 'Pro')!.pagesPerPdf

        const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === 'Free')!.pagesPerPdf

        if (
            (isSubscribed && isProExceeded) ||
            (!isSubscribed && isFreeExceeded)
        ) {
            await db.file.update({
                data: {
                    uploadStatus: 'FAILED',
                },
                where: {
                    id: createdFile.id,
                },
            })
        }

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
        })

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
            pineconeIndex,
            namespace: createdFile.id,
        });

        await db.file.update({
            where: { id: createdFile.id },
            data: { uploadStatus: "SUCCESS" },
        });

    } catch (error) {
        console.log(error)

        await db.file.update({
            where: { id: createdFile.id },
            data: { uploadStatus: "FAILED" },
        });
    }
}

export const ourFileRouter = {
    freePlanUploader: f({ pdf: { maxFileSize: '4MB' } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
    proPlanUploader: f({ pdf: { maxFileSize: '16MB' } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
