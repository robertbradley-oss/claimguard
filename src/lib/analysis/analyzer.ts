import type { EvidenceType } from "@/lib/claim-data";
import { inspectImageHeuristics } from "@/lib/analysis/image-heuristics";
import { inspectMetadata } from "@/lib/analysis/metadata-service";
import { extractOcr } from "@/lib/analysis/ocr-service";
import { parseReceiptText } from "@/lib/analysis/receipt-parser";
import { buildReviewSignals, scoreAnalysis } from "@/lib/analysis/scoring";
import type { FindingGroup, FindingStatus, LocalAnalysisResult, OcrExtraction, ReceiptFieldReliability, ReviewSignal } from "@/lib/analysis/types";

export function getEvidenceTypeFromFile(file: File | null): EvidenceType {
  if (!file) {
    return "receipt";
  }

  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }

  if (name.includes("screenshot") || name.includes("screen")) {
    return "screenshot";
  }

  if (
    file.type.startsWith("image/") &&
    (name.includes("damage") ||
      name.includes("photo") ||
      name.includes("crack") ||
      name.includes("product"))
  ) {
    return "damage-photo";
  }

  return "receipt";
}

function labelFor(evidenceType: EvidenceType) {
  return evidenceType === "pdf"
    ? "PDF receipt"
    : evidenceType === "screenshot"
      ? "Order screenshot"
      : evidenceType === "damage-photo"
        ? "Product damage photo"
        : "Receipt";
}

function buildEvidenceSummary(result: {
  receipt: ReturnType<typeof parseReceiptText>;
  signalCount: number;
  ocrConfidence: number;
  ocrQualityLabel: string;
}) {
  const fieldText =
    result.receipt.missingFields.length === 0
      ? "Receipt evidence appears internally consistent from local OCR and structure checks."
      : `Some fields need verification: ${result.receipt.missingFields.join(", ")}.`;

  return `${fieldText} OCR confidence is ${result.ocrConfidence}% (${result.ocrQualityLabel}), with ${result.signalCount} review signal${result.signalCount === 1 ? "" : "s"} generated. External verification was not performed.`;
}

function supportActionFor(riskLevel: LocalAnalysisResult["riskLevel"], ocr: LocalAnalysisResult["ocr"]) {
  if (ocr.quality.label === "Unreadable" || ocr.quality.label === "Inconclusive") {
    return "Manual review recommended. Receipt details could not be fully verified from the current image, and a clearer proof of purchase may be needed.";
  }

  if (riskLevel === "Low") {
    return "No major local review concerns detected. Proceed with standard proof-of-purchase verification before resolving the claim.";
  }

  if (riskLevel === "Medium") {
    return "Manual review recommended. Match extracted fields against the order record before deciding next steps.";
  }

  return "Manual review required. Additional proof may be required if the order record cannot be matched.";
}

function customerSafeWordingFor(riskLevel: LocalAnalysisResult["riskLevel"], ocr: LocalAnalysisResult["ocr"]) {
  if (ocr.quality.label === "Unreadable" || ocr.quality.label === "Inconclusive") {
    return "Thanks for providing the evidence. Some receipt details could not be fully verified from the image, so we may need one clearer proof-of-purchase detail to complete the review.";
  }

  if (riskLevel === "Low") {
    return "Thanks for sending this in. We are checking the receipt against the warranty requirements and will follow up shortly.";
  }

  if (riskLevel === "Medium") {
    return "Thanks for the information. We need to complete one proof-of-purchase verification step before finishing the warranty review.";
  }

  return "Thanks for providing the evidence. We need a manual review and may ask for one additional proof-of-purchase detail before we can complete the case.";
}

function buildVerificationStatus(): LocalAnalysisResult["verificationStatus"] {
  return {
    status: "Not externally verified",
    externalVerification: "Not performed",
    method: "Local OCR, structure, and metadata analysis only",
    summary:
      "External verification was not performed. The analyzer only reviewed local OCR, receipt structure, metadata context, and image-quality signals.",
  };
}

function buildScoreMeaning(): LocalAnalysisResult["scoreMeaning"] {
  return {
    highScore:
      "High score means the receipt is readable and structurally consistent based on local evidence analysis.",
    lowOrMediumScore:
      "Low or medium score means OCR limits, missing fields, or local review signals may require manual review.",
    safetyNote:
      "High score does not prove the receipt is real. Manual review may still be required depending on policy.",
  };
}

