import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

const filesToCheck = [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/app/case-command-center/page.tsx",
  "src/app/dev/product-photo-review-panel/page.tsx",
  "src/app/dev/product-photo-review-panel/render-cases.ts",
  "src/app/dev/pre-analysis-evidence-gate/page.tsx",
  "src/app/dev/pre-analysis-evidence-gate/render-cases.ts",
  "src/app/dev/product-photo-adapter-readiness/page.tsx",
  "src/app/dev/product-photo-adapter-readiness/render-cases.ts",
  "src/app/dev/unsupported-evidence-review/page.tsx",
  "src/app/dev/unsupported-evidence-review/render-cases.ts",
  "src/lib/analysis/analyzer.ts",
  "src/lib/analysis/analyzer-classifier.ts",
  "src/lib/analysis/analyzer-classifier.probe.ts",
  "src/lib/analysis/analyzer-routing.ts",
  "src/lib/analysis/analyzer-routing.probe.ts",
  "src/lib/analysis/report-adapter.ts",
  "src/lib/analysis/scoring.ts",
  "src/lib/analysis/types.ts",
  "src/lib/analysis/product-photo-analyzer.ts",
  "src/lib/analysis/product-photo-analyzer.probe.ts",
  "src/lib/analysis/product-photo-heuristics.ts",
  "src/lib/analysis/product-photo-heuristics.probe.ts",
  "src/lib/analysis/product-photo-recognition.ts",
  "src/lib/analysis/product-photo-recognition.probe.ts",
  "src/lib/analysis/product-photo-result.probe.ts",
  "src/lib/analysis/product-photo-routing-adapter.ts",
  "src/lib/analysis/product-photo-routing-adapter.probe.ts",
  "src/lib/analysis/product-photo-adapter-readiness.probe.ts",
  "src/lib/analysis/shared-result.probe.ts",
  "src/lib/analysis/product-photo-report-view-model.ts",
  "src/lib/analysis/product-photo-report-view-model.probe.ts",
  "src/lib/analysis/pre-analysis-evidence-gate.ts",
  "src/lib/analysis/pre-analysis-evidence-gate.probe.ts",
  "src/lib/analysis/pre-analysis-evidence-gate-runtime.ts",
  "src/lib/analysis/pre-analysis-evidence-gate-runtime.probe.ts",
  "src/lib/analysis/unsupported-evidence-review-state.ts",
  "src/lib/analysis/unsupported-evidence-review-state.probe.ts",
  "src/lib/analysis/workflow-pre-analysis-gate-boundary.ts",
  "src/lib/analysis/workflow-pre-analysis-gate-boundary.probe.ts",
  "src/lib/analysis/ocr-fixture-harness.ts",
  "src/lib/analysis/ocr-fixture-harness.probe.ts",
  "src/components/ProductPhotoReviewPanel.tsx",
  "src/components/ProductPhotoReviewPanel.probe.tsx",
  "src/components/CaseReviewCommandCenter.tsx",
  "src/components/AnalysisReport.tsx",
  "src/components/AuthenticityResultCard.tsx",
  "src/components/ClaimReviewWorkflow.tsx",
  "src/components/RiskScoreCard.tsx",
  "src/components/TestEvidenceHarness.tsx",
  "src/app/test-evidence/page.tsx",
  "src/lib/case-command-center/mock-case.ts",
  "src/lib/test-evidence/fixtures.ts",
  "src/lib/test-evidence/tuning-thresholds.ts",
  "scripts/run-product-photo-probes.cjs",
  "package.json",
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
  .filter(
    ([filePath]) =>
      filePath.includes("product-photo") ||
      filePath.includes("ProductPhotoReviewPanel") ||
      filePath.includes("shared-result.probe"),
  )
  .map(([, contents]) => contents)
  .join("\n");
const ocrFixtureHarness = fileContents.get("src/lib/analysis/ocr-fixture-harness.ts") ?? "";
const ocrFixtureProbe = fileContents.get("src/lib/analysis/ocr-fixture-harness.probe.ts") ?? "";
const ocrFixtureCorpus = `${ocrFixtureHarness}\n${ocrFixtureProbe}`;

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
  /\bdenied\b/i,
  /\bcleared\b/i,
  /\bgenuine\b/i,
  /\bnot genuine\b/i,
  /\b(?:photo|image|claim|evidence)\s+verified\b/i,
  /\bverified\s+(?:photo|image|claim|evidence|authentic|authenticity)\b/i,
  /\b(?:valid|invalid)\s+claim\b/i,
  /\bclaim\s+(?:valid|invalid|complete)\b/i,
  /\b(?:approve|deny|reject)\s+(?:this\s+)?claim\b/i,
  /automatic\s+(?:outcome|decision|disposition)/i,
];

const requiredOcrFixtureHarnessSignals = [
  {
    label: "Phase 4.2 harness marker",
    patterns: [/phase-4\.2-synthetic-ocr-fixture-harness/],
  },
  {
    label: "OCR fixture cases export",
    patterns: [/SYNTHETIC_OCR_FIXTURE_CASES/],
  },
  {
    label: "clean receipt OCR fixture",
    patterns: [/clean-receipt-ocr/],
  },
  {
    label: "Amazon-like OCR fixture",
    patterns: [/amazon-like-order-ocr/],
  },
  {
    label: "missing total OCR fixture",
    patterns: [/missing-total-ocr/],
  },
  {
    label: "missing merchant OCR fixture",
    patterns: [/missing-merchant-ocr/],
  },
  {
    label: "conflicting date and total OCR fixture",
    patterns: [/conflicting-date-total-ocr/],
  },
  {
    label: "noisy OCR fixture",
    patterns: [/noisy-ocr-text/],
  },
  {
    label: "unsupported non-receipt OCR fixture",
    patterns: [/unsupported-non-receipt-text/],
  },
  {
    label: "ambiguous marketplace OCR fixture",
    patterns: [/ambiguous-marketplace-screen-ocr/],
  },
  {
    label: "provider unavailable synthetic fixture",
    patterns: [/provider-timeout-synthetic-failure/],
  },
  {
    label: "empty OCR output fixture",
    patterns: [/empty-ocr-output/],
  },
  {
    label: "provider calls disabled",
    patterns: [/providerCallsAllowed: false/],
  },
  {
    label: "live runtime disabled",
    patterns: [/liveRuntimeAllowed: false/],
  },
  {
    label: "manual review drivers",
    patterns: [/manualReviewDrivers/],
  },
  {
    label: "confidence as review signal",
    patterns: [/OCR confidence is a review signal, not proof or a final decision/],
  },
  {
    label: "receipt regression safety markers",
    patterns: [/analyzeEvidenceFileUnchanged: true/, /localAnalysisResultUnchanged: true/],
  },
];

const forbiddenOcrFixtureHarnessImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/types",
  "@/components/ClaimReviewWorkflow",
  "@/components/ProductPhotoReviewPanel",
  "@/components/UploadPanel",
  "@/lib/test-evidence",
];

