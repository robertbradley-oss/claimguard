import {
  recognizeProductPhotoEvidence,
  type ProductPhotoRecognitionInput,
  type ProductPhotoRecognitionResult,
} from "@/lib/analysis/product-photo-recognition";
import {
  buildProductPhotoAnalysisDetails,
  type ProductPhotoAnalysisDetailsInput,
} from "@/lib/analysis/product-photo-analyzer";
import type { ProductPhotoReportViewModel } from "@/lib/analysis/product-photo-report-view-model";
import type {
  EvidenceConfidence,
  EvidenceSourceKind,
  LocalSignalLevel,
  ProductPhotoAnalysisDetails,
  ProductPhotoEvidenceAnalysisResult,
  ReviewPriority,
  SharedEvidenceSignal,
  SharedEvidenceSignalCategory,
  SignalSeverity,
} from "@/lib/analysis/types";

export type ProductPhotoRoutingAdapterInput = ProductPhotoRecognitionInput & {
  productPhotoAnalysisInput?: ProductPhotoAnalysisDetailsInput;
};

export type ProductPhotoRoutingAdapterResult = {
  boundary: "product-photo-routing-adapter";
  devOnly: true;
  recognition: ProductPhotoRecognitionResult;
  productPhotoDetails?: ProductPhotoAnalysisDetails;
  routed: boolean;
  reasons: string[];
  limitations: string[];
};

export type ProductPhotoAdapterReadinessInput =
  | {
      inputKind: "analysis-result";
      result: ProductPhotoEvidenceAnalysisResult;
      evidenceType?: string;
      runtimeRequested?: boolean;
    }
  | {
      inputKind: "report-view-model";
      viewModel: ProductPhotoReportViewModel;
      evidenceType?: string;
      runtimeRequested?: boolean;
    }
  | {
      inputKind: "legacy-compatibility";
      evidenceType: "damage-photo";
      runtimeRequested?: boolean;
    }
  | {
      inputKind?: "unsupported";
      evidenceType?: string;
      runtimeRequested?: boolean;
    };

export type ProductPhotoAdapterReadinessSignal = {
  label: string;
  category: SharedEvidenceSignal["category"];
  severity: SignalSeverity;
  confidencePercent: number;
  reviewNote: string;
};

export type ProductPhotoAdapterReadinessResult = {
  boundary: "product-photo-adapter-readiness";
  devOnly: true;
  probeOnly: true;
  runtimeLive: false;
  manualReviewOnly: true;
  evidenceType: "product-photo";
  readinessAccepted: boolean;
  inputKind: "analysis-result" | "report-view-model" | "legacy-quarantine" | "unsupported";
  legacyCompatibility?: {
    alias: "damage-photo";
    canonicalEvidenceType: "product-photo";
    quarantined: true;
    runtimeCandidate: false;
    note: string;
  };
  score: {
    label: "Evidence Reliability Score";
    value: number;
    scope: "Local evidence quality and review readiness only";
    meaning: string;
  };
  confidence: EvidenceConfidence;
  reviewPriority: ReviewPriority;
  localSignalLevel: LocalSignalLevel;
  sourceKind: Extract<EvidenceSourceKind, "manual-review-context" | "synthetic-fixture">;
  reviewSummary: string;
  recommendedSupportAction: string;
  customerSafeWording: string;
  limitations: string[];
  signals: ProductPhotoAdapterReadinessSignal[];
  privacy: {
    derivedSummaryOnly: true;
    privateSourceValuesOmitted: true;
    exactMetadataOmitted: true;
    externalHandlesOmitted: true;
  };
  isolation: {
    localAnalysisResultRequired: false;
    analyzeEvidenceFileInvoked: false;
    analyzerRoutingInvoked: false;
    uiUploadReportScoringParserFixturePathsInvoked: false;
    providersStorageIntegrationsCaseQueuesInvoked: false;
  };
};

const PRODUCT_PHOTO_ROUTING_ADAPTER_LIMITATIONS = [
  "dev-only routing adapter; runtime analyzer behavior is not live",
  "manual-review support only",
] as const;

