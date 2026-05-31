# ClaimGuard Next Steps

This file is the near-term operational queue. Keep it short, current, and actionable.

Use `ROADMAP.md` for durable product roadmap, future modules, and phase definitions.

## Current Checkpoint

- Phase 1 Receipt Intelligence is closed, pushed, deployed, and production-smoked.
- Post-Phase-1 evidence workspace polish is live from commit `19ef25e`.
- Phase 2.0 scaffold work is closed.
- Phase 2.1 Product Photo Local Heuristic Design is reviewed and closed for the current planning slice.
- Phase 2.2 Product Photo Boundary and Display Readiness is closed. It produced small, local-only, manual-review-support-only, intentionally unwired helper, boundary, probe, display, and visual QA surfaces without making product-photo runtime live.
- Phase 2.3 analyzer hardening is closed after the no-live-wiring readiness closeout. Latest pushed checkpoint remains `89b694d` (`fix: harden product photo analyzer readiness boundaries`).
- Phase 2.4.1 guarded non-live product-photo adapter contract/probe implementation adds only a dev/probe-only adapter readiness boundary inside the isolated product-photo adapter module plus active probes/semantic guards; it does not add product-photo runtime routing, upload wiring, `ClaimReviewWorkflow` insertion, live report adapter mapping, scoring, parser behavior, fixtures, providers, storage, integrations, case queues, real photos, or real metadata fixtures.
- Phase 2.4.2 is complete, review-only, and clean. Product-photo runtime remains non-live; `runtimeLive` remains false; `manualReviewOnly` remains true; `analyzeEvidenceFile` remains the live receipt analyzer entrypoint; `LocalAnalysisResult` remains receipt-shaped; receipt behavior remains unchanged.
- Phase 2.4.3 is a docs-only dev-only adapter review harness plan in `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md`. It plans a future synthetic-only display surface for adapter readiness outputs only; it does not implement a route, component, harness, runtime adapter execution, upload path, UI insertion, report mapping, provider, storage, integration, case queue, real photo, or real metadata fixture.
- Phase 2.4.4 closes adapter readiness planning as complete enough for the non-live checkpoint and records the next runtime blockers in `PRODUCT_PHOTO_RUNTIME_BLOCKERS_PLAN.md`. The main blocker is the legacy live receipt-era `damage-photo` filename classification path, which must be quarantined or migrated before any product-photo runtime, upload, UI, live report mapping, `analyzeEvidenceFile`, `LocalAnalysisResult`, provider, storage, integration, or case workflow work.
- Phase 2.4.5 is complete as a docs-only legacy `damage-photo` quarantine/migration plan in `LEGACY_DAMAGE_PHOTO_QUARANTINE_PLAN.md`. It chooses the safest first future hardening boundary: filename/evidence-type classification before the live receipt-shaped analyzer path proceeds. The plan keeps `product-photo` canonical, treats `damage-photo` as legacy receipt-era/mock compatibility only, preserves receipt behavior, and defines allowed/protected files, semantic/probe/browser/privacy gates, stop conditions, and the recommended Phase 2.4.6 milestone.
- Phase 2.4.6 is complete as a no-live legacy `damage-photo` classifier quarantine hardening slice. The live classifier now lives in `src/lib/analysis/analyzer-classifier.ts`; product/damage/photo/crack image filename cues collapse to the existing receipt/default path instead of returning `damage-photo`; this is classifier-label hardening, not a pre-OCR/pre-metadata privacy boundary; `analyzeEvidenceFile` still uses the receipt-shaped analyzer body; `LocalAnalysisResult` remains unchanged; receipt/PDF/screenshot classification is covered by `src/lib/analysis/analyzer-classifier.probe.ts`; and `check:product-photo-probes` now actively imports 10 modules, including the classifier quarantine probe and analyzer-routing guard probe.
- Phase 2.4.7 is closed, pushed, and clean at `8335e09` (`fix: quarantine legacy damage photo classifier`).
- Phase 2.4.8 is complete as a review-only post-classifier quarantine readiness checkpoint. The classifier quarantine is complete enough for its intended no-live scope, but product-photo-like filenames still collapse into the existing receipt/default analyzer path after classification. That residual risk is acceptable only short-term and should be handled next with pre-OCR/pre-metadata unsupported-boundary planning before dev harness, UI, upload, report adapter, runtime, provider, storage, integration, or case workflow work.
- Phase 2.4.9 is complete as docs-only pre-OCR/pre-metadata unsupported-boundary planning in `PRODUCT_PHOTO_UNSUPPORTED_BOUNDARY_PLAN.md`. The recommended future boundary name is `pre-analysis-evidence-gate`; the future no-live contract/probe should stop product-photo-like synthetic filename/type hints before OCR and metadata processing while preserving receipt/PDF/screenshot behavior. Dev-only adapter harness work should wait until that gate contract/probe exists and passes.
- Phase 2.4.10 is complete as a no-live `pre-analysis-evidence-gate` contract/probe implementation. `src/lib/analysis/pre-analysis-evidence-gate.ts` adds a fully self-contained, decision-only boundary (`buildPreAnalysisEvidenceGateDecision`, `PRE_ANALYSIS_EVIDENCE_GATE_STATUS`) that classifies synthetic filename/type/category hints into `allow-receipt-default-path`, `unsupported-evidence`, `legacy-damage-photo-quarantine`, `product-photo-like-unsupported`, or `unknown-inconclusive` before any OCR/metadata processing. Receipt/PDF/screenshot/order hints preserve the existing receipt/default path; product-photo-like and legacy damage-photo hints are stopped non-live with explicit `runtimeLive: false`, `manualReviewOnly: true`, and no-OCR/metadata/analyzer/adapter/upload/UI/report/provider/storage/integration/case-queue markers. `src/lib/analysis/pre-analysis-evidence-gate.probe.ts` proves every outcome, no-live markers, no raw-filename/private leakage, no unsafe wording, and import-boundary isolation, and is registered with `check:product-photo-probes` (now 11 modules). The gate imports nothing (`@/`-free), is not wired into upload, UI, the live report adapter, the live receipt analyzer entrypoint, or runtime, and adds no OCR/metadata/provider/storage/integration/case-queue work. Receipt behavior, the live receipt-shaped result, and `damage-photo` legacy/non-canonical status are unchanged.
- Phase 2.6.0 is a docs-only runtime-facing scope plan in `PHASE_2_6_RUNTIME_SCOPE_PLAN.md`. It defines Phase 2.6 as the first runtime-facing planning phase (no implementation), documents the current live `analyzeEvidenceFile` pipeline (classify → OCR → parse/metadata/score → receipt-shaped `LocalAnalysisResult`), and identifies the safest eventual first runtime slice as a guard-only `pre-analysis-evidence-gate` wiring that blocks/quarantines product-photo-like and unsupported files before OCR/metadata while preserving receipt/PDF/screenshot/default behavior and never analyzing a product photo. It records sequence options A–E, prerequisites (Robert approval, branch-location decision, privacy-safe File→hints adapter, additive unsupported result that avoids `LocalAnalysisResult` migration, default-off flag, receipt-preservation probes), upload/UI/report sequencing, privacy/data-flow gates, required checks, stop conditions, and recommends Phase 2.6.1 as a docs-only guard-only gate-wiring design spike (or a pause + GUI browser-QA pass). No code, route, component, runtime, or fixture changed; product-photo runtime stays non-live and the gate stays decision-only and unwired.
- Phase 2.6.1 is a docs-only guard-only gate-wiring design spike in `PHASE_2_6_GATE_WIRING_DESIGN_SPIKE.md`. It recommends a future Phase 2.6.2 default-off thin wrapper/probe implementation, not an in-place `analyzeEvidenceFile` migration and not UI/upload/report-adapter wiring. The future wrapper would build privacy-safe File-to-hints input from filename/MIME/declared category only, return unchanged receipt `LocalAnalysisResult` on allow paths, return an additive `UnsupportedEvidenceResult` for non-allow paths before OCR/metadata, and keep product-photo analyzer/report/UI paths non-live. No code, route, component, runtime, analyzer, upload, report adapter, parser, scoring, fixture, provider, storage, integration, case-queue, real-photo, real-metadata, deployment, or push work was added.
- Phase 2.6.2 is complete and pushed as `df817b0` (`feat: add default-off pre-analysis gate wrapper`). `src/lib/analysis/pre-analysis-evidence-gate-runtime.ts` adds `analyzeEvidenceFileWithPreAnalysisGate`, `ENABLE_PRE_ANALYSIS_EVIDENCE_GATE_RUNTIME_GUARD: boolean = false`, `buildPreAnalysisEvidenceGateHintsFromFile`, and a local additive `UnsupportedEvidenceResult`/`PreAnalysisGateRuntimeResult` union. `src/lib/analysis/pre-analysis-evidence-gate-runtime.probe.ts` proves disabled/default-off delegation, enabled allow-path delegation, product-photo-like/legacy damage-photo/unsupported/unknown non-allow blocking before analyzer calls, conflict handling where damage/product cues win over receipt-ish hints, private filename omission, unsupported-result shape safety, and live-path import isolation. The probe is registered in `check:product-photo-probes` (12 modules). The wrapper is not imported by live UI/upload/report/routes and product-photo runtime remains non-live.
- Phase 2.6 is closed after pushed commit `6f3170a` (`fix: tighten unsupported evidence wording guards`). The closeout review confirmed `main` clean and synced with `origin/main`; product-photo runtime non-live; the wrapper default-off and unwired from live callers; `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt behavior, UI/upload/report/scoring/parser/fixtures unchanged; no ProductPhotoReviewPanel routing added by `6f3170a`; no providers/storage/integrations/case queues; no OCR/metadata processing; and no deployment.
- Phase 2.7.0 is a docs-only live-opt-in readiness plan in `PHASE_2_7_LIVE_OPT_IN_READINESS_PLAN.md`. It defines the narrowest safe path before any future live caller can opt into `analyzeEvidenceFileWithPreAnalysisGate`, keeps the recommended future opt-in at the workflow/caller boundary rather than inside `analyzeEvidenceFile`, requires an unsupported-evidence reviewer state contract before runtime/UI implementation, preserves `LocalAnalysisResult` as receipt-shaped, protects receipt behavior, and keeps product-photo runtime, upload/UI/report mapping, ProductPhotoReviewPanel routing, providers/storage/integrations/case queues, OCR/metadata, fixtures, parser, scoring, analyzer entrypoints, deployment, and real evidence blocked.
- Phase 2.7.1 is a docs-only unsupported-evidence reviewer state contract in `PHASE_2_7_1_UNSUPPORTED_EVIDENCE_REVIEWER_STATE_CONTRACT.md`. It defines the future unsupported stop-state name, outcome labels, support-rep fields, neutral copy, confidence/uncertainty wording, what must not be shown, receipt-preservation requirements, future QA/browser gates, protected surfaces, and stop conditions. It does not implement UI, wire runtime, change upload/report mapping, route ProductPhotoReviewPanel, change `analyzeEvidenceFile`, change `LocalAnalysisResult`, change receipt behavior, add providers/storage/integrations/case queues, run OCR/metadata, deploy, commit, or push.
- Phase 2.7.2 is a docs-only unsupported-evidence display/mapping probe plan in `PHASE_2_7_2_UNSUPPORTED_EVIDENCE_DISPLAY_MAPPING_PROBE_PLAN.md`. It plans a future pure non-live mapper/probe for derived unsupported-evidence review state, defines no-score/no-proof-of-purchase/no-product-photo-report semantics, manual-review/customer-safe copy, confidence/uncertainty display, receipt-preservation rules, recommended future probe location, synthetic cases, checks, protected surfaces, and stop conditions. It does not implement UI, wire runtime, change upload/report mapping, route ProductPhotoReviewPanel, change receipt behavior, add providers/storage/integrations/case queues, run OCR/metadata, deploy, commit, or push.
- Phase 2.7.3 is closed and pushed at `0d90260` (`docs: close phase 2.7.3 mapper probe`). It added and closed a non-live unsupported-evidence display/mapping probe implementation: `src/lib/analysis/unsupported-evidence-review-state.ts` maps sanitized synthetic unsupported-evidence cases into the `unsupportedEvidenceReview` display object only; `src/lib/analysis/unsupported-evidence-review-state.probe.ts` covers product-photo, order screenshot, ambiguous PDF, unknown evidence, mixed evidence, unsupported image, and receipt-like-not-parseable cases plus forbidden visible wording, required safe wording, private sentinel omission, no-live markers, and protected-path isolation. The probe is registered in `check:product-photo-probes` (13 modules), and `scripts/check-report-semantics.mjs` covers the mapper/probe. No rendered UI, live runtime wiring, upload flow, live report mapping, ProductPhotoReviewPanel routing, analyzer entrypoint, LocalAnalysisResult, receipt behavior, parser/scoring/fixtures, provider/storage/integration/case queue, OCR/metadata, or deployment work was added.
- Phase 2.7.4 is a docs-only live-opt-in readiness checkpoint in `PHASE_2_7_4_LIVE_OPT_IN_READINESS_CHECKPOINT.md`. It decides that the safest next readiness step after the non-live mapper/probe is workflow/caller boundary design, not a dev-only harness, not a non-live report-adapter shape probe, and not a feature-flag/default-off opt-in plan yet. It keeps future opt-in at the workflow/caller boundary rather than inside `analyzeEvidenceFile`, keeps `LocalAnalysisResult` receipt-shaped for now, keeps unsupported-evidence output separate from receipt reports and ProductPhotoReviewPanel, defines conditions before any live UI/runtime opt-in, lists browser/manual QA requirements for any UI-facing unsupported state, records forbidden wording, and protects analyzer, receipt, upload, report, parser, scoring, fixture, provider/storage/integration/case-queue, OCR/metadata, and deployment surfaces. No runtime, UI, upload, live report mapping, ProductPhotoReviewPanel routing, receipt behavior, parser/scoring/fixtures, provider/storage/integration/case queue, OCR/metadata, or deployment work was added.
- Phase 2.7.5 is a docs-only workflow/caller boundary opt-in design in `PHASE_2_7_5_WORKFLOW_CALLER_BOUNDARY_OPT_IN_DESIGN.md`. It decides that a future default-off opt-in should be owned by the live workflow analysis boundary around `ClaimReviewWorkflow`'s run-analysis path, or a small workflow-local helper used only from that boundary. It keeps `analyzeEvidenceFile` receipt-only, keeps `LocalAnalysisResult` receipt-shaped, keeps unsupported-evidence output outside receipt reports and ProductPhotoReviewPanel, defines how the non-live mapper could later be used as a derived-state mapper without importing it into live receipt analysis, lists future eligible/protected files, browser/manual QA gates, required checks, and stop conditions. No runtime, UI, upload, live report mapping, ProductPhotoReviewPanel routing, receipt behavior, parser/scoring/fixtures, provider/storage/integration/case queue, OCR/metadata, or deployment work was added.
- Phase 2.7.7 is closed and pushed at `32d013b` (`feat: add workflow boundary probe for unsupported evidence`). It added a probe-only workflow/caller boundary helper in `src/lib/analysis/workflow-pre-analysis-gate-boundary.ts` plus `src/lib/analysis/workflow-pre-analysis-gate-boundary.probe.ts`; the helper is default-off, not imported by `ClaimReviewWorkflow` or live UI/report/analyzer paths, does not call `analyzeEvidenceFile` or `mapLocalAnalysisToReport`, does not produce or migrate `LocalAnalysisResult`, does not route `ProductPhotoReviewPanel`, and adds no rendered UI. Product-photo runtime remains non-live; the pre-analysis wrapper remains default-off and unwired; receipt behavior remains unchanged; no deployment was performed.
- Phase 2.8.0 is a docs-only acceleration plan in `PHASE_2_8_0_UNSUPPORTED_EVIDENCE_DEV_BRIDGE_PLAN.md`. It chooses a separate unlinked, production-disabled dev-only story/probe route as the safest future bridge for unsupported-evidence review visibility, rejects `/test-evidence` extension, live `ClaimReviewWorkflow` insertion, ProductPhotoReviewPanel routing, and live UI as the first bridge, and keeps `analyzeEvidenceFile`, `LocalAnalysisResult`, live report mapping, upload flow, parser, scoring, fixtures, providers/storage/integrations/case queues, OCR/metadata, deployment config, product-photo runtime, and receipt behavior protected. No runtime, UI, route, upload, report mapping, parser, scoring, fixture, provider/storage/integration/case queue, OCR/metadata, Phase 2.9, push, or deployment work was added.
- Phase 2.8.1 is a docs-only implementation plan in `PHASE_2_8_1_UNSUPPORTED_EVIDENCE_DEV_BRIDGE_IMPLEMENTATION_PLAN.md`. It pins the future Phase 2.8.2 bridge to `src/app/dev/unsupported-evidence-review/page.tsx` plus `render-cases.ts`, requires `process.env.NODE_ENV` production blocking with `notFound()`, keeps the route unlinked and synthetic-only, chooses literal `UnsupportedEvidenceReviewDisplay`-shaped cases with at most type-only mapper-contract imports and no workflow-boundary helper import, defines visible/forbidden fields, lists eligible/protected files, semantic/privacy guards, browser QA, implementation blockers, and the Phase 2.9 gate. No runtime, route, UI, live caller wiring, upload/report/parser/scoring/fixture behavior, provider/storage/integration/case-queue, OCR/metadata, Phase 2.9, commit, push, or deployment work was added.
- Phase 2.8.2 is closed after the successful Phase 2.8.3 review-only closeout retry for pushed commit `3dd8b74` (`fix: remove forbidden dev bridge wording`). The original dev-only unsupported-evidence review bridge was pushed at `7ee4b65`; the blocker patch at `3dd8b74` removed forbidden rendered score-boundary wording, added the safe notice "This result is not a receipt verification outcome.", and tightened semantic coverage so simple split/joined string literals are checked as rendered-equivalent visible text. The `/dev/unsupported-evidence-review` route remains production-disabled with `notFound()` and returned 404 under `next start`; it remains unlinked, synthetic-only, and covered by semantic/import/privacy guards in `scripts/check-report-semantics.mjs`. The bridge does not value-import/call the mapper, import the workflow boundary helper, wire `ClaimReviewWorkflow`, route `ProductPhotoReviewPanel`, change upload/report/parser/scoring/fixture behavior, touch `analyzeEvidenceFile` or `LocalAnalysisResult`, add providers/storage/integrations/case queues, run OCR/metadata, deploy, or start Phase 2.9. Product-photo/unsupported-evidence runtime remains non-live, unsupported-evidence live UI does not exist, receipt behavior is unchanged, and no deployment occurred.
- Phase 2.9.0 is a docs-only unsupported-evidence live-opt-in readiness plan in `PHASE_2_9_0_UNSUPPORTED_EVIDENCE_LIVE_OPT_IN_READINESS_PLAN.md`. It decides unsupported evidence is ready for planning-only handoff, not live opt-in implementation. The blockers are intentional: unsupported evidence is not wired into `ClaimReviewWorkflow`, no live unsupported-evidence UI exists, `LocalAnalysisResult` remains receipt-shaped, `analyzeEvidenceFile` remains receipt-only, `ProductPhotoReviewPanel` remains unrouted, no real product-photo/OCR/metadata/provider/storage/integration/case-queue work exists, and no case workflow/audit/persistence foundation exists. The narrow future path, if Robert later opens it, is a default-off workflow/caller boundary slice with receipt behavior preserved.
- Phase 2.9.1 review-only closeout passed, and final Phase 2 closure source-of-truth alignment is pushed at `3779ab0` (`docs: close phase 2 non-live readiness`). Phase 2 is closed as non-live unsupported/product-photo readiness. Product-photo/unsupported-evidence runtime remains non-live; live opt-in remains blocked; the pre-analysis wrapper remains default-off and unwired; the workflow boundary helper remains probe-only/default-off/unwired; the dev-only unsupported-evidence bridge remains synthetic-only, unlinked, and production-blocked with 404 under `next start`; `ClaimReviewWorkflow` remains unwired; unsupported-evidence live UI does not exist; `ProductPhotoReviewPanel` remains unrouted; `analyzeEvidenceFile` remains the receipt analyzer entrypoint; `LocalAnalysisResult` remains receipt-shaped; upload/report/parser/scoring/fixtures/provider/storage/integration/case-queue/OCR/metadata paths remain protected; receipt behavior is unchanged; no deployment occurred; and Phase 3 implementation has not started.
- Phase 3.0 is complete as a planning-only case workflow readiness checkpoint in `PHASE_3_0_CASE_WORKFLOW_READINESS_PLAN.md`. It defines the case object concept, evidence model, UX architecture, safety boundaries, technical boundaries, Phase 1/2 inheritance, first build recommendation, and Phase 3 sequence without implementing routes, components, runtime wiring, live unsupported-evidence UI, ProductPhotoReviewPanel routing, database/storage/auth/orgs/billing, integrations, OCR/metadata expansion, `analyzeEvidenceFile` changes, `LocalAnalysisResult` migration, receipt behavior changes, deployment, commit, or push.
- Phase 3.1 is complete as a planning/design-only Case Review Command Center concept in `PHASE_3_1_CASE_WORKFLOW_DESIGN_CONCEPT.md`. Phase 3.3 supersedes the earlier dark-forensic default direction for the local shell: preserve the current warm off-white ClaimGuard evidence workspace direction, use dark charcoal panels only selectively for contrast, and avoid generic SaaS/dashboard styling. Phase 3.1 did not implement routes, components, runtime wiring, live unsupported-evidence UI, ProductPhotoReviewPanel routing, persistence, integrations, OCR/metadata/image analysis, `analyzeEvidenceFile` changes, `LocalAnalysisResult` migration, receipt behavior changes, deployment, commit, or push.
- Phase 3.2 is pushed, reviewed, and safe to build on at `a169de4` (`feat: add phase 3.2 local case command center shell`). It adds `/case-command-center` as a static/local, synthetic-only, unlinked Case Review Command Center shell with `src/components/CaseReviewCommandCenter.tsx` and isolated mock case data in `src/lib/case-command-center/mock-case.ts`. The post-push QA checkpoint passed: `/case-command-center` renders, `/` remains the existing Phase 1 receipt workflow, `/` does not link to `/case-command-center`, and browser console checks reported no warnings/errors. No deployment occurred. Receipt behavior is unchanged; `ClaimReviewWorkflow` remains unchanged; `ProductPhotoReviewPanel` remains unrouted; unsupported/product-photo runtime remains non-live; and no persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, `analyzeEvidenceFile` change, `LocalAnalysisResult` migration, report/parser/scoring/fixture change, or deployment work was added.
- Phase 3.3 is implemented as scoped local-shell polish for `/case-command-center`. It strengthens the selected-evidence bench, evidence sidebar scanability, selected evidence metadata/readability, right-side review summary rail, notes/manual decision placement, customer-safe wording placement, and timeline hierarchy while preserving the off-white/parchment ClaimGuard direction with selective dark contrast panels only. It keeps `/case-command-center` static/local, synthetic-only, and unlinked; `/` remains the Phase 1 receipt workflow; receipt behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged/unrouted; and no persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, analyzer/report/parser/scoring/fixture changes, deployment, or Phase 3.4 work was added.
- Phase 3.4 is implemented as scoped timeline/audit trail structure polish for `/case-command-center`. It expands the isolated synthetic mock timeline with event categories for evidence added, analysis completed, manual review needed, rep note drafted, customer-safe wording prepared, case status changed, and escalation marker; adds static mock timestamps, relative timing, severity/status styling, case-status-after labels, reviewer-impact notes, and selected-evidence links; and replaces the flat placeholder cards with a readable support-rep audit trail. The route remains static/local, synthetic-only, unlinked, and off-white/parchment with selective dark contrast only. Receipt behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged/unrouted; no persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, analyzer/report/parser/scoring/fixture changes, deployment, Phase 3.5, or Phase 4 work was added.
- Phase 3.5 is implemented as scoped notes/manual decision workflow structure polish for `/case-command-center`. It replaces the live-looking notes placeholder with a static mock local manual review workspace, structured decision state chips, selected-evidence rationale, internal note structure, policy/safety reminders, customer-safe wording handoff guidance, timeline linkage, and visible not-saved/not-sent boundary copy. The route remains static/local, synthetic-only, unlinked, and off-white/parchment with selective dark contrast only. Receipt behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged/unrouted; no editable saved notes, form submission, persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, analyzer/report/parser/scoring/fixture changes, deployment, Phase 3.6, or Phase 4 work was added.
- Phase 3.6 is implemented as scoped customer-safe wording module polish for `/case-command-center`. It turns the customer-safe wording panel into a static mock local response-prep module with suggested response variants, wording intent/tone labels, selected-evidence rationale links, support-safe guardrails, a rep review checklist, timeline linkage, and visible not-sent/not-saved boundary copy. The route remains static/local, synthetic-only, unlinked, and off-white/parchment with selective dark contrast only. Receipt behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged/unrouted; no editable saved text, send/copy-to-ticket behavior, form submission, persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, analyzer/report/parser/scoring/fixture changes, deployment, Phase 3.7, or Phase 4 work was added.
- Phase 2.5.2 is a no-live dev-only product-photo adapter-readiness review harness. `src/app/dev/product-photo-adapter-readiness/render-cases.ts` holds 12 literal synthetic `ProductPhotoAdapterReadinessResult` cases (type-only import) covering accepted analysis-result/report-view-model, top-level + nested (analysis-result and report-view-model) legacy damage-photo quarantine, receipt-like/unknown/unsupported mismatch collapse, hostile sentinel-omission, limited metadata bucket, long-text layout stress, and a manual-review-only no-live marker. `src/app/dev/product-photo-adapter-readiness/page.tsx` renders them on a production-disabled (`notFound()`), unlinked, dark-forensic dev route with a non-live banner, distinct accepted/quarantine/unsupported badges, readinessAccepted/inputKind/score/confidence/priority/signal-level facts, review signals, no-live isolation markers, and privacy posture. The readiness builder is not value-imported or called; no analyzer/OCR/metadata/upload/report-adapter/provider/storage/integration/case-queue value imports; no files/blobs/object URLs/images/fetch/storage. `scripts/check-report-semantics.mjs` gained adapter-host marker/import/privacy and live-file no-link guards (type-only readiness import allowed); the probe runner is unchanged (11 modules). Browser QA passed (HTTP 200, banner + markers + distinct badges visible, no image/file inputs, `/` unlinked). Product-photo runtime stays non-live; adapter readiness stays decision-only and unwired; receipt behavior unchanged.
- Phase 2.5.1 is a no-live, gate-first dev-only review harness. `src/app/dev/pre-analysis-evidence-gate/render-cases.ts` holds 10 literal synthetic `PreAnalysisEvidenceGateDecision` cases (type-only import) covering receipt/PDF/order-screenshot allow, product-photo-like unsupported, legacy damage-photo quarantine, unsupported media-type, unknown inconclusive, hostile sentinel-omission, long-text layout stress, and a manual-review-only no-live marker. `src/app/dev/pre-analysis-evidence-gate/page.tsx` renders them on a production-disabled (`notFound()`), unlinked, dark-forensic dev route with a non-live banner, distinct outcome badges, and visible no-live isolation markers. The gate builder is not value-imported or called; no analyzer/OCR/metadata/upload/report-adapter/provider/storage/integration/case-queue coupling; no files/blobs/object URLs/images/fetch/storage. `scripts/check-report-semantics.mjs` gained gate-host marker/import/privacy and live-file no-link guards; the probe runner is unchanged (11 modules). Browser QA passed (HTTP 200, banner + markers visible, no image/file inputs, `/` unlinked). Product-photo runtime stays non-live; the gate stays decision-only and unwired; receipt behavior unchanged.
- Phase 2.5.0 is a docs-only Phase 2.5 scope plan in `PHASE_2_5_DEV_HARNESS_SCOPE_PLAN.md`. It confirms Phase 2.5 is the dev-only adapter/gate review harness phase: a no-live, synthetic-only, unlinked, production-disabled developer surface for inspecting product-photo adapter readiness outputs and `pre-analysis-evidence-gate` decisions before any product-photo runtime, upload, or UI work. It defines the required synthetic cases (adapter readiness accepted/quarantine/collapse cases plus gate allow/unsupported/quarantine/product-photo-like/unknown cases, hostile-override/sentinel-omission, long-text stress, and a manual-review-only no-live marker case), allowed future files, protected files, semantic/probe/browser/privacy gates, stop conditions, done criteria, and recommends Phase 2.5.1 as a gate-first no-live dev-only review harness implementation (or a review-only closeout). No code, route, component, runtime, or fixture changed.
- Phase 2.4.11 is a docs-only source-of-truth alignment pass. `REPO_SOURCE_OF_TRUTH.md` no longer describes a stale "Phase 2.0 scaffold-only" state; its Phase-Aware Workflow now records that Phase 2.4 adapter-readiness/runtime-blocker planning is complete, the guarded non-live product-photo adapter contract and the decision-only unwired pre-analysis evidence gate exist and are pushed (`f5564b4`), product-photo runtime remains non-live, `damage-photo` remains legacy/non-canonical, `analyzeEvidenceFile`/`LocalAnalysisResult`/receipt behavior are unchanged, UI/upload/live report adapter/provider/storage/integration/case-queue work remains blocked, dev-only harness work is a future no-live milestone, and Phase 2.4 closeout review should be next. No code, route, component, runtime, or fixture changed.
- Completed pushed Phase 2.2 work includes:
  - `44d09f0` added unwired product-photo signal builders.
  - `50f8284` added unwired product-photo file summary, review completeness, and local review signal helpers.
  - `3496ede` updated Phase 2.2 helper status docs.
  - `82376bb` added a compile-only product-photo helper probe.
  - `78ad7bb` added an exported-only product-photo analyzer builder.
  - `dca1177` captured future evidence review UX direction as docs-only product direction.
  - `bf46949` added a dev-only product-photo recognition boundary.
- `2cbe002` added a dev-only product-photo routing adapter.
- `1e5c928` added a dev-only analyzer routing guard.
- `e8636e4` added an optional file-aware analyzer routing boundary.
- `7459a15` added a dev-only analyzer-routing preservation/status probe.
- `2071374` added a decision-only public analyzer routing wrapper.
- `0d64ff4` added a guarded internal analyzer-routing boundary.
- A type-only shared `EvidenceAnalysisResult` envelope and compile-only shared-result probe now exist for future analyzer routing.
- A non-live product-photo shared-result boundary now prepares `ProductPhotoEvidenceAnalysisResult` for dev/probe use only.
- Shared evidence model types, product-photo scaffold/defaults, signal builders, summary/completeness helpers, compile probes, an exported-only analyzer builder, analyzer and routing-adapter probes, a shared result envelope/probe, a non-live product-photo shared-result boundary/probe, a dev-only recognition boundary, a dev-only routing adapter, a dev-only analyzer routing guard, an optional file-aware routing boundary, a dev-only analyzer-routing preservation/status probe, and a decision-only public analyzer routing wrapper exist.
- The shared result envelope represents receipt and product-photo as separate module variants and does not force product-photo into `LocalAnalysisResult`.
- The product-photo shared-result boundary returns the shared result shape with `module: "productPhoto"`, keeps details nested under `moduleDetails.productPhoto`, and remains unwired from live analyzer, routing, UI, upload, report, scoring, parser, and fixture paths.
- The recognition boundary is isolated and dev-only. `recognizeProductPhotoEvidence` is not called by `analyzeEvidenceFile`.
- The routing adapter composes the recognition boundary and product-photo analyzer builder only inside an isolated dev-only module.
- The routing adapter returns its own adapter-specific result, not `LocalAnalysisResult`.
- The routing adapter is imported only by `product-photo-routing-adapter.probe.ts`.
- The routing adapter is not called by `analyzeEvidenceFile`.
- The analyzer routing guard is isolated and dev-only. It does not call the product-photo routing adapter, and product-photo candidates remain guarded as an unsupported live path.
- The optional file-aware routing boundary uses synthetic file-like context only, keeps runtime routing disabled by default, and is not called by the live UI or upload flow.
- The analyzer-routing preservation probe strengthens confidence that receipt-like inputs preserve the receipt path conceptually, product-photo candidates return guarded unsupported-live-path status when runtime routing is disabled, unknown inputs remain inconclusive, and product-photo candidate output does not require `LocalAnalysisResult`.
- `routeAnalyzerEvidenceInput` returns `PublicAnalyzerRoutingDecision` only, stays unwired from live UI/upload/report/scoring/parser paths, does not call `analyzeEvidenceFile`, does not call the product-photo routing adapter, and keeps product-photo candidates guarded/non-live even when runtime routing is requested.
- The guarded internal analyzer-routing boundary remains decision-only, preserves the existing receipt analyzer path decision, keeps product-photo candidates as guarded unsupported live paths, and explicitly records that analyzer, adapter, product-photo result boundary, UI, upload, report, scoring, parser, and fixture paths were not invoked.
- `analyzer-routing` remains unwired from live UI, upload, report, scoring, and parser paths.
- Product-photo runtime analyzer behavior is still not live.
- `analyzeEvidenceFile` remains the live receipt analyzer entrypoint and still protects the shipped receipt pipeline.
- `LocalAnalysisResult` remains unchanged and receipt-path shaped.
- The shared-result and product-photo result probes confirm product-photo shared results do not require receipt-only OCR/parser/result fields and keep external verification as not performed / not externally verified.
- A pushed isolated product-photo report view-model boundary now maps product-photo shared results to a dev/probe-only, display-safe view model without using `LocalAnalysisResult`, `MockAnalysisReport`, `mapLocalAnalysisToReport`, `analyzeEvidenceFile`, analyzer routing, UI, upload, scoring, parser, fixtures, providers, storage, integrations, or case queues.
- The product-photo report view-model keeps score, review priority, confidence, and limitations separate; keeps external verification not performed; clamps unsupported clear-style labels away from a display outcome; and omits raw photo bytes, image buffers, raw EXIF, raw metadata, original filenames, raw label values, provider output, storage handles, integration handles, and case queue handles.
- Probe-only isolation assertions now explicitly record that the product-photo shared-result boundary does not invoke `analyzeEvidenceFile`, analyzer routing, UI, upload, report mapping, scoring, parser, fixtures, providers, storage, integrations, or case queues.
- The first isolated product-photo UI display contract probe now strengthens the existing product-photo report view-model probe without adding a UI component or live workflow wiring. It proves future display surfaces can consume `ProductPhotoReportViewModel` only, covers missing-context and complete-context display cases, low/medium/high score semantics, missing metadata summaries, label-context raw value omission, overconfident review-label clamping, recursive private-key denial, sentinel private-value omission, and receipt/report-adapter preservation.
- A docs-only standalone product-photo display component plan now defines the future component as an isolated `ProductPhotoReviewPanel`-style evidence-review panel with exactly one prop, `viewModel: ProductPhotoReportViewModel`. The planned component remains unwired from `ClaimReviewWorkflow`, owns no image preview or object URL, adds no upload/analyzer/report/scoring/parser/fixture behavior, and must receive semantic/privacy coverage before implementation.
- The first isolated `ProductPhotoReviewPanel` component now exists as a standalone, unwired display surface that accepts exactly `viewModel: ProductPhotoReportViewModel`, renders derived product-photo review summaries only, keeps status, priority, confidence, evidence quality, score, recommended action, limitations, review signals, and privacy posture separate, and is covered by a dedicated component probe plus semantic/import/privacy guards. It is not inserted into `ClaimReviewWorkflow` or any live route.
- The first non-live synthetic visual verification host for `ProductPhotoReviewPanel` now exists at `src/app/dev/product-photo-review-panel/page.tsx` with colocated literal `ProductPhotoReportViewModel` render cases in `render-cases.ts`. The route is unlinked, production-disabled by default with `notFound()`, synthetic-only, includes low-confidence, medium-priority, and stronger manual-review cases, and is covered by semantic/import/privacy guards. It is not `/test-evidence`, not `ClaimReviewWorkflow`, and not connected to upload, analyzer, analyzer-routing, report-adapter, scoring, parser, fixtures, providers, storage, integrations, or case queues.
- Dedicated desktop and mobile browser QA for `/dev/product-photo-review-panel` passed after commit `6f48370`: the host rendered all three synthetic cases, showed manual-review-only and external-verification-not-performed copy, had no relevant console errors/warnings, no horizontal overflow, no primary nested review scroll containers, no sibling panel overlap, no image/media elements, and `/` remained the Phase 1 receipt workflow with no visible host link.
- Phase 2.3 opened with a first thin local heuristic analyzer boundary, `analyzeProductPhotoEvidenceWithLocalHeuristics`, that composes the existing product-photo detail/result boundary from synthetic or bucketed review context only. It remains manual-review-only, local-only, non-live, and unwired from upload, `analyzeEvidenceFile`, analyzer routing, UI, report adapter mapping, scoring, parser, fixtures, providers, storage, integrations, and case queues.
- The Phase 2.3 analyzer probe now covers complete context, missing wider view, limited image quality, very low-quality/Poor quality buckets, missing product context with visible damage context, complete product context with incomplete damage context, limited and unavailable metadata context, serial/model label context with raw values omitted, proof-of-purchase-match-needed, hostile caller-copy sanitization, separate score/confidence/review-priority/limitations/recommended-action semantics, bucket-only metadata summaries, generic product-photo labels, allowlisted metadata/label/quality-limit summaries, raw label sentinel omission, and import/isolation boundaries.
- Phase 2.3.3 tightened the non-live dev/probe raw product-photo result boundary so direct caller narrative overrides for summary, support action, customer wording, review label, and non-local source kind are canonicalized by the analyzer boundary. The probe and semantic guard now include direct-boundary hostile narrative override coverage. Product-photo remains non-live and unwired.
- Phase 2.3.4 reviewed the analyzer boundary for guarded-readiness. The current non-live product-photo boundary is clean enough for another guarded, non-live hardening slice, but live integration remains blocked until structured score/confidence/review-priority overrides are derived or clamped, runtime enum/string canonicalizers are strengthened, executable probe coverage is added, and the legacy live `damage-photo` receipt-era path is quarantined from canonical `product-photo` work.
- Phase 2.3.5 hardens the non-live product-photo analyzer boundary without wiring product-photo into runtime. The product-photo result boundary now derives score, confidence, review priority, and local signal level from sanitized local details instead of trusting caller overrides; runtime product-photo enum/string-like inputs collapse to allowlisted safe values; product-photo probe assertions execute through `npm.cmd run check:product-photo-probes`; and semantic guards cover structured readiness override regressions plus product-photo recognition/routing probe coverage.
- Phase 2.3.6 closed Phase 2.3 analyzer hardening as a review-only pass. Lint, build, report semantics, product-photo probes, diff check, and targeted boundary scans passed with no file changes.
- Phase 2.4.0 added the guarded non-live adapter readiness plan in `PRODUCT_PHOTO_ADAPTER_READINESS_PLAN.md`. The plan defines future adapter contract boundaries, score/safety derivation rules, privacy limits, legacy `damage-photo` quarantine expectations, semantic/probe gates, protected live paths, and Phase 2.4.1 pass/fail criteria.
- Phase 2.4.1 adds `prepareProductPhotoAdapterReadinessForDevOnlyBoundary` as a dev/probe-only adapter readiness boundary. It accepts sanitized `ProductPhotoEvidenceAnalysisResult` or `ProductPhotoReportViewModel` data, derives/canonicalizes readiness score, confidence, review priority, local signal level, source kind, summary, support action, customer wording, limitations, and signals, keeps runtime live flags false, and returns only canonical `product-photo` readiness output.
- The Phase 2.4.1 adapter readiness probe actively checks canonical result input, report-view-model input, safe omitted top-level `evidenceType` input, hostile override collapse, low/medium/high score scope, legacy `damage-photo` quarantine, hostile top-level receipt/unknown/unsupported/`damage-photo` mismatch quarantine/collapse for analysis-result and report-view-model inputs, hostile nested `damage-photo` analysis-result and report-view-model quarantine, unsupported nested evidence-type collapse, raw/private sentinel omission, exact metadata omission, no `LocalAnalysisResult` dependency, no `analyzeEvidenceFile` invocation, and no UI/upload/live report/scoring/parser/fixture/provider/storage/integration/case-queue coupling.
- The older dev routing adapter now quarantines legacy `damage-photo` compatibility alias inputs instead of building product-photo details for them. This remains non-live and probe-only; it does not change the live receipt-shaped upload/analyzer path.
- Legacy `damage-photo` remains a receipt-era/mock compatibility alias and not the canonical Phase 2 product-photo runtime. It is quarantined in the adapter-readiness boundary, but a legacy live receipt-era filename classification path still exists and can return `damage-photo` before the receipt-shaped analyzer path. Future work must handle that live classification blocker in a separate approved slice before any product-photo runtime support.
- Probe sample data is synthetic and records no file bytes, image buffers, raw EXIF objects, provider handles, storage handles, integration handles, or case queue handles.
- No runtime analyzer routing, upload, UI, report, scoring, parser, metadata extraction, or fixture behavior changed during Phase 2.0, Phase 2.1, or Phase 2.2 helper/boundary work.
- Runtime routing remains blocked until Robert explicitly opens that slice.
- `product-photo` is canonical.
- `damage-photo` remains only a compatibility alias to `product-photo` / `damage-close-up`.

## Next Safe Tasks

1. Run Phase 3.0 planning-only case workflow readiness. Define case states, audit/history needs, reviewer actions, privacy/retention boundaries, and handoff requirements without implementing UI, persistence, integrations, auth, or live unsupported/product-photo runtime.
2. Keep Phase 3 implementation blocked until Robert explicitly opens a named implementation slice.
3. Keep unsupported-evidence live opt-in blocked until a separate approved workflow/caller boundary slice is opened.
4. Keep the decision-only public analyzer routing wrapper out of live UI/upload/report/scoring/parser paths until a separate live-routing plan is explicitly opened.
5. Keep the dev-only routing adapter and adapter-readiness boundary out of `analyzeEvidenceFile` until Robert explicitly opens a runtime-routing slice.
6. Keep `recognizeProductPhotoEvidence` out of `analyzeEvidenceFile` until Robert explicitly opens a runtime-routing slice.
7. Keep the analyzer routing guard and optional file-aware boundary out of the live UI/upload flow until a separate live-routing plan is explicitly opened.
8. Keep `LocalAnalysisResult` receipt-path shaped until a separate shared-result migration slice is explicitly opened.
9. Keep image-consistency uncertainty dormant until a future explicitly opened provider, validated local-metrics, and QA-evidence slice.
10. Keep the product-photo helpers, analyzer builder, probes, recognition boundary, routing adapter, adapter-readiness boundary, analyzer routing guard, optional file-aware boundary, preservation probe, public wrapper, report view-model, review panel, and visual host unwired from runtime analyzer, upload, UI insertion, live report mapping, scoring, parser, metadata extraction, and fixture behavior.
11. Keep the shipped receipt module stable unless Robert explicitly requests maintenance.
12. Preserve a clean operational queue after each completed agent task.

## Phase 2.3 Entry Criteria And Boundaries

Phase 2.3 should include:

- Deterministic local product-photo heuristic analyzer work inside product-photo-specific modules.
- Synthetic or file-like probe inputs only.
- Product-photo result output through `ProductPhotoEvidenceAnalysisResult`, `EvidenceAnalysisResult`, or a derived product-photo-only boundary, not `LocalAnalysisResult`.
- Probes for damage close-up, full product context, serial/model label context, missing wider view, limited image quality, unavailable metadata context, and proof-of-purchase-match-needed states.
- Safety and privacy assertions proving local-only score meaning, manual-review-only language, external verification not performed, no proof/customer-accusation wording, and no raw/private-bearing photo fields.

Phase 2.3 must exclude:

- Wiring product-photo into `analyzeEvidenceFile`, upload routing, `ClaimReviewWorkflow`, live report adapter mapping, receipt scoring, receipt parser behavior, receipt fixtures, `/test-evidence`, providers, storage, integrations, or case queues.
- Real product photos, real photo fixtures, raw EXIF, raw metadata, original filenames, GPS, precise timestamps, raw serial/model/barcode/QR values, object URLs, image URLs, retained image fingerprints, or persistent evidence identifiers.
- Any automatic outcome, approval, denial, external-verification claim, customer accusation, or evidence-truth claim.

Protected files at Phase 2.3 start:

- `src/lib/analysis/analyzer.ts`
- `src/components/ClaimReviewWorkflow.tsx`
- `src/lib/analysis/report-adapter.ts`
- `src/lib/analysis/types.ts` unless a tiny additive product-photo type issue is explicitly required
- Upload components and `/test-evidence`
- Receipt scoring, parser, fixtures, providers, storage, integrations, and case queue files

Mandatory checks for Phase 2.3:

- `git status --short --branch`
- `git log -1 --oneline`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:report-semantics`
- `git diff --check`
- Targeted import-boundary scans proving no live UI/upload/report/scoring/parser/fixture/provider/storage/integration/case-queue wiring
- Browser checks for any rendered route touched

