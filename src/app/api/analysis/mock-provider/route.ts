import {
  MOCK_PROVIDER_MODE,
  runMockOcrProvider,
  runMockVisionProvider,
  type MockEvidenceTypeHint,
  type MockProviderAdapterResult,
  type MockProviderBehavior,
  type MockProviderType,
} from "@/lib/analysis/providers/mock-provider-adapter";

// Synthetic mock-provider route skeleton only. Do not wire this route to uploads,
// UI, live providers, storage, or real evidence without a separately approved milestone.
const ROUTE_MODE = "synthetic-mock-provider-route" as const;
const ROUTE_SOURCE = "mock-provider-adapter" as const;
const ROUTE_REQUEST_MODE = "synthetic" as const;
const MAX_SYNTHETIC_JSON_BYTES = 4096;

type MockProviderRouteErrorCode =
  | "METHOD_NOT_ALLOWED"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "MALFORMED_JSON"
  | "INVALID_SYNTHETIC_REQUEST"
  | "MISSING_PROVIDER_TYPE"
  | "UNKNOWN_PROVIDER_TYPE"
  | "MISSING_SYNTHETIC_BEHAVIOR"
  | "UNKNOWN_SYNTHETIC_BEHAVIOR"
  | "MISSING_FIXTURE_KEY"
  | "UNKNOWN_FIXTURE_KEY"
  | "UNSUPPORTED_INPUT_BOUNDARY";

type MockProviderRouteValidationFailure = {
  ok: false;
  mode: typeof ROUTE_MODE;
  error: {
    code: MockProviderRouteErrorCode;
    message: string;
  };
};

type MockProviderRouteProviderFailure = {
  ok: false;
  mode: typeof ROUTE_MODE;
  source: typeof ROUTE_SOURCE;
  providerType: MockProviderType;
  result: Extract<MockProviderAdapterResult, { ok: false }>["result"];
};

type MockProviderRouteSuccess = {
  ok: true;
  mode: typeof ROUTE_MODE;
  source: typeof ROUTE_SOURCE;
  providerType: MockProviderType;
  result: Extract<MockProviderAdapterResult, { ok: true }>["result"];
};

type ValidatedRouteRequest = {
  providerType: MockProviderType;
  behavior: MockProviderBehavior;
  fixtureKey?: string;
  evidenceTypeHint: MockEvidenceTypeHint;
};

const allowedRequestKeys = new Set(["providerType", "fixtureKey", "behavior", "mode", "evidenceTypeHint"]);
const allowedProviderTypes = new Set<MockProviderType>(["mock-ocr", "mock-vision"]);
const allowedBehaviors = new Set<MockProviderBehavior>([
  "success",
  "timeout",
  "unavailable",
  "malformed-response",
  "unsupported-evidence",
  "empty-output",
  "rate-cost-limit",
  "redaction-failure",
  "safety-refusal",
  "internal-normalization-error",
]);
const allowedEvidenceTypeHints = new Set<MockEvidenceTypeHint>(["receipt", "order-screenshot", "product-photo", "unknown"]);
const allowedOcrFixtureKeys = new Set([
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
]);

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
  "base64",
  "base64image",
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
  "rawocr",
  "rawocrtext",
  "customer",
  "customerid",
  "customername",
  "name",
  "address",
  "email",
  "phone",
  "ticket",
  "ticketid",
  "order",
  "ordernumber",
  "orderid",
  "trackingnumber",
  "trackingid",
  "caseid",
  "claimid",
  "evidenceid",
  "retention",
  "persist",
  "store",
  "claimoutcome",
  "automaticdisposition",
]);

const urlLikeValuePattern = /(?:https?:\/\/|blob:|data:|file:|s3:\/\/|gs:\/\/)/i;
const base64LikeValuePattern = /^[A-Za-z0-9+/]{80,}={0,2}$/;
const privateIdentifierValuePatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){0,6}(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|way|boulevard|blvd\.?)\b/i,
  /\b(?:order|tracking|ticket|case|claim|evidence)[-_ #:]?[A-Z0-9-]{4,}\b/i,
];

