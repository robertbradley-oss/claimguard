import type {
  DamageVisibilityStatus,
  EvidenceConfidence,
  EvidenceMetadataSummary,
  EvidenceReviewStatus,
  EvidenceSourceKind,
  LocalSignalLevel,
  ProductPhotoAnalysisDetails,
  ProductPhotoConsistencySummary,
  ProductContextStatus,
  ProductPhotoEvidenceAnalysisResult,
  ProductLabelContext,
  ProductPhotoQualitySummary,
  ProductPhotoSubjectType,
  ReviewPriority,
  RequestedPhotoView,
  SharedEvidenceFindingGroup,
  SharedEvidenceSignal,
} from "@/lib/analysis/types";
import {
  buildProductPhotoFileSummary,
  buildProductPhotoLocalReviewSignals,
  buildProductPhotoReviewCompleteness,
  PRODUCT_PHOTO_COMPLETENESS_DEFAULTS,
  type ProductPhotoFileSummary,
  type ProductPhotoFileSummaryInput,
  type ProductPhotoReviewCompletenessInput,
  type ProductPhotoSafeReviewLabel,
} from "@/lib/analysis/product-photo-heuristics";

export type ProductPhotoDefaultInput = {
  subjectType?: ProductPhotoSubjectType;
  metadataSummary?: EvidenceMetadataSummary;
  requestedAdditionalViews?: RequestedPhotoView[];
};

export type ProductPhotoAnalysisDetailsInput = {
  subjectType?: ProductPhotoSubjectType;
  damageVisibility?: DamageVisibilityStatus;
  productContext?: ProductContextStatus;
  productLabelContext?: Partial<ProductLabelContext>;
  metadataSummary?: EvidenceMetadataSummary;
  fileSummary?: ProductPhotoFileSummary | ProductPhotoFileSummaryInput;
  requestedAdditionalViews?: RequestedPhotoView[];
  missingContext?: RequestedPhotoView[];
  purchaseOrReceiptMatchNeeded?: boolean;
  includeManualReviewRecommendation?: boolean;
};

export type ProductPhotoEvidenceAnalysisResultInput = ProductPhotoAnalysisDetailsInput & {
  evidenceLabel?: string;
  score?: number;
  localSignalLevel?: LocalSignalLevel;
  reviewPriority?: ReviewPriority;
  confidenceLevel?: EvidenceConfidence;
  reviewLabel?: EvidenceReviewStatus;
  evidenceSummary?: string;
  recommendedSupportAction?: string;
  customerSafeWording?: string;
  sourceKind?: EvidenceSourceKind;
};

export const PRODUCT_PHOTO_RESULT_BOUNDARY_STATUS = {
  boundary: "product-photo-result-boundary",
  devOnly: true,
  probeOnly: true,
  runtimeLive: false,
  analyzerInvoked: false,
  uiOrReportBehaviorExercised: false,
} as const;

export function buildDefaultProductPhotoMetadataSummary(): EvidenceMetadataSummary {
  return {
    fileTypeCategory: "image",
    fileSizeBucket: "unknown",
    dimensionsPresent: false,
    metadataContext: "Unavailable",
    captureTimestampPresent: "unknown",
    gpsContext: "unknown",
    editingSoftwareSignal: "unknown",
    rawExifOmitted: true,
    originalFilenameOmitted: true,
    notes: ["findings inconclusive"],
  };
}

function buildMetadataSummaryFromFileSummary(
  fileSummary: ProductPhotoFileSummary,
  metadataSummary?: EvidenceMetadataSummary,
): EvidenceMetadataSummary {
  return (
    metadataSummary ?? {
      fileTypeCategory: fileSummary.fileTypeCategory,
      fileSizeBucket: fileSummary.fileSizeBucket,
      dimensionsPresent: fileSummary.dimensionsPresent,
      dimensionsBucket: fileSummary.dimensionsBucket,
      metadataContext: fileSummary.metadataContext,
      captureTimestampPresent: "unknown",
      gpsContext: "unknown",
      editingSoftwareSignal: "unknown",
      rawExifOmitted: true,
      originalFilenameOmitted: true,
      notes: [fileSummary.summary],
    }
  );
}

