import { existsSync } from "node:fs";
import { join } from "node:path";

import { getVisionSandboxFixtureMetadata, listApprovedVisionSandboxFixtureKeys } from "./fixture-registry";
import { resolveVisionSandboxFixtureReference } from "./fixture-resolver";
import { buildVisionSandboxStubOutput } from "./sandbox-output";
import type { VisionSandboxAnalysisMode, VisionSandboxResultStatus } from "./types";

const incompatibleModeCandidates: readonly VisionSandboxAnalysisMode[] = [
  "receipt-visual-review",
  "order-screenshot-review",
  "product-photo-review",
  "damaged-product-review",
  "altered-ai-uncertainty-review",
  "unsupported-evidence-review",
  "provider-failure-review",
];

const operationalSimulationStatuses: readonly Exclude<VisionSandboxResultStatus, "completed" | "unsupported">[] = [
  "refused",
  "provider-timeout",
  "provider-rate-limited",
  "provider-unavailable",
  "cost-limit-reached",
  "schema-validation-failed",
  "internal-sandbox-error",
];

export type VisionSandboxFixtureRunnerCase = {
  fixtureKey: string;
  expectedStatus: VisionSandboxResultStatus | null;
  actualStatus: VisionSandboxResultStatus;
  referencePath: string | null;
  referenceExists: boolean;
  targetMode: VisionSandboxAnalysisMode | null;
  defaultModeMatchesMetadata: boolean;
  requestedModeAccepted: boolean;
  modeFallbackMatchesMetadata: boolean;
  guardStatusPassed: boolean;
  limitationShapeValid: boolean;
  privacyBoundaryValid: boolean;
  packageSafetyValid: boolean;
  safeSupportSummaryValid: boolean;
  passed: boolean;
};

export type VisionSandboxFailureSimulationRun = {
  simulationStatus: Exclude<VisionSandboxResultStatus, "completed" | "unsupported">;
  actualStatus: VisionSandboxResultStatus;
  hasNoAlteredAiValue: boolean;
  hasOperationalLimitation: boolean;
  guardStatusPassed: boolean;
  privacyBoundaryValid: boolean;
  safeSupportSummaryValid: boolean;
  passed: boolean;
};

export type VisionSandboxFixtureRunnerReport = {
  runnerPhase: "4.32";
  fixtureCount: number;
  fixtureRuns: readonly VisionSandboxFixtureRunnerCase[];
  failureSimulationRuns: readonly VisionSandboxFailureSimulationRun[];
  passed: boolean;
  summary: string;
};

function firstIncompatibleMode(targetModes: readonly VisionSandboxAnalysisMode[]): VisionSandboxAnalysisMode {
  return incompatibleModeCandidates.find((candidate) => !targetModes.includes(candidate)) ?? "unsupported-evidence-review";
}

function summaryIsSafe(summary: string): boolean {
  return (
    /Synthetic sandbox stub/i.test(summary) &&
    !/proof|final decision|confirmed|automatic/i.test(summary)
  );
}

