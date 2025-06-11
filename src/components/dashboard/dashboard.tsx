"use client";

import { trpc } from "@/app/_trpc/client";
import { format } from 'date-fns';
import { GhostIcon, Loader2Icon, MessageSquareIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { UploadButton } from "./upload-button";
import { getUserSubscriptionPlan } from "@/lib/stripe";

interface PageProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

export const Dashboard = ({ subscriptionPlan }: PageProps) => {
    const [currentlyDeletingFile, setCurrentlyDeletingFile] =
        useState<string | null>(null)

    const utils = trpc.useContext()

    const { data: files, isLoading } = trpc.getUserFiles.useQuery()

    const { mutate: deleteFile } = trpc.deleteFile.useMutation({
        onSuccess: () => {
            utils.getUserFiles.invalidate()
        },
        onMutate({ id }) {
            setCurrentlyDeletingFile(id)
        },
        onSettled() {
            setCurrentlyDeletingFile(null)
        },
    })

    return (
        <main className="mx-auto max-w-7xl md:p-10">
            <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
                <h1 className="mb-3 font-bold text-5xl text-gray-900">
                    My Files
                </h1>

                {/* Upload Button */}
                <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
            </div>

            {/* DISPLAY ALL USER FILES */}
            {files && files.length !== 0 ? (
                <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-600md:grid-cols-2 lg:grid-cols-3">
                    {files
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )
                        .map((file) => (
                            <li
                                key={file.id}
                                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
                            >
                                <Link
                                    href={`/dashboard/${file.id}`}
                                    className="flex flex-col gap-2"
                                >
                                    <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                                        <div className="size-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />

                                        <div className="flex-1 truncate">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="truncate text-lg font-medium text-zinc-900">
                                                    {file.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <PlusIcon className="size-4" />
                                        {format(
                                            new Date(file.createdAt),
                                            'MMM yyyy'
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MessageSquareIcon className="size-4" />
                                        {file.messages.length} messages
                                    </div>

                                    <Button
                                        onClick={() =>
                                            deleteFile({ id: file.id })
                                        }
                                        size="sm"
                                        className="w-full"
                                        variant="destructive"
                                    >
                                        {currentlyDeletingFile === file.id ? (
                                            <Loader2Icon className="size-4 animate-spin" />
                                        ) : (
                                            <Trash2Icon className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </li>
                        ))
                    }
                </ul>
            ) : isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-16">
                    {[...Array(5)].map((_, idx) => (
                        <Skeleton key={idx} className="h-[150px] w-full my-2" />
                    ))}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center gap-2">
                    <GhostIcon className="size-8 text-zinc-800" />

                    <h3 className="font-semibold text-xl">
                        Pretty empty around here
                    </h3>

                    <p>Let&apos;s upload your first PDF.</p>
                </div>
            )}
        </main>
    )
}