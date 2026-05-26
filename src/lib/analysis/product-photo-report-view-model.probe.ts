import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary,
  type ProductPhotoEvidenceAnalysisResultInput,
} from "@/lib/analysis/product-photo-analyzer";
import {
  mapProductPhotoAnalysisToReportViewModel,
  PRODUCT_PHOTO_REPORT_VIEW_MODEL_BOUNDARY_STATUS,
  type ProductPhotoReportViewModel,
} from "@/lib/analysis/product-photo-report-view-model";
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

type RawPhotoOrPrivateEvidenceKeys =
  | "fileBytes"
  | "imageBuffer"
  | "rawExif"
  | "rawMetadata"
  | "originalFilename"
  | "rawLabelValue"
  | "privateEvidence"
  | "providerOutput"
  | "storageId"
  | "integrationId"
  | "caseQueueId";

type FinalOutcomeKeys =
  | "claimOutcome"
  | "customerIntent"
  | "automaticDisposition"
  | "externalDecision"
  | "policyDisposition";

type LocalAnalysisResultStillReceiptOnly = LocalAnalysisResult extends {
  ocr: unknown;
  receipt: unknown;
  scoreBreakdown: unknown;
  externalVerification: "Not performed";
}
  ? true
  : false;

const syntheticMappingMetadataSummary = {
  fileTypeCategory: "image",
  fileSizeBucket: "medium",
  dimensionsPresent: true,
  dimensionsBucket: "large",
  dimensions: {
    width: 4032,
    height: 3024,
  },
  metadataContext: "Limited",
  captureTimestampPresent: "unknown",
  gpsContext: "unknown",
  editingSoftwareSignal: "unknown",
  rawExifOmitted: true,
  originalFilenameOmitted: true,
  notes: ["synthetic mapping probe metadata note RAW_EXIF_GPS_SENTINEL"],
} satisfies EvidenceMetadataSummary;

const completeContextMetadataSummary = {
  fileTypeCategory: "image",
  fileSizeBucket: "medium",
  dimensionsPresent: true,
  dimensionsBucket: "large",
  metadataContext: "Available",
  captureTimestampPresent: "unknown",
  gpsContext: "unknown",
  editingSoftwareSignal: "unknown",
  rawExifOmitted: true,
  originalFilenameOmitted: true,
  notes: ["synthetic complete-context metadata note"],
} satisfies EvidenceMetadataSummary;

const missingMetadataSummary = {
  fileTypeCategory: "image",
  fileSizeBucket: "unknown",
  dimensionsPresent: false,
  metadataContext: "Unavailable",
  captureTimestampPresent: "unknown",
  gpsContext: "unknown",
  editingSoftwareSignal: "unknown",
  rawExifOmitted: true,
  originalFilenameOmitted: true,
  notes: ["synthetic missing metadata note"],
} satisfies EvidenceMetadataSummary;

const forbiddenSentinelValues = [
  "RAW_ORIGINAL_FILENAME_SENTINEL.jpg",
  "RAW_EXIF_GPS_SENTINEL",
  "RAW_LABEL_VALUE_SENTINEL",
  "PROVIDER_HANDLE_SENTINEL",
  "STORAGE_HANDLE_SENTINEL",
  "INTEGRATION_HANDLE_SENTINEL",
  "CASE_QUEUE_HANDLE_SENTINEL",
  "RAW_CALLER_COPY_SENTINEL",
] as const;

const productPhotoMappingInput = {
  evidenceLabel: "Synthetic product photo",
  subjectType: "damage-close-up",
  damageVisibility: "damage-area-visible-context-missing",
  productContext: "partial",
  metadataSummary: syntheticMappingMetadataSummary,
  productLabelContext: {
    serialOrModelContextPresent: true,
    labelReadable: true,
    rawValueOmitted: true,
    notes: ["RAW_LABEL_VALUE_SENTINEL"],
  },
  requestedAdditionalViews: ["wider-product-photo", "proof-of-purchase-match"],
  missingContext: ["wider-product-photo", "proof-of-purchase-match"],
  purchaseOrReceiptMatchNeeded: true,
  includeManualReviewRecommendation: true,
  score: 64,
  reviewLabel: "Clear",
  evidenceSummary:
    "RAW_CALLER_COPY_SENTINEL RAW_ORIGINAL_FILENAME_SENTINEL.jpg RAW_EXIF_GPS_SENTINEL should not be copied.",
  recommendedSupportAction:
    "PROVIDER_HANDLE_SENTINEL STORAGE_HANDLE_SENTINEL INTEGRATION_HANDLE_SENTINEL should not be copied.",
  customerSafeWording: "CASE_QUEUE_HANDLE_SENTINEL RAW_LABEL_VALUE_SENTINEL should not be copied.",
} satisfies ProductPhotoEvidenceAnalysisResultInput;

