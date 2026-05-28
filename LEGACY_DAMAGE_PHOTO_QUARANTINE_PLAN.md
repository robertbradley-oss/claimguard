# Legacy Damage-Photo Quarantine Plan

This is the Phase 2.4.5 docs-only legacy `damage-photo` quarantine and migration plan.

Product-photo runtime remains non-live. `runtimeLive` remains false, `manualReviewOnly` remains true, `analyzeEvidenceFile` remains the live receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, and receipt behavior remains unchanged.

This plan does not implement code, routes, components, upload behavior, analyzer runtime behavior, live report adapter mapping, scoring, parser behavior, fixtures, providers, storage, integrations, case queues, real photos, real metadata fixtures, deployment, or push work.

Phase 2.4.6 implementation note: the planned no-live classifier quarantine hardening is complete. The live classifier boundary now lives in `src/lib/analysis/analyzer-classifier.ts`, and legacy damage/product/photo/crack image filename cues collapse to the existing receipt/default path instead of returning `damage-photo`. This is classifier-label hardening only; a true pre-OCR/pre-metadata unsupported/quarantine boundary remains separate future work.

## 1. Supervisor Decision

The safest first future boundary to harden is the live filename/evidence-type classification boundary before the receipt-shaped analyzer path proceeds.

Future code hardening should prevent legacy `damage-photo` from entering the live receipt-era runtime as if it were canonical Phase 2 product-photo support. The preferred first rule is:

- Live filename classification must not return `damage-photo` as a canonical product-photo runtime type.
- Product-photo-looking image filenames must either continue through explicitly receipt-preserving behavior, collapse to a guarded unsupported/unknown receipt-era state if such a state is explicitly approved, or enter a separate non-live quarantine result before OCR, parsing, scoring, and report mapping.
- Any migration from legacy `damage-photo` to canonical `product-photo` requires a separate runtime-routing plan and explicit approval.
- `analyzeEvidenceFile` must not be changed unless a later prompt explicitly opens runtime work.
- Product-photo must not be exposed to upload, `ClaimReviewWorkflow`, `/test-evidence`, live report mapping, receipt scoring, parser behavior, fixtures, providers, storage, integrations, or case queues during this quarantine step.

## 2. Inventory Categories

Allowed docs-only historical references:

- `AGENTS.md`, `ROUTING.md`, `REPO_SOURCE_OF_TRUTH.md`, `ROADMAP.md`, `NEXT_STEPS.md`, `PHASE_2_PHOTO_EVIDENCE_PLAN.md`, `PRODUCT_PHOTO_ADAPTER_READINESS_PLAN.md`, `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md`, and `PRODUCT_PHOTO_RUNTIME_BLOCKERS_PLAN.md` may refer to `damage-photo` only as legacy receipt-era/mock terminology, compatibility alias, quarantine target, or historical phase context.

Allowed probe and quarantine references:

- Product-photo routing and adapter-readiness probes may keep `damage-photo` only as an explicit compatibility/quarantine scenario.
- `scripts/check-report-semantics.mjs` may keep quarantine marker checks that prove canonical product-photo analyzer and report-view-model boundaries exclude `damage-photo`.
- Future probes may use `damage-photo` only when the case name and expected result make quarantine, collapse, or explicit gated conversion obvious.

Allowed compatibility-alias references:

- `EvidenceTypeCompatibilityAlias` may continue to describe `damage-photo` as an alias to canonical `product-photo` with `subjectType: "damage-close-up"` while it remains non-live and guarded.
- `product-photo-recognition` may mention the alias only as dev/probe recognition context; that recognition must not be treated as live runtime permission.

Risky live/runtime classification references:

- `src/lib/analysis/analyzer.ts` currently contains the live filename classifier that can return `damage-photo` for image filenames containing product-photo-like cues.
- `analyzeEvidenceFile` consumes that classification and still returns `LocalAnalysisResult` through OCR, receipt parsing, metadata inspection, image heuristics, receipt-shaped scoring, and receipt report mapping.