function buildQualitySummaryFromFileSummary(fileSummary: ProductPhotoFileSummary): ProductPhotoQualitySummary {
  const qualityLevel: ProductPhotoQualitySummary["qualityLevel"] =
    fileSummary.qualityLimits.length === 0
      ? "Usable"
      : fileSummary.dimensionsPresent && fileSummary.fileTypeCategory !== "document"
        ? "Limited"
        : "Inconclusive";

  return {
    qualityLevel,
    qualityLimits: fileSummary.qualityLimits,
    summary: fileSummary.summary,
  };
}

export function buildDefaultProductPhotoQualitySummary(): ProductPhotoQualitySummary {
  return {
    qualityLevel: "Inconclusive",
    qualityLimits: ["photo quality limits review"],
    summary: "photo quality limits review",
  };
}

function buildConsistencySummaryFromLocalSignals(
  signals: ProductPhotoConsistencySummary["signals"],
): ProductPhotoConsistencySummary {
  return {
    status: signals.length > 0 ? "Needs manual review" : "No material signal",
    signals,
    summary: signals.length > 0 ? "local-only review signal" : "findings inconclusive",
  };
}

export function buildDefaultProductPhotoConsistencySummary(): ProductPhotoConsistencySummary {
  return {
    status: "Inconclusive",
    signals: [],
    summary: "image consistency signal",
  };
}

function productContextFromReviewState(
  productContext: ProductContextStatus | undefined,
  missingContext: RequestedPhotoView[],
): ProductContextStatus {
  if (productContext) {
    return productContext;
  }

  if (missingContext.includes("wider-product-photo")) {
    return "missing";
  }

  return missingContext.length === 0 ? "complete" : "partial";
}

function buildProductLabelContext(
  input: ProductPhotoAnalysisDetailsInput,
  missingContext: RequestedPhotoView[],
): ProductLabelContext {
  const labelContext = input.productLabelContext;
  const labelNotes: ProductPhotoSafeReviewLabel[] = missingContext.includes("serial-or-model-label")
    ? ["requested view incomplete"]
    : ["local-only review signal"];

  return {
    serialOrModelContextPresent: labelContext?.serialOrModelContextPresent ?? false,
    labelReadable: labelContext?.labelReadable ?? "unknown",
    rawValueOmitted: true,
    notes: labelContext?.notes ?? labelNotes,
  };
}

export function buildProductPhotoAnalysisDetails(
  input: ProductPhotoAnalysisDetailsInput = {},
): ProductPhotoAnalysisDetails {
  const requestedAdditionalViews =
    input.requestedAdditionalViews ?? PRODUCT_PHOTO_COMPLETENESS_DEFAULTS.requestedAdditionalViews;
  const purchaseOrReceiptMatchNeeded =
    input.purchaseOrReceiptMatchNeeded ?? requestedAdditionalViews.includes("proof-of-purchase-match");
  const metadataSummary =
    input.metadataSummary ?? (input.fileSummary ? undefined : buildDefaultProductPhotoMetadataSummary());
  const fileSummary = buildProductPhotoFileSummary(
    input.fileSummary ?? {
      metadataSummary,
    },
  );
  const reviewCompletenessInput: ProductPhotoReviewCompletenessInput = {
    subjectType: input.subjectType,
    requestedAdditionalViews,
    missingContext: input.missingContext,
    productContext: input.productContext,
    purchaseOrReceiptMatchNeeded,
  };
  const reviewCompleteness = buildProductPhotoReviewCompleteness(reviewCompletenessInput);
  const localReviewSignals = buildProductPhotoLocalReviewSignals({
    fileSummary,
    reviewCompleteness,
    includeManualReviewRecommendation: input.includeManualReviewRecommendation,
  });
  const manualReviewRecommendation = localReviewSignals.some(
    (signal) => signal.id === "product-photo-manual-review-recommended",
  )
    ? "manual review recommended"
    : "local-only review signal";

  return {
    subjectType: input.subjectType ?? PRODUCT_PHOTO_COMPLETENESS_DEFAULTS.subjectType,
    damageVisibility: input.damageVisibility ?? PRODUCT_PHOTO_COMPLETENESS_DEFAULTS.damageVisibility,
    fullProductContext: productContextFromReviewState(input.productContext, reviewCompleteness.missingContext),
    productLabelContext: buildProductLabelContext(input, reviewCompleteness.missingContext),
    imageQuality: buildQualitySummaryFromFileSummary(fileSummary),
    imageConsistency: buildConsistencySummaryFromLocalSignals(localReviewSignals),
    metadataContext: {
      metadataSummary: buildMetadataSummaryFromFileSummary(fileSummary, metadataSummary),
      contextOnly: true,
      summary: fileSummary.metadataContext === "Available" ? "local-only review signal" : "metadata context limited",
    },
    reviewCompleteness,
    purchaseOrReceiptMatchNeeded,
    requestedAdditionalViews,
    manualReviewRecommendation,
  };
}

