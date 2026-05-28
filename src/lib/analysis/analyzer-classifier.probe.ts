import {
  getEvidenceTypeFromFile,
  LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE,
} from "@/lib/analysis/analyzer-classifier";

function fileLike(name: string, type: string) {
  return { name, type } as File;
}

function assertProbeChecksPass(label: string, checks: Record<string, boolean>) {
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(`Analyzer classifier quarantine probe failed (${label}): ${failed.join(", ")}`);
  }
}

const pdfReceiptResult = getEvidenceTypeFromFile(fileLike("synthetic-order-details.pdf", "application/pdf"));
const screenshotResult = getEvidenceTypeFromFile(fileLike("synthetic-order-screenshot.png", "image/png"));
const screenCaptureResult = getEvidenceTypeFromFile(fileLike("synthetic-screen-capture.jpg", "image/jpeg"));
const receiptImageResult = getEvidenceTypeFromFile(fileLike("synthetic-receipt.jpg", "image/jpeg"));
const nullInputResult = getEvidenceTypeFromFile(null);

const legacyDamagePhotoFilenameCueResults = [
  getEvidenceTypeFromFile(fileLike("synthetic-damage-photo.jpg", "image/jpeg")),
  getEvidenceTypeFromFile(fileLike("synthetic-crack-closeup.webp", "image/webp")),
  getEvidenceTypeFromFile(fileLike("synthetic-product-photo.png", "image/png")),
  getEvidenceTypeFromFile(fileLike("synthetic-receipt-photo.jpg", "image/jpeg")),
];

const classifierQuarantineChecks = {
  pdfReceiptClassificationPreserved: pdfReceiptResult === "pdf",
  screenshotClassificationPreserved: screenshotResult === "screenshot" && screenCaptureResult === "screenshot",
  receiptImageClassificationPreserved: receiptImageResult === "receipt" && nullInputResult === "receipt",
  legacyDamagePhotoFilenameCuesCollapseToReceipt: legacyDamagePhotoFilenameCueResults.every(
    (result) => result === "receipt",
  ),
  legacyDamagePhotoFilenameCuesNeverReturnDamagePhoto: legacyDamagePhotoFilenameCueResults.every(
    (result) => result !== "damage-photo",
  ),
  legacyDamagePhotoFilenameCuesNeverReturnProductPhoto: legacyDamagePhotoFilenameCueResults.every(
    (result) => String(result) !== "product-photo",
  ),
  quarantineMarkerKeepsProductPhotoRuntimeNonLive:
    LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.productPhotoRuntimeLive === false &&
    LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.damagePhotoCanonicalRuntime === false &&
    LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.analyzeEvidenceFileProductPhotoRuntime === false,
  quarantineMarkerDocumentsCollapseTarget: LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.collapseTarget === "receipt",
};

assertProbeChecksPass("classifier quarantine", classifierQuarantineChecks);

export const ANALYZER_CLASSIFIER_QUARANTINE_DEVELOPER_PROBE = {
  boundary: LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.boundary,
  legacyEvidenceType: LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.legacyEvidenceType,
  collapseTarget: LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.collapseTarget,
  productPhotoRuntimeLive: LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.productPhotoRuntimeLive,
  damagePhotoCanonicalRuntime: LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.damagePhotoCanonicalRuntime,
  analyzeEvidenceFileProductPhotoRuntime:
    LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.analyzeEvidenceFileProductPhotoRuntime,
  cases: {
    pdfReceipt: pdfReceiptResult,
    screenshot: screenshotResult,
    screenCapture: screenCaptureResult,
    receiptImage: receiptImageResult,
    nullInput: nullInputResult,
    legacyDamagePhotoFilenameCues: legacyDamagePhotoFilenameCueResults,
  },
  expectations: classifierQuarantineChecks,
} as const;
