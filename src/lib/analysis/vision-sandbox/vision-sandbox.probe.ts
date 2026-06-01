import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildVisionSandboxStubOutput,
  listApprovedVisionSandboxFixtureKeys,
  resolveVisionSandboxFixtureReference,
} from "./index";

const repoRoot = process.cwd();
const sandboxSources = [
  "src/lib/analysis/vision-sandbox/types.ts",
  "src/lib/analysis/vision-sandbox/fixture-registry.ts",
  "src/lib/analysis/vision-sandbox/fixture-resolver.ts",
  "src/lib/analysis/vision-sandbox/sandbox-output.ts",
  "src/lib/analysis/vision-sandbox/index.ts",
].map((repoPath) => readFileSync(join(repoRoot, repoPath), "utf8"));
const sandboxSourceCorpus = sandboxSources.join("\n");

function assertProbeChecksPass(group: string, checks: Record<string, boolean>) {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Vision sandbox skeleton probe failed (${group}): ${failed.join(", ")}`);
  }
}

function serializedHasUnsafeTerms(value: unknown) {
  const serialized = JSON.stringify(value).toLowerCase();
  const unsafeTerms = [
    ["fr", "aud", " confirmed"].join(""),
    ["customer", " accusation"].join(" "),
    ["automatic", " disposition"].join(" "),
    ["final", " claim"].join(" "),
    ["proof", " of", " alteration"].join(""),
  ];

  return unsafeTerms.some((term) => serialized.includes(term));
}

function runVisionSandboxSkeletonProbe() {
  const fixtureKeys = listApprovedVisionSandboxFixtureKeys();
  const outputs = fixtureKeys.map((fixtureKey) => buildVisionSandboxStubOutput({ fixtureKey }));
  const alteredLow = buildVisionSandboxStubOutput({ fixtureKey: "synthetic-altered-ai-low-concern" });
  const alteredMedium = buildVisionSandboxStubOutput({ fixtureKey: "synthetic-altered-ai-medium-concern" });
  const alteredHigh = buildVisionSandboxStubOutput({ fixtureKey: "synthetic-altered-ai-high-concern" });
  const unsupported = buildVisionSandboxStubOutput({ fixtureKey: "synthetic-unsupported-evidence" });
  const timeout = buildVisionSandboxStubOutput({ fixtureKey: "synthetic-provider-timeout-simulation" });
  const schemaFailure = buildVisionSandboxStubOutput({ fixtureKey: "synthetic-schema-validation-failure" });
  const unavailableSimulation = buildVisionSandboxStubOutput({
    fixtureKey: "synthetic-clean-receipt-baseline",
    simulationStatus: "provider-unavailable",
  });
  const rateLimitSimulation = buildVisionSandboxStubOutput({
    fixtureKey: "synthetic-clean-receipt-baseline",
    simulationStatus: "provider-rate-limited",
  });
  const costLimitSimulation = buildVisionSandboxStubOutput({
    fixtureKey: "synthetic-clean-receipt-baseline",
    simulationStatus: "cost-limit-reached",
  });
  const refusedSimulation = buildVisionSandboxStubOutput({
    fixtureKey: "synthetic-clean-receipt-baseline",
    simulationStatus: "refused",
  });
  const internalErrorSimulation = buildVisionSandboxStubOutput({
    fixtureKey: "synthetic-clean-receipt-baseline",
    simulationStatus: "internal-sandbox-error",
  });
  const invalidInput = buildVisionSandboxStubOutput({
    fixtureKey: "not-approved",
    imageUrl: "blocked",
  });

  const moduleChecks = {
    allRegistryKeysLoaded: fixtureKeys.length === 12,
    everyFixtureHasReference: fixtureKeys.every((fixtureKey) => Boolean(resolveVisionSandboxFixtureReference(fixtureKey))),
    completedSvgReferences:
      resolveVisionSandboxFixtureReference("synthetic-clean-receipt-baseline")?.repoPath ===
      "fixtures/vision-sandbox/assets/synthetic-clean-receipt-baseline.svg",
    simulationMarkdownReference:
      resolveVisionSandboxFixtureReference("synthetic-provider-timeout-simulation")?.repoPath ===
      "fixtures/vision-sandbox/simulations/synthetic-provider-timeout-simulation.md",
  };

  const outputShapeChecks = {
    allOutputsSandboxOnly: outputs.every(
      (output) =>
        output.providerMode === "sandbox" &&
        output.providerFamily === "openai-vision-style" &&
        output.skeletonPhase === "4.31",
    ),
    allOutputsHaveGuards: outputs.every(
      (output) => output.privacyGuard.passed && output.packageSafetyGuard.passed && output.schemaShapeGuard.passed,
    ),
    allOutputsHavePrivacyDefaults: outputs.every(
      (output) =>
        output.privacyFlags.syntheticOnly &&
        !output.privacyFlags.realCustomerEvidenceUsed &&
        !output.privacyFlags.customerIdentifiersReturned &&
        !output.privacyFlags.providerPayloadReturned &&
        !output.retentionFlags.fileRetained &&
        !output.retentionFlags.rawOcrRetained &&
        !output.retentionFlags.providerPayloadLogged &&
        !output.retentionFlags.storageUsed &&
        !output.retentionFlags.persistenceUsed,
    ),
    allOutputsRuntimeIsolated: outputs.every(
      (output) =>
        output.runtimeIsolation.developerOnly &&
        !output.runtimeIsolation.routeImplemented &&
        !output.runtimeIsolation.providerCallsAllowed &&
        !output.runtimeIsolation.uploadHandlingAllowed &&
        !output.runtimeIsolation.receiptRuntimeChanged,
    ),
  };

  const failureShapeChecks = {
    unsupportedIsLimitationOnly:
      unsupported.resultStatus === "unsupported" &&
      unsupported.uncertaintySignals.every((signal) => signal.signalType === "unsupported-evidence-limitation") &&
      unsupported.alteredOrAiGeneratedImageUncertainty.value === null,
    timeoutIsOperationalOnly:
      timeout.resultStatus === "provider-timeout" && timeout.alteredOrAiGeneratedImageUncertainty.value === null,
    unavailableIsOperationalOnly:
      unavailableSimulation.resultStatus === "provider-unavailable" &&
      unavailableSimulation.alteredOrAiGeneratedImageUncertainty.value === null,
    rateLimitIsOperationalOnly:
      rateLimitSimulation.resultStatus === "provider-rate-limited" &&
      rateLimitSimulation.alteredOrAiGeneratedImageUncertainty.value === null,
    costLimitIsOperationalOnly:
      costLimitSimulation.resultStatus === "cost-limit-reached" &&
      costLimitSimulation.alteredOrAiGeneratedImageUncertainty.value === null,
    schemaFailureBlocksValue:
      schemaFailure.resultStatus === "schema-validation-failed" &&
      schemaFailure.alteredOrAiGeneratedImageUncertainty.applicability === "schema-invalid" &&
      schemaFailure.alteredOrAiGeneratedImageUncertainty.value === null,
    refusedBlocksValue:
      refusedSimulation.resultStatus === "refused" && refusedSimulation.alteredOrAiGeneratedImageUncertainty.value === null,
    internalErrorBlocksValue:
      internalErrorSimulation.resultStatus === "internal-sandbox-error" &&
      internalErrorSimulation.alteredOrAiGeneratedImageUncertainty.value === null,
    invalidInputFailsClosed:
      invalidInput.resultStatus === "internal-sandbox-error" &&
      invalidInput.fixture === null &&
      invalidInput.packageSafety.safeForDownloadablePackage === false,
  };

  const alteredAiChecks = {
    lowValueReviewOnly:
      alteredLow.alteredOrAiGeneratedImageUncertainty.value === 18 &&
      alteredLow.alteredOrAiGeneratedImageUncertainty.reviewSignalOnly &&
      alteredLow.alteredOrAiGeneratedImageUncertainty.notProof &&
      alteredLow.alteredOrAiGeneratedImageUncertainty.notFinalDecision,
    mediumValueReviewOnly:
      alteredMedium.alteredOrAiGeneratedImageUncertainty.value === 52 &&
      alteredMedium.alteredOrAiGeneratedImageUncertainty.manualReviewDriver,
    highValueReviewOnly:
      alteredHigh.alteredOrAiGeneratedImageUncertainty.value === 82 &&
      alteredHigh.alteredOrAiGeneratedImageUncertainty.manualReviewDriver &&
      /altered-or-AI-generated-image uncertainty/i.test(alteredHigh.alteredOrAiGeneratedImageUncertainty.meaning),
    nonAlteredFixtureHasNoValue:
      buildVisionSandboxStubOutput({ fixtureKey: "synthetic-product-photo-normal-context" })
        .alteredOrAiGeneratedImageUncertainty.value === null,
  };

  const safetyChecks = {
    outputsHaveNoUnsafeTerms: [
      ...outputs,
      unavailableSimulation,
      rateLimitSimulation,
      costLimitSimulation,
      refusedSimulation,
      internalErrorSimulation,
      invalidInput,
    ].every((output) => !serializedHasUnsafeTerms(output)),
    providerPayloadFlagsRemainFalse: outputs.every((output) => !output.privacyFlags.providerPayloadReturned),
    rawOcrFlagsRemainFalse: outputs.every((output) => !output.privacyFlags.rawOcrReturned),
    noReceiptRuntimeShape:
      !JSON.stringify(outputs).includes("scoreBreakdown") && !JSON.stringify(outputs).includes("claimDisposition"),
  };

  const forbiddenImportPatterns = [
    /from\s+["']@\/lib\/analysis\/(?:analyzer|types|report-adapter|scoring|receipt-parser|providers\/mock-provider-adapter)["']/,
    /from\s+["']@\/components\/(?:ClaimReviewWorkflow|ProductPhotoReviewPanel|UploadPanel)["']/,
    /from\s+["'](?:openai|@aws-sdk|@google-cloud)/,
    /require\(\s*["'](?:openai|@aws-sdk|@google-cloud)/,
  ];
  const forbiddenSourcePatterns = [
    /analyzeEvidenceFile/,
    /LocalAnalysisResult/,
    /\bfetch\s*\(/,
    /process\.env/,
    /createObjectURL/,
    /\bFile\b/,
    /\bBlob\b/,
    /localStorage|sessionStorage/,
  ];

  const isolationChecks = {
    noForbiddenImports: forbiddenImportPatterns.every((pattern) => !pattern.test(sandboxSourceCorpus)),
    noForbiddenSourcePatterns: forbiddenSourcePatterns.every((pattern) => !pattern.test(sandboxSourceCorpus)),
  };

  assertProbeChecksPass("module", moduleChecks);
  assertProbeChecksPass("output shape", outputShapeChecks);
  assertProbeChecksPass("failure shapes", failureShapeChecks);
  assertProbeChecksPass("altered AI uncertainty", alteredAiChecks);
  assertProbeChecksPass("safety", safetyChecks);
  assertProbeChecksPass("isolation", isolationChecks);

  return {
    moduleChecks,
    outputShapeChecks,
    failureShapeChecks,
    alteredAiChecks,
    safetyChecks,
    isolationChecks,
    fixtureCount: fixtureKeys.length,
  } as const;
}

export const VISION_SANDBOX_SKELETON_DEVELOPER_PROBE = runVisionSandboxSkeletonProbe();
