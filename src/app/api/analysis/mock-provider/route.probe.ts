import { readFileSync } from "node:fs";
import { join } from "node:path";

import { POST as OCR_POST } from "../ocr/route";
import { DELETE, GET, OPTIONS, PATCH, POST, PUT } from "./route";

type RouteResponseBody =
  | {
      ok: true;
      mode: string;
      source: string;
      providerType: string;
      result: {
        resultKind: string;
        status: string;
        privacy: {
          syntheticOnly: boolean;
          realEvidenceUsed: boolean;
          customerDataUsed: boolean;
          fileRetained: boolean;
          rawOcrRetained: boolean;
          providerPayloadRetained: boolean;
          providerPayloadLogged: boolean;
          externalNetworkCalled: boolean;
          storageUsed: boolean;
          envUsed: boolean;
        };
        limitations: readonly {
          code: string;
          operationalOnly: boolean;
          evidenceLimitationOnly: boolean;
        }[];
        manualReviewDrivers: readonly {
          code: string;
          reviewSignalOnly: boolean;
          customerSafe: boolean;
        }[];
        contractCompatibility?: {
          canFeedOcrExtractionContract: boolean;
        };
        imageConsistencyUncertainty?: {
          value: number;
          scale: string;
          reviewSignalOnly: boolean;
          uncertaintyOnly: boolean;
        };
      };
    }
  | {
      ok: false;
      mode: string;
      source: string;
      providerType: string;
      result: {
        resultKind: string;
        status: string;
        failure: {
          code: string;
          status: string;
          operationalOnly: boolean;
          evidenceLimitationOnly: boolean;
          customerRiskSignal: boolean;
        };
        privacy: {
          syntheticOnly: boolean;
          realEvidenceUsed: boolean;
          customerDataUsed: boolean;
          fileRetained: boolean;
          rawOcrRetained: boolean;
          providerPayloadRetained: boolean;
          providerPayloadLogged: boolean;
          externalNetworkCalled: boolean;
          storageUsed: boolean;
          envUsed: boolean;
        };
        limitations: readonly {
          code: string;
          operationalOnly: boolean;
          evidenceLimitationOnly: boolean;
        }[];
      };
    }
  | {
      ok: false;
      mode: string;
      error: {
        code: string;
        message: string;
      };
    };

const repoRoot = process.cwd();
const routeSource = readFileSync(join(repoRoot, "src/app/api/analysis/mock-provider/route.ts"), "utf8");
const probeSource = readFileSync(join(repoRoot, "src/app/api/analysis/mock-provider/route.probe.ts"), "utf8");
const ocrRouteSource = readFileSync(join(repoRoot, "src/app/api/analysis/ocr/route.ts"), "utf8");
const packageJson = readFileSync(join(repoRoot, "package.json"), "utf8");
const packageLock = readFileSync(join(repoRoot, "package-lock.json"), "utf8");