function internalStructureConfidenceFor(receipt: LocalAnalysisResult["receipt"]) {
  if (receipt.sourceSpecificSummary) {
    return receipt.sourceSpecificSummary.confidence;
  }

  const structureChecks = [
    receipt.structure.hasMerchantPlatform,
    receipt.structure.hasOrderNumber,
    receipt.structure.hasPurchaseDate,
    receipt.structure.hasLineItems,
    receipt.structure.hasTotal,
    receipt.structure.hasPaymentMethod,
  ];
  const detectedStructure = structureChecks.filter(Boolean).length;
  const fieldReliabilityAverage =
    receipt.fieldReliability.length > 0
      ? Math.round(
          receipt.fieldReliability.reduce((total, field) => total + field.confidence, 0) /
            receipt.fieldReliability.length,
        )
      : 0;
  const structureCoverage = Math.round((detectedStructure / structureChecks.length) * 100);

  return Math.round(structureCoverage * 0.6 + fieldReliabilityAverage * 0.4);
}

function ocrFieldAdjustment(ocr: OcrExtraction) {
  const qualityAdjustment =
    ocr.quality.label === "Unreadable" ? 34 : ocr.quality.label === "Inconclusive" ? 22 : ocr.quality.label === "Usable" ? 8 : 0;
  const lowConfidenceAdjustment = ocr.quality.lowConfidenceRate >= 0.45 ? 10 : ocr.quality.lowConfidenceRate >= 0.2 ? 5 : 0;

  return qualityAdjustment + lowConfidenceAdjustment;
}

function withOcrAdjustedFieldReliability(
  receipt: ReturnType<typeof parseReceiptText>,
  ocr: OcrExtraction,
): ReturnType<typeof parseReceiptText> {
  const adjustment = ocrFieldAdjustment(ocr);
  const fieldReliability = receipt.fieldReliability.map((field): ReceiptFieldReliability => {
    if (field.status === "Not extracted") {
      return {
        ...field,
        note:
          ocr.quality.label === "Clear"
            ? field.note
            : `${field.note} OCR quality is ${ocr.quality.label}, so this may reflect evidence quality rather than missing receipt content.`,
      };
    }

    const confidence = Math.max(0, field.confidence - adjustment);
    const status: ReceiptFieldReliability["status"] = confidence >= 75 ? "Likely reliable" : "Needs review";
    const note =
      adjustment > 0
        ? `Parser extracted this field, but OCR quality is ${ocr.quality.label}; verify it against the receipt image before relying on it.`
        : field.note;

    return {
      ...field,
      confidence,
      status,
      note,
    };
  });

  return {
    ...receipt,
    fieldReliability,
  };
}

function statusFromSignals(signals: ReviewSignal[], fallback: FindingStatus = "Clear"): FindingStatus {
  if (signals.some((signal) => signal.severity === "High")) {
    return "Manual review recommended";
  }

  if (signals.some((signal) => signal.severity === "Medium")) {
    return "Review";
  }

  if (signals.some((signal) => signal.severity === "Low")) {
    return "Inconclusive";
  }

  return fallback;
}

function signalMatches(signal: ReviewSignal, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(`${signal.title} ${signal.evidenceSource}`));
}

