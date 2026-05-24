import type { MockAnalysisReport, RiskSignalGroup } from "@/lib/claim-data";
import type { LocalAnalysisResult, ReviewSignal } from "@/lib/analysis/types";

function confidenceFor(signal: ReviewSignal): "Low confidence" | "Inconclusive" | "Manual review recommended" {
  if (signal.severity === "High") {
    return "Manual review recommended";
  }

  if (signal.severity === "Medium") {
    return "Inconclusive";
  }

  return "Low confidence";
}

function categoryFor(signal: ReviewSignal): RiskSignalGroup["category"] {
  if (/metadata|field|order|purchase/i.test(signal.title)) {
    return "Missing verification data";
  }

  if (/image|compression|quality/i.test(signal.title)) {
    return "Image/photo integrity";
  }

  if (/structure|format/i.test(signal.title)) {
    return "Receipt/document formatting";
  }

  return "Receipt/document formatting";
}

function buildSignalGroups(result: LocalAnalysisResult): RiskSignalGroup[] {
  const grouped = result.signals.reduce<Record<RiskSignalGroup["category"], ReviewSignal[]>>(
    (groups, signal) => {
      groups[categoryFor(signal)].push(signal);
      return groups;
    },
    {
      "Receipt/document formatting": [],
      "Image/photo integrity": [],
      "Customer/ticket pattern": [],
      "Missing verification data": [],
    },
  );

  return Object.entries(grouped).map(([category, signals]) => ({
    category: category as RiskSignalGroup["category"],
    summary:
      signals.length > 0
        ? `${signals.length} local review signal${signals.length === 1 ? "" : "s"} generated for this area.`
        : "No material local review signal generated for this area.",
    signals:
      signals.length > 0
        ? signals.map((signal) => ({
            label: signal.title,
            detail: signal.explanation,
            confidence: confidenceFor(signal),
          }))
        : [
            {
              label: "No material signal",
              detail: "Local review did not identify a separate concern in this area.",
              confidence: "No material signal",
            },
          ],
  }));
}

function checkFromFinding(status: LocalAnalysisResult["findingGroups"][number]["status"]): "Clear" | "Review" | "Inconclusive" {
  if (status === "Clear") {
    return "Clear";
  }

  if (status === "Manual review recommended" || status === "Review") {
    return "Review";
  }

  return "Inconclusive";
}

function buildPresenceOnlyFieldSummary(result: LocalAnalysisResult) {
  const detectedFields = [
    result.receipt.merchantName || result.receipt.structure.hasMerchantPlatform ? "Merchant or platform detected" : undefined,
    result.receipt.purchaseDate || result.receipt.structure.hasPurchaseDate ? "Purchase date detected" : undefined,
    result.receipt.total || result.receipt.structure.hasTotal ? "Total detected" : undefined,
    result.receipt.orderNumber || result.receipt.structure.hasOrderNumber ? "Order number detected" : undefined,
    result.receipt.paymentMethod || result.receipt.structure.hasPaymentMethod ? "Payment method detected" : undefined,
    result.receipt.structure.hasLineItems || result.receipt.parsingDetails.lineItemCandidates.length > 0
      ? "Product detail detected"
      : undefined,
  ].filter(Boolean);

  return detectedFields.length > 0
    ? `Detected receipt field presence: ${detectedFields.join("; ")}.`
    : "Local OCR could not confidently detect core receipt field presence.";
}

export function mapLocalAnalysisToReport(result: LocalAnalysisResult): MockAnalysisReport {
  const fieldSummary = buildPresenceOnlyFieldSummary(result);

  return {
    evidenceType: result.evidenceType,
    evidenceLabel: result.evidenceLabel,
    scoreLabel: result.scoreLabel,
    score: result.score,
    riskLevel: result.riskLevel,
    confidenceLevel: result.confidenceLevel,
    reviewLabel: result.reviewLabel,
    verificationStatus: result.verificationStatus.status,
    externalVerification: result.externalVerification,
    internalStructureConfidence: result.internalStructureConfidence,
    scoreMeaning: result.scoreMeaning,
    primaryFinding:
      result.signals.length > 0
        ? "Local analysis found review signals that should be checked against purchase records."
        : "Receipt evidence appears internally consistent based on local analysis.",
    scoreExplanation: `${result.scoreBreakdown.interpretation} Formula: ${result.scoreBreakdown.formula}.`,
    summary: `${result.evidenceSummary} ${fieldSummary}`,
    suggestedAction: result.recommendedSupportAction,
    supportRecommendation: result.recommendedSupportAction,
    customerSafeWording: result.customerSafeWording,
    signalVsProof:
      "External verification was not performed. Local analysis can assess evidence quality and internal consistency only; it does not confirm authenticity, fraud, or customer intent.",
    redFlags: result.signals.slice(0, 4).map((signal) => ({
      label: signal.title,
      detail: signal.explanation,
      confidence: confidenceFor(signal),
      severity:
        signal.severity === "High"
          ? "Manual review required"
          : signal.severity === "Medium"
            ? "Review suggested"
            : "Low concern",
      confidencePercent: signal.confidence,
      evidenceSource: signal.evidenceSource,
      recommendation: signal.recommendation,
    })),
    riskSignalGroups: buildSignalGroups(result),
    whatToVerifyNext: [
      "Compare extracted receipt fields against internal order records.",
      "Verify purchase date, merchant, total, and product eligibility.",
      "Request additional proof only when the current evidence is inconclusive.",
    ],
    verificationChecks: result.findingGroups.map((group) => ({
      label: group.category,
      result: checkFromFinding(group.status),
      detail: group.summary,
    })),
  };
}
