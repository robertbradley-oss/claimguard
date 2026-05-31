import type { UnsupportedEvidenceResult } from "@/lib/analysis/pre-analysis-evidence-gate-runtime";
import {
  mapUnsupportedEvidenceReviewState,
  type UnsupportedEvidenceReviewDisplay,
  type UnsupportedEvidenceReviewSyntheticCaseKind,
} from "@/lib/analysis/unsupported-evidence-review-state";

export const ENABLE_WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_GUARD: boolean = false;

type WorkflowUnsupportedOutcome = UnsupportedEvidenceResult["outcome"];

type WorkflowReceiptBoundaryInput = {
  kind: "receipt-analysis";
  runtimeGuardEnabled: boolean;
};

type WorkflowUnsupportedBoundaryInput = {
  kind: "unsupported-evidence";
  runtimeGuardEnabled: true;
  result: Pick<UnsupportedEvidenceResult, "outcome" | "runtimeLive" | "productPhotoRuntimeLive" | "manualReviewOnly">;
};

export type WorkflowPreAnalysisGateBoundaryInput =
  | WorkflowReceiptBoundaryInput
  | WorkflowUnsupportedBoundaryInput;

export type WorkflowPreAnalysisGateBoundaryOptions = {
  workflowBoundaryGuardEnabled?: boolean;
  syntheticCaseKind?: UnsupportedEvidenceReviewSyntheticCaseKind;
};

export type WorkflowUnsupportedEvidenceReviewState = Omit<
  UnsupportedEvidenceReviewDisplay,
  "boundary" | "outcome" | "internalNotes"
> & {
  boundary: "workflow-pre-analysis-gate-boundary";
  sourceBoundary: "unsupported-evidence-display-mapping-probe";
};

export type WorkflowReceiptDelegationBoundaryResult = {
  resultKind: "receipt-analysis-delegation";
  boundary: "workflow-pre-analysis-gate-boundary";
  workflowBoundaryGuardEnabled: boolean;
  runtimeLive: false;
  productPhotoRuntimeLive: false;
  receiptAnalysisDelegationIntended: true;
  receiptReportMappingDelegationIntended: true;
  unsupportedEvidenceReviewProduced: false;
  unsupportedEvidenceStoredInReceiptResult: false;
  productPhotoReviewPanelRouted: false;
  renderedUiAdded: false;
  liveCallerWired: false;
};

export type WorkflowUnsupportedBoundaryResult = {
  resultKind: "unsupported-evidence-stopped";
  boundary: "workflow-pre-analysis-gate-boundary";
  workflowBoundaryGuardEnabled: true;
  runtimeLive: false;
  productPhotoRuntimeLive: false;
  receiptAnalysisDelegationIntended: false;
  receiptReportMappingDelegationIntended: false;
  unsupportedEvidenceReviewProduced: true;
  unsupportedEvidenceStoredInReceiptResult: false;
  productPhotoReviewPanelRouted: false;
  renderedUiAdded: false;
  liveCallerWired: false;
  unsupportedEvidenceReview: WorkflowUnsupportedEvidenceReviewState;
};

export type WorkflowPreAnalysisGateBoundaryResult =
  | WorkflowReceiptDelegationBoundaryResult
  | WorkflowUnsupportedBoundaryResult;

export const WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS = {
  boundary: "workflow-pre-analysis-gate-boundary",
  defaultFlagEnabled: ENABLE_WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_GUARD,
  probeOnly: true,
  runtimeLive: false,
  productPhotoRuntimeLive: false,
  liveCallerWired: false,
  renderedUiAdded: false,
  localAnalysisResultProduced: false,
  liveReportAdapterInvoked: false,
  productPhotoReviewPanelRouted: false,
  providersStorageIntegrationsCaseQueuesInvoked: false,
} as const;

function workflowBoundaryGuardEnabledFor(options: WorkflowPreAnalysisGateBoundaryOptions) {
  return options.workflowBoundaryGuardEnabled === true || ENABLE_WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_GUARD === true;
}

