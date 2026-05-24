"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  FileText,
  ImageIcon,
  Info,
  Loader2,
  Play,
  RotateCcw,
  ShieldAlert,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { AnalysisReport } from "@/components/AnalysisReport";
import { analyzeEvidenceFile } from "@/lib/analysis/analyzer";
import { mapLocalAnalysisToReport } from "@/lib/analysis/report-adapter";
import type { FindingStatus, LocalAnalysisResult } from "@/lib/analysis/types";
import { formatFileSize } from "@/lib/file-format";
import {
  loadSampleEvidenceFixture,
  sampleEvidenceFixtures,
  type FixtureExpectationResult,
  type LoadedEvidenceFixture,
  type SampleEvidenceFixture,
  type SampleEvidenceFixtureId,
} from "@/lib/test-evidence/fixtures";
import { analyzerTuningSummary } from "@/lib/test-evidence/tuning-thresholds";

type HarnessRun = {
  fixture: SampleEvidenceFixture;
  file: File;
  previewUrl?: string;
  status: "idle" | "running" | "complete" | "error";
  result?: LocalAnalysisResult;
  expectations?: FixtureExpectationResult[];
  error?: string;
};

type RealQaNotes = {
  expectedRisk: "" | "Low" | "Medium" | "High";
  ocrAccuracy: "" | "Accurate" | "Partially accurate" | "Inaccurate";
  parsedFields: "" | "Correct" | "Partially correct" | "Incorrect";
  scoreFit: "" | "Too harsh" | "Too lenient" | "About right";
  thresholdAdjustment: string;
};

type RealReceiptRun = {
  id: string;
  file: File;
  previewUrl?: string;
  addedAtIso: string;
  notes: RealQaNotes;
  status: "idle" | "running" | "complete" | "error";
  result?: LocalAnalysisResult;
  error?: string;
};

type PrivacyChecklist = {
  sourceRedacted: boolean;
  ocrReviewed: boolean;
  jsonReviewed: boolean;
};

const acceptedEvidenceTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

const emptyRealQaNotes: RealQaNotes = {
  expectedRisk: "",
  ocrAccuracy: "",
  parsedFields: "",
  scoreFit: "",
  thresholdAdjustment: "",
};

const emptyPrivacyChecklist: PrivacyChecklist = {
  sourceRedacted: false,
  ocrReviewed: false,
  jsonReviewed: false,
};

function isAcceptedEvidenceFile(file: File) {
  return acceptedEvidenceTypes.includes(file.type) || /\.(png|jpe?g|webp|pdf)$/i.test(file.name);
}

function statusClass(run?: HarnessRun) {
  if (!run || run.status === "idle") {
    return "border-white/10 bg-white/[0.035] text-[var(--cg-text-muted)]";
  }

  if (run.status === "running") {
    return "border-[rgba(53,217,255,0.45)] bg-[rgba(53,217,255,0.1)] text-cyan-100";
  }

  if (run.status === "error" || run.expectations?.some((expectation) => expectation.status === "Needs Tuning")) {
    return "border-[rgba(251,113,133,0.5)] bg-[rgba(251,113,133,0.12)] text-rose-100";
  }

  if (run.expectations?.some((expectation) => expectation.status === "Warning")) {
    return "border-[rgba(251,191,36,0.5)] bg-[rgba(251,191,36,0.12)] text-amber-100";
  }

  return "border-[rgba(74,222,128,0.42)] bg-[rgba(74,222,128,0.1)] text-emerald-100";
}

function qaStatusClass(status: FixtureExpectationResult["status"]) {
  if (status === "Pass") {
    return "border-[rgba(74,222,128,0.34)] bg-[rgba(74,222,128,0.08)] text-emerald-100";
  }

  if (status === "Warning") {
    return "border-[rgba(251,191,36,0.42)] bg-[rgba(251,191,36,0.1)] text-amber-100";
  }

  return "border-[rgba(251,113,133,0.42)] bg-[rgba(251,113,133,0.1)] text-rose-100";
}

function qaStatusIcon(status: FixtureExpectationResult["status"]) {
  if (status === "Pass") {
    return CheckCircle2;
  }

  if (status === "Warning") {
    return AlertTriangle;
  }

  return XCircle;
}

function findingStatusClass(status: FindingStatus) {
  if (status === "Clear") {
    return "border-[rgba(74,222,128,0.34)] bg-[rgba(74,222,128,0.08)] text-emerald-100";
  }

  if (status === "Inconclusive") {
    return "border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.08)] text-amber-100";
  }

  if (status === "Review") {
    return "border-[rgba(53,217,255,0.35)] bg-[rgba(53,217,255,0.08)] text-cyan-100";
  }

  return "border-[rgba(251,113,133,0.42)] bg-[rgba(251,113,133,0.1)] text-rose-100";
}

function FieldRow({ label, value }: { label: string; value?: string | number | boolean }) {
  return (
    <div className="grid grid-cols-[138px_minmax(0,1fr)] gap-3 border-b border-white/8 py-2 last:border-b-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">{label}</dt>
      <dd className="min-w-0 break-words font-mono text-sm text-white">{value === undefined || value === "" ? "Not extracted" : String(value)}</dd>
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-72 overflow-auto rounded-lg border border-white/10 bg-[#020713]/80 p-3 text-xs leading-5 text-[var(--cg-text-soft)]">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

async function copyTextToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

const streetAddressPattern =
  /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){1,6}(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|way|boulevard|blvd\.?|court|ct\.?|circle|cir\.?)(?=\s|,|\.|$)/gi;

function redactSensitiveText(value: string) {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g, "[REDACTED_PHONE]")
    .replace(/\b\d{3}-\d{7}-\d{7}\b/g, "[REDACTED_ORDER_ID]")
    .replace(/\b\d{12,}\b/g, "[REDACTED_ORDER_ID]")
    .replace(/\b(?:ending(?:\s+in)?|x{2,}|\*{2,})\s*\d{4}\b/gi, "ending in [REDACTED_LAST4]")
    .replace(streetAddressPattern, "[REDACTED_ADDRESS]")
    .replace(/\b(?:ship to|shipping address|billing address|bill to|billed to|recipient)\s*:?\s+[^\n|]+/gi, (match) => {
      const label = match.split(/:|\s{2,}/)[0] || "Private field";
      return `${label.trim()} [REDACTED_PRIVATE_CONTEXT]`;
    });
}

function redactSensitiveValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactSensitiveText(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactSensitiveValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, redactSensitiveValue(entry)]));
  }

  return value;
}

function sensitiveFindingCount(result?: LocalAnalysisResult) {
  if (!result) {
    return 0;
  }

  const copiedText = JSON.stringify(result);
  const patterns = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g,
    /\b\d{3}-\d{7}-\d{7}\b/g,
    /\b\d{12,}\b/g,
    /\b(?:ending(?:\s+in)?|x{2,}|\*{2,})\s*\d{4}\b/gi,
    streetAddressPattern,
  ];

  return patterns.reduce((count, pattern) => count + (copiedText.match(pattern)?.length ?? 0), 0);
}

function scoreRuleSummary(result: LocalAnalysisResult) {
  const breakdown = result.scoreBreakdown;
  const rows = [
    {
      label: "Review signal penalties",
      value: `-${breakdown.signalPenalty}`,
      detail: breakdown.signalPenalties.length
        ? breakdown.signalPenalties.map((signal) => `${signal.title} (-${signal.penalty})`).join(" | ")
        : "No review-signal penalties",
    },
    {
      label: "OCR confidence penalty",
      value: `-${breakdown.ocrPenaltyDetails.confidencePenalty}`,
      detail: `${breakdown.ocrPenaltyDetails.averageConfidence}% average OCR confidence`,
    },
    {
      label: "OCR quality penalty",
      value: `-${breakdown.ocrPenaltyDetails.qualityPenalty}`,
      detail: `${breakdown.ocrPenaltyDetails.qualityLabel} quality, ${Math.round(breakdown.ocrPenaltyDetails.lowConfidenceRate * 100)}% low-confidence rate`,
    },
    {
      label: "Parsed-field bonus",
      value: `+${breakdown.fieldBonus}`,
      detail: `${breakdown.fieldBonusDetails.creditedFields.join(", ") || "No credited fields"}; missing ${
        breakdown.fieldBonusDetails.missingFields.join(", ") || "none"
      }`,
    },
  ];

  return rows;
}

function receiptClassFor(result: LocalAnalysisResult) {
  return result.receipt.sourceClassification.label;
}

function fileCategoryFor(file: File, result?: LocalAnalysisResult) {
  if (result?.evidenceType) {
    return result.evidenceType;
  }

  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
    return "receipt-pdf";
  }

  if (file.type.startsWith("image/")) {
    return "receipt-image";
  }

  return "unknown-evidence";
}