const completeContextMappingInput = {
  evidenceLabel: "Synthetic complete product photo",
  subjectType: "full-product-context",
  damageVisibility: "clearly-visible",
  productContext: "complete",
  metadataSummary: completeContextMetadataSummary,
  requestedAdditionalViews: [],
  missingContext: [],
  purchaseOrReceiptMatchNeeded: false,
  includeManualReviewRecommendation: false,
  score: 92,
  reviewLabel: "Review recommended",
  reviewPriority: "Review",
  confidenceLevel: "High confidence",
} satisfies ProductPhotoEvidenceAnalysisResultInput;

const lowScoreMappingInput = {
  ...productPhotoMappingInput,
  evidenceLabel: "Synthetic low-score product photo",
  score: 24,
  reviewLabel: "Manual review recommended",
  confidenceLevel: "Low confidence",
} satisfies ProductPhotoEvidenceAnalysisResultInput;

const missingMetadataMappingInput = {
  ...productPhotoMappingInput,
  evidenceLabel: "Synthetic missing-metadata product photo",
  metadataSummary: missingMetadataSummary,
  score: 42,
} satisfies ProductPhotoEvidenceAnalysisResultInput;

function buildProductPhotoReportViewModel(input: ProductPhotoEvidenceAnalysisResultInput) {
  const result = prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary(input);

  return {
    result,
    viewModel: mapProductPhotoAnalysisToReportViewModel(result),
  };
}

const productPhotoMappingCase = buildProductPhotoReportViewModel(productPhotoMappingInput);
const completeContextMappingCase = buildProductPhotoReportViewModel(completeContextMappingInput);
const lowScoreMappingCase = buildProductPhotoReportViewModel(lowScoreMappingInput);
const missingMetadataMappingCase = buildProductPhotoReportViewModel(missingMetadataMappingInput);

const productPhotoMappingResult = productPhotoMappingCase.result;
const productPhotoReportViewModel = productPhotoMappingCase.viewModel;
const completeContextReportViewModel = completeContextMappingCase.viewModel;
const lowScoreReportViewModel = lowScoreMappingCase.viewModel;
const missingMetadataReportViewModel = missingMetadataMappingCase.viewModel;
const displayCaseViewModels = [
  productPhotoReportViewModel,
  completeContextReportViewModel,
  lowScoreReportViewModel,
  missingMetadataReportViewModel,
] as const;

const productPhotoResultShape = productPhotoMappingResult satisfies ProductPhotoEvidenceAnalysisResult;
const sharedResultShape = productPhotoMappingResult satisfies EvidenceAnalysisResult;
const productPhotoReportViewModelShape = productPhotoReportViewModel satisfies ProductPhotoReportViewModel;
const localAnalysisResultStillReceiptOnly = true satisfies LocalAnalysisResultStillReceiptOnly;
const productPhotoReportDoesNotExposeReceiptOnlyFields =
  false satisfies HasAnyKey<ProductPhotoReportViewModel, ReceiptOnlyResultKeys>;
const productPhotoReportDoesNotExposeRawPhotoOrPrivateEvidenceFields =
  false satisfies HasAnyKey<ProductPhotoReportViewModel, RawPhotoOrPrivateEvidenceKeys>;
const productPhotoReportDoesNotExposeFinalOutcomeFields =
  false satisfies HasAnyKey<ProductPhotoReportViewModel, FinalOutcomeKeys>;

function allChecksPass(checks: Record<string, boolean>) {
  return Object.values(checks).every(Boolean);
}

