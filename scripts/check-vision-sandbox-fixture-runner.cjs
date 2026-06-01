/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const repoRoot = path.resolve(__dirname, "..");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveClaimGuardAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    return originalResolveFilename.call(
      this,
      path.join(repoRoot, "src", request.slice(2)),
      parent,
      isMain,
      options,
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

function registerTypescriptExtension(extension) {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, "utf8");
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        resolveJsonModule: true,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: filename,
    });

    module._compile(transpiled.outputText, filename);
  };
}

registerTypescriptExtension(".ts");
registerTypescriptExtension(".tsx");

async function runVisionSandboxFixtureRunnerCheck() {
  const loadedRunner = require(path.join(repoRoot, "src/lib/analysis/vision-sandbox/fixture-runner.ts"));
  const report = await loadedRunner.runVisionSandboxFixtureRunner(repoRoot);
  const failedFixtureRuns = report.fixtureRuns.filter((run) => !run.passed);
  const failedFailureRuns = report.failureSimulationRuns.filter((run) => !run.passed);

  if (!report.passed || report.fixtureCount !== 12 || failedFixtureRuns.length > 0 || failedFailureRuns.length > 0) {
    throw new Error(
      [
        "Vision sandbox fixture-runner validation failed.",
        `Fixture failures: ${failedFixtureRuns.map((run) => run.fixtureKey).join(", ") || "none"}.`,
        `Failure simulation failures: ${
          failedFailureRuns.map((run) => run.simulationStatus).join(", ") || "none"
        }.`,
      ].join(" "),
    );
  }

  console.log("ClaimGuard OpenAI Vision sandbox fixture-runner check passed.");
  console.log("Checked all approved synthetic fixture references, mode fallback behavior, failure simulations, guards, and package safety.");
}

runVisionSandboxFixtureRunnerCheck().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
