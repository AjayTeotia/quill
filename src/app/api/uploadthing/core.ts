import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pineconeIndex } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"

const f = createUploadthing();


export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async () => {
            const { getUser } = await getKindeServerSession(); // ✅ no req passed
            const user = await getUser();

            if (!user || !user.id) {
                throw new UploadThingError("Unauthorized");
            }

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
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
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
