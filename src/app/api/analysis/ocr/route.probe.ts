import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DELETE, GET, OPTIONS, PATCH, POST, PUT } from "./route";

type RouteResponseBody =
  | {
      ok: true;
      mode: string;
      source: string;
      result: {
        status: string;
        reviewSignalLevel: string;
        requiresManualReview: boolean;
        unsupportedReason: string | null;
        providerFailureReason: string | null;
        manualReviewDrivers: readonly { code: string; message: string; reviewSignalLevel: string }[];
        limitations: readonly { code: string; message: string }[];
        retention: {
          fileRetained: boolean;
          rawOcrRetained: boolean;
          providerPayloadRetained: boolean;
          providerPayloadLogged: boolean;
        };
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
const routeSource = readFileSync(join(repoRoot, "src/app/api/analysis/ocr/route.ts"), "utf8");
const probeSource = readFileSync(join(repoRoot, "src/app/api/analysis/ocr/route.probe.ts"), "utf8");
const packageJson = readFileSync(join(repoRoot, "package.json"), "utf8");

function assertProbeChecksPass(group: string, checks: Record<string, boolean>) {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Synthetic OCR route probe failed (${group}): ${failed.join(", ")}`);
  }
}

function requestWithBody(body: unknown, contentType = "application/json") {
  return new Request("http://localhost/api/analysis/ocr", {
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

function hasDriver(body: RouteResponseBody, code: string) {
  return body.ok && body.result.manualReviewDrivers.some((driver) => driver.code === code);
}

function hasLimitation(body: RouteResponseBody, code: string) {
  return body.ok && body.result.limitations.some((limitation) => limitation.code === code);
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
    "refund",
    "final claim",
    "final decision",
    ["external verification", "complete"].join(" "),
    ["external verification", "confirmed"].join(" "),
  ];

  return unsafeTerms.some((term) => serialized.includes(term));
}

function routeSourceHasForbiddenImport(fragment: string) {
  return new RegExp(`from\\s+["'][^"']*${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(
    routeSource,
  );
}

async function runOcrRouteProbe() {
  const cleanReceipt = await postJson({ fixtureKey: "clean-receipt-ocr" });
  const amazonLike = await postJson({ fixtureKey: "amazon-like-order-ocr" });
  const missingTotal = await postJson({ fixtureKey: "missing-total-ocr" });
  const missingMerchant = await postJson({ fixtureKey: "missing-merchant-ocr" });
  const conflictingDateTotal = await postJson({ fixtureKey: "conflicting-date-total-ocr" });
  const noisyOcr = await postJson({ fixtureKey: "noisy-ocr-text" });
  const incompleteReceiptLike = await postJson({ fixtureKey: "receipt-like-incomplete-ocr" });
  const unsupportedNonReceipt = await postJson({ fixtureKey: "unsupported-non-receipt-text" });
  const ambiguousMarketplace = await postJson({ fixtureKey: "ambiguous-marketplace-screen-ocr" });
  const providerTimeout = await postJson({ fixtureKey: "provider-timeout-synthetic-failure" });
  const emptyOcrOutput = await postJson({ fixtureKey: "empty-ocr-output" });

  const missingFixtureKey = await postJson({});
  const unknownFixtureKey = await postJson({ fixtureKey: "not-a-known-synthetic-fixture" });
  const malformedJson = await responseJson(await POST(requestWithBody("{", "application/json")));
  const unsupportedContentType = await postJson('{"fixtureKey":"clean-receipt-ocr"}', "text/plain");
  const multipart = await postJson("fixtureKey=clean-receipt-ocr", "multipart/form-data; boundary=synthetic");
  const objectUrl = await postJson({ fixtureKey: "clean-receipt-ocr", objectUrl: "blob:http://local/synthetic" });
  const dataUrl = await postJson({ fixtureKey: "clean-receipt-ocr", imageUrl: "data:image/png;base64,AAAA" });
  const imageUrl = await postJson({ fixtureKey: "clean-receipt-ocr", imageUrl: "https://example.invalid/image.png" });
  const fileUrl = await postJson({ fixtureKey: "clean-receipt-ocr", fileUrl: "file:///tmp/image.png" });
  const storageHandle = await postJson({ fixtureKey: "clean-receipt-ocr", storageHandle: "synthetic-storage-key" });
  const customerIdentifier = await postJson({ fixtureKey: "clean-receipt-ocr", customerId: "synthetic-private-marker" });
  const realFileShape = await postJson({ fixtureKey: "clean-receipt-ocr", file: { name: "receipt.png" } });
  const binaryShape = await postJson({ fixtureKey: "clean-receipt-ocr", bytes: [1, 2, 3] });
  const unexpectedField = await postJson({ fixtureKey: "clean-receipt-ocr", note: "ignored extra field" });

  const getFailure = await responseJson(await GET());
  const putFailure = await responseJson(await PUT());
  const patchFailure = await responseJson(await PATCH());
  const deleteFailure = await responseJson(await DELETE());
  const optionsFailure = await responseJson(await OPTIONS());

  const acceptedFixtureChecks = {
    cleanReceiptAccepted:
      cleanReceipt.ok &&
      cleanReceipt.result.status === "completed" &&
      cleanReceipt.result.reviewSignalLevel === "low",
    amazonLikeAcceptedWithManualReview:
      amazonLike.ok && amazonLike.result.status === "completed" && hasDriver(amazonLike, "marketplace-readiness"),
    missingTotalAcceptedWithDriver:
      missingTotal.ok && missingTotal.result.status === "needs-review" && hasDriver(missingTotal, "missing-field"),
    missingMerchantAcceptedWithDriver:
      missingMerchant.ok &&
      missingMerchant.result.status === "needs-review" &&
      hasDriver(missingMerchant, "missing-field"),
    conflictAcceptedWithDriver:
      conflictingDateTotal.ok &&
      conflictingDateTotal.result.status === "needs-review" &&
      hasDriver(conflictingDateTotal, "conflicting-field"),
    noisyAcceptedWithReviewDriver:
      noisyOcr.ok && noisyOcr.result.status === "needs-review" && noisyOcr.result.reviewSignalLevel === "high",
    incompleteAcceptedWithReviewDriver:
      incompleteReceiptLike.ok &&
      incompleteReceiptLike.result.status === "needs-review" &&
      incompleteReceiptLike.result.requiresManualReview,
    unsupportedNonReceiptSafeUnsupported:
      unsupportedNonReceipt.ok &&
      unsupportedNonReceipt.result.status === "unsupported" &&
      hasDriver(unsupportedNonReceipt, "unsupported-structure") &&
      Boolean(unsupportedNonReceipt.result.unsupportedReason),
    ambiguousMarketplaceManualReview:
      ambiguousMarketplace.ok &&
      ambiguousMarketplace.result.status === "needs-review" &&
      hasDriver(ambiguousMarketplace, "ambiguous-marketplace-structure"),
    providerTimeoutOperationalOnly:
      providerTimeout.ok &&
      providerTimeout.result.status === "provider-failure" &&
      providerTimeout.result.reviewSignalLevel === "operational" &&
      Boolean(providerTimeout.result.providerFailureReason) &&
      hasLimitation(providerTimeout, "provider-unavailable"),
    emptyOcrOutputSafeLimitation:
      emptyOcrOutput.ok &&
      emptyOcrOutput.result.status === "empty" &&
      emptyOcrOutput.result.requiresManualReview &&
      hasDriver(emptyOcrOutput, "empty-output") &&
      hasLimitation(emptyOcrOutput, "empty-output"),
  };

  const failureChecks = {
    missingFixtureKeyFails: !missingFixtureKey.ok && missingFixtureKey.error.code === "MISSING_FIXTURE_KEY",
    unknownFixtureKeyFails: !unknownFixtureKey.ok && unknownFixtureKey.error.code === "UNKNOWN_FIXTURE_KEY",
    malformedJsonFails: !malformedJson.ok && malformedJson.error.code === "MALFORMED_JSON",
    unsupportedContentTypeFails:
      !unsupportedContentType.ok && unsupportedContentType.error.code === "UNSUPPORTED_CONTENT_TYPE",
    multipartFails: !multipart.ok && multipart.error.code === "UNSUPPORTED_CONTENT_TYPE",
    objectUrlFails: !objectUrl.ok && objectUrl.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    dataUrlFails: !dataUrl.ok && dataUrl.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    imageUrlFails: !imageUrl.ok && imageUrl.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    fileUrlFails: !fileUrl.ok && fileUrl.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    storageHandleFails: !storageHandle.ok && storageHandle.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    customerIdentifierFails:
      !customerIdentifier.ok && customerIdentifier.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    realFileShapeFails: !realFileShape.ok && realFileShape.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    binaryShapeFails: !binaryShape.ok && binaryShape.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    unexpectedFieldFails: !unexpectedField.ok && unexpectedField.error.code === "UNSUPPORTED_INPUT_BOUNDARY",
    getFails: !getFailure.ok && getFailure.error.code === "METHOD_NOT_ALLOWED",
    putFails: !putFailure.ok && putFailure.error.code === "METHOD_NOT_ALLOWED",
    patchFails: !patchFailure.ok && patchFailure.error.code === "METHOD_NOT_ALLOWED",
    deleteFails: !deleteFailure.ok && deleteFailure.error.code === "METHOD_NOT_ALLOWED",
    optionsFails: !optionsFailure.ok && optionsFailure.error.code === "METHOD_NOT_ALLOWED",
  };

  const responseSafetyChecks = {
    acceptedResponsesHaveNoUnsafeTerms: [
      cleanReceipt,
      amazonLike,
      missingTotal,
      missingMerchant,
      conflictingDateTotal,
      noisyOcr,
      incompleteReceiptLike,
      unsupportedNonReceipt,
      ambiguousMarketplace,
      providerTimeout,
      emptyOcrOutput,
    ].every((body) => !serializedHasUnsafeTerms(body)),
    failureResponsesHaveNoUnsafeTerms: [
      missingFixtureKey,
      unknownFixtureKey,
      malformedJson,
      unsupportedContentType,
      multipart,
      objectUrl,
      dataUrl,
      imageUrl,
      fileUrl,
      storageHandle,
      customerIdentifier,
      realFileShape,
      binaryShape,
      unexpectedField,
    ].every((body) => !serializedHasUnsafeTerms(body)),
    noSingleUnsafeScoreField: !JSON.stringify(cleanReceipt).toLowerCase().includes(["fr", "aud"].join("") + "score"),
    retentionMarkersAllFalse:
      cleanReceipt.ok &&
      Object.values(cleanReceipt.result.retention).every((value) => value === false) &&
      providerTimeout.ok &&
      Object.values(providerTimeout.result.retention).every((value) => value === false),
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
    routeModuleImported: typeof POST === "function" && typeof GET === "function",
    routeImportsFixtureHarness: routeSource.includes("@/lib/analysis/ocr-fixture-harness"),
    routeImportsExtractionContract: routeSource.includes("@/lib/analysis/ocr-extraction-contract"),
    routeHasNoForbiddenImports: forbiddenRouteImports.every((fragment) => !routeSourceHasForbiddenImport(fragment)),
    routeDoesNotTouchLiveAnalyzer: !routeSource.includes("analyzeEvidenceFile"),
    routeDoesNotTouchLocalAnalysisResult: !routeSource.includes("LocalAnalysisResult"),
    routeDoesNotTouchClaimReviewWorkflow: !routeSource.includes("ClaimReviewWorkflow"),
    routeDoesNotTouchProductPhotoReviewPanel: !routeSource.includes("ProductPhotoReviewPanel"),
    routeDoesNotTouchUploadFlow: !routeSource.includes("@/components/UploadPanel") && !routeSource.includes("type=\"file\""),
    routeDoesNotReadEnvVars: !/process\.env/.test(routeSource),
    routeDoesNotCallNetwork: !/\bfetch\s*\(/.test(routeSource),
    routeDoesNotLogRawText: !/console\.(?:log|warn|error|info)/.test(routeSource),
    routeDoesNotCreateObjectUrls: !/createObjectURL|revokeObjectURL/.test(routeSource),
    routeDoesNotUseFileOrBlobTypes: !/\bFile\b|\bBlob\b/.test(routeSource),
    probeImportsOnlyRoute: probeSource.includes("from \"./route\""),
  };

  const packageChecks = {
    noOpenAiDependency: !/"openai"\s*:/.test(packageJson),
    noAwsTextractDependency: !/"@aws-sdk\/client-textract"\s*:/.test(packageJson),
    noGoogleVisionDependency: !/"@google-cloud\/vision"\s*:/.test(packageJson),
  };

  assertProbeChecksPass("accepted fixtures", acceptedFixtureChecks);
  assertProbeChecksPass("validation failures", failureChecks);
  assertProbeChecksPass("response safety", responseSafetyChecks);
  assertProbeChecksPass("route isolation", isolationChecks);
  assertProbeChecksPass("package isolation", packageChecks);

  return {
    acceptedFixtureChecks,
    failureChecks,
    responseSafetyChecks,
    isolationChecks,
    packageChecks,
    routeMode: cleanReceipt.mode,
    source: cleanReceipt.ok ? cleanReceipt.source : null,
  } as const;
}

export const OCR_ROUTE_DEVELOPER_PROBE = runOcrRouteProbe();