export function buildDefaultProductPhotoAnalysisDetails(
  input: ProductPhotoDefaultInput = {},
): ProductPhotoAnalysisDetails {
  return buildProductPhotoAnalysisDetails(input);
}

function clampProductPhotoScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function defaultProductPhotoScoreFor(details: ProductPhotoAnalysisDetails) {
  if (details.reviewCompleteness.status === "complete" && details.imageQuality.qualityLevel === "Clear") {
    return 78;
  }

  if (details.reviewCompleteness.status === "partial" || details.imageQuality.qualityLevel === "Usable") {
    return 64;
  }

  return 56;
}

function defaultProductPhotoSignalLevelFor(signals: SharedEvidenceSignal[]): LocalSignalLevel {
  if (signals.some((signal) => signal.severity === "High")) {
    return "High";
  }

  if (signals.some((signal) => signal.severity === "Medium")) {
    return "Medium";
  }

  if (signals.some((signal) => signal.severity === "Low")) {
    return "Low";
  }

  return "None";
}

function defaultProductPhotoReviewPriorityFor(details: ProductPhotoAnalysisDetails): ReviewPriority {
  if (details.reviewCompleteness.status === "complete" && !details.purchaseOrReceiptMatchNeeded) {
    return "Review";
  }

  return "Manual review";
}

function defaultProductPhotoConfidenceFor(details: ProductPhotoAnalysisDetails): EvidenceConfidence {
  if (details.reviewCompleteness.status === "complete" && details.imageQuality.qualityLevel === "Clear") {
    return "Medium confidence";
  }

  return "Low confidence";
}

function defaultProductPhotoReviewLabelFor(details: ProductPhotoAnalysisDetails): EvidenceReviewStatus {
  return details.reviewCompleteness.status === "complete" ? "Review recommended" : "Manual review recommended";
}

function buildProductPhotoFindingGroups(
  details: ProductPhotoAnalysisDetails,
  signals: SharedEvidenceSignal[],
): SharedEvidenceFindingGroup[] {
  const signalIds = signals.map((signal) => signal.id);

  return [
    {
      category: "Photo Context",
      status: details.fullProductContext === "complete" ? "Inconclusive" : "Review recommended",
      summary:
        details.fullProductContext === "complete"
          ? "Product context is available for local support review."
          : "Additional product context may be needed for support review.",
      details: [
        {
          label: "Subject type",
          value: details.subjectType,
          status: "Inconclusive",
        },
        {
          label: "Product context",
          value: details.fullProductContext,
          status: details.fullProductContext === "complete" ? "Inconclusive" : "Review recommended",
        },
        {
          label: "Damage visibility",
          value: details.damageVisibility,
          status: details.damageVisibility === "clearly-visible" ? "Inconclusive" : "Review recommended",
        },
      ],
      relatedSignalIds: signalIds,
    },
    {
      category: "Image Quality",
      status:
        details.imageQuality.qualityLevel === "Clear" || details.imageQuality.qualityLevel === "Usable"
          ? "Inconclusive"
          : "Review recommended",
      summary: details.imageQuality.summary,
      details: [
        {
          label: "Quality level",
          value: details.imageQuality.qualityLevel,
          status:
            details.imageQuality.qualityLevel === "Clear" || details.imageQuality.qualityLevel === "Usable"
              ? "Inconclusive"
              : "Review recommended",
        },
      ],
      relatedSignalIds: signalIds,
    },
    {
      category: "Metadata Context",
      status: details.metadataContext.metadataSummary.metadataContext === "Available" ? "Inconclusive" : "Review recommended",
      summary: details.metadataContext.summary,
      details: [
        {
          label: "Metadata context",
          value: details.metadataContext.metadataSummary.metadataContext,
          status:
            details.metadataContext.metadataSummary.metadataContext === "Available"
              ? "Inconclusive"
              : "Review recommended",
        },
      ],
      relatedSignalIds: signalIds,
    },
    {
      category: "Purchase Match",
      status: details.purchaseOrReceiptMatchNeeded ? "Review recommended" : "Inconclusive",
      summary: details.purchaseOrReceiptMatchNeeded
        ? "Receipt or order matching may be needed before support review is complete."
        : "Receipt or order matching is not requested by this local result boundary.",
      details: [
        {
          label: "Receipt or order match needed",
          value: details.purchaseOrReceiptMatchNeeded ? "yes" : "no",
          status: details.purchaseOrReceiptMatchNeeded ? "Review recommended" : "Inconclusive",
        },
      ],
      relatedSignalIds: signalIds,
    },
    {
      category: "Recommendation",
      status: details.manualReviewRecommendation === "manual review recommended" ? "Manual review recommended" : "Review recommended",
      summary: details.manualReviewRecommendation,
      details: [
        {
          label: "Requested additional views",
          value: details.requestedAdditionalViews.join(", ") || "none",
          status: details.requestedAdditionalViews.length > 0 ? "Review recommended" : "Inconclusive",
        },
      ],
      relatedSignalIds: signalIds,
    },
  ];
}

