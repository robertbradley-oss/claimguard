# Phase 2.7.0 Live Opt-In Readiness Plan

This is a docs-only Phase 2.7.0 scope plan. It does not implement, wire, route, enable, or deploy anything.

Phase 2.6 is closed and pushed. Product-photo runtime remains non-live. The default-off `pre-analysis-evidence-gate-runtime` wrapper exists, but it remains unwired from live callers. `analyzeEvidenceFile` remains the live receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, and receipt behavior is unchanged.

## Phase 2.7.0 Goal

Define the narrowest safe readiness path before any future live opt-in to `analyzeEvidenceFileWithPreAnalysisGate`.

The core Phase 2.7 question is not "turn on product-photo analysis." It is: what must exist before ClaimGuard can safely opt a live caller into the default-off wrapper so unsupported/product-photo-like files can be stopped before OCR/metadata while receipt behavior stays unchanged?

## Non-Goals

- Do not wire `analyzeEvidenceFileWithPreAnalysisGate` into `ClaimReviewWorkflow`, upload, routes, or app runtime.
- Do not change `analyzeEvidenceFile`.
- Do not change `LocalAnalysisResult`.
- Do not add unsupported-evidence UI.
- Do not route product-photo evidence to `ProductPhotoReviewPanel`.
- Do not add product-photo analyzer behavior to live runtime.
- Do not change live report adapter mapping.
- Do not change receipt parser, scoring, fixtures, or `/test-evidence`.
- Do not add OCR/metadata processing for product-photo-like files.
- Do not add providers, storage, integrations, case queues, real photos, or real metadata fixtures.
- Do not deploy.

## Current Boundary To Preserve

The existing wrapper exports:

- `ENABLE_PRE_ANALYSIS_EVIDENCE_GATE_RUNTIME_GUARD: boolean = false`.
- `analyzeEvidenceFileWithPreAnalysisGate(file, options)`.
- `buildPreAnalysisEvidenceGateHintsFromFile(file, options)`.
- `UnsupportedEvidenceResult`.
- `PreAnalysisGateRuntimeResult`.

When the runtime guard is disabled, the wrapper delegates to the existing receipt analyzer and returns the existing receipt `LocalAnalysisResult` inside a wrapper result. When the runtime guard is enabled for direct/probe use, receipt allow paths still delegate to the existing receipt analyzer, while non-allow paths return `UnsupportedEvidenceResult` before OCR, metadata, analyzer, adapter, upload/UI/report/scoring/parser/fixture, provider/storage/integration/case-queue, or ProductPhotoReviewPanel paths run.

## Future Live Caller Opt-In Decision

Recommended future opt-in location: replace the live analysis call site only after a separately approved implementation slice.

Likely future call site:

- `ClaimReviewWorkflow` currently calls `analyzeEvidenceFile(selectedFile)` and maps the `LocalAnalysisResult` through the live receipt report adapter.

Why this is preferred:

- It keeps `analyzeEvidenceFile` as the receipt-only analyzer body.
- It avoids changing `LocalAnalysisResult`.
- It makes unsupported-evidence handling explicit at the workflow boundary.
- It allows receipt allow paths to preserve the existing receipt analyzer/report flow.

What this does not authorize:

- No caller substitution in Phase 2.7.0.
- No feature flag enablement.
- No unsupported-evidence UI state.
- No live product-photo analysis.

Rejected first opt-in locations:

- Inside `analyzeEvidenceFile`: too likely to pressure unsupported outcomes into `LocalAnalysisResult`.
- Live report adapter first: premature because unsupported evidence is not a receipt report.
- ProductPhotoReviewPanel route: wrong output surface; unsupported evidence is a stop state, not a product-photo analysis result.
- Upload-only branch: touches upload mechanics before the analysis result/display contract is ready.

## Unsupported-Evidence Reviewer State

A future reviewer state is required before any live caller can opt into the wrapper. It must be a small unsupported-evidence stop state, not a product-photo report and not a receipt report.

Required state model:

- Outcome: `unsupported-evidence`, `legacy-damage-photo-quarantine`, `product-photo-like-unsupported`, or `unknown-inconclusive`.
- Evidence label: neutral, broad, and not proof-oriented.
- Review summary: explain that the current receipt-only analysis flow cannot analyze this evidence type.
- Recommended support action: manual review only; request an eligible receipt document or route to a reviewer.
- Customer-safe wording: explain the limitation without accusing the customer or implying a final claim outcome.
- Limitations: external verification not performed, no automated analysis output produced, no OCR/metadata run for stopped files, and no product-photo analysis performed.
- Flags: `runtimeLive: false`, `productPhotoRuntimeLive: false`, `manualReviewOnly: true`, `futureReviewOutputProduced: false` until a display state is explicitly implemented.

Recommended neutral labels:

- `Unsupported evidence`
- `Product-photo-like evidence unsupported`
- `Legacy damage-photo terminology quarantined`
- `Evidence type inconclusive`

Recommended support-rep action wording:

- `Manual review only. Request an eligible receipt document or route the file to a reviewer.`
- `This file is not supported by the current receipt-only analysis flow. A clearer eligible receipt document may be needed, or the file can be reviewed manually.`

Forbidden wording:

- Proof, verified, valid, invalid, fake, fraud confirmed, manipulation confirmed.
- Approved, rejected, denied, automatic denial, final outcome.
- Any customer-accusation language.
- Any wording implying external verification happened.
- Receipt score or product-photo report wording for unsupported evidence.

## Receipt Preservation Requirements

Before any future implementation can opt a live caller into the wrapper:

- Receipt image allow path must return the same receipt `LocalAnalysisResult` through the same receipt report flow.
- PDF receipt allow path must return the same receipt `LocalAnalysisResult` through the same receipt report flow.
- Order screenshot/current default allow path must preserve existing behavior.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` must remain receipt-only.
- `LocalAnalysisResult` must remain receipt-shaped.
- Receipt parser, scoring, fixtures, and `/test-evidence` must remain unchanged unless a separate receipt-maintenance task explicitly opens them.
- Unsupported outcomes must not be forced into receipt report fields.

## Future Implementation Sequence

Recommended sequence after Phase 2.7.0 is reviewed:

1. Phase 2.7.1 docs-only unsupported-evidence reviewer state contract.
   - Finalize field names, copy, labels, display states, QA cases, and browser smoke expectations.
   - No runtime or UI implementation.

2. Phase 2.7.2 non-live unsupported-evidence display/mapping probe.
   - Add an isolated, synthetic-only contract/probe or dev-only host if needed.
   - It must consume derived unsupported state only.
   - It must not touch live upload, live analyzer, live report adapter, ProductPhotoReviewPanel routing, receipt parser/scoring/fixtures, providers, storage, integrations, or case queues.

3. Phase 2.7.3 live caller opt-in design checkpoint.
   - Review whether `ClaimReviewWorkflow` can safely call the wrapper while preserving receipt allow paths.
   - Define exact allowed/protected files and rollback path.
   - Still no implementation unless Robert explicitly approves.

4. Later implementation slice, only with explicit approval.
   - Replace the live caller with the wrapper behind a default-off path.
   - Add unsupported-evidence UI state only after the state contract and browser QA plan are accepted.
   - Keep product-photo analysis non-live.

## Required Gates Before Any Runtime Opt-In

- Robert explicitly approves the implementation slice and named allowed/protected files.
- `UnsupportedEvidenceResult` display contract is finalized.
- Unsupported-evidence state has semantic/privacy checks.
- Receipt allow-path preservation probes exist.
- Non-allow probes prove OCR/metadata/analyzer/report/UI/provider/storage/integration/case-queue paths are not invoked before the stop state.
- Browser/manual smoke plan exists for unsupported-evidence UI if any rendered state is added.
- Copy is reviewed for manual-review-only, non-accusatory wording.
- Rollback path is documented.

Required checks for any future implementation:

- `git status --short --branch`.
- `npm.cmd run lint`.
- `npm.cmd run build`.
- `npm.cmd run check:report-semantics`.
- `npm.cmd run check:product-photo-probes`.
- `git diff --check`.
- Targeted import scans for live runtime, upload, report adapter, ProductPhotoReviewPanel, providers, storage, integrations, and case queues.
- Browser checks if any rendered UI state changes.

## Protected Surfaces

- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/types.ts`.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/receipt-parser.ts`.
- `src/lib/analysis/scoring.ts`.
- `src/lib/test-evidence/`.
- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/UploadPanel.tsx`.
- `src/components/ProductPhotoReviewPanel.tsx`.
- `src/app/page.tsx`.
- `src/app/test-evidence/`.
- Upload files.
- Package scripts/dependencies.
- Providers, storage, integrations, case queues, deployment files.
- Real photos, raw OCR, raw EXIF, raw metadata, and real metadata fixtures.

These surfaces stay protected during Phase 2.7.0. Any future implementation must name allowed exceptions explicitly.

## Stop Conditions

Stop immediately if any future task:

- Wires the wrapper into a live caller without a completed unsupported-state contract.
- Enables product-photo runtime analysis.
- Changes `analyzeEvidenceFile` or `LocalAnalysisResult`.
- Runs OCR or metadata on product-photo-like non-allow files.
- Adds unsupported evidence into receipt report fields.
- Routes unsupported/product-photo-like evidence to ProductPhotoReviewPanel.
- Touches upload/UI/report mapping before the reviewer state is approved.
- Adds providers, storage, integrations, case queues, auth, database, network calls, or deployment.
- Uses real customer evidence, raw OCR, raw EXIF, raw metadata, original filenames, customer identifiers, ticket IDs, order IDs, claim IDs, evidence IDs, or case IDs.
- Uses proof, verification, final-outcome, denial, approval, rejection, wrongdoing, or customer-accusation wording.

## Phase 2.7.0 Decision

Phase 2.7.0 should remain planning-only. It is safe to proceed to a docs-only Phase 2.7.1 unsupported-evidence reviewer state contract after review. It is not yet safe to start runtime opt-in or UI implementation.

Recommended next task:

```text
/claimguardagent create a docs-only Phase 2.7.1 unsupported-evidence reviewer state contract; define exact display fields, neutral copy, semantic/privacy checks, browser smoke expectations, and receipt-preservation gates; do not implement UI, wire runtime, edit upload/report mapping/ProductPhotoReviewPanel/providers/storage/integrations/OCR/metadata/fixtures/parser/scoring/analyzer entrypoints, commit, push, or deploy
```
