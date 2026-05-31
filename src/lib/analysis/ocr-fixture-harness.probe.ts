import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  runSyntheticOcrFixtureHarness,
  SYNTHETIC_OCR_FIXTURE_CASES,
  type SyntheticOcrFixtureCase,
} from "@/lib/analysis/ocr-fixture-harness";

type HasAnyKey<T, TKey extends PropertyKey> = Extract<keyof T, TKey> extends never ? false : true;
type AssertFalse<T extends false> = T extends false ? true : never;

type ForbiddenFixtureKeys =
  | "file"
  | "blob"
  | "fileBytes"
  | "imageBuffer"
  | "objectUrl"
  | "imageUrl"
  | "dataUrl"
  | "rawExif"
  | "rawMetadata"
  | "originalFilename"
  | "providerPayload"
  | "providerResponse"
  | "providerRequestId"
  | "storageHandle"
  | "integrationHandle"
  | "caseQueueHandle"
  | "customerId"
  | "ticketId"
  | "claimId"
  | "caseId"
  | "evidenceId"
  | "externalDecision"
  | "claimOutcome"
  | "automaticDisposition";

const repoRoot = process.cwd();
const harnessSource = readFileSync(join(repoRoot, "src/lib/analysis/ocr-fixture-harness.ts"), "utf8");
const probeSource = readFileSync(join(repoRoot, "src/lib/analysis/ocr-fixture-harness.probe.ts"), "utf8");
const analyzerSource = readFileSync(join(repoRoot, "src/lib/analysis/analyzer.ts"), "utf8");
const reportAdapterSource = readFileSync(join(repoRoot, "src/lib/analysis/report-adapter.ts"), "utf8");
const claimReviewWorkflowSource = readFileSync(join(repoRoot, "src/components/ClaimReviewWorkflow.tsx"), "utf8");
const productPhotoReviewPanelSource = readFileSync(join(repoRoot, "src/components/ProductPhotoReviewPanel.tsx"), "utf8");

const harness = runSyntheticOcrFixtureHarness();
const fixtureKeys = SYNTHETIC_OCR_FIXTURE_CASES.map((fixture) => fixture.key);
const serializedHarness = JSON.stringify(harness).toLowerCase();

