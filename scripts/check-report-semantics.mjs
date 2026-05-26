import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

const filesToCheck = [
  "src/lib/analysis/analyzer.ts",
  "src/lib/analysis/report-adapter.ts",
  "src/lib/analysis/scoring.ts",
  "src/lib/analysis/types.ts",
  "src/lib/analysis/product-photo-analyzer.ts",
  "src/lib/analysis/product-photo-heuristics.ts",
  "src/lib/analysis/product-photo-result.probe.ts",
  "src/lib/analysis/shared-result.probe.ts",
  "src/lib/analysis/product-photo-report-view-model.ts",
  "src/lib/analysis/product-photo-report-view-model.probe.ts",
  "src/components/AnalysisReport.tsx",
  "src/components/AuthenticityResultCard.tsx",
  "src/components/ClaimReviewWorkflow.tsx",
  "src/components/RiskScoreCard.tsx",
  "src/components/TestEvidenceHarness.tsx",
  "src/app/test-evidence/page.tsx",
  "src/lib/test-evidence/fixtures.ts",
  "src/lib/test-evidence/tuning-thresholds.ts",
  "TEST_EVIDENCE.md",
];

const readRequiredFile = (filePath) => {
  const absolutePath = join(repoRoot, filePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required semantic check file: ${filePath}`);
  }

  return readFileSync(absolutePath, "utf8");
};

const fileContents = new Map(filesToCheck.map((filePath) => [filePath, readRequiredFile(filePath)]));
const corpus = [...fileContents.values()].join("\n");
const sourceCorpus = [...fileContents]
  .filter(([filePath]) => filePath.startsWith("src/"))
  .map(([, contents]) => contents)
  .join("\n");
const productPhotoCorpus = [...fileContents]
  .filter(([filePath]) => filePath.includes("product-photo") || filePath.includes("shared-result.probe"))
  .map(([, contents]) => contents)
  .join("\n");

const requiredSemanticSignals = [
  {
    label: "Evidence Reliability Score or equivalent score label",
    patterns: [/Evidence Reliability Score/i, /Receipt Reliability Score/i],
  },
  {
    label: "Verification Status",
    patterns: [/Verification Status/i],
  },
  {
    label: "External Verification",
    patterns: [/External Verification/i],
  },
  {
    label: "Internal Structure Confidence",
    patterns: [/Internal Structure Confidence/i],
  },
  {
    label: "score meaning / interpretation",
    patterns: [/scoreMeaning/i, /Score meaning/i, /High-score meaning/i],
  },
  {
    label: "high score is not proof language",
    patterns: [/High score does not prove/i, /does not prove the receipt is real/i],
  },
  {
    label: "not externally verified language",
    patterns: [/Not externally verified/i, /External verification (?:was )?not performed/i],
  },
  {
    label: "external verification fixed to not performed",
    patterns: [/externalVerification:\s*"Not performed"/i, /externalVerification\s*=\s*"Not performed"/i],
  },
  {
    label: "local analysis does not confirm authenticity",
    patterns: [/does not confirm authenticity/i, /Local analysis can assess evidence quality and internal consistency only/i],
  },
  {
    label: "privacy-safe tuning/export wording",
    patterns: [/privacy-safe-tuning-observation/i, /Copy tuning observation/i, /redacted JSON/i],
  },
];

const phrasePattern = (...parts) => new RegExp(parts.join("\\s+"), "i");

const guardedBannedPhrases = [
  /Authenticity\s+(?:score|confidence|rating)/i,
  /confidence\s+in\s+authenticity/i,
  /verified authentic/i,
  phrasePattern("verified", "authenticity"),
  /authenticity verified/i,
  /confirmed authentic(?:ity)?/i,
  /definitely real/i,
  phrasePattern("fraud", "confirmed"),
  /\bfake\b/i,
  phrasePattern("fake", "receipt"),
  /customer committed fraud/i,
  /deny this claim/i,
  /proof of authenticity/i,
  /(?:proves|proven)\s+(?:that\s+)?(?:the\s+)?receipt\s+(?:is\s+)?(?:real|authentic)/i,
];

const requiredProductPhotoSemanticSignals = [
  {
    label: "product-photo mapping boundary",
    patterns: [/product-photo-report-view-model/i],
  },
  {
    label: "product-photo local-only score scope",
    patterns: [/Local evidence quality and review readiness only/i],
  },
  {
    label: "product-photo high score is not proof language",
    patterns: [/High score does not prove the product photo or claim/i],
  },
  {
    label: "product-photo external verification not performed",
    patterns: [/External verification was not performed/i, /externalVerification:\s*"Not performed"/i],
  },
  {
    label: "product-photo manual review wording",
    patterns: [/Manual review recommended/i],
  },
  {
    label: "product-photo privacy-safe omission flags",
    patterns: [/rawExifOmitted/i, /originalFilenameOmitted/i, /rawValueOmitted/i],
  },
];

const productPhotoBannedPhrases = [
  phrasePattern("fraud", "confirmed"),
  phrasePattern("confirmed", "fraud"),
  phrasePattern("manipulation", "confirmed"),
  /\bfake\b/i,
  /\bapproved\b/i,
  /\brejected\b/i,
  /\b(?:photo|image|claim|evidence)\s+verified\b/i,
  /\bverified\s+(?:photo|image|claim|evidence|authentic|authenticity)\b/i,
  /\b(?:approve|deny|reject)\s+(?:this\s+)?claim\b/i,
  /automatic\s+(?:outcome|decision|disposition)/i,
];

const unsafeHighScoreProofPattern = /High score(?![^.]*does not prove)[^.]*\b(?:proves?|confirms?|verifies?|authentic|real)\b/i;
const unsafeExternalVerificationPatterns = [
  /externalVerification\s*:\s*["'`](?!Not performed)/i,
  /external verification (?:complete|passed|confirmed|verified)/i,
  /externally verified by/i,
];

