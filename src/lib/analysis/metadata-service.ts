import type { EvidenceMetadata } from "@/lib/analysis/types";

function toPlainExif(exif: unknown) {
  if (!exif || typeof exif !== "object") {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(exif as Record<string, unknown>)
      .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
      .slice(0, 20),
  ) as Record<string, string | number | boolean>;
}

async function getImageDimensions(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image dimensions could not be read."));
    });
    image.src = objectUrl;
    const loadedImage = await loaded;

    return {
      width: loadedImage.naturalWidth,
      height: loadedImage.naturalHeight,
      megapixels: Number(((loadedImage.naturalWidth * loadedImage.naturalHeight) / 1_000_000).toFixed(2)),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function buildMetadataContext(params: {
  isImage: boolean;
  isPdf: boolean;
  metadataAvailable: boolean;
  metadataNotes: string[];
}) {
  if (params.metadataAvailable) {
    return {
      status: "Available" as const,
      summary: params.isPdf
        ? "PDF page context was available for local review."
        : "Image metadata was available for local review.",
    };
  }

  if (params.isImage || params.isPdf) {
    return {
      status: "Limited" as const,
      summary:
        params.metadataNotes.length > 0
          ? `Source metadata context is limited: ${params.metadataNotes.join(" ")}`
          : "Source metadata context is limited for this evidence.",
    };
  }

  return {
    status: "Unavailable" as const,
    summary: "Metadata context is unavailable for this unsupported evidence type.",
  };
}

export async function inspectMetadata(file: File, pdfPageCount?: number, pdfTextExtracted = false): Promise<EvidenceMetadata> {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const metadataNotes: string[] = [];
  let image: EvidenceMetadata["image"];
  let exif: EvidenceMetadata["exif"];

  if (isImage) {
    image = await getImageDimensions(file);

    try {
      const exifr = await import("exifr");
      exif = toPlainExif(await exifr.parse(file));
      if (!exif || Object.keys(exif).length === 0) {
        metadataNotes.push("Image EXIF metadata is unavailable or stripped.");
      }
    } catch {
      metadataNotes.push("Image metadata could not be parsed locally.");
    }
  }

  if (isPdf && !pdfTextExtracted) {
    metadataNotes.push("PDF text layer was limited or unavailable.");
  }

  if (file.lastModified === 0) {
    metadataNotes.push("Browser did not provide a reliable last-modified timestamp.");
  }

  const metadataAvailable = isPdf ? Boolean(pdfPageCount) : Boolean(exif && Object.keys(exif).length > 0);

  return {
    fileName: file.name,
    mimeType: file.type || "unknown",
    sizeBytes: file.size,
    lastModifiedIso: new Date(file.lastModified || Date.now()).toISOString(),
    metadataAvailable,
    metadataNotes,
    context: buildMetadataContext({
      isImage,
      isPdf,
      metadataAvailable,
      metadataNotes,
    }),
    image,
    pdf: isPdf
      ? {
          pages: pdfPageCount ?? 0,
          textExtracted: pdfTextExtracted,
        }
      : undefined,
    exif,
  };
}
