import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary,
  type ProductPhotoEvidenceAnalysisResultInput,
} from "@/lib/analysis/product-photo-analyzer";
import {
  mapProductPhotoAnalysisToReportViewModel,
  type ProductPhotoReportViewModel,
} from "@/lib/analysis/product-photo-report-view-model";
import {
  prepareProductPhotoAdapterReadinessForDevOnlyBoundary,
  type ProductPhotoAdapterReadinessInput,
  type ProductPhotoAdapterReadinessResult,
} from "@/lib/analysis/product-photo-routing-adapter";
import type { EvidenceMetadataSummary, ProductPhotoEvidenceAnalysisResult } from "@/lib/analysis/types";

type HasAnyKey<T, TKey extends PropertyKey> = Extract<keyof T, TKey> extends never ? false : true;
type AssertFalse<T extends false> = T extends false ? true : never;

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
  | "objectUrl"
  | "imageUrl"
  | "dataUrl"
  | "rawExif"
  | "rawMetadata"
  | "originalFilename"
  | "rawLabelValue"
  | "rawSerialOrModelText"
  | "preciseTimestamp"
  | "gpsCoordinates"
  | "customerId"
  | "caseId"
  | "claimId"
  | "ticketId"
  | "evidenceId"
  | "providerOutput"
  | "providerId"
  | "storageId"
  | "storageKey"
  | "integrationId"
  | "caseQueueId";

type FinalOutcomeKeys =
  | "claimOutcome"
  | "customerIntent"
  | "automaticDisposition"
  | "externalDecision"
  | "policyDisposition"
  | "approvalStatus"
  | "rejectionStatus";

const repoRoot = process.cwd();
const adapterSource = readFileSync(join(repoRoot, "src/lib/analysis/product-photo-routing-adapter.ts"), "utf8");
const analyzerSource = readFileSync(join(repoRoot, "src/lib/analysis/analyzer.ts"), "utf8");
const reportAdapterSource = readFileSync(join(repoRoot, "src/lib/analysis/report-adapter.ts"), "utf8");
const claimReviewWorkflowSource = readFileSync(join(repoRoot, "src/components/ClaimReviewWorkflow.tsx"), "utf8");

const adapterMetadata = {
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
  notes: ["local-only review signal"],
} satisfies EvidenceMetadataSummary;

const canonicalProductPhotoInput = {
  evidenceLabel: "Synthetic product-photo adapter probe",
  sourceKind: "synthetic-fixture",
  subjectType: "damage-close-up",
  damageVisibility: "damage-area-visible-context-missing",
  productContext: "partial",
  metadataSummary: adapterMetadata,
  requestedAdditionalViews: ["wider-product-photo", "proof-of-purchase-match"],
  missingContext: ["wider-product-photo", "proof-of-purchase-match"],
  purchaseOrReceiptMatchNeeded: true,
} satisfies ProductPhotoEvidenceAnalysisResultInput;

const canonicalAnalysisResult =
  prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary(canonicalProductPhotoInput);
const canonicalViewModel = mapProductPhotoAnalysisToReportViewModel(canonicalAnalysisResult);

const hostileNestedDamagePhotoAnalysisResult = {
  ...canonicalAnalysisResult,
  evidenceType: "damage-photo",
  rawMetadata: "RAW_METADATA_SENTINEL",
  objectUrl: "OBJECT_URL_SENTINEL",
  providerId: "PROVIDER_ID_SENTINEL",
  storageKey: "STORAGE_KEY_SENTINEL",
  integrationId: "INTEGRATION_ID_SENTINEL",
  caseQueueId: "CASE_QUEUE_ID_SENTINEL",
} as unknown as ProductPhotoEvidenceAnalysisResult;

const hostileNestedReceiptAnalysisResult = {
  ...canonicalAnalysisResult,
  evidenceType: "receipt",
} as unknown as ProductPhotoEvidenceAnalysisResult;

const hostileNestedUnknownAnalysisResult = {
  ...canonicalAnalysisResult,
  evidenceType: "unknown",
} as unknown as ProductPhotoEvidenceAnalysisResult;

const hostileNestedUnsupportedAnalysisResult = {
  ...canonicalAnalysisResult,
  evidenceType: "unsupported",
} as unknown as ProductPhotoEvidenceAnalysisResult;