const safeCountRedactionPattern =
  /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){1,6}(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|way|boulevard|blvd\.?|court|ct\.?|circle|cir\.?)(?=\s|,|\.|$)/gi;

const failures = [];

for (const signal of requiredSemanticSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(corpus))) {
    failures.push(`Missing semantic signal: ${signal.label}`);
  }
}

for (const signal of requiredProductPhotoSemanticSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoCorpus))) {
    failures.push(`Missing product-photo semantic signal: ${signal.label}`);
  }
}

for (const bannedPhrase of guardedBannedPhrases) {
  if (bannedPhrase.test(corpus)) {
    failures.push(`Unsafe report, fixture, or QA wording found: ${bannedPhrase}`);
  }
}

for (const bannedPhrase of productPhotoBannedPhrases) {
  if (bannedPhrase.test(productPhotoCorpus)) {
    failures.push(`Unsafe product-photo wording found: ${bannedPhrase}`);
  }
}

if (unsafeHighScoreProofPattern.test(corpus)) {
  failures.push("Unsafe score wording found: high score appears to imply proof, verification, or authenticity.");
}

for (const pattern of unsafeExternalVerificationPatterns) {
  if (pattern.test(sourceCorpus)) {
    failures.push(`Unsafe external-verification wording found: ${pattern}`);
  }
}

