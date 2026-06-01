import syntheticFixtureRegistry from "../../../../fixtures/vision-sandbox/metadata/synthetic-fixture-registry.json";

import type { VisionSandboxFixtureMetadata, VisionSandboxFixtureSummary } from "./types";

type VisionSandboxRegistry = {
  registryVersion: string;
  registryPurpose: string;
  registrySafetyNote: string;
  fixtures: readonly VisionSandboxFixtureMetadata[];
};

const registry = syntheticFixtureRegistry as VisionSandboxRegistry;

const fixtureByKey = new Map(registry.fixtures.map((fixture) => [fixture.fixtureKey, fixture]));

export function listApprovedVisionSandboxFixtureKeys(): readonly string[] {
  return registry.fixtures.map((fixture) => fixture.fixtureKey);
}

export function getVisionSandboxFixtureMetadata(fixtureKey: string): VisionSandboxFixtureMetadata | null {
  return fixtureByKey.get(fixtureKey) ?? null;
}

export function summarizeVisionSandboxFixture(
  metadata: VisionSandboxFixtureMetadata,
): VisionSandboxFixtureSummary {
  return {
    fixtureKey: metadata.fixtureKey,
    fixtureTitle: metadata.fixtureTitle,
    fixtureDescription: metadata.fixtureDescription,
    fixtureCategory: metadata.fixtureCategory,
    evidenceType: metadata.evidenceType,
    evidenceSubtype: metadata.evidenceSubtype,
    scenarioGroup: metadata.scenarioGroup,
    syntheticStatus: metadata.syntheticStatus,
    redactionStatus: metadata.redactionStatus,
    approvalStatus: metadata.approvalStatus,
    packageDistributionStatus: metadata.packageDistributionStatus,
    safeForDownloadablePackage: metadata.safeForDownloadablePackage,
    safeForDemoMode: metadata.safeForDemoMode,
    safeForSelfHostedInstall: metadata.safeForSelfHostedInstall,
    expectedResultStatus: metadata.expectedResultStatus,
  };
}

export function isApprovedVisionSandboxFixtureKey(fixtureKey: string): boolean {
  return fixtureByKey.has(fixtureKey);
}
