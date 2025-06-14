"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import Dropzone from 'react-dropzone'
import { CloudIcon, FileIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner"
import { Progress } from "../ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";


const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
    const router = useRouter()

    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)

    const { startUpload } = useUploadThing(
        isSubscribed ? "proPlanUploader" : "freePlanUploader",
    )

    const { mutate: startPolling } = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file.id}`)
        },
        retry: true,
        retryDelay: 500,
    })

    const startSimulatedProgress = () => {
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if (prevProgress >= 95) {
                    clearInterval(interval)
                    return prevProgress
                }
                return prevProgress + 5
            })
        }, 500);

        return interval;
    }

    return (
        <Dropzone
            multiple={false}
            onDrop={async (acceptedFiles) => {
                console.log(acceptedFiles);

                setIsUploading(true);

                const progressInterval = startSimulatedProgress();

                const res = await startUpload(acceptedFiles);
                if (!res) {
                    return toast.error("Upload failed.", {
                        description: "Please try again."
                    });
                }

                const [fileResponse] = res;
                const key = fileResponse?.key;
                if (!key) {
                    return toast.error("Upload failed.", {
                        description: "Please try again."
                    });
                }

                toast.success("Upload complete!", {
                    description: "Your file is being processed.",
                });

                clearInterval(progressInterval);
                setUploadProgress(100);

                startPolling({ key });
            }}
        >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
                <div
                    {...getRootProps()}
                    className="border h-64 border-dashed border-gray-300 rounded-lg"
                >
                    <div className="flex items-center justify-center h-full w-full">
                        <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <CloudIcon className="size-6 text-zinc-500 mb-2" />

                                <p className="mb-2 text-sm text-zinc-700">
                                    <span className="font-semibold">
                                        Click to upload
                                    </span>{" "}
                                    or drag and drop
                                </p>

                                <p className="text-xs text-zinc-500">
                                    PDF (up to {isSubscribed ? "16" : "4"}MB)
                                </p>
                            </div>

                            {acceptedFiles && acceptedFiles[0] ? (
                                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                                    <div className="px-3 py-2 h-full grid place-items-center">
                                        <FileIcon className="size-4 text-blue-500" />
                                    </div>

                                    <div className="px-3 py-2 h-full text-sm truncate">
                                        {acceptedFiles[0].name}
                                    </div>
                                </div>
                            ) : null}

                            {isUploading ? (
                                <div className="w-full mt-4 max-w-xs mx-auto">
                                    <Progress
                                        value={uploadProgress}
                                        className={`h-1 w-full bg-zinc-200 ${uploadProgress === 100 ? "bg-green-500" : ""}`}
                                    />

                                    {uploadProgress === 100 ? (
                                        <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                                            <Loader2Icon className="h-3 w-3 animate-spin" />
                                            Redirecting...
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            <input
                                {...getInputProps()}
                                type="file"
                                id="dropzone-file"
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            )}
        </Dropzone>
    )
}

export const UploadButton = ({ isSubscribed }: { isSubscribed: boolean }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                setIsOpen(v);
            }}
        >
            <DialogTrigger
                onClick={() => setIsOpen(true)}
                asChild
            >
                <Button>Upload PDF</Button>
            </DialogTrigger>

            <DialogContent>
                <UploadDropzone isSubscribed={isSubscribed} />
            </DialogContent>
        </Dialog>
    )
}
