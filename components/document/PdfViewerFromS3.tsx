"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure the worker path based on the react-pdf instructions for Next.js/React
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerFromS3Props {
  s3Url: string;
}

const PdfViewerFromS3: React.FC<PdfViewerFromS3Props> = ({ s3Url }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const file = React.useMemo(() => {
    if (!s3Url) return null;
    // Prefix external URLs with our proxy to avoid CORS issues
    if (s3Url.startsWith("http")) {
      return { url: `/api/proxy-pdf?url=${encodeURIComponent(s3Url)}` };
    }
    return { url: s3Url };
  }, [s3Url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setError(true);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center w-full">
      {loading && !error && (
        <div className="text-gray-500 py-4">กำลังโหลดเอกสาร PDF...</div>
      )}
      {error && (
        <div className="text-red-500 py-4">
          ไม่สามารถโหลดเอกสาร PDF ได้ กรุณาลองใหม่หรือเปิดในหน้าต่างใหม่
        </div>
      )}

      <div className="flex justify-center w-full max-w-full overflow-auto bg-gray-50 min-h-[500px] border border-gray-200">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="flex justify-center shadow-sm"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="mx-auto"
            /* Add scale or width to restrict it to container width if needed */
            width={600}
          />
        </Document>
      </div>

      {numPages && (
        <div className="flex items-center gap-4 mt-4 bg-white px-4 py-2 rounded-lg border shadow-sm">
          <button
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-50 text-sm font-medium focus:outline-none transition-colors"
          >
            ก่อนหน้า
          </button>
          <span className="text-sm font-medium text-gray-600">
            หน้าที่ {pageNumber} จาก {numPages}
          </span>
          <button
            onClick={() =>
              setPageNumber((prev) => Math.min(prev + 1, numPages))
            }
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-50 text-sm font-medium focus:outline-none transition-colors"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfViewerFromS3;
