import type { EvidenceType } from "@/lib/claim-data";

const LEGACY_DAMAGE_PHOTO_FILENAME_CUES = ["damage", "photo", "crack", "product"] as const;

export const LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE = {
  boundary: "live-evidence-type-classifier",
  legacyEvidenceType: "damage-photo",
  collapseTarget: "receipt",
  productPhotoRuntimeLive: false,
  damagePhotoCanonicalRuntime: false,
  analyzeEvidenceFileProductPhotoRuntime: false,
} as const;

function isLegacyDamagePhotoFilenameCandidate(file: File, normalizedName: string) {
  return file.type.startsWith("image/") && LEGACY_DAMAGE_PHOTO_FILENAME_CUES.some((cue) => normalizedName.includes(cue));
}

export function getEvidenceTypeFromFile(file: File | null): EvidenceType {
  if (!file) {
    return "receipt";
  }

  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }

  if (name.includes("screenshot") || name.includes("screen")) {
    return "screenshot";
  }

  if (isLegacyDamagePhotoFilenameCandidate(file, name)) {
    return LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE.collapseTarget;
  }

  return "receipt";
}
