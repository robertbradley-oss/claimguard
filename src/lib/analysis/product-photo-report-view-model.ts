import type {
  DamageVisibilityStatus,
  EvidenceConfidence,
  EvidenceMetadataSummary,
  EvidenceReviewStatus,
  ProductContextStatus,
  ProductPhotoEvidenceAnalysisResult,
  ProductPhotoSubjectType,
  RequestedPhotoView,
  ReviewPriority,
  SharedEvidenceSignal,
  SignalSeverity,
} from "@/lib/analysis/types";

export type ProductPhotoReportReviewStatus =
  | "Manual review recommended"
  | "Review recommended"
  | "Inconclusive";

export type ProductPhotoReportSignal = {
  label: string;
  category: SharedEvidenceSignal["category"];
  severity: SignalSeverity;
  confidencePercent: number;
  reviewNote: string;
  recommendedReviewStep: string;
};

export type ProductPhotoReportViewModel = {
  boundary: "product-photo-report-view-model";
  devOnly: true;
  probeOnly: true;
  runtimeLive: false;
  sourceModule: "productPhoto";
  evidenceType: "product-photo";
  reviewTitle: string;
  reviewSummary: string;
  reviewStatus: ProductPhotoReportReviewStatus;
  reviewPriority: ReviewPriority;
  confidence: EvidenceConfidence;
  score: {
    label: "Evidence Reliability Score";
    value: number;
    scope: "Local evidence quality and review readiness only";
    meaning: string;
    highScoreMeaning: string;
    lowOrMediumScoreMeaning: string;
    safetyNote: string;
  };
  evidenceQuality: {
    qualityLevel: string;
    qualitySummary: string;
    qualityLimitCount: number;
  };
  productContext: {
    subjectType: string;
    productContextStatus: string;
    damageVisibilityReviewContext: string;
    labelContextSummary: string;
    purchaseOrOrderMatchNeeded: boolean;
    requestedAdditionalViews: string[];
  };
  reviewSignals: ProductPhotoReportSignal[];
  limitations: string[];
  recommendedSupportAction: string;
  customerSafeWording: string;
  externalVerification: {
    status: "Not externally verified";
    externalVerification: "Not performed";
    summary: string;
  };
  privacy: {
    derivedSummaryOnly: true;
    rawPhotoBytesIncluded: false;
    imageBufferIncluded: false;
    rawExifIncluded: false;
    rawMetadataIncluded: false;
    originalFilenameIncluded: false;
    rawLabelValueIncluded: false;
    providerOutputIncluded: false;
    storageHandleIncluded: false;
    integrationHandleIncluded: false;
    caseQueueHandleIncluded: false;
  };
  isolation: {
    localAnalysisResultRequired: false;
    analyzeEvidenceFileInvoked: false;
    analyzerRoutingInvoked: false;
    uiUploadReportScoringParserFixturePathsInvoked: false;
  };
};

export const PRODUCT_PHOTO_REPORT_VIEW_MODEL_BOUNDARY_STATUS = {
  boundary: "product-photo-report-view-model",
  devOnly: true,
  probeOnly: true,
  runtimeLive: false,
  localAnalysisResultRequired: false,
  analyzeEvidenceFileInvoked: false,
  analyzerRoutingInvoked: false,
  uiUploadReportScoringParserFixturePathsInvoked: false,
} as const;

const REQUESTED_VIEW_LABELS: Record<RequestedPhotoView, string> = {
  "wider-product-photo": "Wider product photo",
  "clearer-damage-close-up": "Clearer close-up of the relevant area",
  "serial-or-model-label": "Serial or model label photo if support policy needs it",
  "packaging-context": "Packaging context if shipping context matters",
  "installation-context": "Installation context if support policy needs it",
  "proof-of-purchase-match": "Receipt or order match",
};

const SUBJECT_TYPE_LABELS: Record<ProductPhotoSubjectType, string> = {
  "damage-close-up": "Close-up product photo",
  "full-product-context": "Full product context photo",
  "serial-model-label": "Serial or model label context",
  "packaging-damage": "Packaging context photo",
  "installation-context": "Installation context photo",
  "mixed-evidence-image": "Mixed evidence image",
  "inconclusive-photo": "Inconclusive product photo",
};

const PRODUCT_CONTEXT_LABELS: Record<ProductContextStatus, string> = {
  complete: "Product context available for review",
  partial: "Product context may be incomplete",
  missing: "Additional product context may be needed",
  "not-applicable": "Product context not applicable",
  inconclusive: "Product context is inconclusive",
};

