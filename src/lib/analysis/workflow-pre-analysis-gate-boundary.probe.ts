import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildWorkflowPreAnalysisGateBoundaryResult,
  ENABLE_WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_GUARD,
  WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS,
  type WorkflowPreAnalysisGateBoundaryInput,
  type WorkflowPreAnalysisGateBoundaryResult,
} from "@/lib/analysis/workflow-pre-analysis-gate-boundary";

type HasAnyKey<T, TKey extends PropertyKey> = Extract<keyof T, TKey> extends never ? false : true;
type AssertFalse<T extends false> = T extends false ? true : never;

type ForbiddenBoundaryInputKeys =
  | "file"
  | "blob"
  | "fileBytes"
  | "imageBuffer"
  | "arrayBuffer"
  | "stream"
  | "objectUrl"
  | "imageUrl"
  | "dataUrl"
  | "rawExif"
  | "exif"
  | "rawMetadata"
  | "metadata"
  | "originalFilename"
  | "rawOcr"
  | "ocrText"
  | "providerOutput"
  | "providerHandle"
  | "storageHandle"
  | "integrationHandle"
  | "caseQueueHandle"
  | "customerId"
  | "ticketId"
  | "orderId"
  | "claimId"
  | "caseId"
  | "evidenceId"
  | "credentials"
  | "secret";

const repoRoot = process.cwd();
const boundarySource = readFileSync(join(repoRoot, "src/lib/analysis/workflow-pre-analysis-gate-boundary.ts"), "utf8");
const probeSource = readFileSync(join(repoRoot, "src/lib/analysis/workflow-pre-analysis-gate-boundary.probe.ts"), "utf8");
const claimReviewWorkflowSource = readFileSync(join(repoRoot, "src/components/ClaimReviewWorkflow.tsx"), "utf8");
const uploadPanelSource = readFileSync(join(repoRoot, "src/components/UploadPanel.tsx"), "utf8");
const appPageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");
const appLayoutSource = readFileSync(join(repoRoot, "src/app/layout.tsx"), "utf8");
const testEvidencePageSource = readFileSync(join(repoRoot, "src/app/test-evidence/page.tsx"), "utf8");
const testEvidenceHarnessSource = readFileSync(join(repoRoot, "src/components/TestEvidenceHarness.tsx"), "utf8");
const reportAdapterSource = readFileSync(join(repoRoot, "src/lib/analysis/report-adapter.ts"), "utf8");
const analyzerSource = readFileSync(join(repoRoot, "src/lib/analysis/analyzer.ts"), "utf8");
const typesSource = readFileSync(join(repoRoot, "src/lib/analysis/types.ts"), "utf8");
const productPhotoReviewPanelSource = readFileSync(join(repoRoot, "src/components/ProductPhotoReviewPanel.tsx"), "utf8");