const forbiddenOcrFixtureHarnessPatterns = [
  /\bFile\b/,
  /\bBlob\b/,
  /createObjectURL/,
  /\bobjectUrl\b/,
  /\bimageUrl\b/,
  /\bdataUrl\b/,
  /\bfetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /process\.env/,
  /providerPayload|providerResponse|providerRequestId/,
  /storageHandle|integrationHandle|caseQueueHandle/,
  /customerId|ticketId|claimId|caseId|evidenceId/,
  /claimOutcome|automaticDisposition|externalDecision/,
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

for (const signal of requiredOcrFixtureHarnessSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(ocrFixtureCorpus))) {
    failures.push(`Missing synthetic OCR fixture harness signal: ${signal.label}`);
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

for (const importPath of forbiddenOcrFixtureHarnessImports) {
  if (ocrFixtureHarness.includes(importPath)) {
    failures.push(`Synthetic OCR fixture harness boundary check failed: harness imports forbidden path ${importPath}`);
  }
}

for (const pattern of forbiddenOcrFixtureHarnessPatterns) {
  if (pattern.test(ocrFixtureHarness)) {
    failures.push(`Synthetic OCR fixture harness privacy/import check failed: harness uses forbidden pattern ${pattern}`);
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
const productPhotoAnalyzer = fileContents.get("src/lib/analysis/product-photo-analyzer.ts") ?? "";
const productPhotoAnalyzerProbe = fileContents.get("src/lib/analysis/product-photo-analyzer.probe.ts") ?? "";
const productPhotoHeuristicsProbe = fileContents.get("src/lib/analysis/product-photo-heuristics.probe.ts") ?? "";
const productPhotoRecognition = fileContents.get("src/lib/analysis/product-photo-recognition.ts") ?? "";
const productPhotoRecognitionProbe = fileContents.get("src/lib/analysis/product-photo-recognition.probe.ts") ?? "";
const productPhotoRoutingAdapter = fileContents.get("src/lib/analysis/product-photo-routing-adapter.ts") ?? "";
const productPhotoRoutingAdapterProbe =
  fileContents.get("src/lib/analysis/product-photo-routing-adapter.probe.ts") ?? "";
const productPhotoAdapterReadinessProbe =
  fileContents.get("src/lib/analysis/product-photo-adapter-readiness.probe.ts") ?? "";
const productPhotoReportViewModelProbe =
  fileContents.get("src/lib/analysis/product-photo-report-view-model.probe.ts") ?? "";
const analyzer = fileContents.get("src/lib/analysis/analyzer.ts") ?? "";
const analyzerClassifierProbe = fileContents.get("src/lib/analysis/analyzer-classifier.probe.ts") ?? "";
const analyzerRouting = fileContents.get("src/lib/analysis/analyzer-routing.ts") ?? "";
const analyzerRoutingProbe = fileContents.get("src/lib/analysis/analyzer-routing.probe.ts") ?? "";
const productPhotoProbeRunner = fileContents.get("scripts/run-product-photo-probes.cjs") ?? "";
const analyzerClassifier = fileContents.get("src/lib/analysis/analyzer-classifier.ts") ?? "";
const packageJson = fileContents.get("package.json") ?? "";
const productPhotoReviewPanel = fileContents.get("src/components/ProductPhotoReviewPanel.tsx") ?? "";
const productPhotoReviewPanelProbe = fileContents.get("src/components/ProductPhotoReviewPanel.probe.tsx") ?? "";
const productPhotoReviewPanelHostPage =
  fileContents.get("src/app/dev/product-photo-review-panel/page.tsx") ?? "";
const productPhotoReviewPanelRenderCases =
  fileContents.get("src/app/dev/product-photo-review-panel/render-cases.ts") ?? "";
const claimReviewWorkflow = fileContents.get("src/components/ClaimReviewWorkflow.tsx") ?? "";
const reportAdapter = fileContents.get("src/lib/analysis/report-adapter.ts") ?? "";
const appPage = fileContents.get("src/app/page.tsx") ?? "";
const appLayout = fileContents.get("src/app/layout.tsx") ?? "";
const caseCommandCenterPage = fileContents.get("src/app/case-command-center/page.tsx") ?? "";
const caseCommandCenterComponent = fileContents.get("src/components/CaseReviewCommandCenter.tsx") ?? "";
const caseCommandCenterMockCase = fileContents.get("src/lib/case-command-center/mock-case.ts") ?? "";
const caseCommandCenterCorpus = `${caseCommandCenterPage}\n${caseCommandCenterComponent}\n${caseCommandCenterMockCase}`;
const requiredCaseCommandCenterSignals = [
  {
    label: "phase 3.2 route imports local shell",
    patterns: [/import \{ CaseReviewCommandCenter \} from "@\/components\/CaseReviewCommandCenter";/],
  },
  {
    label: "phase 3.10 final shell polish label",
    patterns: [/Phase 3\.10 final shell polish/],
  },
  {
    label: "mock local data only label",
    patterns: [/Mock\/local data only/],
  },
  {
    label: "case review command center heading",
    patterns: [/Case Review Command Center/],
  },
  {
    label: "phase 3.8 synthetic case title",
    patterns: [/Synthetic warranty review case/],
  },
  {
    label: "phase 3.8 review posture strip",
    patterns: [/Review posture strip/, /Review posture: compare local evidence summaries with support policy/],
  },
  {
    label: "phase 3.8 summary chips",
    patterns: [/Evidence and review summary chips/, /Customer-safe wording/, /Timeline events/],
  },
  {
    label: "phase 3.8 static command bar",
    patterns: [/Static command\/status bar/, /Orientation labels only/],
  },
  {
    label: "phase 3.8 no live command boundary",
    patterns: [/Nothing here is live, saved, sent, exported, synced, persisted, or connected to a ticket system/],
  },
  {
    label: "phase 3.8 local safety badges",
    patterns: [/Local shell/, /Synthetic case/, /Not persisted/, /No live actions/],
  },
  {
    label: "phase 3.9 review summary layout label",
    patterns: [/Phase 3\.9 review summary layout/],
  },
  {
    label: "phase 3.9 case review synthesis",
    patterns: [/Case review synthesis/, /Static case-level intelligence layout/],
  },
  {
    label: "phase 3.9 evidence reviewed groups",
    patterns: [/Eligible receipt context/, /Order and customer context/, /Unsupported evidence/],
  },
  {
    label: "phase 3.9 missing information and manual drivers",
    patterns: [/Missing information checklist/, /Manual-review drivers/],
  },
  {
    label: "phase 3.9 safe posture and limitations",
    patterns: [/Safe reviewer posture/, /Review limitations/],
  },
  {
    label: "phase 3.9 relationship links",
    patterns: [/Timeline link/, /Manual decision link/, /Customer-safe wording link/],
  },
  {
    label: "phase 3.9 no live scoring decision boundary",
    patterns: [/Internal-only static synthesis/, /Not a scoring result, not an automated decision/],
  },
  {
    label: "selected evidence bench structure",
    patterns: [/Selected evidence bench/],
  },
  {
    label: "phase 3.7 evidence detail polish marker",
    patterns: [/Phase 3\.7 renders structured local summaries and mock evidence-detail planning only/],
  },
  {
    label: "phase 3.7 grouped evidence bench marker",
    patterns: [/Reviewed receipt evidence/, /Manual-review-only evidence/],
  },
  {
    label: "phase 3.7 structured evidence metadata",
    patterns: [/Structured evidence metadata/],
  },
  {
    label: "phase 3.7 synthetic review context",
    patterns: [/Synthetic review context/],
  },
  {
    label: "phase 3.7 observed review signals",
    patterns: [/Observed review signals/],
  },
  {
    label: "phase 3.7 investigation focus",
    patterns: [/Investigation focus/],
  },
  {
    label: "phase 3.7 cross-reference trail",
    patterns: [/Cross-reference trail/],
  },
  {
    label: "phase 3.7 next-step cues",
    patterns: [/Next-step cues/],
  },
  {
    label: "off-white case shell visual direction",
    patterns: [/bg-\[var\(--cg-bg\)\]/],
  },
  {
    label: "manual review recommended wording",
    patterns: [/Manual review recommended/],
  },
  {
    label: "customer-safe wording separation",
    patterns: [/Customer-safe wording is separate from internal notes/],
  },
  {
    label: "phase 3.4 timeline and audit trail label",
    patterns: [/Timeline and audit trail/],
  },
  {
    label: "phase 3.4 synthetic audit structure marker",
    patterns: [/Synthetic audit structure/],
  },
  {
    label: "phase 3.4 evidence-added timeline category",
    patterns: [/"Evidence added"/],
  },
  {
    label: "phase 3.4 analysis-completed timeline category",
    patterns: [/"Analysis completed"/],
  },
  {
    label: "phase 3.4 manual-review-needed timeline category",
    patterns: [/"Manual review needed"/],
  },
  {
    label: "phase 3.4 rep-note-drafted timeline category",
    patterns: [/"Rep note drafted"/],
  },
  {
    label: "phase 3.4 customer-safe-wording timeline category",
    patterns: [/"Customer-safe wording prepared"/],
  },
  {
    label: "phase 3.4 case-status-changed timeline category",
    patterns: [/"Case status changed"/],
  },
  {
    label: "phase 3.4 escalation-marker timeline category",
    patterns: [/"Escalation marker"/],
  },
  {
    label: "phase 3.4 selected evidence trail",
    patterns: [/Selected evidence trail/],
  },
  {
    label: "phase 3.5 manual review workspace label",
    patterns: [/Manual review workspace/],
  },
  {
    label: "phase 3.5 mock local review plan marker",
    patterns: [/Mock local review plan/],
  },
  {
    label: "phase 3.5 not-saved boundary",
    patterns: [/not saved, submitted, or sent to any external system/],
  },
  {
    label: "phase 3.5 selected evidence rationale",
    patterns: [/Selected evidence rationale/],
  },
  {
    label: "phase 3.5 policy safety reminders",
    patterns: [/Policy and safety reminders/],
  },
  {
    label: "phase 3.6 customer-safe wording module label",
    patterns: [/Customer-safe wording module/],
  },
  {
    label: "phase 3.6 mock local response prep marker",
    patterns: [/Mock local response prep/],
  },
  {
    label: "phase 3.6 not sent not saved boundary",
    patterns: [/not sent, not saved, and not connected to any ticket, message, or external system/],
  },
  {
    label: "phase 3.6 selected evidence wording rationale",
    patterns: [/Internal-only rationale link/],
  },
  {
    label: "phase 3.6 support-safe guardrails",
    patterns: [/Support-safe guardrails/],
  },
  {
    label: "phase 3.6 rep review checklist",
    patterns: [/Rep review checklist/],
  },
  {
    label: "phase 3.6 no accusation guardrail",
    patterns: [/No accusation or wrongdoing confirmation/],
  },
  {
    label: "phase 3.6 no automated outcome guardrail",
    patterns: [/No automated denial, refund, or final decision language/],
  },
  {
    label: "external verification not performed",
    patterns: [/External Verification: Not performed/, /externalVerification: "Not performed"/],
  },
  {
    label: "verification status not externally verified",
    patterns: [/Verification Status: Not externally verified/, /verificationStatus: "Not externally verified"/],
  },
  {
    label: "unsupported no automated analysis result",
    patterns: [/No automated analysis result was produced for this evidence item/],
  },
  {
    label: "product-photo runtime non-live marker",
    patterns: [/productPhotoRuntimeLive: false/, /Product-photo runtime live/],
  },
  {
    label: "product-photo panel not routed marker",
    patterns: [/productPhotoReviewPanelRouted: false/, /ProductPhotoReviewPanel routed/],
  },
  {
    label: "no persistence or storage wording",
    patterns: [/No customer evidence is stored by this shell/],
  },
];

const forbiddenCaseCommandCenterImports = [
  "@/components/ClaimReviewWorkflow",
  "@/components/TestEvidenceHarness",
  "@/components/UploadPanel",
  "@/components/AnalysisReport",
  "@/components/AuthenticityResultCard",
  "@/components/ProductPhotoReviewPanel",
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/pre-analysis-evidence-gate-runtime",
  "@/lib/analysis/workflow-pre-analysis-gate-boundary",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/test-evidence",
  "@/lib/claim-data",
  "next/image",
];

const forbiddenCaseCommandCenterPatterns = [
  /analyzeEvidenceFile\s*\(/,
  /mapLocalAnalysisToReport/,
  /LocalAnalysisResult/,
  /MockAnalysisReport/,
  /<input[^>]*type=["']file["']/i,
  /<textarea\b/i,
  /<select\b/i,
  /createObjectURL/,
  /\bobjectUrl\b/,
  /\bimageUrl\b/,
  /\bdataUrl\b/,
  /\bBlob\b/,
  /\bfetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /rawOcr|ocrText/,
  /rawExif/,
  /rawMetadata/,
  /originalFilename/,
  /rawLabelValue/,
  /providerOutput|providerHandle|storageHandle|integrationHandle|caseQueueHandle/,
  /database|db\./i,
  /auth|billing|organization|tenant/i,
  /automatic\s+(?:adverse\s+)?(?:decision|outcome|disposition)/i,
  /deny this claim/i,
  /customer is lying/i,
];

for (const signal of requiredCaseCommandCenterSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(caseCommandCenterCorpus))) {
    failures.push(`Case command center check failed: missing ${signal.label}`);
  }
}

for (const importPath of forbiddenCaseCommandCenterImports) {
  if (caseCommandCenterCorpus.includes(importPath)) {
    failures.push(`Case command center boundary check failed: shell imports forbidden path ${importPath}`);
  }
}

for (const pattern of forbiddenCaseCommandCenterPatterns) {
  if (pattern.test(caseCommandCenterCorpus)) {
    failures.push(`Case command center privacy/import check failed: shell uses forbidden pattern ${pattern}`);
  }
}

if (
  [
    appPage,
    appLayout,
    testEvidenceHarness,
    claimReviewWorkflow,
    reportAdapter,
    analyzer,
    productPhotoReviewPanel,
  ].some((source) => source.includes("/case-command-center"))
) {
  failures.push("Case command center boundary check failed: route is linked from protected live files.");
}
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
const forbiddenProductPhotoAnalyzerImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/test-evidence",
  "@/components/",
  "@/lib/claim-data",
];
const forbiddenAnalyzerRoutingImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-classifier",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/analysis/product-photo-report-view-model",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/metadata-service",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/image-heuristics",
  "@/lib/test-evidence",
  "@/components/",
  "@/lib/claim-data",
];
const requiredProductPhotoAnalyzerSignals = [
  {
    label: "local heuristic analyzer status",
    patterns: [/PRODUCT_PHOTO_LOCAL_HEURISTIC_ANALYZER_STATUS/],
  },
  {
    label: "local heuristic analyzer entrypoint",
    patterns: [/analyzeProductPhotoEvidenceWithLocalHeuristics/],
  },
  {
    label: "local heuristic analyzer synthetic probe only flag",
    patterns: [/syntheticProbeOnly:\s*true/],
  },
  {
    label: "local heuristic analyzer manual-review-only flag",
    patterns: [/manualReviewOnly:\s*true/],
  },
  {
    label: "local heuristic analyzer runtime non-live flag",
    patterns: [/runtimeLive:\s*false/],
  },
  {
    label: "local heuristic analyzer does not require receipt-shaped result",
    patterns: [/localAnalysisResultRequired:\s*false/],
  },
  {
    label: "local heuristic analyzer analyzeEvidenceFile not invoked",
    patterns: [/analyzeEvidenceFileInvoked:\s*false/],
  },
  {
    label: "local heuristic analyzer analyzer routing not invoked",
    patterns: [/analyzerRoutingInvoked:\s*false/],
  },
  {
    label: "local heuristic analyzer UI/upload/report/scoring/parser/fixture paths not invoked",
    patterns: [/uiUploadReportScoringParserFixturePathsInvoked:\s*false/],
  },
  {
    label: "local heuristic analyzer provider/storage/integration/case queue paths not invoked",
    patterns: [/providersStorageIntegrationsCaseQueuesInvoked:\s*false/],
  },
];
const requiredProductPhotoAnalyzerProbeSignals = [
  {
    label: "analyzer probe active shape checks",
    patterns: [/assertProbeChecksPass\("shape", shapeChecks\)/],
  },
  {
    label: "analyzer probe active heuristic output checks",
    patterns: [/assertProbeChecksPass\("heuristic outputs", heuristicOutputChecks\)/],
  },
  {
    label: "analyzer probe active safety checks",
    patterns: [/assertProbeChecksPass\("safety", safetyChecks\)/],
  },
  {
    label: "analyzer probe active privacy checks",
    patterns: [/assertProbeChecksPass\("privacy", privacyChecks\)/],
  },
  {
    label: "analyzer probe active isolation checks",
    patterns: [/assertProbeChecksPass\("isolation", isolationChecks\)/],
  },
  {
    label: "analyzer probe complete context case",
    patterns: [/completeContextAnalyzerResult/],
  },
  {
    label: "analyzer probe missing wider view case",
    patterns: [/missingWiderViewAnalyzerResult/],
  },
  {
    label: "analyzer probe limited quality case",
    patterns: [/limitedQualityAnalyzerResult/],
  },
  {
    label: "analyzer probe very low quality case",
    patterns: [/veryLowQualityAnalyzerResult/, /veryLowQualityUsesPoorQualityBucket/],
  },
  {
    label: "analyzer probe missing product context with visible damage case",
    patterns: [/missingProductVisibleDamageAnalyzerResult/, /missingProductVisibleDamageRequestsProductContext/],
  },
  {
    label: "analyzer probe product context with incomplete damage case",
    patterns: [/productContextDamageIncompleteAnalyzerResult/, /productContextDamageIncompleteRequestsDamageCloseUp/],
  },
  {
    label: "analyzer probe limited metadata summary case",
    patterns: [/limitedMetadataAnalyzerResult/, /limitedMetadataRemainsContextOnly/],
  },
  {
    label: "analyzer probe unavailable metadata case",
    patterns: [/unavailableMetadataAnalyzerResult/],
  },
  {
    label: "analyzer probe serial label context case",
    patterns: [/serialLabelContextAnalyzerResult/],
  },
  {
    label: "analyzer probe caller-copy safety case",
    patterns: [/hostileInputAnalyzerResult/],
  },
  {
    label: "analyzer probe direct-boundary hostile narrative case",
    patterns: [/directBoundaryHostileNarrativeResult/],
  },
  {
    label: "analyzer probe direct-boundary narrative omission",
    patterns: [/directBoundaryHostileNarrativesOmitted/],
  },
  {
    label: "analyzer probe direct-boundary canonical summary",
    patterns: [/directBoundaryEvidenceSummaryCanonicalized/],
  },
  {
    label: "analyzer probe direct-boundary canonical support action",
    patterns: [/directBoundaryManualReviewActionCanonicalized/],
  },
  {
    label: "analyzer probe direct-boundary canonical customer copy",
    patterns: [/directBoundaryCustomerCopyCanonicalized/],
  },
  {
    label: "analyzer probe direct-boundary review-label canonicalization",
    patterns: [/directBoundaryReviewLabelCanonicalized/],
  },
  {
    label: "analyzer probe direct-boundary source-kind canonicalization",
    patterns: [/directBoundarySourceKindCanonicalized/],
  },
  {
    label: "analyzer probe direct-boundary structured override case",
    patterns: [/directBoundaryHostileStructuredOverrideResult/],
  },
  {
    label: "analyzer probe direct-boundary structured score derivation",
    patterns: [/directBoundaryStructuredScoreDerived/],
  },
  {
    label: "analyzer probe direct-boundary structured readiness derivation",
    patterns: [
      /directBoundaryStructuredSignalLevelDerived/,
      /directBoundaryStructuredReviewPriorityDerived/,
      /directBoundaryStructuredConfidenceDerived/,
    ],
  },
  {
    label: "analyzer probe confidence priority score separation",
    patterns: [/confidenceSeparateFromReviewPriority/, /scoreSeparateFromConfidence/, /confidenceIsReadinessNotFraudProbability/],
  },
  {
    label: "analyzer probe review priority triage separation",
    patterns: [/reviewPriorityIsTriageNotDecision/],
  },
  {
    label: "analyzer probe limitations recommendation separation",
    patterns: [/limitationsSeparateFromRecommendation/, /limitationsSeparateFromSignals/],
  },
  {
    label: "analyzer probe bucket-only metadata marker",
    patterns: [/metadataUsesBucketsNotExactDimensions/],
  },
  {
    label: "analyzer probe raw label sentinel omission",
    patterns: [/noRawLabelSentinelValues/],
  },
  {
    label: "analyzer probe privacy sentinel output sanitization",
    patterns: [
      /privacySentinelAnalyzerResult/,
      /rawFilenameEvidenceLabelNotPropagated/,
      /exactMetadataDimensionsOmitted/,
      /rawMetadataLabelAndQualitySentinelsOmitted/,
    ],
  },
  {
    label: "analyzer probe source import boundary markers",
    patterns: [/analyzerDoesNotImportLiveAnalyzer/, /analyzerDoesNotImportAnalyzerRouting/],
  },
  {
    label: "analyzer probe receipt preservation marker",
    patterns: [/receiptReportAdapterSignatureStillReceiptOnly/],
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
  phrasePattern("customer", "intent"),
  phrasePattern("customer", "wrongdoing"),
  phrasePattern("claim", "outcome"),
  phrasePattern("policy", "disposition"),
  phrasePattern("support", "policy", "decision"),
  phrasePattern("automatic", "decision"),
  phrasePattern("ai", "detected", "manipulation"),
  /\b(?:image|photo|evidence)\s+proves?\b/i,
];
const requiredProductPhotoReviewPanelSignals = [
  {
    label: "component type-only view-model import",
    patterns: [
      /import type \{ ProductPhotoReportViewModel \} from "@\/lib\/analysis\/product-photo-report-view-model";/,
    ],
  },
  {
    label: "component exact prop contract",
    patterns: [/type ProductPhotoReviewPanelProps = \{\s*viewModel: ProductPhotoReportViewModel;\s*\};/s],
  },
  {
    label: "component review snapshot section",
    patterns: [/Review snapshot/],
  },
  {
    label: "component separate priority",
    patterns: [/Review priority/],
  },
  {
    label: "component separate confidence",
    patterns: [/Confidence/],
  },
  {
    label: "component separate evidence quality",
    patterns: [/Evidence quality/],
  },
  {
    label: "component score local-only scope",
    patterns: [/viewModel\.score\.scope/],
  },
  {
    label: "component product/photo context section",
    patterns: [/Product\/photo context/],
  },
  {
    label: "component recommended action section",
    patterns: [/Recommended support action/],
  },
  {
    label: "component limitations section",
    patterns: [/Limitations/],
  },
  {
    label: "component review signals section",
    patterns: [/Review signals/],
  },
  {
    label: "component privacy posture section",
    patterns: [/Privacy posture/],
  },
  {
    label: "component external verification not performed",
    patterns: [/External Verification: \{viewModel\.externalVerification\.externalVerification\}/],
  },
];
const requiredProductPhotoReviewPanelProbeSignals = [
  {
    label: "panel probe exact props",
    patterns: [/propsExactlyViewModelOnly/],
  },
  {
    label: "panel probe forbidden props",
    patterns: [/propsDoNotAcceptClassNameCallbacksFilesBlobsUrlsOrRawResults/],
  },
  {
    label: "panel probe import boundary",
    patterns: [/componentImportsOnlyReactAndProductPhotoViewModel/],
  },
  {
    label: "panel probe live path import denial",
    patterns: [/componentDoesNotImportClaimReviewWorkflowUploadAnalyzerRoutingReportAdapterScoringParserFixtures/],
  },
  {
    label: "panel probe result type denial",
    patterns: [/componentDoesNotImportLocalAnalysisResultEvidenceAnalysisResultProductPhotoEvidenceAnalysisResultMockAnalysisReport/],
  },
  {
    label: "panel probe raw source denial",
    patterns: [/componentSourceDoesNotReferenceObjectUrlImageUrlDataUrlFileBlobRawExifRawMetadataOriginalFilenameRawLabelValue/],
  },
  {
    label: "panel probe required sections",
    patterns: [/missingContextCaseRendersRequiredSections/],
  },
  {
    label: "panel probe complete context case",
    patterns: [/completeContextCaseDoesNotRequestAdditionalViews/],
  },
  {
    label: "panel probe no requested views",
    patterns: [/noRequestedViewsCaseRendersEmptyOrNeutralAdditionalViewsState/],
  },
  {
    label: "panel probe multiple requested views",
    patterns: [/multipleRequestedViewsCaseRendersAllDerivedLabels/],
  },
  {
    label: "panel probe score-band cases",
    patterns: [/lowMediumHighScoreCasesKeepScoreLocalOnlyAndNotProof/],
  },
  {
    label: "panel probe separated concepts",
    patterns: [/priorityConfidenceEvidenceQualityRemainSeparateFromScore/],
  },
  {
    label: "panel probe external verification",
    patterns: [/externalVerificationAlwaysNotPerformed/],
  },
  {
    label: "panel probe manual review action",
    patterns: [/manualReviewOnlyRecommendedAction/],
  },
  {
    label: "panel probe limitations",
    patterns: [/limitationsIncludeLocalOnlyExternalVerificationNotPerformedHighScoreNotProofMetadataContextOnly/],
  },
  {
    label: "panel probe signal rows",
    patterns: [/reviewSignalsRenderLabelCategorySeverityConfidenceReviewNoteAndRecommendedStep/],
  },
  {
    label: "panel probe privacy posture",
    patterns: [/privacyPostureShowsDerivedSummaryOnlyAndExcludedRawFields/],
  },
  {
    label: "panel probe sentinel private values",
    patterns: [/sentinelPrivateValuesAbsent/],
  },
  {
    label: "panel probe recursive private keys",
    patterns: [/forbiddenPrivateKeyPathsAbsent/],
  },
  {
    label: "panel probe customer-safe wording internals",
    patterns: [/customerSafeWordingDoesNotExposeScoreConfidencePriorityOrVerificationInternals/],
  },
  {
    label: "panel probe unsafe copy denial",
    patterns: [/renderableCopyAvoidsUnsafeOutcomeProofVerificationAccusationLanguage/],
  },
  {
    label: "panel probe receipt adapter preservation",
    patterns: [/receiptReportAdapterSignatureStillReceiptOnly/],
  },
  {
    label: "panel probe ClaimReviewWorkflow unwired",
    patterns: [/claimReviewWorkflowSourceDoesNotImportProductPhotoReviewPanel/],
  },
];
const forbiddenProductPhotoReviewPanelImports = [
  "@/components/ClaimReviewWorkflow",
  "@/components/AnalysisReport",
  "@/components/AuthenticityResultCard",
  "@/components/RiskScoreCard",
  "@/components/UploadPanel",
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/test-evidence",
  "@/lib/claim-data",
];
const forbiddenProductPhotoReviewPanelPatterns = [
  /LocalAnalysisResult/,
  /EvidenceAnalysisResult/,
  /ProductPhotoEvidenceAnalysisResult/,
  /MockAnalysisReport/,
  /ProductPhotoEvidenceAnalysisResultInput/,
  /createObjectURL/,
  /\bobjectUrl\b/,
  /\bimageUrl\b/,
  /\bdataUrl\b/,
  /\bnew\s+File\b/,
  /\bBlob\b/,
  /rawExif/,
  /rawMetadata/,
  /originalFilename/,
  /rawLabelValue/,
  /moduleDetails/,
  /privacySafeMetadataSummary/,
  /\.\.\.\s*(?:viewModel|result|details|metadataSummary)/,
];
const productPhotoHostCorpus = `${productPhotoReviewPanelHostPage}\n${productPhotoReviewPanelRenderCases}`;
const requiredProductPhotoHostPageSignals = [
  {
    label: "host imports notFound production guard",
    patterns: [/import \{ notFound \} from "next\/navigation";/],
  },
  {
    label: "host imports isolated panel",
    patterns: [/import \{ ProductPhotoReviewPanel \} from "@\/components\/ProductPhotoReviewPanel";/],
  },
  {
    label: "host imports colocated render cases",
    patterns: [/import \{ productPhotoReviewPanelRenderCases \} from "\.\/render-cases";/],
  },
  {
    label: "host production-disabled by default",
    patterns: [/process\.env\.NODE_ENV !== "production"/],
  },
  {
    label: "host returns notFound when disabled",
    patterns: [/notFound\(\)/],
  },
  {
    label: "host synthetic non-live visible label",
    patterns: [/Synthetic non-live visual QA surface/],
  },
  {
    label: "host manual review visible label",
    patterns: [/Manual review only/],
  },
];
const requiredProductPhotoRenderCaseSignals = [
  {
    label: "render cases type-only view-model import",
    patterns: [
      /import type \{ ProductPhotoReportViewModel \} from "@\/lib\/analysis\/product-photo-report-view-model";/,
    ],
  },
  {
    label: "render cases use satisfies ProductPhotoReportViewModel",
    patterns: [/satisfies readonly ProductPhotoReportViewModel\[\]/],
  },
  {
    label: "render cases low-confidence case",
    patterns: [/confidence:\s*"Low confidence"/],
  },
  {
    label: "render cases medium review-priority case",
    patterns: [/reviewPriority:\s*"Review"/],
  },
  {
    label: "render cases stronger manual-review case",
    patterns: [/Stronger product-photo context, still manual review/],
  },
  {
    label: "render cases external verification not performed",
    patterns: [/externalVerification:\s*"Not performed"/],
  },
  {
    label: "render cases runtime remains non-live",
    patterns: [/runtimeLive:\s*false/],
  },
  {
    label: "render cases analyzeEvidenceFile not invoked",
    patterns: [/analyzeEvidenceFileInvoked:\s*false/],
  },
  {
    label: "render cases analyzer routing not invoked",
    patterns: [/analyzerRoutingInvoked:\s*false/],
  },
  {
    label: "render cases upload/report/scoring/parser/fixture paths not invoked",
    patterns: [/uiUploadReportScoringParserFixturePathsInvoked:\s*false/],
  },
];
const forbiddenProductPhotoHostImports = [
  "@/components/ClaimReviewWorkflow",
  "@/components/TestEvidenceHarness",
  "@/components/AnalysisReport",
  "@/components/AuthenticityResultCard",
  "@/components/RiskScoreCard",
  "@/components/UploadPanel",
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/test-evidence",
  "@/lib/claim-data",
  "next/image",
];
const forbiddenProductPhotoHostPatterns = [
  /mapProductPhotoAnalysisToReportViewModel/,
  /prepareProductPhotoEvidenceAnalysisResultForDevOnlyBoundary/,
  /ProductPhotoReviewPanel\.probe/,
  /LocalAnalysisResult/,
  /EvidenceAnalysisResult/,
  /ProductPhotoEvidenceAnalysisResult/,
  /MockAnalysisReport/,
  /<img\b/i,
  /createObjectURL/,
  /\bobjectUrl\b/,
  /\bimageUrl\b/,
  /\bdataUrl\b/,
  /\bFile\b/,
  /\bBlob\b/,
  /\bfetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /routeParams|searchParams/,
  /\bDate\b/,
  /lastModified/,
  /latitude|longitude|\bgps\b/i,
  /providerPayload|providerHandle(?!Included)|storageHandle(?!Included)|integrationHandle(?!Included)|caseQueueHandle(?!Included)/,
  /moduleDetails/,
  /privacySafeMetadataSummary/,
  /\.\.\.\s*(?:viewModel|result|details|metadataSummary|caseData)/,
  /https?:\/\//i,
  /[A-Za-z]:\\/,
  /\b(?:case|claim|ticket|evidence|provider|storage|integration)[-_ ]?id\b/i,
  /\border\s*(?:number|id|#)\b/i,
  /\b[A-Z]{2,}-\d{3,}\b/,
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

for (const importPath of forbiddenProductPhotoAnalyzerImports) {
  const doubleQuotedImport = `from "${importPath}"`;
  const singleQuotedImport = `from '${importPath}'`;

  if (productPhotoAnalyzer.includes(doubleQuotedImport) || productPhotoAnalyzer.includes(singleQuotedImport)) {
    failures.push(`Product-photo analyzer boundary check failed: analyzer imports forbidden path ${importPath}`);
  }
}

if (/LocalAnalysisResult/.test(productPhotoAnalyzer) || /LocalAnalysisResult/.test(productPhotoAnalyzerProbe)) {
  failures.push("Product-photo analyzer boundary check failed: analyzer slice depends on LocalAnalysisResult.");
}

if (/\bFile\b|\bBlob\b|createObjectURL|\bobjectUrl\b|\bimageUrl\b|\bdataUrl\b/i.test(productPhotoAnalyzer)) {
  failures.push("Product-photo analyzer privacy check failed: analyzer references file/blob/object-url/image-url data.");
}

if (
  /rawMetadata|originalFilename(?!Omitted)|rawLabelValue|providerOutput|storageHandle|integrationHandle|caseQueueHandle/.test(
    productPhotoAnalyzer,
  )
) {
  failures.push("Product-photo analyzer privacy check failed: analyzer references forbidden raw/private output fields.");
}

const forbiddenProductPhotoAnalyzerOverridePatterns = [
  /const\s+score\s*=\s*clampProductPhotoScore\(input\.score/,
  /score:\s*input\.score/,
  /evidenceReliabilityScore:\s*\{[\s\S]*value:\s*input\.score/,
  /localSignalLevel:\s*input\.localSignalLevel/,
  /reviewPriority:\s*input\.reviewPriority/,
  /confidenceLevel:\s*input\.confidenceLevel/,
  /reviewLabel:\s*input\.reviewLabel/,
  /evidenceSummary:\s*input\.evidenceSummary/,
  /recommendedSupportAction:\s*input\.recommendedSupportAction/,
  /customerSafeWording:\s*input\.customerSafeWording/,
  /sourceKind:\s*input\.sourceKind/,
];

for (const pattern of forbiddenProductPhotoAnalyzerOverridePatterns) {
  if (pattern.test(productPhotoAnalyzer)) {
    failures.push(`Product-photo analyzer raw-result override check failed: direct caller override is propagated: ${pattern}`);
  }
}

for (const signal of requiredProductPhotoAnalyzerSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoAnalyzer))) {
    failures.push(`Product-photo analyzer boundary check failed: missing ${signal.label}`);
  }
}

for (const signal of requiredProductPhotoAnalyzerProbeSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoAnalyzerProbe))) {
    failures.push(`Product-photo analyzer probe check failed: missing ${signal.label}`);
  }
}

