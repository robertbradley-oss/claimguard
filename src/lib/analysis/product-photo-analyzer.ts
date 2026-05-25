import type {
  DamageVisibilityStatus,
  EvidenceMetadataSummary,
  ProductPhotoAnalysisDetails,
  ProductPhotoConsistencySummary,
  ProductContextStatus,
  ProductLabelContext,
  ProductPhotoQualitySummary,
  ProductPhotoSubjectType,
  RequestedPhotoView,
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