function assertProbeChecksPass(group: string, checks: Record<string, boolean>) {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Workflow pre-analysis gate boundary probe failed (${group}): ${failed.join(", ")}`);
  }
}

function sourceImports(source: string, importPath: string) {
  return source.includes(`from "${importPath}"`) || source.includes(`from '${importPath}'`);
}

const receiptInput: WorkflowPreAnalysisGateBoundaryInput = {
  kind: "receipt-analysis",
  runtimeGuardEnabled: false,
};

const productPhotoUnsupportedInput: WorkflowPreAnalysisGateBoundaryInput = {
  kind: "unsupported-evidence",
  runtimeGuardEnabled: true,
  result: {
    outcome: "product-photo-like-unsupported",
    runtimeLive: false,
    productPhotoRuntimeLive: false,
    manualReviewOnly: true,
  },
};

const legacyUnsupportedInput: WorkflowPreAnalysisGateBoundaryInput = {
  kind: "unsupported-evidence",
  runtimeGuardEnabled: true,
  result: {
    outcome: "legacy-damage-photo-quarantine",
    runtimeLive: false,
    productPhotoRuntimeLive: false,
    manualReviewOnly: true,
  },
};

const unknownUnsupportedInput: WorkflowPreAnalysisGateBoundaryInput = {
  kind: "unsupported-evidence",
  runtimeGuardEnabled: true,
  result: {
    outcome: "unknown-inconclusive",
    runtimeLive: false,
    productPhotoRuntimeLive: false,
    manualReviewOnly: true,
  },
};

const unsupportedImageInput: WorkflowPreAnalysisGateBoundaryInput = {
  kind: "unsupported-evidence",
  runtimeGuardEnabled: true,
  result: {
    outcome: "unsupported-evidence",
    runtimeLive: false,
    productPhotoRuntimeLive: false,
    manualReviewOnly: true,
  },
};

const defaultOffReceiptDelegation = buildWorkflowPreAnalysisGateBoundaryResult(receiptInput);
const defaultOffUnsupportedDelegation = buildWorkflowPreAnalysisGateBoundaryResult(productPhotoUnsupportedInput);
const enabledProductPhotoStop = buildWorkflowPreAnalysisGateBoundaryResult(productPhotoUnsupportedInput, {
  workflowBoundaryGuardEnabled: true,
});
const enabledLegacyStop = buildWorkflowPreAnalysisGateBoundaryResult(legacyUnsupportedInput, {
  workflowBoundaryGuardEnabled: true,
});
const enabledUnknownStop = buildWorkflowPreAnalysisGateBoundaryResult(unknownUnsupportedInput, {
  workflowBoundaryGuardEnabled: true,
});
const enabledUnsupportedImageStop = buildWorkflowPreAnalysisGateBoundaryResult(unsupportedImageInput, {
  workflowBoundaryGuardEnabled: true,
});

const allResults: WorkflowPreAnalysisGateBoundaryResult[] = [
  defaultOffReceiptDelegation,
  defaultOffUnsupportedDelegation,
  enabledProductPhotoStop,
  enabledLegacyStop,
  enabledUnknownStop,
  enabledUnsupportedImageStop,
];

const unsupportedStops = allResults.filter(
  (result): result is Extract<WorkflowPreAnalysisGateBoundaryResult, { resultKind: "unsupported-evidence-stopped" }> =>
    result.resultKind === "unsupported-evidence-stopped",
);

const visibleTextFields = (result: WorkflowPreAnalysisGateBoundaryResult) => {
  if (result.resultKind === "receipt-analysis-delegation") {
    return [result.resultKind, result.boundary];
  }

  return [
    result.resultKind,
    result.boundary,
    result.unsupportedEvidenceReview.evidenceTypeLabel,
    result.unsupportedEvidenceReview.reviewStatus,
    result.unsupportedEvidenceReview.riskTreatment,
    result.unsupportedEvidenceReview.supportRepSummary,
    result.unsupportedEvidenceReview.customerSafeWording,
    result.unsupportedEvidenceReview.confidenceTreatment.label,
    result.unsupportedEvidenceReview.confidenceTreatment.summary,
    result.unsupportedEvidenceReview.confidenceTreatment.scoreBoundaryNotice,
    ...result.unsupportedEvidenceReview.manualReviewGuidance,
    ...result.unsupportedEvidenceReview.blockedOutputReasons,
  ];
};

const exactReceiptAuthenticityBoundaryNotice = [
  "This result should not be treated as a receipt auth",
  "enticity score.",
].join("");

const forbiddenBoundaryOutputPhrases = [
  ["fr", "aud confirmed"].join(""),
  ["fa", "ke receipt"].join(""),
  ["for", "ged"].join(""),
  ["manipulated", " evidence"].join(""),
  ["pr", "oof of purchase"].join(""),
  ["receipt", " score"].join(""),
  ["auth", "enticity score"].join(""),
  ["product-photo", " report"].join(""),
  ["photo", " report"].join(""),
  ["deny", " this claim"].join(""),
  ["customer", " is lying"].join(""),
  ["quaran", "tine"].join(""),
] as const;

function visibleOutputOmitsForbiddenPhrases(result: WorkflowPreAnalysisGateBoundaryResult) {
  const visibleText = visibleTextFields(result).join(" ").toLowerCase();
  const visibleTextWithoutAllowedBoundaryNotice = visibleText.replace(
    exactReceiptAuthenticityBoundaryNotice.toLowerCase(),
    "",
  );

  return forbiddenBoundaryOutputPhrases.every((phrase) => {
    if (phrase === ["auth", "enticity score"].join("")) {
      return !visibleTextWithoutAllowedBoundaryNotice.includes(phrase);
    }

    return !visibleText.includes(phrase);
  });
}

function serializedOutputOmitsPrivateFields(result: WorkflowPreAnalysisGateBoundaryResult) {
  const serialized = JSON.stringify(result);
  const forbiddenFragments = [
    "PRIVATE_CUSTOMER_ORDER_777",
    "rawOcr",
    "ocrText",
    "fileBytes",
    "imageBuffer",
    "arrayBuffer",
    "objectUrl",
    "imageUrl",
    "dataUrl",
    "rawExif",
    "rawMetadata",
    "originalFilename",
    "providerOutput",
    "providerHandle",
    "storageHandle",
    "integrationHandle",
    "caseQueueHandle",
    "customerId",
    "ticketId",
    "orderId",
    "claimId",
    "caseId",
    "evidenceId",
    "credentials",
    "secret",
  ];

  return forbiddenFragments.every((fragment) => !serialized.includes(fragment));
}

function displayHasRequiredSafeConcepts(result: WorkflowPreAnalysisGateBoundaryResult) {
  if (result.resultKind !== "unsupported-evidence-stopped") {
    return true;
  }

  const visibleText = visibleTextFields(result).join(" ");
  const normalizedVisibleText = visibleText.toLowerCase();

  return (
    normalizedVisibleText.includes("unsupported for automated receipt analysis") &&
    visibleText.includes("Manual review is recommended before taking action.") &&
    visibleText.includes(exactReceiptAuthenticityBoundaryNotice) &&
    visibleText.includes("Use the available evidence and support policy to decide the next step.")
  );
}

const typeChecks = {
  inputHasNoForbiddenKeys: true satisfies AssertFalse<
    HasAnyKey<WorkflowPreAnalysisGateBoundaryInput, ForbiddenBoundaryInputKeys>
  >,
};

const shapeChecks = {
  defaultFlagDisabled: ENABLE_WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_GUARD === false,
  statusMarkersNonLive:
    WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS.probeOnly === true &&
    WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS.runtimeLive === false &&
    WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS.productPhotoRuntimeLive === false &&
    WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS.liveCallerWired === false &&
    WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS.renderedUiAdded === false,
  defaultOffReceiptDelegationShape:
    defaultOffReceiptDelegation.resultKind === "receipt-analysis-delegation" &&
    defaultOffReceiptDelegation.workflowBoundaryGuardEnabled === false &&
    defaultOffReceiptDelegation.receiptAnalysisDelegationIntended === true &&
    defaultOffReceiptDelegation.receiptReportMappingDelegationIntended === true &&
    defaultOffReceiptDelegation.unsupportedEvidenceReviewProduced === false,
  defaultOffUnsupportedStillDelegatesToReceiptShape:
    defaultOffUnsupportedDelegation.resultKind === "receipt-analysis-delegation" &&
    defaultOffUnsupportedDelegation.workflowBoundaryGuardEnabled === false &&
    defaultOffUnsupportedDelegation.receiptAnalysisDelegationIntended === true,
  enabledUnsupportedBuildsStoppedState:
    unsupportedStops.length === 4 &&
    unsupportedStops.every(
      (result) =>
        result.workflowBoundaryGuardEnabled === true &&
        result.receiptAnalysisDelegationIntended === false &&
        result.receiptReportMappingDelegationIntended === false &&
        result.unsupportedEvidenceReviewProduced === true,
    ),
  everyUnsupportedStopUsesWorkflowBoundary:
    unsupportedStops.every(
      (result) =>
        result.boundary === "workflow-pre-analysis-gate-boundary" &&
        result.unsupportedEvidenceReview.boundary === "workflow-pre-analysis-gate-boundary" &&
        result.unsupportedEvidenceReview.sourceBoundary === "unsupported-evidence-display-mapping-probe",
    ),
};

const unsupportedReviewChecks = {
  everyUnsupportedStopIsManualReviewOnly: unsupportedStops.every(
    (result) =>
      result.unsupportedEvidenceReview.reviewStatus === "Manual review recommended" &&
      result.unsupportedEvidenceReview.manualReviewOnly === true,
  ),
  everyUnsupportedStopOmitsScoresReportsAndProof: unsupportedStops.every(
    (result) =>
      result.unsupportedEvidenceReview.receiptScoreShown === false &&
      result.unsupportedEvidenceReview.receiptReportShown === false &&
      result.unsupportedEvidenceReview.productPhotoReportShown === false &&
      result.unsupportedEvidenceReview.proofOfPurchaseLanguageShown === false,
  ),
  everyUnsupportedStopOmitsRuntimePaths: unsupportedStops.every(
    (result) =>
      result.unsupportedEvidenceReview.ocrInvoked === false &&
      result.unsupportedEvidenceReview.metadataInvoked === false &&
      result.unsupportedEvidenceReview.analyzerInvoked === false &&
      result.unsupportedEvidenceReview.liveReportAdapterInvoked === false &&
      result.unsupportedEvidenceReview.uiUploadReportScoringParserFixturePathsInvoked === false &&
      result.unsupportedEvidenceReview.providersStorageIntegrationsCaseQueuesInvoked === false &&
      result.unsupportedEvidenceReview.productPhotoReviewPanelRouted === false,
  ),
  productPhotoLikeMapsThroughExistingMapper:
    enabledProductPhotoStop.resultKind === "unsupported-evidence-stopped" &&
    enabledProductPhotoStop.unsupportedEvidenceReview.evidenceTypeLabel.includes("Product photo evidence"),
  legacyOutcomeDoesNotExposeQuarantineWording:
    enabledLegacyStop.resultKind === "unsupported-evidence-stopped" &&
    visibleOutputOmitsForbiddenPhrases(enabledLegacyStop),
  unknownOutcomeUsesRoutingInconclusive:
    enabledUnknownStop.resultKind === "unsupported-evidence-stopped" &&
    enabledUnknownStop.unsupportedEvidenceReview.confidenceTreatment.label === "Routing inconclusive",
};

const wordingAndPrivacyChecks = {
  everyVisibleOutputOmitsForbiddenPhrases: allResults.every(visibleOutputOmitsForbiddenPhrases),
  everyOutputOmitsPrivateFields: allResults.every(serializedOutputOmitsPrivateFields),
  everyUnsupportedOutputHasRequiredSafeConcepts: allResults.every(displayHasRequiredSafeConcepts),
};

const sourceBoundaryChecks = {
  boundaryImportsOnlyRuntimeTypeAndMapper:
    sourceImports(boundarySource, "@/lib/analysis/pre-analysis-evidence-gate-runtime") &&
    sourceImports(boundarySource, "@/lib/analysis/unsupported-evidence-review-state") &&
    !sourceImports(boundarySource, "@/lib/analysis/analyzer") &&
    !sourceImports(boundarySource, "@/lib/analysis/report-adapter"),
  boundaryDoesNotReferenceLiveReceiptResult:
    !boundarySource.includes("LocalAnalysisResult") &&
    !boundarySource.includes("MockAnalysisReport") &&
    !boundarySource.includes("mapLocalAnalysisToReport"),
  boundaryDoesNotCallLiveAnalyzerOrReportAdapter:
    !boundarySource.includes("analyzeEvidenceFile(") &&
    !boundarySource.includes("mapLocalAnalysisToReport("),
  boundaryDoesNotReferenceProtectedRuntimePaths:
    !boundarySource.includes("@/components/ClaimReviewWorkflow") &&
    !boundarySource.includes("@/components/UploadPanel") &&
    !boundarySource.includes("@/components/ProductPhotoReviewPanel") &&
    !boundarySource.includes("@/lib/analysis/report-adapter") &&
    !boundarySource.includes("@/lib/analysis/receipt-parser") &&
    !boundarySource.includes("@/lib/analysis/scoring") &&
    !boundarySource.includes("@/lib/test-evidence"),
  boundaryDoesNotReferenceRawPrivateSurfaces:
    !/createObjectURL|\bobjectUrl\b|\bimageUrl\b|\bdataUrl\b|\bBlob\b|\bFile\b|rawOcr|ocrText|rawExif|rawMetadata|originalFilename|providerOutput|providerHandle|storageHandle|integrationHandle|caseQueueHandle|credentials|secret/.test(
      boundarySource,
    ),
  probeImportsBoundaryOnlyForRuntimeCode:
    sourceImports(probeSource, "@/lib/analysis/workflow-pre-analysis-gate-boundary") &&
    !sourceImports(probeSource, "@/lib/analysis/analyzer") &&
    !sourceImports(probeSource, "@/lib/analysis/report-adapter"),
  liveFilesDoNotImportWorkflowBoundary:
    [
      claimReviewWorkflowSource,
      uploadPanelSource,
      appPageSource,
      appLayoutSource,
      testEvidencePageSource,
      testEvidenceHarnessSource,
      reportAdapterSource,
      analyzerSource,
      productPhotoReviewPanelSource,
    ].every((source) => !source.includes("workflow-pre-analysis-gate-boundary")),
  analyzerSignatureUnchanged: analyzerSource.includes("analyzeEvidenceFile(file: File): Promise<LocalAnalysisResult>"),
  localAnalysisResultStillReceiptShaped:
    typesSource.includes("export type LocalAnalysisResult = {") &&
    typesSource.includes("receipt: ExtractedReceiptInfo;") &&
    !typesSource.includes("WorkflowPreAnalysisGateBoundaryResult"),
  claimReviewWorkflowStillUsesLiveReceiptPath:
    claimReviewWorkflowSource.includes("analyzeEvidenceFile(selectedFile)") &&
    claimReviewWorkflowSource.includes("setLocalReport(mapLocalAnalysisToReport(result))") &&
    !claimReviewWorkflowSource.includes("workflow-pre-analysis-gate-boundary"),
};

assertProbeChecksPass("types", typeChecks);
assertProbeChecksPass("shape", shapeChecks);
assertProbeChecksPass("unsupported review", unsupportedReviewChecks);
assertProbeChecksPass("wording and privacy", wordingAndPrivacyChecks);
assertProbeChecksPass("source boundaries", sourceBoundaryChecks);

export const WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_DEVELOPER_PROBE = {
  status: WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS,
  cases: {
    defaultOffReceiptDelegation,
    defaultOffUnsupportedDelegation,
    enabledProductPhotoStop,
    enabledLegacyStop,
    enabledUnknownStop,
    enabledUnsupportedImageStop,
  },
  expectations: {
    types: typeChecks,
    shape: shapeChecks,
    unsupportedReview: unsupportedReviewChecks,
    wordingAndPrivacy: wordingAndPrivacyChecks,
    sourceBoundaries: sourceBoundaryChecks,
  },
} as const;