if (!/PRODUCT_PHOTO_HEURISTICS_DEVELOPER_PROBE/.test(productPhotoHeuristicsProbe)) {
  failures.push("Product-photo heuristics probe check failed: heuristics probe is missing from semantic coverage.");
}

if (!/PRODUCT_PHOTO_RECOGNITION_DEVELOPER_PROBE/.test(productPhotoRecognitionProbe)) {
  failures.push("Product-photo recognition probe check failed: recognition probe is missing from semantic coverage.");
}

if (!/PRODUCT_PHOTO_ROUTING_ADAPTER_DEVELOPER_PROBE/.test(productPhotoRoutingAdapterProbe)) {
  failures.push("Product-photo routing-adapter probe check failed: routing-adapter probe is missing from semantic coverage.");
}

const requiredProductPhotoRoutingAdapterSignals = [
  {
    label: "routing adapter active assertions",
    patterns: [/assertProbeChecksPass\("routing", routingChecks\)/],
  },
  {
    label: "routing adapter legacy damage-photo quarantine",
    patterns: [/legacyDamagePhotoQuarantined/, /legacy damage-photo compatibility alias is quarantined/],
  },
];

for (const signal of requiredProductPhotoRoutingAdapterSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoRoutingAdapterProbe))) {
    failures.push(`Product-photo routing-adapter probe check failed: missing ${signal.label}`);
  }
}

