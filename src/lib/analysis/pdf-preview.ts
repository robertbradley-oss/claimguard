export type PdfPagePreview = {
  objectUrl: string;
  width: number;
  height: number;
  pageCount: number;
};

export async function renderPdfFirstPagePreview(file: File): Promise<PdfPagePreview> {
  if (typeof window === "undefined") {
    throw new Error("PDF preview rendering is only available in the browser.");
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();

  const pdfDocument = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;

  try {
    const page = await pdfDocument.getPage(1);
    const pageViewport = page.getViewport({ scale: 1 });
    const maxPreviewWidth = 1400;
    const maxPreviewHeight = 1800;
    const fitScale = Math.min(
      maxPreviewWidth / pageViewport.width,
      maxPreviewHeight / pageViewport.height,
    );
    const renderScale = Math.min(2, Math.max(0.72, fitScale));
    const viewport = page.getViewport({ scale: renderScale });
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to create a canvas context for PDF preview.");
    }

    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((previewBlob) => {
        if (previewBlob) {
          resolve(previewBlob);
        } else {
          reject(new Error("Unable to create a PDF preview image."));
        }
      }, "image/png");
    });

    page.cleanup();

    return {
      objectUrl: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
      pageCount: pdfDocument.numPages,
    };
  } finally {
    await pdfDocument.destroy();
  }
}