function parsedFieldPresenceSummary(result: LocalAnalysisResult) {
  return {
    merchantDetected: result.receipt.structure.hasMerchantPlatform,
    orderNumberDetected: result.receipt.structure.hasOrderNumber,
    orderNumberFormat: result.receipt.structure.amazonOrderFormat,
    purchaseDateDetected: result.receipt.structure.hasPurchaseDate,
    productDetailDetected: result.receipt.structure.hasLineItems,
    totalDetected: result.receipt.structure.hasTotal,
    paymentDetected: result.receipt.structure.hasPaymentMethod,
    subtotalDetected: result.receipt.structure.hasSubtotal,
    taxDetected: result.receipt.structure.hasTax,
    shippingOrDeliveryDetected: result.receipt.structure.hasShippingIndicator,
    amountCount: result.receipt.structure.currencyAmountCount,
    missingFields: result.receipt.missingFields,
    acceptedItemCandidateCount: result.receipt.parsingDetails.lineItemCandidates.length,
    rejectedItemCandidateCount: result.receipt.parsingDetails.rejectedLineItemCandidates.length,
    contextRowCount: result.receipt.parsingDetails.contextCandidates.length,
  };
}

function sourceSpecificSummaryFor(result: LocalAnalysisResult) {
  const summary = result.receipt.sourceSpecificSummary;

  if (!summary) {
    return undefined;
  }

  return {
    category: summary.category,
    label: summary.label,
    confidence: summary.confidence,
    fieldsPresent: summary.fieldsPresent,
    fieldsExpected: summary.fieldsExpected,
    productTableRowCount: summary.productTableRowCount ?? 0,
    fields: summary.fields.map((field) => ({
      key: field.key,
      label: field.label,
      present: field.present,
      count: field.count,
      note: field.note,
    })),
    notes: summary.notes,
  };
}

function manualQaSummaryFor(notes: RealQaNotes) {
  return {
    expectedRisk: notes.expectedRisk || "Not noted",
    ocrAccuracy: notes.ocrAccuracy || "Not noted",
    parsedFields: notes.parsedFields || "Not noted",
    scoreFit: notes.scoreFit || "Not noted",
  };
}

function tuningObservationFor(run: RealReceiptRun, index: number) {
  if (!run.result) {
    return undefined;
  }

  const result = run.result;
  const observation = {
    exportType: "privacy-safe-tuning-observation",
    privacyPosture:
      "Preferred sharing format. Excludes raw OCR text, original file name, parsed private values, full order IDs, payment last-four values, names, addresses, emails, phone numbers, and tracking numbers by default.",
    sessionItem: index + 1,
    file: {
      category: fileCategoryFor(run.file, result),
      mimeType: run.file.type || "unknown",
    },
    receiptClass: receiptClassFor(result),
    receiptSource: {
      category: result.receipt.sourceClassification.category,
      confidence: result.receipt.sourceClassification.confidence,
      cues: result.receipt.sourceClassification.cues,
      legacyScoringSource: result.receipt.source,
    },
    manualQa: {
      ...manualQaSummaryFor(run.notes),
      reviewerNotes: run.notes.thresholdAdjustment || "Not noted",
    },
    analyzerResult: {
      actualRisk: result.riskLevel,
      evidenceReliabilityScore: result.score,
      scoreLabel: result.scoreLabel,
      verificationStatus: result.verificationStatus.status,
      externalVerification: result.externalVerification,
      internalStructureConfidence: result.internalStructureConfidence,
      scoreMeaning: result.scoreMeaning,
      confidenceLevel: result.confidenceLevel,
      reviewLabel: result.reviewLabel,
      ocr: {
        qualityLabel: result.ocr.quality.label,
        averageConfidence: result.ocr.averageConfidence,
        wordCount: result.ocr.quality.wordCount,
        lowConfidenceRatePercent: Math.round(result.ocr.quality.lowConfidenceRate * 100),
      },
      parsedFieldPresence: parsedFieldPresenceSummary(result),
      sourceSpecificSummary: sourceSpecificSummaryFor(result),
      scoreBreakdown: {
        formula: result.scoreBreakdown.formula,
        interpretation: result.scoreBreakdown.interpretation,
        categories: scoreRuleSummary(result),
      },
      reviewSignals: result.signals.map((signal) => ({
        title: signal.title,
        category: signal.evidenceSource,
        severity: signal.severity,
        confidence: signal.confidence,
      })),
      recommendationSummary: {
        supportAction: result.recommendedSupportAction,
        customerSafeWording: result.customerSafeWording,
        evidenceSummary: result.evidenceSummary,
      },
    },
    tuningQuestions: {
      scoreFit: run.notes.scoreFit || "Not noted",
      needsThresholdReview: run.notes.scoreFit === "Too harsh" || run.notes.scoreFit === "Too lenient",
      suggestedReviewFocus:
        run.notes.scoreFit === "Too harsh"
          ? "Review whether OCR, missing-field, or signal penalties are too strong for this receipt type."
          : run.notes.scoreFit === "Too lenient"
            ? "Review whether missing structure, OCR limits, or review signals should carry more weight for this receipt type."
            : "Use score breakdown and reviewer notes to decide whether current thresholds feel right.",
    },
  };

  return redactSensitiveValue(observation);
}

function redactedDiagnosticFor(run: RealReceiptRun, index: number) {
  if (!run.result) {
    return undefined;
  }

  const result = run.result;

  const diagnostic = {
    exportType: "privacy-safe-redacted-diagnostic",
    privacyPosture:
      "Diagnostic export with raw private-bearing structures omitted. Prefer Copy tuning observation or Copy session tuning summary for sharing.",
    source: "temporary-real-receipt-qa",
    privacyMode: "redacted-structural",
    sessionItem: index + 1,
    rawFieldsOmitted: [
      "file.name",
      "metadata.fileName",
      "metadata.lastModifiedIso",
      "metadata.exif",
      "ocr.text",
      "ocr.lowConfidenceRegions.text",
      "ocr.uncertaintyNotes.samples",
      "receipt.rawText",
      "receipt.merchantName",
      "receipt.orderNumber",
      "receipt.purchaseDate",
      "receipt.total",
      "receipt.paymentMethod",
      "receipt.parsingDetails line/payment/context candidate text values",
      "receipt.fieldReliability.value",
      "finalReport raw narrative fields",
    ],
    file: {
      category: fileCategoryFor(run.file, result),
      mimeType: run.file.type || "unknown",
    },
    privacyReview: {
      checklist: run.status === "complete" ? "Redacted diagnostic shape used" : "Analysis incomplete",
      detectedSensitivePatternCount: sensitiveFindingCount(result),
    },
    manualQa: {
      ...manualQaSummaryFor(run.notes),
      reviewerNotePresent: Boolean(run.notes.thresholdAdjustment.trim()),
    },
    analyzerResult: {
      evidenceType: result.evidenceType,
      evidenceLabel: result.evidenceLabel,
      actualRisk: result.riskLevel,
      evidenceReliabilityScore: result.score,
      scoreLabel: result.scoreLabel,
      verificationStatus: result.verificationStatus.status,
      externalVerification: result.externalVerification,
      internalStructureConfidence: result.internalStructureConfidence,
      scoreMeaning: result.scoreMeaning,
      confidenceLevel: result.confidenceLevel,
      reviewLabel: result.reviewLabel,
      ocr: {
        engine: result.ocr.engine,
        pages: result.ocr.pages,
        qualityLabel: result.ocr.quality.label,
        averageConfidence: result.ocr.averageConfidence,
        wordCount: result.ocr.quality.wordCount,
        lowConfidenceWordCount: result.ocr.quality.lowConfidenceWordCount,
        lowConfidenceRatePercent: Math.round(result.ocr.quality.lowConfidenceRate * 100),
        uncertaintyNoteSummary: result.ocr.uncertaintyNotes.map((note) => ({
          label: note.label,
          severity: note.severity,
          sampleCount: note.samples.length,
        })),
      },
      receipt: {
        class: receiptClassFor(result),
        source: {
          category: result.receipt.sourceClassification.category,
          confidence: result.receipt.sourceClassification.confidence,
          cues: result.receipt.sourceClassification.cues,
          legacyScoringSource: result.receipt.source,
        },
        parsedFieldPresence: parsedFieldPresenceSummary(result),
        sourceSpecificSummary: sourceSpecificSummaryFor(result),
        fieldReliability: result.receipt.fieldReliability.map((field) => ({
          field: field.field,
          confidence: field.confidence,
          status: field.status,
        })),
        structure: {
          hasMerchantPlatform: result.receipt.structure.hasMerchantPlatform,
          hasOrderNumber: result.receipt.structure.hasOrderNumber,
          hasPurchaseDate: result.receipt.structure.hasPurchaseDate,
          hasTotal: result.receipt.structure.hasTotal,
          hasPaymentMethod: result.receipt.structure.hasPaymentMethod,
          hasLineItems: result.receipt.structure.hasLineItems,
          hasSubtotal: result.receipt.structure.hasSubtotal,
          hasTax: result.receipt.structure.hasTax,
          hasShippingIndicator: result.receipt.structure.hasShippingIndicator,
          currencyAmountCount: result.receipt.structure.currencyAmountCount,
          amazonOrderFormat: result.receipt.structure.amazonOrderFormat,
          amazonSignals: result.receipt.structure.amazonSignals
            ? {
                hasOrderPlacedCue: result.receipt.structure.amazonSignals.hasOrderPlacedCue,
                hasItemsOrderedCue: result.receipt.structure.amazonSignals.hasItemsOrderedCue,
                hasOrderSummaryCue: result.receipt.structure.amazonSignals.hasOrderSummaryCue,
                hasOrderTotalCue: result.receipt.structure.amazonSignals.hasOrderTotalCue,
                hasShipToOrDeliveryCue: result.receipt.structure.amazonSignals.hasShipToOrDeliveryCue,
                hasArrivalOrShipmentCue: result.receipt.structure.amazonSignals.hasArrivalOrShipmentCue,
                hasPaymentCue: result.receipt.structure.amazonSignals.hasPaymentCue,
                hasMultiShipmentCue: result.receipt.structure.amazonSignals.hasMultiShipmentCue,
                hasInvoiceCue: result.receipt.structure.amazonSignals.hasInvoiceCue,
                hasSoldByCue: result.receipt.structure.amazonSignals.hasSoldByCue,
                hasBillingCue: result.receipt.structure.amazonSignals.hasBillingCue,
                hasPromotionCue: result.receipt.structure.amazonSignals.hasPromotionCue,
                hasOrderNumberIssue: Boolean(result.receipt.structure.amazonSignals.orderNumberIssue),
              }
            : undefined,
        },
      },
      metadata: {
        mimeType: result.metadata.mimeType,
        metadataAvailable: result.metadata.metadataAvailable,
        metadataNoteCount: result.metadata.metadataNotes.length,
        contextStatus: result.metadata.context.status,
        image: result.metadata.image
          ? {
              width: result.metadata.image.width,
              height: result.metadata.image.height,
              megapixels: result.metadata.image.megapixels,
            }
          : undefined,
        pdf: result.metadata.pdf,
      },
      imageQuality: {
        qualityLevel: result.imageHeuristics.qualityLevel,
        compressionLevel: result.imageHeuristics.compressionLevel,
        formattingAlignment: result.imageHeuristics.formattingAlignment,
        evidenceQualityIndicatorCount: result.imageHeuristics.evidenceQualityIndicators.length,
        sourceContextIndicatorCount: result.imageHeuristics.sourceContextIndicators.length,
        potentialEditingIndicatorCount: result.imageHeuristics.potentialEditingIndicators.length,
      },
      scoreBreakdown: {
        formula: result.scoreBreakdown.formula,
        interpretation: result.scoreBreakdown.interpretation,
        categories: scoreRuleSummary(result),
        riskBands: result.scoreBreakdown.riskBands,
        signalPenalties: result.scoreBreakdown.signalPenalties.map((penalty) => ({
          title: penalty.title,
          severity: penalty.severity,
          penalty: penalty.penalty,
        })),
      },
      reviewSignals: result.signals.map((signal) => ({
        title: signal.title,
        category: signal.evidenceSource,
        severity: signal.severity,
        confidence: signal.confidence,
      })),
      findingGroups: result.findingGroups.map((group) => ({
        category: group.category,
        status: group.status,
        detailLabels: group.details.map((detail) => detail.label),
        relatedSignalIds: group.relatedSignalIds,
      })),
      recommendationSummary: {
        supportAction: result.recommendedSupportAction,
        customerSafeWording: result.customerSafeWording,
        evidenceSummary: result.evidenceSummary,
      },
    },
  };

  return redactSensitiveValue(diagnostic);
}

