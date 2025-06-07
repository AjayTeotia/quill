"use client"

import { ChevronDownIcon, ChevronUpIcon, Loader2Icon, RotateCwIcon, SearchIcon } from 'lucide-react';

import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResizeDetector } from 'react-resize-detector';
import SimpleBar from 'simplebar-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { PDFFullscreen } from './pdf-fullscreen';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

export const PDFRenderer = ({ pdfUrl }: { pdfUrl: string }) => {
    const { width, ref } = useResizeDetector();

    const [numPages, setNumPages] = useState<number>()
    const [currPage, setCurrPage] = useState<number>(1)
    const [scale, setScale] = useState<number>(1)
    const [rotation, setRotation] = useState<number>(0);
    const [renderedScale, setRenderedScale] = useState<number | null>(null)

    const isLoading = renderedScale !== scale

    const CustomPageValidator = z.object({
        page: z
            .string()
            .refine(
                (num) => Number(num) > 0 && Number(num) <= numPages!
            ),
    })

    type TCustomPageValidator = z.infer<
        typeof CustomPageValidator
    >

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<TCustomPageValidator>({
        defaultValues: {
            page: "1",
        },
        resolver: zodResolver(CustomPageValidator)
    })

    // console.log(errors)

    const handlePageSubmit = ({
        page,
    }: TCustomPageValidator) => {
        setCurrPage(Number(page))
        setValue('page', String(page))
    }

    return (
        <div className="w-full bg-white rounded-md shadow-md flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    <Button
                        aria-label="Previous Page"
                        variant="ghost"
                        disabled={currPage <= 1}
                        onClick={() => {
                            setCurrPage((prev) =>
                                prev > 1 ? prev - 1 : prev
                            )
                            setValue('page', String(currPage - 1))
                        }}
                    >
                        <ChevronDownIcon className="size-4" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                        <Input
                            {...register("page")}
                            className={cn(
                                "w-12 h-8",
                                errors.page && "focus-visible:ring-red-500"
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmit(handlePageSubmit)()
                                }
                            }}
                        />

                        <p className="text-zinc-700 text-sm space-x-1">
                            <span>/</span>
                            <span>
                                {numPages ?? "X"}
                            </span>
                        </p>
                    </div>

                    <Button
                        aria-label="Next Page"
                        variant="ghost"
                        disabled={
                            numPages === undefined || currPage === numPages
                        }
                        onClick={() => {
                            setCurrPage((prev) =>
                                prev + 1 > numPages! ? numPages! : prev + 1
                            )
                            setValue('page', String(currPage + 1))
                        }}
                    >
                        <ChevronUpIcon className="size-4" />
                    </Button>
                </div>

                <div className="space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="gap-1.5"
                                aria-label="Zoom"
                                variant="ghost"
                            >
                                <SearchIcon className="size-4" />
                                {scale * 100} %
                                <ChevronDownIcon className="size-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setScale(1)}>
                                100%
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={() => setScale(1.5)}>
                                150%
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={() => setScale(2)}>
                                200%
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={() => setScale(2.5)}>
                                250%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        onClick={() => setRotation((prev) => prev + 90)}
                        variant="ghost"
                        aria-label="rotate 90 degrees"
                    >
                        <RotateCwIcon className="size-4" />
                    </Button>

                    <PDFFullscreen fileUrl={pdfUrl} />
                </div>
            </div>

            <div className="flex-1 w-full max-h-screen">
                <SimpleBar
                    autoHide={false}
                    className="max-h-[calc(100vh-10rem)]"
                >
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
                            onLoadSuccess={({ numPages }) => {
                                setNumPages(numPages);
                            }}
                        >
                            {isLoading && renderedScale ? (
                                <Page
                                    pageNumber={currPage}
                                    width={width ? width : 1}
                                    scale={scale}
                                    rotate={rotation}
                                    key={'@' + renderedScale}
                                />) : null
                            }

                            <Page
                                className={cn(isLoading ? 'hidden' : '')}
                                width={width ? width : 1}
                                pageNumber={currPage}
                                scale={scale}
                                rotate={rotation}
                                key={'@' + scale}
                                loading={
                                    <div className='flex justify-center'>
                                        <Loader2Icon className='my-24 h-6 w-6 animate-spin' />
                                    </div>
                                }
                                onRenderSuccess={() =>
                                    setRenderedScale(scale)
                                }
                            />

                        </Document>
                    </div>
                </SimpleBar>
            </div>
        </div >
    );
}