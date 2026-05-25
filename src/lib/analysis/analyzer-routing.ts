import {
  recognizeProductPhotoEvidence,
  type ProductPhotoRecognitionInput,
  type ProductPhotoRecognitionResult,
} from "@/lib/analysis/product-photo-recognition";
import type { FileTypeCategory } from "@/lib/analysis/types";

export const ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING: boolean = false;

export type AnalyzerRoutingGuardInput = ProductPhotoRecognitionInput & {
  runtimeRoutingEnabled?: boolean;
};

export type AnalyzerRoutingGuardRoute =
  | "receipt-analyzer-path"
  | "product-photo-guarded"
  | "unknown-inconclusive";

export type AnalyzerRoutingGuardStatus =
  | "receipt-path-preserved"
  | "unsupported-live-path"
  | "unknown-inconclusive";

export type AnalyzerRoutingGuardDecision = {
  boundary: "analyzer-routing-guard";
  devOnly: true;
  runtimeRoutingEnabled: boolean;
  route: AnalyzerRoutingGuardRoute;
  receiptPathPreserved: boolean;
  productPhotoCandidate: boolean;
  status: AnalyzerRoutingGuardStatus;
  recognition: ProductPhotoRecognitionResult;
  localAnalysisResultShapeRequired: false;
  adapterInvoked: false;
  uiOrReportBehaviorExercised: false;
  reasons: string[];
  limitations: string[];
};

export type AnalyzerRoutingFileLike = {
  name?: string;
  type?: string;
  size?: number;
};

export type AnalyzerFileRoutingGuardInput = AnalyzerRoutingGuardInput & {
  file?: AnalyzerRoutingFileLike;
  name?: string;
  type?: string;
  size?: number;
};

export type AnalyzerFileRoutingGuardDecision = Omit<AnalyzerRoutingGuardDecision, "boundary" | "reasons" | "limitations"> & {
  boundary: "analyzer-file-routing-guard";
  fileAware: true;
  fileContext: {
    fileNamePresent: boolean;
    mimeTypePresent: boolean;
    fileTypeCategory: FileTypeCategory;
  };
  reasons: string[];
  limitations: string[];
};

const ANALYZER_ROUTING_LIMITATIONS = [
  "dev-only analyzer routing guard",
  "unsupported live path for product-photo candidates",
  "manual-review support only",
  "product-photo routing adapter was not invoked",
  "UI, upload, report, scoring, parser, and fixture behavior were not exercised",
] as const;

const ANALYZER_FILE_ROUTING_LIMITATIONS = [
  "optional file-aware analyzer routing boundary",
  "synthetic file-like inputs only",
  "runtime routing disabled by default",
] as const;

function runtimeRoutingEnabledFor(input: AnalyzerRoutingGuardInput) {
  return input.runtimeRoutingEnabled === true && ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING === true;
}

function buildBaseLimitations(recognition: ProductPhotoRecognitionResult) {
  return [...recognition.limitations, ...ANALYZER_ROUTING_LIMITATIONS];
}

function normalizedText(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function fileTypeCategoryForFileLike(input: {
  fileTypeCategory?: FileTypeCategory;
  mimeType?: string;
  fileName?: string;
}): FileTypeCategory {
  if (input.fileTypeCategory) {
    return input.fileTypeCategory;
  }

  const mimeType = normalizedText(input.mimeType);
  const fileName = normalizedText(input.fileName);

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    return "pdf";
  }

  if (fileName.includes("screenshot") || fileName.includes("screen")) {
    return "screenshot";
  }

  if (mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(fileName)) {
    return "image";
  }

  return "unknown";
}

