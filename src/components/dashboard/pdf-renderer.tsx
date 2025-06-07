"use client"

import { ChevronDownIcon, Loader2Icon } from 'lucide-react';

import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { useResizeDetector } from 'react-resize-detector';
import { toast } from 'sonner';
import { Button } from '../ui/button';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

export const PDFRenderer = ({ pdfUrl }: { pdfUrl: string }) => {
    const { width, ref } = useResizeDetector();

    return (
        <div className="w-full bg-white rounded-md shadow-md flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    <Button
                        aria-label="Previous Page"
                        variant="ghost"
                    >
                        <ChevronDownIcon className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full max-h-screen">
                <div ref={ref}>
                    <Document
                        file={pdfUrl}
                        className="max-h-full"
                        loading={
                            <div className="flex justify-center">
                                <Loader2Icon className="animate-spin my-24 size-6" />
                            </div>
                        }
                        onLoadError={() => {
                            toast.error('Failed to load PDF document. Please try again later.');
                        }}
                    >
                        <Page
                            pageNumber={1}
                            width={width ? width : 1}
                        />
                    </Document>
                </div>
            </div>
        </div>
    );
}