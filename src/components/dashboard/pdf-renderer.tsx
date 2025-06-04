export const PDFRenderer = ({ pdfUrl }: { pdfUrl: string }) => {
    return (
        <div className="w-full bg-white rounded-md shadow-md flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    
                </div>
            </div>

            {pdfUrl}
        </div>
    );
}