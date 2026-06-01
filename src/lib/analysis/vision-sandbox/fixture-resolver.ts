import { getVisionSandboxFixtureMetadata } from "./fixture-registry";
import type { VisionSandboxFixtureReference } from "./types";

const simulationFixtureKeys = new Set([
  "synthetic-unsupported-evidence",
  "synthetic-provider-timeout-simulation",
  "synthetic-schema-validation-failure",
]);

const safeFixtureKeyPattern = /^synthetic-[a-z0-9-]+$/;

export function resolveVisionSandboxFixtureReference(fixtureKey: string): VisionSandboxFixtureReference | null {
  const metadata = getVisionSandboxFixtureMetadata(fixtureKey);

  if (!metadata || !safeFixtureKeyPattern.test(fixtureKey)) {
    return null;
  }

  if (simulationFixtureKeys.has(fixtureKey)) {
    return {
      fixtureKey,
      referenceKind: "synthetic-markdown-simulation",
      repoPath: `fixtures/vision-sandbox/simulations/${fixtureKey}.md`,
      packageSafe: true,
      syntheticOnly: true,
    };
  }

  return {
    fixtureKey,
    referenceKind: "synthetic-svg-asset",
    repoPath: `fixtures/vision-sandbox/assets/${fixtureKey}.svg`,
    packageSafe: true,
    syntheticOnly: true,
  };
}
