import {
  getVisionSandboxFixtureMetadata,
  isApprovedVisionSandboxFixtureKey,
  summarizeVisionSandboxFixture,
} from "./fixture-registry";
import { resolveVisionSandboxFixtureReference } from "./fixture-resolver";
import {
  VISION_SANDBOX_PHASE,
  VISION_SANDBOX_PROVIDER_FAMILY,
  VISION_SANDBOX_PROVIDER_MODE,
  VISION_SANDBOX_SCHEMA_VERSION,
  type VisionSandboxAlteredAiUncertainty,
  type VisionSandboxAnalysisMode,
  type VisionSandboxFixtureMetadata,
  type VisionSandboxGuardStatus,
  type VisionSandboxInput,
  type VisionSandboxLimitation,
  type VisionSandboxManualReviewDriver,
  type VisionSandboxObservation,
  type VisionSandboxOutput,
  type VisionSandboxPackageSafetyStatus,
  type VisionSandboxPrivacyFlags,
  type VisionSandboxResultStatus,
  type VisionSandboxRetentionFlags,
  type VisionSandboxUncertaintySignal,
} from "./types";

const allowedInputKeys = new Set(["fixtureKey", "analysisMode", "simulationStatus"]);
const allowedAnalysisModes = new Set<VisionSandboxAnalysisMode>([
  "receipt-visual-review",
  "order-screenshot-review",
  "product-photo-review",
  "damaged-product-review",
  "altered-ai-uncertainty-review",
  "unsupported-evidence-review",
  "provider-failure-review",
]);
const unsupportedInputKeyPattern =
  /(?:file|blob|byte|binary|multipart|formdata|url|href|storage|provider|payload|rawocr|customer|ticket|order|tracking|case|claim|evidence|upload|persist|metadata)/i;
const urlLikeValuePattern = /(?:https?:\/\/|blob:|data:|file:|s3:\/\/|gs:\/\/)/i;
const privateIdentifierValuePatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){0,6}(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|way|boulevard|blvd\.?)\b/i,
  /\b(?:order|tracking|ticket|case|claim|evidence)[-_ #:]?[A-Z0-9-]{4,}\b/i,
];

const failureSimulationStatuses = new Set<VisionSandboxInput["simulationStatus"]>([
  "provider-timeout",
  "provider-rate-limited",
  "provider-unavailable",
  "cost-limit-reached",
  "schema-validation-failed",
  "internal-sandbox-error",
  "refused",
]);

function privacyFlags(): VisionSandboxPrivacyFlags {
  return {
    syntheticOnly: true,
    realCustomerEvidenceAllowed: false,
    realCustomerEvidenceUsed: false,
    customerIdentifiersAllowed: false,
    customerIdentifiersReturned: false,
    rawOcrReturned: false,
    providerPayloadReturned: false,
    publicImageUrlAllowed: false,
    storageHandleAllowed: false,
  };
}

function retentionFlags(): VisionSandboxRetentionFlags {
  return {
    fileRetained: false,
    rawOcrRetained: false,
    providerPayloadRetained: false,
    providerPayloadLogged: false,
    objectUrlRetained: false,
    storageUsed: false,
    persistenceUsed: false,
  };
}

function packageSafety(metadata: VisionSandboxFixtureMetadata | null): VisionSandboxPackageSafetyStatus {
  return {
    safeForDownloadablePackage: metadata?.safeForDownloadablePackage ?? false,
    safeForDemoMode: metadata?.safeForDemoMode ?? false,
    safeForSelfHostedInstall: metadata?.safeForSelfHostedInstall ?? false,
    packageDistributionStatus: metadata?.packageDistributionStatus ?? "missing-fixture-metadata",
    requiresProviderAccess: false,
    requiresEnvSecrets: false,
    packageArtifactCreated: false,
  };
}