function buildLimitations(recognition: ProductPhotoRecognitionResult, routed: boolean) {
  return [
    ...recognition.limitations,
    ...PRODUCT_PHOTO_ROUTING_ADAPTER_LIMITATIONS,
    ...(recognition.compatibilityAlias?.alias === "damage-photo"
      ? ["legacy damage-photo compatibility alias is quarantined from canonical product-photo adapter readiness"]
      : []),
    routed
      ? "product-photo details were built for a future routing candidate only"
      : "product-photo details were not built for this input",
  ];
}

function clampPercent(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function signalLevelFor(signals: readonly { severity: SignalSeverity }[]): LocalSignalLevel {
  if (signals.some((signal) => signal.severity === "High")) {
    return "High";
  }

  if (signals.some((signal) => signal.severity === "Medium")) {
    return "Medium";
  }

  if (signals.some((signal) => signal.severity === "Low")) {
    return "Low";
  }

  return "None";
}

function canonicalConfidence(value: unknown): EvidenceConfidence {
  if (value === "High confidence" || value === "Medium confidence" || value === "Low confidence") {
    return value;
  }

  return "Low confidence";
}

function canonicalSeverity(value: unknown): SignalSeverity {
  if (value === "High" || value === "Medium" || value === "Low") {
    return value;
  }

  return "Medium";
}

function canonicalSignalCategory(value: unknown): SharedEvidenceSignalCategory {
  if (
    value === "Evidence Quality" ||
    value === "Photo Context" ||
    value === "Image Quality" ||
    value === "Image Consistency" ||
    value === "Metadata Context" ||
    value === "Purchase Match" ||
    value === "Recommendation"
  ) {
    return value;
  }

  return "Recommendation";
}

function reviewPriorityFor(score: number, signals: readonly { severity: SignalSeverity }[]): ReviewPriority {
  if (signals.some((signal) => signal.severity === "High")) {
    return "Manual review";
  }

  if (score >= 70 && signals.length === 0) {
    return "Review";
  }

  return "Manual review";
}

function sourceKindFor(sourceKind: unknown): Extract<EvidenceSourceKind, "manual-review-context" | "synthetic-fixture"> {
  return sourceKind === "synthetic-fixture" ? "synthetic-fixture" : "manual-review-context";
}

function signalLabelFor(signal: SharedEvidenceSignal | ProductPhotoReportViewModel["reviewSignals"][number]) {
  if (signal.category === "Image Quality") {
    return "Photo quality limits review";
  }

  if (signal.category === "Metadata Context") {
    return "Metadata context is limited";
  }

  if (signal.category === "Purchase Match") {
    return "Receipt or order match may be needed";
  }

  if (signal.category === "Recommendation") {
    return "Manual review recommended";
  }

  if (signal.category === "Photo Context") {
    return "Product-photo context needs review";
  }

  return "Local product-photo review signal";
}

function readinessSignalFromShared(signal: SharedEvidenceSignal): ProductPhotoAdapterReadinessSignal {
  const category = canonicalSignalCategory(signal.category);

  return {
    label: signalLabelFor({ ...signal, category }),
    category,
    severity: canonicalSeverity(signal.severity),
    confidencePercent: clampPercent(signal.confidence),
    reviewNote: "Local-only product-photo signal for manual review triage.",
  };
}

function readinessSignalFromViewModel(
  signal: ProductPhotoReportViewModel["reviewSignals"][number],
): ProductPhotoAdapterReadinessSignal {
  const category = canonicalSignalCategory(signal.category);

  return {
    label: signalLabelFor({ ...signal, category }),
    category,
    severity: canonicalSeverity(signal.severity),
    confidencePercent: clampPercent(signal.confidencePercent),
    reviewNote: "Derived view-model signal for manual review triage.",
  };
}

function defaultReadinessResult(
  inputKind: ProductPhotoAdapterReadinessResult["inputKind"],
  options?: {
    accepted?: boolean;
    legacyCompatibility?: ProductPhotoAdapterReadinessResult["legacyCompatibility"];
    limitations?: string[];
  },
): ProductPhotoAdapterReadinessResult {
  return {
    boundary: "product-photo-adapter-readiness",
    devOnly: true,
    probeOnly: true,
    runtimeLive: false,
    manualReviewOnly: true,
    evidenceType: "product-photo",
    readinessAccepted: options?.accepted ?? false,
    inputKind,
    legacyCompatibility: options?.legacyCompatibility,
    score: {
      label: "Evidence Reliability Score",
      value: 0,
      scope: "Local evidence quality and review readiness only",
      meaning: "No adapter readiness output was accepted for runtime use.",
    },
    confidence: "Low confidence",
    reviewPriority: "Manual review",
    localSignalLevel: "None",
    sourceKind: "manual-review-context",
    reviewSummary: "Product-photo adapter readiness was not accepted for live runtime use.",
    recommendedSupportAction: "Manual review recommended. Continue using the current receipt workflow.",
    customerSafeWording: "Thanks for the evidence. We will follow up if more context is needed.",
    limitations: [
      "Adapter readiness boundary is dev/probe-only",
      "Product-photo runtime is not live",
      "External verification was not performed",
      "High score does not prove the product photo or claim",
      ...(options?.limitations ?? []),
    ],
    signals: [],
    privacy: {
      derivedSummaryOnly: true,
      privateSourceValuesOmitted: true,
      exactMetadataOmitted: true,
      externalHandlesOmitted: true,
    },
    isolation: {
      localAnalysisResultRequired: false,
      analyzeEvidenceFileInvoked: false,
      analyzerRoutingInvoked: false,
      uiUploadReportScoringParserFixturePathsInvoked: false,
      providersStorageIntegrationsCaseQueuesInvoked: false,
    },
  };
}

function legacyDamagePhotoQuarantineResult(): ProductPhotoAdapterReadinessResult {
  return defaultReadinessResult("legacy-quarantine", {
    legacyCompatibility: {
      alias: "damage-photo",
      canonicalEvidenceType: "product-photo",
      quarantined: true,
      runtimeCandidate: false,
      note: "Legacy damage-photo input is compatibility-only and is not accepted as adapter readiness.",
    },
    limitations: ["Legacy damage-photo cannot become canonical product-photo adapter output"],
  });
}

function nestedAnalysisEvidenceType(input: ProductPhotoAdapterReadinessInput): unknown {
  if (input.inputKind !== "analysis-result") {
    return undefined;
  }

  return (input.result as { evidenceType?: unknown } | undefined)?.evidenceType;
}

function topLevelEvidenceTypeIsProductPhotoOrAbsent(input: ProductPhotoAdapterReadinessInput) {
  return input.evidenceType === undefined || input.evidenceType === "product-photo";
}

function readinessFromAnalysisResult(result: ProductPhotoEvidenceAnalysisResult): ProductPhotoAdapterReadinessResult {
  const score = clampPercent(result.score);
  const signals = result.signals.slice(0, 6).map(readinessSignalFromShared);

  return {
    ...defaultReadinessResult("analysis-result", { accepted: true }),
    score: {
      label: "Evidence Reliability Score",
      value: score,
      scope: "Local evidence quality and review readiness only",
      meaning: "Score reflects sanitized product-photo review readiness only.",
    },
    confidence: canonicalConfidence(result.confidenceLevel),
    reviewPriority: reviewPriorityFor(score, signals),
    localSignalLevel: signalLevelFor(signals),
    sourceKind: sourceKindFor(result.sourceKind),
    reviewSummary: `Product-photo adapter readiness accepted sanitized analysis-result input with ${signals.length} local review signal${
      signals.length === 1 ? "" : "s"
    }.`,
    recommendedSupportAction:
      "Manual review recommended. Compare product-photo context with available receipt or order evidence before support handling continues.",
    customerSafeWording:
      "Thanks for the photo. We are reviewing it with the available order information and will follow up if more context is needed.",
    limitations: [
      "Adapter readiness boundary is dev/probe-only",
      "Product-photo runtime is not live",
      "External verification was not performed",
      "High score does not prove the product photo or claim",
      "Only derived product-photo summaries are included",
    ],
    signals,
  };
}

function readinessFromViewModel(viewModel: ProductPhotoReportViewModel): ProductPhotoAdapterReadinessResult {
  const score = clampPercent(viewModel.score.value);
  const signals = viewModel.reviewSignals.slice(0, 6).map(readinessSignalFromViewModel);

  return {
    ...defaultReadinessResult("report-view-model", { accepted: true }),
    score: {
      label: "Evidence Reliability Score",
      value: score,
      scope: "Local evidence quality and review readiness only",
      meaning: "Score reflects sanitized product-photo view-model readiness only.",
    },
    confidence: canonicalConfidence(viewModel.confidence),
    reviewPriority: reviewPriorityFor(score, signals),
    localSignalLevel: signalLevelFor(signals),
    sourceKind: "manual-review-context",
    reviewSummary: `Product-photo adapter readiness accepted sanitized report-view-model input with ${signals.length} local review signal${
      signals.length === 1 ? "" : "s"
    }.`,
    recommendedSupportAction:
      "Manual review recommended. Use the product-photo summary only as local support review context.",
    customerSafeWording:
      "Thanks for the photo. We are reviewing it with the available order information and will follow up if more context is needed.",
    limitations: [
      "Adapter readiness boundary is dev/probe-only",
      "Product-photo runtime is not live",
      "External verification was not performed",
      "High score does not prove the product photo or claim",
      "Only derived view-model summaries are included",
    ],
    signals,
  };
}

export function routeProductPhotoEvidenceForDevOnlyBoundary(
  input: ProductPhotoRoutingAdapterInput = {},
): ProductPhotoRoutingAdapterResult {
  const recognition = recognizeProductPhotoEvidence(input);
  const routed =
    recognition.devOnly &&
    recognition.productPhotoCompatible &&
    recognition.futureRoutingCandidate &&
    recognition.recognitionState === "product-photo-compatible" &&
    recognition.compatibilityAlias?.alias !== "damage-photo";

  if (!routed) {
    return {
      boundary: "product-photo-routing-adapter",
      devOnly: true,
      recognition,
      routed: false,
      reasons: recognition.reasons,
      limitations: buildLimitations(recognition, false),
    };
  }

  const productPhotoDetails = buildProductPhotoAnalysisDetails({
    ...input.productPhotoAnalysisInput,
    subjectType: input.productPhotoAnalysisInput?.subjectType ?? recognition.subjectType,
  });

  return {
    boundary: "product-photo-routing-adapter",
    devOnly: true,
    recognition,
    productPhotoDetails,
    routed: true,
    reasons: [...recognition.reasons, "product-photo future routing candidate prepared"],
    limitations: buildLimitations(recognition, true),
  };
}

export function prepareProductPhotoAdapterReadinessForDevOnlyBoundary(
  input: ProductPhotoAdapterReadinessInput = {},
): ProductPhotoAdapterReadinessResult {
  const analysisEvidenceType = nestedAnalysisEvidenceType(input);

  if (input.evidenceType === "damage-photo" || analysisEvidenceType === "damage-photo") {
    return legacyDamagePhotoQuarantineResult();
  }

  if (!topLevelEvidenceTypeIsProductPhotoOrAbsent(input)) {
    return defaultReadinessResult("unsupported", {
      limitations: ["Top-level evidence type did not match canonical product-photo adapter readiness"],
    });
  }

  if (
    input.inputKind === "analysis-result" &&
    input.result?.module === "productPhoto" &&
    analysisEvidenceType === "product-photo"
  ) {
    return readinessFromAnalysisResult(input.result);
  }

  if (
    input.inputKind === "report-view-model" &&
    input.viewModel?.boundary === "product-photo-report-view-model" &&
    input.viewModel.evidenceType === "product-photo"
  ) {
    return readinessFromViewModel(input.viewModel);
  }

  return defaultReadinessResult("unsupported", {
    limitations: ["Unsupported adapter input was safely collapsed"],
  });
}
