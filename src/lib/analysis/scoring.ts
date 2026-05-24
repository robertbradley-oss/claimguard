import type {
  AnalysisConfidence,
  EvidenceType,
  RiskLevel,
} from "@/lib/claim-data";
import type {
  EvidenceMetadata,
  ExtractedReceiptInfo,
  ImageHeuristics,
  OcrExtraction,
  ReviewSignal,
  SignalSeverity,
} from "@/lib/analysis/types";

function confidenceLabel(score: number): AnalysisConfidence {
  if (score >= 80) {
    return "High confidence";
  }

  if (score >= 58) {
    return "Medium confidence";
  }

  return "Low confidence";
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 80) {
    return "Low";
  }

  if (score >= 58) {
    return "Medium";
  }

  return "High";
}

function reviewLabelFor(riskLevel: RiskLevel) {
  if (riskLevel === "Low") {
    return "Low concern";
  }

  if (riskLevel === "Medium") {
    return "Review suggested";
  }

  return "Manual review required";
}

function hasBlockingOcrQuality(ocr: OcrExtraction) {
  return (
    ocr.quality.label === "Unreadable" ||
    ocr.averageConfidence < 60 ||
    (ocr.quality.label === "Inconclusive" && (ocr.averageConfidence < 75 || ocr.quality.wordCount < 12))
  );
}

function hasSparseUnknownOcrLimit(ocr: OcrExtraction, receipt: ExtractedReceiptInfo) {
  return (
    hasBlockingOcrQuality(ocr) &&
    receipt.sourceClassification.category === "unknown-inconclusive" &&
    ocr.quality.wordCount <= 12
  );
}

function hasStrongAmazonStructureExceptPayment(receipt: ExtractedReceiptInfo) {
  const amazonSignals = receipt.structure.amazonSignals;

  return (
    receipt.source === "amazon" &&
    receipt.structure.amazonOrderFormat === "valid" &&
    Boolean(amazonSignals?.hasOrderPlacedCue) &&
    Boolean(amazonSignals?.hasItemsOrderedCue) &&
    Boolean(amazonSignals?.hasOrderTotalCue) &&
    receipt.structure.hasLineItems &&
    receipt.structure.hasTotal &&
    !amazonSignals?.hasPaymentCue
  );
}

function hasIndependentSuspiciousSignal(signals: ReviewSignal[]) {
  return signals.some((signal) => {
    const signalText = `${signal.title} ${signal.explanation} ${signal.evidenceSource}`.toLowerCase();

    return (
      signal.severity === "High" &&
      (signalText.includes("order-number") ||
        signalText.includes("potential editing") ||
        signalText.includes("potential alteration") ||
        signalText.includes("format needs verification"))
    );
  });
}

function shouldUseInconclusiveReviewStatus(ocr: OcrExtraction, signals: ReviewSignal[]) {
  return hasBlockingOcrQuality(ocr) && !hasIndependentSuspiciousSignal(signals);
}

function scoreInterpretation(score: number, ocr: OcrExtraction, receipt: ExtractedReceiptInfo) {
  if (hasBlockingOcrQuality(ocr)) {
    return "Score is constrained by OCR quality, so findings should be treated as inconclusive until a clearer receipt is reviewed.";
  }

  if (receipt.structure.amazonOrderFormat === "invalid") {
    return "Score reflects a proof-of-purchase pattern that needs manual verification against order records.";
  }

  if (receipt.sourceClassification.category === "unknown-inconclusive") {
    return "Score reflects inconclusive receipt source classification, so source-specific findings should be checked manually.";
  }

  if (score >= 80) {
    return "High score means the receipt evidence is readable and structurally consistent in local analysis; it does not prove the receipt is real.";
  }

  return "Low or medium score means local review signals or evidence-quality limits may require manual review before resolving the claim.";
}

function severityPenalty(severity: SignalSeverity) {
  return severity === "High" ? 18 : severity === "Medium" ? 10 : 5;
}

function ocrQualityPenaltyFor(ocr: OcrExtraction) {
  return ocr.quality.label === "Unreadable" ? 10 : ocr.quality.label === "Inconclusive" ? 6 : ocr.quality.label === "Usable" ? 2 : 0;
}

function addSignal(signals: ReviewSignal[], signal: Omit<ReviewSignal, "id">) {
  signals.push({
    id: `SIG-${String(signals.length + 1).padStart(2, "0")}`,
    ...signal,
  });
}

