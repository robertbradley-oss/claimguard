import { VISION_SANDBOX_PROVIDER_FAMILY, VISION_SANDBOX_PROVIDER_MODE } from "./types";

export const VISION_SANDBOX_PROVIDER_CONFIG_PHASE = "4.37" as const;
export const VISION_SANDBOX_PROVIDER_CONFIG_TIMEOUT_CEILING_MS = 15000 as const;
export const VISION_SANDBOX_PROVIDER_CONFIG_DEFAULT_TIMEOUT_MS = 10000 as const;
export const VISION_SANDBOX_PROVIDER_CONFIG_MAX_FIXTURE_BATCH_SIZE = 1 as const;

export type VisionSandboxProviderRetryPolicy = {
  automaticRetriesEnabled: false;
  maxAttempts: 1;
};

export type VisionSandboxProviderConfig = {
  configPhase: typeof VISION_SANDBOX_PROVIDER_CONFIG_PHASE;
  providerMode: typeof VISION_SANDBOX_PROVIDER_MODE;
  providerFamily: typeof VISION_SANDBOX_PROVIDER_FAMILY;
  providerEnabled: false;
  providerCallsAllowed: false;
  requestExecutionAllowed: false;
  apiCreditUsageAllowed: false;
  modelName: "not-configured";
  timeoutMs: typeof VISION_SANDBOX_PROVIDER_CONFIG_DEFAULT_TIMEOUT_MS;
  timeoutCeilingMs: typeof VISION_SANDBOX_PROVIDER_CONFIG_TIMEOUT_CEILING_MS;
  retryPolicy: VisionSandboxProviderRetryPolicy;
  maxFixtureBatchSize: typeof VISION_SANDBOX_PROVIDER_CONFIG_MAX_FIXTURE_BATCH_SIZE;
  costLimitMode: "not-configured-no-live-cost";
  payloadLoggingPolicy: "disabled";
  rawOcrRetentionPolicy: "disabled";
  evidenceScope: "synthetic-fixture-only";
  packageSafetyMode: "downloadable-safe-disabled";
  secretsRequired: false;
  envConfigRequired: false;
  envExampleStatus: "not-added-not-required-for-current-sandbox";
};

export type VisionSandboxProviderConfigCandidate = Partial<{
  providerEnabled: boolean;
  timeoutMs: number;
  retryPolicy: Partial<{
    automaticRetriesEnabled: boolean;
    maxAttempts: number;
  }>;
  maxFixtureBatchSize: number;
  payloadLoggingPolicy: "disabled" | "enabled";
  rawOcrRetentionPolicy: "disabled" | "enabled";
  evidenceScope: "synthetic-fixture-only" | "real-evidence" | "mixed-evidence";
  packageSafetyMode: "downloadable-safe-disabled" | "provider-enabled";
}>;

export type VisionSandboxProviderConfigResolution = {
  config: VisionSandboxProviderConfig;
  guard: {
    passed: boolean;
    reasons: readonly string[];
  };
  futureApprovalRequired: true;
};

export const VISION_SANDBOX_PROVIDER_CONFIG_DEFAULTS = {
  configPhase: VISION_SANDBOX_PROVIDER_CONFIG_PHASE,
  providerMode: VISION_SANDBOX_PROVIDER_MODE,
  providerFamily: VISION_SANDBOX_PROVIDER_FAMILY,
  providerEnabled: false,
  providerCallsAllowed: false,
  requestExecutionAllowed: false,
  apiCreditUsageAllowed: false,
  modelName: "not-configured",
  timeoutMs: VISION_SANDBOX_PROVIDER_CONFIG_DEFAULT_TIMEOUT_MS,
  timeoutCeilingMs: VISION_SANDBOX_PROVIDER_CONFIG_TIMEOUT_CEILING_MS,
  retryPolicy: {
    automaticRetriesEnabled: false,
    maxAttempts: 1,
  },
  maxFixtureBatchSize: VISION_SANDBOX_PROVIDER_CONFIG_MAX_FIXTURE_BATCH_SIZE,
  costLimitMode: "not-configured-no-live-cost",
  payloadLoggingPolicy: "disabled",
  rawOcrRetentionPolicy: "disabled",
  evidenceScope: "synthetic-fixture-only",
  packageSafetyMode: "downloadable-safe-disabled",
  secretsRequired: false,
  envConfigRequired: false,
  envExampleStatus: "not-added-not-required-for-current-sandbox",
} as const satisfies VisionSandboxProviderConfig;

function candidateViolations(candidate: VisionSandboxProviderConfigCandidate): string[] {
  const reasons: string[] = [];

  if (candidate.providerEnabled === true) {
    reasons.push("Provider enablement remains blocked in Phase 4.37.");
  }

  if (candidate.timeoutMs !== undefined && candidate.timeoutMs > VISION_SANDBOX_PROVIDER_CONFIG_TIMEOUT_CEILING_MS) {
    reasons.push("Timeout exceeds the Phase 4.37 strict ceiling.");
  }

  if (candidate.retryPolicy?.automaticRetriesEnabled === true || (candidate.retryPolicy?.maxAttempts ?? 1) > 1) {
    reasons.push("Automatic retry remains disabled in Phase 4.37.");
  }

  if (
    candidate.maxFixtureBatchSize !== undefined &&
    candidate.maxFixtureBatchSize > VISION_SANDBOX_PROVIDER_CONFIG_MAX_FIXTURE_BATCH_SIZE
  ) {
    reasons.push("Fixture batch size exceeds the Phase 4.37 tiny-batch default.");
  }

  if (candidate.payloadLoggingPolicy === "enabled") {
    reasons.push("Provider payload logging remains disabled in Phase 4.37.");
  }

  if (candidate.rawOcrRetentionPolicy === "enabled") {
    reasons.push("Raw OCR retention remains disabled in Phase 4.37.");
  }

  if (candidate.evidenceScope !== undefined && candidate.evidenceScope !== "synthetic-fixture-only") {
    reasons.push("Evidence scope remains synthetic-fixture-only in Phase 4.37.");
  }

  if (candidate.packageSafetyMode === "provider-enabled") {
    reasons.push("Package safety mode remains disabled for provider behavior in Phase 4.37.");
  }

  return reasons;
}

export function resolveVisionSandboxProviderConfig(
  candidate: VisionSandboxProviderConfigCandidate = {},
): VisionSandboxProviderConfigResolution {
  const violations = candidateViolations(candidate);

  return {
    config: VISION_SANDBOX_PROVIDER_CONFIG_DEFAULTS,
    guard: {
      passed: violations.length === 0,
      reasons:
        violations.length === 0
          ? [
              "provider disabled by default",
              "provider calls blocked",
              "API-credit usage blocked",
              "payload logging disabled",
              "raw OCR retention disabled",
              "synthetic-fixture-only evidence scope",
              "downloadable package safe default",
            ]
          : violations,
    },
    futureApprovalRequired: true,
  };
}