function sessionTuningSummaryFor(runs: RealReceiptRun[]) {
  const completedRuns = runs.filter((run) => Boolean(run.result));

  return {
    exportType: "privacy-safe-session-tuning-summary",
    privacyPosture:
      "Preferred sharing format for multi-receipt QA. Excludes raw OCR text, original file names, and parsed private values by default.",
    generatedAtIso: new Date().toISOString(),
    runCount: runs.length,
    completedRunCount: completedRuns.length,
    observations: completedRuns
      .map((run, index) => tuningObservationFor(run, index))
      .filter((observation): observation is NonNullable<ReturnType<typeof tuningObservationFor>> => Boolean(observation)),
  };
}

function ThresholdSummary() {
  return (
    <section className="cg-command-panel rounded-xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cg-cyan)]">Threshold summary</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Current analyzer tuning reference</h2>
        </div>
        <span className="rounded-full border border-[rgba(251,191,36,0.45)] bg-[rgba(251,191,36,0.1)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
          Manual QA only
        </span>
      </div>
      <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {Object.entries(analyzerTuningSummary).map(([group, items]) => (
          <div className="min-w-0 rounded-lg border border-white/10 bg-[#020713]/45 p-3" key={group}>
            <h3 className="text-sm font-semibold capitalize text-white">{group.replace(/([A-Z])/g, " $1")}</h3>
            <div className="mt-3 grid gap-2">
              {items.map((item) => (
                <div className="min-w-0 rounded-md border border-white/8 bg-white/[0.03] p-2" key={`${group}-${item.label}`}>
                  <p className="break-words text-xs font-semibold text-[var(--cg-text-soft)]">{item.label}</p>
                  <p className="mt-1 break-words font-mono text-xs text-white">{item.value}</p>
                  <p className="mt-1 break-words text-xs leading-5 text-[var(--cg-text-muted)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FixturePreview({ run }: { run: HarnessRun }) {
  if (run.previewUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={`${run.fixture.label} fixture preview`}
        className="h-full max-h-80 w-full rounded-lg border border-white/10 bg-white object-contain"
        src={run.previewUrl}
      />
    );
  }

  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-white/10 bg-[#020713]/80 text-center">
      <div>
        <FileText className="mx-auto size-12 text-[var(--cg-cyan)]" aria-hidden="true" />
        <p className="mt-3 font-semibold text-white">{run.file.name}</p>
        <p className="mt-1 text-sm text-[var(--cg-text-muted)]">{formatFileSize(run.file.size)} PDF fixture</p>
      </div>
    </div>
  );
}

function EvidencePreview({ file, previewUrl }: { file: File; previewUrl?: string }) {
  if (previewUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={`${file.name} preview`}
        className="h-full max-h-80 w-full rounded-lg border border-white/10 bg-white object-contain"
        src={previewUrl}
      />
    );
  }

  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-white/10 bg-[#020713]/80 text-center">
      <div>
        <FileText className="mx-auto size-12 text-[var(--cg-cyan)]" aria-hidden="true" />
        <p className="mt-3 font-semibold text-white">{file.name}</p>
        <p className="mt-1 text-sm text-[var(--cg-text-muted)]">{formatFileSize(file.size)} PDF/document</p>
      </div>
    </div>
  );
}

function ScoreBreakdown({ result }: { result: LocalAnalysisResult }) {
  const breakdown = result.scoreBreakdown;

  return (
    <div className="grid gap-3">
      <dl>
        <FieldRow label="Score label" value={result.scoreLabel} />
        <FieldRow label="Verification status" value={result.verificationStatus.status} />
        <FieldRow label="External verification" value={result.externalVerification} />
        <FieldRow label="Internal structure confidence" value={`${result.internalStructureConfidence}%`} />
        <FieldRow label="Formula" value={breakdown.formula} />
        <FieldRow label="Interpretation" value={breakdown.interpretation} />
        <FieldRow label="High-score meaning" value={result.scoreMeaning.highScore} />
        <FieldRow label="Safety note" value={result.scoreMeaning.safetyNote} />
        <FieldRow label="Risk bands" value={`Low ${breakdown.riskBands.low} / Medium ${breakdown.riskBands.medium} / High ${breakdown.riskBands.high}`} />
      </dl>
      <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <FieldRow label="Starting score" value={breakdown.startingScore} />
        <FieldRow label="Signal penalty" value={`-${breakdown.signalPenalty}`} />
        <FieldRow label="OCR penalty" value={`-${breakdown.ocrPenalty}`} />
        <FieldRow label="Field bonus" value={`+${breakdown.fieldBonus}`} />
        <FieldRow label="Raw score" value={breakdown.rawScore} />
        <FieldRow label="Final reliability score" value={breakdown.finalScore} />
      </dl>
      <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <FieldRow label="OCR confidence penalty" value={`-${breakdown.ocrPenaltyDetails.confidencePenalty}`} />
        <FieldRow label="OCR quality penalty" value={`-${breakdown.ocrPenaltyDetails.qualityPenalty} (${breakdown.ocrPenaltyDetails.qualityLabel})`} />
        <FieldRow label="Low-conf rate" value={`${Math.round(breakdown.ocrPenaltyDetails.lowConfidenceRate * 100)}%`} />
        <FieldRow label="Missing fields" value={breakdown.fieldBonusDetails.missingFieldCount} />
        <FieldRow label="Credited fields" value={breakdown.fieldBonusDetails.creditedFields.join(", ") || "None"} />
        <FieldRow label="Field bonus rule" value={`${breakdown.fieldBonusDetails.maxBonus} max, -${breakdown.fieldBonusDetails.deductionPerMissingField} per missing field`} />
      </dl>
      <div className="grid gap-2">
        <h3 className="text-sm font-semibold text-white">Rule/category impact</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {scoreRuleSummary(result).map((row) => (
            <div className="rounded-lg border border-white/10 bg-[#020713]/45 p-3" key={row.label}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{row.label}</p>
                <span className="font-mono text-xs text-[var(--cg-text-soft)]">{row.value}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{row.detail}</p>
            </div>
          ))}
        </div>
      </div>
      <JsonBlock value={breakdown.signalPenalties} />
    </div>
  );
}

const phaseOneReviewModules = [
  {
    name: "Receipt Analyzer",
    status: "Ran",
    support: "OCR extraction, parser field presence, and receipt text quality review.",
  },
  {
    name: "Document Inspector",
    status: "Ran",
    support: "Receipt structure, proof-of-purchase cues, and source-specific layout checks.",
  },
  {
    name: "Metadata Analyst",
    status: "Ran",
    support: "Available file, PDF, EXIF, and technical context signals.",
  },
  {
    name: "Risk Scorer",
    status: "Ran",
    support: "Evidence Reliability Score inputs, risk level, confidence, and score breakdown.",
  },
  {
    name: "Evidence Summarizer",
    status: "Ran",
    support: "Privacy-safe summary fields and support-safe finding language.",
  },
  {
    name: "Response Advisor",
    status: "Ran",
    support: "Customer-safe wording review without confirming fraud or receipt authenticity.",
  },
];

const futureReviewModules = ["Image Analyzer", "Duplicate Detector", "Behavior Analyst", "Compliance Guard"];

function ReviewModulesPanel() {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#020713]/45">
      <div className="border-b border-white/10 bg-[#020713]/32 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cg-cyan)]">Review modules</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Receipt evidence check pipeline</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cg-dark-muted)]">
              Signal contributors show which local review modules ran and what evidence checks they support. They help manual review and do not independently prove a receipt outcome.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-[rgba(251,191,36,0.38)] bg-[rgba(251,191,36,0.1)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
            Supports manual review
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {phaseOneReviewModules.map((module) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={module.name}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">{module.name}</h3>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--cg-dark-subtle)]">
                {module.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-5 text-[var(--cg-dark-muted)]">{module.support}</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-dark-subtle)]">Evidence checks / signal support</p>
          </article>
        ))}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs leading-5 text-[var(--cg-dark-subtle)]">
            Future lanes are noted for roadmap visibility only and are not part of the current receipt-only decision flow.
          </p>
          <div className="flex flex-wrap gap-2">
            {futureReviewModules.map((moduleName) => (
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs text-[var(--cg-dark-muted)]" key={moduleName}>
                {moduleName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalysisDetailPanels({ result }: { result: LocalAnalysisResult }) {
  return (
    <section className="grid gap-4">
      <div className="cg-command-panel rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Verification and score semantics</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <FieldRow label="Evidence Reliability Score" value={result.score} />
          <FieldRow label="Verification Status" value={result.verificationStatus.status} />
          <FieldRow label="Internal Structure Confidence" value={`${result.internalStructureConfidence}%`} />
          <FieldRow label="External Verification" value={result.externalVerification} />
        </dl>
        <div className="mt-3 rounded-lg border border-[rgba(53,217,255,0.3)] bg-[rgba(53,217,255,0.07)] p-3 text-sm leading-6 text-cyan-100">
          {result.scoreMeaning.highScore} {result.scoreMeaning.safetyNote} {result.scoreMeaning.lowOrMediumScore}
        </div>
      </div>

      <div className="cg-command-panel rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Grouped findings</h2>
        <div className="mt-3 grid gap-3 xl:grid-cols-5">
          {result.findingGroups.map((group) => (
            <div className={`rounded-lg border p-3 ${findingStatusClass(group.status)}`} key={group.category}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{group.category}</h3>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold uppercase tracking-wide">
                  {group.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{group.summary}</p>
              <dl className="mt-3 grid gap-1">
                {group.details.slice(0, 3).map((detail) => (
                  <div className="grid gap-1 border-t border-white/10 pt-2" key={`${group.category}-${detail.label}`}>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">{detail.label}</dt>
                    <dd className="break-words text-xs text-white">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>

      <div className="cg-command-panel rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">OCR text</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <FieldRow label="Quality" value={result.ocr.quality.label} />
          <FieldRow label="Confidence" value={`${result.ocr.averageConfidence}%`} />
          <FieldRow label="Words" value={result.ocr.quality.wordCount} />
          <FieldRow label="Low-conf rate" value={`${Math.round(result.ocr.quality.lowConfidenceRate * 100)}%`} />
        </dl>
        <p className="mt-3 rounded-lg border border-white/10 bg-[#020713]/55 p-3 text-sm leading-6 text-[var(--cg-text-muted)]">
          {result.ocr.quality.summary}
        </p>
        <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-white/10 bg-[#020713]/80 p-3 text-sm leading-6 text-[var(--cg-text-soft)]">
          {result.ocr.text || "No OCR text extracted."}
        </pre>
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-white">OCR uncertainty notes</h3>
          {result.ocr.uncertaintyNotes.length > 0 ? (
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {result.ocr.uncertaintyNotes.map((note) => (
                <div className="rounded-lg border border-white/10 bg-[#020713]/45 p-3" key={note.label}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{note.label}</p>
                    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--cg-text-soft)]">
                      {note.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{note.note}</p>
                  {note.samples.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {note.samples.map((sample, index) => (
                        <span
                          className="rounded-md border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.07)] px-2 py-1 font-mono text-xs text-amber-100"
                          key={`${note.label}-${sample.text}-${sample.confidence}-${index}`}
                        >
                          {sample.text || "Unreadable"} ({sample.confidence}%)
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--cg-text-muted)]">No OCR uncertainty notes reported.</p>
          )}
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-white">Low-confidence word samples</h3>
          {result.ocr.lowConfidenceRegions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {result.ocr.lowConfidenceRegions.map((region, index) => (
                <span
                  className="rounded-md border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.08)] px-2 py-1 font-mono text-xs text-amber-100"
                  key={`${region.text}-${region.confidence}-${index}`}
                >
                  {region.text || "Unreadable"} ({region.confidence}%)
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--cg-text-muted)]">No low-confidence word samples reported.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cg-command-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Parsed fields</h2>
          <dl className="mt-3">
            <FieldRow label="Merchant" value={result.receipt.merchantName} />
            <FieldRow label="Source class" value={result.receipt.sourceClassification.label} />
            <FieldRow label="Source confidence" value={`${result.receipt.sourceClassification.confidence}%`} />
            <FieldRow label="Source cues" value={result.receipt.sourceClassification.cues.join(" | ") || "None"} />
            <FieldRow label="Order" value={result.receipt.orderNumber} />
            <FieldRow label="Order valid" value={result.receipt.orderNumberValid} />
            <FieldRow label="Date" value={result.receipt.purchaseDate} />
            <FieldRow label="Date source" value={result.receipt.parsingDetails.purchaseDateSource} />
            <FieldRow label="Total" value={result.receipt.total} />
            <FieldRow label="Total source" value={result.receipt.parsingDetails.selectedTotalSource} />
            <FieldRow label="Payment" value={result.receipt.paymentMethod} />
            <FieldRow label="Payment source" value={result.receipt.parsingDetails.paymentSource} />
            <FieldRow
              label="Payment candidates"
              value={
                result.receipt.parsingDetails.paymentCandidates
                  .slice(0, 4)
                  .map((candidate) => `${candidate.kind} ${candidate.hasVisibleLastFour ? "last-four" : "no-last-four"}: ${candidate.value}`)
                  .join(" | ") || "None"
              }
            />
            <FieldRow
              label="Line item candidates"
              value={result.receipt.parsingDetails.lineItemCandidates.slice(0, 5).join(" | ") || "None"}
            />
            <FieldRow
              label="Rejected line items"
              value={
                result.receipt.parsingDetails.rejectedLineItemCandidates
                  .slice(0, 5)
                  .map((candidate) => `${candidate.reason}: ${candidate.text}`)
                  .join(" | ") || "None"
              }
            />
            <FieldRow
              label="Context rows"
              value={
                result.receipt.parsingDetails.contextCandidates
                  .slice(0, 6)
                  .map((candidate) => `${candidate.kind} ${candidate.source}: ${candidate.value}`)
                  .join(" | ") || "None"
              }
            />
            <FieldRow label="Missing" value={result.receipt.missingFields.join(", ") || "None"} />
          </dl>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-white">Field OCR reliability</h3>
            <div className="mt-2 grid gap-2">
              {result.receipt.fieldReliability.map((field) => (
                <div className="rounded-lg border border-white/10 bg-[#020713]/45 p-3" key={field.field}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold capitalize text-white">{field.field}</p>
                    <span className="font-mono text-xs text-[var(--cg-text-soft)]">{field.confidence}%</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">{field.status}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{field.note}</p>
                  {field.value ? <p className="mt-2 break-words font-mono text-xs text-white">{field.value}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="cg-command-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Receipt structure</h2>
          <dl className="mt-3">
            <FieldRow label="Line items" value={result.receipt.structure.hasLineItems ? "Detected" : "Not detected"} />
            <FieldRow label="Subtotal" value={result.receipt.structure.hasSubtotal ? "Detected" : "Not detected"} />
            <FieldRow label="Tax" value={result.receipt.structure.hasTax ? "Detected" : "Not detected"} />
            <FieldRow label="Shipping" value={result.receipt.structure.hasShippingIndicator ? "Detected" : "Not detected"} />
            <FieldRow label="Amounts" value={result.receipt.structure.currencyAmountCount} />
            <FieldRow label="Source category" value={result.receipt.sourceClassification.label} />
            <FieldRow
              label="Amount candidates"
              value={
                result.receipt.parsingDetails.amountCandidates
                  .slice(0, 4)
                  .map((candidate) => `${candidate.category} ${candidate.label}: $${candidate.value}`)
                  .join(" | ") || "None"
              }
            />
            <FieldRow
              label="Amount categories"
              value={
                Object.entries(result.receipt.parsingDetails.amountCategories)
                  .map(([category, values]) => `${category}: ${(values ?? []).map((value) => `$${value}`).join(", ")}`)
                  .join(" | ") || "None"
              }
            />
            <FieldRow
              label="Amount notes"
              value={result.receipt.parsingDetails.amountReviewNotes.join(" | ") || "No amount reconciliation notes"}
            />
            <FieldRow
              label="Payment notes"
              value={result.receipt.parsingDetails.paymentReviewNotes.join(" | ") || "No payment reconciliation notes"}
            />
            {result.receipt.sourceSpecificSummary ? (
              <>
                <FieldRow label="Source summary" value={result.receipt.sourceSpecificSummary.label} />
                <FieldRow
                  label="Source confidence"
                  value={`${result.receipt.sourceSpecificSummary.confidence}% (${result.receipt.sourceSpecificSummary.fieldsPresent}/${result.receipt.sourceSpecificSummary.fieldsExpected} fields)`}
                />
                <FieldRow label="Product table rows" value={result.receipt.sourceSpecificSummary.productTableRowCount ?? "Not applicable"} />
                <FieldRow
                  label="Source fields"
                  value={result.receipt.sourceSpecificSummary.fields
                    .map((field) => `${field.label}: ${field.present ? "Detected" : "Not detected"}${field.count !== undefined ? ` (${field.count})` : ""}`)
                    .join(" | ")}
                />
                <FieldRow label="Source notes" value={result.receipt.sourceSpecificSummary.notes.join(" | ")} />
              </>
            ) : null}
            <FieldRow label="Amazon order" value={result.receipt.structure.amazonOrderFormat} />
            {result.receipt.structure.amazonSignals ? (
              <>
                <FieldRow label="Amazon placed" value={result.receipt.structure.amazonSignals.hasOrderPlacedCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon items" value={result.receipt.structure.amazonSignals.hasItemsOrderedCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon summary" value={result.receipt.structure.amazonSignals.hasOrderSummaryCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon total" value={result.receipt.structure.amazonSignals.hasOrderTotalCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon ship/deliver" value={result.receipt.structure.amazonSignals.hasShipToOrDeliveryCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon arrival" value={result.receipt.structure.amazonSignals.hasArrivalOrShipmentCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon payment" value={result.receipt.structure.amazonSignals.hasPaymentCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon multi-ship" value={result.receipt.structure.amazonSignals.hasMultiShipmentCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon invoice" value={result.receipt.structure.amazonSignals.hasInvoiceCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon sold by" value={result.receipt.structure.amazonSignals.hasSoldByCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon billing" value={result.receipt.structure.amazonSignals.hasBillingCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon promo" value={result.receipt.structure.amazonSignals.hasPromotionCue ? "Detected" : "Not detected"} />
                <FieldRow label="Amazon issue" value={result.receipt.structure.amazonSignals.orderNumberIssue || "None"} />
              </>
            ) : null}
            <FieldRow label="Notes" value={result.receipt.structure.notes.join(" | ") || "No structure notes"} />
          </dl>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cg-command-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Metadata findings</h2>
          <dl className="mt-3">
            <FieldRow label="Context" value={result.metadata.context.status} />
            <FieldRow label="Summary" value={result.metadata.context.summary} />
            <FieldRow label="Modified" value={result.metadata.lastModifiedIso} />
            <FieldRow label="Image" value={result.metadata.image ? `${result.metadata.image.width}x${result.metadata.image.height}` : "Not image"} />
            <FieldRow label="PDF pages" value={result.metadata.pdf?.pages} />
            <FieldRow label="Notes" value={result.metadata.metadataNotes.join(" | ") || "None"} />
          </dl>
        </div>

        <div className="cg-command-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Image-quality findings</h2>
          <dl className="mb-3">
            <FieldRow label="Quality" value={result.imageHeuristics.qualityLevel} />
            <FieldRow label="Summary" value={result.imageHeuristics.qualitySummary} />
            <FieldRow label="Source context" value={result.imageHeuristics.sourceContextIndicators.join(" | ") || "No source-context quality notes"} />
            <FieldRow label="Evidence quality" value={result.imageHeuristics.evidenceQualityIndicators.join(" | ") || "No evidence-quality notes"} />
            <FieldRow label="Potential indicators" value={result.imageHeuristics.potentialEditingIndicators.join(" | ") || "No potential alteration indicators"} />
          </dl>
          <JsonBlock value={result.imageHeuristics} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cg-command-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Score breakdown</h2>
          <div className="mt-3">
            <ScoreBreakdown result={result} />
          </div>
        </div>
      </div>

      <ReviewModulesPanel />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cg-command-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Review signals</h2>
          <JsonBlock value={result.signals} />
        </div>

        <div className="cg-command-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Customer-safe recommendation</h2>
          <dl className="mt-3">
            <FieldRow label="Support action" value={result.recommendedSupportAction} />
            <FieldRow label="Customer wording" value={result.customerSafeWording} />
            <FieldRow label="Summary" value={result.evidenceSummary} />
          </dl>
        </div>
      </div>
    </section>
  );
}

function FixtureComparison({ runs }: { runs: HarnessRun[] }) {
  if (runs.length === 0) {
    return null;
  }

  return (
    <section className="cg-command-panel overflow-hidden rounded-xl p-4">
      <h2 className="text-lg font-semibold text-white">Side-by-side fixture comparison</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-[var(--cg-text-muted)]">
            <tr>
              {["Fixture", "Expected risk", "Actual risk", "Evidence Reliability Score", "OCR", "Review signals", "Recommendation"].map((heading) => (
                <th className="border-b border-white/10 px-3 py-2 font-semibold" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr className="align-top" key={run.fixture.id}>
                <td className="border-b border-white/8 px-3 py-3 font-semibold text-white">{run.fixture.label}</td>
                <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-soft)]">{run.fixture.expectedRisk}</td>
                <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-soft)]">{run.result?.riskLevel ?? "Not run"}</td>
                <td className="border-b border-white/8 px-3 py-3 font-mono text-white">
                  {run.result ? `${run.result.score} reliability` : "--"}
                </td>
                <td className="border-b border-white/8 px-3 py-3 font-mono text-white">{run.result ? `${run.result.ocr.averageConfidence}%` : "--"}</td>
                <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-muted)]">
                  {run.result?.signals.length ? run.result.signals.map((signal) => signal.title).join(", ") : "None"}
                </td>
                <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-muted)]">{run.result?.recommendedSupportAction ?? "Run fixture"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QaSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">{label}</span>
      <select
        className="rounded-lg border border-white/10 bg-[#020713] px-3 py-2 text-sm text-white outline-none transition focus:border-[var(--cg-border-strong)]"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        <option value="">Not noted</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RealReceiptQaSection({
  runs,
  activeRun,
  privacyChecklist,
  uploadError,
  copiedMode,
  onFilesSelect,
  onSelectRun,
  onNotesChange,
  onChecklistChange,
  onCopyJson,
  onCopyObservation,
  onCopySessionSummary,
  onClearRun,
  onClearSession,
}: {
  runs: RealReceiptRun[];
  activeRun?: RealReceiptRun;
  privacyChecklist: PrivacyChecklist;
  uploadError: string | null;
  copiedMode: "full" | "redacted" | "observation" | "session" | null;
  onFilesSelect: (files: File[]) => void;
  onSelectRun: (id: string) => void;
  onNotesChange: (notes: RealQaNotes) => void;
  onChecklistChange: (checklist: PrivacyChecklist) => void;
  onCopyJson: (redacted: boolean) => void;
  onCopyObservation: () => void;
  onCopySessionSummary: () => void;
  onClearRun: (id: string) => void;
  onClearSession: () => void;
}) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const isRunning = runs.some((run) => run.status === "running");
  const notes = activeRun?.notes ?? emptyRealQaNotes;
  const canCopyFull = Boolean(activeRun?.result && privacyChecklist.sourceRedacted && privacyChecklist.ocrReviewed && privacyChecklist.jsonReviewed);
  const checklistItems = [
    {
      key: "sourceRedacted",
      label: "Source receipt was anonymized before upload",
      detail: "Names, addresses, emails, phone numbers, payment details, and sensitive full order identifiers were removed or masked.",
    },
    {
      key: "ocrReviewed",
      label: "OCR text was reviewed for private data",
      detail: "Parsed OCR, line-item candidates, rejected rows, and context rows were checked before sharing.",
    },
    {
      key: "jsonReviewed",
      label: "Full JSON was privacy-reviewed",
      detail: "Use full JSON only when the copied payload has been checked. Use redacted JSON for safer tuning notes.",
    },
  ] satisfies { key: keyof PrivacyChecklist; label: string; detail: string }[];

  return (
    <section className="cg-command-panel rounded-xl p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cg-cyan)]">Real Receipt QA</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Temporary real anonymized receipt testing</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cg-text-muted)]">
            Upload an anonymized receipt image or PDF for local manual QA. The file stays in browser memory for this session and is not saved to the repo or sent to a server by this harness.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(251,113,133,0.45)] bg-[rgba(251,113,133,0.1)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-100">
          <ShieldAlert className="size-3.5" aria-hidden="true" />
          Do not commit customer evidence
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.08)] p-3 text-sm leading-6 text-amber-100">
        Redact customer name, address, email, phone number, payment details, and sensitive full order identifiers before testing.
        Use tuning observations for sharing by default. Redacted JSON is a diagnostic export with raw OCR and private-bearing structures omitted.
        Full JSON copying is enabled only after the privacy checklist is complete.
      </div>

      {runs.length > 0 ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-[#020713]/45 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Real Receipt Session</h3>
              <p className="mt-1 text-sm text-[var(--cg-text-muted)]">
                Browser-memory comparison table for this QA session. Uploaded files are not persisted by the harness.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--cg-border)] px-3 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={onCopySessionSummary}
                disabled={!runs.some((run) => run.result)}
                title="Copy a privacy-safe summary for every completed real receipt run"
              >
                {copiedMode === "session" ? <ClipboardCheck className="size-4" aria-hidden="true" /> : <Clipboard className="size-4" aria-hidden="true" />}
                {copiedMode === "session" ? "Copied session summary" : "Copy session tuning summary"}
              </button>
              <button
                className="rounded-lg border border-[var(--cg-border)] px-3 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)]"
                type="button"
                onClick={onClearSession}
                disabled={isRunning}
              >
                Clear session
              </button>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[1380px] border-separate border-spacing-0 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[var(--cg-text-muted)]">
                <tr>
                  {[
                    "File",
                    "Class",
                    "Risk",
                    "Evidence Reliability Score",
                    "Verification Status",
                    "Internal Structure Confidence",
                    "OCR",
                    "Score impact",
                    "Manual notes",
                    "Privacy hits",
                    "Status",
                  ].map((heading) => (
                    <th className="border-b border-white/10 px-3 py-2 font-semibold" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr className={activeRun?.id === run.id ? "bg-[rgba(53,217,255,0.07)]" : ""} key={run.id}>
                    <td className="border-b border-white/8 px-3 py-3">
                      <button
                        className="max-w-72 text-left font-semibold text-white underline decoration-[rgba(53,217,255,0.4)] underline-offset-4"
                        type="button"
                        onClick={() => onSelectRun(run.id)}
                      >
                        {run.file.name}
                      </button>
                      <p className="mt-1 text-xs text-[var(--cg-text-muted)]">{formatFileSize(run.file.size)}</p>
                    </td>
                    <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-soft)]">
                      {run.result?.receipt.sourceClassification.label ?? "Pending"}
                    </td>
                    <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-soft)]">{run.result?.riskLevel ?? "--"}</td>
                    <td className="border-b border-white/8 px-3 py-3 font-mono text-white">{run.result?.score ?? "--"}</td>
                    <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-soft)]">
                      {run.result?.verificationStatus.status ?? "--"}
                    </td>
                    <td className="border-b border-white/8 px-3 py-3 font-mono text-white">
                      {run.result ? `${run.result.internalStructureConfidence}%` : "--"}
                    </td>
                    <td className="border-b border-white/8 px-3 py-3 font-mono text-white">
                      {run.result ? `${run.result.ocr.averageConfidence}% ${run.result.ocr.quality.label}` : "--"}
                    </td>
                    <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-muted)]">
                      {run.result
                        ? `Signals -${run.result.scoreBreakdown.signalPenalty}; OCR -${run.result.scoreBreakdown.ocrPenalty}; fields +${run.result.scoreBreakdown.fieldBonus}`
                        : "--"}
                    </td>
                    <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-muted)]">
                      {[
                        run.notes.expectedRisk ? `Expected ${run.notes.expectedRisk}` : undefined,
                        run.notes.ocrAccuracy || undefined,
                        run.notes.parsedFields ? `Fields ${run.notes.parsedFields}` : undefined,
                        run.notes.scoreFit || undefined,
                      ]
                        .filter(Boolean)
                        .join(" | ") || "Not noted"}
                    </td>
                    <td className="border-b border-white/8 px-3 py-3 font-mono text-white">{sensitiveFindingCount(run.result)}</td>
                    <td className="border-b border-white/8 px-3 py-3 text-[var(--cg-text-muted)]">{run.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4">
          <input
            ref={uploadInputRef}
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            multiple
            disabled={isRunning}
            onChange={(event) => {
              onFilesSelect(Array.from(event.currentTarget.files ?? []));
              event.currentTarget.value = "";
            }}
          />
          <button
            className="grid min-h-44 place-items-center rounded-xl border border-dashed border-[var(--cg-border)] bg-[#020713]/55 p-5 text-center transition hover:border-[var(--cg-border-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={isRunning}
            onClick={() => uploadInputRef.current?.click()}
          >
            <span>
              <UploadCloud className="mx-auto size-10 text-[var(--cg-cyan)]" aria-hidden="true" />
              <span className="mt-3 block font-semibold text-white">
                {isRunning ? "Analyzing uploaded receipt" : "Upload anonymized receipts"}
              </span>
              <span className="mt-2 block text-sm text-[var(--cg-text-muted)]">PNG, JPG, WEBP, or PDF. Multiple files stay local to this browser session.</span>
            </span>
          </button>

          {uploadError ? (
            <div className="rounded-lg border border-[rgba(251,113,133,0.42)] bg-[rgba(251,113,133,0.1)] p-3 text-sm text-rose-100">
              {uploadError}
            </div>
          ) : null}

          {activeRun ? (
            <div className="rounded-xl border border-white/10 bg-[#020713]/55 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{activeRun.file.name}</p>
                  <p className="mt-1 text-sm text-[var(--cg-text-muted)]">
                    {formatFileSize(activeRun.file.size)} | {activeRun.file.type || "unknown type"}
                  </p>
                </div>
                <button
                  className="rounded-lg border border-[var(--cg-border)] px-3 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)]"
                  type="button"
                  onClick={() => onClearRun(activeRun.id)}
                >
                  Remove
                </button>
              </div>
              <div className="mt-3">
                {activeRun.status === "running" ? (
                  <div className="grid min-h-64 place-items-center rounded-lg border border-white/10 bg-[#020713]/80 text-center">
                    <div>
                      <Loader2 className="mx-auto size-10 animate-spin text-[var(--cg-cyan)]" aria-hidden="true" />
                      <p className="mt-3 text-sm font-semibold text-white">Running local analyzer</p>
                    </div>
                  </div>
                ) : (
                  <EvidencePreview file={activeRun.file} previewUrl={activeRun.previewUrl} />
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border border-white/10 bg-[#020713]/45 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">QA notes</h3>
                <p className="mt-1 text-sm text-[var(--cg-text-muted)]">Notes are local-only browser state and are not saved permanently.</p>
              </div>
              {activeRun?.result ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    className="cg-primary-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition"
                    type="button"
                    onClick={onCopyObservation}
                    title="Preferred sharing format for tuning because it excludes raw OCR and parsed private values by default"
                  >
                    {copiedMode === "observation" ? <ClipboardCheck className="size-4" aria-hidden="true" /> : <Clipboard className="size-4" aria-hidden="true" />}
                    {copiedMode === "observation" ? "Copied tuning observation" : "Copy tuning observation"}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--cg-border)] px-3 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)]"
                    type="button"
                    onClick={() => onCopyJson(true)}
                    title="Copy a diagnostic JSON shape with raw OCR and private-bearing parsed structures omitted"
                  >
                    {copiedMode === "redacted" ? <ClipboardCheck className="size-4" aria-hidden="true" /> : <Clipboard className="size-4" aria-hidden="true" />}
                    {copiedMode === "redacted" ? "Copied redacted JSON" : "Copy redacted JSON"}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--cg-border)] px-3 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => onCopyJson(false)}
                    disabled={!canCopyFull}
                    title={canCopyFull ? "Copy full JSON" : "Complete the privacy checklist before copying full JSON"}
                  >
                    {copiedMode === "full" ? <ClipboardCheck className="size-4" aria-hidden="true" /> : <Clipboard className="size-4" aria-hidden="true" />}
                    {copiedMode === "full" ? "Copied full JSON" : "Copy full JSON"}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-4 rounded-lg border border-[rgba(53,217,255,0.3)] bg-[rgba(53,217,255,0.07)] p-3 text-sm leading-6 text-cyan-100">
              `Copy tuning observation` is the preferred sharing format for threshold and reliability-score review. It avoids raw OCR text,
              original file names, parsed private values, full order IDs, payment last-four values, names, addresses, emails, phone numbers,
              and tracking numbers by default. `Copy redacted JSON` is for diagnostics and omits raw OCR text, raw parsed candidate text,
              EXIF-like metadata, file names, and raw final-report fields by default.
            </div>

            <div className="mt-4 grid gap-2 rounded-lg border border-[rgba(251,191,36,0.28)] bg-[rgba(251,191,36,0.06)] p-3">
              <h4 className="text-sm font-semibold text-white">Privacy review before full copy</h4>
              {checklistItems.map((item) => (
                <label className="flex items-start gap-3 text-sm text-[var(--cg-text-soft)]" key={item.key}>
                  <input
                    className="mt-1 size-4 accent-[var(--cg-cyan)]"
                    type="checkbox"
                    checked={privacyChecklist[item.key]}
                    onChange={(event) => onChecklistChange({ ...privacyChecklist, [item.key]: event.currentTarget.checked })}
                  />
                  <span>
                    <span className="block font-semibold text-white">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--cg-text-muted)]">{item.detail}</span>
                  </span>
                </label>
              ))}
              {activeRun?.result ? (
                <p className="text-xs leading-5 text-[var(--cg-text-muted)]">
                  Detected {sensitiveFindingCount(activeRun.result)} obvious sensitive pattern(s) in the current raw result before redaction.
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <QaSelect
                label="Expected risk level"
                value={notes.expectedRisk}
                options={["Low", "Medium", "High"]}
                onChange={(value) => onNotesChange({ ...notes, expectedRisk: value as RealQaNotes["expectedRisk"] })}
              />
              <QaSelect
                label="OCR accuracy"
                value={notes.ocrAccuracy}
                options={["Accurate", "Partially accurate", "Inaccurate"]}
                onChange={(value) => onNotesChange({ ...notes, ocrAccuracy: value as RealQaNotes["ocrAccuracy"] })}
              />
              <QaSelect
                label="Parsed fields"
                value={notes.parsedFields}
                options={["Correct", "Partially correct", "Incorrect"]}
                onChange={(value) => onNotesChange({ ...notes, parsedFields: value as RealQaNotes["parsedFields"] })}
              />
              <QaSelect
                label="Reliability score felt"
                value={notes.scoreFit}
                options={["Too harsh", "Too lenient", "About right"]}
                onChange={(value) => onNotesChange({ ...notes, scoreFit: value as RealQaNotes["scoreFit"] })}
              />
            </div>

            <label className="mt-3 grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">Suggested threshold adjustment</span>
              <textarea
                className="min-h-28 resize-y rounded-lg border border-white/10 bg-[#020713] px-3 py-2 text-sm leading-6 text-white outline-none transition placeholder:text-[var(--cg-text-muted)] focus:border-[var(--cg-border-strong)]"
                placeholder="Example: OCR confidence was accurate at 52%, but reliability score was too harsh because all key fields were readable."
                value={notes.thresholdAdjustment}
                onChange={(event) => onNotesChange({ ...notes, thresholdAdjustment: event.currentTarget.value })}
              />
            </label>
          </div>

          {activeRun?.status === "error" ? (
            <div className="rounded-lg border border-[rgba(251,113,133,0.42)] bg-[rgba(251,113,133,0.1)] p-3 text-sm text-rose-100">
              {activeRun.error}
            </div>
          ) : null}

          {activeRun?.result ? (
            <div className="grid gap-3 rounded-xl border border-white/10 bg-[#020713]/45 p-4 sm:grid-cols-2 xl:grid-cols-6">
              <FieldRow label="Class" value={activeRun.result.receipt.sourceClassification.label} />
              <FieldRow label="Risk" value={activeRun.result.riskLevel} />
              <FieldRow label="Evidence Reliability Score" value={activeRun.result.score} />
              <FieldRow label="Verification Status" value={activeRun.result.verificationStatus.status} />
              <FieldRow label="Internal Structure Confidence" value={`${activeRun.result.internalStructureConfidence}%`} />
              <FieldRow label="OCR" value={`${activeRun.result.ocr.averageConfidence}%`} />
            </div>
          ) : null}
        </div>
      </div>

      {activeRun?.result ? (
        <div className="mt-4 grid gap-4">
          <AnalysisDetailPanels result={activeRun.result} />
          <AnalysisReport report={mapLocalAnalysisToReport(activeRun.result)} status="complete" />
        </div>
      ) : null}
    </section>
  );
}

export function TestEvidenceHarness() {
  const [runs, setRuns] = useState<Partial<Record<SampleEvidenceFixtureId, HarnessRun>>>({});
  const [activeFixtureId, setActiveFixtureId] = useState<SampleEvidenceFixtureId>("clean-receipt");
  const [realRuns, setRealRuns] = useState<RealReceiptRun[]>([]);
  const [activeRealRunId, setActiveRealRunId] = useState<string | null>(null);
  const [privacyChecklist, setPrivacyChecklist] = useState<PrivacyChecklist>(emptyPrivacyChecklist);
  const [realUploadError, setRealUploadError] = useState<string | null>(null);
  const [copiedFixtureId, setCopiedFixtureId] = useState<string | null>(null);
  const [copiedRealMode, setCopiedRealMode] = useState<"full" | "redacted" | "observation" | "session" | null>(null);
  const activeRun = runs[activeFixtureId];
  const activeRealRun = activeRealRunId ? realRuns.find((run) => run.id === activeRealRunId) : realRuns[0];
  const completedRuns = useMemo(
    () => Object.values(runs).filter((run): run is HarnessRun => Boolean(run?.result)),
    [runs],
  );
  const activeReport = activeRun?.result ? mapLocalAnalysisToReport(activeRun.result) : null;

  async function runFixture(id: SampleEvidenceFixtureId) {
    setActiveFixtureId(id);
    const fixture = sampleEvidenceFixtures.find((item) => item.id === id);
    if (!fixture) {
      return;
    }

    setRuns((current) => ({
      ...current,
      [id]: {
        fixture,
        file: new File([], fixture.fileName),
        status: "running",
      },
    }));

    try {
      const loaded: LoadedEvidenceFixture = await loadSampleEvidenceFixture(id);
      const result = await analyzeEvidenceFile(loaded.file);
      const expectations = loaded.fixture.evaluate(result);

      setRuns((current) => {
        const previousPreview = current[id]?.previewUrl;
        if (previousPreview && previousPreview !== loaded.previewUrl) {
          URL.revokeObjectURL(previousPreview);
        }

        return {
          ...current,
          [id]: {
            ...loaded,
            status: "complete",
            result,
            expectations,
          },
        };
      });
    } catch (error) {
      setRuns((current) => ({
        ...current,
        [id]: {
          fixture,
          file: new File([], fixture.fileName),
          status: "error",
          error: error instanceof Error ? error.message : "Fixture analysis failed.",
        },
      }));
    }
  }

  async function runAllFixtures() {
    for (const fixture of sampleEvidenceFixtures) {
      await runFixture(fixture.id);
    }
  }

  function resetRuns() {
    Object.values(runs).forEach((run) => {
      if (run?.previewUrl) {
        URL.revokeObjectURL(run.previewUrl);
      }
    });
    realRuns.forEach((run) => {
      if (run.previewUrl) {
        URL.revokeObjectURL(run.previewUrl);
      }
    });
    setRuns({});
    setRealRuns([]);
    setActiveRealRunId(null);
    setPrivacyChecklist(emptyPrivacyChecklist);
    setRealUploadError(null);
    setCopiedFixtureId(null);
    setCopiedRealMode(null);
  }

  async function copyActiveResult() {
    if (!activeRun?.result) {
      return;
    }

    const payload = {
      fixture: {
        id: activeRun.fixture.id,
        label: activeRun.fixture.label,
        expectedRisk: activeRun.fixture.expectedRisk,
        expectedOutcome: activeRun.fixture.expectedOutcome,
        tuningNotes: activeRun.fixture.tuningNotes,
      },
      file: {
        name: activeRun.file.name,
        type: activeRun.file.type,
        size: activeRun.file.size,
        lastModified: activeRun.file.lastModified,
      },
      manualQaExpectations: activeRun.expectations ?? [],
      analysisResult: activeRun.result,
      finalReport: mapLocalAnalysisToReport(activeRun.result),
    };

    await copyTextToClipboard(JSON.stringify(payload, null, 2));
    setCopiedFixtureId(activeRun.fixture.id);
    window.setTimeout(() => setCopiedFixtureId(null), 1600);
  }

  async function handleRealReceiptFiles(files: File[]) {
    setRealUploadError(null);
    setCopiedRealMode(null);
    setPrivacyChecklist(emptyPrivacyChecklist);

    if (files.length === 0) {
      return;
    }

    const acceptedFiles = files.filter(isAcceptedEvidenceFile);
    const rejectedCount = files.length - acceptedFiles.length;

    if (rejectedCount > 0) {
      setRealUploadError(`${rejectedCount} unsupported file(s) were skipped. Upload anonymized PNG, JPG, WEBP, or PDF files.`);
    }

    for (const file of acceptedFiles) {
      const id = `${file.name}-${file.lastModified}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
      const addedAtIso = new Date().toISOString();
      const pendingRun: RealReceiptRun = {
        id,
        file,
        previewUrl,
        addedAtIso,
        notes: emptyRealQaNotes,
        status: "running",
      };

      setRealRuns((current) => [...current, pendingRun]);
      setActiveRealRunId(id);

      try {
        const result = await analyzeEvidenceFile(file);
        setRealRuns((current) => current.map((run) => (run.id === id ? { ...run, status: "complete", result } : run)));
      } catch (error) {
        setRealRuns((current) =>
          current.map((run) =>
            run.id === id
              ? {
                  ...run,
                  status: "error",
                  error: error instanceof Error ? error.message : "Real receipt analysis failed.",
                }
              : run,
          ),
        );
      }
    }
  }

  function updateActiveRealNotes(notes: RealQaNotes) {
    if (!activeRealRun) {
      return;
    }

    setRealRuns((current) => current.map((run) => (run.id === activeRealRun.id ? { ...run, notes } : run)));
  }

  function clearRealReceipt(id: string) {
    const runToClear = realRuns.find((run) => run.id === id);

    if (runToClear?.previewUrl) {
      URL.revokeObjectURL(runToClear.previewUrl);
    }

    setRealRuns((current) => {
      const nextRuns = current.filter((run) => run.id !== id);
      if (activeRealRunId === id) {
        setActiveRealRunId(nextRuns[0]?.id ?? null);
      }
      return nextRuns;
    });
    setPrivacyChecklist(emptyPrivacyChecklist);
    setCopiedRealMode(null);
  }

  function clearRealSession() {
    realRuns.forEach((run) => {
      if (run.previewUrl) {
        URL.revokeObjectURL(run.previewUrl);
      }
    });

    setRealRuns([]);
    setActiveRealRunId(null);
    setPrivacyChecklist(emptyPrivacyChecklist);
    setRealUploadError(null);
    setCopiedRealMode(null);
  }

  async function copyRealResult(redacted: boolean) {
    if (!activeRealRun?.result) {
      return;
    }

    const activeIndex = realRuns.findIndex((run) => run.id === activeRealRun.id);
    const payload = redacted
      ? redactedDiagnosticFor(activeRealRun, activeIndex >= 0 ? activeIndex : 0)
      : {
          source: "temporary-real-receipt-qa",
          privacyMode: "full-privacy-reviewed",
          privacyReminder:
            "Real receipt QA is browser-local only. Do not commit customer evidence. Confirm copied JSON does not contain private customer data before sharing.",
          privacyChecklist,
          detectedSensitivePatternCount: sensitiveFindingCount(activeRealRun.result),
          file: {
            name: activeRealRun.file.name,
            type: activeRealRun.file.type,
            size: activeRealRun.file.size,
            lastModified: activeRealRun.file.lastModified,
          },
          manualQaNotes: activeRealRun.notes,
          scoreRuleSummary: scoreRuleSummary(activeRealRun.result),
          analysisResult: activeRealRun.result,
          finalReport: mapLocalAnalysisToReport(activeRealRun.result),
        };

    await copyTextToClipboard(JSON.stringify(payload, null, 2));
    setCopiedRealMode(redacted ? "redacted" : "full");
    window.setTimeout(() => setCopiedRealMode(null), 1600);
  }

  async function copyTuningObservation() {
    if (!activeRealRun?.result) {
      return;
    }

    const activeIndex = realRuns.findIndex((run) => run.id === activeRealRun.id);
    const payload = tuningObservationFor(activeRealRun, activeIndex >= 0 ? activeIndex : 0);

    await copyTextToClipboard(JSON.stringify(payload, null, 2));
    setCopiedRealMode("observation");
    window.setTimeout(() => setCopiedRealMode(null), 1600);
  }

  async function copySessionTuningSummary() {
    const payload = sessionTuningSummaryFor(realRuns);

    await copyTextToClipboard(JSON.stringify(payload, null, 2));
    setCopiedRealMode("session");
    window.setTimeout(() => setCopiedRealMode(null), 1600);
  }

  return (
    <div className="mx-auto grid min-w-0 max-w-[1560px] gap-4">
      <header className="px-1 py-2">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cg-cyan)]">Developer-only route</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Sample evidence analyzer harness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cg-text-muted)]">
              Manual QA mode for local OCR, parsing, metadata, image-quality, reliability scoring, and report tuning. Scores reflect internal consistency, not external verification.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="cg-primary-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed"
              type="button"
              onClick={runAllFixtures}
              disabled={Object.values(runs).some((run) => run?.status === "running")}
            >
              <Play className="size-4" aria-hidden="true" />
              Run all fixtures
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--cg-border)] px-4 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)]"
              type="button"
              onClick={resetRuns}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </header>

      <ThresholdSummary />

      <RealReceiptQaSection
        runs={realRuns}
        activeRun={activeRealRun}
        privacyChecklist={privacyChecklist}
        uploadError={realUploadError}
        copiedMode={copiedRealMode}
        onFilesSelect={handleRealReceiptFiles}
        onSelectRun={(id) => {
          setActiveRealRunId(id);
          setCopiedRealMode(null);
          setPrivacyChecklist(emptyPrivacyChecklist);
        }}
        onNotesChange={updateActiveRealNotes}
        onChecklistChange={setPrivacyChecklist}
        onCopyJson={copyRealResult}
        onCopyObservation={copyTuningObservation}
        onCopySessionSummary={copySessionTuningSummary}
        onClearRun={clearRealReceipt}
        onClearSession={clearRealSession}
      />

      <section className="grid gap-3 lg:grid-cols-4">
        {sampleEvidenceFixtures.map((fixture) => {
          const run = runs[fixture.id];
          const Icon = fixture.type === "pdf" ? FileText : ImageIcon;
          const hasNeedsTuning = run?.expectations?.some((expectation) => expectation.status === "Needs Tuning");
          const hasWarning = run?.expectations?.some((expectation) => expectation.status === "Warning");

          return (
            <button
              className={`rounded-xl border p-4 text-left transition hover:border-[var(--cg-border-strong)] ${activeFixtureId === fixture.id ? "ring-2 ring-[var(--cg-cyan)]/50" : ""} ${statusClass(run)}`}
              type="button"
              key={fixture.id}
              onClick={() => {
                setActiveFixtureId(fixture.id);
                if (!run || run.status === "idle") {
                  void runFixture(fixture.id);
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {run?.status === "running" ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                ) : run?.status === "complete" && !hasNeedsTuning && !hasWarning ? (
                  <CheckCircle2 className="size-5 text-[var(--cg-green)]" aria-hidden="true" />
                ) : run?.status === "complete" && hasWarning ? (
                  <AlertTriangle className="size-5 text-[var(--cg-amber)]" aria-hidden="true" />
                ) : run?.status === "error" || hasNeedsTuning ? (
                  <XCircle className="size-5 text-[var(--cg-red)]" aria-hidden="true" />
                ) : null}
              </div>
              <h2 className="mt-3 font-semibold text-white">{fixture.label}</h2>
              <p className="mt-2 text-sm leading-5 text-[var(--cg-text-muted)]">{fixture.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-soft)]">{fixture.expectedOutcome}</p>
              {run?.result ? (
                <p className="mt-3 font-mono text-sm text-white">
                  {run.result.score} reliability / {run.result.riskLevel} / {run.result.ocr.averageConfidence}% OCR
                </p>
              ) : null}
              <p className="mt-3 text-xs leading-5 text-[var(--cg-text-muted)]">{fixture.tuningNotes}</p>
            </button>
          );
        })}
      </section>

      {completedRuns.length > 0 ? (
        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Manual QA expectations</h2>
              <p className="mt-1 text-sm text-[var(--cg-text-muted)]">
                These checks are advisory. Warning and Needs Tuning labels are review prompts, not CI failures.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(53,217,255,0.35)] bg-[rgba(53,217,255,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
              <Info className="size-3.5" aria-hidden="true" />
              Manual QA
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {completedRuns.flatMap((run) =>
              (run.expectations ?? []).map((expectation) => (
                <div
                  className={`grid gap-2 rounded-lg border px-3 py-2 text-sm ${qaStatusClass(expectation.status)}`}
                  key={`${run.fixture.id}-${expectation.label}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 font-semibold text-white">
                      {(() => {
                        const StatusIcon = qaStatusIcon(expectation.status);
                        return <StatusIcon className="size-4" aria-hidden="true" />;
                      })()}
                      {expectation.status} - {run.fixture.label}: {expectation.label}
                    </span>
                    <span className="font-mono text-xs text-[var(--cg-text-soft)]">{expectation.detail}</span>
                  </div>
                  <p className="text-[var(--cg-text-muted)]">{expectation.note}</p>
                </div>
              )),
            )}
          </div>
        </section>
      ) : null}

      <FixtureComparison runs={completedRuns} />

      {activeRun?.status === "error" ? (
        <section className="rounded-xl border border-[rgba(251,113,133,0.42)] bg-[rgba(251,113,133,0.1)] p-4 text-rose-100">
          <h2 className="font-semibold">Fixture failed</h2>
          <p className="mt-2 text-sm">{activeRun.error}</p>
        </section>
      ) : null}

      {activeRun?.result ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <section className="cg-command-panel rounded-xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cg-cyan)]">Fixture input</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{activeRun.fixture.label}</h2>
                <p className="mt-2 text-sm text-[var(--cg-text-muted)]">
                  {activeRun.file.name} | {formatFileSize(activeRun.file.size)} | {activeRun.file.type}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--cg-border)] px-3 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)]"
                  type="button"
                  onClick={copyActiveResult}
                >
                  {copiedFixtureId === activeRun.fixture.id ? (
                    <ClipboardCheck className="size-4" aria-hidden="true" />
                  ) : (
                    <Clipboard className="size-4" aria-hidden="true" />
                  )}
                  {copiedFixtureId === activeRun.fixture.id ? "Copied JSON" : "Copy result JSON"}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--cg-border)] px-3 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)]"
                  type="button"
                  onClick={() => runFixture(activeRun.fixture.id)}
                >
                  <Play className="size-4" aria-hidden="true" />
                  Re-run
                </button>
              </div>
            </div>
            <div className="mt-4">
              <FixturePreview run={activeRun} />
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-[#020713]/55 p-3">
              <h3 className="text-sm font-semibold text-white">Fixture notes</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">{activeRun.fixture.tuningNotes}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">
                Expected: {activeRun.fixture.expectedRisk} risk. {activeRun.fixture.expectedOutcome}
              </p>
            </div>
          </section>

          <AnalysisDetailPanels result={activeRun.result} />
        </div>
      ) : (
        <section className="rounded-xl border border-dashed border-[var(--cg-border)] p-8 text-center text-[var(--cg-text-muted)]">
          Choose a fixture or run all fixtures to start the local analyzer harness.
        </section>
      )}

      {activeReport ? <AnalysisReport report={activeReport} status="complete" /> : null}
    </div>
  );
}