const requiredProductPhotoAdapterReadinessSignals = [
  {
    label: "adapter readiness probe export",
    patterns: [/PRODUCT_PHOTO_ADAPTER_READINESS_DEVELOPER_PROBE/],
  },
  {
    label: "adapter readiness active type checks",
    patterns: [/assertProbeChecksPass\("types", typeChecks\)/],
  },
  {
    label: "adapter readiness active shape checks",
    patterns: [/assertProbeChecksPass\("shape", shapeChecks\)/],
  },
  {
    label: "adapter readiness active canonicalization checks",
    patterns: [/assertProbeChecksPass\("canonicalization", canonicalizationChecks\)/],
  },
  {
    label: "adapter readiness active quarantine checks",
    patterns: [/assertProbeChecksPass\("quarantine", quarantineChecks\)/],
  },
  {
    label: "adapter readiness active privacy checks",
    patterns: [/assertProbeChecksPass\("privacy", privacyChecks\)/],
  },
  {
    label: "adapter readiness active wording checks",
    patterns: [/assertProbeChecksPass\("wording", wordingChecks\)/],
  },
  {
    label: "adapter readiness active source-boundary checks",
    patterns: [/assertProbeChecksPass\("source boundaries", sourceBoundaryChecks\)/],
  },
  {
    label: "adapter readiness legacy damage-photo quarantine case",
    patterns: [/legacyDamagePhotoQuarantineResult/, /damagePhotoReadinessRejected/],
  },
  {
    label: "adapter readiness nested report-view-model damage-photo quarantine case",
    patterns: [/hostileNestedDamagePhotoReportViewModelQuarantineResult/, /hostileNestedDamagePhotoReportViewModelQuarantined/],
  },
  {
    label: "adapter readiness top-level mismatch quarantine cases",
    patterns: [/topLevelEvidenceTypeMismatches/, /topLevelAnalysisEvidenceTypeMismatchesCollapsed/],
  },
  {
    label: "adapter readiness report-view-model mismatch case",
    patterns: [/topLevelReportViewModelEvidenceTypeMismatchesCollapsed/, /topLevelReceiptViewModelMismatchResult/],
  },
  {
    label: "adapter readiness raw/private sentinel omission",
    patterns: [/forbiddenPrivateSentinelValues/, /hostileOutputOmitsPrivateSentinels/],
  },
  {
    label: "adapter readiness no LocalAnalysisResult dependency marker",
    patterns: [/adapterOutputHasNoReceiptOnlyKeys/, /localAnalysisResultRequired:\s*false/],
  },
  {
    label: "adapter readiness non-live marker",
    patterns: [/runtimeLive:\s*false/, /runtimeStaysNonLive/],
  },
];

for (const signal of requiredProductPhotoAdapterReadinessSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoAdapterReadinessProbe))) {
    failures.push(`Product-photo adapter readiness probe check failed: missing ${signal.label}`);
  }
}

const requiredProductPhotoProbeRunnerSignals = [
  /ANALYZER_CLASSIFIER_QUARANTINE_DEVELOPER_PROBE/,
  /ANALYZER_ROUTING_GUARD_DEVELOPER_PROBE/,
  /PRODUCT_PHOTO_HEURISTICS_DEVELOPER_PROBE/,
  /PRODUCT_PHOTO_RESULT_BOUNDARY_DEVELOPER_PROBE/,
  /SHARED_RESULT_DEVELOPER_PROBE/,
  /PRODUCT_PHOTO_RECOGNITION_DEVELOPER_PROBE/,
  /PRODUCT_PHOTO_ROUTING_ADAPTER_DEVELOPER_PROBE/,
  /PRODUCT_PHOTO_ADAPTER_READINESS_DEVELOPER_PROBE/,
  /PRODUCT_PHOTO_ANALYZER_DEVELOPER_PROBE/,
  /PRODUCT_PHOTO_REPORT_VIEW_MODEL_DEVELOPER_PROBE/,
  /PRE_ANALYSIS_EVIDENCE_GATE_DEVELOPER_PROBE/,
  /UNSUPPORTED_EVIDENCE_REVIEW_STATE_DEVELOPER_PROBE/,
];

if (!/"check:product-photo-probes"\s*:\s*"node scripts\/run-product-photo-probes\.cjs"/.test(packageJson)) {
  failures.push("Product-photo probe execution check failed: package script is missing.");
}

for (const pattern of requiredProductPhotoProbeRunnerSignals) {
  if (!pattern.test(productPhotoProbeRunner)) {
    failures.push(`Product-photo probe execution check failed: runner does not import ${pattern}.`);
  }
}

const requiredAnalyzerClassifierQuarantineSignals = [
  {
    label: "classifier quarantine marker",
    patterns: [/LEGACY_DAMAGE_PHOTO_CLASSIFIER_QUARANTINE/],
  },
  {
    label: "classifier quarantine collapse target",
    patterns: [/collapseTarget:\s*"receipt"/],
  },
  {
    label: "classifier product-photo runtime non-live marker",
    patterns: [/productPhotoRuntimeLive:\s*false/],
  },
  {
    label: "classifier damage-photo non-canonical marker",
    patterns: [/damagePhotoCanonicalRuntime:\s*false/],
  },
  {
    label: "classifier analyzeEvidenceFile product-photo runtime marker",
    patterns: [/analyzeEvidenceFileProductPhotoRuntime:\s*false/],
  },
  {
    label: "classifier active probe export",
    patterns: [/ANALYZER_CLASSIFIER_QUARANTINE_DEVELOPER_PROBE/],
  },
  {
    label: "classifier active probe assertion",
    patterns: [/assertProbeChecksPass\("classifier quarantine", classifierQuarantineChecks\)/],
  },
  {
    label: "legacy filename cues collapse to receipt",
    patterns: [/legacyDamagePhotoFilenameCuesCollapseToReceipt/],
  },
  {
    label: "legacy filename cues do not return damage-photo",
    patterns: [/legacyDamagePhotoFilenameCuesNeverReturnDamagePhoto/],
  },
  {
    label: "legacy filename cues do not return product-photo",
    patterns: [/legacyDamagePhotoFilenameCuesNeverReturnProductPhoto/],
  },
];

for (const signal of requiredAnalyzerClassifierQuarantineSignals) {
  const classifierCorpus = `${analyzerClassifier}\n${analyzerClassifierProbe}`;
  if (!signal.patterns.some((pattern) => pattern.test(classifierCorpus))) {
    failures.push(`Analyzer classifier quarantine check failed: missing ${signal.label}`);
  }
}

if (/return\s+"damage-photo"/.test(`${analyzer}\n${analyzerClassifier}`)) {
  failures.push("Analyzer classifier quarantine check failed: live classifier still returns damage-photo.");
}

if (!/ENABLE_PRODUCT_PHOTO_RUNTIME_ROUTING(?::\s*boolean)?\s*=\s*false/.test(analyzerRouting)) {
  failures.push("Analyzer routing guard check failed: product-photo runtime routing flag is not false.");
}

if (!/ANALYZER_ROUTING_GUARD_DEVELOPER_PROBE/.test(analyzerRoutingProbe)) {
  failures.push("Analyzer routing guard check failed: routing guard probe is missing from semantic coverage.");
}

for (const importPath of forbiddenAnalyzerRoutingImports) {
  const doubleQuotedImport = `from "${importPath}"`;
  const singleQuotedImport = `from '${importPath}'`;

  if (analyzerRouting.includes(doubleQuotedImport) || analyzerRouting.includes(singleQuotedImport)) {
    failures.push(`Analyzer routing guard check failed: analyzer-routing imports forbidden path ${importPath}`);
  }
}

const productPhotoRecognitionAndRoutingCorpus = [
  productPhotoRecognition,
  productPhotoRecognitionProbe,
  productPhotoRoutingAdapter,
  productPhotoRoutingAdapterProbe,
].join("\n");
const forbiddenProductPhotoRecognitionRoutingPrivacyPatterns = [
  /objectUrl|imageUrl|dataUrl|fileBytes|imageBuffer|rawExif(?!Omitted)|rawMetadata|originalFilename(?!Omitted)/,
  /rawLabelValue|rawSerialOrModelText|providerOutput|storageHandle|integrationHandle|caseQueueHandle/,
  /caseQueue|storageId|integrationId|providerHandle/,
];

for (const pattern of forbiddenProductPhotoRecognitionRoutingPrivacyPatterns) {
  if (pattern.test(productPhotoRecognitionAndRoutingCorpus)) {
    failures.push(`Product-photo recognition/routing privacy check failed: forbidden pattern ${pattern}`);
  }
}

if (/damage-photo/i.test(`${productPhotoAnalyzer}\n${productPhotoReportViewModel}`)) {
  failures.push("Product-photo canonical boundary check failed: canonical analyzer/report model references legacy damage-photo.");
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

for (const signal of requiredProductPhotoReviewPanelSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoReviewPanel))) {
    failures.push(`Product-photo review panel check failed: missing ${signal.label}`);
  }
}

for (const signal of requiredProductPhotoReviewPanelProbeSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoReviewPanelProbe))) {
    failures.push(`Product-photo review panel probe check failed: missing ${signal.label}`);
  }
}

for (const importPath of forbiddenProductPhotoReviewPanelImports) {
  if (productPhotoReviewPanel.includes(importPath)) {
    failures.push(`Product-photo review panel boundary check failed: component imports forbidden path ${importPath}`);
  }
}

for (const pattern of forbiddenProductPhotoReviewPanelPatterns) {
  if (pattern.test(productPhotoReviewPanel)) {
    failures.push(`Product-photo review panel boundary check failed: component uses forbidden pattern ${pattern}`);
  }
}

for (const signal of requiredProductPhotoHostPageSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoReviewPanelHostPage))) {
    failures.push(`Product-photo visual host check failed: missing ${signal.label}`);
  }
}

for (const signal of requiredProductPhotoRenderCaseSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(productPhotoReviewPanelRenderCases))) {
    failures.push(`Product-photo visual host render-case check failed: missing ${signal.label}`);
  }
}

