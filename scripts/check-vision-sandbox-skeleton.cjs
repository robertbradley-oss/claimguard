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

async function runVisionSandboxSkeletonCheck() {
  const loadedProbe = require(path.join(repoRoot, "src/lib/analysis/vision-sandbox/vision-sandbox.probe.ts"));
  const probe = await loadedProbe.VISION_SANDBOX_SKELETON_DEVELOPER_PROBE;

  if (!probe || typeof probe !== "object" || probe.fixtureCount !== 12) {
    throw new Error("Vision sandbox skeleton probe did not return the expected fixture coverage.");
  }

  console.log("ClaimGuard OpenAI Vision sandbox skeleton check passed.");
  console.log("Checked synthetic fixture resolution, stub output shapes, failure simulations, guards, and isolation.");
}

runVisionSandboxSkeletonCheck().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