const hostileNestedMissingEvidenceTypeAnalysisResult = Object.fromEntries(
  Object.entries(canonicalAnalysisResult).filter(([key]) => key !== "evidenceType"),
) as unknown as ProductPhotoEvidenceAnalysisResult;

const analysisReadinessResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: canonicalAnalysisResult,
  evidenceType: "product-photo",
  runtimeRequested: true,
});

const analysisReadinessOmittedTopLevelEvidenceTypeResult =
  prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
    inputKind: "analysis-result",
    result: canonicalAnalysisResult,
    runtimeRequested: true,
  });

const viewModelReadinessResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: canonicalViewModel,
  evidenceType: "product-photo",
  runtimeRequested: true,
});

const viewModelReadinessOmittedTopLevelEvidenceTypeResult =
  prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
    inputKind: "report-view-model",
    viewModel: canonicalViewModel,
    runtimeRequested: true,
  });

const legacyDamagePhotoQuarantineResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "legacy-compatibility",
  evidenceType: "damage-photo",
  runtimeRequested: true,
});

const topLevelReceiptAnalysisMismatchResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: canonicalAnalysisResult,
  evidenceType: "receipt",
  runtimeRequested: true,
});

const topLevelUnknownAnalysisMismatchResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: canonicalAnalysisResult,
  evidenceType: "unknown",
  runtimeRequested: true,
});

const topLevelUnsupportedAnalysisMismatchResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: canonicalAnalysisResult,
  evidenceType: "unsupported",
  runtimeRequested: true,
});

const topLevelDamagePhotoAnalysisMismatchResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: canonicalAnalysisResult,
  evidenceType: "damage-photo",
  runtimeRequested: true,
});

const topLevelReceiptViewModelMismatchResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: canonicalViewModel,
  evidenceType: "receipt",
  runtimeRequested: true,
});

const topLevelUnknownViewModelMismatchResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: canonicalViewModel,
  evidenceType: "unknown",
  runtimeRequested: true,
});

const topLevelUnsupportedViewModelMismatchResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: canonicalViewModel,
  evidenceType: "unsupported",
  runtimeRequested: true,
});

const topLevelDamagePhotoViewModelMismatchResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: canonicalViewModel,
  evidenceType: "damage-photo",
  runtimeRequested: true,
});

const hostileNestedDamagePhotoQuarantineResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: hostileNestedDamagePhotoAnalysisResult,
  evidenceType: "product-photo",
  runtimeRequested: true,
});

const hostileNestedDamagePhotoOmittedTopLevelResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: hostileNestedDamagePhotoAnalysisResult,
  runtimeRequested: true,
});

const hostileNestedReceiptResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: hostileNestedReceiptAnalysisResult,
  evidenceType: "product-photo",
  runtimeRequested: true,
});

const hostileNestedUnknownResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: hostileNestedUnknownAnalysisResult,
  evidenceType: "product-photo",
  runtimeRequested: true,
});

const hostileNestedUnsupportedResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: hostileNestedUnsupportedAnalysisResult,
  evidenceType: "product-photo",
  runtimeRequested: true,
});

const hostileNestedMissingEvidenceTypeResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "analysis-result",
  result: hostileNestedMissingEvidenceTypeAnalysisResult,
  evidenceType: "product-photo",
  runtimeRequested: true,
});

const unsupportedReceiptResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "unsupported",
  evidenceType: "receipt",
  runtimeRequested: true,
});