const testEvidenceHarness = fileContents.get("src/components/TestEvidenceHarness.tsx") ?? "";
const safeProductTableNote = "6 product table row(s) detected as item evidence.";
const redactedProductTableNote = safeProductTableNote.replace(safeCountRedactionPattern, "[REDACTED_ADDRESS]");
const redactedAddressSample = "123 Main St.".replace(safeCountRedactionPattern, "[REDACTED_ADDRESS]");
const structurallySafeRedactedJsonSignals = [
  /privacy-safe-redacted-diagnostic/i,
  /redacted-structural/i,
  /rawFieldsOmitted/i,
  /redactedDiagnosticFor\(activeRealRun/i,
  /ocr\.text/i,
  /receipt\.rawText/i,
  /metadata\.exif/i,
  /finalReport raw narrative fields/i,
];
const redactedDiagnosticBody =
  testEvidenceHarness.match(/function redactedDiagnosticFor[\s\S]*?function sessionTuningSummaryFor/)?.[0] ?? "";
const forbiddenRedactedDiagnosticPatterns = [
  /analysisResult\s*:/,
  /finalReport\s*:/,
  /text:\s*result\.ocr\.text/,
  /lowConfidenceRegions\s*:\s*result\.ocr\.lowConfidenceRegions/,
  /rawText\s*:\s*result\.receipt\.rawText/,
  /name:\s*run\.file\.name/,
  /fileName\s*:\s*result\.metadata\.fileName/,
  /lastModifiedIso\s*:\s*result\.metadata\.lastModifiedIso/,
  /exif\s*:\s*result\.metadata\.exif/,
  /lineItemCandidates\s*:\s*result\.receipt\.parsingDetails\.lineItemCandidates/,
  /rejectedLineItemCandidates\s*:\s*result\.receipt\.parsingDetails\.rejectedLineItemCandidates/,
  /paymentCandidates\s*:\s*result\.receipt\.parsingDetails\.paymentCandidates/,
  /contextCandidates\s*:\s*result\.receipt\.parsingDetails\.contextCandidates/,
  /value:\s*field\.value/,
];
const productPhotoReportViewModel =
  fileContents.get("src/lib/analysis/product-photo-report-view-model.ts") ?? "";
const productPhotoReportViewModelProbe =
  fileContents.get("src/lib/analysis/product-photo-report-view-model.probe.ts") ?? "";
const reportAdapter = fileContents.get("src/lib/analysis/report-adapter.ts") ?? "";
const forbiddenProductPhotoMapperImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/test-evidence",
  "@/components/",
  "@/lib/claim-data",
];
const forbiddenProductPhotoMapperPatterns = [
  /LocalAnalysisResult/,
  /MockAnalysisReport/,
  /result\.evidenceSummary/,
  /result\.recommendedSupportAction/,
  /result\.customerSafeWording/,
  /\.\.\.\s*(?:result|details|metadataSummary)/,
];
const requiredProductPhotoMapperSignals = [
  {
    label: "targeted product-photo score scope",
    patterns: [/scope:\s*"Local evidence quality and review readiness only"/i],
  },
  {
    label: "targeted product-photo high-score safety note",
    patterns: [/High score does not prove the product photo or claim/i],
  },
  {
    label: "targeted product-photo external verification summary",
    patterns: [/External verification was not performed/i],
  },
  {
    label: "targeted product-photo manual review support action",
    patterns: [/Manual review recommended/i],
  },
];
const requiredProductPhotoDisplayProbeSignals = [
  {
    label: "display contract probe execution marker",
    patterns: [/assertProbeChecksPass\("display", displayChecks\)/],
  },
  {
    label: "display contract complete context case",
    patterns: [/completeContextNoRequestedViews/],
  },
  {
    label: "display contract requested views case",
    patterns: [/missingContextRequestedViewsDisplayLabels/],
  },
  {
    label: "display contract score-band cases",
    patterns: [/lowMediumHighScoreCasesKeepLocalScope/],
  },
  {
    label: "display contract missing metadata case",
    patterns: [/missingMetadataCaseUsesSafeSummary/],
  },
  {
    label: "display contract label omission case",
    patterns: [/labelContextPresentRawValuesOmitted/],
  },
  {
    label: "display contract clear label clamp",
    patterns: [/overconfidentClearLabelClamped/],
  },
  {
    label: "recursive private key audit",
    patterns: [/forbiddenPrivateKeyPathsAbsent/],
  },
  {
    label: "sentinel private value audit",
    patterns: [/sentinelPrivateValuesAbsent/],
  },
];
const productPhotoDisplayBannedPatterns = [
  phrasePattern("passed", "authenticity", "check"),
  phrasePattern("failed", "authenticity", "check"),
  /\b(?:valid|invalid)\s+(?:photo|image|claim|evidence)\b/i,
  /\b(?:photo|image|claim|evidence)\s+(?:valid|invalid)\b/i,
  /\b(?:altered|tampered)\s+(?:photo|image|claim|evidence)\b/i,
  phrasePattern("misleading", "evidence"),
  phrasePattern("customer", "caused", "the", "damage"),
  phrasePattern("ai", "detected", "manipulation"),
  /\b(?:image|photo|evidence)\s+proves?\b/i,
];