function recognitionInputForFileLike(input: AnalyzerFileRoutingGuardInput): AnalyzerRoutingGuardInput {
  const fileName = input.fileName ?? input.file?.name ?? input.name;
  const mimeType = input.mimeType ?? input.file?.type ?? input.type;
  const fileTypeCategory = fileTypeCategoryForFileLike({
    fileTypeCategory: input.fileTypeCategory,
    mimeType,
    fileName,
  });

  return {
    evidenceType: input.evidenceType,
    fileTypeCategory,
    mimeType,
    fileName,
    metadataSummary: input.metadataSummary,
    subjectType: input.subjectType,
    runtimeRoutingEnabled: input.runtimeRoutingEnabled,
  };
}

export function buildAnalyzerRoutingDecision(
  input: AnalyzerRoutingGuardInput = {},
): AnalyzerRoutingGuardDecision {
  const recognition = recognizeProductPhotoEvidence(input);
  const runtimeRoutingEnabled = runtimeRoutingEnabledFor(input);
  const productPhotoCandidate =
    recognition.devOnly &&
    recognition.productPhotoCompatible &&
    recognition.futureRoutingCandidate &&
    recognition.recognitionState === "product-photo-compatible";

  if (productPhotoCandidate) {
    return {
      boundary: "analyzer-routing-guard",
      devOnly: true,
      runtimeRoutingEnabled,
      route: "product-photo-guarded",
      receiptPathPreserved: true,
      productPhotoCandidate: true,
      status: "unsupported-live-path",
      recognition,
      localAnalysisResultShapeRequired: false,
      adapterInvoked: false,
      uiOrReportBehaviorExercised: false,
      reasons: [
        ...recognition.reasons,
        runtimeRoutingEnabled
          ? "product-photo runtime routing guard enabled, but live analysis remains unsupported in this wrapper"
          : "product-photo runtime routing disabled",
        "receipt analyzer path preserved",
      ],
      limitations: buildBaseLimitations(recognition),
    };
  }

  if (recognition.recognitionState === "other-evidence") {
    return {
      boundary: "analyzer-routing-guard",
      devOnly: true,
      runtimeRoutingEnabled,
      route: "receipt-analyzer-path",
      receiptPathPreserved: true,
      productPhotoCandidate: false,
      status: "receipt-path-preserved",
      recognition,
      localAnalysisResultShapeRequired: false,
      adapterInvoked: false,
      uiOrReportBehaviorExercised: false,
      reasons: [...recognition.reasons, "existing receipt analyzer path remains the live conceptual route"],
      limitations: buildBaseLimitations(recognition),
    };
  }

  return {
    boundary: "analyzer-routing-guard",
    devOnly: true,
    runtimeRoutingEnabled,
    route: "unknown-inconclusive",
    receiptPathPreserved: true,
    productPhotoCandidate: false,
    status: "unknown-inconclusive",
    recognition,
    localAnalysisResultShapeRequired: false,
    adapterInvoked: false,
    uiOrReportBehaviorExercised: false,
    reasons: [...recognition.reasons, "unknown evidence context remains inconclusive"],
    limitations: buildBaseLimitations(recognition),
  };
}

export const analyzeEvidenceWithRoutingGuard = buildAnalyzerRoutingDecision;

export function buildAnalyzerFileRoutingDecision(
  input: AnalyzerFileRoutingGuardInput = {},
): AnalyzerFileRoutingGuardDecision {
  const recognitionInput = recognitionInputForFileLike(input);
  const decision = buildAnalyzerRoutingDecision(recognitionInput);

  return {
    ...decision,
    boundary: "analyzer-file-routing-guard",
    fileAware: true,
    fileContext: {
      fileNamePresent: Boolean(recognitionInput.fileName),
      mimeTypePresent: Boolean(recognitionInput.mimeType),
      fileTypeCategory: recognitionInput.fileTypeCategory ?? "unknown",
    },
    reasons: [...decision.reasons, "file-aware routing decision used synthetic file-like context only"],
    limitations: [...decision.limitations, ...ANALYZER_FILE_ROUTING_LIMITATIONS],
  };
}

export const analyzeFileLikeEvidenceWithRoutingGuard = buildAnalyzerFileRoutingDecision;
