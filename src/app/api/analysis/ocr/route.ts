import {
  normalizeSyntheticOcrFixtureToExtractionContract,
  type NormalizedOcrReceiptExtractionResult,
} from "@/lib/analysis/ocr-extraction-contract";
import { SYNTHETIC_OCR_FIXTURE_CASES, type SyntheticOcrFixtureCase } from "@/lib/analysis/ocr-fixture-harness";

const ROUTE_MODE = "synthetic-ocr-route-skeleton" as const;
const ROUTE_SOURCE = "synthetic-fixture" as const;
const MAX_SYNTHETIC_JSON_BYTES = 4096;

type OcrRouteErrorCode =
  | "METHOD_NOT_ALLOWED"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "MALFORMED_JSON"
  | "INVALID_SYNTHETIC_REQUEST"
  | "MISSING_FIXTURE_KEY"
  | "UNKNOWN_FIXTURE_KEY"
  | "UNSUPPORTED_INPUT_BOUNDARY";

type OcrRouteFailureResponse = {
  ok: false;
  mode: typeof ROUTE_MODE;
  error: {
    code: OcrRouteErrorCode;
    message: string;
  };
};

type OcrRouteSuccessResult = Pick<
  NormalizedOcrReceiptExtractionResult,
  | "contractName"
  | "phase"
  | "runtimeLive"
  | "providerFree"
  | "uiFree"
  | "uploadFree"
  | "storageFree"
  | "realEvidenceFree"
  | "status"
  | "extractedTextBlocks"
  | "structuredFields"
  | "fieldConfidence"
  | "extractionConfidence"
  | "manualReviewDrivers"
  | "limitations"
  | "safeSummary"
  | "reviewSignalLevel"
  | "requiresManualReview"
> & {
  sourceKind: typeof ROUTE_SOURCE;
  routeLive: false;
  routeMode: typeof ROUTE_MODE;
  retention: {
    fileRetained: false;
    rawOcrRetained: false;
    providerPayloadRetained: false;
    providerPayloadLogged: false;
  };
  unsupportedReason: string | null;
  providerFailureReason: string | null;
};

type OcrRouteSuccessResponse = {
  ok: true;
  mode: typeof ROUTE_MODE;
  source: typeof ROUTE_SOURCE;
  result: OcrRouteSuccessResult;
};

const fixtureByKey = new Map<string, SyntheticOcrFixtureCase>(
  SYNTHETIC_OCR_FIXTURE_CASES.map((fixture) => [fixture.key, fixture]),
);
const allowedRequestKeys = new Set(["fixtureKey"]);

const unsupportedKeyNames = new Set([
  "file",
  "files",
  "blob",
  "bytes",
  "filebytes",
  "imagebuffer",
  "buffer",
  "binary",
  "multipart",
  "formdata",
  "image",
  "objecturl",
  "imageurl",
  "dataurl",
  "fileurl",
  "url",
  "href",
  "storagehandle",
  "providerpayload",
  "providerresponse",
  "providerrequestid",
  "customerid",
  "customername",
  "name",
  "address",
  "email",
  "phone",
  "ordernumber",
  "orderid",
  "trackingnumber",
  "trackingid",
  "ticketid",
  "caseid",
  "claimid",
  "evidenceid",
  "retention",
  "persist",
  "store",
  "finaldecision",
  "claimoutcome",
  "automaticdisposition",
]);

const urlLikeValuePattern = /(?:https?:\/\/|blob:|data:|file:|s3:\/\/|gs:\/\/)/i;
const privateIdentifierValuePatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){0,6}(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|way|boulevard|blvd\.?)\b/i,
  /\b(?:order|tracking|ticket|case|claim|evidence)[-_ #:]?[A-Z0-9-]{4,}\b/i,
];

function failureResponse(
  code: OcrRouteErrorCode,
  message: string,
  status: number,
  extraHeaders?: HeadersInit,
): Response {
  return Response.json(
    {
      ok: false,
      mode: ROUTE_MODE,
      error: {
        code,
        message,
      },
    } satisfies OcrRouteFailureResponse,
    {
      status,
      headers: extraHeaders,
    },
  );
}

function methodNotAllowed() {
  return failureResponse(
    "METHOD_NOT_ALLOWED",
    "This route currently accepts synthetic JSON fixture requests by POST only.",
    405,
    { Allow: "POST" },
  );
}

function isJsonContentType(contentType: string | null) {
  return Boolean(contentType?.toLowerCase().split(";")[0].trim() === "application/json");
}

function isMultipartContentType(contentType: string | null) {
  return Boolean(contentType?.toLowerCase().startsWith("multipart/form-data"));
}

function hasUnsupportedValue(value: unknown, keyPath: string[] = []): boolean {
  if (Array.isArray(value)) {
    return value.some((item, index) => hasUnsupportedValue(item, [...keyPath, String(index)]));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, nestedValue]) => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

      return unsupportedKeyNames.has(normalizedKey) || hasUnsupportedValue(nestedValue, [...keyPath, key]);
    });
  }

  if (typeof value !== "string") {
    return false;
  }

  if (urlLikeValuePattern.test(value)) {
    return true;
  }

  if (keyPath.at(-1) === "fixtureKey") {
    return false;
  }

  return privateIdentifierValuePatterns.some((pattern) => pattern.test(value));
}