function syntheticCaseKindFor(outcome: WorkflowUnsupportedOutcome): UnsupportedEvidenceReviewSyntheticCaseKind {
  if (outcome === "product-photo-like-unsupported") {
    return "product-photo";
  }

  if (outcome === "legacy-damage-photo-quarantine") {
    return "mixed-evidence";
  }

  if (outcome === "unknown-inconclusive") {
    return "unknown-evidence";
  }

  return "unsupported-image";
}

function receiptDelegationResult(workflowBoundaryGuardEnabled: boolean): WorkflowReceiptDelegationBoundaryResult {
  return {
    resultKind: "receipt-analysis-delegation",
    boundary: "workflow-pre-analysis-gate-boundary",
    workflowBoundaryGuardEnabled,
    runtimeLive: false,
    productPhotoRuntimeLive: false,
    receiptAnalysisDelegationIntended: true,
    receiptReportMappingDelegationIntended: true,
    unsupportedEvidenceReviewProduced: false,
    unsupportedEvidenceStoredInReceiptResult: false,
    productPhotoReviewPanelRouted: false,
    renderedUiAdded: false,
    liveCallerWired: false,
  };
}

function workflowReviewStateFor(
  input: WorkflowUnsupportedBoundaryInput,
  options: WorkflowPreAnalysisGateBoundaryOptions,
): WorkflowUnsupportedEvidenceReviewState {
  const reviewDisplay = mapUnsupportedEvidenceReviewState({
    outcome: input.result.outcome,
    syntheticCaseKind: options.syntheticCaseKind ?? syntheticCaseKindFor(input.result.outcome),
  });

  return {
    resultKind: reviewDisplay.resultKind,
    state: reviewDisplay.state,
    boundary: "workflow-pre-analysis-gate-boundary",
    sourceBoundary: reviewDisplay.boundary,
    evidenceTypeLabel: reviewDisplay.evidenceTypeLabel,
    reviewStatus: reviewDisplay.reviewStatus,
    riskTreatment: reviewDisplay.riskTreatment,
    supportRepSummary: reviewDisplay.supportRepSummary,
    manualReviewGuidance: [
      "Unsupported for automated receipt analysis.",
      ...reviewDisplay.manualReviewGuidance,
    ],
    customerSafeWording: reviewDisplay.customerSafeWording,
    confidenceTreatment: reviewDisplay.confidenceTreatment,
    allowedNextActions: reviewDisplay.allowedNextActions,
    blockedOutputReasons: reviewDisplay.blockedOutputReasons,
    externalVerification: reviewDisplay.externalVerification,
    verificationStatus: reviewDisplay.verificationStatus,
    runtimeLive: false,
    productPhotoRuntimeLive: false,
    manualReviewOnly: true,
    receiptScoreShown: false,
    receiptReportShown: false,
    productPhotoReportShown: false,
    proofOfPurchaseLanguageShown: false,
    ocrInvoked: false,
    metadataInvoked: false,
    analyzerInvoked: false,
    liveReportAdapterInvoked: false,
    uiUploadReportScoringParserFixturePathsInvoked: false,
    providersStorageIntegrationsCaseQueuesInvoked: false,
    productPhotoReviewPanelRouted: false,
  };
}

export function buildWorkflowPreAnalysisGateBoundaryResult(
  input: WorkflowPreAnalysisGateBoundaryInput,
  options: WorkflowPreAnalysisGateBoundaryOptions = {},
): WorkflowPreAnalysisGateBoundaryResult {
  const workflowBoundaryGuardEnabled = workflowBoundaryGuardEnabledFor(options);

  if (!workflowBoundaryGuardEnabled || input.kind === "receipt-analysis") {
    return receiptDelegationResult(workflowBoundaryGuardEnabled);
  }

  return {
    resultKind: "unsupported-evidence-stopped",
    boundary: "workflow-pre-analysis-gate-boundary",
    workflowBoundaryGuardEnabled: true,
    runtimeLive: false,
    productPhotoRuntimeLive: false,
    receiptAnalysisDelegationIntended: false,
    receiptReportMappingDelegationIntended: false,
    unsupportedEvidenceReviewProduced: true,
    unsupportedEvidenceStoredInReceiptResult: false,
    productPhotoReviewPanelRouted: false,
    renderedUiAdded: false,
    liveCallerWired: false,
    unsupportedEvidenceReview: workflowReviewStateFor(input, options),
  };
}