## Phase 2.2 Staged Live Analyzer-Routing Integration Plan

This is a docs-only integration gate. It records the safest future path for analyzer routing without opening runtime behavior, wiring product-photo analysis into the UI, or changing the shipped receipt analyzer path.

Live-routing integration means a guarded internal analyzer-routing decision path that can be reviewed with probes before any user-facing behavior changes. It does not mean UI display, upload routing, report mapping, scoring changes, parser changes, fixture changes, provider calls, storage, integrations, or case queues.

Staged order:

1. Complete this docs-only live-routing gate and keep `routeAnalyzerEvidenceInput` decision-only and unwired.
2. Add or preserve probes for the future contract before any runtime wiring is attempted.
3. Keep `analyzeEvidenceFile` receipt-only and unchanged in the first future routing slice.
4. Add a separate guarded internal routing entrypoint only after probes show receipt behavior is preserved.
5. Keep product-photo output in a shared result shape and out of `LocalAnalysisResult`.
6. Keep the first future routing slice away from UI, upload, report mapping, scoring, parser, fixtures, providers, storage, integrations, and case queues.
7. Plan product-photo report mapping and UI wording as later separate slices before any product-photo result is displayed.
8. Seek separate approval before any live UI/upload/report integration or provider-backed behavior.

Live-use conditions before any future integration:

- Receipt files must preserve current `LocalAnalysisResult` behavior, including the existing `analyzeEvidenceFile` live receipt entrypoint.
- Product-photo results must not be forced into receipt-shaped `LocalAnalysisResult` without a planned shared result model.
- `src/lib/analysis/report-adapter.ts` must support product-photo-safe mapping before any product-photo result can be displayed in the UI.
- UI language must stay manual-review-only and must not imply proof, customer wrongdoing, or automatic denial.
- Product-photo analysis must remain local-heuristics-only, provider-ready, and not externally verified unless a future authorized provider slice explicitly changes that.
- No real photos, real metadata fixtures, providers, storage, integrations, or case queues are part of this staged path.
- The product-photo runtime flag remains guarded until Robert explicitly opens it.

Required prerequisites before any code change:

- The future prompt must explicitly open a narrow runtime-routing implementation slice.
- Starting `git status --short --branch` must be clean and on `main`.
- The latest pushed checkpoint must include the product-photo result boundary isolation probes.
- The existing analyzer-routing preservation probe must pass conceptually before edits.
- Receipt-like object and file inputs must keep the existing receipt path.
- Product-photo candidates must remain guarded until the future slice intentionally changes exactly that guard.
- `LocalAnalysisResult` must remain receipt-shaped.
- `analyzeEvidenceFile` must remain the receipt analyzer entrypoint unless a separate shared-result migration is planned first.
- Product-photo result wording must remain local evidence quality and review readiness only.
- External verification must remain not performed.
- No real photo, raw metadata, provider, storage, integration, or case queue work may be part of the first routing slice.