const hostileViewModel = {
  ...canonicalViewModel,
  confidence: "CONFIRMED_FRAUD_SENTINEL",
  reviewPriority: "Senior review",
  score: {
    ...canonicalViewModel.score,
    value: 999,
    meaning: "RAW_CALLER_SCORE_OVERRIDE_SENTINEL",
  },
  reviewSummary: "RAW_CALLER_SUMMARY_SENTINEL",
  recommendedSupportAction: "RAW_CALLER_ACTION_SENTINEL",
  customerSafeWording: "RAW_CALLER_CUSTOMER_COPY_SENTINEL",
  reviewSignals: [
    {
      label: "RAW_CALLER_SIGNAL_LABEL_SENTINEL",
      category: "UNSUPPORTED_CATEGORY_SENTINEL",
      severity: "CRITICAL_SENTINEL",
      confidencePercent: 999,
      reviewNote: "RAW_CALLER_SIGNAL_NOTE_SENTINEL",
      recommendedReviewStep: "RAW_CALLER_SIGNAL_STEP_SENTINEL",
    },
  ],
  privateEvidence: {
    customerId: "CUSTOMER_ID_SENTINEL",
    caseId: "CASE_ID_SENTINEL",
    claimId: "CLAIM_ID_SENTINEL",
    ticketId: "TICKET_ID_SENTINEL",
    evidenceId: "EVIDENCE_ID_SENTINEL",
    providerId: "PROVIDER_ID_SENTINEL",
    storageKey: "STORAGE_KEY_SENTINEL",
    exactDimensions: "1800x1200",
    gpsCoordinates: "GPS_COORDINATE_SENTINEL",
    originalFileName: "CUSTOMER_ORDER_PHOTO_SENTINEL.jpg",
    rawMetadata: "RAW_METADATA_SENTINEL",
    rawLabelValue: "RAW_LABEL_VALUE_SENTINEL",
    objectUrl: "OBJECT_URL_SENTINEL",
  },
} as unknown as ProductPhotoReportViewModel;

const hostileViewModelReadinessResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: hostileViewModel,
  evidenceType: "product-photo",
  runtimeRequested: true,
});

const lowScoreViewModel = {
  ...canonicalViewModel,
  score: {
    ...canonicalViewModel.score,
    value: 24,
  },
  reviewSignals: [],
} satisfies ProductPhotoReportViewModel;

const mediumScoreViewModel = {
  ...canonicalViewModel,
  score: {
    ...canonicalViewModel.score,
    value: 64,
  },
  reviewSignals: [],
} satisfies ProductPhotoReportViewModel;

const highScoreViewModel = {
  ...canonicalViewModel,
  score: {
    ...canonicalViewModel.score,
    value: 92,
  },
  reviewSignals: [],
} satisfies ProductPhotoReportViewModel;

const lowScoreReadinessResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: lowScoreViewModel,
  evidenceType: "product-photo",
});

const mediumScoreReadinessResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: mediumScoreViewModel,
  evidenceType: "product-photo",
});

const highScoreReadinessResult = prepareProductPhotoAdapterReadinessForDevOnlyBoundary({
  inputKind: "report-view-model",
  viewModel: highScoreViewModel,
  evidenceType: "product-photo",
});

const forbiddenPrivateSentinelValues = [
  "RAW_CALLER_SCORE_OVERRIDE_SENTINEL",
  "RAW_CALLER_SUMMARY_SENTINEL",
  "RAW_CALLER_ACTION_SENTINEL",
  "RAW_CALLER_CUSTOMER_COPY_SENTINEL",
  "RAW_CALLER_SIGNAL_LABEL_SENTINEL",
  "RAW_CALLER_SIGNAL_NOTE_SENTINEL",
  "RAW_CALLER_SIGNAL_STEP_SENTINEL",
  "CONFIRMED_FRAUD_SENTINEL",
  "CRITICAL_SENTINEL",
  "CUSTOMER_ID_SENTINEL",
  "CASE_ID_SENTINEL",
  "CLAIM_ID_SENTINEL",
  "TICKET_ID_SENTINEL",
  "EVIDENCE_ID_SENTINEL",
  "PROVIDER_ID_SENTINEL",
  "STORAGE_KEY_SENTINEL",
  "GPS_COORDINATE_SENTINEL",
  "CUSTOMER_ORDER_PHOTO_SENTINEL.jpg",
  "RAW_METADATA_SENTINEL",
  "RAW_LABEL_VALUE_SENTINEL",
  "OBJECT_URL_SENTINEL",
  "1800x1200",
] as const;

function stringifyForProbe(value: unknown) {
  return JSON.stringify(value);
}