for (const importPath of forbiddenProductPhotoHostImports) {
  if (productPhotoHostCorpus.includes(importPath)) {
    failures.push(`Product-photo visual host boundary check failed: host imports forbidden path ${importPath}`);
  }
}

for (const pattern of forbiddenProductPhotoHostPatterns) {
  if (pattern.test(productPhotoHostCorpus)) {
    failures.push(`Product-photo visual host privacy/import check failed: host uses forbidden pattern ${pattern}`);
  }
}

if (!/rawPhotoBytesIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: raw photo bytes must be explicitly omitted.");
}

if (!/imageBufferIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: image buffers must be explicitly omitted.");
}

if (!/rawExifIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: raw EXIF must be explicitly omitted.");
}

if (!/rawMetadataIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: raw metadata must be explicitly omitted.");
}

if (!/originalFilenameIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: original filenames must be explicitly omitted.");
}

if (!/rawLabelValueIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: raw label values must be explicitly omitted.");
}

if (!/providerOutputIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: provider output must be explicitly omitted.");
}

if (!/storageHandleIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: storage handles must be explicitly omitted.");
}

if (!/integrationHandleIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: integration handles must be explicitly omitted.");
}

if (!/caseQueueHandleIncluded:\s*false/.test(productPhotoReviewPanelRenderCases)) {
  failures.push("Product-photo visual host privacy check failed: case queue handles must be explicitly omitted.");
}

if (
  [
    appPage,
    appLayout,
    testEvidenceHarness,
    claimReviewWorkflow,
    reportAdapter,
  ].some((source) => source.includes("/dev/product-photo-review-panel") || source.includes("render-cases"))
) {
  failures.push("Product-photo visual host boundary check failed: host route or render cases are linked from live app files.");
}

if (claimReviewWorkflow.includes("ProductPhotoReviewPanel")) {
  failures.push("Product-photo review panel boundary check failed: ClaimReviewWorkflow imports or references the isolated panel.");
}

if (reportAdapter.includes("product-photo-report-view-model") || reportAdapter.includes("mapProductPhotoAnalysisToReportViewModel")) {
  failures.push("Product-photo report mapping boundary check failed: receipt report adapter imports product-photo mapper.");
}

if (!reportAdapter.includes("mapLocalAnalysisToReport(result: LocalAnalysisResult)")) {
  failures.push("Product-photo report mapping boundary check failed: receipt report adapter signature changed.");
}

const preAnalysisEvidenceGate = fileContents.get("src/lib/analysis/pre-analysis-evidence-gate.ts") ?? "";
const preAnalysisEvidenceGateProbe =
  fileContents.get("src/lib/analysis/pre-analysis-evidence-gate.probe.ts") ?? "";
const preAnalysisEvidenceGateRuntime =
  fileContents.get("src/lib/analysis/pre-analysis-evidence-gate-runtime.ts") ?? "";
const preAnalysisEvidenceGateRuntimeProbe =
  fileContents.get("src/lib/analysis/pre-analysis-evidence-gate-runtime.probe.ts") ?? "";
const unsupportedEvidenceRuntimeResultBuilder =
  preAnalysisEvidenceGateRuntime.match(
    /function unsupportedEvidenceResultFor[\s\S]*?\n}\r?\n\r?\nexport async function analyzeEvidenceFileWithPreAnalysisGate/,
  )?.[0] ?? "";

const requiredPreAnalysisEvidenceGateSignals = [
  {
    label: "gate boundary status marker",
    patterns: [/PRE_ANALYSIS_EVIDENCE_GATE_STATUS/],
  },
  {
    label: "gate decision builder",
    patterns: [/buildPreAnalysisEvidenceGateDecision/],
  },
  {
    label: "gate runtime non-live marker",
    patterns: [/runtimeLive: false/],
  },
  {
    label: "gate manual-review-only marker",
    patterns: [/manualReviewOnly: true/],
  },
  {
    label: "gate no OCR processing marker",
    patterns: [/ocrInvoked: false/],
  },
  {
    label: "gate no metadata processing marker",
    patterns: [/metadataInvoked: false/],
  },
  {
    label: "gate no analyzer/adapter coupling markers",
    patterns: [/analyzerInvoked: false/],
  },
  {
    label: "gate no adapter coupling marker",
    patterns: [/adapterInvoked: false/],
  },
  {
    label: "gate no upload/UI/report/scoring/parser/fixture coupling marker",
    patterns: [/uiUploadReportScoringParserFixturePathsInvoked: false/],
  },
  {
    label: "gate no provider/storage/integration/case-queue coupling marker",
    patterns: [/providersStorageIntegrationsCaseQueuesInvoked: false/],
  },
  {
    label: "gate product-photo runtime non-live marker",
    patterns: [/productPhotoRuntimeLive: false/],
  },
  {
    label: "gate allow-receipt-default-path outcome",
    patterns: [/"allow-receipt-default-path"/],
  },
  {
    label: "gate unsupported-evidence outcome",
    patterns: [/"unsupported-evidence"/],
  },
  {
    label: "gate legacy-damage-photo-quarantine outcome",
    patterns: [/"legacy-damage-photo-quarantine"/],
  },
  {
    label: "gate product-photo-like-unsupported outcome",
    patterns: [/"product-photo-like-unsupported"/],
  },
  {
    label: "gate unknown-inconclusive outcome",
    patterns: [/"unknown-inconclusive"/],
  },
];

for (const signal of requiredPreAnalysisEvidenceGateSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(preAnalysisEvidenceGate))) {
    failures.push(`Pre-analysis evidence gate check failed: missing ${signal.label}`);
  }
}

const forbiddenPreAnalysisEvidenceGateImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/analyzer-classifier",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/metadata-service",
  "@/lib/analysis/image-heuristics",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/analysis/product-photo-report-view-model",
  "@/lib/test-evidence",
  "@/components/",
  "@/lib/claim-data",
];

for (const importPath of forbiddenPreAnalysisEvidenceGateImports) {
  const doubleQuotedImport = `from "${importPath}"`;
  const singleQuotedImport = `from '${importPath}'`;

  if (
    preAnalysisEvidenceGate.includes(doubleQuotedImport) ||
    preAnalysisEvidenceGate.includes(singleQuotedImport)
  ) {
    failures.push(`Pre-analysis evidence gate boundary check failed: gate imports forbidden path ${importPath}`);
  }
}

if (/analyzeEvidenceFile|LocalAnalysisResult/.test(preAnalysisEvidenceGate)) {
  failures.push(
    "Pre-analysis evidence gate boundary check failed: gate references analyzeEvidenceFile or LocalAnalysisResult.",
  );
}

if (
  /createObjectURL|\bobjectUrl\b|\bimageBuffer\b|\bfileBytes\b|rawExif|rawMetadata|originalFilename(?!Hint)/.test(
    preAnalysisEvidenceGate,
  )
) {
  failures.push("Pre-analysis evidence gate privacy check failed: gate references raw file/metadata surfaces.");
}

if (/return\s+"damage-photo"|evidenceType:\s*"damage-photo"/.test(preAnalysisEvidenceGate)) {
  failures.push(
    "Pre-analysis evidence gate check failed: gate leaks canonical damage-photo runtime evidence type.",
  );
}

const requiredPreAnalysisEvidenceGateProbeSignals = [
  {
    label: "gate probe export",
    patterns: [/PRE_ANALYSIS_EVIDENCE_GATE_DEVELOPER_PROBE/],
  },
  {
    label: "gate probe active outcome assertions",
    patterns: [/assertProbeChecksPass\("outcomes", outcomeChecks\)/],
  },
  {
    label: "gate probe active marker assertions",
    patterns: [/assertProbeChecksPass\("markers", markerChecks\)/],
  },
  {
    label: "gate probe active legacy assertions",
    patterns: [/assertProbeChecksPass\("legacy", legacyChecks\)/],
  },
  {
    label: "gate probe active privacy assertions",
    patterns: [/assertProbeChecksPass\("privacy", privacyChecks\)/],
  },
  {
    label: "gate probe active wording assertions",
    patterns: [/assertProbeChecksPass\("wording", wordingChecks\)/],
  },
  {
    label: "gate probe active source-boundary assertions",
    patterns: [/assertProbeChecksPass\("source boundaries", sourceBoundaryChecks\)/],
  },
  {
    label: "gate probe raw filename leak check",
    patterns: [/rawFilenameSentinelNotLeaked/],
  },
];

for (const signal of requiredPreAnalysisEvidenceGateProbeSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(preAnalysisEvidenceGateProbe))) {
    failures.push(`Pre-analysis evidence gate probe check failed: missing ${signal.label}`);
  }
}

const requiredPreAnalysisEvidenceGateRuntimeSignals = [
  {
    label: "runtime wrapper status marker",
    patterns: [/PRE_ANALYSIS_EVIDENCE_GATE_RUNTIME_STATUS/],
  },
  {
    label: "runtime wrapper entrypoint",
    patterns: [/analyzeEvidenceFileWithPreAnalysisGate/],
  },
  {
    label: "runtime wrapper file-to-hints adapter",
    patterns: [/buildPreAnalysisEvidenceGateHintsFromFile/],
  },
  {
    label: "runtime wrapper default-off flag",
    patterns: [/ENABLE_PRE_ANALYSIS_EVIDENCE_GATE_RUNTIME_GUARD:\s*boolean\s*=\s*false/],
  },
  {
    label: "runtime wrapper additive unsupported result",
    patterns: [/export type UnsupportedEvidenceResult/],
  },
  {
    label: "runtime wrapper local result union",
    patterns: [/export type PreAnalysisGateRuntimeResult/],
  },
  {
    label: "runtime wrapper explicit manual-review-only marker",
    patterns: [/manualReviewOnly: true/],
  },
  {
    label: "runtime wrapper explicit runtime non-live marker",
    patterns: [/runtimeLive: false/],
  },
  {
    label: "runtime wrapper explicit no OCR marker",
    patterns: [/ocrInvoked: false/],
  },
  {
    label: "runtime wrapper explicit no metadata marker",
    patterns: [/metadataInvoked: false/],
  },
];

for (const signal of requiredPreAnalysisEvidenceGateRuntimeSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(preAnalysisEvidenceGateRuntime))) {
    failures.push(`Pre-analysis gate runtime wrapper check failed: missing ${signal.label}`);
  }
}

const allowedPreAnalysisRuntimeImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/pre-analysis-evidence-gate",
  "@/lib/analysis/types",
];
const forbiddenPreAnalysisRuntimeImports = [
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/metadata-service",
  "@/lib/analysis/image-heuristics",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/analysis/product-photo-report-view-model",
  "@/lib/test-evidence",
  "@/components/",
  "@/lib/claim-data",
];

for (const importPath of forbiddenPreAnalysisRuntimeImports) {
  if (preAnalysisEvidenceGateRuntime.includes(importPath)) {
    failures.push(`Pre-analysis gate runtime wrapper boundary check failed: wrapper imports forbidden path ${importPath}`);
  }
}

if (!allowedPreAnalysisRuntimeImports.every((importPath) => preAnalysisEvidenceGateRuntime.includes(importPath))) {
  failures.push("Pre-analysis gate runtime wrapper boundary check failed: expected narrow analyzer/gate/type imports are missing.");
}

if (
  /arrayBuffer\s*\(|stream\s*\(|createObjectURL|\bobjectUrl\b|\bimageUrl\b|\bdataUrl\b|rawExif|rawMetadata|lastModified/.test(
    preAnalysisEvidenceGateRuntime,
  )
) {
  failures.push("Pre-analysis gate runtime wrapper privacy check failed: wrapper references raw file/metadata surfaces.");
}

if (/"score"\s*:|"riskLevel"\s*:|"riskBand"\s*:|"verificationStatus"\s*:|"externalVerification"\s*:/.test(
  preAnalysisEvidenceGateRuntime,
)) {
  failures.push("Pre-analysis gate runtime wrapper result check failed: unsupported result includes blocked scoring, risk, or status fields.");
}

if (unsupportedEvidenceRuntimeResultBuilder.length === 0) {
  failures.push("Pre-analysis gate runtime wrapper wording check failed: unsupported result builder was not found.");
}

const forbiddenUnsupportedRuntimeOutputProsePatterns = [
  new RegExp(["pr", "oof"].join(""), "i"),
  new RegExp(["ver", "ification"].join(""), "i"),
  phrasePattern("receipt", "score"),
  /product-photo\s+report/i,
  new RegExp(["product", "Photo", "Report"].join(""), "i"),
  phrasePattern("final", "outcome"),
  new RegExp(["app", "roved"].join(""), "i"),
  new RegExp(["rej", "ected"].join(""), "i"),
  new RegExp(["fa", "ke"].join(""), "i"),
  phrasePattern("fraud", "confirmed"),
  phrasePattern("manipulation", "confirmed"),
  phrasePattern("confirmed", "fraud"),
];

for (const pattern of forbiddenUnsupportedRuntimeOutputProsePatterns) {
  if (pattern.test(unsupportedEvidenceRuntimeResultBuilder)) {
    failures.push(`Pre-analysis gate runtime wrapper wording check failed: forbidden unsupported-output prose found: ${pattern}`);
  }
}

if (
  [appPage, appLayout, testEvidenceHarness, claimReviewWorkflow, reportAdapter].some((source) =>
    source.includes("pre-analysis-evidence-gate-runtime"),
  )
) {
  failures.push("Pre-analysis gate runtime wrapper boundary check failed: wrapper is imported by live app/report files.");
}

const requiredPreAnalysisRuntimeProbeSignals = [
  {
    label: "runtime probe export",
    patterns: [/PRE_ANALYSIS_EVIDENCE_GATE_RUNTIME_DEVELOPER_PROBE/],
  },
  {
    label: "runtime probe default-off assertions",
    patterns: [/assertProbeChecksPass\("default-off", defaultOffChecks\)/],
  },
  {
    label: "runtime probe allow-path assertions",
    patterns: [/assertProbeChecksPass\("allow path", allowPathChecks\)/],
  },
  {
    label: "runtime probe non-allow assertions",
    patterns: [/assertProbeChecksPass\("non-allow path", nonAllowChecks\)/],
  },
  {
    label: "runtime probe unsupported-shape assertions",
    patterns: [/assertProbeChecksPass\("unsupported shape", unsupportedShapeChecks\)/],
  },
  {
    label: "runtime probe unsupported-output prose assertions",
    patterns: [/assertProbeChecksPass\("unsupported prose", unsupportedProseChecks\)/],
  },
  {
    label: "runtime probe forbidden unsupported-output prose helper",
    patterns: [/unsupportedOutputOmitsForbiddenOutputProse/],
  },
  {
    label: "runtime probe source-boundary assertions",
    patterns: [/assertProbeChecksPass\("source boundaries", sourceBoundaryChecks\)/],
  },
  {
    label: "runtime probe private sentinel check",
    patterns: [/privateFilenameSentinel/],
  },
];

for (const signal of requiredPreAnalysisRuntimeProbeSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(preAnalysisEvidenceGateRuntimeProbe))) {
    failures.push(`Pre-analysis gate runtime wrapper probe check failed: missing ${signal.label}`);
  }
}