Required probes before live integration:

- Receipt-like object/file preserves the receipt path.
- Actual receipt analyzer output remains unchanged.
- PDF-like and screenshot-like inputs remain classification-only unless explicitly supported.
- Product-photo runtime flag remains non-live unless Robert explicitly opens it.
- `damage-photo` compatibility alias maps only to the canonical `product-photo` planning path.
- No product-photo details leak into `LocalAnalysisResult`.
- Product-photo shared result variants do not require receipt-only OCR/parser/result fields.
- Decision-only wrapper does not invoke adapter/analyzer/UI/report paths.
- Safety-wording scan remains clean.
- The public wrapper does not expose shared-result payload fields before report/UI mapping is planned.
- Product-photo samples remain synthetic and contain no file bytes, image buffers, raw EXIF objects, provider handles, storage handles, integration handles, or case queue handles.

Allowed files for the first future live-routing implementation slice:

- `src/lib/analysis/analyzer-routing.ts`
- `src/lib/analysis/analyzer-routing.probe.ts`
- `src/lib/analysis/product-photo-result.probe.ts` only if a probe assertion must be tightened.
- `src/lib/analysis/shared-result.probe.ts` only if a probe assertion must be tightened.
- `NEXT_STEPS.md` and `AGENT_LOG.md` for status updates.

