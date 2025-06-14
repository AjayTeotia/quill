"use client"

import { trpc } from "@/app/_trpc/client";
import { ChatInput } from "./chat-input";
import { Messages } from "./messages";
import { ChevronLeftIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./chat-context";
import { PLANS } from "@/config/stripe";

interface ChatWrapperProps {
    fileId: string;
    isSubscribed: boolean
}

export const ChatWrapper = ({
    fileId,
    isSubscribed,
}: ChatWrapperProps) => {
    const { data, isLoading } = trpc.getFileUploadStatus.useQuery({ fileId, }, {
        refetchInterval: (query) =>
            query.state.data?.status === "SUCCESS" ||
                query.state.data?.status === "FAILED"
                ? false
                : 500,
    },
    );

    if (isLoading)
        return (
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 justify-center flex flex-col mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2Icon className="size-8 text-blue-500 animate-spin" />

                        <h3 className="font-semibold text-xl">
                            Loading...
                        </h3>

                        <p className="text-zinc-500 text-sm">
                            We&apos;re preparing your PDF.
                        </p>
                    </div>
                </div>

                <ChatInput isDisabled />
            </div>
        )

    if (data?.status === "PROCESSING")
        return (
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 justify-center flex flex-col mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2Icon className="size-8 text-blue-500 animate-spin" />

                        <h3 className="font-semibold text-xl">
                            Processing PDF...
                        </h3>

                        <p className="text-zinc-500 text-sm">
                            This won&apos;t take long.
                        </p>
                    </div>
                </div>

                <ChatInput isDisabled />
            </div>
        )

    if (data?.status === "FAILED")
        return (
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 justify-center flex flex-col mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <XCircleIcon className="size-8 text-red-500" />

                        <h3 className="font-semibold text-xl">
                            Too many pages in PDF
                        </h3>

                        <p className='text-zinc-500 text-sm'>
                            Your{' '}
                            <span className='font-medium'>
                                {isSubscribed ? 'Pro' : 'Free'}
                            </span>{' '}
                            plan supports up to{' '}
                            {isSubscribed
                                ? PLANS.find((p) => p.name === 'Pro')
                                    ?.pagesPerPdf
                                : PLANS.find((p) => p.name === 'Free')
                                    ?.pagesPerPdf}{' '}
                            pages per PDF.
                        </p>

                        <Link
                            href="/dashboard"
                            className={buttonVariants({
                                variant: "secondary",
                                className: "mt-4"
                            })}
                        >
                            <ChevronLeftIcon className="size-3 mr-1.5" />
                            Back
                        </Link>
                    </div>
                </div>

                <ChatInput isDisabled />
            </div>
        )

    return (
        <ChatContextProvider fileId={fileId}>
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 justify-between flex flex-col mb-28">
                    <Messages fileId={fileId} />
                </div>

                <ChatInput />
            </div>
        </ChatContextProvider>
    )
}