function assertProbeChecksPass(group: string, checks: Record<string, boolean>) {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Synthetic OCR fixture harness probe failed (${group}): ${failed.join(", ")}`);
  }
}

const typeChecks = {
  fixtureCaseHasNoForbiddenKeys: true satisfies AssertFalse<
    HasAnyKey<SyntheticOcrFixtureCase, ForbiddenFixtureKeys>
  >,
};

const requiredFixtureKeys = [
  "clean-receipt-ocr",
  "amazon-like-order-ocr",
  "missing-total-ocr",
  "missing-merchant-ocr",
  "conflicting-date-total-ocr",
  "noisy-ocr-text",
  "receipt-like-incomplete-ocr",
  "unsupported-non-receipt-text",
  "ambiguous-marketplace-screen-ocr",
  "provider-timeout-synthetic-failure",
  "empty-ocr-output",
] as const;

const fixtureCoverageChecks = {
  hasAtLeastElevenFixtures: harness.summary.totalFixtures >= 11,
  allRequiredKeysPresent: requiredFixtureKeys.every((key) => fixtureKeys.includes(key)),
  cleanFixtureStructured: harness.fixtures.some(
    (fixture) => fixture.key === "clean-receipt-ocr" && fixture.expectedOutput.status === "structured",
  ),
  amazonFixtureStructured: harness.fixtures.some(
    (fixture) => fixture.key === "amazon-like-order-ocr" && fixture.expectedOutput.status === "structured",
  ),
  missingTotalNeedsReview: harness.fixtures.some(
    (fixture) => fixture.key === "missing-total-ocr" && fixture.expectedOutput.status === "needs-review",
  ),
  missingMerchantNeedsReview: harness.fixtures.some(
    (fixture) => fixture.key === "missing-merchant-ocr" && fixture.expectedOutput.status === "needs-review",
  ),
  conflictNeedsReview: harness.fixtures.some(
    (fixture) => fixture.key === "conflicting-date-total-ocr" && fixture.expectedOutput.status === "needs-review",
  ),
  noisyNeedsReview: harness.fixtures.some(
    (fixture) => fixture.key === "noisy-ocr-text" && fixture.expectedOutput.status === "needs-review",
  ),
  unsupportedStatePresent: harness.summary.unsupportedFixtures >= 1,
  providerUnavailableStatePresent: harness.summary.providerUnavailableFixtures >= 1,
  emptyStatePresent: harness.summary.emptyFixtures >= 1,
};

const fieldContractChecks = {
  everyFixtureHasTextBlocksArray: harness.fixtures.every((fixture) =>
    Array.isArray(fixture.expectedOutput.extractedTextBlocks),
  ),
  everyFixtureHasStructuredFields: harness.fixtures.every((fixture) => Boolean(fixture.expectedOutput.structuredFields)),
  everyFixtureHasFieldConfidence: harness.fixtures.every((fixture) => Boolean(fixture.expectedOutput.fieldConfidence)),
  everyFixtureHasExtractionConfidence: harness.fixtures.every(
    (fixture) =>
      fixture.expectedOutput.extractionConfidence >= 0 && fixture.expectedOutput.extractionConfidence <= 100,
  ),
  everyFixtureHasManualReviewDrivers: harness.fixtures.every((fixture) =>
    Array.isArray(fixture.expectedOutput.manualReviewDrivers),
  ),
  everyFixtureHasLimitations: harness.fixtures.every((fixture) => fixture.expectedOutput.limitations.length > 0),
  everyFixtureHasSafeSummary: harness.fixtures.every((fixture) => fixture.expectedOutput.safeSummary.length > 0),
  structuredFieldsCoverCoreReceiptFields: ["merchant", "orderNumber", "purchaseDate", "total", "itemLines", "marketplaceHints"].every(
    (fieldKey) => harnessSource.includes(`${fieldKey}:`),
  ),
};

const isolationChecks = {
  harnessRuntimeNonLive: harness.runtimeLive === false,
  providerCallsDisabled: harness.fixtures.every((fixture) => fixture.providerCallsAllowed === false),
  liveRuntimeDisabled: harness.fixtures.every((fixture) => fixture.liveRuntimeAllowed === false),
  harnessProviderFree: harness.providerFree === true,
  harnessRouteFree: harness.routeFree === true,
  harnessUploadFree: harness.uploadFree === true,
  harnessStorageFree: harness.storageFree === true,
  harnessRealEvidenceFree: harness.realEvidenceFree === true,
  receiptRegressionSafetyCovered: harness.summary.receiptRegressionSafetyCovered === true,
  analyzerDoesNotImportHarness: !analyzerSource.includes("ocr-fixture-harness"),
  reportAdapterDoesNotImportHarness: !reportAdapterSource.includes("ocr-fixture-harness"),
  claimReviewWorkflowDoesNotImportHarness: !claimReviewWorkflowSource.includes("ocr-fixture-harness"),
  productPhotoReviewPanelDoesNotImportHarness: !productPhotoReviewPanelSource.includes("ocr-fixture-harness"),
};

const forbiddenHarnessImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/types",
  "@/components/ClaimReviewWorkflow",
  "@/components/ProductPhotoReviewPanel",
  "@/components/UploadPanel",
  "@/lib/test-evidence",
];

const forbiddenHarnessPatterns = [
  /\bFile\b/,
  /\bBlob\b/,
  /createObjectURL/,
  /\bobjectUrl\b/,
  /\bimageUrl\b/,
  /\bdataUrl\b/,
  /\bfetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /process\.env/,
  /api\/|route\.ts|page\.tsx/,
  /providerPayload|providerResponse|providerRequestId/,
  /storageHandle|integrationHandle|caseQueueHandle/,
  /customerId|ticketId|claimId|caseId|evidenceId/,
];

const importAndPrivacyChecks = {
  harnessHasNoForbiddenImports: forbiddenHarnessImports.every((importPath) => !harnessSource.includes(importPath)),
  harnessHasNoForbiddenPatterns: forbiddenHarnessPatterns.every((pattern) => !pattern.test(harnessSource)),
  probeOnlyImportsHarness: probeSource.includes("@/lib/analysis/ocr-fixture-harness"),
};

const unsafeTerms = [
  ["fa", "ke"].join(""),
  ["for", "ged"].join(""),
  ["fr", "aud"].join(""),
  ["den", "y"].join(""),
  ["app", "rove"].join(""),
  ["rej", "ect"].join(""),
  ["proves", " authenticity"].join(""),
  ["customer", " accusation"].join(" "),
];

const safetyLanguageChecks = {
  noUnsafeOutputTerms: unsafeTerms.every((term) => !serializedHarness.includes(term)),
  summaryFramesConfidenceAsReviewSignal: harness.summary.safeSummary.includes("review signal"),
  summaryRejectsProofOrFinalDecision: harness.summary.safeSummary.includes("not proof or a final decision"),
  manualReviewDriversAreNonFinal: harness.fixtures
    .filter((fixture) => fixture.expectedOutput.status !== "structured")
    .every((fixture) => fixture.expectedOutput.manualReviewDrivers.length > 0),
  externalVerificationOnlyNotPerformed: !/external verification (?:complete|passed|confirmed)/i.test(
    serializedHarness,
  ),
};

assertProbeChecksPass("types", typeChecks);
assertProbeChecksPass("fixture coverage", fixtureCoverageChecks);
assertProbeChecksPass("field contract", fieldContractChecks);
assertProbeChecksPass("isolation", isolationChecks);
assertProbeChecksPass("imports and privacy", importAndPrivacyChecks);
assertProbeChecksPass("safety language", safetyLanguageChecks);

export const OCR_FIXTURE_HARNESS_DEVELOPER_PROBE = {
  typeChecks,
  fixtureCoverageChecks,
  fieldContractChecks,
  isolationChecks,
  importAndPrivacyChecks,
  safetyLanguageChecks,
  fixtureCount: harness.summary.totalFixtures,
  harnessName: harness.harnessName,
  runtimeLive: harness.runtimeLive,
  providerFree: harness.providerFree,
  routeFree: harness.routeFree,
  uploadFree: harness.uploadFree,
  storageFree: harness.storageFree,
  realEvidenceFree: harness.realEvidenceFree,
} as const;