function validateSandboxInput(input: unknown): { ok: true; input: VisionSandboxInput } | { ok: false; reasons: string[] } {
  const reasons: string[] = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reasons: ["Input must be a small sandbox fixture object."] };
  }

  for (const [key, value] of Object.entries(input)) {
    if (!allowedInputKeys.has(key) || unsupportedInputKeyPattern.test(key)) {
      reasons.push(`Unsupported sandbox input key: ${key}`);
    }

    const isApprovedEnumValue =
      (key === "analysisMode" && allowedAnalysisModes.has(value as VisionSandboxAnalysisMode)) ||
      (key === "simulationStatus" && failureSimulationStatuses.has(value as VisionSandboxInput["simulationStatus"]));

    if (
      key !== "fixtureKey" &&
      typeof value === "string" &&
      !isApprovedEnumValue &&
      (urlLikeValuePattern.test(value) || privateIdentifierValuePatterns.some((pattern) => pattern.test(value)))
    ) {
      reasons.push(`Unsupported sandbox input value for key: ${key}`);
    }

    if (value && typeof value === "object") {
      reasons.push(`Nested sandbox input is not supported for key: ${key}`);
    }
  }

  const fixtureKey = (input as VisionSandboxInput).fixtureKey;

  if (typeof fixtureKey !== "string" || !isApprovedVisionSandboxFixtureKey(fixtureKey)) {
    reasons.push("Fixture key must be an approved synthetic vision sandbox fixture.");
  }

  const simulationStatus = (input as VisionSandboxInput).simulationStatus;

  const analysisMode = (input as VisionSandboxInput).analysisMode;

  if (analysisMode !== undefined && !allowedAnalysisModes.has(analysisMode)) {
    reasons.push("Analysis mode must be an approved sandbox mode.");
  }

  if (simulationStatus !== undefined && !failureSimulationStatuses.has(simulationStatus)) {
    reasons.push("Simulation status must be a safe sandbox failure status.");
  }

  return reasons.length > 0 ? { ok: false, reasons } : { ok: true, input: input as VisionSandboxInput };
}

function levelFromMetadata(metadata: VisionSandboxFixtureMetadata | null): "low" | "medium" | "high" | "not-applicable" {
  const signalText = metadata?.expectedUncertaintySignalTypes.join(" ").toLowerCase() ?? "";

  if (signalText.includes("high")) return "high";
  if (signalText.includes("medium") || signalText.includes("insufficient")) return "medium";
  if (signalText.includes("low")) return "low";
  return "not-applicable";
}

function priorityFromMetadata(metadata: VisionSandboxFixtureMetadata | null): "low" | "medium" | "high" {
  return metadata?.expectedManualReviewDriverPriorities[0] ?? "medium";
}

function analysisModeFor(metadata: VisionSandboxFixtureMetadata, requestedMode?: VisionSandboxAnalysisMode) {
  if (requestedMode && metadata.targetAnalysisModes.includes(requestedMode)) {
    return requestedMode;
  }

  return metadata.targetAnalysisModes[0] ?? "unsupported-evidence-review";
}

function resultStatusFor(
  metadata: VisionSandboxFixtureMetadata | null,
  simulationStatus?: VisionSandboxInput["simulationStatus"],
): VisionSandboxResultStatus {
  if (simulationStatus) {
    return simulationStatus;
  }

  return metadata?.expectedResultStatus ?? "internal-sandbox-error";
}

function observationsFor(
  metadata: VisionSandboxFixtureMetadata | null,
  status: VisionSandboxResultStatus,
): readonly VisionSandboxObservation[] {
  if (!metadata || status !== "completed") {
    return [];
  }

  return metadata.expectedObservationCategories.map((category, index) => ({
    observationId: `obs-${String(index + 1).padStart(3, "0")}`,
    category,
    description: `Synthetic fixture metadata notes ${category} for internal reviewer context only.`,
    basis: "synthetic-fixture-metadata",
    confidenceLevel: levelFromMetadata(metadata),
    privacySafe: true,
    manualReviewRelevance: "Use this as a review-support observation, separate from uncertainty signals and limitations.",
  }));
}

function uncertaintySignalsFor(
  metadata: VisionSandboxFixtureMetadata | null,
  observations: readonly VisionSandboxObservation[],
  status: VisionSandboxResultStatus,
): readonly VisionSandboxUncertaintySignal[] {
  if (!metadata) {
    return [];
  }

  if (status !== "completed") {
    return [
      {
        signalId: "sig-001",
        signalType: status === "unsupported" ? "unsupported-evidence-limitation" : "provider-output-limitation",
        level: "not-applicable",
        description:
          status === "unsupported"
            ? "Unsupported synthetic evidence is an evidence limitation only."
            : "Sandbox output is unavailable or incomplete because of an operational limitation.",
        supportingObservationIds: [],
        confidenceLevel: "not-applicable",
        manualReviewDriver: true,
        safeLanguage: "This signal supports manual review only and does not decide the claim.",
      },
    ];
  }

  return metadata.expectedUncertaintySignalTypes.map((signalType, index) => ({
    signalId: `sig-${String(index + 1).padStart(3, "0")}`,
    signalType,
    level: levelFromMetadata(metadata),
    description: `${signalType} is represented as a sandbox review signal only.`,
    supportingObservationIds: observations.map((observation) => observation.observationId),
    confidenceLevel: levelFromMetadata(metadata),
    manualReviewDriver: priorityFromMetadata(metadata) !== "low",
    safeLanguage: "This is review-support wording only; it is not proof and not a final decision.",
  }));
}