const DAMAGE_VISIBILITY_LABELS: Record<DamageVisibilityStatus, string> = {
  "clearly-visible": "Relevant area is visible for reviewer inspection",
  "partially-visible": "Relevant area is partially visible for reviewer inspection",
  "claimed-but-not-visible": "Relevant area needs clearer reviewer context",
  "damage-area-visible-context-missing": "Relevant area is visible, but surrounding product context may be needed",
  "product-visible-damage-area-missing": "Product context is visible, but the relevant area may need another view",
  inconclusive: "Relevant area visibility is inconclusive",
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function clampConfidence(confidence: number) {
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

function reviewStatusFor(reviewLabel: EvidenceReviewStatus): ProductPhotoReportReviewStatus {
  if (reviewLabel === "Manual review recommended") {
    return "Manual review recommended";
  }

  if (reviewLabel === "Review recommended") {
    return "Review recommended";
  }

  return "Inconclusive";
}

function qualitySummaryFor(metadata: EvidenceMetadataSummary) {
  if (!metadata.dimensionsPresent) {
    return "Photo dimensions were not available in the privacy-safe summary.";
  }

  if (metadata.dimensionsBucket === "small") {
    return "Photo dimensions may limit reviewer inspection.";
  }

  return "Photo quality context is available for local support review.";
}

function qualityLimitCountFor(metadata: EvidenceMetadataSummary, qualityLimits: readonly string[]) {
  const dimensionLimit = !metadata.dimensionsPresent || metadata.dimensionsBucket === "small" ? 1 : 0;
  const metadataLimit = metadata.metadataContext === "Available" ? 0 : 1;

  return Math.max(qualityLimits.length, dimensionLimit + metadataLimit);
}

function labelContextSummaryFor(result: ProductPhotoEvidenceAnalysisResult) {
  const labelContext = result.moduleDetails.productPhoto.productLabelContext;

  if (labelContext.serialOrModelContextPresent) {
    return labelContext.labelReadable === true
      ? "Label context is present for reviewer inspection; raw label values are omitted."
      : "Label context may be present, but raw label values are omitted.";
  }

  return "No raw serial, model, barcode, or label value is included in this view model.";
}

function signalLabelFor(signal: SharedEvidenceSignal) {
  if (signal.category === "Image Quality") {
    return "Photo quality limits review";
  }

  if (signal.category === "Image Consistency") {
    return "Image consistency needs manual review";
  }

  if (signal.category === "Metadata Context") {
    return "Metadata context is limited";
  }

  if (signal.category === "Purchase Match") {
    return "Receipt or order match may be needed";
  }

  if (signal.category === "Recommendation") {
    return "Manual review recommended";
  }

  return "Product context review signal";
}

function signalReviewNoteFor(signal: SharedEvidenceSignal) {
  if (signal.category === "Image Quality") {
    return "Image quality may limit local reviewer inspection.";
  }

  if (signal.category === "Metadata Context") {
    return "Metadata is context only and raw metadata values are omitted.";
  }

  if (signal.category === "Purchase Match") {
    return "Product-photo context may need comparison with receipt or order evidence.";
  }

  return "This local-only signal supports manual review priority.";
}

function signalReviewStepFor(signal: SharedEvidenceSignal) {
  if (signal.category === "Image Quality") {
    return "Request a clearer product photo only if current detail limits review.";
  }

  if (signal.category === "Purchase Match") {
    return "Compare product-photo context with available receipt or order evidence.";
  }

  if (signal.category === "Metadata Context") {
    return "Continue review using available product-photo context; do not use metadata status by itself.";
  }

  return "Have a reviewer inspect the photo evidence before completing support handling.";
}

function mapReviewSignals(signals: readonly SharedEvidenceSignal[]): ProductPhotoReportSignal[] {
  return signals.slice(0, 6).map((signal) => ({
    label: signalLabelFor(signal),
    category: signal.category,
    severity: signal.severity,
    confidencePercent: clampConfidence(signal.confidence),
    reviewNote: signalReviewNoteFor(signal),
    recommendedReviewStep: signalReviewStepFor(signal),
  }));
}

function recommendedSupportActionFor(result: ProductPhotoEvidenceAnalysisResult) {
  const details = result.moduleDetails.productPhoto;

  if (details.requestedAdditionalViews.length > 0) {
    return "Manual review recommended. Request only the additional product view or receipt/order match needed for support review.";
  }

  return "Manual review recommended. Compare the product-photo context with available receipt or order evidence before completing support handling.";
}

function customerSafeWordingFor(result: ProductPhotoEvidenceAnalysisResult) {
  const requestedViews = result.moduleDetails.productPhoto.requestedAdditionalViews;

  if (requestedViews.includes("wider-product-photo")) {
    return "Thanks for the photo. We may need one wider product view to complete the review.";
  }

  if (requestedViews.includes("clearer-damage-close-up")) {
    return "Thanks for the photo. We may need one clearer image of the relevant area to complete the review.";
  }

  return "Thanks for the photo. We are reviewing it with the available order information and will follow up if more context is needed.";
}

function reviewSummaryFor(result: ProductPhotoEvidenceAnalysisResult) {
  const details = result.moduleDetails.productPhoto;
  const requestedCount = details.requestedAdditionalViews.length;

  if (requestedCount > 0) {
    return `Product-photo review context is local-only. ${requestedCount} additional review item${
      requestedCount === 1 ? "" : "s"
    } may be needed before support completes review.`;
  }

  return "Product-photo review context is local-only and ready for manual support comparison with available order evidence.";
}

function limitationsFor(result: ProductPhotoEvidenceAnalysisResult) {
  const limitations = [
    "Local product-photo analysis only",
    "External verification was not performed",
    "High score does not prove the product photo or claim",
    "Metadata is context only and raw metadata values are omitted",
  ];

  if (result.moduleDetails.productPhoto.requestedAdditionalViews.length > 0) {
    limitations.push("Additional product or order context may be needed");
  }

  return limitations;
}

export function mapProductPhotoAnalysisToReportViewModel(
  result: ProductPhotoEvidenceAnalysisResult,
): ProductPhotoReportViewModel {
  const details = result.moduleDetails.productPhoto;
  const metadataSummary = result.privacySafeMetadataSummary;

  return {
    boundary: "product-photo-report-view-model",
    devOnly: true,
    probeOnly: true,
    runtimeLive: false,
    sourceModule: "productPhoto",
    evidenceType: "product-photo",
    reviewTitle: "Product photo review summary",
    reviewSummary: reviewSummaryFor(result),
    reviewStatus: reviewStatusFor(result.reviewLabel),
    reviewPriority: result.reviewPriority,
    confidence: result.confidenceLevel,
    score: {
      label: "Evidence Reliability Score",
      value: clampScore(result.score),
      scope: "Local evidence quality and review readiness only",
      meaning: "Score reflects product-photo review readiness and local evidence quality only.",
      highScoreMeaning: "High score means the product-photo context may be more useful for local support review.",
      lowOrMediumScoreMeaning:
        "Low or medium score means image quality, product context, or receipt/order matching may require manual review.",
      safetyNote: "High score does not prove the product photo or claim. Manual review may still be required.",
    },
    evidenceQuality: {
      qualityLevel: details.imageQuality.qualityLevel,
      qualitySummary: qualitySummaryFor(metadataSummary),
      qualityLimitCount: qualityLimitCountFor(metadataSummary, details.imageQuality.qualityLimits),
    },
    productContext: {
      subjectType: SUBJECT_TYPE_LABELS[details.subjectType],
      productContextStatus: PRODUCT_CONTEXT_LABELS[details.fullProductContext],
      damageVisibilityReviewContext: DAMAGE_VISIBILITY_LABELS[details.damageVisibility],
      labelContextSummary: labelContextSummaryFor(result),
      purchaseOrOrderMatchNeeded: details.purchaseOrReceiptMatchNeeded,
      requestedAdditionalViews: details.requestedAdditionalViews.map((view) => REQUESTED_VIEW_LABELS[view]),
    },
    reviewSignals: mapReviewSignals(result.signals),
    limitations: limitationsFor(result),
    recommendedSupportAction: recommendedSupportActionFor(result),
    customerSafeWording: customerSafeWordingFor(result),
    externalVerification: {
      status: "Not externally verified",
      externalVerification: "Not performed",
      summary: "External verification was not performed. Product-photo details remain local review context only.",
    },
    privacy: {
      derivedSummaryOnly: true,
      rawPhotoBytesIncluded: false,
      imageBufferIncluded: false,
      rawExifIncluded: false,
      rawMetadataIncluded: false,
      originalFilenameIncluded: false,
      rawLabelValueIncluded: false,
      providerOutputIncluded: false,
      storageHandleIncluded: false,
      integrationHandleIncluded: false,
      caseQueueHandleIncluded: false,
    },
    isolation: {
      localAnalysisResultRequired: false,
      analyzeEvidenceFileInvoked: false,
      analyzerRoutingInvoked: false,
      uiUploadReportScoringParserFixturePathsInvoked: false,
    },
  };
}