function defaultProductPhotoEvidenceSummary(details: ProductPhotoAnalysisDetails, signals: SharedEvidenceSignal[]) {
  return `Product-photo result is local review context only. ${signals.length} review signal${
    signals.length === 1 ? "" : "s"
  } prepared, with external verification not performed.`;
}

function defaultProductPhotoSupportAction(details: ProductPhotoAnalysisDetails) {
  if (details.requestedAdditionalViews.length > 0) {
    return "Manual review recommended. Request only the additional product view or receipt/order match needed to complete support review.";
  }

  return "Manual review recommended. Compare the product-photo context with available receipt or order evidence before completing support review.";
}

function defaultProductPhotoCustomerSafeWording(details: ProductPhotoAnalysisDetails) {
  if (details.requestedAdditionalViews.includes("wider-product-photo")) {
    return "Thanks for the photo. We may need one wider product view to complete the review.";
  }

  return "Thanks for the photo. We are reviewing it with the available order information and will follow up if more context is needed.";
}

export function prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary(
  input: ProductPhotoEvidenceAnalysisResultInput = {},
): ProductPhotoEvidenceAnalysisResult {
  const details = buildProductPhotoAnalysisDetails(input);
  const signals = details.imageConsistency.signals;
  const score = clampProductPhotoScore(input.score ?? defaultProductPhotoScoreFor(details));

  return {
    module: "productPhoto",
    evidenceType: "product-photo",
    evidenceLabel: input.evidenceLabel ?? "Product photo",
    sourceKind: input.sourceKind ?? "manual-review-context",
    scoreLabel: "Evidence Reliability Score",
    evidenceReliabilityScore: {
      label: "Evidence Reliability Score",
      value: score,
      meaning: "Local product-photo evidence quality and review readiness only.",
      scoreScope: "Local evidence quality and review readiness only",
    },
    score,
    scoreMeaning: {
      highScore: "High score means the product-photo context is more useful for local support review.",
      lowOrMediumScore:
        "Low or medium score means image quality, product context, or receipt/order matching may require manual review.",
      safetyNote: "High score does not prove the product photo or claim. Manual review may still be required.",
    },
    localSignalLevel: input.localSignalLevel ?? defaultProductPhotoSignalLevelFor(signals),
    reviewPriority: input.reviewPriority ?? defaultProductPhotoReviewPriorityFor(details),
    confidenceLevel: input.confidenceLevel ?? defaultProductPhotoConfidenceFor(details),
    reviewLabel: input.reviewLabel ?? defaultProductPhotoReviewLabelFor(details),
    verificationStatus: {
      status: "Not externally verified",
      externalVerification: "Not performed",
      method: "Local evidence analysis only",
      summary: "External verification was not performed. Product-photo details remain local review context only.",
    },
    externalVerification: "Not performed",
    signals,
    findingGroups: buildProductPhotoFindingGroups(details, signals),
    evidenceSummary: input.evidenceSummary ?? defaultProductPhotoEvidenceSummary(details, signals),
    recommendedSupportAction: input.recommendedSupportAction ?? defaultProductPhotoSupportAction(details),
    customerSafeWording: input.customerSafeWording ?? defaultProductPhotoCustomerSafeWording(details),
    privacySafeMetadataSummary: details.metadataContext.metadataSummary,
    moduleDetails: {
      module: "productPhoto",
      productPhoto: details,
    },
  };
}