if (!productPhotoProbeRunner.includes("pre-analysis-evidence-gate-runtime.probe.ts")) {
  failures.push("Product-photo probe runner check failed: pre-analysis gate runtime wrapper probe is not registered.");
}

const unsupportedEvidenceReviewState =
  fileContents.get("src/lib/analysis/unsupported-evidence-review-state.ts") ?? "";
const unsupportedEvidenceReviewStateProbe =
  fileContents.get("src/lib/analysis/unsupported-evidence-review-state.probe.ts") ?? "";

const requiredUnsupportedEvidenceReviewSignals = [
  {
    label: "unsupported review state status marker",
    patterns: [/UNSUPPORTED_EVIDENCE_REVIEW_STATE_STATUS/],
  },
  {
    label: "unsupported review mapper entrypoint",
    patterns: [/mapUnsupportedEvidenceReviewState/],
  },
  {
    label: "unsupported review state name",
    patterns: [/state:\s*"unsupportedEvidenceReview"/],
  },
  {
    label: "unsupported review result kind",
    patterns: [/resultKind:\s*"unsupported-evidence-review"/],
  },
  {
    label: "unsupported review manual-review marker",
    patterns: [/manualReviewOnly: true/],
  },
  {
    label: "unsupported review runtime non-live marker",
    patterns: [/runtimeLive: false/],
  },
  {
    label: "unsupported review product-photo runtime non-live marker",
    patterns: [/productPhotoRuntimeLive: false/],
  },
  {
    label: "unsupported review external verification not performed",
    patterns: [/externalVerification:\s*"Not performed"/],
  },
  {
    label: "unsupported review not externally verified",
    patterns: [/verificationStatus:\s*"Not externally verified"/],
  },
  {
    label: "unsupported review no receipt score shown marker",
    patterns: [/receiptScoreShown: false/],
  },
  {
    label: "unsupported review no receipt report shown marker",
    patterns: [/receiptReportShown: false/],
  },
  {
    label: "unsupported review no product-photo report shown marker",
    patterns: [/productPhotoReportShown: false/],
  },
  {
    label: "unsupported review no product-photo panel route marker",
    patterns: [/productPhotoReviewPanelRouted: false/],
  },
  {
    label: "unsupported review no OCR marker",
    patterns: [/ocrInvoked: false/],
  },
  {
    label: "unsupported review no metadata marker",
    patterns: [/metadataInvoked: false/],
  },
  {
    label: "unsupported review no provider/storage/integration/case-queue marker",
    patterns: [/providersStorageIntegrationsCaseQueuesInvoked: false/],
  },
];

for (const signal of requiredUnsupportedEvidenceReviewSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(unsupportedEvidenceReviewState))) {
    failures.push(`Unsupported evidence review-state check failed: missing ${signal.label}`);
  }
}

const forbiddenUnsupportedEvidenceReviewImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/metadata-service",
  "@/lib/analysis/image-heuristics",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/analysis/product-photo-report-view-model",
  "@/lib/test-evidence",
  "@/components/",
  "@/lib/claim-data",
];

for (const importPath of forbiddenUnsupportedEvidenceReviewImports) {
  const doubleQuotedImport = `from "${importPath}"`;
  const singleQuotedImport = `from '${importPath}'`;

  if (
    unsupportedEvidenceReviewState.includes(doubleQuotedImport) ||
    unsupportedEvidenceReviewState.includes(singleQuotedImport)
  ) {
    failures.push(
      `Unsupported evidence review-state boundary check failed: mapper imports forbidden path ${importPath}`,
    );
  }
}

if (/^import\s/m.test(unsupportedEvidenceReviewState)) {
  failures.push("Unsupported evidence review-state boundary check failed: mapper should remain import-free.");
}

if (/analyzeEvidenceFile|LocalAnalysisResult|MockAnalysisReport|mapLocalAnalysisToReport/.test(unsupportedEvidenceReviewState)) {
  failures.push(
    "Unsupported evidence review-state boundary check failed: mapper references live analyzer or receipt report types.",
  );
}

if (
  /createObjectURL|\bobjectUrl\b|\bimageUrl\b|\bdataUrl\b|\bBlob\b|\bFile\b|rawOcr|ocrText|rawExif|rawMetadata|originalFilename|providerOutput|storageHandle|integrationHandle|caseQueueHandle/.test(
    unsupportedEvidenceReviewState,
  )
) {
  failures.push("Unsupported evidence review-state privacy check failed: mapper references raw file/private surfaces.");
}

const requiredUnsupportedEvidenceReviewProbeSignals = [
  {
    label: "unsupported review probe export",
    patterns: [/UNSUPPORTED_EVIDENCE_REVIEW_STATE_DEVELOPER_PROBE/],
  },
  {
    label: "unsupported review active type assertions",
    patterns: [/assertProbeChecksPass\("types", typeChecks\)/],
  },
  {
    label: "unsupported review active case coverage assertions",
    patterns: [/assertProbeChecksPass\("case coverage", caseCoverageChecks\)/],
  },
  {
    label: "unsupported review active shape assertions",
    patterns: [/assertProbeChecksPass\("shape", shapeChecks\)/],
  },
  {
    label: "unsupported review active no-live assertions",
    patterns: [/assertProbeChecksPass\("no-live boundaries", noLiveBoundaryChecks\)/],
  },
  {
    label: "unsupported review active wording assertions",
    patterns: [/assertProbeChecksPass\("wording", wordingChecks\)/],
  },
  {
    label: "unsupported review active source-boundary assertions",
    patterns: [/assertProbeChecksPass\("source boundaries", sourceBoundaryChecks\)/],
  },
  {
    label: "unsupported review product-photo case",
    patterns: [/productPhotoCovered/],
  },
  {
    label: "unsupported review order screenshot case",
    patterns: [/orderScreenshotCovered/],
  },
  {
    label: "unsupported review ambiguous PDF case",
    patterns: [/ambiguousPdfCovered/],
  },
  {
    label: "unsupported review unknown evidence case",
    patterns: [/unknownEvidenceCovered/],
  },
  {
    label: "unsupported review mixed evidence case",
    patterns: [/mixedEvidenceCovered/],
  },
  {
    label: "unsupported review unsupported image case",
    patterns: [/unsupportedImageCovered/],
  },
  {
    label: "unsupported review receipt-like not parseable case",
    patterns: [/receiptLikeNotParseableCovered/],
  },
  {
    label: "unsupported review forbidden visible phrase helper",
    patterns: [/visibleOutputOmitsForbiddenPhrases/],
  },
  {
    label: "unsupported review safe concept helper",
    patterns: [/displayHasRequiredSafeConcepts/],
  },
  {
    label: "unsupported review private sentinel omission",
    patterns: [/hostilePrivateSentinel/],
  },
];

for (const signal of requiredUnsupportedEvidenceReviewProbeSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(unsupportedEvidenceReviewStateProbe))) {
    failures.push(`Unsupported evidence review-state probe check failed: missing ${signal.label}`);
  }
}

const forbiddenUnsupportedEvidenceReviewProbeImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/metadata-service",
  "@/lib/analysis/image-heuristics",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/analysis/product-photo-report-view-model",
  "@/lib/test-evidence",
  "@/components/ClaimReviewWorkflow",
  "@/components/UploadPanel",
  "@/components/ProductPhotoReviewPanel",
];

for (const importPath of forbiddenUnsupportedEvidenceReviewProbeImports) {
  const doubleQuotedImport = `from "${importPath}"`;
  const singleQuotedImport = `from '${importPath}'`;

  if (
    unsupportedEvidenceReviewStateProbe.includes(doubleQuotedImport) ||
    unsupportedEvidenceReviewStateProbe.includes(singleQuotedImport)
  ) {
    failures.push(
      `Unsupported evidence review-state probe boundary check failed: probe imports forbidden path ${importPath}`,
    );
  }
}

if (!productPhotoProbeRunner.includes("unsupported-evidence-review-state.probe.ts")) {
  failures.push("Product-photo probe runner check failed: unsupported evidence review-state probe is not registered.");
}

if (
  [appPage, appLayout, testEvidenceHarness, claimReviewWorkflow, reportAdapter, productPhotoReviewPanel].some((source) =>
    source.includes("unsupported-evidence-review-state"),
  )
) {
  failures.push("Unsupported evidence review-state boundary check failed: mapper is imported by live app/report/UI files.");
}

const workflowPreAnalysisGateBoundary =
  fileContents.get("src/lib/analysis/workflow-pre-analysis-gate-boundary.ts") ?? "";
const workflowPreAnalysisGateBoundaryProbe =
  fileContents.get("src/lib/analysis/workflow-pre-analysis-gate-boundary.probe.ts") ?? "";

const requiredWorkflowPreAnalysisGateBoundarySignals = [
  {
    label: "workflow boundary status marker",
    patterns: [/WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_STATUS/],
  },
  {
    label: "workflow boundary default-off flag",
    patterns: [/ENABLE_WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_GUARD:\s*boolean\s*=\s*false/],
  },
  {
    label: "workflow boundary entrypoint",
    patterns: [/buildWorkflowPreAnalysisGateBoundaryResult/],
  },
  {
    label: "workflow boundary default-off receipt delegation",
    patterns: [/resultKind:\s*"receipt-analysis-delegation"/],
  },
  {
    label: "workflow boundary unsupported stopped state",
    patterns: [/resultKind:\s*"unsupported-evidence-stopped"/],
  },
  {
    label: "workflow boundary mapper usage",
    patterns: [/mapUnsupportedEvidenceReviewState/],
  },
  {
    label: "workflow boundary probe-only marker",
    patterns: [/probeOnly:\s*true/],
  },
  {
    label: "workflow boundary runtime non-live marker",
    patterns: [/runtimeLive:\s*false/],
  },
  {
    label: "workflow boundary product-photo runtime non-live marker",
    patterns: [/productPhotoRuntimeLive:\s*false/],
  },
  {
    label: "workflow boundary no live caller marker",
    patterns: [/liveCallerWired:\s*false/],
  },
  {
    label: "workflow boundary no rendered UI marker",
    patterns: [/renderedUiAdded:\s*false/],
  },
  {
    label: "workflow boundary no receipt-result migration marker",
    patterns: [/localAnalysisResultProduced:\s*false/],
  },
  {
    label: "workflow boundary unsupported not stored in receipt result marker",
    patterns: [/unsupportedEvidenceStoredInReceiptResult:\s*false/],
  },
  {
    label: "workflow boundary no report mapping for unsupported marker",
    patterns: [/receiptReportMappingDelegationIntended:\s*false/],
  },
  {
    label: "workflow boundary no ProductPhotoReviewPanel route marker",
    patterns: [/productPhotoReviewPanelRouted:\s*false/],
  },
];

for (const signal of requiredWorkflowPreAnalysisGateBoundarySignals) {
  if (!signal.patterns.some((pattern) => pattern.test(workflowPreAnalysisGateBoundary))) {
    failures.push(`Workflow pre-analysis gate boundary check failed: missing ${signal.label}`);
  }
}

const forbiddenWorkflowBoundaryImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/metadata-service",
  "@/lib/analysis/image-heuristics",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/analysis/product-photo-report-view-model",
  "@/lib/test-evidence",
  "@/components/",
  "@/lib/claim-data",
];

for (const importPath of forbiddenWorkflowBoundaryImports) {
  const doubleQuotedImport = `from "${importPath}"`;
  const singleQuotedImport = `from '${importPath}'`;

  if (
    workflowPreAnalysisGateBoundary.includes(doubleQuotedImport) ||
    workflowPreAnalysisGateBoundary.includes(singleQuotedImport)
  ) {
    failures.push(`Workflow pre-analysis gate boundary import check failed: helper imports forbidden path ${importPath}`);
  }
}