function buildFixtureRun(fixtureKey: string, repoRoot: string): VisionSandboxFixtureRunnerCase {
  const metadata = getVisionSandboxFixtureMetadata(fixtureKey);
  const reference = resolveVisionSandboxFixtureReference(fixtureKey);
  const output = buildVisionSandboxStubOutput({ fixtureKey });
  const targetMode = metadata?.targetAnalysisModes[0] ?? null;
  const requestedOutput = targetMode ? buildVisionSandboxStubOutput({ fixtureKey, analysisMode: targetMode }) : output;
  const fallbackMode = metadata ? firstIncompatibleMode(metadata.targetAnalysisModes) : "unsupported-evidence-review";
  const fallbackOutput = buildVisionSandboxStubOutput({ fixtureKey, analysisMode: fallbackMode });
  const referenceExists = Boolean(reference && existsSync(join(repoRoot, reference.repoPath)));
  const limitationShapeValid =
    output.limitations.length > 0 &&
    (output.resultStatus === "completed" ||
      (output.observations.length === 0 &&
        output.alteredOrAiGeneratedImageUncertainty.value === null &&
        output.uncertaintySignals.every((signal) => signal.manualReviewDriver)));
  const privacyBoundaryValid =
    output.privacyFlags.syntheticOnly &&
    !output.privacyFlags.realCustomerEvidenceUsed &&
    !output.privacyFlags.customerIdentifiersReturned &&
    !output.privacyFlags.rawOcrReturned &&
    !output.privacyFlags.providerPayloadReturned &&
    !output.retentionFlags.fileRetained &&
    !output.retentionFlags.rawOcrRetained &&
    !output.retentionFlags.providerPayloadLogged &&
    !output.retentionFlags.storageUsed &&
    !output.retentionFlags.persistenceUsed;
  const packageSafetyValid =
    output.packageSafety.safeForDownloadablePackage &&
    output.packageSafety.safeForDemoMode &&
    output.packageSafety.safeForSelfHostedInstall &&
    !output.packageSafety.requiresProviderAccess &&
    !output.packageSafety.requiresEnvSecrets &&
    !output.packageSafety.packageArtifactCreated;
  const guardStatusPassed = output.privacyGuard.passed && output.packageSafetyGuard.passed && output.schemaShapeGuard.passed;
  const safeSupportSummaryValid = summaryIsSafe(output.safeSupportSummary);
  const run = {
    fixtureKey,
    expectedStatus: metadata?.expectedResultStatus ?? null,
    actualStatus: output.resultStatus,
    referencePath: reference?.repoPath ?? null,
    referenceExists,
    targetMode,
    defaultModeMatchesMetadata: Boolean(targetMode && output.analysisMode === targetMode),
    requestedModeAccepted: Boolean(targetMode && requestedOutput.analysisMode === targetMode),
    modeFallbackMatchesMetadata: Boolean(targetMode && fallbackOutput.analysisMode === targetMode),
    guardStatusPassed,
    limitationShapeValid,
    privacyBoundaryValid,
    packageSafetyValid,
    safeSupportSummaryValid,
    passed: false,
  };

  return {
    ...run,
    passed:
      run.expectedStatus === run.actualStatus &&
      run.referenceExists &&
      run.defaultModeMatchesMetadata &&
      run.requestedModeAccepted &&
      run.modeFallbackMatchesMetadata &&
      run.guardStatusPassed &&
      run.limitationShapeValid &&
      run.privacyBoundaryValid &&
      run.packageSafetyValid &&
      run.safeSupportSummaryValid,
  };
}

function buildFailureSimulationRun(
  simulationStatus: Exclude<VisionSandboxResultStatus, "completed" | "unsupported">,
): VisionSandboxFailureSimulationRun {
  const output = buildVisionSandboxStubOutput({
    fixtureKey: "synthetic-clean-receipt-baseline",
    simulationStatus,
  });
  const hasOperationalLimitation =
    output.limitations.some((limitation) =>
      [
        "operational-timeout",
        "provider-unavailable",
        "rate-limit",
        "cost-limit",
        "schema-validation",
        "internal-sandbox-error",
      ].includes(limitation.type),
    ) &&
    output.observations.length === 0 &&
    output.uncertaintySignals.every((signal) => signal.manualReviewDriver);
  const privacyBoundaryValid =
    output.privacyFlags.syntheticOnly &&
    !output.privacyFlags.realCustomerEvidenceUsed &&
    !output.privacyFlags.rawOcrReturned &&
    !output.privacyFlags.providerPayloadReturned &&
    !output.retentionFlags.providerPayloadLogged;
  const guardStatusPassed = output.privacyGuard.passed && output.packageSafetyGuard.passed && output.schemaShapeGuard.passed;
  const safeSupportSummaryValid = summaryIsSafe(output.safeSupportSummary);
  const run = {
    simulationStatus,
    actualStatus: output.resultStatus,
    hasNoAlteredAiValue: output.alteredOrAiGeneratedImageUncertainty.value === null,
    hasOperationalLimitation,
    guardStatusPassed,
    privacyBoundaryValid,
    safeSupportSummaryValid,
    passed: false,
  };

  return {
    ...run,
    passed:
      run.actualStatus === simulationStatus &&
      run.hasNoAlteredAiValue &&
      run.hasOperationalLimitation &&
      run.guardStatusPassed &&
      run.privacyBoundaryValid &&
      run.safeSupportSummaryValid,
  };
}

export function runVisionSandboxFixtureRunner(repoRoot = process.cwd()): VisionSandboxFixtureRunnerReport {
  const fixtureRuns = listApprovedVisionSandboxFixtureKeys().map((fixtureKey) => buildFixtureRun(fixtureKey, repoRoot));
  const failureSimulationRuns = operationalSimulationStatuses.map(buildFailureSimulationRun);
  const passed =
    fixtureRuns.length === 12 &&
    fixtureRuns.every((run) => run.passed) &&
    failureSimulationRuns.every((run) => run.passed);

  return {
    runnerPhase: "4.32",
    fixtureCount: fixtureRuns.length,
    fixtureRuns,
    failureSimulationRuns,
    passed,
    summary:
      "Synthetic sandbox fixture-runner validation only; no provider call, route behavior, upload handling, storage, persistence, or receipt runtime change.",
  };
}
