import {
  prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary,
  PRODUCT_PHOTO_RESULT_BOUNDARY_STATUS,
  type ProductPhotoEvidenceAnalysisResultInput,
} from "@/lib/analysis/product-photo-analyzer";
import type {
  EvidenceAnalysisResult,
  EvidenceMetadataSummary,
  LocalAnalysisResult,
  ProductPhotoEvidenceAnalysisResult,
} from "@/lib/analysis/types";

type HasAnyKey<T, TKey extends PropertyKey> = Extract<keyof T, TKey> extends never ? false : true;

type ReceiptOnlyResultKeys =
  | "ocr"
  | "receipt"
  | "metadata"
  | "imageHeuristics"
  | "scoreBreakdown"
  | "internalStructureConfidence";

type FinalDecisionLikeKeys =
  | "isFinalDecision"
  | "claimOutcome"
  | "customerIntent"
  | "automaticDisposition"
  | "externalDecision"
  | "evidenceDisposition";

type PrivateEvidenceOrIntegrationLeakKeys =
  | "fileBytes"
  | "imageBuffer"
  | "rawExif"
  | "rawMetadata"
  | "privateEvidence"
  | "provider"
  | "storage"
  | "integration"
  | "caseQueue";

type LocalAnalysisResultStillReceiptOnly = LocalAnalysisResult extends {
  ocr: unknown;
  receipt: unknown;
  scoreBreakdown: unknown;
  externalVerification: "Not performed";
}
  ? true
  : false;

const syntheticBoundaryMetadataSummary = {
  fileTypeCategory: "image",
  fileSizeBucket: "medium",
  dimensionsPresent: true,
  dimensionsBucket: "large",
  metadataContext: "Limited",
  captureTimestampPresent: "unknown",
  gpsContext: "unknown",
  editingSoftwareSignal: "unknown",
  rawExifOmitted: true,
  originalFilenameOmitted: true,
  notes: ["metadata context limited"],
} satisfies EvidenceMetadataSummary;

const productPhotoBoundaryInput = {
  subjectType: "damage-close-up",
  damageVisibility: "inconclusive",
  productContext: "partial",
  metadataSummary: syntheticBoundaryMetadataSummary,
  requestedAdditionalViews: ["wider-product-photo", "proof-of-purchase-match"],
  missingContext: ["wider-product-photo", "proof-of-purchase-match"],
  purchaseOrReceiptMatchNeeded: true,
  includeManualReviewRecommendation: true,
} satisfies ProductPhotoEvidenceAnalysisResultInput;

const productPhotoBoundaryResult =
  prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary(productPhotoBoundaryInput);

const productPhotoResultShape = productPhotoBoundaryResult satisfies ProductPhotoEvidenceAnalysisResult;
const sharedResultShape = productPhotoBoundaryResult satisfies EvidenceAnalysisResult;
const localAnalysisResultStillReceiptOnly = true satisfies LocalAnalysisResultStillReceiptOnly;
const productPhotoDoesNotRequireReceiptOnlyFields =
  false satisfies HasAnyKey<ProductPhotoEvidenceAnalysisResult, ReceiptOnlyResultKeys>;
const productPhotoDoesNotExposeFinalDecisionFields =
  false satisfies HasAnyKey<ProductPhotoEvidenceAnalysisResult, FinalDecisionLikeKeys>;
const productPhotoDoesNotExposePrivateEvidenceOrIntegrationFields =
  false satisfies HasAnyKey<ProductPhotoEvidenceAnalysisResult, PrivateEvidenceOrIntegrationLeakKeys>;

function hasManualReviewOnlyWording(result: ProductPhotoEvidenceAnalysisResult) {
  return (
    result.reviewLabel === "Manual review recommended" &&
    result.recommendedSupportAction.toLowerCase().includes("manual review recommended") &&
    !result.customerSafeWording.toLowerCase().includes("complete the claim")
  );
}

export const PRODUCT_PHOTO_RESULT_BOUNDARY_DEVELOPER_PROBE = {
  boundary: PRODUCT_PHOTO_RESULT_BOUNDARY_STATUS,
  cases: {
    productPhoto: productPhotoBoundaryResult,
  },
  expectations: {
    resultShape: {
      productPhotoResultShape,
      sharedResultShape,
      module: productPhotoBoundaryResult.module,
      evidenceType: productPhotoBoundaryResult.evidenceType,
      scoreLabel: productPhotoBoundaryResult.scoreLabel,
      scoreScope: productPhotoBoundaryResult.evidenceReliabilityScore.scoreScope,
      moduleDetails: productPhotoBoundaryResult.moduleDetails.module,
      productPhotoDetailsNested: "productPhoto" in productPhotoBoundaryResult.moduleDetails,
    },
    nonLiveBoundary: {
      devOnly: PRODUCT_PHOTO_RESULT_BOUNDARY_STATUS.devOnly,
      probeOnly: PRODUCT_PHOTO_RESULT_BOUNDARY_STATUS.probeOnly,
      runtimeLive: PRODUCT_PHOTO_RESULT_BOUNDARY_STATUS.runtimeLive,
      analyzerInvoked: PRODUCT_PHOTO_RESULT_BOUNDARY_STATUS.analyzerInvoked,
      uiOrReportBehaviorExercised: PRODUCT_PHOTO_RESULT_BOUNDARY_STATUS.uiOrReportBehaviorExercised,
    },
    receiptPathIsolation: {
      localAnalysisResultStillReceiptOnly,
      productPhotoDoesNotRequireReceiptOnlyFields,
      receiptOnlyFieldsRequiredByProductPhoto: false,
    },
    safety: {
      externalVerification: productPhotoBoundaryResult.externalVerification,
      verificationStatus: productPhotoBoundaryResult.verificationStatus.status,
      verificationMethod: productPhotoBoundaryResult.verificationStatus.method,
      verificationSummaryStatesNotPerformed:
        productPhotoBoundaryResult.verificationStatus.summary.includes("External verification was not performed"),
      scoreSafetyNoteDoesNotProve:
        productPhotoBoundaryResult.scoreMeaning.safetyNote.toLowerCase().includes("does not prove"),
      manualReviewOnlyWording: hasManualReviewOnlyWording(productPhotoBoundaryResult),
      productPhotoDoesNotExposeFinalDecisionFields,
    },
    privacy: {
      sampleDataIsSynthetic: true,
      rawExifOmitted: productPhotoBoundaryResult.privacySafeMetadataSummary.rawExifOmitted,
      originalFilenameOmitted: productPhotoBoundaryResult.privacySafeMetadataSummary.originalFilenameOmitted,
      productLabelRawValueOmitted:
        productPhotoBoundaryResult.moduleDetails.productPhoto.productLabelContext.rawValueOmitted,
      productPhotoDoesNotExposePrivateEvidenceOrIntegrationFields,
      includesFileBytes: false,
      includesImageBuffer: false,
      includesRawExifObject: false,
      includesProviderHandle: false,
      includesStorageHandle: false,
      includesIntegrationHandle: false,
      includesCaseQueueHandle: false,
    },
    importBoundary: {
      importsLiveAnalyzer: false,
      importsAnalyzerRouting: false,
      importsUiUploadReportScoringParserFixtures: false,
      importsProvidersStorageIntegrationsCaseQueues: false,
      invokesAnalyzeEvidenceFile: false,
      invokesAnalyzerRouting: false,
      invokesUi: false,
      invokesUpload: false,
      invokesReportMapping: false,
      invokesScoring: false,
      invokesParser: false,
      invokesFixtures: false,
      invokesProvidersStorageIntegrationsCaseQueues: false,
    },
  },
} as const;
