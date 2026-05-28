import {
  buildAnalyzerFileRoutingDecision,
  buildGuardedInternalAnalyzerRouteDecision,
  buildAnalyzerRoutingDecision,
  ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING,
  routeAnalyzerEvidenceInput,
  type AnalyzerFileRoutingGuardInput,
  type AnalyzerRoutingGuardInput,
  type PublicAnalyzerRoutingDecision,
  type PublicAnalyzerRoutingInput,
} from "@/lib/analysis/analyzer-routing";

type HasAnyKey<T, TKey extends PropertyKey> = Extract<keyof T, TKey> extends never ? false : true;
type HasNoKey<T, TKey extends PropertyKey> = HasAnyKey<T, TKey> extends false ? true : false;

type PublicWrapperForbiddenSharedResultPayloadKeys =
  | "module"
  | "evidenceType"
  | "evidenceLabel"
  | "sourceKind"
  | "score"
  | "scoreMeaning"
  | "localSignalLevel"
  | "reviewPriority"
  | "confidenceLevel"
  | "reviewLabel"
  | "verificationStatus"
  | "externalVerification"
  | "signals"
  | "findingGroups"
  | "evidenceSummary"
  | "recommendedSupportAction"
  | "customerSafeWording"
  | "privacySafeMetadataSummary"
  | "moduleDetails";

const publicWrapperDoesNotExposeSharedResultPayloadFields =
  true satisfies HasNoKey<PublicAnalyzerRoutingDecision, PublicWrapperForbiddenSharedResultPayloadKeys>;

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

const productPhotoSyntheticMetadataInput = {
  fileName: "synthetic-product-context-photo.jpg",
  mimeType: "image/jpeg",
  subjectType: "damage-close-up",
  metadataSummary: {
    fileTypeCategory: "image",
    dimensionsPresent: true,
    dimensionsBucket: "large",
  },
  runtimeRoutingEnabled: true,
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
const internalReceiptLikeDecision = buildGuardedInternalAnalyzerRouteDecision(receiptLikeFileInput);
const internalProductPhotoRuntimeOffDecision =
  buildGuardedInternalAnalyzerRouteDecision(productPhotoRuntimeOffFileInput);
const internalProductPhotoRuntimeTrueDecision =
  buildGuardedInternalAnalyzerRouteDecision(productPhotoRuntimeTrueFileInput);
const internalProductPhotoSyntheticMetadataDecision =
  buildGuardedInternalAnalyzerRouteDecision(productPhotoSyntheticMetadataInput);
const internalUnknownDecision = buildGuardedInternalAnalyzerRouteDecision(unknownFileInput);
const publicReceiptLikeDecision = routeAnalyzerEvidenceInput(receiptLikeInput);
const publicReceiptLikeFileDecision = routeAnalyzerEvidenceInput(receiptLikeFileInput);
const publicProductPhotoRuntimeOffDecision = routeAnalyzerEvidenceInput(productPhotoRuntimeOffInput);
const publicProductPhotoRuntimeTrueDecision = routeAnalyzerEvidenceInput(productPhotoRuntimeTrueInput);
const publicDamagePhotoAliasDecision = routeAnalyzerEvidenceInput(damagePhotoAliasInput);
const publicUnknownDecision = routeAnalyzerEvidenceInput(unknownInput);
const publicPdfLikeDecision = routeAnalyzerEvidenceInput(pdfLikeInput);
const publicScreenshotLikeDecision = routeAnalyzerEvidenceInput(screenshotLikeInput);
const publicProductPhotoSyntheticMetadataDecision =
  routeAnalyzerEvidenceInput(productPhotoSyntheticMetadataInput);

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
    !("module" in decision) &&
    !("evidenceType" in decision) &&
    !("evidenceLabel" in decision) &&
    !("sourceKind" in decision) &&
    !("score" in decision) &&
    !("scoreMeaning" in decision) &&
    !("localSignalLevel" in decision) &&
    !("reviewPriority" in decision) &&
    !("confidenceLevel" in decision) &&
    !("reviewLabel" in decision) &&
    !("externalVerification" in decision) &&
    !("signals" in decision) &&
    !("findingGroups" in decision) &&
    !("evidenceSummary" in decision) &&
    !("recommendedSupportAction" in decision) &&
    !("customerSafeWording" in decision) &&
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
    ["confirmed", "fraud"].join(" "),
    ["fraud", "confirmed"].join(" "),
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
  publicProductPhotoSyntheticMetadataDecision,
] as const;