Risky UI/workflow/report references:

- `src/components/ClaimReviewWorkflow.tsx` derives `evidenceType` from the live classifier, chooses mock/live-shaped reports from that type, previews selected images, and calls `analyzeEvidenceFile`.
- `src/components/UploadPanel.tsx` contains display branches for `report.evidenceType === "damage-photo"`.
- `src/lib/analysis/report-adapter.ts` maps `LocalAnalysisResult` to `MockAnalysisReport` and must remain receipt-live only.

Risky receipt-era/mock/live-shaped references:

- `src/lib/claim-data.ts` includes `damage-photo` in the legacy `EvidenceType` union and mock report/case data.
- `src/lib/analysis/scoring.ts` special-cases `damage-photo` inside receipt-era scoring and signal generation.
- `src/components/TestEvidenceHarness.tsx` is a receipt/manual QA harness and must not become a product-photo or legacy damage-photo runtime harness without a separate plan.

Harmless subtype references:

- `damage-close-up` and `clearer-damage-close-up` are product-photo subject/requested-view concepts, not the legacy `damage-photo` runtime type. They may remain canonical product-photo taxonomy terms.

## 3. Canonical Naming Rule

- `product-photo` is the only canonical Phase 2 photo evidence type.
- `damage-photo` is legacy receipt-era/mock compatibility terminology only.
- Future product-photo runtime must not accept `damage-photo` as canonical input.
- Any future `damage-photo` handling must quarantine, collapse unsupported, or migrate to `product-photo` only through an explicit gated conversion with semantic, probe, privacy, and receipt-preservation coverage.
- New product-photo docs, probes, harness cases, adapter outputs, and display surfaces must use `product-photo` unless they are explicitly testing legacy quarantine.

## 4. Receipt-Preservation Criteria

Future quarantine implementation must preserve:

- Existing receipt, PDF receipt, order screenshot, and normal receipt-image behavior.
- `analyzeEvidenceFile` as the live receipt analyzer entrypoint, unless runtime work is explicitly approved.
- `LocalAnalysisResult` as receipt-shaped.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` as receipt-only.
- Receipt OCR, parser, source classification, scoring, score breakdown, report semantics, fixtures, `/test-evidence`, and upload behavior unless explicitly scoped later.
- Existing privacy-safe export behavior for receipt analysis.
- Existing check behavior for `check:report-semantics` and `check:product-photo-probes`.

Future quarantine implementation must not:

- Wire product-photo into live upload or runtime analysis.
- Insert product-photo UI into `ClaimReviewWorkflow`.
- Add product-photo live report adapter mapping.
- Change receipt parser/scoring/fixtures as a shortcut for product-photo support.
- Add real photos, real metadata fixtures, providers, storage, integrations, or case queues.

## 5. Future Semantic And Probe Gates

Before any future quarantine implementation, the implementation prompt must name exact allowed and protected files and require:

- `npm.cmd run lint`.
- `npm.cmd run build`.
- `npm.cmd run check:report-semantics`.
- `npm.cmd run check:product-photo-probes`.
- `git diff --check`.
- Final `git status --short --branch`.
- Static scans proving `product-photo` runtime is still non-live.
- Static scans proving `analyzeEvidenceFile`, `LocalAnalysisResult`, upload files, `ClaimReviewWorkflow`, live report adapter mapping, receipt parser, receipt fixtures, providers, storage, integrations, and case queues are untouched unless explicitly approved.
- A quarantine/probe marker proving `damage-photo` cannot become canonical product-photo runtime.
- Active or equivalent coverage for analyzer-routing guard behavior before any runtime-facing hardening. The existing `analyzer-routing.probe.ts` has useful guard cases but is not currently imported by `check:product-photo-probes`.
- Canonical product-photo boundary checks must continue to reject `damage-photo` in product-photo analyzer and product-photo report-view-model files.
- Unsafe wording checks must continue to block proof, external-verification, customer-accusation, final-outcome, approval, rejection, denial, and automatic-disposition language.

Future semantic markers should distinguish:

- Legacy classifier quarantine.
- Canonical product-photo runtime still non-live.
- Receipt analyzer entrypoint preserved.
- Receipt report adapter signature preserved.
- Product-photo adapter/readiness quarantine still active.

## 6. Future Browser And Privacy Gates

Browser QA is not required for this docs-only plan. It becomes required only if a later rendered dev surface, upload surface, live workflow surface, or display component changes.

If browser QA is required later, it must verify:

- No product-photo or legacy damage-photo UI appears in the live workflow unless explicitly approved.
- No upload/file input behavior changed outside scope.
- No image/media preview ownership, object URL handling, filename display, or file metadata display changed outside scope.
- No route links from `/` or `/test-evidence` to a dev-only product-photo or adapter harness unless explicitly approved.
- No console errors, horizontal overflow, text overlap, duplicate ARIA IDs, or primary nested scrolling on changed surfaces.

Privacy gates for future work:

- No real photos.
- No real metadata fixtures.
- No raw filenames, raw EXIF, raw metadata objects, precise timestamps, GPS coordinates, image bytes, image buffers, object URLs, image URLs, raw label values, raw serial/model/barcode/QR values, customer identifiers, order IDs, ticket IDs, evidence IDs, case IDs, provider payloads, storage handles, integration handles, or case queue handles in docs, probes, fixtures, screenshots, logs, prompts, or commits.
- Product-photo evidence must remain derived-summary-only until a separate privacy/data-flow review approves more.
- `/test-evidence` must remain receipt/manual QA unless a separate plan explicitly opens product-photo QA behavior.

## 7. Stop Conditions

Stop immediately if:

- Any live product-photo routing appears.
- `damage-photo` becomes canonical product-photo runtime input.
- `analyzeEvidenceFile` changes without explicit runtime approval.
- `LocalAnalysisResult` changes.
- Upload files, `ClaimReviewWorkflow`, `/test-evidence`, or live report adapter mapping change unexpectedly.
- Receipt parser, receipt scoring, receipt fixtures, or receipt report semantics change unexpectedly.
- Product-photo adapter readiness is treated as live runtime readiness.
- Unsafe wording implies proof, external verification happened, customer wrongdoing, automatic disposition, approval, rejection, denial, or final claim outcome.
- Real photos, raw metadata, raw filenames, object URLs, image bytes, provider/storage/integration/case queue paths, or private identifiers appear.
- Required semantic/probe/build/lint/diff checks fail or cannot be interpreted safely.
- Browser QA is required by a rendered surface change but cannot run.
- The worktree shows unexpected runtime/code/component/route changes during docs-only work.

## 8. Recommended Phase 2.4.6 Milestone

Recommended next milestone: Phase 2.4.6 no-live legacy `damage-photo` classifier quarantine hardening.

Status: complete. The implementation stayed no-live and did not make product-photo runtime active.

Files used for Phase 2.4.6 hardening:

- `src/lib/analysis/analyzer-classifier.ts`.
- `src/lib/analysis/analyzer-classifier.probe.ts`.
- `src/lib/analysis/analyzer.ts`, only to use and re-export the classifier boundary while preserving `analyzeEvidenceFile`.
- `src/lib/analysis/analyzer-routing.probe.ts`, only to make the existing guard probe active and report failures clearly.
- `scripts/check-report-semantics.mjs`.
- `scripts/run-product-photo-probes.cjs`.
- Status docs and `AGENT_LOG.md`.

Protected files for Phase 2.4.6 unless separately approved:

- The `analyzeEvidenceFile` runtime body, OCR invocation, parser invocation, metadata inspection, image heuristics, score construction, report adapter mapping, and returned `LocalAnalysisResult` shape.
- `src/lib/analysis/types.ts`.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/scoring.ts`, unless a later prompt explicitly opens receipt-era score cleanup and receipt preservation probes.
- `src/lib/analysis/receipt-parser.ts`.
- `src/lib/claim-data.ts`, unless a later mock-data migration slice explicitly opens it.
- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/UploadPanel.tsx`.
- `src/components/TestEvidenceHarness.tsx`.
- `src/app/page.tsx`, `src/app/test-evidence/page.tsx`, and dev render-host routes.
- Receipt fixtures, tuning thresholds, package dependencies, providers, storage, integrations, case queues, databases, auth, background jobs, and deployment files.

Phase 2.4.6 pass criteria:

- Product-photo runtime remains non-live.
- `damage-photo` no longer reaches the live receipt-era analyzer path as canonical product-photo support.
- Receipt, PDF, screenshot, and normal receipt-image behavior is preserved.
- `analyzeEvidenceFile` remains the live receipt analyzer entrypoint unless explicitly approved.
- `LocalAnalysisResult` remains unchanged and receipt-shaped.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` remains receipt-only.
- Upload/UI/live report/scoring/parser/fixtures remain untouched unless explicitly approved.
- Semantic and probe gates prove classifier-label quarantine, receipt classification preservation, no live product-photo routing, analyzer-routing import isolation, and no new private evidence fixtures or probe data.

