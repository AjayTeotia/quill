interface ChatWrapperProps {
    fileId: string;
}

export const ChatWrapper = ({
    fileId,
}: ChatWrapperProps) => {
    return (
        <div>
            <h1>{fileId}</h1>
        </div>
    )
}