function failureResponse(
  code: MockProviderRouteErrorCode,
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
    } satisfies MockProviderRouteValidationFailure,
    {
      status,
      headers: extraHeaders,
    },
  );
}

function methodNotAllowed() {
  return failureResponse(
    "METHOD_NOT_ALLOWED",
    "This route accepts synthetic mock-provider JSON requests by POST only.",
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

function getContentLength(request: Request) {
  const rawLength = request.headers.get("content-length");

  if (!rawLength) {
    return null;
  }

  const parsedLength = Number(rawLength);
  return Number.isFinite(parsedLength) ? parsedLength : null;
}

function hasUnsupportedShape(value: unknown): boolean {
  if (Array.isArray(value)) {
    return true;
  }

  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, nestedValue]) => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

      return unsupportedKeyNames.has(normalizedKey) || hasUnsupportedShape(nestedValue);
    });
  }

  if (typeof value !== "string") {
    return false;
  }

  if (urlLikeValuePattern.test(value) || base64LikeValuePattern.test(value.trim())) {
    return true;
  }

  return privateIdentifierValuePatterns.some((pattern) => pattern.test(value));
}

function validateRouteBody(body: unknown): { ok: true; request: ValidatedRouteRequest } | { ok: false; response: Response } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      response: failureResponse(
        "INVALID_SYNTHETIC_REQUEST",
        "This route accepts synthetic mock-provider JSON requests only.",
        400,
      ),
    };
  }

  const requestKeys = Object.keys(body);

  if (requestKeys.some((key) => !allowedRequestKeys.has(key))) {
    return {
      ok: false,
      response: failureResponse(
        "UNSUPPORTED_INPUT_BOUNDARY",
        "Synthetic mock-provider requests cannot include files, URLs, storage handles, provider payloads, private identifier fields, or extra fields.",
        400,
      ),
    };
  }

  if (hasUnsupportedShape(body)) {
    return {
      ok: false,
      response: failureResponse(
        "UNSUPPORTED_INPUT_BOUNDARY",
        "Synthetic mock-provider requests cannot include files, URLs, storage handles, provider payloads, or private identifier fields.",
        400,
      ),
    };
  }

  const providerType = (body as { providerType?: unknown }).providerType;

  if (typeof providerType !== "string" || providerType.trim().length === 0) {
    return {
      ok: false,
      response: failureResponse("MISSING_PROVIDER_TYPE", "A mock provider type is required.", 400),
    };
  }

  if (!allowedProviderTypes.has(providerType as MockProviderType)) {
    return {
      ok: false,
      response: failureResponse("UNKNOWN_PROVIDER_TYPE", "The requested mock provider type is not available.", 400),
    };
  }

  const mockProviderType = providerType as MockProviderType;

  const behavior = (body as { behavior?: unknown }).behavior;

  if (typeof behavior !== "string" || behavior.trim().length === 0) {
    return {
      ok: false,
      response: failureResponse("MISSING_SYNTHETIC_BEHAVIOR", "A synthetic mock behavior key is required.", 400),
    };
  }

  if (!allowedBehaviors.has(behavior as MockProviderBehavior)) {
    return {
      ok: false,
      response: failureResponse("UNKNOWN_SYNTHETIC_BEHAVIOR", "The requested synthetic mock behavior is not available.", 400),
    };
  }

  const mode = (body as { mode?: unknown }).mode;

  if (mode !== ROUTE_REQUEST_MODE) {
    return {
      ok: false,
      response: failureResponse(
        "UNSUPPORTED_INPUT_BOUNDARY",
        "This route accepts synthetic mock-provider mode only.",
        400,
      ),
    };
  }

  const evidenceTypeHint = (body as { evidenceTypeHint?: unknown }).evidenceTypeHint;
  const normalizedEvidenceTypeHint =
    typeof evidenceTypeHint === "string" && evidenceTypeHint.length > 0
      ? evidenceTypeHint
      : mockProviderType === "mock-ocr"
        ? "receipt"
        : "product-photo";

  if (!allowedEvidenceTypeHints.has(normalizedEvidenceTypeHint as MockEvidenceTypeHint)) {
    return {
      ok: false,
      response: failureResponse("UNSUPPORTED_INPUT_BOUNDARY", "The synthetic evidence type hint is not supported.", 400),
    };
  }

  const fixtureKey = (body as { fixtureKey?: unknown }).fixtureKey;

  if (mockProviderType === "mock-ocr") {
    if (typeof fixtureKey !== "string" || fixtureKey.trim().length === 0) {
      return {
        ok: false,
        response: failureResponse("MISSING_FIXTURE_KEY", "A known synthetic OCR fixture key is required.", 400),
      };
    }

    if (!allowedOcrFixtureKeys.has(fixtureKey)) {
      return {
        ok: false,
        response: failureResponse("UNKNOWN_FIXTURE_KEY", "The requested synthetic OCR fixture key is not available.", 404),
      };
    }
  }

  if (mockProviderType === "mock-vision" && fixtureKey !== undefined) {
    return {
      ok: false,
      response: failureResponse(
        "UNSUPPORTED_INPUT_BOUNDARY",
        "Mock vision requests use a synthetic evidence type hint instead of OCR fixture text.",
        400,
      ),
    };
  }

  return {
    ok: true,
    request: {
      providerType: mockProviderType,
      behavior: behavior as MockProviderBehavior,
      evidenceTypeHint: normalizedEvidenceTypeHint as MockEvidenceTypeHint,
      ...(typeof fixtureKey === "string" ? { fixtureKey } : {}),
    },
  };
}

