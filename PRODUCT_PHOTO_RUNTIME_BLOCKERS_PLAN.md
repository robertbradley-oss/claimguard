# Product-Photo Runtime Blockers Plan

This is the Phase 2.4.4 docs-only closeout and next-runtime-blockers plan.

Phase 2.4 adapter readiness planning is complete enough to close the adapter-readiness planning checkpoint. The completed adapter readiness work proves a non-live, dev/probe-only contract shape for sanitized product-photo readiness outputs. It does not prove live runtime readiness, upload classification readiness, UI display readiness, live report adapter readiness, `analyzeEvidenceFile` integration readiness, `LocalAnalysisResult` migration readiness, provider readiness, storage readiness, integration readiness, or case workflow readiness.

Product-photo runtime remains non-live. `runtimeLive` remains false, `manualReviewOnly` remains true, `analyzeEvidenceFile` remains the live receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, and receipt behavior remains unchanged.

Phase 2.4.5 note: the docs-only legacy `damage-photo` quarantine/migration plan now lives in `LEGACY_DAMAGE_PHOTO_QUARANTINE_PLAN.md`. It chooses filename/evidence-type classification before live analyzer execution as the safest first future hardening boundary and recommends Phase 2.4.6 as a no-live classifier quarantine hardening slice.

Phase 2.4.6 note: no-live legacy classifier quarantine hardening is complete. The live filename/evidence-type classifier now lives in `src/lib/analysis/analyzer-classifier.ts` and collapses legacy damage/product/photo/crack image filename cues to the existing receipt/default path instead of returning `damage-photo`.

## Adapter Readiness Closeout

Complete:

- Product-photo analyzer boundary exists and is hardened for non-live use.
- Product-photo report view-model boundary exists.
- Guarded non-live adapter contract exists.
- Dev-only adapter review harness plan exists.
- `check:product-photo-probes` exists and passes with 10 imported analysis probe modules, including classifier quarantine and analyzer-routing guard probes.
- Adapter readiness quarantines legacy `damage-photo` at top-level input, nested analysis-result input, and nested report-view-model input.
- The dev routing adapter refuses to build product-photo details for the legacy alias.
- The adapter readiness output keeps `runtimeLive: false`, `manualReviewOnly: true`, canonical `product-photo`, privacy omission flags, isolation flags, and safe support wording.

Still non-live:

- Adapter readiness output is a contract/readiness-shape result only.
- `readinessAccepted` means the adapter contract accepted a sanitized shape; it does not mean runtime-ready, customer-ready, support-decision-ready, externally verified, or safe for live routing.
- Product-photo results are not routed through the active app.
- Product-photo display is not inserted into `ClaimReviewWorkflow`.
- Upload classification remains receipt-era/live-path behavior only.

Blocked:

- Product-photo runtime routing.
- Upload classification or upload UI changes.
- Live report adapter mapping.
- `analyzeEvidenceFile` product-photo integration.
- `LocalAnalysisResult` migration.
- Receipt parser, scoring, and fixture changes.
- Real photos or real metadata fixtures.
- Provider, storage, integration, or case workflow work.
- Deployment.

Do not infer live readiness from passing adapter probes. Passing probes mean the non-live contract stayed isolated and safe.

## Runtime Blocker Inventory

The remaining pre-runtime blockers are:

- Legacy live receipt-era `damage-photo` filename classification has been hardened in `getEvidenceTypeFromFile`.
- Legacy `damage-photo` no longer enters the live receipt-shaped analyzer path as the classifier output; product-photo-like filenames still follow the existing receipt/default analyzer path until a separate unsupported/quarantine boundary is authorized.
- Recognition, analyzer-routing decisions, and adapter-readiness quarantine do not yet use one uniform first-boundary rule for legacy `damage-photo`.
- `readinessAccepted` and `inputKind` consumer gating is not implemented in a live consumer and must not be treated as live routing permission.
- Dev-only adapter review harness is planned but not implemented.
- Product-photo upload classification is not implemented.
- Product-photo live report adapter mapping is not implemented.
- Product-photo `LocalAnalysisResult` migration is not implemented and remains blocked.
- Real photo fixtures and real metadata fixtures are not approved.
- Provider, storage, integration, and case workflow data flows are not approved.
- The existing `check:product-photo-probes` runner now imports 10 analysis probe modules. Component and route probes must still not be assumed active unless registered separately.
- Phase 2.4 planning docs are not currently part of `check:report-semantics`; future docs-safety coverage must be explicit.
- Existing live receipt metadata internals can contain raw-ish metadata such as original filename, exact size, exact modified time, exact dimensions, and EXIF. Future product-photo surfaces must not expose those fields.
- Existing synthetic visual host/browser QA is not a substitute for any future adapter harness browser QA.

## Legacy `damage-photo` Quarantine Planning

Legacy `damage-photo` is receipt-era/mock compatibility. It is not canonical product-photo runtime support.

Known legacy areas:

- Live filename classification now collapses product-photo-like image filename cues away from `damage-photo`.
- The active workflow can pass selected files to `analyzeEvidenceFile`, which still returns `LocalAnalysisResult`.
- Receipt scoring contains special-case behavior for `damage-photo`.
- Mock/demo claim data may still contain `damage-photo` cases and product-photo-like wording.
- Product-photo recognition can normalize declared `damage-photo` to `product-photo` for non-live/dev recognition context.
- Adapter readiness quarantines `damage-photo` instead of accepting it.

Why this matters:

- A product-photo-looking filename no longer reaches the live receipt-shaped analyzer as `damage-photo`; it still follows the existing receipt/default classification path until a separately authorized unsupported/quarantine boundary or product-photo runtime plan changes that behavior.
- A live UI may label the evidence as product damage while showing receipt OCR/source-classification behavior.
- This can confuse legacy mock support with canonical `product-photo`.
- It creates a privacy risk if product-photo-like evidence flows through receipt metadata internals before a product-photo privacy model is approved.

Any future broader quarantine/migration task should decide one first-boundary rule:

- Either keep the live file classifier from returning `damage-photo` and collapse the legacy path to receipt/unknown/unsupported receipt-era behavior.
- Or preserve a clearly guarded, non-live legacy quarantine result before `analyzeEvidenceFile` performs receipt OCR/parsing/scoring.
- Or document a staged migration from receipt-era `damage-photo` to canonical `product-photo` only after a separate runtime-routing plan is approved.

A future task should preserve:

- Existing receipt behavior for normal receipt, PDF, screenshot, and unknown inputs.
- `analyzeEvidenceFile` as the live receipt analyzer entrypoint unless the prompt explicitly opens runtime integration.
- `LocalAnalysisResult` as receipt-shaped.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` as receipt-only.
- Upload and UI behavior unless explicitly opened.
- No real photos, raw metadata fixtures, providers, storage, integrations, or case queues.

A future task should not:

- Make `damage-photo` canonical product-photo runtime input.
- Wire product-photo into `analyzeEvidenceFile`.
- Insert product-photo UI into `ClaimReviewWorkflow`.
- Add live report adapter mapping.
- Change receipt parser/scoring/fixtures unless explicitly needed for a narrow no-live quarantine and protected by probes.
- Add provider calls or storage.
- Use `claim-data` as product-photo harness or case workflow truth.

## Future Task Gates

Docs-only planning gate:

- May update planning/status docs and logs only.
- Must not edit `src/`, scripts, package files, fixtures, routes, components, analyzer/runtime code, upload code, report adapter code, scoring, parser, providers, storage, integrations, or case queues.
- Must run `git diff --check` and the requested npm checks.

No-live implementation gate:

- Requires explicit Robert approval.
- Must name exact allowed files and protected files before editing.
- Must prove no product-photo runtime becomes live.
- Must preserve receipt behavior and `LocalAnalysisResult`.
- Must include probe or static boundary coverage for any changed code.

Dev-only harness gate:

- Must use literal synthetic cases only.
- Must not call adapter readiness from a route/component.
- Must show `readinessAccepted`, `inputKind`, `runtimeLive: false`, and `manualReviewOnly: true` together.
- Must distinguish contract accepted from runtime ready.
- Must add semantic/privacy/import coverage for every new harness file.
- Must not value-import `product-photo-routing-adapter` into a route.

Browser QA gate:

- Required for any rendered dev surface.
- Must verify desktop and mobile layouts, no duplicate ARIA IDs, no upload/file/media controls, no object/image/data URLs, no horizontal overflow, no overlap, visible dev-only/non-live banner, visible external-verification-not-performed copy, and no links from `/` or `/test-evidence`.
- Must not capture real evidence, uploaded previews, filenames, metadata, browser storage state, or object URLs.

Privacy/data-flow review gate:

- Required before real photos, real metadata, provider calls, storage, integrations, case queues, exports, screenshots, logs, or prompts carry product-photo evidence.
- Must cover evidence egress, redaction, provider retention, logs, provider IDs, storage handles, queue IDs, audit history, deletion, screenshots, and export policy.

Explicit Robert approval gate:

- Required before any live runtime, upload classification, UI insertion, live report mapping, `analyzeEvidenceFile` integration, `LocalAnalysisResult` migration, provider/storage/integration/case workflow, real-photo fixture, real-metadata fixture, deployment, push, or dependency change.

## Criteria Before Future Work

Before dev-only harness implementation:

- Phase 2.4.3 plan remains accepted.
- Exact route/render/probe files are approved.
- All cases are literal synthetic readiness outputs.
- No value import from adapter readiness runtime module.
- Harness files are added to semantic/privacy/import checks.
- Browser QA plan exists.

Before product-photo UI display:

- Display consumes only product-photo-specific safe view models.
- No receipt-only fields, raw metadata, image preview ownership, object URLs, file handles, provider output, or final outcome wording.
- Duplicate-ID and multi-case rendering concerns are resolved if reusing existing panel code.
- Browser QA passes.

Before upload classification:

- Legacy `damage-photo` classification is quarantined or migrated.
- Classifier quarantine remains covered by the active analyzer-classifier probe.
- Product-photo classification is explicitly planned as non-live or live with Robert approval.
- Upload mechanics, accepted file types, privacy posture, and reviewer copy are reviewed.

Before live report adapter mapping:

- Shared result migration or product-photo-specific report mapping is approved.
- Receipt report adapter remains receipt-only until explicitly changed.
- External verification remains not performed.
- Score/confidence/priority semantics remain separate.

Before `analyzeEvidenceFile` integration:

- Runtime-routing plan is approved.
- Legacy `damage-photo` path is quarantined or migrated.
- `LocalAnalysisResult` migration or an alternative shared-result path is approved.
- Receipt behavior preservation probes exist.

Before `LocalAnalysisResult` migration:

- Shared evidence result contract is approved.
- Receipt report, UI, test-evidence, scoring, parser, fixture, and privacy impacts are planned.
- Backward compatibility and migration probes exist.

Before provider/storage/integration/case workflow:

- Privacy/data-flow review is complete.
- Retention, audit, deletion, export, logging, and credential boundaries are defined.
- Real evidence handling is explicitly approved.

## Stop Conditions

Stop future work if:

- Any live runtime import appears during docs-only or no-live work.
- Product-photo touches `analyzeEvidenceFile`, `LocalAnalysisResult`, live report adapter mapping, upload files, `ClaimReviewWorkflow`, scoring, parser, fixtures, providers, storage, integrations, or case queues outside an explicitly approved slice.
- Legacy `damage-photo` is treated as canonical product-photo runtime input.
- `readinessAccepted` is presented as runtime-ready.
- `inputKind`, `runtimeLive: false`, or `manualReviewOnly: true` is hidden.
- Real photos, real metadata fixtures, raw EXIF, original filenames, object URLs, image URLs, image bytes, provider payloads, storage handles, integration handles, queue handles, customer identifiers, order IDs, ticket IDs, or case IDs enter docs, probes, fixtures, screenshots, prompts, logs, or commits.
- Unsafe wording implies proof, external verification, customer wrongdoing, automatic disposition, approval, rejection, denial, or final outcome.
- New docs, harness, display, or probe files lack semantic/privacy/import coverage.
- Required checks fail or cannot be interpreted safely.
- Browser QA is required but cannot be run.
- Worktree status shows unexpected runtime/code/component/route changes during docs-only work.

## Phase 2.4.5 Decision, Phase 2.4.6 Hardening, And Recommended Phase 2.4.7

Phase 2.4.5 is complete as the docs-only legacy `damage-photo` quarantine/migration plan in `LEGACY_DAMAGE_PHOTO_QUARANTINE_PLAN.md`.

Decision:

- `product-photo` is the only canonical Phase 2 photo evidence type.
- `damage-photo` is legacy receipt-era/mock compatibility terminology only.
- Future product-photo runtime must not accept `damage-photo` as canonical input.
- The safest first future hardening boundary is live filename/evidence-type classification before `analyzeEvidenceFile` proceeds through receipt-shaped OCR, parsing, scoring, and report mapping.
- Future `damage-photo` handling must quarantine, collapse unsupported, or migrate to `product-photo` only through explicit gated conversion.

Phase 2.4.6 is complete as no-live legacy `damage-photo` classifier quarantine hardening:

- The live classifier boundary was isolated in `src/lib/analysis/analyzer-classifier.ts`.
- Legacy damage/product/photo/crack image filename cues collapse to the existing receipt/default path instead of returning `damage-photo`.
- This is classifier-label hardening only, not a pre-OCR/pre-metadata product-photo privacy boundary.
- `src/lib/analysis/analyzer.ts` still owns the receipt-shaped `analyzeEvidenceFile` body and does not run product-photo analysis.
- `src/lib/analysis/analyzer-classifier.probe.ts` covers classifier quarantine and receipt/PDF/screenshot preservation.
- `check:product-photo-probes` imports 10 modules, including classifier quarantine and analyzer-routing guard probes.
- `check:report-semantics` covers the classifier quarantine markers, analyzer-routing forbidden imports, and active probe registrations.

The safest next milestone is Phase 2.4.7: review-only classifier quarantine closeout. Do not start dev-only adapter harness implementation, product-photo upload classification, live report mapping, `analyzeEvidenceFile` integration, `LocalAnalysisResult` migration, provider work, storage, integrations, or case workflow before this hardening is reviewed.

Likely allowed files for Phase 2.4.7 review-only status updates must be named by the future prompt and should stay narrow:

- `NEXT_STEPS.md`.
- `PHASE_2_PHOTO_EVIDENCE_PLAN.md`.
- `PRODUCT_PHOTO_RUNTIME_BLOCKERS_PLAN.md`.
- `LEGACY_DAMAGE_PHOTO_QUARANTINE_PLAN.md`.
- `AGENT_LOG.md`.

Protected files for Phase 2.4.7 unless separately authorized:

- The `analyzeEvidenceFile` runtime body and returned `LocalAnalysisResult` shape.
- `src/lib/analysis/analyzer-classifier.ts`.
- `src/lib/analysis/analyzer-classifier.probe.ts`.
- `src/lib/analysis/types.ts`.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/scoring.ts`, unless receipt-era score cleanup is explicitly opened.
- `src/lib/analysis/receipt-parser.ts`.
- `src/lib/claim-data.ts`, unless a mock-data migration slice is explicitly opened.
- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/UploadPanel.tsx`.
- `src/components/TestEvidenceHarness.tsx`.
- Routes, upload files, receipt fixtures, package dependencies, providers, storage, integrations, case queues, databases, auth, background jobs, deployment files, real photos, and real metadata fixtures.

If Robert later opens more no-live code hardening, that prompt should require lint, build, report semantics, product-photo probes, diff check, final status, and explicit receipt-preservation/quarantine proof before commit.
