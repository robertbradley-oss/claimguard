export const VISION_SANDBOX_PHASE = "4.31" as const;
export const VISION_SANDBOX_SCHEMA_VERSION = "openai-vision-sandbox-skeleton/v1" as const;
export const VISION_SANDBOX_PROVIDER_MODE = "sandbox" as const;
export const VISION_SANDBOX_PROVIDER_FAMILY = "openai-vision-style" as const;

export type VisionSandboxAnalysisMode =
  | "receipt-visual-review"
  | "order-screenshot-review"
  | "product-photo-review"
  | "damaged-product-review"
  | "altered-ai-uncertainty-review"
  | "unsupported-evidence-review"
  | "provider-failure-review";

export type VisionSandboxResultStatus =
  | "completed"
  | "unsupported"
  | "refused"
  | "provider-timeout"
  | "provider-rate-limited"
  | "provider-unavailable"
  | "cost-limit-reached"
  | "schema-validation-failed"
  | "internal-sandbox-error";

export type VisionSandboxFixtureMetadata = {
  fixtureKey: string;
  fixtureVersion: string;
  fixtureTitle: string;
  fixtureDescription: string;
  fixtureCategory: string;
  evidenceType: string;
  evidenceSubtype: string;
  scenarioSlug: string;
  scenarioGroup: string;
  schemaVersionTarget: string;
  syntheticStatus: "synthetic-only";
  redactionStatus: "synthetic-not-applicable";
  approvalStatus: string;
  packageDistributionStatus: string;
  safeForDownloadablePackage: boolean;
  safeForDemoMode: boolean;
  safeForSelfHostedInstall: boolean;
  allowedPromptFamilies: readonly string[];
  targetAnalysisModes: readonly VisionSandboxAnalysisMode[];
  expectedResultStatus: VisionSandboxResultStatus;
  expectedObservationCategories: readonly string[];
  expectedUncertaintySignalTypes: readonly string[];
  expectedLimitationTypes: readonly string[];
  expectedManualReviewDriverPriorities: readonly ("low" | "medium" | "high")[];
  expectedPrivacyFlags: readonly string[];
  expectedRetentionFlags: readonly string[];
  expectedCostTimeoutBehavior: string;
  disallowedOutputPatterns: readonly string[];
  reviewOwner: string;
  createdForPhase: string;
  lastReviewedForPhase: string;
};

export type VisionSandboxFixtureSummary = Pick<
  VisionSandboxFixtureMetadata,
  | "fixtureKey"
  | "fixtureTitle"
  | "fixtureDescription"
  | "fixtureCategory"
  | "evidenceType"
  | "evidenceSubtype"
  | "scenarioGroup"
  | "syntheticStatus"
  | "redactionStatus"
  | "approvalStatus"
  | "packageDistributionStatus"
  | "safeForDownloadablePackage"
  | "safeForDemoMode"
  | "safeForSelfHostedInstall"
  | "expectedResultStatus"
>;

export type VisionSandboxFixtureReference = {
  fixtureKey: string;
  referenceKind: "synthetic-svg-asset" | "synthetic-markdown-simulation";
  repoPath: `fixtures/vision-sandbox/${"assets" | "simulations"}/${string}`;
  packageSafe: true;
  syntheticOnly: true;
};

export type VisionSandboxInput = {
  fixtureKey: string;
  analysisMode?: VisionSandboxAnalysisMode;
  simulationStatus?: Extract<
    VisionSandboxResultStatus,
    | "provider-timeout"
    | "provider-rate-limited"
    | "provider-unavailable"
    | "cost-limit-reached"
    | "schema-validation-failed"
    | "internal-sandbox-error"
    | "refused"
  >;
};

export type VisionSandboxGuardStatus = {
  passed: boolean;
  reasons: readonly string[];
};

export type VisionSandboxObservation = {
  observationId: string;
  category: string;
  description: string;
  basis: "synthetic-fixture-metadata";
  confidenceLevel: "low" | "medium" | "high" | "not-applicable";
  privacySafe: true;
  manualReviewRelevance: string;
};

