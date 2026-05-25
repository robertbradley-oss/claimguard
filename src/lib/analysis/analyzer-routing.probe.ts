import {
  buildAnalyzerFileRoutingDecision,
  buildAnalyzerRoutingDecision,
  ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING,
  type AnalyzerFileRoutingGuardInput,
  type AnalyzerRoutingGuardInput,
} from "@/lib/analysis/analyzer-routing";

const receiptLikeInput = {
  evidenceType: "receipt",
  fileTypeCategory: "image",
  mimeType: "image/png",
  fileName: "synthetic-receipt-photo.png",
} satisfies AnalyzerRoutingGuardInput;

const productPhotoRuntimeOffInput = {
  evidenceType: "product-photo",
  fileTypeCategory: "image",
  mimeType: "image/jpeg",
  fileName: "synthetic-product-photo.jpg",
  subjectType: "damage-close-up",
} satisfies AnalyzerRoutingGuardInput;

const productPhotoRuntimeTrueInput = {
  evidenceType: "product-photo",
  fileTypeCategory: "image",
  mimeType: "image/jpeg",
  fileName: "synthetic-product-photo.jpg",
  subjectType: "damage-close-up",
  runtimeRoutingEnabled: true,
} satisfies AnalyzerRoutingGuardInput;

const unknownInput = {} satisfies AnalyzerRoutingGuardInput;

const receiptLikeFileInput = {
  file: {
    name: "synthetic-receipt-photo.png",
    type: "image/png",
    size: 120_000,
  },
} satisfies AnalyzerFileRoutingGuardInput;

const productPhotoRuntimeOffFileInput = {
  file: {
    name: "synthetic-product-photo.jpg",
    type: "image/jpeg",
    size: 180_000,
  },
  subjectType: "damage-close-up",
} satisfies AnalyzerFileRoutingGuardInput;

const productPhotoRuntimeTrueFileInput = {
  file: {
    name: "synthetic-product-photo.jpg",
    type: "image/jpeg",
    size: 180_000,
  },
  subjectType: "damage-close-up",
  runtimeRoutingEnabled: true,
} satisfies AnalyzerFileRoutingGuardInput;

const unknownFileInput = {} satisfies AnalyzerFileRoutingGuardInput;

const receiptLikeDecision = buildAnalyzerRoutingDecision(receiptLikeInput);
const productPhotoRuntimeOffDecision = buildAnalyzerRoutingDecision(productPhotoRuntimeOffInput);
const productPhotoRuntimeTrueDecision = buildAnalyzerRoutingDecision(productPhotoRuntimeTrueInput);
const unknownDecision = buildAnalyzerRoutingDecision(unknownInput);
const receiptLikeFileDecision = buildAnalyzerFileRoutingDecision(receiptLikeFileInput);
const productPhotoRuntimeOffFileDecision = buildAnalyzerFileRoutingDecision(productPhotoRuntimeOffFileInput);
const productPhotoRuntimeTrueFileDecision = buildAnalyzerFileRoutingDecision(productPhotoRuntimeTrueFileInput);
const unknownFileDecision = buildAnalyzerFileRoutingDecision(unknownFileInput);

