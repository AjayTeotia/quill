import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { useResizeDetector } from "react-resize-detector"
import { Button } from "../ui/button"
import { ExpandIcon, Loader2Icon } from "lucide-react"
import SimpleBar from "simplebar-react"
import { Document, Page } from "react-pdf"
import { toast } from "sonner"

export const PDFFullscreen = ({ fileUrl }: { fileUrl: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [numPages, setNumPages] = useState<number>()

    const { width, ref } = useResizeDetector()

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                if (!v) {
                    setIsOpen(v)
                }
            }}
        >
            <DialogTrigger
                onClick={() => setIsOpen(true)}
                asChild
            >
                <Button
                    variant="ghost"
                    className="gap-1.5"
                    aria-label="Fullscreen PDF"
                >
                    <ExpandIcon className="size-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-7xl w-full">
                <SimpleBar
                    autoHide={false}
                    className="max-h-[calc(100vh-10rem)] mt-6"
                >
                    <div ref={ref}>
                        <Document
                            loading={
                                <div className="flex justify-center">
                                    <Loader2Icon className="my-24 h-6 w-6 animate-spin" />
                                </div>
                            }
                            onLoadError={() => {
                                toast.error("Failed to load PDF document. Please try again later.")
                            }}
                            onLoadSuccess={({ numPages }) =>
                                setNumPages(numPages)
                            }
                            file={fileUrl}
                            className="max-h-full"
                        >
                            {new Array(numPages).fill(0).map((_, i) => (
                                <Page
                                    key={i}
                                    width={width ? width : 1}
                                    pageNumber={i + 1}
                                />
                            ))}
                        </Document>
                    </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    )
}