function routeResponse(providerType: MockProviderType, adapterResult: MockProviderAdapterResult) {
  if (adapterResult.ok) {
    return Response.json(
      {
        ok: true,
        mode: ROUTE_MODE,
        source: ROUTE_SOURCE,
        providerType,
        result: adapterResult.result,
      } satisfies MockProviderRouteSuccess,
      { status: 200 },
    );
  }

  return Response.json(
    {
      ok: false,
      mode: ROUTE_MODE,
      source: ROUTE_SOURCE,
      providerType,
      result: adapterResult.result,
    } satisfies MockProviderRouteProviderFailure,
    { status: 200 },
  );
}

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed();
  }

  const contentType = request.headers.get("content-type");

  if (isMultipartContentType(contentType)) {
    return failureResponse(
      "UNSUPPORTED_CONTENT_TYPE",
      "This route accepts synthetic mock-provider JSON requests only.",
      415,
    );
  }

  if (!isJsonContentType(contentType)) {
    return failureResponse(
      "UNSUPPORTED_CONTENT_TYPE",
      "This route accepts synthetic mock-provider JSON requests only.",
      415,
    );
  }

  const contentLength = getContentLength(request);

  if (contentLength !== null && contentLength > MAX_SYNTHETIC_JSON_BYTES) {
    return failureResponse(
      "UNSUPPORTED_INPUT_BOUNDARY",
      "This synthetic route accepts only small mock-provider JSON requests.",
      413,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return failureResponse("MALFORMED_JSON", "The synthetic mock-provider request JSON could not be parsed.", 400);
  }

  const validation = validateRouteBody(body);

  if (!validation.ok) {
    return validation.response;
  }

  const adapterInput = {
    providerMode: MOCK_PROVIDER_MODE,
    evidenceTypeHint: validation.request.evidenceTypeHint,
    behavior: validation.request.behavior,
    ...(validation.request.fixtureKey ? { fixtureKey: validation.request.fixtureKey } : {}),
  };
  const adapterResult =
    validation.request.providerType === "mock-ocr"
      ? runMockOcrProvider(adapterInput)
      : runMockVisionProvider(adapterInput);

  return routeResponse(validation.request.providerType, adapterResult);
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
