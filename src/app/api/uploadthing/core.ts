import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();


export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async () => {
            const { getUser } = await getKindeServerSession();
            const user = await getUser();

            if (!user || !user.id) {
                throw new UploadThingError("Unauthorized");
            }

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {

        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