export function buildReviewSignals(
  evidenceType: EvidenceType,
  ocr: OcrExtraction,
  receipt: ExtractedReceiptInfo,
  metadata: EvidenceMetadata,
  imageHeuristics: ImageHeuristics,
): ReviewSignal[] {
  const signals: ReviewSignal[] = [];
  const evidenceSource = evidenceType === "damage-photo" ? "Product image" : "Receipt evidence";
  const blockingOcrQuality = hasBlockingOcrQuality(ocr);
  const sparseUnknownOcrLimit = hasSparseUnknownOcrLimit(ocr, receipt);
  const strongAmazonExceptPayment = hasStrongAmazonStructureExceptPayment(receipt);
  const missingFieldsForSignal = strongAmazonExceptPayment
    ? receipt.missingFields.filter((field) => field !== "payment method")
    : receipt.missingFields;

  if (blockingOcrQuality) {
    addSignal(signals, {
      title: "Receipt text is inconclusive",
      severity: "Medium",
      confidence: Math.max(20, Math.min(88, 100 - ocr.averageConfidence + ocr.quality.lowConfidenceWordCount)),
      evidenceSource,
      explanation: sparseUnknownOcrLimit
        ? `${ocr.quality.summary} Receipt details could not be fully verified from the current image. Findings are inconclusive.`
        : `${ocr.quality.summary} Findings may reflect evidence quality rather than receipt alteration.`,
      recommendation: sparseUnknownOcrLimit
        ? "Manual review recommended. A clearer proof of purchase may be needed before relying on the extracted fields."
        : "Manual review recommended before relying on the extracted fields. Request a clearer copy if key proof-of-purchase details remain unreadable.",
    });
  }

  if (missingFieldsForSignal.length > 0 && evidenceType !== "damage-photo") {
    addSignal(signals, {
      title: blockingOcrQuality ? "Receipt fields are incomplete due to OCR limits" : "Receipt fields require verification",
      severity: blockingOcrQuality ? "Medium" : missingFieldsForSignal.length >= 3 ? "High" : "Medium",
      confidence: Math.min(90, 44 + missingFieldsForSignal.length * 12),
      evidenceSource,
      explanation:
        blockingOcrQuality
          ? `Missing or unclear fields may be caused by low OCR quality: ${missingFieldsForSignal.join(", ")}.`
          : `Missing or unclear fields: ${missingFieldsForSignal.join(", ")}.`,
      recommendation: "Additional proof of purchase may be needed if the order cannot be matched internally.",
    });
  }

  if (receipt.source === "amazon" && receipt.orderNumberValid === false) {
    addSignal(signals, {
      title: "Amazon order-number format needs verification",
      severity: "High",
      confidence: 82,
      evidenceSource,
      explanation: "The extracted order number does not match the expected Amazon-style pattern for proof-of-purchase matching.",
      recommendation: "Verify the order number against the customer order record before deciding next steps.",
    });
  }

  if (
    evidenceType !== "damage-photo" &&
    receipt.sourceClassification.category === "unknown-inconclusive" &&
    !blockingOcrQuality
  ) {
    addSignal(signals, {
      title: "Receipt source classification is inconclusive",
      severity: "Low",
      confidence: Math.max(35, receipt.sourceClassification.confidence),
      evidenceSource: "Receipt structure",
      explanation: "Local OCR did not find enough known merchant or platform cues to classify the receipt source confidently.",
      recommendation: "Manual review recommended. Match available receipt details against the order record before applying source-specific expectations.",
    });
  }

  const hasAmazonCueGap =
    receipt.source === "amazon" &&
    receipt.structure.amazonSignals &&
    (!receipt.structure.amazonSignals.hasOrderPlacedCue ||
      !receipt.structure.amazonSignals.hasOrderTotalCue ||
      !receipt.structure.amazonSignals.hasPaymentCue ||
      receipt.structure.amazonOrderFormat === "missing");
  const reviewableAmazonCueGap = Boolean(hasAmazonCueGap && !strongAmazonExceptPayment);

  if (
    evidenceType !== "damage-photo" &&
    ocr.averageConfidence >= 60 &&
    ocr.quality.label !== "Inconclusive" &&
    ocr.quality.label !== "Unreadable" &&
    (!receipt.structure.hasLineItems || receipt.structure.currencyAmountCount < 2 || reviewableAmazonCueGap)
  ) {
    addSignal(signals, {
      title: receipt.source === "amazon" && reviewableAmazonCueGap ? "Amazon receipt structure needs verification" : "Receipt structure needs review",
      severity: "Medium",
      confidence: receipt.structure.hasLineItems ? 58 : 66,
      evidenceSource: "Receipt structure",
      explanation: receipt.structure.notes.length
        ? `Structure cues are limited: ${receipt.structure.notes.slice(0, 3).join(" ")}`
        : "The receipt has limited item or amount structure for local verification.",
      recommendation: "Compare visible receipt structure against the order record and request additional proof only if the purchase cannot be matched.",
    });
  }

  if (!metadata.metadataAvailable) {
    addSignal(signals, {
      title: "Source metadata context is limited",
      severity: "Low",
      confidence: 58,
      evidenceSource: metadata.mimeType.startsWith("image/") ? "Image metadata" : "Document metadata",
      explanation: metadata.context.summary,
      recommendation: "Treat metadata as weak context only. Do not use missing metadata by itself as a reason to reject a claim.",
    });
  }

  if (imageHeuristics.qualityLevel === "Limited" || imageHeuristics.qualityLevel === "Poor") {
    addSignal(signals, {
      title: "Image quality limits verification",
      severity: imageHeuristics.qualityLevel === "Poor" ? "Medium" : "Low",
      confidence: imageHeuristics.qualityLevel === "Poor" ? 72 : 54,
      evidenceSource: "Image quality",
      explanation:
        imageHeuristics.evidenceQualityIndicators.length > 0
          ? imageHeuristics.evidenceQualityIndicators.join(" ")
          : imageHeuristics.qualitySummary,
      recommendation: "Manual review recommended if key receipt or product details are unclear. Request a clearer copy before treating quality limits as review signals.",
    });
  }

  if (imageHeuristics.formattingAlignment !== "Consistent" && evidenceType !== "damage-photo") {
    addSignal(signals, {
      title: "Document consistency is inconclusive",
      severity: imageHeuristics.formattingAlignment === "Needs review" ? "Medium" : "Low",
      confidence: imageHeuristics.formattingAlignment === "Needs review" ? 68 : 46,
      evidenceSource: "Receipt formatting",
      explanation: "Local parsing could not fully confirm consistent receipt field layout.",
      recommendation: "Compare merchant, date, total, and order number with purchase records.",
    });
  }

  if (evidenceType === "damage-photo" && imageHeuristics.evidenceQualityIndicators.length > 0) {
    addSignal(signals, {
      title: "Potential image-quality indicator",
      severity: "Medium",
      confidence: 64,
      evidenceSource: "Product image",
      explanation: "The submitted photo has quality limits that may affect review confidence.",
      recommendation: "Request a wider product photo if the current image does not show enough context.",
    });
  }

  return signals.slice(0, 6);
}