const guardedInternalRouteDecisions = [
  internalReceiptLikeDecision,
  internalProductPhotoRuntimeOffDecision,
  internalProductPhotoRuntimeTrueDecision,
  internalProductPhotoSyntheticMetadataDecision,
  internalUnknownDecision,
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

const guardedInternalRouteChecks = {
  internalDecisionsAreDecisionOnly: guardedInternalRouteDecisions.every((decision) => decision.decisionOnly),
  internalReceiptRoutePreservesReceiptPath:
    internalReceiptLikeDecision.route === "receipt-analyzer-path" &&
    internalReceiptLikeDecision.status === "receipt-path-preserved",
  internalReceiptRouteDoesNotInvokeAnalyzer: internalReceiptLikeDecision.analyzerInvoked === false,
  internalProductPhotoRouteGuarded:
    internalProductPhotoRuntimeOffDecision.route === "product-photo-guarded" &&
    internalProductPhotoRuntimeOffDecision.status === "unsupported-live-path",
  internalProductPhotoRuntimeRequestStillNonLive:
    internalProductPhotoRuntimeTrueDecision.runtimeRoutingEnabled === false &&
    internalProductPhotoRuntimeTrueDecision.productPhotoRuntimeLive === false,
  internalSyntheticMetadataProductPhotoStillGuarded:
    internalProductPhotoSyntheticMetadataDecision.route === "product-photo-guarded" &&
    internalProductPhotoSyntheticMetadataDecision.status === "unsupported-live-path",
  internalSyntheticMetadataDoesNotExposeSharedResultPayload:
    lacksSharedResultBoundaryPayload(internalProductPhotoSyntheticMetadataDecision),
  internalUnknownRouteInconclusive:
    internalUnknownDecision.route === "unknown-inconclusive" &&
    internalUnknownDecision.status === "unknown-inconclusive",
  internalRoutesNeverInvokeAnalyzer:
    guardedInternalRouteDecisions.every((decision) => decision.analyzerInvoked === false),
  internalRoutesNeverInvokeAdapter:
    guardedInternalRouteDecisions.every((decision) => decision.adapterInvoked === false),
  internalRoutesNeverInvokeProductPhotoResultBoundary:
    guardedInternalRouteDecisions.every((decision) => decision.productPhotoResultBoundaryInvoked === false),
  internalRoutesNeverInvokeUiUploadReportScoringParserFixtures:
    guardedInternalRouteDecisions.every(
      (decision) => decision.uiUploadReportScoringParserFixturePathsInvoked === false,
    ),
  internalRoutesNeverNeedLocalAnalysisResult:
    guardedInternalRouteDecisions.every((decision) => decision.localAnalysisResultShapeRequired === false),
} as const;

const analyzerRoutingImportBoundaryChecks = {
  importsLiveAnalyzer: false,
  importsProductPhotoAnalyzer: false,
  importsProductPhotoRoutingAdapter: false,
  importsUiUploadReportScoringParserFixtures: false,
  importsProvidersStorageIntegrationsCaseQueues: false,
  invokesAnalyzeEvidenceFile: false,
  invokesProductPhotoResultBoundary: false,
  invokesUiUploadReportScoringParserFixtures: false,
  invokesProvidersStorageIntegrationsCaseQueues: false,
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
  internalRoutesDoNotInvokeAnalyzer:
    guardedInternalRouteDecisions.every((decision) => decision.analyzerInvoked === false),
  internalRoutesDoNotInvokeAdapter:
    guardedInternalRouteDecisions.every((decision) => decision.adapterInvoked === false),
  internalRoutesDoNotInvokeProductPhotoResultBoundary:
    guardedInternalRouteDecisions.every((decision) => decision.productPhotoResultBoundaryInvoked === false),
  analyzerRoutingImportBoundaryClean: Object.values(analyzerRoutingImportBoundaryChecks).every((imported) => imported === false),
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
  productPhotoCandidateNotExistingReceiptPath:
    publicProductPhotoRuntimeOffDecision.existingReceiptPathCandidate === false,
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
  publicWrapperDoesNotExposeSharedResultPayloadFields,
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
  metadataBearingProductPhotoRoutesGuarded:
    publicProductPhotoSyntheticMetadataDecision.route === "product-photo-guarded-non-live",
  metadataBearingProductPhotoCandidateDetected:
    publicProductPhotoSyntheticMetadataDecision.evidenceCandidate === "product-photo-candidate",
  metadataBearingProductPhotoRuntimeNonLive:
    publicProductPhotoSyntheticMetadataDecision.productPhotoRuntimeLive === false,
  metadataBearingProductPhotoNotExistingReceiptPath:
    publicProductPhotoSyntheticMetadataDecision.existingReceiptPathCandidate === false,
  metadataBearingProductPhotoDoesNotExposeSharedResultPayload:
    lacksSharedResultBoundaryPayload(publicProductPhotoSyntheticMetadataDecision),
  metadataBearingProductPhotoAnalyzerNotInvoked:
    publicProductPhotoSyntheticMetadataDecision.analyzerInvoked === false,
  metadataBearingProductPhotoAdapterNotInvoked:
    publicProductPhotoSyntheticMetadataDecision.adapterInvoked === false,
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
  internalProductPhotoDoesNotExposeResultDetails:
    lacksProductPhotoResultDetails(internalProductPhotoRuntimeOffDecision),
  internalProductPhotoRuntimeRequestDoesNotExposeResultDetails:
    lacksProductPhotoResultDetails(internalProductPhotoRuntimeTrueDecision),
  internalProductPhotoSyntheticMetadataDoesNotExposeResultDetails:
    lacksProductPhotoResultDetails(internalProductPhotoSyntheticMetadataDecision),
  guardedInternalRoutesDoNotExposeSharedResultPayload:
    guardedInternalRouteDecisions.every(lacksSharedResultBoundaryPayload),
} as const;

const safetyWordingChecks = {
  productPhotoGuardManualReviewOnly: hasManualReviewOnlySafetyWording(productPhotoRuntimeOffDecision),
  productPhotoRuntimeRequestManualReviewOnly: hasManualReviewOnlySafetyWording(productPhotoRuntimeTrueDecision),
  damagePhotoAliasManualReviewOnly: hasManualReviewOnlySafetyWording(damagePhotoAliasDecision),
  publicProductPhotoManualReviewOnly: hasManualReviewOnlySafetyWording(publicProductPhotoRuntimeOffDecision),
  publicProductPhotoRuntimeRequestManualReviewOnly:
    hasManualReviewOnlySafetyWording(publicProductPhotoRuntimeTrueDecision),
  publicDamagePhotoAliasManualReviewOnly: hasManualReviewOnlySafetyWording(publicDamagePhotoAliasDecision),
  publicSyntheticMetadataProductPhotoManualReviewOnly:
    hasManualReviewOnlySafetyWording(publicProductPhotoSyntheticMetadataDecision),
  internalProductPhotoManualReviewOnly:
    hasManualReviewOnlySafetyWording(internalProductPhotoRuntimeOffDecision),
  allPublicWrapperDecisionsAvoidUnsafeWording: publicWrapperDecisions.every(hasNoUnsafeSafetyWording),
  allGuardedInternalRouteDecisionsAvoidUnsafeWording:
    guardedInternalRouteDecisions.every(hasNoUnsafeSafetyWording),
  productPhotoGuardAvoidsUnsafeWording: hasNoUnsafeSafetyWording(productPhotoRuntimeOffDecision),
  productPhotoRuntimeRequestAvoidsUnsafeWording: hasNoUnsafeSafetyWording(productPhotoRuntimeTrueDecision),
  damagePhotoAliasAvoidsUnsafeWording: hasNoUnsafeSafetyWording(damagePhotoAliasDecision),
} as const;

function assertProbeChecksPass(label: string, checks: Record<string, boolean>) {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Analyzer routing probe failed: ${label}: ${failed.join(", ")}`);
  }
}

assertProbeChecksPass("guarded internal route", guardedInternalRouteChecks);
assertProbeChecksPass("live path isolation", livePathIsolationChecks);
assertProbeChecksPass("public wrapper", publicWrapperChecks);
assertProbeChecksPass("result shape isolation", resultShapeIsolationChecks);
assertProbeChecksPass("safety wording", safetyWordingChecks);

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
    guardedInternalRoute: {
      receiptLike: internalReceiptLikeDecision,
      productPhotoRuntimeOff: internalProductPhotoRuntimeOffDecision,
      productPhotoRuntimeTrue: internalProductPhotoRuntimeTrueDecision,
      productPhotoSyntheticMetadata: internalProductPhotoSyntheticMetadataDecision,
      unknown: internalUnknownDecision,
    },
    publicWrapper: {
      receiptLike: publicReceiptLikeDecision,
      receiptLikeFile: publicReceiptLikeFileDecision,
      productPhotoRuntimeOff: publicProductPhotoRuntimeOffDecision,
      productPhotoRuntimeTrue: publicProductPhotoRuntimeTrueDecision,
      damagePhotoAlias: publicDamagePhotoAliasDecision,
      unknown: publicUnknownDecision,
      pdfLike: publicPdfLikeDecision,
      screenshotLike: publicScreenshotLikeDecision,
      productPhotoSyntheticMetadata: publicProductPhotoSyntheticMetadataDecision,
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
    guardedInternalRoute: {
      receiptLike: {
        boundary: internalReceiptLikeDecision.boundary,
        route: internalReceiptLikeDecision.route,
        status: internalReceiptLikeDecision.status,
        existingReceiptAnalyzerPathCandidate:
          internalReceiptLikeDecision.existingReceiptAnalyzerPathCandidate,
        analyzerInvoked: internalReceiptLikeDecision.analyzerInvoked,
        adapterInvoked: internalReceiptLikeDecision.adapterInvoked,
        productPhotoResultBoundaryInvoked:
          internalReceiptLikeDecision.productPhotoResultBoundaryInvoked,
      },
      productPhotoRuntimeOff: {
        boundary: internalProductPhotoRuntimeOffDecision.boundary,
        route: internalProductPhotoRuntimeOffDecision.route,
        status: internalProductPhotoRuntimeOffDecision.status,
        runtimeRoutingEnabled: internalProductPhotoRuntimeOffDecision.runtimeRoutingEnabled,
        productPhotoRuntimeLive: internalProductPhotoRuntimeOffDecision.productPhotoRuntimeLive,
        localAnalysisResultShapeRequired:
          internalProductPhotoRuntimeOffDecision.localAnalysisResultShapeRequired,
        analyzerInvoked: internalProductPhotoRuntimeOffDecision.analyzerInvoked,
        adapterInvoked: internalProductPhotoRuntimeOffDecision.adapterInvoked,
        productPhotoResultBoundaryInvoked:
          internalProductPhotoRuntimeOffDecision.productPhotoResultBoundaryInvoked,
      },
      productPhotoRuntimeTrue: {
        boundary: internalProductPhotoRuntimeTrueDecision.boundary,
        route: internalProductPhotoRuntimeTrueDecision.route,
        status: internalProductPhotoRuntimeTrueDecision.status,
        runtimeRoutingEnabled: internalProductPhotoRuntimeTrueDecision.runtimeRoutingEnabled,
        productPhotoRuntimeLive: internalProductPhotoRuntimeTrueDecision.productPhotoRuntimeLive,
        analyzerInvoked: internalProductPhotoRuntimeTrueDecision.analyzerInvoked,
        adapterInvoked: internalProductPhotoRuntimeTrueDecision.adapterInvoked,
        productPhotoResultBoundaryInvoked:
          internalProductPhotoRuntimeTrueDecision.productPhotoResultBoundaryInvoked,
      },
      productPhotoSyntheticMetadata: {
        boundary: internalProductPhotoSyntheticMetadataDecision.boundary,
        route: internalProductPhotoSyntheticMetadataDecision.route,
        status: internalProductPhotoSyntheticMetadataDecision.status,
        recognizedEvidenceType:
          internalProductPhotoSyntheticMetadataDecision.recognizedEvidenceType,
        recognitionState: internalProductPhotoSyntheticMetadataDecision.recognitionState,
        productPhotoRuntimeLive:
          internalProductPhotoSyntheticMetadataDecision.productPhotoRuntimeLive,
        analyzerInvoked: internalProductPhotoSyntheticMetadataDecision.analyzerInvoked,
        adapterInvoked: internalProductPhotoSyntheticMetadataDecision.adapterInvoked,
        productPhotoResultBoundaryInvoked:
          internalProductPhotoSyntheticMetadataDecision.productPhotoResultBoundaryInvoked,
      },
      unknown: {
        boundary: internalUnknownDecision.boundary,
        route: internalUnknownDecision.route,
        status: internalUnknownDecision.status,
        analyzerInvoked: internalUnknownDecision.analyzerInvoked,
        adapterInvoked: internalUnknownDecision.adapterInvoked,
      },
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
      productPhotoSyntheticMetadata: {
        boundary: publicProductPhotoSyntheticMetadataDecision.boundary,
        route: publicProductPhotoSyntheticMetadataDecision.route,
        evidenceCandidate: publicProductPhotoSyntheticMetadataDecision.evidenceCandidate,
        runtimeRoutingEnabled: publicProductPhotoSyntheticMetadataDecision.runtimeRoutingEnabled,
        productPhotoRuntimeLive: publicProductPhotoSyntheticMetadataDecision.productPhotoRuntimeLive,
        analyzerInvoked: publicProductPhotoSyntheticMetadataDecision.analyzerInvoked,
        adapterInvoked: publicProductPhotoSyntheticMetadataDecision.adapterInvoked,
      },
    },
    analyzerRoutingImportBoundary: analyzerRoutingImportBoundaryChecks,
  },
  preservationStatus: {
    receiptPathPreserved: allChecksPass(receiptPathPreservationChecks),
    guardedInternalRouteDecisionOnly: allChecksPass(guardedInternalRouteChecks),
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
      guardedInternalRoute: guardedInternalRouteChecks,
      analyzerRoutingImportBoundary: analyzerRoutingImportBoundaryChecks,
      productPhotoGuard: productPhotoGuardChecks,
      unknownPath: unknownPathChecks,
      livePathIsolation: livePathIsolationChecks,
      publicWrapper: publicWrapperChecks,
      resultShapeIsolation: resultShapeIsolationChecks,
      safetyWording: safetyWordingChecks,
    },
  },
} as const;