Phase 2.4.6 pass status:

- Product-photo runtime remains non-live.
- `damage-photo` no longer reaches the live receipt-era analyzer path as a filename-classifier output; product-photo-like filenames still follow the existing receipt/default analyzer path until a separate unsupported/quarantine boundary is authorized.
- PDF, screenshot, null/default, normal receipt image, and legacy product-photo-like filename cue classification are covered by `ANALYZER_CLASSIFIER_QUARANTINE_DEVELOPER_PROBE`.
- Analyzer-routing guard coverage is now active in `check:product-photo-probes`, and semantic guards now scan `analyzer-routing.ts` for forbidden live/runtime imports.
- `analyzeEvidenceFile`, `LocalAnalysisResult`, upload, UI, live report mapping, scoring, parser, fixtures, providers, storage, integrations, and case queues remain protected.

Phase 2.4.8 review status:

- The classifier quarantine is complete enough for its intended no-live scope.
- Product-photo-like filenames still follow the existing receipt/default analyzer path after classifier collapse, so a true pre-OCR/pre-metadata unsupported boundary remains future work.
- Dev-only adapter harness work should wait until that unsupported-boundary plan is written.

Phase 2.4.9 planning status:

- The docs-only unsupported-boundary plan now lives in `PRODUCT_PHOTO_UNSUPPORTED_BOUNDARY_PLAN.md`.
- The recommended future boundary name is `pre-analysis-evidence-gate`.
- Future no-live implementation should stop product-photo-like synthetic filename/type hints before OCR/metadata processing while preserving receipt/PDF/screenshot behavior.
- Legacy `damage-photo` remains quarantine-only and non-canonical.
- Dev-only adapter harness work should continue to wait until the pre-analysis gate contract/probe exists and passes.

Suggested next prompt:

```text
/claimguardagent run Phase 2.4.10 as a no-live pre-analysis-evidence-gate contract/probe implementation: add only src/lib/analysis/pre-analysis-evidence-gate.ts, src/lib/analysis/pre-analysis-evidence-gate.probe.ts, probe registration, semantic/import/privacy guards, and status docs; stop product-photo-like synthetic filename/type hints before OCR/metadata in a decision-only boundary without wiring it into analyzeEvidenceFile, upload, UI, live report adapter, LocalAnalysisResult, parser, scoring, fixtures, providers, storage, integrations, case queues, real photos, real metadata fixtures, deployment, or push.
```