export function scoreAnalysis(signals: ReviewSignal[], ocr: OcrExtraction, receipt: ExtractedReceiptInfo) {
  const coreFields = ["merchant", "order number", "purchase date", "line item or product detail", "total", "payment method"];
  const missingFieldSet = new Set(receipt.missingFields);
  const creditedFields = coreFields.filter((field) => !missingFieldSet.has(field));
  const signalPenalties = signals.map((signal) => ({
    id: signal.id,
    title: signal.title,
    severity: signal.severity,
    penalty: severityPenalty(signal.severity),
  }));
  const signalPenalty = signalPenalties.reduce((total, signal) => total + signal.penalty, 0);
  const ocrQualityPenalty = ocrQualityPenaltyFor(ocr);
  const ocrConfidencePenalty = ocr.averageConfidence > 0 ? Math.max(0, Math.round((78 - ocr.averageConfidence) / 2)) : 18;
  const ocrPenalty = ocrConfidencePenalty + ocrQualityPenalty;
  const fieldBonus = Math.max(0, 10 - receipt.missingFields.length * 2);
  const startingScore = 96;
  const rawScore = startingScore - signalPenalty - ocrPenalty + fieldBonus;
  const score = Math.max(18, Math.min(98, rawScore));
  const inconclusiveReviewStatus = shouldUseInconclusiveReviewStatus(ocr, signals);
  const riskLevel = inconclusiveReviewStatus ? "Medium" : riskFromScore(score);

  return {
    score,
    riskLevel,
    confidenceLevel: confidenceLabel(score),
    reviewLabel: inconclusiveReviewStatus ? "Unable to assess from current image" : reviewLabelFor(riskLevel),
    scoreBreakdown: {
      startingScore,
      signalPenalty,
      ocrPenalty,
      fieldBonus,
      rawScore,
      finalScore: score,
      formula: `${startingScore} - ${signalPenalty} signal penalty - ${ocrPenalty} OCR penalty + ${fieldBonus} parsed-field bonus = ${rawScore}`,
      interpretation: scoreInterpretation(score, ocr, receipt),
      riskBands: {
        low: "80-98",
        medium: "58-79, or unreadable evidence without independent suspicious indicators",
        high: "18-57 with independent suspicious indicators",
      },
      ocrPenaltyDetails: {
        averageConfidence: ocr.averageConfidence,
        confidencePenalty: ocrConfidencePenalty,
        qualityLabel: ocr.quality.label,
        qualityPenalty: ocrQualityPenalty,
        lowConfidenceRate: ocr.quality.lowConfidenceRate,
      },
      fieldBonusDetails: {
        maxBonus: 10,
        deductionPerMissingField: 2,
        missingFieldCount: receipt.missingFields.length,
        creditedFields,
        missingFields: receipt.missingFields,
      },
      signalPenalties,
    },
  };
}
