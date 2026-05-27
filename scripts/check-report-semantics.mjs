import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

const filesToCheck = [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/app/dev/product-photo-review-panel/page.tsx",
  "src/app/dev/product-photo-review-panel/render-cases.ts",
  "src/lib/analysis/analyzer.ts",
  "src/lib/analysis/report-adapter.ts",
  "src/lib/analysis/scoring.ts",
  "src/lib/analysis/types.ts",
  "src/lib/analysis/product-photo-analyzer.ts",
  "src/lib/analysis/product-photo-analyzer.probe.ts",
  "src/lib/analysis/product-photo-heuristics.ts",
  "src/lib/analysis/product-photo-heuristics.probe.ts",
  "src/lib/analysis/product-photo-result.probe.ts",
  "src/lib/analysis/shared-result.probe.ts",
  "src/lib/analysis/product-photo-report-view-model.ts",
  "src/lib/analysis/product-photo-report-view-model.probe.ts",
  "src/components/ProductPhotoReviewPanel.tsx",
  "src/components/ProductPhotoReviewPanel.probe.tsx",
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
  .filter(
    ([filePath]) =>
      filePath.includes("product-photo") ||
      filePath.includes("ProductPhotoReviewPanel") ||
      filePath.includes("shared-result.probe"),
  )
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
const productPhotoAnalyzer = fileContents.get("src/lib/analysis/product-photo-analyzer.ts") ?? "";
const productPhotoAnalyzerProbe = fileContents.get("src/lib/analysis/product-photo-analyzer.probe.ts") ?? "";
const productPhotoHeuristicsProbe = fileContents.get("src/lib/analysis/product-photo-heuristics.probe.ts") ?? "";
const productPhotoReportViewModelProbe =
  fileContents.get("src/lib/analysis/product-photo-report-view-model.probe.ts") ?? "";
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
  /\bFile\b/,
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