function alteredAiUncertaintyFor(
  metadata: VisionSandboxFixtureMetadata | null,
  observations: readonly VisionSandboxObservation[],
  status: VisionSandboxResultStatus,
): VisionSandboxAlteredAiUncertainty {
  const level = levelFromMetadata(metadata);
  const applies = metadata?.scenarioGroup === "altered-ai-uncertainty-review" && status === "completed";
  const value = applies ? (level === "high" ? 82 : level === "medium" ? 52 : 18) : null;
  const unavailable =
    status === "provider-timeout" ||
    status === "provider-rate-limited" ||
    status === "provider-unavailable" ||
    status === "cost-limit-reached" ||
    status === "internal-sandbox-error" ||
    status === "refused";

  return {
    label: "altered-or-AI-generated-image uncertainty",
    value,
    scale: "1-100",
    applicability: applies
      ? "applicable"
      : status === "unsupported"
        ? "unsupported"
        : status === "schema-validation-failed"
          ? "schema-invalid"
          : unavailable
            ? "unavailable"
            : "not-applicable",
    meaning:
      "Altered-or-AI-generated-image uncertainty is a review signal only, a manual-review driver, not proof, not a final decision, and not a fraud score.",
    confidenceLevel: applies ? level : "not-applicable",
    supportingObservationIds: applies ? observations.map((observation) => observation.observationId) : [],
    limitations: [
      "Synthetic sandbox output only.",
      "A low value does not confirm authenticity.",
      "A high value does not confirm alteration or AI generation.",
    ],
    reviewSignalOnly: true,
    manualReviewDriver: applies && level !== "low",
    notProof: true,
    notFinalDecision: true,
  };
}

function limitationsFor(metadata: VisionSandboxFixtureMetadata | null, status: VisionSandboxResultStatus): readonly VisionSandboxLimitation[] {
  const base: VisionSandboxLimitation[] = [
    {
      limitationId: "lim-001",
      type: "sandbox-only",
      description: "This is a script/module-only sandbox stub derived from approved synthetic fixture metadata.",
      impact: "It cannot be used as production analysis or customer-facing claim output.",
      recommendedHandling: "Use it only for local developer validation of sandbox shape and safety wording.",
    },
    {
      limitationId: "lim-002",
      type: "synthetic-fixture-only",
      description: "The fixture reference is synthetic-only and non-identifying.",
      impact: "It does not represent real customer evidence or external verification.",
      recommendedHandling: "Keep reviewer conclusions outside this sandbox output.",
    },
  ];

  if (status === "unsupported") {
    base.push({
      limitationId: "lim-003",
      type: "unsupported-evidence",
      description: "The synthetic fixture is outside the completed visual-review shape.",
      impact: "Unsupported evidence is an evidence limitation only.",
      recommendedHandling: "Request eligible evidence or continue human review using approved workflow guidance.",
    });
  }

  if (status === "provider-timeout" || status === "provider-unavailable" || status === "provider-rate-limited" || status === "cost-limit-reached") {
    base.push({
      limitationId: "lim-003",
      type:
        status === "provider-timeout"
          ? "operational-timeout"
          : status === "provider-unavailable"
            ? "provider-unavailable"
            : status === "provider-rate-limited"
              ? "rate-limit"
              : "cost-limit",
      description: "Sandbox failure simulation is operational only.",
      impact: "No evidence conclusion should be drawn from unavailable sandbox output.",
      recommendedHandling: "Proceed with manual review or retry only after an approved operational policy exists.",
    });
  }

  if (status === "schema-validation-failed" || status === "internal-sandbox-error" || status === "refused") {
    base.push({
      limitationId: "lim-003",
      type: status === "schema-validation-failed" ? "schema-validation" : "internal-sandbox-error",
      description: "Sandbox output is unavailable under the approved local shape.",
      impact: "Partial output should not be treated as analysis.",
      recommendedHandling: "Treat this as a developer-only validation limitation.",
    });
  }

  if (metadata?.expectedLimitationTypes.includes("missing-context")) {
    base.push({
      limitationId: "lim-004",
      type: "missing-context",
      description: "Synthetic metadata expects missing-context review.",
      impact: "Reviewer comparison may need additional eligible evidence.",
      recommendedHandling: "Keep the missing context as a review driver, not a conclusion.",
    });
  }

  return base;
}

function manualReviewDriversFor(
  metadata: VisionSandboxFixtureMetadata | null,
  observations: readonly VisionSandboxObservation[],
  signals: readonly VisionSandboxUncertaintySignal[],
  status: VisionSandboxResultStatus,
): readonly VisionSandboxManualReviewDriver[] {
  return [
    {
      driverId: "drv-001",
      priority: status === "completed" ? priorityFromMetadata(metadata) : "medium",
      reason:
        status === "completed"
          ? "Synthetic sandbox output can guide internal reviewer attention only."
          : "Sandbox output is unavailable or limited, so human review should proceed without drawing automated conclusions.",
      relatedObservationIds: observations.map((observation) => observation.observationId),
      relatedSignalIds: signals.map((signal) => signal.signalId),
      recommendedInternalAction: "Compare approved evidence through existing manual-review workflow guidance.",
      customerSafeBoundary: "Do not present this sandbox stub as proof, accusation, or claim disposition.",
    },
  ];
}