if (
  /LocalAnalysisResult|MockAnalysisReport|mapLocalAnalysisToReport|analyzeEvidenceFile\s*\(/.test(
    workflowPreAnalysisGateBoundary,
  )
) {
  failures.push(
    "Workflow pre-analysis gate boundary check failed: helper references live receipt result, analyzer call, or report mapping.",
  );
}

if (
  /createObjectURL|\bobjectUrl\b|\bimageUrl\b|\bdataUrl\b|\bBlob\b|\bFile\b|rawOcr|ocrText|rawExif|rawMetadata|originalFilename|providerOutput|providerHandle|storageHandle|integrationHandle|caseQueueHandle|credentials|secret/.test(
    workflowPreAnalysisGateBoundary,
  )
) {
  failures.push("Workflow pre-analysis gate boundary privacy check failed: helper references raw file/private surfaces.");
}

const requiredWorkflowPreAnalysisGateBoundaryProbeSignals = [
  {
    label: "workflow boundary probe export",
    patterns: [/WORKFLOW_PRE_ANALYSIS_GATE_BOUNDARY_DEVELOPER_PROBE/],
  },
  {
    label: "workflow boundary active type assertions",
    patterns: [/assertProbeChecksPass\("types", typeChecks\)/],
  },
  {
    label: "workflow boundary active shape assertions",
    patterns: [/assertProbeChecksPass\("shape", shapeChecks\)/],
  },
  {
    label: "workflow boundary active unsupported review assertions",
    patterns: [/assertProbeChecksPass\("unsupported review", unsupportedReviewChecks\)/],
  },
  {
    label: "workflow boundary active wording and privacy assertions",
    patterns: [/assertProbeChecksPass\("wording and privacy", wordingAndPrivacyChecks\)/],
  },
  {
    label: "workflow boundary active source-boundary assertions",
    patterns: [/assertProbeChecksPass\("source boundaries", sourceBoundaryChecks\)/],
  },
  {
    label: "workflow boundary default-off receipt delegation case",
    patterns: [/defaultOffReceiptDelegation/],
  },
  {
    label: "workflow boundary default-off unsupported delegation case",
    patterns: [/defaultOffUnsupportedDelegation/],
  },
  {
    label: "workflow boundary product-photo stop case",
    patterns: [/enabledProductPhotoStop/],
  },
  {
    label: "workflow boundary legacy stop case",
    patterns: [/enabledLegacyStop/],
  },
  {
    label: "workflow boundary unknown stop case",
    patterns: [/enabledUnknownStop/],
  },
  {
    label: "workflow boundary unsupported image stop case",
    patterns: [/enabledUnsupportedImageStop/],
  },
  {
    label: "workflow boundary forbidden visible phrase helper",
    patterns: [/visibleOutputOmitsForbiddenPhrases/],
  },
  {
    label: "workflow boundary safe concept helper",
    patterns: [/displayHasRequiredSafeConcepts/],
  },
  {
    label: "workflow boundary private-field omission helper",
    patterns: [/serializedOutputOmitsPrivateFields/],
  },
  {
    label: "workflow boundary live-file isolation helper",
    patterns: [/liveFilesDoNotImportWorkflowBoundary/],
  },
];

for (const signal of requiredWorkflowPreAnalysisGateBoundaryProbeSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(workflowPreAnalysisGateBoundaryProbe))) {
    failures.push(`Workflow pre-analysis gate boundary probe check failed: missing ${signal.label}`);
  }
}

const forbiddenWorkflowBoundaryProbeImports = [
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/ocr-service",
  "@/lib/analysis/metadata-service",
  "@/lib/analysis/image-heuristics",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/analysis/product-photo-report-view-model",
  "@/lib/test-evidence",
  "@/components/ClaimReviewWorkflow",
  "@/components/UploadPanel",
  "@/components/ProductPhotoReviewPanel",
];

for (const importPath of forbiddenWorkflowBoundaryProbeImports) {
  const doubleQuotedImport = `from "${importPath}"`;
  const singleQuotedImport = `from '${importPath}'`;

  if (
    workflowPreAnalysisGateBoundaryProbe.includes(doubleQuotedImport) ||
    workflowPreAnalysisGateBoundaryProbe.includes(singleQuotedImport)
  ) {
    failures.push(
      `Workflow pre-analysis gate boundary probe check failed: probe imports forbidden path ${importPath}`,
    );
  }
}

if (!productPhotoProbeRunner.includes("workflow-pre-analysis-gate-boundary.probe.ts")) {
  failures.push("Product-photo probe runner check failed: workflow pre-analysis gate boundary probe is not registered.");
}

if (
  [appPage, appLayout, testEvidenceHarness, claimReviewWorkflow, reportAdapter, productPhotoReviewPanel, analyzer].some(
    (source) => source.includes("workflow-pre-analysis-gate-boundary"),
  )
) {
  failures.push("Workflow pre-analysis gate boundary check failed: helper is imported by live app/report/analyzer/UI files.");
}

const preAnalysisGateHostPage = fileContents.get("src/app/dev/pre-analysis-evidence-gate/page.tsx") ?? "";
const preAnalysisGateRenderCases =
  fileContents.get("src/app/dev/pre-analysis-evidence-gate/render-cases.ts") ?? "";
const preAnalysisGateHostCorpus = `${preAnalysisGateHostPage}\n${preAnalysisGateRenderCases}`;

const requiredPreAnalysisGateHostPageSignals = [
  {
    label: "gate host imports notFound production guard",
    patterns: [/import \{ notFound \} from "next\/navigation";/],
  },
  {
    label: "gate host imports colocated render cases",
    patterns: [/import \{ preAnalysisEvidenceGateReviewCases \} from "\.\/render-cases";/],
  },
  {
    label: "gate host production-disabled by default",
    patterns: [/process\.env\.NODE_ENV !== "production"/],
  },
  {
    label: "gate host returns notFound when disabled",
    patterns: [/notFound\(\)/],
  },
  {
    label: "gate host non-live banner",
    patterns: [/Synthetic non-live developer gate review/],
  },
  {
    label: "gate host manual-review-only label",
    patterns: [/Manual review only/],
  },
  {
    label: "gate host runtime non-live label",
    patterns: [/Runtime live: No/],
  },
  {
    label: "gate host type-only decision import",
    patterns: [
      /import type \{ PreAnalysisEvidenceGateDecision \} from "@\/lib\/analysis\/pre-analysis-evidence-gate";/,
    ],
  },
];

const requiredPreAnalysisGateRenderCaseSignals = [
  {
    label: "render cases type-only decision import",
    patterns: [
      /import type \{ PreAnalysisEvidenceGateDecision \} from "@\/lib\/analysis\/pre-analysis-evidence-gate";/,
    ],
  },
  {
    label: "render cases typed decision field",
    patterns: [/decision: PreAnalysisEvidenceGateDecision/],
  },
  {
    label: "render cases readonly review-case array",
    patterns: [/readonly PreAnalysisEvidenceGateReviewCase\[\]/],
  },
  {
    label: "render cases allow outcome",
    patterns: [/"allow-receipt-default-path"/],
  },
  {
    label: "render cases unsupported outcome",
    patterns: [/"unsupported-evidence"/],
  },
  {
    label: "render cases legacy quarantine outcome",
    patterns: [/"legacy-damage-photo-quarantine"/],
  },
  {
    label: "render cases product-photo-like outcome",
    patterns: [/"product-photo-like-unsupported"/],
  },
  {
    label: "render cases unknown outcome",
    patterns: [/"unknown-inconclusive"/],
  },
  {
    label: "render cases runtime non-live marker",
    patterns: [/runtimeLive: false/],
  },
  {
    label: "render cases manual-review-only marker",
    patterns: [/manualReviewOnly: true/],
  },
  {
    label: "render cases no-ocr marker",
    patterns: [/ocrInvoked: false/],
  },
  {
    label: "render cases no-metadata marker",
    patterns: [/metadataInvoked: false/],
  },
  {
    label: "render cases provider/storage/integration/case-queue isolation marker",
    patterns: [/providersStorageIntegrationsCaseQueuesInvoked: false/],
  },
];

const forbiddenPreAnalysisGateHostImports = [
  "@/components/ClaimReviewWorkflow",
  "@/components/TestEvidenceHarness",
  "@/components/UploadPanel",
  "@/components/AnalysisReport",
  "@/components/AuthenticityResultCard",
  "@/components/ProductPhotoReviewPanel",
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/test-evidence",
  "@/lib/claim-data",
  "next/image",
];

const forbiddenPreAnalysisGateHostPatterns = [
  /buildPreAnalysisEvidenceGateDecision/,
  /analyzeEvidenceFile/,
  /LocalAnalysisResult/,
  /<img\b/i,
  /createObjectURL/,
  /\bobjectUrl\b/,
  /\bimageUrl\b/,
  /\bdataUrl\b/,
  /\bBlob\b/,
  /type=["']file["']/i,
  /\bfetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /routeParams|searchParams/,
  /rawExif/,
  /rawMetadata/,
  /originalFilename/,
  /rawLabelValue/,
  /providerOutput|providerHandle|storageHandle|integrationHandle|caseQueueHandle/,
  /\b(?:case|claim|ticket|evidence|provider|storage|integration)[-_ ]?id\b/i,
  /\border\s*(?:number|id|#)\b/i,
  /https?:\/\//i,
  /[A-Za-z]:\\/,
  /\b[A-Z]{2,}-\d{3,}\b/,
];

for (const signal of requiredPreAnalysisGateHostPageSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(preAnalysisGateHostPage))) {
    failures.push(`Pre-analysis gate host check failed: missing ${signal.label}`);
  }
}

for (const signal of requiredPreAnalysisGateRenderCaseSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(preAnalysisGateRenderCases))) {
    failures.push(`Pre-analysis gate render-case check failed: missing ${signal.label}`);
  }
}

for (const importPath of forbiddenPreAnalysisGateHostImports) {
  if (preAnalysisGateHostCorpus.includes(importPath)) {
    failures.push(`Pre-analysis gate host boundary check failed: host imports forbidden path ${importPath}`);
  }
}

for (const pattern of forbiddenPreAnalysisGateHostPatterns) {
  if (pattern.test(preAnalysisGateHostCorpus)) {
    failures.push(`Pre-analysis gate host privacy/import check failed: host uses forbidden pattern ${pattern}`);
  }
}

if (
  [appPage, appLayout, testEvidenceHarness, claimReviewWorkflow, reportAdapter].some((source) =>
    source.includes("/dev/pre-analysis-evidence-gate"),
  )
) {
  failures.push("Pre-analysis gate host boundary check failed: host route is linked from live app files.");
}

const adapterReadinessHostPage =
  fileContents.get("src/app/dev/product-photo-adapter-readiness/page.tsx") ?? "";
const adapterReadinessRenderCases =
  fileContents.get("src/app/dev/product-photo-adapter-readiness/render-cases.ts") ?? "";
const adapterReadinessHostCorpus = `${adapterReadinessHostPage}\n${adapterReadinessRenderCases}`;

const requiredAdapterReadinessHostPageSignals = [
  {
    label: "adapter host imports notFound production guard",
    patterns: [/import \{ notFound \} from "next\/navigation";/],
  },
  {
    label: "adapter host imports colocated render cases",
    patterns: [/import \{ productPhotoAdapterReadinessReviewCases \} from "\.\/render-cases";/],
  },
  {
    label: "adapter host production-disabled by default",
    patterns: [/process\.env\.NODE_ENV !== "production"/],
  },
  {
    label: "adapter host returns notFound when disabled",
    patterns: [/notFound\(\)/],
  },
  {
    label: "adapter host non-live banner",
    patterns: [/Synthetic non-live developer adapter readiness review/],
  },
  {
    label: "adapter host manual-review-only label",
    patterns: [/Manual review only/],
  },
  {
    label: "adapter host runtime non-live label",
    patterns: [/Runtime live: No/],
  },
  {
    label: "adapter host type-only readiness import",
    patterns: [
      /import type \{ ProductPhotoAdapterReadinessResult \} from "@\/lib\/analysis\/product-photo-routing-adapter";/,
    ],
  },
];

const requiredAdapterReadinessRenderCaseSignals = [
  {
    label: "render cases type-only readiness import",
    patterns: [
      /import type \{ ProductPhotoAdapterReadinessResult \} from "@\/lib\/analysis\/product-photo-routing-adapter";/,
    ],
  },
  {
    label: "render cases typed result field",
    patterns: [/result: ProductPhotoAdapterReadinessResult/],
  },
  {
    label: "render cases readonly review-case array",
    patterns: [/readonly ProductPhotoAdapterReadinessReviewCase\[\]/],
  },
  {
    label: "render cases accepted analysis-result kind",
    patterns: [/inputKind: "analysis-result"/],
  },
  {
    label: "render cases report-view-model kind",
    patterns: [/inputKind: "report-view-model"/],
  },
  {
    label: "render cases legacy quarantine kind",
    patterns: [/inputKind: "legacy-quarantine"/],
  },
  {
    label: "render cases unsupported kind",
    patterns: [/inputKind: "unsupported"/],
  },
  {
    label: "render cases readiness accepted field",
    patterns: [/readinessAccepted: (?:true|false)/],
  },
  {
    label: "render cases runtime non-live marker",
    patterns: [/runtimeLive: false/],
  },
  {
    label: "render cases manual-review-only marker",
    patterns: [/manualReviewOnly: true/],
  },
  {
    label: "render cases live receipt analyzer isolation marker",
    patterns: [/analyzeEvidenceFileInvoked: false/],
  },
  {
    label: "render cases provider/storage/integration/case-queue isolation marker",
    patterns: [/providersStorageIntegrationsCaseQueuesInvoked: false/],
  },
];

