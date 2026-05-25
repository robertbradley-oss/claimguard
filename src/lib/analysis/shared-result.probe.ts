import type {
  EvidenceAnalysisResult,
  EvidenceMetadataSummary,
  ExtractedReceiptInfo,
  LocalAnalysisResult,
  OcrExtraction,
  ProductPhotoEvidenceAnalysisResult,
  ReceiptAnalysisDetails,
  ReceiptEvidenceAnalysisResult,
  ScoreBreakdown,
  VerificationStatus,
} from "@/lib/analysis/types";

type HasAnyKey<T, TKey extends PropertyKey> = Extract<keyof T, TKey> extends never ? false : true;

type ReceiptOnlyResultKeys =
  | "ocr"
  | "receipt"
  | "metadata"
  | "imageHeuristics"
  | "scoreBreakdown"
  | "internalStructureConfidence";

type UnsafeFinalJudgmentKeys =
  | "isFinalDecision"
  | "claimOutcome"
  | "customerIntent"
  | "automaticDisposition"
  | "externalDecision"
  | "evidenceDisposition";

type LiveRuntimeOrPrivateEvidenceKeys =
  | "analyzeEvidenceFile"
  | "ui"
  | "upload"
  | "reportMapping"
  | "scoring"
  | "parser"
  | "fixture"
  | "provider"
  | "storage"
  | "integration"
  | "caseQueue"
  | "fileBytes"
  | "imageBuffer"
  | "rawExif"
  | "rawMetadata";

type LocalAnalysisResultStillReceiptShaped = LocalAnalysisResult extends {
  scoreLabel: "Evidence Reliability Score";
  verificationStatus: VerificationStatus;
  externalVerification: "Not performed";
  ocr: OcrExtraction;
  receipt: ExtractedReceiptInfo;
  scoreBreakdown: ScoreBreakdown;
}
  ? true
  : false;

type ReceiptEnvelopeKeepsReceiptDetails =
  ReceiptEvidenceAnalysisResult["moduleDetails"] extends { module: "receipt"; receipt: ReceiptAnalysisDetails }
    ? true
    : false;

type ProductPhotoEnvelopeKeepsProductPhotoDetails =
  ProductPhotoEvidenceAnalysisResult["moduleDetails"] extends {
    module: "productPhoto";
    productPhoto: ProductPhotoEvidenceAnalysisResult["moduleDetails"]["productPhoto"];
  }
    ? true
    : false;

const privacySafeMetadataSummary = {
  fileTypeCategory: "image",
  fileSizeBucket: "medium",
  dimensionsPresent: true,
  dimensionsBucket: "large",
  dimensions: {
    width: 1800,
    height: 1200,
  },
  metadataContext: "Limited",
  captureTimestampPresent: "unknown",
  gpsContext: "unknown",
  editingSoftwareSignal: "unknown",
  rawExifOmitted: true,
  originalFilenameOmitted: true,
  notes: ["metadata context limited"],
} satisfies EvidenceMetadataSummary;

const photoContextSignal = {
  id: "product-photo-context-incomplete",
  title: "Product context incomplete",
  category: "Photo Context",
  severity: "Medium",
  confidence: 64,
  evidenceSource: "Product photo module details",
  explanation: "Current photo context may be incomplete for support review.",
  recommendation: "Request wider product context before resolving the case.",
} satisfies ProductPhotoEvidenceAnalysisResult["signals"][number];