function assertProbeChecksPass(group: string, checks: Record<string, boolean>) {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Mock provider route probe failed (${group}): ${failed.join(", ")}`);
  }
}

function requestWithBody(body: unknown, contentType = "application/json") {
  return new Request("http://localhost/api/analysis/mock-provider", {
    method: "POST",
    headers: {
      "content-type": contentType,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function responseJson(response: Response): Promise<RouteResponseBody> {
  return (await response.json()) as RouteResponseBody;
}

async function postJson(body: unknown, contentType?: string) {
  return responseJson(await POST(requestWithBody(body, contentType)));
}

function mockOcrRequest(overrides: Record<string, unknown> = {}) {
  return {
    providerType: "mock-ocr",
    fixtureKey: "clean-receipt-ocr",
    behavior: "success",
    mode: "synthetic",
    ...overrides,
  };
}

function mockVisionRequest(overrides: Record<string, unknown> = {}) {
  return {
    providerType: "mock-vision",
    behavior: "success",
    mode: "synthetic",
    evidenceTypeHint: "product-photo",
    ...overrides,
  };
}

function hasSafePrivacyMarkers(body: RouteResponseBody) {
  if ("error" in body) {
    return true;
  }

  const privacy = body.result.privacy;

  return (
    privacy.syntheticOnly === true &&
    privacy.realEvidenceUsed === false &&
    privacy.customerDataUsed === false &&
    privacy.fileRetained === false &&
    privacy.rawOcrRetained === false &&
    privacy.providerPayloadRetained === false &&
    privacy.providerPayloadLogged === false &&
    privacy.externalNetworkCalled === false &&
    privacy.storageUsed === false &&
    privacy.envUsed === false
  );
}

function serializedHasUnsafeTerms(body: RouteResponseBody) {
  const serialized = JSON.stringify(body).toLowerCase();
  const unsafeTerms = [
    ["fr", "aud"].join(""),
    ["fa", "ke"].join(""),
    ["for", "ged"].join(""),
    ["den", "y"].join(""),
    ["app", "rove"].join(""),
    ["rej", "ect"].join(""),
    ["ref", "und"].join(""),
    ["final", "claim"].join(" "),
    ["final", "decision"].join(" "),
    ["proof", "of", "alteration"].join(" "),
    ["customer", "risk", "signal", "\":true"].join(""),
    ["Local", "Analysis", "Result"].join("").toLowerCase(),
  ];

  return unsafeTerms.some((term) => serialized.includes(term));
}

function responseHasBlockedShape(body: RouteResponseBody) {
  const serialized = JSON.stringify(body);

  return (
    serialized.includes(["Local", "Analysis", "Result"].join("")) ||
    serialized.includes("\"metadata\"") ||
    serialized.includes("\"imageHeuristics\"") ||
    serialized.includes("\"scoreBreakdown\"") ||
    serialized.toLowerCase().includes(["fr", "aud"].join("") + "score") ||
    serialized.includes("finalDecision") ||
    serialized.includes("claimOutcome") ||
    serialized.includes("automaticDisposition")
  );
}

function routeSourceHasForbiddenImport(fragment: string) {
  return new RegExp(`from\\s+["'][^"']*${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(
    routeSource,
  );
}

