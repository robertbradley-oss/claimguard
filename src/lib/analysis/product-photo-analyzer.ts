import type {
  EvidenceMetadataSummary,
  ProductPhotoAnalysisDetails,
  ProductPhotoConsistencySummary,
  ProductPhotoQualitySummary,
  ProductPhotoSubjectType,
  RequestedPhotoView,
} from "@/lib/analysis/types";

export type ProductPhotoDefaultInput = {
  subjectType?: ProductPhotoSubjectType;
  metadataSummary?: EvidenceMetadataSummary;
  requestedAdditionalViews?: RequestedPhotoView[];
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

export function buildDefaultProductPhotoQualitySummary(): ProductPhotoQualitySummary {
  return {
    qualityLevel: "Inconclusive",
    qualityLimits: ["photo quality limits review"],
    summary: "photo quality limits review",
  };
}

export function buildDefaultProductPhotoConsistencySummary(): ProductPhotoConsistencySummary {
  return {
    status: "Inconclusive",
    signals: [],
    summary: "image consistency signal",
  };
}

export function buildDefaultProductPhotoAnalysisDetails(
  input: ProductPhotoDefaultInput = {},
): ProductPhotoAnalysisDetails {
  const requestedAdditionalViews = input.requestedAdditionalViews ?? [
    "wider-product-photo",
    "clearer-damage-close-up",
    "proof-of-purchase-match",
  ];

  return {
    subjectType: input.subjectType ?? "damage-close-up",
    damageVisibility: "inconclusive",
    fullProductContext: "inconclusive",
    productLabelContext: {
      serialOrModelContextPresent: false,
      labelReadable: "unknown",
      rawValueOmitted: true,
      notes: ["product context incomplete"],
    },
    imageQuality: buildDefaultProductPhotoQualitySummary(),
    imageConsistency: buildDefaultProductPhotoConsistencySummary(),
    metadataContext: {
      metadataSummary: input.metadataSummary ?? buildDefaultProductPhotoMetadataSummary(),
      contextOnly: true,
      summary: "findings inconclusive",
    },
    reviewCompleteness: {
      status: "inconclusive",
      missingContext: requestedAdditionalViews,
      summary: "product context incomplete",
    },
    purchaseOrReceiptMatchNeeded: true,
    requestedAdditionalViews,
    manualReviewRecommendation: "manual review recommended",
  };
}