const productPhotoSharedResult = {
  module: "productPhoto",
  evidenceType: "product-photo",
  evidenceLabel: "Product photo",
  sourceKind: "manual-review-context",
  scoreLabel: "Evidence Reliability Score",
  evidenceReliabilityScore: {
    label: "Evidence Reliability Score",
    value: 62,
    meaning: "Local product-photo evidence quality and review readiness only.",
    scoreScope: "Local evidence quality and review readiness only",
  },
  score: 62,
  scoreMeaning: {
    highScore: "High score means the product-photo context is more useful for local support review.",
    lowOrMediumScore:
      "Low or medium score means image quality, product context, or purchase matching may require manual review.",
    safetyNote: "High score does not prove the product photo or claim. Manual review may still be required.",
  },
  localSignalLevel: "Medium",
  reviewPriority: "Manual review",
  confidenceLevel: "Low confidence",
  reviewLabel: "Manual review recommended",
  verificationStatus: {
    status: "Not externally verified",
    externalVerification: "Not performed",
    method: "Local evidence analysis only",
    summary: "External verification was not performed. Product-photo details remain local review context only.",
  },
  externalVerification: "Not performed",
  signals: [photoContextSignal],
  findingGroups: [
    {
      category: "Photo Context",
      status: "Review recommended",
      summary: "Additional product context may be needed for review.",
      details: [
        {
          label: "Requested view",
          value: "wider product photo",
          status: "Review recommended",
        },
      ],
      relatedSignalIds: [photoContextSignal.id],
    },
  ],
  evidenceSummary: "Product-photo evidence can be represented without receipt OCR or parser fields.",
  recommendedSupportAction:
    "Manual review recommended. Request wider product context and proof-of-purchase match if needed.",
  customerSafeWording:
    "Thanks for the photo. We may need one wider product view and proof-of-purchase matching to complete the review.",
  privacySafeMetadataSummary,
  moduleDetails: {
    module: "productPhoto",
    productPhoto: {
      subjectType: "damage-close-up",
      damageVisibility: "inconclusive",
      fullProductContext: "partial",
      productLabelContext: {
        serialOrModelContextPresent: false,
        labelReadable: "unknown",
        rawValueOmitted: true,
        notes: ["requested view incomplete"],
      },
      imageQuality: {
        qualityLevel: "Limited",
        qualityLimits: ["photo quality limits review"],
        summary: "photo quality limits review",
      },
      imageConsistency: {
        status: "Needs manual review",
        signals: [photoContextSignal],
        summary: "image consistency needs manual review",
      },
      metadataContext: {
        metadataSummary: privacySafeMetadataSummary,
        contextOnly: true,
        summary: "metadata context limited",
      },
      reviewCompleteness: {
        status: "partial",
        missingContext: ["wider-product-photo", "proof-of-purchase-match"],
        summary: "additional product and purchase context may be needed",
      },
      purchaseOrReceiptMatchNeeded: true,
      requestedAdditionalViews: ["wider-product-photo", "proof-of-purchase-match"],
      manualReviewRecommendation: "manual review recommended",
    },
  },
} satisfies ProductPhotoEvidenceAnalysisResult;

const localReceiptContractStillUsable = true satisfies LocalAnalysisResultStillReceiptShaped;
const sharedEnvelopeRepresentsReceipt = true satisfies ReceiptEnvelopeKeepsReceiptDetails;
const sharedEnvelopeRepresentsProductPhoto = true satisfies ProductPhotoEnvelopeKeepsProductPhotoDetails;
const productPhotoDoesNotRequireReceiptOnlyFields =
  false satisfies HasAnyKey<ProductPhotoEvidenceAnalysisResult, ReceiptOnlyResultKeys>;
const sharedEnvelopeAvoidsUnsafeFinalJudgmentFields =
  false satisfies HasAnyKey<EvidenceAnalysisResult, UnsafeFinalJudgmentKeys>;
const sharedEnvelopeAvoidsRuntimeAndPrivateEvidenceFields =
  false satisfies HasAnyKey<EvidenceAnalysisResult, LiveRuntimeOrPrivateEvidenceKeys>;

function hasManualReviewOnlySharedResultWording(result: ProductPhotoEvidenceAnalysisResult) {
  return (
    result.reviewLabel === "Manual review recommended" &&
    result.recommendedSupportAction.toLowerCase().includes("manual review recommended") &&
    result.evidenceReliabilityScore.scoreScope === "Local evidence quality and review readiness only" &&
    result.scoreMeaning.safetyNote.toLowerCase().includes("does not prove") &&
    result.verificationStatus.summary.includes("External verification was not performed")
  );
}

export const SHARED_RESULT_DEVELOPER_PROBE = {
  localReceiptContractStillUsable,
  sharedEnvelopeRepresentsReceipt,
  sharedEnvelopeRepresentsProductPhoto,
  productPhotoDoesNotRequireReceiptOnlyFields,
  sharedEnvelopeAvoidsUnsafeFinalJudgmentFields,
  sharedEnvelopeAvoidsRuntimeAndPrivateEvidenceFields,
  manualReviewOnlyWording: hasManualReviewOnlySharedResultWording(productPhotoSharedResult),
  productPhotoExternalVerification: productPhotoSharedResult.externalVerification,
  productPhotoVerificationStatus: productPhotoSharedResult.verificationStatus.status,
  productPhotoModule: productPhotoSharedResult.moduleDetails.module,
  productPhotoDetailsNested: "productPhoto" in productPhotoSharedResult.moduleDetails,
  receiptOnlyFieldsRequiredByProductPhoto: false,
  importsLimitedToSharedTypes: true,
  isolationBoundary: {
    invokesAnalyzeEvidenceFile: false,
    invokesAnalyzerRouting: false,
    invokesUi: false,
    invokesUpload: false,
    invokesReportMapping: false,
    invokesScoring: false,
    invokesParser: false,
    invokesFixtures: false,
    invokesProvidersStorageIntegrationsCaseQueues: false,
    sampleDataIsSynthetic: true,
    includesFileBytes: false,
    includesImageBuffer: false,
    includesRawExifObject: false,
    includesProviderHandle: false,
    includesStorageHandle: false,
    includesIntegrationHandle: false,
    includesCaseQueueHandle: false,
  },
} as const;