Protected files for the first future live-routing implementation slice:

- `src/lib/analysis/analyzer.ts`
- `src/lib/analysis/product-photo-analyzer.ts` unless a clear boundary bug is found.
- `src/lib/analysis/types.ts` unless a separate shared-result type slice is explicitly opened.
- `src/lib/analysis/report-adapter.ts`
- `src/components/ClaimReviewWorkflow.tsx`
- Upload files.
- Scoring files.
- Parser files.
- Fixtures.
- Package scripts and dependencies.
- Providers, storage, integrations, and case queues.

Stop conditions for the future implementation:

- `analyzeEvidenceFile` changes or starts calling product-photo boundary code.
- `LocalAnalysisResult` changes or product-photo data is forced into receipt-only fields.
- Receipt-like inputs stop preserving the existing receipt path.
- Product-photo results reach UI, upload, report mapping, scoring, parser, fixture, provider, storage, integration, or case queue paths.
- Report/UI language is needed before product-photo-specific report mapping and safety checks exist.
- Any wording implies proof, customer wrongdoing, external verification, or an automatic outcome.
- Any raw image bytes, image buffers, raw EXIF, raw metadata fixtures, original filenames, raw label values, private evidence, provider handles, storage handles, integration handles, or case queue handles appear.
- Any required check fails or cannot be interpreted safely.

Checks required for the future implementation slice:

- `git status --short --branch`
- `git log -1 --oneline`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:report-semantics`
- `git diff --check`
- Final `git status --short --branch`

Recommended next implementation prompt after this docs gate is committed and pushed:

```text
/claimguardagent implement the first guarded internal analyzer-routing slice only: keep analyzeEvidenceFile receipt-only and unchanged; preserve LocalAnalysisResult; update only analyzer-routing.ts and required routing probes so product-photo candidates can exercise a guarded internal route without UI, upload, report mapping, scoring, parser, fixtures, providers, storage, integrations, or case queues; run lint, build, report semantics, and diff check; commit only if safe; do not push
```

## Phase 2.2 Product-Photo-Safe Report/UI Mapping Gate

This is a docs-only planning gate. It defines what a future product-photo report/UI mapping slice must prove before product-photo output can appear in report or UI surfaces. It does not implement report mapping, UI display, upload routing, live analyzer routing, scoring, parser behavior, fixtures, providers, storage, integrations, or case queues.

Product-photo report/UI mapping means an isolated adapter or view-model layer that can translate `ProductPhotoEvidenceAnalysisResult` / `EvidenceAnalysisResult` into a display-safe review summary. The first future mapping slice should be mapping plus probes only; it should not make product-photo visible to users, should not run from upload or live analyzer paths, and should not call `analyzeEvidenceFile`.

Product-photo report/UI mapping does not mean:

- Wiring product-photo into `mapLocalAnalysisToReport`.
- Forcing product-photo into `LocalAnalysisResult`.
- Changing receipt report behavior.
- Changing the current UI to display product-photo results.
- Changing upload evidence routing.
- Enabling live analyzer routing.
- Adding product-photo scoring behavior, parser behavior, fixtures, providers, storage, integrations, or case queues.

Required prerequisites before any future mapping implementation:

- Start from a clean `main` synced with `origin/main`.
- Keep `mapLocalAnalysisToReport(result: LocalAnalysisResult)` receipt-only unless a separate shared report migration is explicitly opened first.
- Add a separate product-photo-safe mapping boundary for `ProductPhotoEvidenceAnalysisResult` or the shared `EvidenceAnalysisResult` envelope.
- Keep `LocalAnalysisResult` unchanged and receipt-shaped.
- Keep `analyzeEvidenceFile` unchanged as the live receipt analyzer entrypoint.
- Keep `routeAnalyzerEvidenceInput` and the guarded internal analyzer-routing boundary decision-only and unwired from UI/upload/report/scoring/parser paths.
- Keep product-photo runtime non-live.
- Keep external verification not performed.
- Extend safety/semantic coverage before any product-photo result can appear in a report or UI surface.

Safe display allowlist for a future mapping slice:

- Evidence type and evidence label.
- Review readiness summary.
- Local evidence quality summary.
- Product context status and damage visibility status as review context only.
- Image quality limits and image consistency review signals.
- Requested additional views.
- Purchase or receipt match needed.
- Manual-review recommendation.
- Evidence Reliability Score meaning, with score scope as local evidence quality and review readiness only.
- Review priority and confidence as separate concepts.
- External verification not performed.
- Privacy-safe metadata status and buckets only.

Display and export denylist:

- Raw photo bytes or image buffers.
- Raw EXIF, raw metadata, precise timestamps, GPS coordinates, device owner fields, file paths, original filenames, or copied metadata notes.
- Raw serial/model/label values, barcode contents, or QR contents.
- People, faces, addresses, customer identifiers, private backgrounds, or private evidence snippets.
- Provider output, storage handles, integration IDs, case queue IDs, or retained image fingerprints.
- Final evidence outcome, customer intent, claim outcome, automatic disposition, or policy disposition fields.

Required safe language rules:

- Use local evidence quality, review readiness, manual review recommended, review signal, findings inconclusive, additional context may be needed, and external verification not performed.
- Explain that a high score means product-photo context may be more useful for local support review.
- State that a high score does not prove the product photo or claim.
- Keep score, review priority, and confidence separate:
  - Score means evidence reliability and review readiness.
  - Review priority means where support attention should go.
  - Confidence means certainty and limitations of local analysis.
- Recommended action may ask for a clearer photo, wider product context, label photo when policy needs it, proof-of-purchase match, or manual review.
- Do not use proof language, final decision language, customer accusation language, automatic outcome language, or any wording implying external verification happened.

Required result-shape constraints:

- Product-photo mapping must consume the shared product-photo result shape, not receipt-only fields.
- Product-photo report/UI payloads must not require OCR text, parsed receipt fields, receipt source classification, receipt score breakdown, receipt image heuristics, or internal receipt structure confidence.
- Product-photo details must remain under product-photo module details or a product-photo-specific display model.
- Receipt report/UI payloads must remain unchanged for the first mapping slice.
- The future mapping output must keep external verification not performed and include a safety note that local analysis does not prove evidence truth.

Required probes/checks before implementation:

- Product-photo mapping probe proving product-photo maps to a separate report/UI-safe shape, not `LocalAnalysisResult`.
- Result-shape probe forbidding receipt-only fields, final-decision fields, raw metadata fields, provider outputs, storage handles, integration handles, and case queue fields.
- Public wrapper and guarded-routing probes proving mapping does not invoke upload routing, live analyzer routing, `analyzeEvidenceFile`, parser, scoring changes, fixtures, providers, storage, integrations, or case queues.
- Privacy probe proving output omits raw EXIF, original filenames, raw labels, raw metadata, bytes/buffers, private evidence, and provider output.
- Score semantics probe proving score, review priority, and confidence remain separate.
- Safety wording probe or semantic checker expansion covering product-photo boundary, future mapping file, and future UI/report display surfaces.
- Existing `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run check:report-semantics`, and `git diff --check` must pass.

Allowed files for the future mapping implementation slice:

- A new isolated product-photo report/UI mapping module under `src/lib/analysis/`, if explicitly opened.
- A new or updated mapping probe under `src/lib/analysis/`, if explicitly opened.
- `scripts/check-report-semantics.mjs`, only to expand safety coverage for product-photo mapping and display surfaces.
- `NEXT_STEPS.md` and `AGENT_LOG.md` for status updates.

Protected files for the future mapping implementation slice unless explicitly opened in a separate prompt:

- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/analyzer-routing.ts`.
- `src/lib/analysis/product-photo-analyzer.ts`.
- `src/lib/analysis/types.ts`.
- `src/lib/analysis/report-adapter.ts`, except for a separate receipt-preserving shared-report migration plan.
- `src/components/ClaimReviewWorkflow.tsx` and other UI components.
- Upload files.
- Scoring files.
- Parser files.
- Fixtures.
- Package scripts and dependencies.
- Providers, storage, integrations, and case queues.