export type VisionSandboxUncertaintySignal = {
  signalId: string;
  signalType: string;
  level: "low" | "medium" | "high" | "not-applicable";
  description: string;
  supportingObservationIds: readonly string[];
  confidenceLevel: "low" | "medium" | "high" | "not-applicable";
  manualReviewDriver: boolean;
  safeLanguage: string;
};

export type VisionSandboxAlteredAiUncertainty = {
  label: "altered-or-AI-generated-image uncertainty";
  value: number | null;
  scale: "1-100";
  applicability: "applicable" | "not-applicable" | "unsupported" | "unavailable" | "schema-invalid";
  meaning: string;
  confidenceLevel: "low" | "medium" | "high" | "not-applicable";
  supportingObservationIds: readonly string[];
  limitations: readonly string[];
  reviewSignalOnly: true;
  manualReviewDriver: boolean;
  notProof: true;
  notFinalDecision: true;
};

export type VisionSandboxLimitation = {
  limitationId: string;
  type:
    | "synthetic-fixture-only"
    | "sandbox-only"
    | "unsupported-evidence"
    | "provider-boundary"
    | "operational-timeout"
    | "provider-unavailable"
    | "rate-limit"
    | "cost-limit"
    | "schema-validation"
    | "internal-sandbox-error"
    | "missing-context";
  description: string;
  impact: string;
  recommendedHandling: string;
};

export type VisionSandboxManualReviewDriver = {
  driverId: string;
  priority: "low" | "medium" | "high";
  reason: string;
  relatedObservationIds: readonly string[];
  relatedSignalIds: readonly string[];
  recommendedInternalAction: string;
  customerSafeBoundary: string;
};

export type VisionSandboxPrivacyFlags = {
  syntheticOnly: true;
  realCustomerEvidenceAllowed: false;
  realCustomerEvidenceUsed: false;
  customerIdentifiersAllowed: false;
  customerIdentifiersReturned: false;
  rawOcrReturned: false;
  providerPayloadReturned: false;
  publicImageUrlAllowed: false;
  storageHandleAllowed: false;
};

export type VisionSandboxRetentionFlags = {
  fileRetained: false;
  rawOcrRetained: false;
  providerPayloadRetained: false;
  providerPayloadLogged: false;
  objectUrlRetained: false;
  storageUsed: false;
  persistenceUsed: false;
};

export type VisionSandboxPackageSafetyStatus = {
  safeForDownloadablePackage: boolean;
  safeForDemoMode: boolean;
  safeForSelfHostedInstall: boolean;
  packageDistributionStatus: string;
  requiresProviderAccess: false;
  requiresEnvSecrets: false;
  packageArtifactCreated: false;
};

export type VisionSandboxOutput = {
  schemaVersion: typeof VISION_SANDBOX_SCHEMA_VERSION;
  providerMode: typeof VISION_SANDBOX_PROVIDER_MODE;
  providerFamily: typeof VISION_SANDBOX_PROVIDER_FAMILY;
  skeletonPhase: typeof VISION_SANDBOX_PHASE;
  resultStatus: VisionSandboxResultStatus;
  analysisMode: VisionSandboxAnalysisMode;
  fixture: VisionSandboxFixtureSummary | null;
  fixtureReference: VisionSandboxFixtureReference | null;
  observations: readonly VisionSandboxObservation[];
  uncertaintySignals: readonly VisionSandboxUncertaintySignal[];
  alteredOrAiGeneratedImageUncertainty: VisionSandboxAlteredAiUncertainty;
  confidenceNotes: readonly string[];
  manualReviewDrivers: readonly VisionSandboxManualReviewDriver[];
  limitations: readonly VisionSandboxLimitation[];
  safeSupportSummary: string;
  privacyFlags: VisionSandboxPrivacyFlags;
  retentionFlags: VisionSandboxRetentionFlags;
  packageSafety: VisionSandboxPackageSafetyStatus;
  privacyGuard: VisionSandboxGuardStatus;
  packageSafetyGuard: VisionSandboxGuardStatus;
  schemaShapeGuard: VisionSandboxGuardStatus;
  runtimeIsolation: {
    developerOnly: true;
    routeImplemented: false;
    providerCallsAllowed: false;
    uploadHandlingAllowed: false;
    storageAllowed: false;
    persistenceAllowed: false;
    receiptRuntimeChanged: false;
  };
};