function buildFindingGroups(result: {
  ocr: LocalAnalysisResult["ocr"];
  receipt: LocalAnalysisResult["receipt"];
  metadata: LocalAnalysisResult["metadata"];
  imageHeuristics: LocalAnalysisResult["imageHeuristics"];
  signals: ReviewSignal[];
  riskLevel: LocalAnalysisResult["riskLevel"];
  recommendedSupportAction: string;
}): FindingGroup[] {
  const ocrSignals = result.signals.filter((signal) => signalMatches(signal, [/ocr/i, /text/i]));
  const structureSignals = result.signals.filter((signal) =>
    signalMatches(signal, [/receipt fields/i, /structure/i, /order-number/i, /format/i]),
  );
  const metadataSignals = result.signals.filter((signal) => signalMatches(signal, [/metadata/i]));
  const imageSignals = result.signals.filter((signal) => signalMatches(signal, [/image/i, /compression/i, /quality/i]));
  const recommendationStatus: FindingStatus =
    result.ocr.quality.label === "Unreadable" || result.ocr.quality.label === "Inconclusive"
      ? "Manual review recommended"
      : result.riskLevel === "Low"
        ? "Clear"
        : result.riskLevel === "Medium"
          ? "Review"
          : "Manual review recommended";

  return [
    {
      category: "OCR/Text",
      status:
        result.ocr.quality.label === "Clear"
          ? statusFromSignals(ocrSignals)
          : result.ocr.quality.label === "Usable"
            ? statusFromSignals(ocrSignals, "Inconclusive")
            : "Manual review recommended",
      summary: result.ocr.quality.summary,
      details: [
        { label: "OCR quality", value: result.ocr.quality.label, status: result.ocr.quality.label === "Clear" ? "Clear" : "Inconclusive" },
        { label: "Average confidence", value: `${result.ocr.averageConfidence}%`, status: result.ocr.averageConfidence >= 70 ? "Clear" : "Inconclusive" },
        {
          label: "Low-confidence words",
          value: `${result.ocr.quality.lowConfidenceWordCount} of ${result.ocr.quality.wordCount}`,
          status: result.ocr.quality.lowConfidenceRate >= 0.2 ? "Inconclusive" : "Clear",
        },
      ],
      relatedSignalIds: ocrSignals.map((signal) => signal.id),
    },
    {
      category: "Receipt Structure",
      status: statusFromSignals(structureSignals, result.receipt.missingFields.length > 0 ? "Inconclusive" : "Clear"),
      summary:
        result.receipt.structure.notes.length > 0
          ? result.receipt.structure.notes.join(" ")
          : "Receipt structure includes the primary fields needed for local proof-of-purchase review.",
      details: [
        {
          label: "Source classification",
          value: `${result.receipt.sourceClassification.label} (${result.receipt.sourceClassification.confidence}%)`,
          status: result.receipt.sourceClassification.category === "unknown-inconclusive" ? "Inconclusive" : "Clear",
        },
        { label: "Missing fields", value: result.receipt.missingFields.join(", ") || "None", status: result.receipt.missingFields.length > 0 ? "Inconclusive" : "Clear" },
        { label: "Line item detail", value: result.receipt.structure.hasLineItems ? "Detected" : "Not detected", status: result.receipt.structure.hasLineItems ? "Clear" : "Inconclusive" },
      ],
      relatedSignalIds: structureSignals.map((signal) => signal.id),
    },
    {
      category: "Metadata",
      status: statusFromSignals(metadataSignals, result.metadata.metadataAvailable ? "Clear" : "Inconclusive"),
      summary: result.metadata.context.summary,
      details: [
        { label: "Context", value: result.metadata.context.status, status: result.metadata.metadataAvailable ? "Clear" : "Inconclusive" },
        { label: "Notes", value: result.metadata.metadataNotes.join(" | ") || "None", status: result.metadata.metadataNotes.length > 0 ? "Inconclusive" : "Clear" },
      ],
      relatedSignalIds: metadataSignals.map((signal) => signal.id),
    },
    {
      category: "Image Quality",
      status: statusFromSignals(
        imageSignals,
        result.imageHeuristics.qualityLevel === "Clear" ? "Clear" : "Inconclusive",
      ),
      summary: result.imageHeuristics.qualitySummary,
      details: [
        { label: "Quality", value: result.imageHeuristics.qualityLevel, status: result.imageHeuristics.qualityLevel === "Clear" ? "Clear" : "Inconclusive" },
        { label: "Compression", value: result.imageHeuristics.compressionLevel, status: result.imageHeuristics.compressionLevel === "Normal" ? "Clear" : "Inconclusive" },
        { label: "Formatting alignment", value: result.imageHeuristics.formattingAlignment, status: result.imageHeuristics.formattingAlignment === "Consistent" ? "Clear" : "Inconclusive" },
      ],
      relatedSignalIds: imageSignals.map((signal) => signal.id),
    },
    {
      category: "Recommendation",
      status: recommendationStatus,
      summary: result.recommendedSupportAction,
      details: [
        { label: "Risk level", value: result.riskLevel, status: recommendationStatus },
        { label: "Support action", value: result.recommendedSupportAction, status: recommendationStatus },
      ],
      relatedSignalIds: result.signals.map((signal) => signal.id),
    },
  ];
}

export async function analyzeEvidenceFile(file: File): Promise<LocalAnalysisResult> {
  const evidenceType = getEvidenceTypeFromFile(file);
  const ocr = await extractOcr(file);
  const receipt = withOcrAdjustedFieldReliability(parseReceiptText(ocr.text), ocr);
  const metadata = await inspectMetadata(file, ocr.pages, ocr.text.length > 35);
  const imageHeuristics = inspectImageHeuristics(metadata, receipt, ocr);
  const signals = buildReviewSignals(evidenceType, ocr, receipt, metadata, imageHeuristics);
  const score = scoreAnalysis(signals, ocr, receipt);
  const recommendedSupportAction = supportActionFor(score.riskLevel, ocr);
  const customerSafeWording = customerSafeWordingFor(score.riskLevel, ocr);
  const findingGroups = buildFindingGroups({
    ocr,
    receipt,
    metadata,
    imageHeuristics,
    signals,
    riskLevel: score.riskLevel,
    recommendedSupportAction,
  });

  return {
    evidenceType,
    evidenceLabel: labelFor(evidenceType),
    scoreLabel: "Evidence Reliability Score",
    ...score,
    verificationStatus: buildVerificationStatus(),
    externalVerification: "Not performed",
    internalStructureConfidence: internalStructureConfidenceFor(receipt),
    scoreMeaning: buildScoreMeaning(),
    ocr,
    receipt,
    metadata,
    imageHeuristics,
    signals,
    findingGroups,
    evidenceSummary: buildEvidenceSummary({
      receipt,
      signalCount: signals.length,
      ocrConfidence: ocr.averageConfidence,
      ocrQualityLabel: ocr.quality.label,
    }),
    recommendedSupportAction,
    customerSafeWording,
  };
}