Stop conditions for the future mapping implementation:

- Product-photo mapping requires `LocalAnalysisResult`.
- Receipt report/UI output changes unexpectedly.
- `analyzeEvidenceFile` changes, is imported, or is called.
- Product-photo output reaches live UI, upload, report display, scoring, parser, fixture, provider, storage, integration, or case queue paths before a separate display/live-routing slice is opened.
- Mapping requires raw photo bytes, raw EXIF, raw metadata, original filenames, raw label values, private evidence, provider output, storage handles, integration handles, or case queue handles.
- Any wording implies proof, external verification, customer wrongdoing, final outcome, or automatic disposition.
- Any required check fails or cannot be interpreted safely.

Why live routing remains separate:

- Report/UI mapping only defines a safe display contract for product-photo result shapes.
- Live upload/analyze routing decides when product-photo analysis runs, which remains blocked.
- UI display decides when reviewers can see product-photo results, which remains blocked until mapping, wording, privacy, and QA gates are complete.
- Keeping these separate protects the shipped receipt analyzer and prevents product-photo data from reaching support surfaces before the adapter and safety checks exist.

Recommended next implementation prompt after this docs gate is committed and pushed:

```text
/claimguardagent implement the first product-photo-safe report/UI mapping probe slice only: add an isolated product-photo mapping boundary and required probes without changing report-adapter.ts, UI components, upload routing, analyzeEvidenceFile, LocalAnalysisResult, receipt behavior, scoring, parser behavior, fixtures, providers, storage, integrations, or case queues; expand safety checks only if needed; run lint, build, report semantics, and diff check; commit only if safe; do not push
```

## Phase 2.2 Product-Photo Report/UI Display Gate

This is a docs-only planning gate. It defines what a future product-photo display slice must prove before product-photo review output appears in the app. It does not implement UI display, upload routing, live analyzer routing, live report-adapter mapping, scoring behavior, parser behavior, fixtures, providers, storage, integrations, case queues, or case workflow.

Product-photo report/UI display means a support-facing display surface that consumes `ProductPhotoReportViewModel` or a similarly narrow product-photo-specific display model. It does not mean displaying `ProductPhotoEvidenceAnalysisResult` directly, reusing `MockAnalysisReport`, forcing product-photo into `LocalAnalysisResult`, or adding product-photo to `mapLocalAnalysisToReport`.

The first future display slice should be an isolated display component and probe path. It should not modify `ClaimReviewWorkflow.tsx` unless a later prompt explicitly opens a live UI insertion slice. The safest initial target is a standalone product-photo display component that can be reviewed with synthetic view-model data before any upload, analyzer, or main workflow wiring.

What future product-photo UI display means:

- Showing a compact product-photo review context surface from the product-photo report view model.
- Keeping the evidence preview as the visual anchor and placing product-photo review context near the existing completed-result rail only after a live UI insertion slice is explicitly opened.
- Showing review readiness, local evidence quality, product context, relevant-area visibility review context, requested additional views, manual-review support action, customer-safe wording, score meaning, review priority, confidence, limitations, and external verification not performed.
- Keeping product-photo display support-rep focused and evidence-first, without a broad redesign or generic image-review dashboard.

What future product-photo UI display does not mean:

- Changing upload evidence routing.
- Changing `analyzeEvidenceFile`.
- Changing analyzer routing or enabling product-photo runtime behavior.
- Changing `mapLocalAnalysisToReport` or receipt report behavior.
- Displaying product-photo output inside receipt-specific OCR, parser, receipt structure, or extracted-field sections.
- Adding product-photo scoring, parser behavior, fixtures, providers, storage, integrations, case queues, or case workflow.
- Exporting raw product-photo evidence or raw metadata.

Required prerequisites before any future display implementation:

- Start from a clean `main` synced with `origin/main`.
- Confirm `0c7efed` or a later pushed checkpoint includes the product-photo report view-model boundary.
- Keep `ProductPhotoReportViewModel` as the only allowed display input for the first display component.
- Keep `LocalAnalysisResult` unchanged and receipt-shaped.
- Keep `analyzeEvidenceFile` as the live receipt analyzer entrypoint.
- Keep `mapLocalAnalysisToReport(result: LocalAnalysisResult)` receipt-only and unchanged.
- Keep `routeAnalyzerEvidenceInput` and guarded analyzer-routing boundaries decision-only and unwired from UI/upload/report/scoring/parser paths.
- Keep product-photo runtime non-live until a separate runtime-routing slice is explicitly opened.
- Add display-specific probes before any live UI insertion.
- Include every new product-photo display/export file in safety wording and privacy semantic coverage.
- Preserve receipt UI behavior and receipt report output.

Safe product-photo UI copy rules:

- Use `Evidence Reliability Score`.
- Explain that the score means local evidence quality and review readiness only.
- State that a high score does not prove the product photo or claim.
- Show `External Verification: Not performed` and `Not externally verified`.
- Keep score, review priority, confidence, and limitations as separate UI concepts.
- Use neutral review language such as product-photo review context, local evidence quality, review readiness, manual review recommended, product context may be incomplete, image consistency needs manual review, metadata is context only, additional context may be needed, and receipt or order match may be needed.
- Customer-facing copy should request the minimum useful additional context and avoid internal score details by default.
- Do not use proof language, final outcome language, customer-accusation language, automatic-disposition language, or wording implying external verification happened.

Allowed display fields from the product-photo view model:

- `reviewTitle`, `reviewSummary`, `reviewStatus`, `reviewPriority`, and `confidence`.
- `score.label`, `score.value`, `score.scope`, `score.meaning`, and score safety notes.
- `evidenceQuality.qualityLevel`, `evidenceQuality.qualitySummary`, and `evidenceQuality.qualityLimitCount`.
- `productContext.subjectType`, `productContext.productContextStatus`, `productContext.damageVisibilityReviewContext`, `productContext.labelContextSummary`, `productContext.purchaseOrOrderMatchNeeded`, and `productContext.requestedAdditionalViews`.
- `reviewSignals` as review-support signals only.
- `limitations`.
- `recommendedSupportAction`.
- `customerSafeWording`, if the display keeps it neutral and copy-safe.
- `externalVerification.status`, `externalVerification.externalVerification`, and `externalVerification.summary`.
- Privacy posture booleans showing that raw/private-bearing fields are excluded.

Forbidden display/export fields:

- Raw photo bytes, image buffers, object URLs, retained image fingerprints, or raw image-derived provider payloads.
- Raw EXIF, raw metadata, precise timestamps, GPS coordinates, device owner fields, device serial fields, software fields, file paths, original filenames, raw metadata notes, or copied metadata objects.
- Raw serial, model, label, barcode, or QR values.
- Faces, people, addresses, customer identifiers, private backgrounds, private evidence snippets, or real customer evidence details.
- Provider output, storage IDs or handles, integration IDs or handles, case queue IDs, or case workflow identifiers.
- Receipt-only fields such as OCR text, parsed receipt fields, receipt source classification, receipt score breakdown, receipt image heuristics, internal receipt structure confidence, or receipt-specific finding groups.
- Final evidence outcome, customer intent, claim outcome, automatic disposition, policy disposition, or any result-shape field that implies a completed support decision.

Required probes/checks before implementation:

- Product-photo UI/display shape probe proving the display consumes `ProductPhotoReportViewModel` or another product-photo-specific display model, not `LocalAnalysisResult` or `MockAnalysisReport`.
- UI isolation probe proving product-photo display does not invoke upload routing, live analyzer routing, `analyzeEvidenceFile`, parser, receipt scoring, fixtures, providers, storage, integrations, or case queues.
- Receipt preservation checks proving the receipt UI/report path still uses the existing receipt analyzer and receipt report adapter, and that receipt output remains unchanged.
- Privacy display/export checks proving no raw photo bytes, image buffers, raw EXIF, raw metadata, original filenames, raw labels, private evidence, provider output, storage handles, integration handles, or case queue handles can render or copy.
- Result-shape cases for no requested views, requested additional views, low/medium/high score, limited or missing metadata, label context present with raw values omitted, and overconfident source labels clamped to review-safe display.
- Safe wording checks covering every new product-photo display/export file.
- `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run check:report-semantics`, `git diff --check`, and final `git status --short --branch`.

Allowed files for the future display implementation slice:

- A new isolated product-photo display component under `src/components/`, only if explicitly opened.
- A new product-photo display probe under `src/lib/analysis/` or a narrow test/probe location consistent with existing patterns.
- `scripts/check-report-semantics.mjs`, only to add required display/export safety coverage.
- `NEXT_STEPS.md`, `PHASE_2_PHOTO_EVIDENCE_PLAN.md`, and `AGENT_LOG.md` for status updates.

Protected files for the future display implementation slice unless explicitly opened in a separate prompt:

- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/AnalysisReport.tsx`.
- `src/components/AuthenticityResultCard.tsx`.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/analyzer-routing.ts`.
- `src/lib/analysis/product-photo-analyzer.ts`.
- `src/lib/analysis/product-photo-report-view-model.ts`.
- `src/lib/analysis/types.ts`.
- Existing `src/lib/analysis/*.probe.ts`, unless a future prompt explicitly opens probe updates.
- Upload files.
- Scoring files.
- Parser files.
- Fixtures.
- Package scripts and dependencies.
- Providers, storage, integrations, and case queues.

Stop conditions for the future display implementation:

- Product-photo display requires `LocalAnalysisResult`, `MockAnalysisReport`, receipt OCR/parser fields, or receipt score breakdown.
- Product-photo output is placed inside receipt-specific extracted-data, OCR, parser, receipt structure, or receipt source-classification UI.
- `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt analyzer behavior, receipt report mapping, or receipt UI output changes unexpectedly.
- Product-photo display reaches live upload routing, analyzer routing, report-adapter live paths, scoring, parser, fixtures, providers, storage, integrations, or case queues before a separate slice is explicitly opened.
- UI or export code spreads `ProductPhotoEvidenceAnalysisResult`, `moduleDetails`, `privacySafeMetadataSummary`, raw metadata objects, or raw provider/model payloads.
- Any raw photo, raw metadata, original filename, raw label value, private evidence, provider output, storage handle, integration handle, or case queue handle appears in display, export, fixture, screenshot, log, or docs.
- Any wording implies proof, external verification, customer wrongdoing, final outcome, or automatic disposition.
- New display/export files are not covered by semantic checks.
- Any required check fails or cannot be interpreted safely.

Why routing, providers, and case workflow remain separate:

- UI display only controls how an already-safe view model is presented.
- Upload and analyzer routing decide when product-photo analysis runs, which remains blocked.
- Provider behavior would change evidence generation and privacy obligations, so it requires a separate provider/privacy/QA gate.
- Case workflow would introduce persistence, reviewer state, and audit concerns, so it belongs to a later phase gate.
- Keeping these separate protects the shipped receipt workflow and prevents product-photo output from becoming live before routing, privacy, wording, and QA are ready.

Recommended next implementation prompt after this docs gate is committed and pushed:

```text
/claimguardagent plan the first standalone product-photo display component slice only: keep it isolated from ClaimReviewWorkflow, upload routing, analyzeEvidenceFile, analyzer-routing live behavior, report-adapter.ts, LocalAnalysisResult, receipt behavior, scoring, parser behavior, fixtures, providers, storage, integrations, and case queues; require ProductPhotoReportViewModel-only props and semantic coverage for the new display surface; do not implement live UI insertion or push
```

## Phase 2.2 Standalone Product-Photo Display Component Plan

This is a docs-only component-slice plan. It defines the first future standalone product-photo display component before any component file exists. It does not implement a component, create a route, insert product-photo output into `ClaimReviewWorkflow`, change upload routing, enable analyzer routing, change report-adapter mapping, add scoring/parser behavior, touch fixtures, connect providers, add storage, add integrations, or create case queues.

The future component means:

- A standalone product-photo evidence-review panel, tentatively `ProductPhotoReviewPanel`.
- A support-review surface that consumes only the already display-safe product-photo report view model.
- A dark forensic panel that fits the current ClaimGuard analyzer/command-panel language without redesigning the whole app.
- A review aid for synthetic/dev-only product-photo view-model data until a separate live insertion slice is explicitly opened.

The future component does not mean:

- A live product-photo result in the main workflow.
- An image preview owner, image upload surface, analyzer trigger, export system, case workflow, or routing adapter.
- A generic repeated card stack or image-review dashboard.
- A receipt report replacement or receipt-specific detail drawer.
- A customer-facing outcome or support policy decision.

Required component input contract:

```ts
import type { ProductPhotoReportViewModel } from "@/lib/analysis/product-photo-report-view-model";

type ProductPhotoReviewPanelProps = {
  viewModel: ProductPhotoReportViewModel;
};
```

The first implementation must keep that exact single input shape. Do not add `className`, callbacks, copy/export handlers, upload state, `File`, `Blob`, object URL, image URL, data URL, raw metadata, raw result, `ProductPhotoEvidenceAnalysisResult`, `EvidenceAnalysisResult`, `LocalAnalysisResult`, `MockAnalysisReport`, or receipt report props in the first component slice. Any preview anchoring belongs to a later live UI insertion slice, and image preview ownership must stay outside this standalone component.

Required layout/content sections:

1. Header with product-photo review title, local/manual-review status, and external verification not performed.
2. Compact metric band for review priority, confidence, and evidence quality. These must be visibly separate from the score.
3. Evidence Reliability Score section with label, value, local-only scope, meaning, and high-score safety note.
4. Product context section with subject type, context status, relevant-area visibility review context, label context summary, purchase/order match needed, and requested additional views.
5. Recommended support action section using manual-review-only language.
6. Limitations section that includes local-only analysis, external verification not performed, score-is-not-proof meaning, metadata context-only posture, and any additional-context need.
7. Review signals section as the centerpiece, showing label, category, severity, confidence percent, review note, and recommended review step.
8. Privacy posture section showing derived-summary-only handling and raw/private-bearing fields excluded.

Layout rules:

- Render one cohesive evidence-review panel, not nested cards inside cards.
- Avoid internal nested scrolling for primary review content. Let the host page or isolated review surface scroll normally.
- Use text labels as well as color for priority/severity/confidence.
- Use semantic headings or sections for Priority, Confidence, Evidence quality, Recommended action, Limitations, and Review signals.
- Motion is optional and should be limited to a subtle result reveal if used; do not add analysis-running animation because the component is non-live. Respect reduced-motion behavior.

Safe UI copy rules:

- Use manual-review-only language: product-photo review context, review priority, evidence quality, review readiness, requested additional view, review signal, limitations, manual review recommended, additional context may be needed, and external verification not performed.
- Keep score, review priority, confidence, and limitations as separate concepts.
- State that the Evidence Reliability Score reflects local evidence quality and review readiness only.
- State that a high score does not prove the product photo or claim.
- Keep customer-safe wording neutral and focused on requesting minimum useful context.
- Do not use proof language, final-decision language, customer-accusation language, pass/fail authenticity wording, automatic outcome language, or wording implying external verification happened.

Forbidden imports and data surfaces:

- No `LocalAnalysisResult`, `MockAnalysisReport`, `EvidenceAnalysisResult`, `ProductPhotoEvidenceAnalysisResult`, `moduleDetails`, `privacySafeMetadataSummary`, raw product-photo result, receipt OCR/parser fields, receipt score breakdown, or receipt report types.
- No analyzer, analyzer routing, report adapter, scoring, parser, fixture, upload, metadata-service, provider, storage, integration, case queue, or `ClaimReviewWorkflow` imports.
- No `File`, `Blob`, object URL, image URL, data URL, image bytes, image buffer, retained image fingerprint, raw EXIF, raw metadata, original filename, precise timestamp, GPS, device owner field, device serial field, raw serial/model/label/barcode/QR value, people/faces/addresses/customer identifiers/private backgrounds, provider payload, storage handle, integration handle, case queue handle, or case workflow identifier.

Privacy limits:

- Display only derived fields from `ProductPhotoReportViewModel`.
- Export/copy behavior is out of scope for the first component. If a later slice adds it, the output must be derived-summary-only and covered by semantic/privacy checks.
- Do not render, log, screenshot, copy, or fixture real customer photos, private backgrounds, raw metadata, raw labels, or filenames.
- Do not add real product-photo fixtures or metadata fixtures.

Required probes/checks before and during implementation:

- A component shape probe proving the component props are exactly `{ viewModel: ProductPhotoReportViewModel }`.
- Import-boundary checks proving the component does not import analyzer, analyzer routing, report adapter, scoring, parser, fixtures, upload, providers, storage, integrations, case queues, receipt report types, or `ClaimReviewWorkflow`.
- A rendering/shape probe using synthetic `ProductPhotoReportViewModel` data for missing context, complete context, no requested views, multiple requested views, low/medium/high score, limited/missing metadata, label context with raw values omitted, and overconfident labels clamped to review-safe display.
- Privacy checks for recursive forbidden keys, sentinel private-value omission, no object URL/image/file/blob props, no raw metadata spreading, no raw result spreading, and no copy/export leakage.
- Receipt preservation checks proving `mapLocalAnalysisToReport(result: LocalAnalysisResult)` remains receipt-only, `ClaimReviewWorkflow` still uses the receipt analyzer/report adapter path, and receipt UI/report output is not changed.
- Add every new product-photo display/export file to `scripts/check-report-semantics.mjs`; missing semantic coverage for a new display file is a stop condition.
- Run `git status --short --branch`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run check:report-semantics`, `git diff --check`, and final `git status --short --branch`.
- If an isolated route, story, harness, or other renderable host is added for the standalone component, run a browser/render check and verify no console errors, no primary content overflow, no text overlap, no nested primary scroll, and responsive behavior. If no renderable host exists, report that visual/browser verification is not available for the slice.

Allowed files for the future implementation slice:

- One new isolated component file under `src/components/`, such as `src/components/ProductPhotoReviewPanel.tsx`.
- One narrow component probe/test file in a location consistent with existing project patterns.
- `scripts/check-report-semantics.mjs`, only to cover the new display surface and any display/export wording.
- `NEXT_STEPS.md`, `PHASE_2_PHOTO_EVIDENCE_PLAN.md`, and `AGENT_LOG.md` for status updates.

Protected files for the future implementation slice:

- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/AnalysisReport.tsx`.
- `src/components/AuthenticityResultCard.tsx`.
- `src/lib/analysis/product-photo-report-view-model.ts`, unless a tiny additive display-contract field is separately authorized.
- Existing `src/lib/analysis/*.probe.ts`, unless the future prompt explicitly opens probe updates.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/analyzer-routing.ts`.
- `src/lib/analysis/product-photo-analyzer.ts`.
- `src/lib/analysis/types.ts`.
- Upload files, scoring, parser, fixtures, package scripts/dependencies, providers, storage, integrations, and case queues.

Stop conditions for the future implementation:

- The component needs anything other than `viewModel: ProductPhotoReportViewModel`.
- The component needs image preview ownership, object URLs, files, blobs, image bytes, raw metadata, raw labels, original filenames, raw product-photo results, or receipt-only fields.
- The component imports analyzer, analyzer routing, report adapter, scoring, parser, upload, fixtures, providers, storage, integrations, case queues, or `ClaimReviewWorkflow`.
- The component is wired into `ClaimReviewWorkflow`, upload routing, analyzer routing, report-adapter live paths, scoring, parser, fixtures, providers, storage, integrations, or case queues.
- Receipt UI/report behavior changes, `LocalAnalysisResult` changes, `analyzeEvidenceFile` changes, or product-photo runtime becomes live.
- Any wording implies proof, external verification, customer wrongdoing, final outcome, automatic disposition, or support policy disposition.
- Any new product-photo display/export file is missing semantic/privacy coverage.
- Required checks fail or cannot be interpreted safely.

Why later slices remain separate:

- `ClaimReviewWorkflow` insertion is a live workflow change and must wait for a separate insertion prompt.
- Upload routing and analyzer routing decide when product-photo analysis runs, so they must remain blocked until a separate runtime-routing slice.
- Report-adapter mapping is receipt-live today and must stay receipt-only unless a separate shared-report migration is opened.
- Providers, storage, integrations, and case queues change privacy, retention, and audit responsibilities, so they are not part of a standalone display component.
- The first component slice only proves a safe presentation surface for an already derived, non-live view model.

Recommended next implementation prompt after this docs plan is committed and pushed:

```text
/claimguardagent implement the non-live synthetic ProductPhotoReviewPanel visual verification host only: add a separate unlinked and production-disabled developer route at src/app/dev/product-photo-review-panel/page.tsx with colocated literal ProductPhotoReportViewModel render cases; do not use /test-evidence, ClaimReviewWorkflow, upload routing, analyzeEvidenceFile, analyzer-routing, report-adapter mapping, scoring, parser behavior, fixtures, providers, storage, integrations, case queues, real photos, image URLs, object URLs, file/blob data, raw metadata, or private identifiers; add semantic/privacy coverage for the host files; run lint, build, report semantics, diff check, and browser checks; commit only if safe; do not push
```

## Phase 2.2 Non-Live Product-Photo Render Host Plan

This is a docs-only visual verification gate for the already-implemented `ProductPhotoReviewPanel`. It does not create a route, host, story, component, probe, fixture, runtime path, upload path, report mapping, analyzer routing, provider, storage, integration, or case queue.

Recommendation:

- Add a non-live synthetic render host in a future implementation slice so the isolated panel can receive browser and visual QA.
- Prefer a non-route component/browser harness if the repo later adds suitable tooling.
- If a URL-based browser check is needed before component-harness tooling exists, use a separate unlinked developer route, not `/test-evidence` and not the main workflow.

Safest future browser-checkable location:

- Route file: `src/app/dev/product-photo-review-panel/page.tsx`.
- Synthetic cases file: `src/app/dev/product-photo-review-panel/render-cases.ts`.
- URL: `/dev/product-photo-review-panel`.
- The route must be clearly internal/developer-only, unlinked from app navigation, and production-disabled with `notFound()` or equivalent unless Robert explicitly approves deployed QA access.

What the host means:

- A synthetic visual QA surface for `ProductPhotoReviewPanel`.
- A way to run browser checks for desktop and mobile layout, console cleanliness, text fit, section visibility, no overlap, no primary nested scroll, and responsive signal rows.
- A route-local display of hand-authored synthetic `ProductPhotoReportViewModel` cases only.

What the host does not mean:

- It is not live product-photo UI insertion.
- It is not a new upload or analysis workflow.
- It is not part of `ClaimReviewWorkflow`, `/`, `/test-evidence`, receipt QA, report adapter mapping, analyzer routing, scoring, parser behavior, fixtures, provider behavior, storage, integrations, or case queues.
- It does not make product-photo runtime live.
- It does not display real photos, uploaded images, image previews, object URLs, image URLs, raw metadata, raw labels, filenames, provider output, or private identifiers.

Required synthetic data contract:

- `render-cases.ts` should export readonly literal objects that satisfy `ProductPhotoReportViewModel`.
- Synthetic cases should cover missing context, complete context, no requested views, multiple requested views, low/medium/high scores, no-signal state, long review text, limited/missing metadata summaries, label context with raw values omitted, and high-score-not-proof copy.
- Synthetic strings must be allowlisted review summaries only. Do not include case IDs, claim IDs, evidence IDs, ticket IDs, realistic order numbers, customer names, addresses, filenames, URLs, Windows paths, serial/model values, barcode/QR values, provider IDs, storage IDs, integration IDs, case queue IDs, or copied metadata notes.
- Do not import `ProductPhotoReviewPanel.probe.tsx`, mapper inputs, product-photo analyzer results, shared-result types, receipt fixtures, real files, blobs, object URLs, or metadata objects.

Required import boundaries:

- The route may import `ProductPhotoReviewPanel`, the synthetic render cases, and framework helpers needed to disable the route in production.
- The synthetic cases file may import only the `ProductPhotoReportViewModel` type.
- Do not import `analyzeEvidenceFile`, analyzer routing, product-photo analyzer/result builders, report adapter mapping, scoring, parser, upload modules, `ClaimReviewWorkflow`, `TestEvidenceHarness`, fixtures, providers, storage, integrations, case queues, or receipt report types.

Required UI and visual QA goals:

- Verify the panel renders without console errors.
- Verify required sections are visible: status/review summary, review priority, confidence, evidence quality, Evidence Reliability Score, product/photo context, recommended support action, limitations, review signals, and privacy posture.
- Verify score, review priority, confidence, evidence quality, and limitations remain visually distinct.
- Verify manual-review-only wording is visible.
- Verify `External Verification: Not performed` and `Not externally verified` remain visible.
- Verify high score does not imply proof.
- Verify severity and confidence use text labels beyond color.
- Verify no text overlap, no clipped button-like labels, no incoherent wrapping, no primary nested scrolling, and no layout shift across desktop and mobile.
- Verify reduced-motion posture by avoiding analysis-running animation.

Required privacy and safety constraints:

- Use synthetic view-model data only.
- Do not use real photos, screenshots of real evidence, uploaded files, image/media elements, object URLs, data URLs, file/blob props, raw EXIF, raw metadata, original filenames, raw label values, precise timestamps, GPS, customer identifiers, private background details, provider payloads, storage handles, integration handles, case queue handles, or case workflow identifiers.
- Browser screenshots must capture only the synthetic host. Do not capture `/`, `/test-evidence` real QA state, uploaded evidence previews, localStorage/session state, object URLs, real filenames, real photos, or real metadata.
- Do not commit screenshots unless the image is fully synthetic and privacy-reviewed.
- Keep all copy manual-review-only and avoid proof, external-verification, customer-accusation, final-outcome, automatic-decision, approval, rejection, and policy-disposition wording.

Required future probes/checks/browser steps:

- Add the future host route and render-cases files to `scripts/check-report-semantics.mjs`.
- Extend semantic checks to deny forbidden imports, raw/private keys, URL/path patterns, case/ticket/evidence identifiers, realistic customer/order identifiers, and unsafe wording in both host files.
- Preserve existing `ProductPhotoReviewPanel.probe.tsx` contract coverage.
- Run `git status --short --branch`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run check:report-semantics`, `git diff --check`, and final `git status --short --branch`.
- Start the dev server and browser-check `/dev/product-photo-review-panel` only if the route is implemented.
- Browser-check desktop and mobile viewports for console errors, responsive layout, no text overlap, no primary nested scroll, visible manual-review copy, visible external-verification-not-performed copy, and section order.
- Confirm `/` still renders the existing receipt workflow and does not link to or import the product-photo host.

Allowed files for the future implementation slice:

- `src/app/dev/product-photo-review-panel/page.tsx`.
- `src/app/dev/product-photo-review-panel/render-cases.ts`.
- `scripts/check-report-semantics.mjs` for host semantic/privacy coverage.
- `NEXT_STEPS.md` and `AGENT_LOG.md` for status updates.
- `PHASE_2_PHOTO_EVIDENCE_PLAN.md` only if durable host guidance needs a small update.

Protected files for the future implementation slice:

- `src/app/page.tsx`.
- `src/app/test-evidence/page.tsx`.
- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/TestEvidenceHarness.tsx`.
- `src/components/ProductPhotoReviewPanel.tsx` unless a browser check reveals a tiny display bug and Robert explicitly opens that fix.
- `src/components/ProductPhotoReviewPanel.probe.tsx` unless semantic coverage must be tightened without changing the component contract.
- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/analyzer-routing.ts`.
- `src/lib/analysis/product-photo-analyzer.ts`.
- `src/lib/analysis/product-photo-report-view-model.ts`.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/types.ts`.
- Upload files, scoring, parser, fixtures, package dependencies, providers, storage, integrations, and case queues.

Stop conditions:

- The host requires `File`, `Blob`, image URL, object URL, data URL, image preview ownership, uploaded state, browser storage, route params, fetch, provider output, raw metadata, original filename, raw label value, case/ticket/evidence/customer identifiers, or real photos.
- The host imports `analyzeEvidenceFile`, analyzer routing, product-photo analyzer/result builders, report adapter mapping, scoring, parser, upload modules, fixtures, providers, storage, integrations, case queues, `ClaimReviewWorkflow`, `TestEvidenceHarness`, `LocalAnalysisResult`, `EvidenceAnalysisResult`, `ProductPhotoEvidenceAnalysisResult`, or `MockAnalysisReport`.
- The host is added to `/`, `/test-evidence`, app navigation, upload flow, report output, live analyzer paths, scoring, parser, fixtures, providers, storage, integrations, or case queues.
- Product-photo runtime becomes live, receipt behavior changes, `LocalAnalysisResult` changes, `analyzeEvidenceFile` changes, or receipt UI/report output changes.
- Any wording implies proof, external verification happened, customer wrongdoing, final claim outcome, approval, rejection, automatic disposition, or policy disposition.
- The future host files are not included in semantic/privacy checks.
- Browser checks show console errors, overlapping text, primary nested scrolling, inaccessible color-only state, or mobile layout breakage.

Why this is not live UI insertion:

- The host is a developer visual QA surface for synthetic view models only.
- It does not call analysis code, route uploads, map reports, or participate in support workflow.
- It is unlinked from the real app and production-disabled unless separately approved.
- `ClaimReviewWorkflow` remains the live receipt workflow, and product-photo remains non-live.

Recommended next implementation prompt after this docs plan is committed and pushed:

```text
/claimguardagent implement the non-live synthetic ProductPhotoReviewPanel visual verification host only: add a separate unlinked and production-disabled developer route at src/app/dev/product-photo-review-panel/page.tsx plus src/app/dev/product-photo-review-panel/render-cases.ts with literal ProductPhotoReportViewModel cases only; do not use /test-evidence, ClaimReviewWorkflow, upload routing, analyzeEvidenceFile, analyzer-routing, report-adapter mapping, scoring, parser behavior, fixtures, providers, storage, integrations, case queues, real photos, image URLs, object URLs, file/blob data, raw metadata, or private identifiers; add semantic/privacy coverage for the host files; run lint, build, report semantics, diff check, and browser checks for desktop/mobile layout and console errors; commit only if safe; do not push
```

## Future Evidence Review UX Direction

Robert wants the eventual result screen to feel like an evidence triage workspace, not a stack of competing result cards. This is product direction only; do not implement it during the current Phase 2.2 runtime-boundary work.

- Show one primary review state, with signals as the centerpiece of the result.
- Let each signal eventually point to the exact document or photo region that produced it.
- Keep the score breakdown explainable so reviewers can see why the overall Evidence Reliability Score landed where it did.
- Treat confidence and risk as separate concepts: confidence describes analysis certainty, while risk describes review priority.
- Include clear reviewer next actions such as "Request clearer evidence", "Flag for manual review", "Record as reviewed", and "Export privacy-safe summary".
- Make the idle screen less repetitive over time, while better communicating the workflow, local-only handling, and privacy posture.
- Preserve manual-review discipline: result actions should support reviewer workflow, not imply ClaimGuard has made a final evidence or claim decision.

## Do Not Touch Right Now

- Do not wire product-photo scaffold into runtime analyzer behavior.
- Do not call `recognizeProductPhotoEvidence` from `analyzeEvidenceFile`.
- Do not change `analyzeEvidenceFile`.
- Do not change `LocalAnalysisResult`.
- Do not add live product damage photo analysis.
- Do not modify app UI.
- Do not modify upload/input/reset behavior.
- Do not modify analyzer, parser, scoring, report, privacy, or fixture logic.
- Do not connect real AI, OCR, ticket, email, drive, database, auth, Vercel, or payment systems.
- Do not change package dependencies.
- Do not deploy unless Robert explicitly asks.

## Current Recommended Next Prompt

```text
/claimguardagent run a review-only Phase 3.6 post-push QA/source-of-truth closeout for /case-command-center; verify the customer-safe wording module remains static/local, synthetic-only, unlinked, off-white ClaimGuard direction, and unchanged for receipt behavior, ClaimReviewWorkflow, ProductPhotoReviewPanel, upload, saved text/send actions/form submission, persistence, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, analyzer/report/parser/scoring/fixture behavior, and deployment
```