function assertProbeChecksPass(label: string, checks: Record<string, boolean>) {
  if (!allChecksPass(checks)) {
    throw new Error(`Product-photo report view-model probe failed: ${label}`);
  }
}

function collectObjectKeyPaths(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectObjectKeyPaths(item, `${prefix}[${index}]`));
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const keyPath = prefix ? `${prefix}.${key}` : key;

    return [keyPath, ...collectObjectKeyPaths(nestedValue, keyPath)];
  });
}

function hasNoForbiddenExactKeys(value: unknown, forbiddenKeys: readonly string[]) {
  const forbiddenKeySet = new Set(forbiddenKeys);

  return collectObjectKeyPaths(value).every((keyPath) => {
    const keyName = keyPath.split(".").at(-1)?.replace(/\[\d+\]$/, "");

    return keyName ? !forbiddenKeySet.has(keyName) : true;
  });
}

function hasNoSentinelValues(value: unknown, sentinels: readonly string[]) {
  const text = JSON.stringify(value);

  return sentinels.every((sentinel) => !text.includes(sentinel));
}

function hasExactKeys(value: object, expectedKeys: readonly string[]) {
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();

  return (
    actualKeys.length === sortedExpectedKeys.length &&
    actualKeys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

function phrasePattern(parts: readonly string[]) {
  return new RegExp(parts.join("\\s+"), "i");
}

function wholeWordPattern(parts: readonly string[]) {
  return new RegExp(`\\b${parts.join("")}\\b`, "i");
}

const unsafeRenderableCopyPatterns = [
  phrasePattern(["fraud", "confirmed"]),
  phrasePattern(["confirmed", "fraud"]),
  phrasePattern(["manipulation", "confirmed"]),
  wholeWordPattern(["fa", "ke"]),
  wholeWordPattern(["appro", "ved"]),
  wholeWordPattern(["rej", "ected"]),
  phrasePattern(["automatic", "disposition"]),
  phrasePattern(["claim", "outcome"]),
  phrasePattern(["customer", "intent"]),
  phrasePattern(["proof", "of", "authenticity"]),
  phrasePattern(["verified", "authentic"]),
  phrasePattern(["passed", "authenticity", "check"]),
  phrasePattern(["failed", "authenticity", "check"]),
  phrasePattern(["customer", "caused", "the", "damage"]),
  phrasePattern(["ai", "detected", "manipulation"]),
  /\b(?:image|photo|evidence)\s+proves/i,
] as const;

const repoRoot = process.cwd();
const mappingSource = readFileSync(
  join(repoRoot, "src/lib/analysis/product-photo-report-view-model.ts"),
  "utf8",
);
const reportAdapterSource = readFileSync(join(repoRoot, "src/lib/analysis/report-adapter.ts"), "utf8");

const forbiddenMappingImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/test-evidence",
  "@/components/",
  "@/lib/claim-data",
] as const;

const shapeChecks = {
  productPhotoResultShape: productPhotoResultShape.module === "productPhoto",
  sharedResultShape: sharedResultShape.module === "productPhoto",
  productPhotoReportViewModelShape:
    productPhotoReportViewModelShape.boundary === "product-photo-report-view-model",
  canonicalEvidenceType: productPhotoReportViewModel.evidenceType === "product-photo",
  localAnalysisResultStillReceiptOnly,
  productPhotoReportDoesNotExposeReceiptOnlyFields,
  productPhotoReportDoesNotExposeRawPhotoOrPrivateEvidenceFields,
  productPhotoReportDoesNotExposeFinalOutcomeFields,
} as const;

const nonLiveBoundaryChecks = {
  boundaryDevOnly: PRODUCT_PHOTO_REPORT_VIEW_MODEL_BOUNDARY_STATUS.devOnly === true,
  boundaryProbeOnly: PRODUCT_PHOTO_REPORT_VIEW_MODEL_BOUNDARY_STATUS.probeOnly === true,
  runtimeLive: PRODUCT_PHOTO_REPORT_VIEW_MODEL_BOUNDARY_STATUS.runtimeLive === false,
  viewModelDevOnly: productPhotoReportViewModel.devOnly === true,
  viewModelProbeOnly: productPhotoReportViewModel.probeOnly === true,
  viewModelRuntimeLive: productPhotoReportViewModel.runtimeLive === false,
} as const;

const safetyChecks = {
  reviewStatusClampedFromClear: productPhotoReportViewModel.reviewStatus === "Inconclusive",
  scoreLabelIsEvidenceReliabilityScore:
    productPhotoReportViewModel.score.label === "Evidence Reliability Score",
  scoreScopeLocalOnly:
    productPhotoReportViewModel.score.scope === "Local evidence quality and review readiness only",
  scoreMeaningLocalOnly: productPhotoReportViewModel.score.meaning.toLowerCase().includes("local evidence quality"),
  highScoreMeaningReviewOnly:
    productPhotoReportViewModel.score.highScoreMeaning.toLowerCase().includes("local support review") &&
    !productPhotoReportViewModel.score.highScoreMeaning.toLowerCase().includes("prove"),
  lowOrMediumScoreMeaningReviewOnly:
    productPhotoReportViewModel.score.lowOrMediumScoreMeaning.toLowerCase().includes("manual review"),
  scoreSafetyNoteDoesNotProve:
    productPhotoReportViewModel.score.safetyNote.toLowerCase().includes("does not prove"),
  scoreReviewPriorityConfidenceSeparate:
    productPhotoReportViewModel.score.value !== undefined &&
    Boolean(productPhotoReportViewModel.reviewPriority) &&
    Boolean(productPhotoReportViewModel.confidence) &&
    hasNoForbiddenExactKeys(productPhotoReportViewModel.score, ["reviewPriority", "confidence", "limitations"]),
  limitationsKeepScoreConfidenceAndVerificationSeparate:
    productPhotoReportViewModel.limitations.includes("External verification was not performed") &&
    productPhotoReportViewModel.limitations.includes("High score does not prove the product photo or claim"),
  externalVerificationNotPerformed:
    productPhotoReportViewModel.externalVerification.externalVerification === "Not performed",
  externalVerificationNotExternallyVerified:
    productPhotoReportViewModel.externalVerification.status === "Not externally verified",
  externalVerificationSummaryNotPerformed:
    productPhotoReportViewModel.externalVerification.summary.includes("External verification was not performed") &&
    !/provider|pending|complete|passed/i.test(productPhotoReportViewModel.externalVerification.summary),
  manualReviewOnlyAction:
    productPhotoReportViewModel.recommendedSupportAction.toLowerCase().includes("manual review recommended"),
  renderableCopyAvoidsUnsafeOutcomes: unsafeRenderableCopyPatterns.every(
    (pattern) => !pattern.test(JSON.stringify(displayCaseViewModels)),
  ),
  customerCopyAvoidsInternalDetails:
    !/score|confidence|review priority|external verification|not externally verified/i.test(
      productPhotoReportViewModel.customerSafeWording,
    ),
  callerProvidedSummaryNotCopied:
    !productPhotoReportViewModel.reviewSummary.includes("RAW_CALLER_COPY_SENTINEL"),
  callerProvidedActionNotCopied:
    !productPhotoReportViewModel.recommendedSupportAction.includes("PROVIDER_HANDLE_SENTINEL"),
  callerProvidedCustomerWordingNotCopied:
    !productPhotoReportViewModel.customerSafeWording.includes("CASE_QUEUE_HANDLE_SENTINEL"),
} as const;

const topLevelDisplayContractKeys = [
  "boundary",
  "devOnly",
  "probeOnly",
  "runtimeLive",
  "sourceModule",
  "evidenceType",
  "reviewTitle",
  "reviewSummary",
  "reviewStatus",
  "reviewPriority",
  "confidence",
  "score",
  "evidenceQuality",
  "productContext",
  "reviewSignals",
  "limitations",
  "recommendedSupportAction",
  "customerSafeWording",
  "externalVerification",
  "privacy",
  "isolation",
] as const;

const rawOrPrivateRuntimeKeyNames = [
  "fileBytes",
  "imageBuffer",
  "objectUrl",
  "retainedImageFingerprint",
  "rawExif",
  "rawMetadata",
  "originalFilename",
  "rawLabelValue",
  "privateEvidence",
  "provider",
  "providerHandle",
  "providerOutput",
  "storage",
  "storageId",
  "storageHandle",
  "integration",
  "integrationId",
  "integrationHandle",
  "caseQueue",
  "caseQueueId",
  "caseQueueHandle",
] as const;

const privacyChecks = {
  topLevelDisplayContractAllowlist: displayCaseViewModels.every((viewModel) =>
    hasExactKeys(viewModel, topLevelDisplayContractKeys),
  ),
  derivedSummaryOnly: productPhotoReportViewModel.privacy.derivedSummaryOnly === true,
  rawPhotoBytesIncluded: productPhotoReportViewModel.privacy.rawPhotoBytesIncluded === false,
  imageBufferIncluded: productPhotoReportViewModel.privacy.imageBufferIncluded === false,
  rawExifIncluded: productPhotoReportViewModel.privacy.rawExifIncluded === false,
  rawMetadataIncluded: productPhotoReportViewModel.privacy.rawMetadataIncluded === false,
  originalFilenameIncluded: productPhotoReportViewModel.privacy.originalFilenameIncluded === false,
  rawLabelValueIncluded: productPhotoReportViewModel.privacy.rawLabelValueIncluded === false,
  providerOutputIncluded: productPhotoReportViewModel.privacy.providerOutputIncluded === false,
  storageHandleIncluded: productPhotoReportViewModel.privacy.storageHandleIncluded === false,
  integrationHandleIncluded: productPhotoReportViewModel.privacy.integrationHandleIncluded === false,
  caseQueueHandleIncluded: productPhotoReportViewModel.privacy.caseQueueHandleIncluded === false,
  metadataNotesNotCopied: !JSON.stringify(productPhotoReportViewModel).includes(
    "synthetic mapping probe metadata note",
  ),
  metadataDimensionsNotCopied: !JSON.stringify(productPhotoReportViewModel).includes("4032"),
  labelRawValueNotesNotCopied: !JSON.stringify(productPhotoReportViewModel).includes("RAW_LABEL_VALUE_SENTINEL"),
  sentinelPrivateValuesAbsent: displayCaseViewModels.every((viewModel) =>
    hasNoSentinelValues(viewModel, forbiddenSentinelValues),
  ),
  forbiddenPrivateKeyPathsAbsent: displayCaseViewModels.every((viewModel) =>
    hasNoForbiddenExactKeys(viewModel, rawOrPrivateRuntimeKeyNames),
  ),
} as const;

const isolationChecks = {
  localAnalysisResultRequired: productPhotoReportViewModel.isolation.localAnalysisResultRequired === false,
  analyzeEvidenceFileInvoked: productPhotoReportViewModel.isolation.analyzeEvidenceFileInvoked === false,
  analyzerRoutingInvoked: productPhotoReportViewModel.isolation.analyzerRoutingInvoked === false,
  uiUploadReportScoringParserFixturePathsInvoked:
    productPhotoReportViewModel.isolation.uiUploadReportScoringParserFixturePathsInvoked === false,
  mappingDoesNotImportLivePaths: forbiddenMappingImports.every((importPath) => !mappingSource.includes(importPath)),
  reportAdapterDoesNotImportProductPhotoMapper:
    !reportAdapterSource.includes("product-photo-report-view-model") &&
    !reportAdapterSource.includes("mapProductPhotoAnalysisToReportViewModel"),
  reportAdapterSignatureStillReceiptOnly: reportAdapterSource.includes(
    "mapLocalAnalysisToReport(result: LocalAnalysisResult)",
  ),
} as const;

const displayChecks = {
  missingContextTitle: productPhotoReportViewModel.reviewTitle === "Product photo review summary",
  missingContextSummaryLocalOnly:
    productPhotoReportViewModel.reviewSummary.includes("local-only") &&
    productPhotoReportViewModel.reviewSummary.includes("2 additional review items"),
  missingContextRequestedViewsDisplayLabels:
    productPhotoReportViewModel.productContext.requestedAdditionalViews.includes("Wider product photo") &&
    productPhotoReportViewModel.productContext.requestedAdditionalViews.includes("Receipt or order match"),
  missingContextLimitationsComplete:
    productPhotoReportViewModel.limitations.includes("Local product-photo analysis only") &&
    productPhotoReportViewModel.limitations.includes("External verification was not performed") &&
    productPhotoReportViewModel.limitations.includes("High score does not prove the product photo or claim") &&
    productPhotoReportViewModel.limitations.includes("Metadata is context only and raw metadata values are omitted") &&
    productPhotoReportViewModel.limitations.includes("Additional product or order context may be needed"),
  reviewSignalDisplayLimitedAndClamped:
    productPhotoReportViewModel.reviewSignals.length <= 6 &&
    productPhotoReportViewModel.reviewSignals.every(
      (signal) => signal.confidencePercent >= 0 && signal.confidencePercent <= 100,
    ),
  completeContextNoRequestedViews: completeContextReportViewModel.productContext.requestedAdditionalViews.length === 0,
  completeContextNoPurchaseMatchNeeded:
    completeContextReportViewModel.productContext.purchaseOrOrderMatchNeeded === false,
  completeContextReviewRecommended: completeContextReportViewModel.reviewStatus === "Review recommended",
  completeContextSummaryReadyForManualComparison:
    completeContextReportViewModel.reviewSummary.includes("ready for manual support comparison"),
  completeContextActionDoesNotRequestAnotherPhoto:
    completeContextReportViewModel.recommendedSupportAction.includes("Compare the product-photo context") &&
    !completeContextReportViewModel.recommendedSupportAction.includes("Request only the additional product view"),
  completeContextCustomerCopyGeneric:
    completeContextReportViewModel.customerSafeWording.includes("available order information"),
  completeContextLimitationsDoNotRequestAdditionalContext: !completeContextReportViewModel.limitations.includes(
    "Additional product or order context may be needed",
  ),
  lowMediumHighScoreCasesKeepLocalScope: [lowScoreReportViewModel, productPhotoReportViewModel, completeContextReportViewModel].every(
    (viewModel) =>
      viewModel.score.scope === "Local evidence quality and review readiness only" &&
      viewModel.score.safetyNote.includes("does not prove"),
  ),
  missingMetadataCaseUsesSafeSummary:
    missingMetadataReportViewModel.evidenceQuality.qualitySummary.includes("Photo dimensions were not available") &&
    missingMetadataReportViewModel.evidenceQuality.qualityLimitCount > 0,
  labelContextPresentRawValuesOmitted:
    productPhotoReportViewModel.productContext.labelContextSummary.includes("raw label values are omitted") &&
    !JSON.stringify(productPhotoReportViewModel).includes("RAW_LABEL_VALUE_SENTINEL"),
  overconfidentClearLabelClamped: productPhotoReportViewModel.reviewStatus === "Inconclusive",
} as const;

assertProbeChecksPass("shape", shapeChecks);
assertProbeChecksPass("non-live boundary", nonLiveBoundaryChecks);
assertProbeChecksPass("safety", safetyChecks);
assertProbeChecksPass("privacy", privacyChecks);
assertProbeChecksPass("isolation", isolationChecks);
assertProbeChecksPass("display", displayChecks);

export const PRODUCT_PHOTO_REPORT_VIEW_MODEL_DEVELOPER_PROBE = {
  cases: {
    productPhoto: productPhotoMappingResult,
    reportViewModel: productPhotoReportViewModel,
    completeContext: completeContextMappingCase.result,
    completeContextReportViewModel,
    lowScoreReportViewModel,
    missingMetadataReportViewModel,
  },
  expectations: {
    shape: shapeChecks,
    nonLiveBoundary: nonLiveBoundaryChecks,
    safety: safetyChecks,
    privacy: privacyChecks,
    isolation: isolationChecks,
    display: displayChecks,
  },
  preservationStatus: {
    productPhotoMapsToSeparateViewModel: allChecksPass(shapeChecks),
    productPhotoMappingDevProbeOnly: allChecksPass(nonLiveBoundaryChecks),
    safeManualReviewOnlyFields: allChecksPass(safetyChecks),
    privacySafeDerivedSummaryOnly: allChecksPass(privacyChecks),
    displayContractCasesPass: allChecksPass(displayChecks),
    livePathsNotInvoked: allChecksPass(isolationChecks),
    receiptReportMappingUnchanged: isolationChecks.reportAdapterSignatureStillReceiptOnly,
    localAnalysisResultChanged: false,
    productPhotoRuntimeLive: false,
  },
} as const;
