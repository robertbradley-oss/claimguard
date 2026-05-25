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
  metadataContext: "Limited",
  captureTimestampPresent: "unknown",
  gpsContext: "unknown",
  editingSoftwareSignal: "unknown",
  rawExifOmitted: true,
  originalFilenameOmitted: true,
  notes: ["synthetic mapping probe metadata note"],
} satisfies EvidenceMetadataSummary;

const productPhotoMappingInput = {
  evidenceLabel: "Synthetic product photo",
  subjectType: "damage-close-up",
  damageVisibility: "damage-area-visible-context-missing",
  productContext: "partial",
  metadataSummary: syntheticMappingMetadataSummary,
  requestedAdditionalViews: ["wider-product-photo", "proof-of-purchase-match"],
  missingContext: ["wider-product-photo", "proof-of-purchase-match"],
  purchaseOrReceiptMatchNeeded: true,
  includeManualReviewRecommendation: true,
  reviewLabel: "Clear",
  evidenceSummary: "Caller-provided summary should not be copied into the report view model.",
  recommendedSupportAction: "Caller-provided action should not be copied into the report view model.",
  customerSafeWording: "Caller-provided customer wording should not be copied into the report view model.",
} satisfies ProductPhotoEvidenceAnalysisResultInput;

const productPhotoMappingResult =
  prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary(productPhotoMappingInput);
const productPhotoReportViewModel = mapProductPhotoAnalysisToReportViewModel(productPhotoMappingResult);

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

function hasNoForbiddenKeys(value: unknown, forbiddenKeys: readonly string[]) {
  const text = JSON.stringify(value).toLowerCase();

  return forbiddenKeys.every((key) => !text.includes(key.toLowerCase()));
}

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
  scoreScopeLocalOnly:
    productPhotoReportViewModel.score.scope === "Local evidence quality and review readiness only",
  scoreSafetyNoteDoesNotProve:
    productPhotoReportViewModel.score.safetyNote.toLowerCase().includes("does not prove"),
  scoreReviewPriorityConfidenceSeparate:
    productPhotoReportViewModel.score.value !== undefined &&
    Boolean(productPhotoReportViewModel.reviewPriority) &&
    Boolean(productPhotoReportViewModel.confidence),
  externalVerificationNotPerformed:
    productPhotoReportViewModel.externalVerification.externalVerification === "Not performed",
  externalVerificationNotExternallyVerified:
    productPhotoReportViewModel.externalVerification.status === "Not externally verified",
  manualReviewOnlyAction:
    productPhotoReportViewModel.recommendedSupportAction.toLowerCase().includes("manual review recommended"),
  callerProvidedSummaryNotCopied:
    !productPhotoReportViewModel.reviewSummary.includes("Caller-provided"),
  callerProvidedActionNotCopied:
    !productPhotoReportViewModel.recommendedSupportAction.includes("Caller-provided"),
  callerProvidedCustomerWordingNotCopied:
    !productPhotoReportViewModel.customerSafeWording.includes("Caller-provided"),
} as const;

const privacyChecks = {
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
  forbiddenPrivateKeysAbsent: hasNoForbiddenKeys(productPhotoReportViewModel, [
    "fileBytes",
    "imageBuffer",
    "rawExif",
    "rawMetadata",
    "originalFilename",
    "rawLabelValue",
    "providerOutput",
    "storageId",
    "integrationId",
    "caseQueueId",
  ]),
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

assertProbeChecksPass("shape", shapeChecks);
assertProbeChecksPass("non-live boundary", nonLiveBoundaryChecks);
assertProbeChecksPass("safety", safetyChecks);
assertProbeChecksPass("privacy", privacyChecks);
assertProbeChecksPass("isolation", isolationChecks);

export const PRODUCT_PHOTO_REPORT_VIEW_MODEL_DEVELOPER_PROBE = {
  cases: {
    productPhoto: productPhotoMappingResult,
    reportViewModel: productPhotoReportViewModel,
  },
  expectations: {
    shape: shapeChecks,
    nonLiveBoundary: nonLiveBoundaryChecks,
    safety: safetyChecks,
    privacy: privacyChecks,
    isolation: isolationChecks,
  },
  preservationStatus: {
    productPhotoMapsToSeparateViewModel: allChecksPass(shapeChecks),
    productPhotoMappingDevProbeOnly: allChecksPass(nonLiveBoundaryChecks),
    safeManualReviewOnlyFields: allChecksPass(safetyChecks),
    privacySafeDerivedSummaryOnly: allChecksPass(privacyChecks),
    livePathsNotInvoked: allChecksPass(isolationChecks),
    receiptReportMappingUnchanged: isolationChecks.reportAdapterSignatureStillReceiptOnly,
    localAnalysisResultChanged: false,
    productPhotoRuntimeLive: false,
  },
} as const;