const forbiddenAdapterReadinessHostImports = [
  "@/components/ClaimReviewWorkflow",
  "@/components/TestEvidenceHarness",
  "@/components/UploadPanel",
  "@/components/AnalysisReport",
  "@/components/AuthenticityResultCard",
  "@/components/ProductPhotoReviewPanel",
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/pre-analysis-evidence-gate",
  "@/lib/test-evidence",
  "@/lib/claim-data",
  "next/image",
];

const forbiddenAdapterReadinessHostPatterns = [
  /prepareProductPhotoAdapterReadinessForDevOnlyBoundary/,
  /analyzeEvidenceFile\s*\(/,
  /import\s+\{[^}]*\}\s+from\s+["']@\/lib\/analysis\/product-photo-routing-adapter["']/,
  /import\s+\{[^}]*\}\s+from\s+["']@\/lib\/analysis\/product-photo-analyzer["']/,
  /LocalAnalysisResult/,
  /<img\b/i,
  /createObjectURL/,
  /\bobjectUrl\b/,
  /\bimageUrl\b/,
  /\bdataUrl\b/,
  /\bBlob\b/,
  /type=["']file["']/i,
  /\bfetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /routeParams|searchParams/,
  /rawExif/,
  /rawMetadata/,
  /originalFilename/,
  /rawLabelValue/,
  /providerOutput|providerHandle|storageHandle|integrationHandle|caseQueueHandle/,
  /\b(?:case|claim|ticket|evidence|provider|storage|integration)[-_ ]?id\b/i,
  /\border\s*(?:number|id|#)\b/i,
  /https?:\/\//i,
  /[A-Za-z]:\\/,
  /\b[A-Z]{2,}-\d{3,}\b/,
];

for (const signal of requiredAdapterReadinessHostPageSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(adapterReadinessHostPage))) {
    failures.push(`Product-photo adapter readiness host check failed: missing ${signal.label}`);
  }
}

for (const signal of requiredAdapterReadinessRenderCaseSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(adapterReadinessRenderCases))) {
    failures.push(`Product-photo adapter readiness render-case check failed: missing ${signal.label}`);
  }
}

for (const importPath of forbiddenAdapterReadinessHostImports) {
  if (adapterReadinessHostCorpus.includes(importPath)) {
    failures.push(
      `Product-photo adapter readiness host boundary check failed: host imports forbidden path ${importPath}`,
    );
  }
}

for (const pattern of forbiddenAdapterReadinessHostPatterns) {
  if (pattern.test(adapterReadinessHostCorpus)) {
    failures.push(
      `Product-photo adapter readiness host privacy/import check failed: host uses forbidden pattern ${pattern}`,
    );
  }
}

if (
  [appPage, appLayout, testEvidenceHarness, claimReviewWorkflow, reportAdapter].some((source) =>
    source.includes("/dev/product-photo-adapter-readiness"),
  )
) {
  failures.push(
    "Product-photo adapter readiness host boundary check failed: host route is linked from live app files.",
  );
}

const unsupportedEvidenceReviewHostPage =
  fileContents.get("src/app/dev/unsupported-evidence-review/page.tsx") ?? "";
const unsupportedEvidenceReviewRenderCases =
  fileContents.get("src/app/dev/unsupported-evidence-review/render-cases.ts") ?? "";
const unsupportedEvidenceReviewHostCorpus = `${unsupportedEvidenceReviewHostPage}\n${unsupportedEvidenceReviewRenderCases}`;

const requiredUnsupportedEvidenceReviewHostPageSignals = [
  {
    label: "unsupported evidence host imports notFound production guard",
    patterns: [/import \{ notFound \} from "next\/navigation";/],
  },
  {
    label: "unsupported evidence host imports colocated render cases",
    patterns: [/import \{ unsupportedEvidenceReviewCases \} from "\.\/render-cases";/],
  },
  {
    label: "unsupported evidence host production-disabled by default",
    patterns: [/process\.env\.NODE_ENV !== "production"/],
  },
  {
    label: "unsupported evidence host returns notFound when disabled",
    patterns: [/notFound\(\)/],
  },
  {
    label: "unsupported evidence host non-live banner",
    patterns: [/Synthetic non-live developer unsupported-evidence review/],
  },
  {
    label: "unsupported evidence host manual-review-only label",
    patterns: [/Manual review only/],
  },
  {
    label: "unsupported evidence host runtime non-live label",
    patterns: [/Runtime live: No/],
  },
  {
    label: "unsupported evidence host type-only display import",
    patterns: [
      /import type \{ UnsupportedEvidenceReviewDisplay \} from "@\/lib\/analysis\/unsupported-evidence-review-state";/,
    ],
  },
  {
    label: "unsupported evidence host required unsupported concept",
    patterns: [/unsupported for automated receipt analysis/i],
  },
  {
    label: "unsupported evidence host no automated decision concept",
    patterns: [/No automated decision should be made from\s+this bridge/],
  },
];

const requiredUnsupportedEvidenceReviewRenderCaseSignals = [
  {
    label: "render cases type-only display import",
    patterns: [
      /import type \{ UnsupportedEvidenceReviewDisplay \} from "@\/lib\/analysis\/unsupported-evidence-review-state";/,
    ],
  },
  {
    label: "render cases typed review field",
    patterns: [/review: UnsupportedEvidenceReviewDisplay/],
  },
  {
    label: "render cases readonly review-case array",
    patterns: [/satisfies readonly UnsupportedEvidenceReviewRenderCase\[\]/],
  },
  {
    label: "render cases unsupported outcome",
    patterns: [/"unsupported-evidence"/],
  },
  {
    label: "render cases product-photo-like outcome",
    patterns: [/"product-photo-like-unsupported"/],
  },
  {
    label: "render cases legacy outcome",
    patterns: [/"legacy-damage-photo-quarantine"/],
  },
  {
    label: "render cases unknown outcome",
    patterns: [/"unknown-inconclusive"/],
  },
  {
    label: "render cases manual-review status",
    patterns: [/reviewStatus: "Manual review recommended"/],
  },
  {
    label: "render cases not externally verified marker",
    patterns: [/verificationStatus: "Not externally verified"/],
  },
  {
    label: "render cases external verification not performed marker",
    patterns: [/externalVerification: "Not performed"/],
  },
  {
    label: "render cases runtime non-live marker",
    patterns: [/runtimeLive: false/],
  },
  {
    label: "render cases product-photo runtime non-live marker",
    patterns: [/productPhotoRuntimeLive: false/],
  },
  {
    label: "render cases manual-review-only marker",
    patterns: [/manualReviewOnly: true/],
  },
  {
    label: "render cases no-ocr marker",
    patterns: [/ocrInvoked: false/],
  },
  {
    label: "render cases no-metadata marker",
    patterns: [/metadataInvoked: false/],
  },
  {
    label: "render cases live report adapter isolation marker",
    patterns: [/liveReportAdapterInvoked: false/],
  },
  {
    label: "render cases provider/storage/integration/case-queue isolation marker",
    patterns: [/providersStorageIntegrationsCaseQueuesInvoked: false/],
  },
  {
    label: "render cases product-photo panel not routed marker",
    patterns: [/productPhotoReviewPanelRouted: false/],
  },
  {
    label: "render cases required manual review guidance",
    patterns: [/Manual review recommended before action/],
  },
  {
    label: "render cases support policy guidance",
    patterns: [/Use available evidence and support policy/],
  },
  {
    label: "render cases receipt verification outcome boundary notice",
    patterns: [/This result is not a receipt verification outcome\./],
  },
];

const forbiddenUnsupportedEvidenceReviewHostImports = [
  "@/components/ClaimReviewWorkflow",
  "@/components/TestEvidenceHarness",
  "@/components/UploadPanel",
  "@/components/AnalysisReport",
  "@/components/AuthenticityResultCard",
  "@/components/ProductPhotoReviewPanel",
  "@/lib/analysis/analyzer",
  "@/lib/analysis/analyzer-routing",
  "@/lib/analysis/report-adapter",
  "@/lib/analysis/scoring",
  "@/lib/analysis/receipt-parser",
  "@/lib/analysis/pre-analysis-evidence-gate-runtime",
  "@/lib/analysis/workflow-pre-analysis-gate-boundary",
  "@/lib/analysis/product-photo-analyzer",
  "@/lib/analysis/product-photo-routing-adapter",
  "@/lib/test-evidence",
  "@/lib/claim-data",
  "next/image",
];

const forbiddenUnsupportedEvidenceReviewHostPatterns = [
  /mapUnsupportedEvidenceReviewState/,
  /buildWorkflowPreAnalysisGateBoundaryResult/,
  /analyzeEvidenceFile\s*\(/,
  /LocalAnalysisResult/,
  /<img\b/i,
  /createObjectURL/,
  /\bobjectUrl\b/,
  /\bimageUrl\b/,
  /\bdataUrl\b/,
  /\bBlob\b/,
  /\bFile\b/,
  /type=["']file["']/i,
  /\bfetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /routeParams|searchParams/,
  /rawOcr|ocrText/,
  /rawExif/,
  /rawMetadata/,
  /originalFilename/,
  /rawLabelValue/,
  /providerOutput|providerHandle|storageHandle|integrationHandle|caseQueueHandle/,
  /\b(?:case|claim|ticket|evidence|provider|storage|integration)[-_ ]?id\b/i,
  /\border\s*(?:number|id|#)\b/i,
  /https?:\/\//i,
  /[A-Za-z]:\\/,
  /\b[A-Z]{2,}-\d{3,}\b/,
];

const forbiddenUnsupportedEvidenceVisiblePhrases = [
  /receipt score/i,
  /authenticity score/i,
  /fr(?:aud confirmed|aud)/i,
  /fake receipt/i,
  /forged/i,
  /manipulated evidence/i,
  /proof(?:\s+|-)?of(?:\s+|-)?purchase/i,
  /product-photo report/i,
  /photo report/i,
  /deny this claim/i,
  /customer is lying/i,
  /automated refund/i,
  /automated deny/i,
  /approved|rejected/i,
];

const materializeSimpleJoinedStringLiterals = (source) =>
  source.replace(/\[\s*((?:"(?:[^"\\]|\\.)*"\s*,\s*)+"(?:[^"\\]|\\.)*")\s*\]\.join\(""\)/g, (_match, list) => {
    const values = [...list.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(([, value]) =>
      value.replace(/\\(["\\/bfnrt])/g, (_escape, char) => {
        if (char === "b") return "\b";
        if (char === "f") return "\f";
        if (char === "n") return "\n";
        if (char === "r") return "\r";
        if (char === "t") return "\t";
        return char;
      }),
    );

    return `${_match}\n${values.join("")}`;
  });

for (const signal of requiredUnsupportedEvidenceReviewHostPageSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(unsupportedEvidenceReviewHostPage))) {
    failures.push(`Unsupported-evidence review host check failed: missing ${signal.label}`);
  }
}

for (const signal of requiredUnsupportedEvidenceReviewRenderCaseSignals) {
  if (!signal.patterns.some((pattern) => pattern.test(unsupportedEvidenceReviewRenderCases))) {
    failures.push(`Unsupported-evidence review render-case check failed: missing ${signal.label}`);
  }
}

for (const importPath of forbiddenUnsupportedEvidenceReviewHostImports) {
  if (unsupportedEvidenceReviewHostCorpus.includes(importPath)) {
    failures.push(`Unsupported-evidence review host boundary check failed: host imports forbidden path ${importPath}`);
  }
}

for (const pattern of forbiddenUnsupportedEvidenceReviewHostPatterns) {
  if (pattern.test(unsupportedEvidenceReviewHostCorpus)) {
    failures.push(`Unsupported-evidence review host privacy/import check failed: host uses forbidden pattern ${pattern}`);
  }
}

const unsupportedEvidenceReviewVisibleCorpus = materializeSimpleJoinedStringLiterals(unsupportedEvidenceReviewHostCorpus)
  .replace(/outcome:\s*"legacy-damage-photo-quarantine"/g, "")
  .replace(/proofOfPurchaseLanguageShown/g, "");

for (const pattern of forbiddenUnsupportedEvidenceVisiblePhrases) {
  if (pattern.test(unsupportedEvidenceReviewVisibleCorpus)) {
    failures.push(`Unsupported-evidence review host wording check failed: forbidden visible phrase ${pattern}`);
  }
}

if (
  [appPage, appLayout, testEvidenceHarness, claimReviewWorkflow, reportAdapter, productPhotoReviewPanel, analyzer].some(
    (source) => source.includes("/dev/unsupported-evidence-review"),
  )
) {
  failures.push("Unsupported-evidence review host boundary check failed: host route is linked from live app files.");
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