function guardStatusFor(output: Pick<VisionSandboxOutput, "fixture" | "packageSafety" | "privacyFlags" | "retentionFlags">): {
  privacyGuard: VisionSandboxGuardStatus;
  packageSafetyGuard: VisionSandboxGuardStatus;
} {
  const privacyReasons = [
    output.privacyFlags.syntheticOnly ? "synthetic-only input boundary" : "synthetic-only marker missing",
    !output.privacyFlags.realCustomerEvidenceUsed ? "no real customer evidence used" : "real customer evidence marker present",
    !output.retentionFlags.providerPayloadLogged ? "no provider payload logging" : "provider payload logging marker present",
  ];
  const packageReasons = [
    output.packageSafety.safeForDownloadablePackage ? "fixture metadata package-safe" : "fixture metadata not package-safe",
    !output.packageSafety.requiresProviderAccess ? "no provider access required" : "provider access required",
    !output.packageSafety.packageArtifactCreated ? "no package artifact created" : "package artifact marker present",
  ];

  return {
    privacyGuard: {
      passed: privacyReasons.every((reason) => !reason.includes("present") && !reason.includes("missing")),
      reasons: privacyReasons,
    },
    packageSafetyGuard: {
      passed: packageReasons.every(
        (reason) =>
          reason !== "fixture metadata not package-safe" &&
          reason !== "provider access required" &&
          reason !== "package artifact marker present",
      ),
      reasons: packageReasons,
    },
  };
}

export function buildVisionSandboxStubOutput(input: unknown): VisionSandboxOutput {
  const validation = validateSandboxInput(input);
  const metadata = validation.ok ? getVisionSandboxFixtureMetadata(validation.input.fixtureKey) : null;
  const status = validation.ok ? resultStatusFor(metadata, validation.input.simulationStatus) : "internal-sandbox-error";
  const analysisMode = metadata ? analysisModeFor(metadata, validation.ok ? validation.input.analysisMode : undefined) : "unsupported-evidence-review";
  const fixtureReference = validation.ok ? resolveVisionSandboxFixtureReference(validation.input.fixtureKey) : null;
  const observations = observationsFor(metadata, status);
  const uncertaintySignals = uncertaintySignalsFor(metadata, observations, status);
  const limitations = limitationsFor(metadata, status);
  const outputBase = {
    schemaVersion: VISION_SANDBOX_SCHEMA_VERSION,
    providerMode: VISION_SANDBOX_PROVIDER_MODE,
    providerFamily: VISION_SANDBOX_PROVIDER_FAMILY,
    skeletonPhase: VISION_SANDBOX_PHASE,
    resultStatus: status,
    analysisMode,
    fixture: metadata ? summarizeVisionSandboxFixture(metadata) : null,
    fixtureReference,
    observations,
    uncertaintySignals,
    alteredOrAiGeneratedImageUncertainty: alteredAiUncertaintyFor(metadata, observations, status),
    confidenceNotes:
      status === "completed"
        ? ["Confidence describes synthetic sandbox shape reliability only, not claim truth."]
        : ["No completed sandbox confidence is available for this limitation state."],
    manualReviewDrivers: manualReviewDriversFor(metadata, observations, uncertaintySignals, status),
    limitations,
    safeSupportSummary:
      status === "completed"
        ? "Synthetic sandbox stub produced internal review-support context only."
        : "Synthetic sandbox stub is limited or unavailable; no evidence conclusion should be drawn.",
    privacyFlags: privacyFlags(),
    retentionFlags: retentionFlags(),
    packageSafety: packageSafety(metadata),
  } satisfies Omit<VisionSandboxOutput, "privacyGuard" | "packageSafetyGuard" | "schemaShapeGuard" | "runtimeIsolation">;
  const guards = guardStatusFor(outputBase);

  return {
    ...outputBase,
    ...guards,
    schemaShapeGuard: {
      passed:
        outputBase.providerMode === "sandbox" &&
        outputBase.providerFamily === "openai-vision-style" &&
        outputBase.limitations.length > 0 &&
        outputBase.alteredOrAiGeneratedImageUncertainty.reviewSignalOnly,
      reasons: [
        "provider mode locked to sandbox",
        "provider family locked to openai-vision-style",
        "limitations are present",
        "altered-or-AI-generated-image uncertainty remains review signal only",
      ],
    },
    runtimeIsolation: {
      developerOnly: true,
      routeImplemented: false,
      providerCallsAllowed: false,
      uploadHandlingAllowed: false,
      storageAllowed: false,
      persistenceAllowed: false,
      receiptRuntimeChanged: false,
    },
  };
}
