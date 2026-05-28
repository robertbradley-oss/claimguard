# Product-Photo Unsupported Boundary Plan

This is the Phase 2.4.9 docs-only pre-OCR/pre-metadata unsupported-boundary plan.

It does not implement code, probes, routes, React components, upload handling, analyzer runtime changes, live report adapter mapping, `LocalAnalysisResult` migration, receipt parser/scoring/fixture changes, providers, storage, integrations, case queues, real photos, real metadata fixtures, deployment, or product-photo runtime behavior.

Product-photo runtime remains non-live. `runtimeLive` remains false, `manualReviewOnly` remains true, `damage-photo` remains legacy/non-canonical, `analyzeEvidenceFile` remains protected and receipt-shaped, and receipt behavior remains unchanged.

## Boundary Purpose

The pre-OCR/pre-metadata unsupported boundary is a future no-live gate that should stop product-photo-like or otherwise unsupported files before receipt OCR, receipt parsing, metadata inspection, receipt scoring, and live report mapping run.

The boundary exists to close the residual Phase 2.4.8 risk: product-photo-like filenames no longer return `damage-photo`, but they can still collapse into the existing receipt/default analyzer flow and reach OCR/metadata processing.

The future boundary must:

- Avoid sending product-photo-like files through receipt/default analysis.
- Preserve receipt image, PDF receipt, and order screenshot behavior.
- Keep product-photo non-live and manual-review-only.
- Avoid calling the product-photo analyzer, product-photo routing adapter, product-photo report view-model mapper, upload UI, live report adapter, receipt parser, receipt scoring, fixtures, providers, storage, integrations, or case queues.
- Return only unsupported/quarantine/readiness-style decisions if a later approved slice implements it.

## Conceptual Placement

The future boundary should conceptually live before the receipt-heavy analyzer body.

Current protected live order in `analyzeEvidenceFile` is:

1. Classify the file.
2. Run OCR.
3. Parse receipt text.
4. Inspect metadata.
5. Build receipt/image heuristics.
6. Score receipt analysis.
7. Return `LocalAnalysisResult`.

The future unsupported boundary should run after lightweight file hint classification and before OCR or metadata-heavy receipt processing. It should make a decision from privacy-safe synthetic filename/type/category hints first. It should not need image bytes, EXIF, object URLs, raw metadata, customer data, provider outputs, storage handles, integration handles, or case queue handles.

## Recommended Name

Recommended future boundary name: `pre-analysis-evidence-gate`.

Recommended future files, if Robert explicitly opens the no-live implementation slice:

- `src/lib/analysis/pre-analysis-evidence-gate.ts`.
- `src/lib/analysis/pre-analysis-evidence-gate.probe.ts`.

Recommended future exports:

- `PRE_ANALYSIS_EVIDENCE_GATE_STATUS`.
- `PRE_ANALYSIS_EVIDENCE_GATE_DEVELOPER_PROBE`.
- `buildPreAnalysisEvidenceGateDecision`.
- `PreAnalysisEvidenceGateInput`.
- `PreAnalysisEvidenceGateDecision`.
- `PreAnalysisEvidenceGateOutcome`.

This name is preferred over `unsupported-evidence-boundary` because the most important contract is placement before OCR/metadata processing. The output can still include unsupported and quarantine states, but the name should not imply product-photo runtime support.

## Product-Photo-Like Inputs To Stop

The first future implementation should use synthetic hints only and should stop product-photo-like files such as:

- Declared or inferred `product-photo` candidates.
- Legacy `damage-photo` candidates.
- Image filenames or declared categories with damage, product, photo, crack, close-up, label, serial, model, packaging, installation, warranty, or product-context cues.
- Mixed or inconclusive image candidates that are not clearly receipt images, order screenshots, or PDF receipts.
- Product-photo-like MIME/category combinations that do not have receipt/PDF/screenshot cues.

The first implementation must not inspect real image bytes, EXIF, object URLs, browser previews, raw OCR text, raw metadata, customer records, ticket/order data, provider payloads, storage handles, integration handles, or case queue handles.

## Receipt Preservation

The future gate must preserve:

- Normal receipt-image behavior.
- PDF receipt behavior.
- Order screenshot behavior.
- Null/default receipt classification expectations.
- `analyzeEvidenceFile` as the protected live receipt analyzer entrypoint unless Robert explicitly opens runtime integration.
- `LocalAnalysisResult` as receipt-shaped.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` as receipt-only.
- Receipt parser, scoring, fixtures, `/test-evidence`, and report semantics unless a later prompt explicitly scopes receipt work.

The future gate must not classify receipt-like inputs as product-photo-like just because their names mention product lines or item details that appear on receipts.

## Future Output States

Future no-live decision outputs should be decision-only and should not return `LocalAnalysisResult`.

Allowed future output states:

- `allow-receipt-default-path`: receipt/PDF/screenshot/default handling may continue unchanged.
- `unsupported-evidence`: the input is unsupported for the current live analyzer and should not proceed to receipt OCR/metadata.
- `legacy-damage-photo-quarantine`: the input matches legacy `damage-photo` compatibility language and remains non-canonical.
- `product-photo-like-unsupported`: the input appears product-photo-like, product-photo runtime is non-live, and no OCR/metadata should run.
- `unknown-inconclusive`: lightweight hints are insufficient; preserve receipt behavior unless the approved slice defines a narrower unsupported rule.

Every unsupported/quarantine decision should include explicit no-live markers:

- `runtimeLive: false`.
- `manualReviewOnly: true`.
- `ocrInvoked: false`.
- `metadataInvoked: false`.
- `analyzerInvoked: false`.
- `adapterInvoked: false`.
- `uiUploadReportScoringParserFixturePathsInvoked: false`.
- `providersStorageIntegrationsCaseQueuesInvoked: false`.

Unsupported/quarantine outputs must not include numeric receipt scores, risk bands, confidence as evidence truth, verification claims, proof wording, customer accusations, support disposition, or final claim outcome wording.

## Allowed Future Inputs

The first no-live implementation slice may use only:

- Synthetic filenames.
- Synthetic MIME/type hints.
- Synthetic declared evidence categories.
- Synthetic boolean receipt/PDF/screenshot/product-photo-like hint combinations.
- Synthetic privacy-safe test labels.

The first implementation must not use:

- Real image bytes.
- Real photos.
- Real metadata fixtures.
- Raw EXIF.
- Raw OCR text from private evidence.
- Object URLs, image URLs, data URLs, blobs, file handles, or retained fingerprints.
- Original filenames from private evidence.
- Precise timestamps, GPS coordinates, exact dimensions, or raw label/serial/model/barcode/QR values.
- Customer, ticket, order, claim, evidence, or case identifiers.
- Provider payloads, storage handles, integration handles, case queue handles, network calls, browser storage, or exports.

## Future Semantic And Probe Gates

Before any future implementation, the prompt must name exact allowed and protected files and require:

- `npm.cmd run lint`.
- `npm.cmd run build`.
- `npm.cmd run check:report-semantics`.
- `npm.cmd run check:product-photo-probes`.
- `git diff --check`.
- Final `git status --short --branch`.
- Registration of `PRE_ANALYSIS_EVIDENCE_GATE_DEVELOPER_PROBE` in `scripts/run-product-photo-probes.cjs` if a probe file is added.
- Semantic guard coverage in `scripts/check-report-semantics.mjs` if a new boundary/probe is added.
- Receipt preservation probes for receipt image, PDF receipt, order screenshot, null/default, and receipt-like product-name cases.
- Unsupported/quarantine probes for product-photo-like, legacy `damage-photo`, damage/product/photo/crack, label/serial/model, packaging, and installation-context hints.
- Import scans proving no coupling to upload, `ClaimReviewWorkflow`, `TestEvidenceHarness`, live report adapter mapping, receipt parser, receipt scoring, receipt fixtures, product-photo runtime analyzer, product-photo routing adapter, providers, storage, integrations, or case queues.
- Static checks proving `analyzeEvidenceFile`, `LocalAnalysisResult`, report adapter signature, receipt parser/scoring/fixtures, upload files, UI components, and routes remain unchanged unless explicitly approved.
- Raw/private sentinel omission checks.
- Unsafe wording checks.

Future probe assertions should prove unsupported/product-photo-like decisions do not invoke OCR, metadata inspection, receipt parser, scoring, report adapter mapping, product-photo analyzer, upload/UI paths, providers, storage, integrations, or case queues.

## Browser And Privacy Gates

Browser QA is not required for this docs-only plan. It becomes required only if a later slice changes a rendered route, component, upload surface, workflow surface, or display host.

If browser QA is required later, it must verify:

- No product-photo or legacy damage-photo support appears in the live workflow unless explicitly approved.
- No upload/file input behavior changed outside scope.
- No new preview ownership, object URL handling, media rendering, filename display, or raw file metadata display appears outside scope.
- No route links from `/` or `/test-evidence` to a dev-only product-photo or adapter harness unless explicitly approved.
- No screenshots contain real evidence, uploaded previews, object URLs, filenames, raw metadata, private identifiers, or browser storage state.

Privacy review is required before any real photo, real metadata, provider call, storage, integration, case queue, export, screenshot, log, or prompt carries product-photo evidence.

## Stop Conditions

Stop future work if:

- Product-photo becomes live.
- Product-photo is routed to upload, UI, live report adapter mapping, or `analyzeEvidenceFile`.
- `analyzeEvidenceFile` changes without explicit runtime approval.
- `LocalAnalysisResult` migration begins without explicit approval.
- Receipt behavior changes unexpectedly.
- OCR or metadata processing runs on product-photo-like files in the future boundary.
- Real photos, real metadata fixtures, raw EXIF, original filenames, object URLs, image bytes, provider payloads, storage handles, integration handles, case queue paths, or private identifiers appear.
- Provider, storage, integration, case queue, database, auth, background job, or deployment paths appear.
- Unsafe wording implies evidence truth, external verification happened, customer wrongdoing, automatic disposition, support outcome, proof, or final claim outcome.
- Readiness/manual-review/no-live gates are hidden, ambiguous, or omitted.
- Required checks fail or cannot be interpreted safely.
- Worktree status shows unexpected runtime/code/component/route changes during docs-only work.

## Recommended Phase 2.4.10

Recommended next milestone: Phase 2.4.10 no-live `pre-analysis-evidence-gate` contract/probe implementation.

This should be a narrow implementation slice, not a dev-only adapter harness slice and not live runtime work.

Likely allowed future implementation files:

- `src/lib/analysis/pre-analysis-evidence-gate.ts`.
- `src/lib/analysis/pre-analysis-evidence-gate.probe.ts`.
- `scripts/run-product-photo-probes.cjs`, only to register the new probe.
- `scripts/check-report-semantics.mjs`, only to add semantic/import/privacy markers for the new boundary.
- Status docs and `AGENT_LOG.md`.

Protected files for Phase 2.4.10 unless Robert explicitly opens a broader runtime slice:

- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/types.ts`.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/scoring.ts`.
- `src/lib/analysis/receipt-parser.ts`.
- `src/lib/test-evidence/fixtures.ts`.
- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/UploadPanel.tsx`.
- `src/components/TestEvidenceHarness.tsx`.
- Routes, upload files, live report mapping, receipt fixtures, product-photo runtime analyzer/routing adapter, providers, storage, integrations, case queues, real photos, real metadata fixtures, deployment files, and package dependencies.

`PRODUCT_PHOTO_DEV_HARNESS_PLAN.md` remains appropriate for later, but dev-only harness work should wait until the pre-analysis gate contract/probe exists and passes. `REPO_SOURCE_OF_TRUTH.md` cleanup can wait unless Robert requests a tiny docs-only alignment pass.

Suggested next prompt:

```text
/claimguardagent run Phase 2.4.10 as a no-live pre-analysis-evidence-gate contract/probe implementation: add only src/lib/analysis/pre-analysis-evidence-gate.ts, src/lib/analysis/pre-analysis-evidence-gate.probe.ts, probe registration, semantic/import/privacy guards, and status docs; stop product-photo-like synthetic filename/type hints before OCR/metadata in a decision-only boundary without wiring it into analyzeEvidenceFile, upload, UI, live report adapter, LocalAnalysisResult, parser, scoring, fixtures, providers, storage, integrations, case queues, real photos, real metadata fixtures, deployment, or push.
```
