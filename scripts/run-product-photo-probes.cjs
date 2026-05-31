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
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: filename,
    });

    module._compile(transpiled.outputText, filename);
  };
}

registerTypescriptExtension(".ts");
registerTypescriptExtension(".tsx");

const probeModules = [
  {
    path: "src/lib/analysis/analyzer-classifier.probe.ts",
    exportName: "ANALYZER_CLASSIFIER_QUARANTINE_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/analyzer-routing.probe.ts",
    exportName: "ANALYZER_ROUTING_GUARD_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/product-photo-heuristics.probe.ts",
    exportName: "PRODUCT_PHOTO_HEURISTICS_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/product-photo-result.probe.ts",
    exportName: "PRODUCT_PHOTO_RESULT_BOUNDARY_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/shared-result.probe.ts",
    exportName: "SHARED_RESULT_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/product-photo-recognition.probe.ts",
    exportName: "PRODUCT_PHOTO_RECOGNITION_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/product-photo-routing-adapter.probe.ts",
    exportName: "PRODUCT_PHOTO_ROUTING_ADAPTER_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/product-photo-adapter-readiness.probe.ts",
    exportName: "PRODUCT_PHOTO_ADAPTER_READINESS_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/product-photo-analyzer.probe.ts",
    exportName: "PRODUCT_PHOTO_ANALYZER_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/product-photo-report-view-model.probe.ts",
    exportName: "PRODUCT_PHOTO_REPORT_VIEW_MODEL_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/pre-analysis-evidence-gate.probe.ts",
    exportName: "PRE_ANALYSIS_EVIDENCE_GATE_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/pre-analysis-evidence-gate-runtime.probe.ts",
    exportName: "PRE_ANALYSIS_EVIDENCE_GATE_RUNTIME_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/unsupported-evidence-review-state.probe.ts",
    exportName: "UNSUPPORTED_EVIDENCE_REVIEW_STATE_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/workflow-pre-analysis-gate-boundary.probe.ts",
    exportName: "WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/ocr-fixture-harness.probe.ts",
    exportName: "OCR_FIXTURE_HARNESS_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/ocr-extraction-contract.probe.ts",
    exportName: "OCR_EXTRACTION_CONTRACT_DEVELOPER_PROBE",
  },
  {
    path: "src/app/api/analysis/ocr/route.probe.ts",
    exportName: "OCR_ROUTE_DEVELOPER_PROBE",
  },
  {
    path: "src/lib/analysis/providers/mock-provider-adapter.probe.ts",
    exportName: "MOCK_PROVIDER_ADAPTER_DEVELOPER_PROBE",
  },
  {
    path: "src/app/api/analysis/mock-provider/route.probe.ts",
    exportName: "MOCK_PROVIDER_ROUTE_DEVELOPER_PROBE",
  },
];

async function runProductPhotoProbes() {
  for (const probeModule of probeModules) {
    const loadedProbe = require(path.join(repoRoot, probeModule.path));
    const probe = await loadedProbe[probeModule.exportName];

    if (!probe || typeof probe !== "object") {
      throw new Error(`Product-photo probe export missing: ${probeModule.exportName}`);
    }
  }

  console.log(`Non-live analysis probe execution passed (${probeModules.length} modules imported).`);
}

runProductPhotoProbes().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