function getContentLength(request: Request) {
  const rawLength = request.headers.get("content-length");

  if (!rawLength) {
    return null;
  }

  const parsedLength = Number(rawLength);
  return Number.isFinite(parsedLength) ? parsedLength : null;
}

function sanitizeRouteText(text: string) {
  return text
    .replace(/proof or a final decision/gi, "proof or a support outcome")
    .replace(/not a final decision/gi, "review-support only")
    .replace(/final decision/gi, "support outcome");
}

function sanitizeRouteValue<TValue>(value: TValue): TValue {
  if (typeof value === "string") {
    return sanitizeRouteText(value) as TValue;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeRouteValue(item)) as TValue;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeRouteValue(nestedValue)]),
    ) as TValue;
  }

  return value;
}

function routeResultFromContract(result: NormalizedOcrReceiptExtractionResult): OcrRouteSuccessResult {
  return sanitizeRouteValue({
    contractName: result.contractName,
    phase: result.phase,
    runtimeLive: result.runtimeLive,
    providerFree: result.providerFree,
    uiFree: result.uiFree,
    uploadFree: result.uploadFree,
    storageFree: result.storageFree,
    realEvidenceFree: result.realEvidenceFree,
    sourceKind: ROUTE_SOURCE,
    routeLive: false,
    routeMode: ROUTE_MODE,
    status: result.status,
    extractedTextBlocks: result.extractedTextBlocks,
    structuredFields: result.structuredFields,
    fieldConfidence: result.fieldConfidence,
    extractionConfidence: result.extractionConfidence,
    manualReviewDrivers: result.manualReviewDrivers,
    limitations: result.limitations,
    safeSummary: {
      ...result.safeSummary,
      headline: result.safeSummary.headline.replace(/not a final decision/gi, "review-support only"),
    },
    unsupportedReason: result.unsupportedReason ?? null,
    providerFailureReason: result.providerFailureReason ?? null,
    reviewSignalLevel: result.reviewSignalLevel,
    requiresManualReview: result.requiresManualReview,
    retention: {
      fileRetained: false,
      rawOcrRetained: false,
      providerPayloadRetained: false,
      providerPayloadLogged: false,
    },
  });
}

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed();
  }

  const contentType = request.headers.get("content-type");

  if (isMultipartContentType(contentType)) {
    return failureResponse(
      "UNSUPPORTED_CONTENT_TYPE",
      "This route currently accepts synthetic JSON fixture requests only.",
      415,
    );
  }

  if (!isJsonContentType(contentType)) {
    return failureResponse(
      "UNSUPPORTED_CONTENT_TYPE",
      "This route currently accepts synthetic JSON fixture requests only.",
      415,
    );
  }

  const contentLength = getContentLength(request);

  if (contentLength !== null && contentLength > MAX_SYNTHETIC_JSON_BYTES) {
    return failureResponse(
      "UNSUPPORTED_INPUT_BOUNDARY",
      "This synthetic route accepts only small JSON fixture requests.",
      413,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return failureResponse("MALFORMED_JSON", "The synthetic fixture request JSON could not be parsed.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return failureResponse(
      "INVALID_SYNTHETIC_REQUEST",
      "This route expects a JSON object containing a synthetic fixture key.",
      400,
    );
  }

  const requestKeys = Object.keys(body);

  if (requestKeys.some((key) => !allowedRequestKeys.has(key))) {
    return failureResponse(
      "UNSUPPORTED_INPUT_BOUNDARY",
      "This route currently accepts only a synthetic fixture key.",
      400,
    );
  }

  if (hasUnsupportedValue(body)) {
    return failureResponse(
      "UNSUPPORTED_INPUT_BOUNDARY",
      "Synthetic fixture requests cannot include files, URLs, storage handles, provider payloads, or private identifier fields.",
      400,
    );
  }

  const fixtureKey = (body as { fixtureKey?: unknown }).fixtureKey;

  if (typeof fixtureKey !== "string" || fixtureKey.trim().length === 0) {
    return failureResponse("MISSING_FIXTURE_KEY", "A known synthetic OCR fixture key is required.", 400);
  }

  const fixture = fixtureByKey.get(fixtureKey);

  if (!fixture) {
    return failureResponse("UNKNOWN_FIXTURE_KEY", "The requested synthetic OCR fixture key is not available.", 404);
  }

  const normalizedResult = normalizeSyntheticOcrFixtureToExtractionContract(fixture);

  return Response.json(
    {
      ok: true,
      mode: ROUTE_MODE,
      source: ROUTE_SOURCE,
      result: routeResultFromContract(normalizedResult),
    } satisfies OcrRouteSuccessResponse,
    { status: 200 },
  );
}

export function GET() {
  return methodNotAllowed();
}

export function PUT() {
  return methodNotAllowed();
}

export function PATCH() {
  return methodNotAllowed();
}

export function DELETE() {
  return methodNotAllowed();
}

export function OPTIONS() {
  return methodNotAllowed();
}