if (redactedProductTableNote !== safeProductTableNote) {
  failures.push("Privacy redaction check failed: product table row counts must remain visible in tuning observations.");
}

if (!redactedAddressSample.includes("[REDACTED_ADDRESS]")) {
  failures.push("Privacy redaction check failed: street-address samples should still be masked.");
}

if (testEvidenceHarness.includes("\\s+[A-Za-z0-9 .'-]+(?:street|st")) {
  failures.push("Privacy redaction check failed: street-address pattern is broad enough to mask safe product-table count text.");
}

for (const pattern of structurallySafeRedactedJsonSignals) {
  if (!pattern.test(testEvidenceHarness)) {
    failures.push(`Privacy redacted JSON check failed: missing ${pattern}`);
  }
}

if (!redactedDiagnosticBody) {
  failures.push("Privacy redacted JSON check failed: redactedDiagnosticFor body was not found.");
}

for (const pattern of forbiddenRedactedDiagnosticPatterns) {
  if (pattern.test(redactedDiagnosticBody)) {
    failures.push(`Privacy redacted JSON check failed: raw/private-bearing field is still exported by redactedDiagnosticFor: ${pattern}`);
  }
}

if (testEvidenceHarness.includes("redacted ? redactSensitiveValue(payload) : payload")) {
  failures.push("Privacy redacted JSON check failed: redacted copy still appears to share the full payload with regex masking.");
}

for (const importPath of forbiddenProductPhotoMapperImports) {
  if (productPhotoReportViewModel.includes(importPath)) {
    failures.push(`Product-photo report mapping boundary check failed: mapper imports forbidden path ${importPath}`);
  }
}

for (const pattern of forbiddenProductPhotoMapperPatterns) {
  if (pattern.test(productPhotoReportViewModel)) {
    failures.push(`Product-photo report mapping boundary check failed: mapper uses forbidden pattern ${pattern}`);
  }
}

for (const signal of requiredProductPhotoMapperSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoReportViewModel))) {
    failures.push(`Product-photo report mapping boundary check failed: missing ${signal.label}`);
  }
}

for (const signal of requiredProductPhotoDisplayProbeSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoReportViewModelProbe))) {
    failures.push(`Product-photo display contract probe check failed: missing ${signal.label}`);
  }
}

for (const pattern of productPhotoDisplayBannedPatterns) {
  if (pattern.test(productPhotoCorpus)) {
    failures.push(`Unsafe product-photo display wording found: ${pattern}`);
  }
}

if (reportAdapter.includes("product-photo-report-view-model") || reportAdapter.includes("mapProductPhotoAnalysisToReportViewModel")) {
  failures.push("Product-photo report mapping boundary check failed: receipt report adapter imports product-photo mapper.");
}

if (!reportAdapter.includes("mapLocalAnalysisToReport(result: LocalAnalysisResult)")) {
  failures.push("Product-photo report mapping boundary check failed: receipt report adapter signature changed.");
}

if (failures.length > 0) {
  console.error("ClaimGuard report semantic smoke check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("ClaimGuard report semantic smoke check passed.");
  console.log("Checked analyzer report adapters, score cards, /test-evidence, tuning exports, fixtures, and docs.");
}