export const ANALYZER_ROUTING_GUARD_DEVELOPER_PROBE = {
  guard: {
    defaultProductPhotoRuntimeRoutingEnabled: ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING,
  },
  cases: {
    receiptLike: receiptLikeDecision,
    productPhotoRuntimeOff: productPhotoRuntimeOffDecision,
    productPhotoRuntimeTrue: productPhotoRuntimeTrueDecision,
    unknown: unknownDecision,
    receiptLikeFile: receiptLikeFileDecision,
    productPhotoRuntimeOffFile: productPhotoRuntimeOffFileDecision,
    productPhotoRuntimeTrueFile: productPhotoRuntimeTrueFileDecision,
    unknownFile: unknownFileDecision,
  },
  expectations: {
    receiptLike: {
      route: receiptLikeDecision.route,
      status: receiptLikeDecision.status,
      receiptPathPreserved: receiptLikeDecision.receiptPathPreserved,
      productPhotoCandidate: receiptLikeDecision.productPhotoCandidate,
      adapterInvoked: receiptLikeDecision.adapterInvoked,
      uiOrReportBehaviorExercised: receiptLikeDecision.uiOrReportBehaviorExercised,
    },
    productPhotoRuntimeOff: {
      route: productPhotoRuntimeOffDecision.route,
      status: productPhotoRuntimeOffDecision.status,
      runtimeRoutingEnabled: productPhotoRuntimeOffDecision.runtimeRoutingEnabled,
      productPhotoCandidate: productPhotoRuntimeOffDecision.productPhotoCandidate,
      localAnalysisResultShapeRequired: productPhotoRuntimeOffDecision.localAnalysisResultShapeRequired,
      adapterInvoked: productPhotoRuntimeOffDecision.adapterInvoked,
      uiOrReportBehaviorExercised: productPhotoRuntimeOffDecision.uiOrReportBehaviorExercised,
    },
    productPhotoRuntimeTrue: {
      route: productPhotoRuntimeTrueDecision.route,
      status: productPhotoRuntimeTrueDecision.status,
      runtimeRoutingEnabled: productPhotoRuntimeTrueDecision.runtimeRoutingEnabled,
      productPhotoCandidate: productPhotoRuntimeTrueDecision.productPhotoCandidate,
      localAnalysisResultShapeRequired: productPhotoRuntimeTrueDecision.localAnalysisResultShapeRequired,
      adapterInvoked: productPhotoRuntimeTrueDecision.adapterInvoked,
      uiOrReportBehaviorExercised: productPhotoRuntimeTrueDecision.uiOrReportBehaviorExercised,
    },
    unknown: {
      route: unknownDecision.route,
      status: unknownDecision.status,
      productPhotoCandidate: unknownDecision.productPhotoCandidate,
      recognitionState: unknownDecision.recognition.recognitionState,
      adapterInvoked: unknownDecision.adapterInvoked,
      uiOrReportBehaviorExercised: unknownDecision.uiOrReportBehaviorExercised,
    },
    receiptLikeFile: {
      boundary: receiptLikeFileDecision.boundary,
      route: receiptLikeFileDecision.route,
      status: receiptLikeFileDecision.status,
      receiptPathPreserved: receiptLikeFileDecision.receiptPathPreserved,
      productPhotoCandidate: receiptLikeFileDecision.productPhotoCandidate,
      fileTypeCategory: receiptLikeFileDecision.fileContext.fileTypeCategory,
      adapterInvoked: receiptLikeFileDecision.adapterInvoked,
      uiOrReportBehaviorExercised: receiptLikeFileDecision.uiOrReportBehaviorExercised,
    },
    productPhotoRuntimeOffFile: {
      boundary: productPhotoRuntimeOffFileDecision.boundary,
      route: productPhotoRuntimeOffFileDecision.route,
      status: productPhotoRuntimeOffFileDecision.status,
      runtimeRoutingEnabled: productPhotoRuntimeOffFileDecision.runtimeRoutingEnabled,
      productPhotoCandidate: productPhotoRuntimeOffFileDecision.productPhotoCandidate,
      localAnalysisResultShapeRequired: productPhotoRuntimeOffFileDecision.localAnalysisResultShapeRequired,
      adapterInvoked: productPhotoRuntimeOffFileDecision.adapterInvoked,
      uiOrReportBehaviorExercised: productPhotoRuntimeOffFileDecision.uiOrReportBehaviorExercised,
    },
    productPhotoRuntimeTrueFile: {
      boundary: productPhotoRuntimeTrueFileDecision.boundary,
      route: productPhotoRuntimeTrueFileDecision.route,
      status: productPhotoRuntimeTrueFileDecision.status,
      runtimeRoutingEnabled: productPhotoRuntimeTrueFileDecision.runtimeRoutingEnabled,
      productPhotoCandidate: productPhotoRuntimeTrueFileDecision.productPhotoCandidate,
      localAnalysisResultShapeRequired: productPhotoRuntimeTrueFileDecision.localAnalysisResultShapeRequired,
      adapterInvoked: productPhotoRuntimeTrueFileDecision.adapterInvoked,
      uiOrReportBehaviorExercised: productPhotoRuntimeTrueFileDecision.uiOrReportBehaviorExercised,
    },
    unknownFile: {
      boundary: unknownFileDecision.boundary,
      route: unknownFileDecision.route,
      status: unknownFileDecision.status,
      productPhotoCandidate: unknownFileDecision.productPhotoCandidate,
      recognitionState: unknownFileDecision.recognition.recognitionState,
      adapterInvoked: unknownFileDecision.adapterInvoked,
      uiOrReportBehaviorExercised: unknownFileDecision.uiOrReportBehaviorExercised,
    },
  },
} as const;
