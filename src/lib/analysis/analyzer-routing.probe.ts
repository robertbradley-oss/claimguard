import {
  buildAnalyzerFileRoutingDecision,
  buildAnalyzerRoutingDecision,
  ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING,
  routeAnalyzerEvidenceInput,
  type AnalyzerFileRoutingGuardInput,
  type AnalyzerRoutingGuardInput,
  type PublicAnalyzerRoutingInput,
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

const damagePhotoAliasInput = {
  evidenceType: "damage-photo",
  fileTypeCategory: "image",
  mimeType: "image/jpeg",
  fileName: "synthetic-damage-photo.jpg",
} satisfies AnalyzerRoutingGuardInput;

const unknownInput = {} satisfies AnalyzerRoutingGuardInput;

const pdfLikeInput = {
  file: {
    name: "synthetic-order-details.pdf",
    type: "application/pdf",
    size: 240_000,
  },
} satisfies PublicAnalyzerRoutingInput;

const screenshotLikeInput = {
  fileName: "synthetic-order-screenshot.png",
  mimeType: "image/png",
} satisfies PublicAnalyzerRoutingInput;

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
const damagePhotoAliasDecision = buildAnalyzerRoutingDecision(damagePhotoAliasInput);
const unknownDecision = buildAnalyzerRoutingDecision(unknownInput);
const receiptLikeFileDecision = buildAnalyzerFileRoutingDecision(receiptLikeFileInput);
const productPhotoRuntimeOffFileDecision = buildAnalyzerFileRoutingDecision(productPhotoRuntimeOffFileInput);
const productPhotoRuntimeTrueFileDecision = buildAnalyzerFileRoutingDecision(productPhotoRuntimeTrueFileInput);
const unknownFileDecision = buildAnalyzerFileRoutingDecision(unknownFileInput);
const publicReceiptLikeDecision = routeAnalyzerEvidenceInput(receiptLikeInput);
const publicReceiptLikeFileDecision = routeAnalyzerEvidenceInput(receiptLikeFileInput);
const publicProductPhotoRuntimeOffDecision = routeAnalyzerEvidenceInput(productPhotoRuntimeOffInput);
const publicProductPhotoRuntimeTrueDecision = routeAnalyzerEvidenceInput(productPhotoRuntimeTrueInput);
const publicDamagePhotoAliasDecision = routeAnalyzerEvidenceInput(damagePhotoAliasInput);
const publicUnknownDecision = routeAnalyzerEvidenceInput(unknownInput);
const publicPdfLikeDecision = routeAnalyzerEvidenceInput(pdfLikeInput);
const publicScreenshotLikeDecision = routeAnalyzerEvidenceInput(screenshotLikeInput);

function allChecksPass(checks: Record<string, boolean>) {
  return Object.values(checks).every(Boolean);
}

function lacksProductPhotoResultDetails(decision: object) {
  return (
    !("productPhotoDetails" in decision) &&
    !("productPhotoAnalysisDetails" in decision) &&
    !("productPhoto" in decision) &&
    !("analysisResult" in decision)
  );
}

function lacksSharedResultBoundaryPayload(decision: object) {
  return (
    !("moduleDetails" in decision) &&
    !("evidenceReliabilityScore" in decision) &&
    !("verificationStatus" in decision) &&
    !("privacySafeMetadataSummary" in decision)
  );
}

function hasManualReviewOnlySafetyWording(decision: { limitations: readonly string[] }) {
  return decision.limitations.some((limitation) => limitation.includes("manual-review support only"));
}

function hasNoUnsafeSafetyWording(decision: { reasons: readonly string[]; limitations: readonly string[] }) {
  const text = [...decision.reasons, ...decision.limitations].join(" ").toLowerCase();
  return ![
    "confirmed fraud",
    "fraud confirmed",
    "customer lied",
    "automatic denial",
    "deny automatically",
    "proves wrongdoing",
  ].some((unsafePhrase) => text.includes(unsafePhrase));
}

const publicWrapperDecisions = [
  publicReceiptLikeDecision,
  publicReceiptLikeFileDecision,
  publicProductPhotoRuntimeOffDecision,
  publicProductPhotoRuntimeTrueDecision,
  publicDamagePhotoAliasDecision,
  publicUnknownDecision,
  publicPdfLikeDecision,
  publicScreenshotLikeDecision,
] as const;

const receiptPathPreservationChecks = {
  receiptLikeObjectUsesReceiptPath: receiptLikeDecision.route === "receipt-analyzer-path",
  receiptLikeObjectStatusPreserved: receiptLikeDecision.status === "receipt-path-preserved",
  receiptLikeObjectPreservesReceiptPath: receiptLikeDecision.receiptPathPreserved,
  receiptLikeObjectIsNotProductPhotoCandidate: !receiptLikeDecision.productPhotoCandidate,
  receiptLikeObjectRecognizedAsReceipt: receiptLikeDecision.recognition.evidenceType === "receipt",
  receiptLikeFileUsesReceiptPath: receiptLikeFileDecision.route === "receipt-analyzer-path",
  receiptLikeFileStatusPreserved: receiptLikeFileDecision.status === "receipt-path-preserved",
  receiptLikeFilePreservesReceiptPath: receiptLikeFileDecision.receiptPathPreserved,
  receiptLikeFileIsNotProductPhotoCandidate: !receiptLikeFileDecision.productPhotoCandidate,
  receiptLikeFileRecognizedAsReceipt: receiptLikeFileDecision.recognition.evidenceType === "receipt",
} as const;

const productPhotoGuardChecks = {
  runtimeRoutingDisabledByDefault: ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING === false,
  productPhotoObjectUsesGuardedRoute: productPhotoRuntimeOffDecision.route === "product-photo-guarded",
  productPhotoObjectStatusUnsupported: productPhotoRuntimeOffDecision.status === "unsupported-live-path",
  productPhotoObjectCandidateGuarded: productPhotoRuntimeOffDecision.productPhotoCandidate,
  productPhotoObjectDoesNotNeedLocalAnalysisResult:
    productPhotoRuntimeOffDecision.localAnalysisResultShapeRequired === false,
  productPhotoObjectDoesNotInvokeAdapter: productPhotoRuntimeOffDecision.adapterInvoked === false,
  productPhotoRuntimeRequestStillDisabled: productPhotoRuntimeTrueDecision.runtimeRoutingEnabled === false,
  productPhotoRuntimeRequestStillUnsupported: productPhotoRuntimeTrueDecision.status === "unsupported-live-path",
  productPhotoFileUsesGuardedRoute: productPhotoRuntimeOffFileDecision.route === "product-photo-guarded",
  productPhotoFileStatusUnsupported: productPhotoRuntimeOffFileDecision.status === "unsupported-live-path",
  productPhotoFileCandidateGuarded: productPhotoRuntimeOffFileDecision.productPhotoCandidate,
  productPhotoFileDoesNotNeedLocalAnalysisResult:
    productPhotoRuntimeOffFileDecision.localAnalysisResultShapeRequired === false,
  productPhotoFileDoesNotInvokeAdapter: productPhotoRuntimeOffFileDecision.adapterInvoked === false,
  productPhotoFileRuntimeRequestStillDisabled: productPhotoRuntimeTrueFileDecision.runtimeRoutingEnabled === false,
  productPhotoFileRuntimeRequestStillUnsupported: productPhotoRuntimeTrueFileDecision.status === "unsupported-live-path",
  damagePhotoAliasUsesGuardedRoute: damagePhotoAliasDecision.route === "product-photo-guarded",
  damagePhotoAliasMapsToCanonicalProductPhoto: damagePhotoAliasDecision.recognition.evidenceType === "product-photo",
  damagePhotoAliasCompatibilityAliasPreserved:
    damagePhotoAliasDecision.recognition.compatibilityAlias?.alias === "damage-photo",
  damagePhotoAliasSubjectMapsToDamageCloseUp:
    damagePhotoAliasDecision.recognition.compatibilityAlias?.subjectType === "damage-close-up",
  damagePhotoAliasDoesNotInvokeAdapter: damagePhotoAliasDecision.adapterInvoked === false,
  damagePhotoAliasDoesNotNeedLocalAnalysisResult:
    damagePhotoAliasDecision.localAnalysisResultShapeRequired === false,
} as const;

const unknownPathChecks = {
  unknownObjectRouteInconclusive: unknownDecision.route === "unknown-inconclusive",
  unknownObjectStatusInconclusive: unknownDecision.status === "unknown-inconclusive",
  unknownObjectNotProductPhotoCandidate: !unknownDecision.productPhotoCandidate,
  unknownFileRouteInconclusive: unknownFileDecision.route === "unknown-inconclusive",
  unknownFileStatusInconclusive: unknownFileDecision.status === "unknown-inconclusive",
  unknownFileNotProductPhotoCandidate: !unknownFileDecision.productPhotoCandidate,
} as const;

const livePathIsolationChecks = {
  receiptObjectDoesNotExerciseUiOrReport: receiptLikeDecision.uiOrReportBehaviorExercised === false,
  productPhotoObjectDoesNotExerciseUiOrReport: productPhotoRuntimeOffDecision.uiOrReportBehaviorExercised === false,
  damagePhotoAliasDoesNotExerciseUiOrReport: damagePhotoAliasDecision.uiOrReportBehaviorExercised === false,
  unknownObjectDoesNotExerciseUiOrReport: unknownDecision.uiOrReportBehaviorExercised === false,
  receiptFileDoesNotExerciseUiOrReport: receiptLikeFileDecision.uiOrReportBehaviorExercised === false,
  productPhotoFileDoesNotExerciseUiOrReport: productPhotoRuntimeOffFileDecision.uiOrReportBehaviorExercised === false,
  unknownFileDoesNotExerciseUiOrReport: unknownFileDecision.uiOrReportBehaviorExercised === false,
  receiptObjectDoesNotInvokeAdapter: receiptLikeDecision.adapterInvoked === false,
  productPhotoObjectDoesNotInvokeAdapter: productPhotoRuntimeOffDecision.adapterInvoked === false,
  damagePhotoAliasDoesNotInvokeAdapter: damagePhotoAliasDecision.adapterInvoked === false,
  unknownObjectDoesNotInvokeAdapter: unknownDecision.adapterInvoked === false,
  receiptFileDoesNotInvokeAdapter: receiptLikeFileDecision.adapterInvoked === false,
  productPhotoFileDoesNotInvokeAdapter: productPhotoRuntimeOffFileDecision.adapterInvoked === false,
  unknownFileDoesNotInvokeAdapter: unknownFileDecision.adapterInvoked === false,
  publicWrapperDoesNotInvokeAnalyzer: publicWrapperDecisions.every((decision) => decision.analyzerInvoked === false),
  publicWrapperDoesNotInvokeAdapter: publicWrapperDecisions.every((decision) => decision.adapterInvoked === false),
  publicWrapperDoesNotExerciseUiOrReport: publicWrapperDecisions.every(
    (decision) => decision.uiOrReportBehaviorExercised === false,
  ),
} as const;

const publicWrapperChecks = {
  wrapperDecisionsAreDecisionOnly: publicWrapperDecisions.every((decision) => decision.decisionOnly),
  wrapperKeepsProductPhotoRuntimeNonLive: publicWrapperDecisions.every(
    (decision) => decision.productPhotoRuntimeLive === false,
  ),
  wrapperNeverInvokesAnalyzer: publicWrapperDecisions.every((decision) => decision.analyzerInvoked === false),
  wrapperNeverInvokesAdapter: publicWrapperDecisions.every((decision) => decision.adapterInvoked === false),
  wrapperNeverExercisesUiOrReport: publicWrapperDecisions.every(
    (decision) => decision.uiOrReportBehaviorExercised === false,
  ),
  receiptLikeObjectRoutesToExistingReceiptPath:
    publicReceiptLikeDecision.route === "existing-receipt-path-candidate",
  receiptLikeObjectCandidateReceiptLike: publicReceiptLikeDecision.evidenceCandidate === "receipt-like",
  receiptLikeObjectExistingReceiptPathCandidate: publicReceiptLikeDecision.existingReceiptPathCandidate,
  receiptLikeObjectRecognizedAsReceipt: publicReceiptLikeDecision.recognizedEvidenceType === "receipt",
  receiptLikeObjectAnalyzerNotInvoked: publicReceiptLikeDecision.analyzerInvoked === false,
  receiptLikeFileRoutesToExistingReceiptPath:
    publicReceiptLikeFileDecision.route === "existing-receipt-path-candidate",
  receiptLikeFileCandidateReceiptLike: publicReceiptLikeFileDecision.evidenceCandidate === "receipt-like",
  receiptLikeFileExistingReceiptPathCandidate: publicReceiptLikeFileDecision.existingReceiptPathCandidate,
  receiptLikeFileRecognizedAsReceipt: publicReceiptLikeFileDecision.recognizedEvidenceType === "receipt",
  receiptLikeFileAnalyzerNotInvoked: publicReceiptLikeFileDecision.analyzerInvoked === false,
  productPhotoCandidateGuarded:
    publicProductPhotoRuntimeOffDecision.route === "product-photo-guarded-non-live",
  productPhotoCandidateNonLive: publicProductPhotoRuntimeOffDecision.productPhotoRuntimeLive === false,
  productPhotoCandidateDoesNotInvokeAnalyzer: publicProductPhotoRuntimeOffDecision.analyzerInvoked === false,
  productPhotoCandidateDoesNotInvokeAdapter: publicProductPhotoRuntimeOffDecision.adapterInvoked === false,
  productPhotoRuntimeRequestStillGuarded:
    publicProductPhotoRuntimeTrueDecision.route === "product-photo-guarded-non-live",
  productPhotoRuntimeRequestStillDisabled:
    publicProductPhotoRuntimeTrueDecision.runtimeRoutingEnabled === false,
  productPhotoRuntimeRequestAnalyzerNotInvoked:
    publicProductPhotoRuntimeTrueDecision.analyzerInvoked === false,
  productPhotoRuntimeRequestAdapterNotInvoked:
    publicProductPhotoRuntimeTrueDecision.adapterInvoked === false,
  damagePhotoAliasRouteGuarded:
    publicDamagePhotoAliasDecision.route === "product-photo-guarded-non-live",
  damagePhotoAliasCandidateProductPhoto:
    publicDamagePhotoAliasDecision.evidenceCandidate === "product-photo-candidate",
  damagePhotoAliasRecognizedAsCanonicalProductPhoto:
    publicDamagePhotoAliasDecision.recognizedEvidenceType === "product-photo",
  damagePhotoAliasRuntimeNonLive: publicDamagePhotoAliasDecision.productPhotoRuntimeLive === false,
  damagePhotoAliasAnalyzerNotInvoked: publicDamagePhotoAliasDecision.analyzerInvoked === false,
  damagePhotoAliasAdapterNotInvoked: publicDamagePhotoAliasDecision.adapterInvoked === false,
  productPhotoWrapperDoesNotReturnDetails:
    lacksProductPhotoResultDetails(publicProductPhotoRuntimeOffDecision) &&
    lacksProductPhotoResultDetails(publicProductPhotoRuntimeTrueDecision) &&
    lacksProductPhotoResultDetails(publicDamagePhotoAliasDecision),
  publicWrapperDoesNotExposeSharedResultBoundary:
    publicWrapperDecisions.every(lacksSharedResultBoundaryPayload),
  unknownInputRouteInconclusive: publicUnknownDecision.route === "unknown-inconclusive",
  unknownInputCandidateInconclusive: publicUnknownDecision.evidenceCandidate === "unknown-inconclusive",
  pdfLikeRoutesToExistingReceiptPath: publicPdfLikeDecision.route === "existing-receipt-path-candidate",
  pdfLikeCandidateDetected: publicPdfLikeDecision.evidenceCandidate === "pdf-like",
  pdfLikeRecognizedAsPdfReceipt: publicPdfLikeDecision.recognizedEvidenceType === "pdf-receipt",
  pdfLikeClassificationOnly: publicPdfLikeDecision.decisionOnly && publicPdfLikeDecision.analyzerInvoked === false,
  pdfLikeAnalyzerNotInvoked: publicPdfLikeDecision.analyzerInvoked === false,
  pdfLikeAdapterNotInvoked: publicPdfLikeDecision.adapterInvoked === false,
  pdfLikeUiOrReportNotExercised: publicPdfLikeDecision.uiOrReportBehaviorExercised === false,
  screenshotLikeRoutesToExistingReceiptPath:
    publicScreenshotLikeDecision.route === "existing-receipt-path-candidate",
  screenshotLikeCandidateDetected: publicScreenshotLikeDecision.evidenceCandidate === "screenshot-like",
  screenshotLikeRecognizedAsOrderScreenshot:
    publicScreenshotLikeDecision.recognizedEvidenceType === "order-screenshot",
  screenshotLikeClassificationOnly:
    publicScreenshotLikeDecision.decisionOnly && publicScreenshotLikeDecision.analyzerInvoked === false,
  screenshotLikeAnalyzerNotInvoked: publicScreenshotLikeDecision.analyzerInvoked === false,
  screenshotLikeAdapterNotInvoked: publicScreenshotLikeDecision.adapterInvoked === false,
  screenshotLikeUiOrReportNotExercised: publicScreenshotLikeDecision.uiOrReportBehaviorExercised === false,
  wrapperDoesNotNeedLocalAnalysisResult:
    publicProductPhotoRuntimeOffDecision.localAnalysisResultShapeRequired === false,
  wrapperDoesNotInvokeAdapter: publicProductPhotoRuntimeOffDecision.adapterInvoked === false,
  wrapperDoesNotExerciseUiOrReport: publicProductPhotoRuntimeOffDecision.uiOrReportBehaviorExercised === false,
} as const;

const resultShapeIsolationChecks = {
  productPhotoGuardDoesNotRequireLocalAnalysisResult:
    productPhotoRuntimeOffDecision.localAnalysisResultShapeRequired === false,
  productPhotoRuntimeRequestDoesNotRequireLocalAnalysisResult:
    productPhotoRuntimeTrueDecision.localAnalysisResultShapeRequired === false,
  damagePhotoAliasDoesNotRequireLocalAnalysisResult:
    damagePhotoAliasDecision.localAnalysisResultShapeRequired === false,
  publicProductPhotoDoesNotRequireLocalAnalysisResult:
    publicProductPhotoRuntimeOffDecision.localAnalysisResultShapeRequired === false,
  publicProductPhotoRuntimeRequestDoesNotRequireLocalAnalysisResult:
    publicProductPhotoRuntimeTrueDecision.localAnalysisResultShapeRequired === false,
  publicDamagePhotoAliasDoesNotRequireLocalAnalysisResult:
    publicDamagePhotoAliasDecision.localAnalysisResultShapeRequired === false,
  productPhotoGuardDoesNotExposeResultDetails: lacksProductPhotoResultDetails(productPhotoRuntimeOffDecision),
  productPhotoRuntimeRequestDoesNotExposeResultDetails:
    lacksProductPhotoResultDetails(productPhotoRuntimeTrueDecision),
  damagePhotoAliasDoesNotExposeResultDetails: lacksProductPhotoResultDetails(damagePhotoAliasDecision),
  publicProductPhotoDoesNotExposeResultDetails:
    lacksProductPhotoResultDetails(publicProductPhotoRuntimeOffDecision),
  publicProductPhotoRuntimeRequestDoesNotExposeResultDetails:
    lacksProductPhotoResultDetails(publicProductPhotoRuntimeTrueDecision),
  publicDamagePhotoAliasDoesNotExposeResultDetails:
    lacksProductPhotoResultDetails(publicDamagePhotoAliasDecision),
} as const;

const safetyWordingChecks = {
  productPhotoGuardManualReviewOnly: hasManualReviewOnlySafetyWording(productPhotoRuntimeOffDecision),
  productPhotoRuntimeRequestManualReviewOnly: hasManualReviewOnlySafetyWording(productPhotoRuntimeTrueDecision),
  damagePhotoAliasManualReviewOnly: hasManualReviewOnlySafetyWording(damagePhotoAliasDecision),
  publicProductPhotoManualReviewOnly: hasManualReviewOnlySafetyWording(publicProductPhotoRuntimeOffDecision),
  publicProductPhotoRuntimeRequestManualReviewOnly:
    hasManualReviewOnlySafetyWording(publicProductPhotoRuntimeTrueDecision),
  publicDamagePhotoAliasManualReviewOnly: hasManualReviewOnlySafetyWording(publicDamagePhotoAliasDecision),
  allPublicWrapperDecisionsAvoidUnsafeWording: publicWrapperDecisions.every(hasNoUnsafeSafetyWording),
  productPhotoGuardAvoidsUnsafeWording: hasNoUnsafeSafetyWording(productPhotoRuntimeOffDecision),
  productPhotoRuntimeRequestAvoidsUnsafeWording: hasNoUnsafeSafetyWording(productPhotoRuntimeTrueDecision),
  damagePhotoAliasAvoidsUnsafeWording: hasNoUnsafeSafetyWording(damagePhotoAliasDecision),
} as const;

export const ANALYZER_ROUTING_GUARD_DEVELOPER_PROBE = {
  guard: {
    defaultProductPhotoRuntimeRoutingEnabled: ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING,
  },
  cases: {
    receiptLike: receiptLikeDecision,
    productPhotoRuntimeOff: productPhotoRuntimeOffDecision,
    productPhotoRuntimeTrue: productPhotoRuntimeTrueDecision,
    damagePhotoAlias: damagePhotoAliasDecision,
    unknown: unknownDecision,
    receiptLikeFile: receiptLikeFileDecision,
    productPhotoRuntimeOffFile: productPhotoRuntimeOffFileDecision,
    productPhotoRuntimeTrueFile: productPhotoRuntimeTrueFileDecision,
    unknownFile: unknownFileDecision,
    publicWrapper: {
      receiptLike: publicReceiptLikeDecision,
      receiptLikeFile: publicReceiptLikeFileDecision,
      productPhotoRuntimeOff: publicProductPhotoRuntimeOffDecision,
      productPhotoRuntimeTrue: publicProductPhotoRuntimeTrueDecision,
      damagePhotoAlias: publicDamagePhotoAliasDecision,
      unknown: publicUnknownDecision,
      pdfLike: publicPdfLikeDecision,
      screenshotLike: publicScreenshotLikeDecision,
    },
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
    damagePhotoAlias: {
      route: damagePhotoAliasDecision.route,
      status: damagePhotoAliasDecision.status,
      runtimeRoutingEnabled: damagePhotoAliasDecision.runtimeRoutingEnabled,
      productPhotoCandidate: damagePhotoAliasDecision.productPhotoCandidate,
      recognizedEvidenceType: damagePhotoAliasDecision.recognition.evidenceType,
      compatibilityAlias: damagePhotoAliasDecision.recognition.compatibilityAlias,
      subjectType: damagePhotoAliasDecision.recognition.subjectType,
      localAnalysisResultShapeRequired: damagePhotoAliasDecision.localAnalysisResultShapeRequired,
      adapterInvoked: damagePhotoAliasDecision.adapterInvoked,
      uiOrReportBehaviorExercised: damagePhotoAliasDecision.uiOrReportBehaviorExercised,
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
    publicWrapper: {
      receiptLike: {
        boundary: publicReceiptLikeDecision.boundary,
        route: publicReceiptLikeDecision.route,
        evidenceCandidate: publicReceiptLikeDecision.evidenceCandidate,
        analyzerInvoked: publicReceiptLikeDecision.analyzerInvoked,
      },
      receiptLikeFile: {
        boundary: publicReceiptLikeFileDecision.boundary,
        route: publicReceiptLikeFileDecision.route,
        evidenceCandidate: publicReceiptLikeFileDecision.evidenceCandidate,
        analyzerInvoked: publicReceiptLikeFileDecision.analyzerInvoked,
      },
      productPhotoRuntimeOff: {
        boundary: publicProductPhotoRuntimeOffDecision.boundary,
        route: publicProductPhotoRuntimeOffDecision.route,
        evidenceCandidate: publicProductPhotoRuntimeOffDecision.evidenceCandidate,
        runtimeRoutingEnabled: publicProductPhotoRuntimeOffDecision.runtimeRoutingEnabled,
        productPhotoRuntimeLive: publicProductPhotoRuntimeOffDecision.productPhotoRuntimeLive,
        analyzerInvoked: publicProductPhotoRuntimeOffDecision.analyzerInvoked,
        adapterInvoked: publicProductPhotoRuntimeOffDecision.adapterInvoked,
      },
      productPhotoRuntimeTrue: {
        boundary: publicProductPhotoRuntimeTrueDecision.boundary,
        route: publicProductPhotoRuntimeTrueDecision.route,
        evidenceCandidate: publicProductPhotoRuntimeTrueDecision.evidenceCandidate,
        runtimeRoutingEnabled: publicProductPhotoRuntimeTrueDecision.runtimeRoutingEnabled,
        productPhotoRuntimeLive: publicProductPhotoRuntimeTrueDecision.productPhotoRuntimeLive,
        analyzerInvoked: publicProductPhotoRuntimeTrueDecision.analyzerInvoked,
        adapterInvoked: publicProductPhotoRuntimeTrueDecision.adapterInvoked,
      },
      damagePhotoAlias: {
        boundary: publicDamagePhotoAliasDecision.boundary,
        route: publicDamagePhotoAliasDecision.route,
        evidenceCandidate: publicDamagePhotoAliasDecision.evidenceCandidate,
        recognizedEvidenceType: publicDamagePhotoAliasDecision.recognizedEvidenceType,
        runtimeRoutingEnabled: publicDamagePhotoAliasDecision.runtimeRoutingEnabled,
        productPhotoRuntimeLive: publicDamagePhotoAliasDecision.productPhotoRuntimeLive,
        analyzerInvoked: publicDamagePhotoAliasDecision.analyzerInvoked,
        adapterInvoked: publicDamagePhotoAliasDecision.adapterInvoked,
      },
      unknown: {
        boundary: publicUnknownDecision.boundary,
        route: publicUnknownDecision.route,
        evidenceCandidate: publicUnknownDecision.evidenceCandidate,
        recognitionState: publicUnknownDecision.recognitionState,
        analyzerInvoked: publicUnknownDecision.analyzerInvoked,
      },
      pdfLike: {
        boundary: publicPdfLikeDecision.boundary,
        route: publicPdfLikeDecision.route,
        evidenceCandidate: publicPdfLikeDecision.evidenceCandidate,
        recognizedEvidenceType: publicPdfLikeDecision.recognizedEvidenceType,
        analyzerInvoked: publicPdfLikeDecision.analyzerInvoked,
      },
      screenshotLike: {
        boundary: publicScreenshotLikeDecision.boundary,
        route: publicScreenshotLikeDecision.route,
        evidenceCandidate: publicScreenshotLikeDecision.evidenceCandidate,
        recognizedEvidenceType: publicScreenshotLikeDecision.recognizedEvidenceType,
        analyzerInvoked: publicScreenshotLikeDecision.analyzerInvoked,
      },
    },
  },
  preservationStatus: {
    receiptPathPreserved: allChecksPass(receiptPathPreservationChecks),
    productPhotoCandidatesGuarded: allChecksPass(productPhotoGuardChecks),
    unknownInputsRemainInconclusive: allChecksPass(unknownPathChecks),
    livePathBehaviorNotExercised: allChecksPass(livePathIsolationChecks),
    publicWrapperDecisionOnly: allChecksPass(publicWrapperChecks),
    productPhotoResultShapeIsolated: allChecksPass(resultShapeIsolationChecks),
    safetyWordingClean: allChecksPass(safetyWordingChecks),
    localAnalysisResultShapeRequiredForProductPhoto: false,
    adapterInvokedForProductPhoto: false,
    analyzerInvokedForPublicWrapper: false,
    productPhotoRuntimeLive: false,
    checks: {
      receiptPathPreservation: receiptPathPreservationChecks,
      productPhotoGuard: productPhotoGuardChecks,
      unknownPath: unknownPathChecks,
      livePathIsolation: livePathIsolationChecks,
      publicWrapper: publicWrapperChecks,
      resultShapeIsolation: resultShapeIsolationChecks,
      safetyWording: safetyWordingChecks,
    },
  },
} as const;
