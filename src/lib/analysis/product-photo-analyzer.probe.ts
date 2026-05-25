import { buildProductPhotoAnalysisDetails } from "@/lib/analysis/product-photo-analyzer";
import type { EvidenceMetadataSummary } from "@/lib/analysis/types";

const imageMetadataAvailable = {
  fileTypeCategory: "image",
  fileSizeBucket: "medium",
  dimensionsPresent: true,
  dimensionsBucket: "large",
  dimensions: {
    width: 1800,
    height: 1200,
  },
  metadataContext: "Available",
  captureTimestampPresent: true,
  gpsContext: "stripped",
  editingSoftwareSignal: "not-present",
  rawExifOmitted: true,
  originalFilenameOmitted: true,
  notes: ["local-only review signal"],
} satisfies EvidenceMetadataSummary;

const imageMetadataLimited = {
  fileTypeCategory: "image",
  fileSizeBucket: "small",
  dimensionsPresent: true,
  dimensionsBucket: "small",
  metadataContext: "Limited",
  captureTimestampPresent: "unknown",
  gpsContext: "unknown",
  editingSoftwareSignal: "unknown",
  rawExifOmitted: true,
  originalFilenameOmitted: true,
  notes: ["metadata context limited"],
} satisfies EvidenceMetadataSummary;

const completeProductPhotoDetails = buildProductPhotoAnalysisDetails({
  subjectType: "full-product-context",
  productContext: "complete",
  metadataSummary: imageMetadataAvailable,
  requestedAdditionalViews: [],
  missingContext: [],
  purchaseOrReceiptMatchNeeded: false,
  includeManualReviewRecommendation: false,
});

const incompleteProductPhotoDetails = buildProductPhotoAnalysisDetails({
  subjectType: "damage-close-up",
  damageVisibility: "inconclusive",
  productContext: "missing",
  metadataSummary: imageMetadataLimited,
  requestedAdditionalViews: ["wider-product-photo", "clearer-damage-close-up", "proof-of-purchase-match"],
  missingContext: ["wider-product-photo", "clearer-damage-close-up", "proof-of-purchase-match"],
  purchaseOrReceiptMatchNeeded: true,
});

const nonImageProductPhotoDetails = buildProductPhotoAnalysisDetails({
  subjectType: "mixed-evidence-image",
  fileSummary: {
    fileTypeCategory: "document",
    fileSizeBucket: "small",
    dimensionsPresent: false,
    metadataContext: "Unavailable",
    qualityLimits: ["photo quality limits review", "metadata context limited"],
  },
  requestedAdditionalViews: ["wider-product-photo"],
  missingContext: ["wider-product-photo"],
  purchaseOrReceiptMatchNeeded: false,
});

export const PRODUCT_PHOTO_ANALYZER_DEVELOPER_PROBE = {
  completeProductPhotoDetails,
  incompleteProductPhotoDetails,
  nonImageProductPhotoDetails,
  localReviewSignalCounts: {
    complete: completeProductPhotoDetails.imageConsistency.signals.length,
    incomplete: incompleteProductPhotoDetails.imageConsistency.signals.length,
    nonImage: nonImageProductPhotoDetails.imageConsistency.signals.length,
  },
  reviewStates: {
    complete: completeProductPhotoDetails.reviewCompleteness.status,
    incomplete: incompleteProductPhotoDetails.reviewCompleteness.status,
    nonImage: nonImageProductPhotoDetails.reviewCompleteness.status,
  },
} as const;
