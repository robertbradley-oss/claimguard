# ClaimGuard Repo Source Of Truth

Use `C:\Users\robby\Projects\ClaimGuard` as the active ClaimGuard source-of-truth repo.

Do not make ClaimGuard code, fixture, package, or documentation edits in `C:\Users\robby\OneDrive\Documents\GitHub\claimguard`. That OneDrive checkout is an outdated duplicate and should be treated as read-only reference material unless Robert explicitly says otherwise.

The OneDrive Documents path may exist as a shell starting point, but it is not the active Git working tree.

## Branch And Release Discipline

- Check `git status --short --branch` before and after work.
- Preserve unrelated user changes.
- Do not commit, push, deploy, rewrite history, or change repo visibility unless Robert explicitly asks.
- Do not stage `.env*`, `.vercel/`, `.next/`, `node_modules/`, real customer evidence, raw OCR from private evidence, private JSON exports, screenshots containing private details, or credentials.
- Keep release notes clear about whether work was docs/config-only, app behavior, analyzer logic, UI, QA, or deployment.

## Phase-Aware Workflow

- Phase 1 Receipt Intelligence is closed, deployed, and production-smoked.
- Phase 2 Photo Evidence is closed as non-live unsupported/product-photo readiness after the Phase 2.9.1 review-only closeout and final closure alignment pushed at `3779ab0` (`docs: close phase 2 non-live readiness`). Phase 2.6 is closed after pushed commit `6f3170a` (`fix: tighten unsupported evidence wording guards`), and Phase 2.9.0 is pushed at `095fd18` (`docs: plan phase 2.9 live opt-in readiness`).
- Phase 2.4 adapter-readiness and runtime-blocker planning is complete.
- A guarded, non-live product-photo adapter contract exists and is pushed.
- A pre-analysis evidence gate exists and is pushed, but remains decision-only and unwired. A default-off pre-analysis gate runtime wrapper/probe also exists and is pushed, but remains unwired from live callers.
- Product-photo runtime remains non-live; no product-photo analyzer behavior is live yet.
- `analyzeEvidenceFile` remains the live receipt analyzer entrypoint.
- `LocalAnalysisResult` remains unchanged and receipt-shaped.
- Receipt behavior remains unchanged.
- UI, upload, live report adapter mapping, scoring, parser, and fixtures remain untouched by product-photo runtime.
- No providers, storage, integrations, case queues, real photos, or real metadata fixtures were added.
- `product-photo` is canonical.
- `damage-photo` remains legacy/non-canonical and only a compatibility alias to `product-photo` / `damage-close-up`.
- Dev-only adapter/gate harness work is closed as Phase 2.5 and remains no-live, synthetic-only, unlinked, and production-disabled.
- Phase 2.6 closed with product-photo runtime non-live, `analyzeEvidenceFile` unchanged, `LocalAnalysisResult` unchanged, receipt behavior unchanged, UI/upload/live report adapter mapping/scoring/parser/fixtures untouched, no ProductPhotoReviewPanel routing added by `6f3170a`, no providers/storage/integrations/case queues, no OCR/metadata processing, and no deployment.
- Phase 2.7.0 is docs-only planning for live-opt-in readiness of the default-off wrapper and unsupported-evidence reviewer state. It does not authorize implementation.
- Phase 2.7.1 is docs-only planning for the unsupported-evidence reviewer state contract. It defines the future stop-state name, neutral labels/copy, support action wording, confidence/uncertainty rules, what must not be shown, receipt-preservation gates, future QA/browser requirements, protected surfaces, and implementation stop conditions.
- Phase 2.7.2 is docs-only planning for a future non-live unsupported-evidence display/mapping probe. It recommends an executable pure mapper/probe before any rendered UI, and keeps unsupported evidence out of receipt scores, proof-of-purchase wording, product-photo reports, ProductPhotoReviewPanel, and live runtime paths.
- Phase 2.7.3 is closed and pushed at `0d90260` (`docs: close phase 2.7.3 mapper probe`). It adds and closes that pure non-live unsupported-evidence display/mapping probe in `src/lib/analysis/unsupported-evidence-review-state.ts` with active coverage in `src/lib/analysis/unsupported-evidence-review-state.probe.ts`, `scripts/run-product-photo-probes.cjs`, and `scripts/check-report-semantics.mjs`. It remains isolated from live runtime, rendered UI, upload, report mapping, ProductPhotoReviewPanel, parser/scoring/fixtures, providers/storage/integrations/case queues, OCR/metadata, `analyzeEvidenceFile`, and `LocalAnalysisResult`.
- Phase 2.7.4 is docs-only planning in `PHASE_2_7_4_LIVE_OPT_IN_READINESS_CHECKPOINT.md`. It decides the next safest readiness step is workflow/caller boundary design, with future opt-in at the caller boundary rather than inside `analyzeEvidenceFile`; `LocalAnalysisResult` remains receipt-shaped; unsupported-evidence output stays separate from receipt reports and ProductPhotoReviewPanel; and dev-only harness, report-adapter shape probe, and feature-flag/default-off opt-in planning are not the next step.
- Phase 2.7.5 is docs-only planning in `PHASE_2_7_5_WORKFLOW_CALLER_BOUNDARY_OPT_IN_DESIGN.md`. It decides the future default-off opt-in should be owned by the `ClaimReviewWorkflow` run-analysis boundary or a small workflow-local helper used only from that boundary. It keeps `analyzeEvidenceFile` receipt-only, `LocalAnalysisResult` receipt-shaped, unsupported-evidence output outside receipt reports and ProductPhotoReviewPanel, and mapper use limited to derived-state mapping outside live receipt analysis.
- Phase 2.7.7 is closed and pushed at `32d013b` (`feat: add workflow boundary probe for unsupported evidence`). It adds the probe-only workflow/caller boundary helper and probe, keeps the helper default-off and outside live callers, does not call `analyzeEvidenceFile` or `mapLocalAnalysisToReport`, does not produce or migrate `LocalAnalysisResult`, does not route `ProductPhotoReviewPanel`, and adds no rendered UI.
- Phase 2.7.8 is docs-only source-of-truth alignment after `32d013b`; it should only update status docs, next-work guidance, and release/phase truth. It must not change runtime code, UI, upload flow, analyzer/parser/scoring/report/fixture behavior, providers/storage/integrations/case queues, OCR/metadata, package/deploy config, or receipt behavior.
- Phase 2.8.0 is docs-only acceleration planning in `PHASE_2_8_0_UNSUPPORTED_EVIDENCE_DEV_BRIDGE_PLAN.md`. It chooses a separate unlinked, production-disabled dev-only story/probe route as the safest future bridge for unsupported-evidence review visibility, not `/test-evidence`, not live `ClaimReviewWorkflow`, not live UI, and not `ProductPhotoReviewPanel`.
- Phase 2.8.1 is docs-only implementation planning in `PHASE_2_8_1_UNSUPPORTED_EVIDENCE_DEV_BRIDGE_IMPLEMENTATION_PLAN.md`. It prepares Phase 2.8.2 as a route-local, unlinked, production-disabled, synthetic-only developer bridge at `src/app/dev/unsupported-evidence-review/page.tsx` with colocated literal render cases, at most type-only imports from the unsupported-evidence mapper contract, no workflow-boundary helper import, and no live runtime/UI/upload/report behavior.
- Phase 2.8.2 is closed after the successful Phase 2.8.3 review-only closeout retry for pushed commit `3dd8b74` (`fix: remove forbidden dev bridge wording`). The original dev-only unsupported-evidence review bridge was pushed at `7ee4b65`; the blocker patch at `3dd8b74` removed forbidden rendered score-boundary wording, added the safe receipt-verification-outcome notice, and strengthened semantic coverage for simple split/joined visible strings. The route remains unlinked, production-disabled, synthetic-only, and isolated from live runtime, upload, report mapping, parser, scoring, fixtures, `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, providers/storage/integrations/case queues, OCR/metadata, `analyzeEvidenceFile`, and `LocalAnalysisResult`; production `next start` returns 404 for `/dev/unsupported-evidence-review`.
- No deployment occurred for Phase 2.8.3. Product-photo/unsupported-evidence runtime remains non-live, unsupported-evidence live UI does not exist, `ClaimReviewWorkflow` remains unwired, and receipt behavior remains unchanged.
- Phase 2.9.0 is docs-only planning in `PHASE_2_9_0_UNSUPPORTED_EVIDENCE_LIVE_OPT_IN_READINESS_PLAN.md`. It decides unsupported evidence is not ready for live opt-in implementation yet.
- Phase 2.9.1 review-only closeout passed. Phase 2 is closed as non-live unsupported/product-photo readiness. Product-photo/unsupported-evidence runtime remains non-live; live opt-in remains blocked; the pre-analysis wrapper remains default-off and unwired; the workflow boundary helper remains probe-only/default-off/unwired; the dev-only unsupported-evidence bridge remains synthetic-only and production-blocked with 404 under `next start`; `ClaimReviewWorkflow` remains unwired; unsupported-evidence live UI does not exist; `ProductPhotoReviewPanel` remains unrouted; `analyzeEvidenceFile` remains the receipt analyzer entrypoint; `LocalAnalysisResult` remains receipt-shaped; upload/report/parser/scoring/fixtures/provider/storage/integration/case-queue/OCR/metadata paths remain protected; receipt behavior remains unchanged; no deployment occurred; and Phase 3 later started as the static/local shell work described below.
- Phase 3.0 planning-only case workflow readiness is documented in `PHASE_3_0_CASE_WORKFLOW_READINESS_PLAN.md`. It defines the case object concept, evidence model, UX architecture, safety boundaries, technical boundaries, Phase 1/2 inheritance, and recommended Phase 3 sequence without implementing routes, components, runtime wiring, persistence, integrations, or receipt behavior changes.
- Phase 3.1 design system/case workflow concept planning is documented in `PHASE_3_1_CASE_WORKFLOW_DESIGN_CONCEPT.md`. It defines the future Case Review Command Center visual direction, layout concept, planned primitives, interaction model, safety/wording rules, technical boundaries, and Phase 3.2 first-build target without implementing routes, components, runtime wiring, persistence, integrations, or receipt behavior changes.
- Phase 3.2 is pushed, reviewed, and safe to build on at `a169de4` (`feat: add phase 3.2 local case command center shell`). It adds a non-persistent Case Review Command Center shell at `/case-command-center`, using `src/components/CaseReviewCommandCenter.tsx` and isolated synthetic data in `src/lib/case-command-center/mock-case.ts`. The shell is static/local, synthetic-only, and unlinked; `/case-command-center` renders; `/` remains the existing Phase 1 receipt workflow; `/` does not link to `/case-command-center`; browser console checks reported no warnings/errors; and no deployment occurred. It does not edit `ClaimReviewWorkflow`, wire unsupported-evidence runtime, route `ProductPhotoReviewPanel`, change `analyzeEvidenceFile`, migrate `LocalAnalysisResult`, change receipt upload/analyzer/report/parser/scoring/provider/storage behavior, add persistence, upload behavior, integrations, OCR/metadata/image analysis, storage/providers, auth/billing, real evidence, or deployment.
- Phase 3.3 polishes `/case-command-center` visual hierarchy and selected-evidence structure while preserving the Phase 1 off-white ClaimGuard evidence workspace direction. It keeps the route static/local, synthetic-only, and unlinked; strengthens the selected-evidence bench, evidence sidebar, review summary rail, notes/manual decision area, customer-safe wording, and timeline placement; and does not add persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, or `ProductPhotoReviewPanel` routing.
- Phase 3.4 polishes `/case-command-center` timeline/audit trail structure while preserving the same static/local, synthetic-only, unlinked shell. It expands isolated mock timeline data with event categories, static mock timestamps, relative timing, severity/status labels, case-status-after labels, reviewer-impact notes, and selected-evidence links; it adds semantic guard coverage for the Phase 3.4 timeline shell. It does not add persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, deployment, Phase 3.5, or Phase 4 work.
- Phase 3.5 polishes `/case-command-center` notes/manual decision workflow structure while preserving the same static/local, synthetic-only, unlinked shell. It adds isolated mock manual-review workspace data, static decision state chips, selected-evidence rationale, internal note structure, policy/safety reminders, customer-safe wording handoff guidance, timeline linkage, and not-saved/not-sent boundary copy; it adds semantic guard coverage for the Phase 3.5 manual review shell. It does not add editable saved notes, form submission, persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, deployment, Phase 3.6, or Phase 4 work.
- Phase 3.6 polishes `/case-command-center` customer-safe wording into a static mock response-prep module. It adds isolated synthetic response variants, wording intent/tone labels, support-safe guardrails, selected-evidence rationale links, a rep review checklist, timeline linkage, and not-sent/not-saved boundary copy. It does not add editable saved text, send/copy-to-ticket behavior, form submission, persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, deployment, Phase 3.7, or Phase 4 work.
- Phase 3.7 polishes `/case-command-center` evidence sidebar scanability and selected-evidence detail depth while preserving the same static/local, synthetic-only, unlinked shell. It adds grouped synthetic evidence bench rows, clearer type/status/review-state indicators, structured selected-evidence metadata, synthetic review context, observed signals, limitations, investigation focus, cross-reference links, and next-step cues; it adds semantic guard coverage for the Phase 3.7 shell label and detail structure. It does not add upload behavior, file inputs, editable saved evidence state, form submission, persistence, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, deployment, Phase 3.8, or Phase 4 work.
- Phase 3.8 polishes `/case-command-center` case header and command/status orientation while preserving the same static/local, synthetic-only, unlinked shell. It adds isolated synthetic header data for case title, mock status, priority, queue/context, review posture, safe next posture, summary chips, non-clickable command/status labels, and local-only/privacy badges; it adds semantic guard coverage for the Phase 3.8 header and command/status layer. It does not add real actions, saved state, upload behavior, file inputs, form submission, persistence, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, deployment, Phase 3.9, or Phase 4 work.
- Phase 3.9 polishes `/case-command-center` case-level review summary intelligence while preserving the same static/local, synthetic-only, unlinked shell. It adds isolated synthetic synthesis data for evidence reviewed, missing information, manual-review drivers, limitations, safe reviewer posture, selected-evidence linkage, timeline linkage, manual-decision linkage, customer-safe wording linkage, and an internal-only not-a-scoring-result/not-an-automated-decision boundary; it adds semantic guard coverage for the Phase 3.9 synthesis layout. It does not add real scoring, automated decisions, real actions, saved state, upload behavior, file inputs, form submission, persistence, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, deployment, Phase 3.10, or Phase 4 work.
- Phase 3.10 polishes `/case-command-center` as the final responsive/static shell pass while preserving the same static/local, synthetic-only, unlinked shell. It tightens the mid-desktop layout, mobile spacing, sticky scan rails, text wrapping, and module density across the header, evidence bench, selected-evidence panel, review synthesis, manual review workspace, customer-safe wording, and timeline; it adds semantic guard coverage for the Phase 3.10 shell marker. It does not add real scoring, automated decisions, real actions, saved state, upload behavior, file inputs, form submission, persistence, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, deployment, or Phase 4 work.
- Phase 3 is closed as a static/local Case Review Command Center shell after the Phase 3 closeout readiness checkpoint passed. Latest Phase 3 shell commit: `11aba49` (`feat: polish phase 3.10 case command center shell`). Phase 3 closure and Vercel deployment are complete at `003a88d` (`docs: close phase 3 case workflow shell`). `/case-command-center` remains static/local, synthetic-only, unlinked, non-persistent, off-white/parchment, and publicly reachable by direct production URL; `/` remains the Phase 1 receipt workflow and does not link to `/case-command-center`; receipt behavior is unchanged; `ClaimReviewWorkflow` remains unchanged; `ProductPhotoReviewPanel` remains unrouted; and no persistence, upload behavior, integrations, OCR/metadata expansion, storage/providers, auth/billing, real evidence, live actions, saved state, live scoring, ticket/export/send behavior, or Phase 4 implementation was added.
- Phase 4.0 planning-only real AI/OCR/photo intelligence readiness is documented in `PHASE_4_0_AI_OCR_PHOTO_INTELLIGENCE_READINESS.md`. Phase 4 implementation has not started. Stronger OCR, AI/vision, and photo intelligence should become review signals with confidence, uncertainty, limitations, and manual-review guidance, not final verdicts or automated support decisions.
- Phase 4.1 docs-only OCR/provider architecture planning is documented in `PHASE_4_1_OCR_PROVIDER_ARCHITECTURE_PLAN.md`. It defines provider-neutral OCR input/output boundaries, structured receipt fields, Amazon validation readiness, browser-local versus server-side tradeoffs, future route boundaries, privacy/data handling, scoring/signal integration, QA/safety gates, recommended Phase 4.2-4.8 sequence, and explicit blocked scope. It does not implement OCR, add providers/SDKs/env vars/routes/uploads/storage/persistence, process real evidence, wire `ClaimReviewWorkflow`, route `ProductPhotoReviewPanel`, migrate `LocalAnalysisResult`, change receipt behavior, deploy, commit, or push.
- Phase 4.2 non-live synthetic OCR fixture harness is implemented in `src/lib/analysis/ocr-fixture-harness.ts` with probe coverage in `src/lib/analysis/ocr-fixture-harness.probe.ts`, registered in `scripts/run-product-photo-probes.cjs`, and covered by `scripts/check-report-semantics.mjs`. It is fixture-only, synthetic-only, provider-free, route-free, UI-free, upload-free, storage-free, real-evidence-free, and unwired from live runtime. It does not change `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, upload flow, `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, providers/storage/integrations/case queues, OCR/metadata implementation, env vars, package/config/deployment files, or receipt behavior.
- The next safe task is Phase 4.3 provider-neutral OCR extraction contract implementation, non-live and unwired. Do not implement real AI, OCR provider calls, provider SDKs, credentials, env vars, routes, upload behavior, persistence, live scoring, real evidence handling, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `LocalAnalysisResult` migration, or receipt behavior changes until Robert explicitly opens a named implementation slice.
- Do not start product-photo runtime, UI/upload wiring, analyzer routing, live report mapping, provider, storage, integration, or case-queue work until Robert explicitly opens that slice.
- Future-phase planning is allowed when requested.
- Future-phase implementation requires explicit approval from Robert.
- Use `ROADMAP.md` for durable phase definitions.
- Use `NEXT_STEPS.md` for the immediate working queue.
- Use `AGENTS.md` and `ROUTING.md` to select the correct agent role before work.

## Pre-Change Review Checklist

Before editing:

- Confirm you are in `C:\Users\robby\Projects\ClaimGuard`.
- Confirm the selected agent and phase boundary.
- Identify whether the task touches docs/config, UI, analyzer/parser/scoring/report/privacy logic, fixtures, dependencies, or release/deploy workflow.
- Confirm private evidence is not being introduced.

## Stop And Report Conditions

Stop and report before continuing when:

- The active path is not `C:\Users\robby\Projects\ClaimGuard`.
- Work appears to be in a OneDrive duplicate or outdated checkout.
- Dirty mixed work makes the current task scope unclear.
- Unexpected app-code, analyzer, parser, scoring, report, privacy, fixture, package, script, or upload-mechanics diffs appear.
- Real customer evidence, private customer data, raw OCR, copied private JSON, or credentials appear in files or logs.
- Unsafe wrongdoing-confirming language, customer-accusation language, or automatic-denial language appears.
- Product-photo runtime behavior, UI/upload wiring, analyzer routing, live report mapping, scoring/report/parser/fixture changes, or provider/storage/integration/case-queue work appears before Robert explicitly opens that runtime slice.
- A required check fails or cannot run.

## Check Guidance

Docs/config-only:

- `git diff --check`
- `npm.cmd run check:report-semantics` when safety wording might matter

Analyzer/parser/scoring/report/privacy/fixture changes:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:report-semantics`
- Targeted synthetic fixture or manual QA checks

UI changes:

- `npm.cmd run lint`
- `npm.cmd run build`
- Browser check affected routes when practical

Release/deploy work:

- `git status --short --branch` before and after
- Confirm exact branch and commit
- Run relevant checks for changed areas
- Perform or document production smoke only when deploy is explicitly requested

## Source Safety

Committed fixtures must be synthetic or structurally redacted. Real customer receipts, photos, ticket content, order details, customer messages, and copied private JSON must not be committed.

Preserve ClaimGuard semantics: evidence scores measure local evidence quality and internal consistency, not externally confirmed truth.