async function runMockProviderRouteProbe() {
  const mockOcrSuccess = await postJson(mockOcrRequest());
  const mockVisionSuccess = await postJson(mockVisionRequest());
  const timeoutFailure = await postJson(mockOcrRequest({ behavior: "timeout" }));
  const unavailableFailure = await postJson(mockOcrRequest({ behavior: "unavailable" }));
  const malformedFailure = await postJson(mockOcrRequest({ behavior: "malformed-response" }));
  const unsupportedFailure = await postJson(mockVisionRequest({ behavior: "unsupported-evidence", evidenceTypeHint: "unknown" }));
  const emptyFailure = await postJson(mockOcrRequest({ behavior: "empty-output", fixtureKey: "empty-ocr-output" }));
  const rateCostFailure = await postJson(mockVisionRequest({ behavior: "rate-cost-limit" }));
  const redactionFailure = await postJson(mockOcrRequest({ behavior: "redaction-failure" }));
  const safetyRefusal = await postJson(mockVisionRequest({ behavior: "safety-refusal" }));
  const normalizationFailure = await postJson(mockVisionRequest({ behavior: "internal-normalization-error" }));

  const missingProviderType = await postJson({ fixtureKey: "clean-receipt-ocr", behavior: "success", mode: "synthetic" });
  const unknownProviderType = await postJson(mockOcrRequest({ providerType: "mock-live-provider" }));
  const missingBehavior = await postJson({
    providerType: "mock-ocr",
    fixtureKey: "clean-receipt-ocr",
    mode: "synthetic",
  });
  const unknownBehavior = await postJson(mockOcrRequest({ behavior: "live-analysis" }));
  const missingFixtureKey = await postJson({ providerType: "mock-ocr", behavior: "success", mode: "synthetic" });
  const unknownFixtureKey = await postJson(mockOcrRequest({ fixtureKey: "not-a-known-synthetic-fixture" }));
  const malformedJson = await responseJson(await POST(requestWithBody("{", "application/json")));
  const unsupportedContentType = await postJson('{"providerType":"mock-ocr"}', "text/plain");
  const multipart = await postJson("providerType=mock-ocr", "multipart/form-data; boundary=synthetic");
  const unexpectedField = await postJson(mockOcrRequest({ note: "extra synthetic note" }));
  const binaryShape = await postJson(mockOcrRequest({ bytes: [1, 2, 3] }));
  const realFileShape = await postJson(mockOcrRequest({ file: { name: "receipt.png" } }));
  const base64Payload = await postJson(
    mockOcrRequest({
      fixtureKey:
        "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWkFCQ0RFRkdISg==",
    }),
  );
  const objectUrl = await postJson(mockOcrRequest({ fixtureKey: "blob:http://local/synthetic" }));
  const dataUrl = await postJson(mockOcrRequest({ fixtureKey: "data:image/png;base64,AAAA" }));
  const imageUrl = await postJson(mockOcrRequest({ fixtureKey: "https://example.invalid/image.png" }));
  const fileUrl = await postJson(mockOcrRequest({ fixtureKey: "file:///tmp/image.png" }));
  const storageHandle = await postJson(mockOcrRequest({ storageHandle: "synthetic-storage-key" }));
  const customerIdentifier = await postJson(mockOcrRequest({ customerId: "synthetic-private-marker" }));
  const rawOcrText = await postJson(mockOcrRequest({ rawOcrText: "Synthetic raw text should not be accepted." }));
  const providerPayload = await postJson(mockOcrRequest({ providerPayload: { raw: "synthetic" } }));
  const ticketField = await postJson(mockOcrRequest({ ticketId: "TICKET-12345" }));
  const orderField = await postJson(mockOcrRequest({ orderNumber: "ORDER-12345" }));
  const nonSyntheticMode = await postJson(mockOcrRequest({ mode: "live" }));
  const visionFixtureKeyRejected = await postJson(mockVisionRequest({ fixtureKey: "synthetic-product-photo" }));

  const getFailure = await responseJson(await GET());
  const putFailure = await responseJson(await PUT());
  const patchFailure = await responseJson(await PATCH());
  const deleteFailure = await responseJson(await DELETE());
  const optionsFailure = await responseJson(await OPTIONS());

  const ocrRouteStillAcceptsExactFixture = await responseJson(
    await OCR_POST(
      new Request("http://localhost/api/analysis/ocr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fixtureKey: "clean-receipt-ocr" }),
      }),
    ),
  );
  const ocrRouteStillRejectsUnexpectedField = await responseJson(
    await OCR_POST(
      new Request("http://localhost/api/analysis/ocr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fixtureKey: "clean-receipt-ocr", providerType: "mock-ocr" }),
      }),
    ),
  );

  const successChecks = {
    routeModuleImported: typeof POST === "function" && typeof GET === "function",
    mockOcrSuccessAccepted:
      mockOcrSuccess.ok &&
      mockOcrSuccess.mode === "synthetic-mock-provider-route" &&
      mockOcrSuccess.source === "mock-provider-adapter" &&
      mockOcrSuccess.providerType === "mock-ocr" &&
      mockOcrSuccess.result.resultKind === "mock-ocr-success" &&
      mockOcrSuccess.result.contractCompatibility?.canFeedOcrExtractionContract === true,
    mockVisionSuccessAccepted:
      mockVisionSuccess.ok &&
      mockVisionSuccess.providerType === "mock-vision" &&
      mockVisionSuccess.result.resultKind === "mock-vision-success" &&
      mockVisionSuccess.result.imageConsistencyUncertainty?.scale === "1-100" &&
      mockVisionSuccess.result.imageConsistencyUncertainty.reviewSignalOnly === true &&
      mockVisionSuccess.result.imageConsistencyUncertainty.uncertaintyOnly === true,
  };

  const failureModeChecks = {
    timeoutOperationalOnly:
      !timeoutFailure.ok &&
      "result" in timeoutFailure &&
      timeoutFailure.result.failure.code === "timeout" &&
      timeoutFailure.result.status === "timed-out" &&
      timeoutFailure.result.failure.operationalOnly &&
      !timeoutFailure.result.failure.customerRiskSignal,
    unavailableOperationalOnly:
      !unavailableFailure.ok &&
      "result" in unavailableFailure &&
      unavailableFailure.result.failure.code === "unavailable" &&
      unavailableFailure.result.failure.operationalOnly &&
      !unavailableFailure.result.failure.customerRiskSignal,
    malformedOperationalOnly:
      !malformedFailure.ok &&
      "result" in malformedFailure &&
      malformedFailure.result.failure.code === "malformed-response" &&
      malformedFailure.result.failure.operationalOnly,
    unsupportedEvidenceLimitationOnly:
      !unsupportedFailure.ok &&
      "result" in unsupportedFailure &&
      unsupportedFailure.result.status === "unsupported" &&
      unsupportedFailure.result.failure.evidenceLimitationOnly,
    emptyOutputSafeLimitation:
      !emptyFailure.ok &&
      "result" in emptyFailure &&
      emptyFailure.result.status === "empty" &&
      emptyFailure.result.failure.evidenceLimitationOnly,
    rateCostOperationalOnly:
      !rateCostFailure.ok &&
      "result" in rateCostFailure &&
      rateCostFailure.result.failure.code === "rate-cost-limit" &&
      rateCostFailure.result.failure.operationalOnly,
    redactionOperationalOnly:
      !redactionFailure.ok &&
      "result" in redactionFailure &&
      redactionFailure.result.failure.code === "redaction-failure" &&
      redactionFailure.result.failure.operationalOnly,
    safetyRefusalOperationalOnly:
      !safetyRefusal.ok &&
      "result" in safetyRefusal &&
      safetyRefusal.result.failure.code === "safety-refusal" &&
      safetyRefusal.result.failure.operationalOnly,
    normalizationOperationalOnly:
      !normalizationFailure.ok &&
      "result" in normalizationFailure &&
      normalizationFailure.result.failure.code === "internal-normalization-error" &&
      normalizationFailure.result.failure.operationalOnly,
  };

  const rejectionChecks = {
    missingProviderTypeRejected: !missingProviderType.ok && "error" in missingProviderType && missingProviderType.error.code === "MISSING_PROVIDER_TYPE",
    unknownProviderTypeRejected: !unknownProviderType.ok && "error" in unknownProviderType && unknownProviderType.error.code === "UNKNOWN_PROVIDER_TYPE",
    missingBehaviorRejected:
      !missingBehavior.ok && "error" in missingBehavior && missingBehavior.error.code === "MISSING_SYNTHETIC_BEHAVIOR",
    unknownBehaviorRejected:
      !unknownBehavior.ok && "error" in unknownBehavior && unknownBehavior.error.code === "UNKNOWN_SYNTHETIC_BEHAVIOR",
    missingFixtureKeyRejected: !missingFixtureKey.ok && "error" in missingFixtureKey && missingFixtureKey.error.code === "MISSING_FIXTURE_KEY",
    unknownFixtureKeyRejected: !unknownFixtureKey.ok && "error" in unknownFixtureKey && unknownFixtureKey.error.code === "UNKNOWN_FIXTURE_KEY",
    malformedJsonRejected: !malformedJson.ok && "error" in malformedJson && malformedJson.error.code === "MALFORMED_JSON",
    unsupportedContentTypeRejected:
      !unsupportedContentType.ok && "error" in unsupportedContentType && unsupportedContentType.error.code === "UNSUPPORTED_CONTENT_TYPE",
    multipartRejected: !multipart.ok && "error" in multipart && multipart.error.code === "UNSUPPORTED_CONTENT_TYPE",
    unexpectedFieldRejected: !unexpectedField.ok && "error" in unexpectedField && unexpectedField.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    binaryShapeRejected: !binaryShape.ok && "error" in binaryShape && binaryShape.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    realFileShapeRejected: !realFileShape.ok && "error" in realFileShape && realFileShape.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    base64PayloadRejected: !base64Payload.ok && "error" in base64Payload && base64Payload.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    objectUrlRejected: !objectUrl.ok && "error" in objectUrl && objectUrl.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    dataUrlRejected: !dataUrl.ok && "error" in dataUrl && dataUrl.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    imageUrlRejected: !imageUrl.ok && "error" in imageUrl && imageUrl.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    fileUrlRejected: !fileUrl.ok && "error" in fileUrl && fileUrl.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    storageHandleRejected: !storageHandle.ok && "error" in storageHandle && storageHandle.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    customerIdentifierRejected:
      !customerIdentifier.ok && "error" in customerIdentifier && customerIdentifier.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    rawOcrTextRejected: !rawOcrText.ok && "error" in rawOcrText && rawOcrText.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    providerPayloadRejected:
      !providerPayload.ok && "error" in providerPayload && providerPayload.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    ticketFieldRejected: !ticketField.ok && "error" in ticketField && ticketField.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    orderFieldRejected: !orderField.ok && "error" in orderField && orderField.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    nonSyntheticModeRejected:
      !nonSyntheticMode.ok && "error" in nonSyntheticMode && nonSyntheticMode.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    visionFixtureKeyRejected:
      !visionFixtureKeyRejected.ok &&
      "error" in visionFixtureKeyRejected &&
      visionFixtureKeyRejected.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    getRejected: !getFailure.ok && "error" in getFailure && getFailure.error.code === "METHOD_NOT_ALLOWED",
    putRejected: !putFailure.ok && "error" in putFailure && putFailure.error.code === "METHOD_NOT_ALLOWED",
    patchRejected: !patchFailure.ok && "error" in patchFailure && patchFailure.error.code === "METHOD_NOT_ALLOWED",
    deleteRejected: !deleteFailure.ok && "error" in deleteFailure && deleteFailure.error.code === "METHOD_NOT_ALLOWED",
    optionsRejected: !optionsFailure.ok && "error" in optionsFailure && optionsFailure.error.code === "METHOD_NOT_ALLOWED",
  };

  const responseBodies = [
    mockOcrSuccess,
    mockVisionSuccess,
    timeoutFailure,
    unavailableFailure,
    malformedFailure,
    unsupportedFailure,
    emptyFailure,
    rateCostFailure,
    redactionFailure,
    safetyRefusal,
    normalizationFailure,
    missingProviderType,
    unknownProviderType,
    missingBehavior,
    unknownBehavior,
    missingFixtureKey,
    unknownFixtureKey,
    malformedJson,
    unsupportedContentType,
    multipart,
    unexpectedField,
    binaryShape,
    realFileShape,
    base64Payload,
    objectUrl,
    dataUrl,
    imageUrl,
    fileUrl,
    storageHandle,
    customerIdentifier,
    rawOcrText,
    providerPayload,
    ticketField,
    orderField,
    nonSyntheticMode,
  ];

  const responseSafetyChecks = {
    allResponsesHaveNoUnsafeTerms: responseBodies.every((body) => !serializedHasUnsafeTerms(body)),
    allResponsesHaveNoBlockedShape: responseBodies.every((body) => !responseHasBlockedShape(body)),
    privacyMarkersSafe: responseBodies.every(hasSafePrivacyMarkers),
    validationDoesNotEchoPrivateMarker: !JSON.stringify(customerIdentifier).includes("synthetic-private-marker"),
    providerPayloadNotEchoed: !JSON.stringify(providerPayload).includes("\"raw\":\"synthetic\""),
  };

  const forbiddenRouteImports = [
    "@/lib/analysis/analyzer",
    "@/lib/analysis/types",
    "@/lib/analysis/report-adapter",
    "@/lib/analysis/receipt-parser",
    "@/lib/analysis/scoring",
    "@/components/ClaimReviewWorkflow",
    "@/components/ProductPhotoReviewPanel",
    "@/components/UploadPanel",
    "openai",
    "@aws-sdk",
    "@google-cloud",
    "tesseract.js",
    "pdfjs-dist",
  ];

  const isolationChecks = {
    routeHasDeveloperWarning:
      routeSource.includes("Synthetic mock-provider route skeleton only") &&
      routeSource.includes("separately approved milestone"),
    routeImportsMockAdapterOnly:
      routeSource.includes("@/lib/analysis/providers/mock-provider-adapter") &&
      forbiddenRouteImports.every((fragment) => !routeSourceHasForbiddenImport(fragment)),
    routeDoesNotImportOcrRoute: !routeSource.includes("src/app/api/analysis/ocr") && !routeSource.includes("../ocr/route"),
    routeDoesNotTouchLiveAnalyzer: !routeSource.includes("analyzeEvidenceFile"),
    routeDoesNotTouchLocalAnalysisResult: !routeSource.includes("LocalAnalysisResult"),
    routeDoesNotTouchClaimReviewWorkflow: !routeSource.includes("ClaimReviewWorkflow"),
    routeDoesNotTouchProductPhotoReviewPanel: !routeSource.includes("ProductPhotoReviewPanel"),
    routeDoesNotTouchUploadFlow: !routeSource.includes("@/components/UploadPanel") && !routeSource.includes("type=\"file\""),
    routeDoesNotReadEnvVars: !/process\.env/.test(routeSource),
    routeDoesNotCallNetwork: !/\bfetch\s*\(/.test(routeSource),
    routeDoesNotLogRawText: !/console\.(?:log|warn|error|info)/.test(routeSource),
    routeDoesNotCreateObjectUrls: !/createObjectURL|revokeObjectURL/.test(routeSource),
    routeDoesNotUseBrowserStorage: !/localStorage|sessionStorage/.test(routeSource),
    routeDoesNotUseFileOrBlobTypes: !/\bFile\b|\bBlob\b/.test(routeSource),
    probeImportsRoute: probeSource.includes("from \"./route\""),
  };

  const packageChecks = {
    noOpenAiDependency: !/"openai"\s*:/.test(packageJson),
    noAwsTextractDependency: !/"@aws-sdk\/client-textract"\s*:/.test(packageJson),
    noGoogleVisionDependency: !/"@google-cloud\/vision"\s*:/.test(packageJson),
    packageLockHasNoNewProviderClient:
      !/"openai"\s*:/.test(packageLock) &&
      !/"@aws-sdk\/client-textract"\s*:/.test(packageLock) &&
      !/"@google-cloud\/vision"\s*:/.test(packageLock),
  };

  const existingOcrRouteChecks = {
    ocrRouteStillAcceptsExactFixture: ocrRouteStillAcceptsExactFixture.ok === true,
    ocrRouteStillRejectsUnexpectedField:
      ocrRouteStillRejectsUnexpectedField.ok === false &&
      "error" in ocrRouteStillRejectsUnexpectedField &&
      ocrRouteStillRejectsUnexpectedField.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    ocrRouteStillDoesNotImportMockAdapter: !ocrRouteSource.includes("@/lib/analysis/providers/mock-provider-adapter"),
    ocrRouteStillExactFixtureKeyOnly: ocrRouteSource.includes("const allowedRequestKeys = new Set([\"fixtureKey\"])"),
  };

  assertProbeChecksPass("success", successChecks);
  assertProbeChecksPass("failure modes", failureModeChecks);
  assertProbeChecksPass("rejections", rejectionChecks);
  assertProbeChecksPass("response safety", responseSafetyChecks);
  assertProbeChecksPass("route isolation", isolationChecks);
  assertProbeChecksPass("package isolation", packageChecks);
  assertProbeChecksPass("existing OCR route", existingOcrRouteChecks);

  return {
    successChecks,
    failureModeChecks,
    rejectionChecks,
    responseSafetyChecks,
    isolationChecks,
    packageChecks,
    existingOcrRouteChecks,
    routeMode: mockOcrSuccess.mode,
  } as const;
}

export const MOCK_PROVIDER_ROUTE_DEVELOPER_PROBE = runMockProviderRouteProbe();
