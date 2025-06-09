import { trpc } from "@/app/_trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"
import { Loader2Icon, MessageSquareIcon } from "lucide-react"
import { Skeleton } from "../ui/skeleton"
import { Message } from "./message"
import { useEffect, useRef } from "react"
import { useIntersection } from "@mantine/hooks"

export const Messages = ({ fileId }: { fileId: string }) => {
    const { data, isLoading, fetchNextPage } = trpc.getFileMessages.useInfiniteQuery({
        fileId,
        limit: INFINITE_QUERY_LIMIT,
    }, {
        getNextPageParam: (lastPage) =>
            lastPage?.nextCursor,
        keepPreviousData: true,
    })

    const messages = data?.pages.flatMap(
        (page) => page.messages
    )

    const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: "loading-message",
        isUserMessage: false,
        text: (
            <span className="flex h-full items-center justify-center">
                <Loader2Icon className="size-4 animate-spin" />
            </span>
        )
    }

    const combinedMessages = [
        ...(true ? [loadingMessage] : []),
        ...(messages ?? []),
    ]

    const lastMessageRef = useRef<HTMLDivElement>(null)

    const { ref, entry } = useIntersection({
        root: lastMessageRef.current,
        threshold: 1,
    })

    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage()
        }
    }, [entry, fetchNextPage])

    return (
        <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            {combinedMessages && combinedMessages.length > 0 ? (
                combinedMessages.map((message, i) => {
                    const isNextMessageSamePerson =
                        combinedMessages[i - 1]?.isUserMessage ===
                        combinedMessages[i]?.isUserMessage

                    if (i === combinedMessages.length - 1) {
                        return (
                            <Message
                                key={message.id}
                                ref={ref}
                                message={message}
                                isNextMessageSamePerson={isNextMessageSamePerson}
                            />
                        )
                    } else {
                        return (
                            <Message
                                key={message.id}
                                message={message}
                                isNextMessageSamePerson={isNextMessageSamePerson}
                            />
                        )
                    }
                })
            ) : isLoading ? (
                <div className="w-full flex flex-col gap-2">
                    {[...Array(5)].map((_, idx) => (
                        <Skeleton key={idx} className="h-16" />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <MessageSquareIcon className="size-8 text-blue-500" />

                    <h3 className="font-semibold text-xl">
                        You&apos;re all set!
                    </h3>

                    <p className="text-zinc-500 text-sm">
                        Ask your first question to get started.
                    </p>
                </div>
            )}
        </div>
    )
}