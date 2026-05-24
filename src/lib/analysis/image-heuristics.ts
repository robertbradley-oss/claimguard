import type { EvidenceMetadata, ExtractedReceiptInfo, ImageHeuristics, OcrExtraction } from "@/lib/analysis/types";

function getAlignmentState(receipt: ExtractedReceiptInfo, ocr: OcrExtraction) {
  const priceMatches = ocr.text.match(/\$?\d+[,.]\d{2}/g) ?? [];

  if (ocr.text.length < 30 || receipt.lineCount < 4) {
    return "Inconclusive" satisfies ImageHeuristics["formattingAlignment"];
  }

  if (priceMatches.length >= 2 && !receipt.total) {
    return "Needs review" satisfies ImageHeuristics["formattingAlignment"];
  }

  return "Consistent" satisfies ImageHeuristics["formattingAlignment"];
}

function hasBlockingOcrQuality(ocr: OcrExtraction) {
  return (
    ocr.quality.label === "Unreadable" ||
    ocr.averageConfidence < 60 ||
    (ocr.quality.label === "Inconclusive" && ocr.averageConfidence < 75)
  );
}

export function inspectImageHeuristics(
  metadata: EvidenceMetadata,
  receipt: ExtractedReceiptInfo,
  ocr: OcrExtraction,
): ImageHeuristics {
  const evidenceQualityIndicators: string[] = [];
  const sourceContextIndicators: string[] = [];
  const potentialEditingIndicators: string[] = [];
  const pixelCount = metadata.image ? metadata.image.width * metadata.image.height : undefined;
  const bytesPerPixel = pixelCount ? Number((metadata.sizeBytes / pixelCount).toFixed(3)) : undefined;
  let compressionLevel: ImageHeuristics["compressionLevel"] = "Normal";

  if (bytesPerPixel !== undefined) {
    if (bytesPerPixel < 0.08) {
      compressionLevel = "High review";
      evidenceQualityIndicators.push("Very low bytes-per-pixel ratio can reduce evidence quality.");
    } else if (bytesPerPixel < 0.16) {
      compressionLevel = "Review";
      evidenceQualityIndicators.push("Compressed image quality may limit manual verification.");
    }
  }

  if (metadata.image && metadata.image.megapixels < 0.35) {
    evidenceQualityIndicators.push("Low-resolution image may hide receipt or product details.");
  }

  if (!metadata.metadataAvailable && metadata.mimeType.startsWith("image/")) {
    sourceContextIndicators.push("Image metadata is unavailable, so source context is limited.");
  }

  if (ocr.averageConfidence < 55) {
    evidenceQualityIndicators.push("OCR confidence is low in at least one visible text area.");
  }

  const formattingAlignment = getAlignmentState(receipt, ocr);
  const blockingOcrQuality = hasBlockingOcrQuality(ocr);

  if (formattingAlignment === "Needs review") {
    potentialEditingIndicators.push("Currency fields were detected, but the total field was not confidently parsed.");
  }

  const isLowResolution = Boolean(metadata.image && metadata.image.megapixels < 0.35);
  const qualityLevel: ImageHeuristics["qualityLevel"] =
    compressionLevel === "High review" || ocr.quality.label === "Unreadable"
      ? "Poor"
      : compressionLevel === "Review" || isLowResolution || blockingOcrQuality
        ? "Limited"
        : ocr.quality.label === "Usable" || ocr.quality.label === "Inconclusive"
          ? "Usable"
          : "Clear";
  const qualitySummary =
    qualityLevel === "Clear"
      ? "Image quality is clear enough for local review."
      : qualityLevel === "Usable"
        ? "Image quality is usable, with minor OCR or visual limitations."
        : qualityLevel === "Limited"
          ? "Image quality may limit reliable field verification."
          : "Image quality is poor enough that findings should be treated as inconclusive.";

  if (formattingAlignment === "Inconclusive") {
    evidenceQualityIndicators.push("Receipt formatting alignment is inconclusive because text is sparse or too short.");
  }

  return {
    bytesPerPixel,
    qualityLevel,
    qualitySummary,
    compressionLevel,
    formattingAlignment,
    evidenceQualityIndicators,
    sourceContextIndicators,
    potentialEditingIndicators,
  };
}