function assertProbeChecksPass(group: string, checks: Record<string, boolean>) {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Product-photo adapter readiness probe failed (${group}): ${failed.join(", ")}`);
  }
}

function outputOmitsPrivateSentinels(result: ProductPhotoAdapterReadinessResult) {
  const serialized = stringifyForProbe(result);

  return forbiddenPrivateSentinelValues.every((sentinel) => !serialized.includes(sentinel));
}

function outputOmitsForbiddenKeys(result: ProductPhotoAdapterReadinessResult) {
  const serialized = stringifyForProbe(result);
  const forbiddenKeyFragments = [
    "fileBytes",
    "imageBuffer",
    "objectUrl",
    "imageUrl",
    "dataUrl",
    "rawExif",
    "rawMetadata",
    "originalFilename",
    "rawLabelValue",
    "preciseTimestamp",
    "gpsCoordinates",
    "customerId",
    "caseId",
    "claimId",
    "ticketId",
    "evidenceId",
    "providerId",
    "storageKey",
    "integrationId",
    "caseQueueId",
    "claimOutcome",
    "automaticDisposition",
    "policyDisposition",
  ];

  return forbiddenKeyFragments.every((fragment) => !serialized.includes(fragment));
}

function outputOmitsUnsafeWording(result: ProductPhotoAdapterReadinessResult) {
  const serialized = stringifyForProbe(result).toLowerCase();
  const unsafeTerms = [
    ["fa", "ke"].join(""),
    ["fr", "aud confirmed"].join(""),
    ["manipulation", " confirmed"].join(""),
    ["ver", "ified"].join(""),
    ["app", "roved"].join(""),
    ["rej", "ected"].join(""),
    ["den", "ied"].join(""),
    ["cle", "ared"].join(""),
    ["gen", "uine"].join(""),
    ["not gen", "uine"].join(""),
    ["valid", " claim"].join(""),
    ["invalid", " claim"].join(""),
  ];

  return unsafeTerms.every((term) => !serialized.includes(term));
}

const typeChecks = {
  adapterOutputHasNoReceiptOnlyKeys: true satisfies AssertFalse<
    HasAnyKey<ProductPhotoAdapterReadinessResult, ReceiptOnlyResultKeys>
  >,
  adapterInputHasNoRawPrivateKeys: true satisfies AssertFalse<
    HasAnyKey<ProductPhotoAdapterReadinessInput, RawPhotoOrPrivateEvidenceKeys>
  >,
  adapterOutputHasNoFinalOutcomeKeys: true satisfies AssertFalse<
    HasAnyKey<ProductPhotoAdapterReadinessResult, FinalOutcomeKeys>
  >,
};

const shapeChecks = {
  analysisResultAccepted: analysisReadinessResult.readinessAccepted === true,
  viewModelAccepted: viewModelReadinessResult.readinessAccepted === true,
  omittedTopLevelEvidenceTypeSafeInternalShapesAccepted:
    analysisReadinessOmittedTopLevelEvidenceTypeResult.readinessAccepted === true &&
    viewModelReadinessOmittedTopLevelEvidenceTypeResult.readinessAccepted === true,
  canonicalEvidenceTypeOnly: analysisReadinessResult.evidenceType === "product-photo",
  runtimeStaysNonLive:
    analysisReadinessResult.runtimeLive === false &&
    viewModelReadinessResult.runtimeLive === false &&
    hostileViewModelReadinessResult.runtimeLive === false,
  manualReviewOnly:
    analysisReadinessResult.manualReviewOnly === true &&
    viewModelReadinessResult.manualReviewOnly === true,
  isolationFlagsRemainFalse:
    analysisReadinessResult.isolation.localAnalysisResultRequired === false &&
    analysisReadinessResult.isolation.analyzeEvidenceFileInvoked === false &&
    analysisReadinessResult.isolation.analyzerRoutingInvoked === false &&
    analysisReadinessResult.isolation.uiUploadReportScoringParserFixturePathsInvoked === false &&
    analysisReadinessResult.isolation.providersStorageIntegrationsCaseQueuesInvoked === false,
};

const canonicalizationChecks = {
  hostileScoreClamped: hostileViewModelReadinessResult.score.value === 100,
  hostileConfidenceCollapsed: hostileViewModelReadinessResult.confidence === "Low confidence",
  hostileReviewPriorityDerivedFromSignals: hostileViewModelReadinessResult.reviewPriority === "Manual review",
  hostileLocalSignalLevelDerived: hostileViewModelReadinessResult.localSignalLevel === "Medium",
  hostileSignalCategoryCollapsed:
    hostileViewModelReadinessResult.signals[0]?.category === "Recommendation",
  hostileSignalSeverityCollapsed: hostileViewModelReadinessResult.signals[0]?.severity === "Medium",
  hostileSignalConfidenceClamped: hostileViewModelReadinessResult.signals[0]?.confidencePercent === 100,
  lowMediumHighScoresKeepLocalScope:
    lowScoreReadinessResult.score.value === 24 &&
    mediumScoreReadinessResult.score.value === 64 &&
    highScoreReadinessResult.score.value === 92 &&
    highScoreReadinessResult.score.scope === "Local evidence quality and review readiness only" &&
    highScoreReadinessResult.limitations.some((limitation) =>
      limitation.includes("High score does not prove the product photo or claim"),
    ),
};

const quarantineChecks = {
  damagePhotoReadinessRejected: legacyDamagePhotoQuarantineResult.readinessAccepted === false,
  damagePhotoQuarantined:
    legacyDamagePhotoQuarantineResult.inputKind === "legacy-quarantine" &&
    legacyDamagePhotoQuarantineResult.legacyCompatibility?.alias === "damage-photo" &&
    legacyDamagePhotoQuarantineResult.legacyCompatibility.quarantined === true &&
    legacyDamagePhotoQuarantineResult.legacyCompatibility.runtimeCandidate === false,
  damagePhotoDoesNotBecomeCanonicalRuntimeOutput:
    legacyDamagePhotoQuarantineResult.evidenceType === "product-photo" &&
    legacyDamagePhotoQuarantineResult.runtimeLive === false &&
    legacyDamagePhotoQuarantineResult.manualReviewOnly === true,
  hostileNestedDamagePhotoRejected:
    hostileNestedDamagePhotoQuarantineResult.readinessAccepted === false &&
    hostileNestedDamagePhotoOmittedTopLevelResult.readinessAccepted === false,
  hostileNestedDamagePhotoQuarantined:
    hostileNestedDamagePhotoQuarantineResult.inputKind === "legacy-quarantine" &&
    hostileNestedDamagePhotoOmittedTopLevelResult.inputKind === "legacy-quarantine" &&
    hostileNestedDamagePhotoQuarantineResult.legacyCompatibility?.alias === "damage-photo" &&
    hostileNestedDamagePhotoOmittedTopLevelResult.legacyCompatibility?.alias === "damage-photo" &&
    hostileNestedDamagePhotoQuarantineResult.legacyCompatibility.quarantined === true &&
    hostileNestedDamagePhotoOmittedTopLevelResult.legacyCompatibility.quarantined === true,
  hostileNestedDamagePhotoCannotBecomeCanonicalAdapterOutput:
    hostileNestedDamagePhotoQuarantineResult.readinessAccepted === false &&
    hostileNestedDamagePhotoQuarantineResult.inputKind !== "analysis-result" &&
    hostileNestedDamagePhotoQuarantineResult.evidenceType === "product-photo" &&
    hostileNestedDamagePhotoQuarantineResult.runtimeLive === false &&
    hostileNestedDamagePhotoQuarantineResult.manualReviewOnly === true,
  topLevelAnalysisEvidenceTypeMismatchesCollapsed:
    topLevelReceiptAnalysisMismatchResult.readinessAccepted === false &&
    topLevelUnknownAnalysisMismatchResult.readinessAccepted === false &&
    topLevelUnsupportedAnalysisMismatchResult.readinessAccepted === false &&
    topLevelReceiptAnalysisMismatchResult.inputKind === "unsupported" &&
    topLevelUnknownAnalysisMismatchResult.inputKind === "unsupported" &&
    topLevelUnsupportedAnalysisMismatchResult.inputKind === "unsupported",
  topLevelReportViewModelEvidenceTypeMismatchesCollapsed:
    topLevelReceiptViewModelMismatchResult.readinessAccepted === false &&
    topLevelUnknownViewModelMismatchResult.readinessAccepted === false &&
    topLevelUnsupportedViewModelMismatchResult.readinessAccepted === false &&
    topLevelReceiptViewModelMismatchResult.inputKind === "unsupported" &&
    topLevelUnknownViewModelMismatchResult.inputKind === "unsupported" &&
    topLevelUnsupportedViewModelMismatchResult.inputKind === "unsupported",
  topLevelDamagePhotoMismatchQuarantined:
    topLevelDamagePhotoAnalysisMismatchResult.readinessAccepted === false &&
    topLevelDamagePhotoViewModelMismatchResult.readinessAccepted === false &&
    topLevelDamagePhotoAnalysisMismatchResult.inputKind === "legacy-quarantine" &&
    topLevelDamagePhotoViewModelMismatchResult.inputKind === "legacy-quarantine" &&
    topLevelDamagePhotoAnalysisMismatchResult.legacyCompatibility?.alias === "damage-photo" &&
    topLevelDamagePhotoViewModelMismatchResult.legacyCompatibility?.alias === "damage-photo" &&
    topLevelDamagePhotoAnalysisMismatchResult.legacyCompatibility.quarantined === true &&
    topLevelDamagePhotoViewModelMismatchResult.legacyCompatibility.quarantined === true,
  topLevelMismatchesStayNonLiveManualReviewOnly:
    topLevelReceiptAnalysisMismatchResult.runtimeLive === false &&
    topLevelReceiptAnalysisMismatchResult.manualReviewOnly === true &&
    topLevelUnknownAnalysisMismatchResult.runtimeLive === false &&
    topLevelUnknownAnalysisMismatchResult.manualReviewOnly === true &&
    topLevelUnsupportedAnalysisMismatchResult.runtimeLive === false &&
    topLevelUnsupportedAnalysisMismatchResult.manualReviewOnly === true &&
    topLevelDamagePhotoAnalysisMismatchResult.runtimeLive === false &&
    topLevelDamagePhotoAnalysisMismatchResult.manualReviewOnly === true &&
    topLevelReceiptViewModelMismatchResult.runtimeLive === false &&
    topLevelReceiptViewModelMismatchResult.manualReviewOnly === true &&
    topLevelUnknownViewModelMismatchResult.runtimeLive === false &&
    topLevelUnknownViewModelMismatchResult.manualReviewOnly === true &&
    topLevelUnsupportedViewModelMismatchResult.runtimeLive === false &&
    topLevelUnsupportedViewModelMismatchResult.manualReviewOnly === true &&
    topLevelDamagePhotoViewModelMismatchResult.runtimeLive === false &&
    topLevelDamagePhotoViewModelMismatchResult.manualReviewOnly === true,
  hostileUnsupportedNestedEvidenceTypesCollapsed:
    hostileNestedReceiptResult.readinessAccepted === false &&
    hostileNestedUnknownResult.readinessAccepted === false &&
    hostileNestedUnsupportedResult.readinessAccepted === false &&
    hostileNestedMissingEvidenceTypeResult.readinessAccepted === false &&
    hostileNestedReceiptResult.inputKind === "unsupported" &&
    hostileNestedUnknownResult.inputKind === "unsupported" &&
    hostileNestedUnsupportedResult.inputKind === "unsupported" &&
    hostileNestedMissingEvidenceTypeResult.inputKind === "unsupported",
  receiptLikeInputCollapsed:
    unsupportedReceiptResult.readinessAccepted === false &&
    unsupportedReceiptResult.inputKind === "unsupported" &&
    unsupportedReceiptResult.runtimeLive === false,
};

const privacyChecks = {
  analysisOutputOmitsPrivateSentinels: outputOmitsPrivateSentinels(analysisReadinessResult),
  viewModelOutputOmitsPrivateSentinels: outputOmitsPrivateSentinels(viewModelReadinessResult),
  hostileOutputOmitsPrivateSentinels: outputOmitsPrivateSentinels(hostileViewModelReadinessResult),
  hostileNestedDamageOutputOmitsPrivateSentinels: outputOmitsPrivateSentinels(
    hostileNestedDamagePhotoQuarantineResult,
  ),
  hostileOutputOmitsForbiddenKeys: outputOmitsForbiddenKeys(hostileViewModelReadinessResult),
  hostileNestedDamageOutputOmitsForbiddenKeys: outputOmitsForbiddenKeys(
    hostileNestedDamagePhotoQuarantineResult,
  ),
  exactDimensionsNotPropagated: !stringifyForProbe(analysisReadinessResult).includes("1800"),
  privacyFlagsAreDerivedOmissionOnly:
    hostileViewModelReadinessResult.privacy.derivedSummaryOnly === true &&
    hostileViewModelReadinessResult.privacy.privateSourceValuesOmitted === true &&
    hostileViewModelReadinessResult.privacy.exactMetadataOmitted === true &&
    hostileViewModelReadinessResult.privacy.externalHandlesOmitted === true,
};

const wordingChecks = {
  confidenceIsReadinessNotFraudProbability:
    !/fraud|probability/i.test(hostileViewModelReadinessResult.score.meaning) &&
    !/fraud|probability/i.test(hostileViewModelReadinessResult.reviewSummary),
  reviewPriorityIsTriageOnly: hostileViewModelReadinessResult.reviewPriority === "Manual review",
  supportActionManualReviewOnly: /Manual review recommended/i.test(
    hostileViewModelReadinessResult.recommendedSupportAction,
  ),
  limitationsSeparateFromSignals:
    hostileViewModelReadinessResult.limitations.length > 0 &&
    hostileViewModelReadinessResult.signals.length > 0 &&
    hostileViewModelReadinessResult.limitations.every((limitation) => typeof limitation === "string"),
  unsafeWordingOmitted: outputOmitsUnsafeWording(hostileViewModelReadinessResult),
};

const sourceBoundaryChecks = {
  adapterDoesNotImportLiveAnalyzer: !adapterSource.includes("@/lib/analysis/analyzer"),
  adapterDoesNotImportAnalyzerRouting: !adapterSource.includes("@/lib/analysis/analyzer-routing"),
  adapterDoesNotImportReportAdapter: !adapterSource.includes("@/lib/analysis/report-adapter"),
  adapterDoesNotImportScoringParserFixtures:
    !adapterSource.includes("@/lib/analysis/scoring") &&
    !adapterSource.includes("@/lib/analysis/receipt-parser") &&
    !adapterSource.includes("@/lib/test-evidence"),
  adapterDoesNotImportUiUploadProviderStorageIntegrationQueuePaths:
    !adapterSource.includes("@/components/") &&
    !adapterSource.includes("@/lib/claim-data") &&
    !/providerHandle|storageHandle|integrationHandle|caseQueueHandle/.test(adapterSource),
  liveAnalyzerStillReceiptEntrypoint: analyzerSource.includes("analyzeEvidenceFile(file: File): Promise<LocalAnalysisResult>"),
  receiptReportAdapterSignatureStillReceiptOnly: reportAdapterSource.includes(
    "mapLocalAnalysisToReport(result: LocalAnalysisResult)",
  ),
  claimReviewWorkflowStillUsesReceiptAnalyzer:
    claimReviewWorkflowSource.includes("analyzeEvidenceFile(selectedFile)") &&
    claimReviewWorkflowSource.includes("mapLocalAnalysisToReport(result)") &&
    !claimReviewWorkflowSource.includes("prepareProductPhotoAdapterReadinessForDevOnlyBoundary"),
};

assertProbeChecksPass("types", typeChecks);
assertProbeChecksPass("shape", shapeChecks);
assertProbeChecksPass("canonicalization", canonicalizationChecks);
assertProbeChecksPass("quarantine", quarantineChecks);
assertProbeChecksPass("privacy", privacyChecks);
assertProbeChecksPass("wording", wordingChecks);
assertProbeChecksPass("source boundaries", sourceBoundaryChecks);

export const PRODUCT_PHOTO_ADAPTER_READINESS_DEVELOPER_PROBE = {
  cases: {
    analysisReadinessResult,
    analysisReadinessOmittedTopLevelEvidenceTypeResult,
    viewModelReadinessResult,
    viewModelReadinessOmittedTopLevelEvidenceTypeResult,
    hostileViewModelReadinessResult,
    lowScoreReadinessResult,
    mediumScoreReadinessResult,
    highScoreReadinessResult,
    legacyDamagePhotoQuarantineResult,
    topLevelReceiptAnalysisMismatchResult,
    topLevelUnknownAnalysisMismatchResult,
    topLevelUnsupportedAnalysisMismatchResult,
    topLevelDamagePhotoAnalysisMismatchResult,
    topLevelReceiptViewModelMismatchResult,
    topLevelUnknownViewModelMismatchResult,
    topLevelUnsupportedViewModelMismatchResult,
    topLevelDamagePhotoViewModelMismatchResult,
    hostileNestedDamagePhotoQuarantineResult,
    hostileNestedDamagePhotoOmittedTopLevelResult,
    hostileNestedReceiptResult,
    hostileNestedUnknownResult,
    hostileNestedUnsupportedResult,
    hostileNestedMissingEvidenceTypeResult,
    unsupportedReceiptResult,
  },
  expectations: {
    acceptedCanonicalProductPhotoOnly: {
      analysis: analysisReadinessResult.readinessAccepted,
      viewModel: viewModelReadinessResult.readinessAccepted,
      evidenceType: analysisReadinessResult.evidenceType,
      omittedTopLevelAnalysis: analysisReadinessOmittedTopLevelEvidenceTypeResult.readinessAccepted,
      omittedTopLevelViewModel: viewModelReadinessOmittedTopLevelEvidenceTypeResult.readinessAccepted,
    },
    legacyDamagePhotoQuarantine: {
      accepted: legacyDamagePhotoQuarantineResult.readinessAccepted,
      alias: legacyDamagePhotoQuarantineResult.legacyCompatibility?.alias,
      quarantined: legacyDamagePhotoQuarantineResult.legacyCompatibility?.quarantined,
      runtimeCandidate: legacyDamagePhotoQuarantineResult.legacyCompatibility?.runtimeCandidate,
    },
    hostileNestedDamagePhotoQuarantine: {
      accepted: hostileNestedDamagePhotoQuarantineResult.readinessAccepted,
      inputKind: hostileNestedDamagePhotoQuarantineResult.inputKind,
      alias: hostileNestedDamagePhotoQuarantineResult.legacyCompatibility?.alias,
      quarantined: hostileNestedDamagePhotoQuarantineResult.legacyCompatibility?.quarantined,
      runtimeLive: hostileNestedDamagePhotoQuarantineResult.runtimeLive,
      manualReviewOnly: hostileNestedDamagePhotoQuarantineResult.manualReviewOnly,
    },
    topLevelEvidenceTypeMismatches: {
      analysisReceipt: topLevelReceiptAnalysisMismatchResult.inputKind,
      analysisUnknown: topLevelUnknownAnalysisMismatchResult.inputKind,
      analysisUnsupported: topLevelUnsupportedAnalysisMismatchResult.inputKind,
      analysisDamagePhoto: topLevelDamagePhotoAnalysisMismatchResult.inputKind,
      viewModelReceipt: topLevelReceiptViewModelMismatchResult.inputKind,
      viewModelUnknown: topLevelUnknownViewModelMismatchResult.inputKind,
      viewModelUnsupported: topLevelUnsupportedViewModelMismatchResult.inputKind,
      viewModelDamagePhoto: topLevelDamagePhotoViewModelMismatchResult.inputKind,
      runtimeLive: topLevelReceiptAnalysisMismatchResult.runtimeLive,
      manualReviewOnly: topLevelReceiptAnalysisMismatchResult.manualReviewOnly,
    },
    hostileUnsupportedNestedEvidenceTypes: {
      receipt: hostileNestedReceiptResult.inputKind,
      unknown: hostileNestedUnknownResult.inputKind,
      unsupported: hostileNestedUnsupportedResult.inputKind,
      missing: hostileNestedMissingEvidenceTypeResult.inputKind,
    },
    hostileCanonicalization: {
      score: hostileViewModelReadinessResult.score.value,
      confidence: hostileViewModelReadinessResult.confidence,
      reviewPriority: hostileViewModelReadinessResult.reviewPriority,
      localSignalLevel: hostileViewModelReadinessResult.localSignalLevel,
    },
    privacy: hostileViewModelReadinessResult.privacy,
    isolation: hostileViewModelReadinessResult.isolation,
  },
} as const;
