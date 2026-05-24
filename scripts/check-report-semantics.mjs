import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

const filesToCheck = [
  "src/lib/analysis/analyzer.ts",
  "src/lib/analysis/report-adapter.ts",
  "src/lib/analysis/scoring.ts",
  "src/lib/analysis/types.ts",
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

const guardedBannedPhrases = [
  /Authenticity\s+score/i,
  /verified authentic/i,
  /verified authenticity/i,
  /authenticity verified/i,
  /confirmed authentic(?:ity)?/i,
  /definitely real/i,
  /fraud confirmed/i,
  /\bfake\b/i,
  /fake receipt/i,
  /customer committed fraud/i,
  /deny this claim/i,
  /proof of authenticity/i,
  /(?:proves|proven)\s+(?:that\s+)?(?:the\s+)?receipt\s+(?:is\s+)?(?:real|authentic)/i,
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

for (const bannedPhrase of guardedBannedPhrases) {
  if (bannedPhrase.test(corpus)) {
    failures.push(`Unsafe report, fixture, or QA wording found: ${bannedPhrase}`);
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
