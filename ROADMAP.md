# ClaimGuard Roadmap

This file is the durable product roadmap and phase definition source of truth. It describes what ClaimGuard is becoming, what each phase means, and what is explicitly deferred.

Use `NEXT_STEPS.md` for the immediate working queue. Do not turn `NEXT_STEPS.md` into the long-term roadmap.

## Product Vision

ClaimGuard is a fraud-risk screening and evidence intelligence platform for support and claims teams.

The product should help reviewers understand whether submitted evidence is reliable, internally consistent, and ready for manual decision-making. It should support safe review decisions without accusing customers, confirming wrongdoing, or replacing human judgment.

Receipt analysis is one evidence module. Future ClaimGuard can include photo evidence analysis, case review workflow, customer and ticket context, integrations, audit history, scoring signals, and enterprise fraud intelligence.

## Durable Principles

- Evidence signals support review; they do not prove intent or wrongdoing.
- ClaimGuard should explain why something needs manual review.
- Real customer evidence requires privacy, retention, and audit discipline.
- Future integrations should be provider-neutral until a provider is selected.
- Each phase should produce a usable capability without forcing later infrastructure early.
- Safety language and external-verification semantics apply across every phase.

## Phase 1: Receipt Intelligence

Status: Closed, pushed, deployed, and production-smoked.

Latest production polish checkpoint: `19ef25e` (`polish post-phase1 evidence workspace`).

Meaning:

- Receipt upload and local analysis.
- OCR/PDF handling.
- Receipt parsing.
- Source classification.
- Vendor/source-specific receipt intelligence.
- Metadata and image-quality heuristics.
- Evidence Reliability Score and score breakdown.
- `/test-evidence` manual QA harness.
- Privacy-safe tuning observations.
- Customer-safe report wording.

Explicitly deferred from Phase 1:

- Product damage photo analysis.
- Case review workflow.
- Real ticket/email integrations.
- Auth, billing, database, and SaaS platform work.
- Enterprise dashboards and cross-case intelligence.
- Real external verification claims.

## Phase 2: Photo Evidence

Status: Closed as non-live unsupported/product-photo readiness after the Phase 2.9.1 review-only closeout and final closure alignment pushed at `3779ab0` (`docs: close phase 2 non-live readiness`). Product-photo and unsupported-evidence runtime remain non-live; unsupported evidence is not ready for live opt-in implementation; and any future runtime/UI/upload/report/provider/storage/integration/case-queue/OCR/metadata work requires a separate explicit approval.

Meaning:

- Product-damage photo evidence model.
- Photo quality and visibility signals.
- Planning for image consistency uncertainty signals.
- Provider-neutral image analysis contracts.
- Manual-review language for photo findings.

Current implementation boundary:

- Shared evidence and product-photo scaffold/type-boundary work is allowed.
- Shared evidence model types and product-photo scaffold/defaults exist.
- Phase 2.1 defined the first product-photo heuristic signal categories and future implementation order in planning docs.
- Phase 2.2 added non-live product-photo helper boundaries, guarded routing decisions, shared result shape readiness, a product-photo report view-model, an isolated `ProductPhotoReviewPanel`, a production-disabled synthetic render host, semantic/privacy guards, and desktop/mobile browser QA.
- Phase 2.3 added and hardened the first unwired local product-photo heuristic analyzer plus probe refinements for low-quality buckets, context gaps, privacy-safe metadata and label summaries, manual-review-only wording, raw-result override sanitization, structured readiness derivation, executable product-photo probes, and non-live isolation.
- Phase 2.4 defines guarded non-live adapter readiness. Phase 2.4.1 now adds a dev/probe-only adapter readiness boundary that consumes sanitized product-photo result/view-model data, derives readiness fields, quarantines legacy `damage-photo`, and strengthens executable probes/semantic guards while staying outside live runtime paths. Phase 2.4.3 adds a docs-only plan for a future dev-only synthetic adapter review harness in `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md`. Phase 2.4.4 closes adapter readiness planning and records runtime blockers in `PRODUCT_PHOTO_RUNTIME_BLOCKERS_PLAN.md`. Phase 2.4.5 adds `LEGACY_DAMAGE_PHOTO_QUARANTINE_PLAN.md`, which chooses filename/evidence-type classification as the safest first future hardening boundary. Phase 2.4.6 moves the live classifier into an isolated classifier boundary and collapses legacy damage/product/photo/crack image filename cues to the existing receipt/default path instead of returning `damage-photo`; this is classifier-label hardening only, not a pre-OCR/pre-metadata product-photo privacy boundary. Phase 2.4.8 confirms the classifier quarantine is complete enough for its intended no-live scope, but product-photo-like filenames still enter the receipt/default OCR/metadata path. Phase 2.4.9 adds `PRODUCT_PHOTO_UNSUPPORTED_BOUNDARY_PLAN.md` and recommends a future no-live `pre-analysis-evidence-gate` contract/probe before dev-only harness or runtime-facing product-photo work. Phase 2.4.10 implements that decision-only, unwired `pre-analysis-evidence-gate` contract/probe (`src/lib/analysis/pre-analysis-evidence-gate.ts` / `.probe.ts`, registered with `check:product-photo-probes`). Phase 2.4.11-2.4.13 align source-of-truth docs, Phase 2.5.0 adds the dev-only adapter/gate review harness scope plan in `PHASE_2_5_DEV_HARNESS_SCOPE_PLAN.md`, Phase 2.5.1 implements the gate-first no-live dev-only review harness at `/dev/pre-analysis-evidence-gate`, and Phase 2.5.2 implements the no-live dev-only adapter-readiness review harness at `/dev/product-photo-adapter-readiness` (both production-disabled, unlinked, literal synthetic cases only). Phase 2.5 is closed. Phase 2.6.0 adds the docs-only runtime-facing scope plan in `PHASE_2_6_RUNTIME_SCOPE_PLAN.md`; it identifies a guard-only `pre-analysis-evidence-gate` live wiring (block/quarantine product-photo-like and unsupported files before OCR/metadata, no product-photo analysis) as the safest eventual first runtime slice. Phase 2.6.1 adds `PHASE_2_6_GATE_WIRING_DESIGN_SPIKE.md`, recommending a future default-off thin wrapper/probe implementation that keeps `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt behavior, upload/UI, live report adapter mapping, and `ProductPhotoReviewPanel` unchanged. Phase 2.6.2 adds that default-off wrapper/probe boundary in `src/lib/analysis/pre-analysis-evidence-gate-runtime.ts` / `.probe.ts`; Phase 2.6.4 tightens unsupported evidence wording guards; and Phase 2.6 is closed after pushed commit `6f3170a`. Phase 2.7.0 adds a docs-only live-opt-in readiness plan in `PHASE_2_7_LIVE_OPT_IN_READINESS_PLAN.md` for the default-off wrapper and unsupported-evidence reviewer state. Phase 2.7.1 adds the docs-only unsupported-evidence reviewer state contract in `PHASE_2_7_1_UNSUPPORTED_EVIDENCE_REVIEWER_STATE_CONTRACT.md`, defining the future stop-state name, labels, display fields, neutral/manual-review-only wording, confidence/uncertainty rules, receipt-preservation gates, QA/browser requirements, protected surfaces, and stop conditions. Phase 2.7.2 adds the docs-only unsupported-evidence display/mapping probe plan in `PHASE_2_7_2_UNSUPPORTED_EVIDENCE_DISPLAY_MAPPING_PROBE_PLAN.md`, recommending a future pure non-live mapper/probe before any rendered UI. Phase 2.7.3 is closed and pushed at `0d90260` with that isolated non-live mapper/probe in `src/lib/analysis/unsupported-evidence-review-state.ts` / `.probe.ts`, registered with `check:product-photo-probes` and covered by report semantics, without rendering UI or wiring live runtime. Phase 2.7.4 adds the docs-only live-opt-in readiness checkpoint in `PHASE_2_7_4_LIVE_OPT_IN_READINESS_CHECKPOINT.md`; it chooses workflow/caller boundary design as the next safest readiness step and rejects a dev-only harness, report-adapter shape probe, and feature-flag/default-off plan as premature next moves. Phase 2.7.5 adds the docs-only workflow/caller boundary opt-in design in `PHASE_2_7_5_WORKFLOW_CALLER_BOUNDARY_OPT_IN_DESIGN.md`; it identifies the future owner as the `ClaimReviewWorkflow` run-analysis boundary or a small workflow-local helper, with unsupported mapper use limited to derived-state mapping outside live receipt analysis. Product-photo runtime remains non-live, the wrapper remains default-off and unwired from live callers, `analyzeEvidenceFile` remains receipt-only, `LocalAnalysisResult` remains receipt-shaped, unsupported-evidence output remains separate from receipt reports and ProductPhotoReviewPanel, and live runtime/upload/UI/report/scoring/parser/fixture/provider/storage/integration/case-queue/OCR/metadata/deployment work remains blocked pending explicit approval.
- Phase 2.7.7 is closed and pushed at `32d013b` (`feat: add workflow boundary probe for unsupported evidence`). It added a probe-only workflow/caller boundary helper for receipt delegation versus unsupported-evidence stopped state; the helper remains default-off, unwired from `ClaimReviewWorkflow` and live UI/report/analyzer paths, outside `analyzeEvidenceFile` and `mapLocalAnalysisToReport`, outside `LocalAnalysisResult`, outside `ProductPhotoReviewPanel`, and non-rendered. Phase 2.7.8 is docs-only status/source-of-truth alignment after that pushed commit. The next safest acceleration step is Phase 2.8.0 docs-only planning toward dev-only harness/UI readiness for the unsupported-evidence workflow-boundary bridge; Phase 2.9 must not start until Phase 2.8 defines or proves the dev-only/user-visible bridge.
- Phase 2.8.0 adds the docs-only unsupported-evidence dev bridge plan in `PHASE_2_8_0_UNSUPPORTED_EVIDENCE_DEV_BRIDGE_PLAN.md`. It chooses a separate unlinked, production-disabled dev-only story/probe route as the safest future browser-checkable bridge for unsupported-evidence review visibility. It rejects `/test-evidence` extension, live `ClaimReviewWorkflow` insertion, ProductPhotoReviewPanel routing, and live UI as the first bridge. Phase 2.9 remains blocked until Phase 2.8 defines or proves the dev-only/user-visible bridge.
- Phase 2.8.1 adds the docs-only implementation plan in `PHASE_2_8_1_UNSUPPORTED_EVIDENCE_DEV_BRIDGE_IMPLEMENTATION_PLAN.md`. It prepares Phase 2.8.2 as a route-local, unlinked, production-disabled, synthetic-only developer bridge at `/dev/unsupported-evidence-review`, using literal unsupported-evidence review states with at most type-only mapper-contract imports and no workflow-boundary helper import. It defines visible stopped-state fields, forbidden score/proof/product-photo/accusation/decision fields, semantic/privacy guards, browser QA, eligible/protected files, implementation blockers, and Phase 2.9 entry gates without adding runtime, UI, route, upload, report mapping, parser, scoring, fixtures, providers/storage/integrations/case queues, OCR/metadata, or deployment work.
- Phase 2.8.2 is closed after the successful Phase 2.8.3 review-only closeout retry for pushed commit `3dd8b74` (`fix: remove forbidden dev bridge wording`). The original dev-only unsupported-evidence review bridge was pushed at `7ee4b65` and implements `/dev/unsupported-evidence-review` using `src/app/dev/unsupported-evidence-review/page.tsx` and route-local literal `UnsupportedEvidenceReviewDisplay`-shaped cases in `render-cases.ts`; the blocker patch at `3dd8b74` removes unsafe score-boundary wording, adds safe receipt-verification-outcome wording, and strengthens rendered-equivalent visible wording checks. The route is unlinked, production-disabled, synthetic-only, manual-review oriented, guarded by `scripts/check-report-semantics.mjs`, and returns 404 under production `next start`. It does not call the mapper, import the workflow boundary helper, wire `ClaimReviewWorkflow`, route `ProductPhotoReviewPanel`, change upload/report/parser/scoring/fixture behavior, alter `analyzeEvidenceFile` or `LocalAnalysisResult`, add providers/storage/integrations/case queues, run OCR/metadata, deploy, or start Phase 2.9 implementation. Product-photo/unsupported-evidence runtime remains non-live, unsupported-evidence live UI does not exist, and receipt behavior remains unchanged.
- Phase 2.9.0 adds the docs-only unsupported-evidence live-opt-in readiness plan in `PHASE_2_9_0_UNSUPPORTED_EVIDENCE_LIVE_OPT_IN_READINESS_PLAN.md`. It decides unsupported evidence is not ready for live opt-in implementation because the workflow remains unwired, live unsupported-evidence UI does not exist, `LocalAnalysisResult` remains receipt-shaped, `analyzeEvidenceFile` remains receipt-only, ProductPhotoReviewPanel remains unrouted, no real product-photo/OCR/metadata/provider/storage/integration/case-queue work exists, and Phase 3 case workflow/audit/persistence foundations did not exist yet. The narrowest later path is a default-off workflow/caller boundary slice after explicit approval. Phase 2.9.1 review-only closeout passed after `095fd18`, so Phase 2 is closed as a non-live readiness phase. No deployment occurred; receipt behavior remains unchanged; Phase 3 later started as the static/local shell work described below.
- No product-photo analyzer behavior is live yet.
- No runtime analyzer, upload, UI, report, scoring, parser, fixture, storage, integration, or external provider behavior is live for Phase 2 yet.
- `product-photo` is canonical.
- `damage-photo` remains receipt-era/mock compatibility, not canonical product-photo runtime. The adapter readiness boundary quarantines it, and Phase 2.4.6 now prevents the live filename classifier from returning `damage-photo` for product-photo-like image filename cues.

Deferred until Robert explicitly opens a later Phase 2 runtime slice:

- Wiring product damage photo analysis into the live app.
- Connecting AI vision providers.
- Changing the current app to add photo-analysis behavior.
- Storing or sending real customer photos to services.

## Phase 3: Case Review Workflow

Status: Closed as a static/local Case Review Command Center shell after the Phase 3 closeout readiness checkpoint passed. Latest Phase 3 shell commit: `11aba49` (`feat: polish phase 3.10 case command center shell`). Phase 3.0 planning-only case workflow readiness is documented in `PHASE_3_0_CASE_WORKFLOW_READINESS_PLAN.md`. Phase 3.1 design system/case workflow concept planning is documented in `PHASE_3_1_CASE_WORKFLOW_DESIGN_CONCEPT.md`. Phase 3.2 is pushed and reviewed at `a169de4` (`feat: add phase 3.2 local case command center shell`) as a non-persistent Case Review Command Center shell at `/case-command-center` with mock/local case data only. Phase 3.3 polishes the local shell visual hierarchy and selected-evidence structure while preserving the current warm off-white ClaimGuard evidence workspace direction. Phase 3.4 polishes the local shell timeline/audit trail structure with synthetic mock events only. Phase 3.5 polishes the local shell notes/manual decision workflow structure with static synthetic review-planning data only. Phase 3.6 polishes the local shell customer-safe wording module with static synthetic response-prep variants only. Phase 3.7 polishes the evidence sidebar and selected-evidence detail depth with synthetic/local evidence bench structure only. Phase 3.8 polishes the case header and command/status orientation layer with synthetic/local case context only. Phase 3.9 polishes the review summary intelligence layout with synthetic/local case synthesis only. Phase 3.10 polishes the final responsive/static shell layout across mobile, mid-desktop, and wide desktop only. `/case-command-center` remains static/local, synthetic-only, unlinked, non-persistent, and not deployed; `/` remains the Phase 1 receipt workflow and does not link to `/case-command-center`; receipt behavior is unchanged; `ClaimReviewWorkflow` remains unchanged; `ProductPhotoReviewPanel` remains unrouted; and no persistence, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, live actions, saved state, or deployment was added.

Meaning:

- Case queue and case detail concepts.
- Review status lifecycle.
- Reviewer notes and actions.
- Audit history.
- Evidence grouping across receipts, photos, and context.
- Safe support workflows that keep humans in the decision loop.

Closure boundary:

- Phase 3 should build case-review workflow foundations before live unsupported-evidence opt-in, product-photo runtime, integrations, storage, auth, or dashboards.
- The first build target is now a non-persistent local case review shell at `/case-command-center`. It is unlinked, browser-local, synthetic-only, and does not add persistence or integrations.
- Phase 3 should inherit Phase 1 receipt behavior unchanged: `analyzeEvidenceFile` remains the receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, and receipt scores remain local evidence-quality/internal-consistency signals.
- Phase 3 should inherit Phase 2 unsupported/product-photo readiness as non-live stopped/manual-review state planning only. Unsupported evidence remains outside receipt reports and `ProductPhotoReviewPanel`; product-photo runtime remains non-live.
- The planned case concept includes case id, status, customer claim summary, evidence items, review notes, manual decision, recommended support action, customer-safe wording, and timeline/audit trail.
- Planned evidence categories include receipt evidence, unsupported/product-photo evidence, order screenshots, shipping confirmations, and customer message/context.
- Planned UX architecture includes a case review shell, evidence list/sidebar, selected evidence panel, review summary panel, notes/manual decision panel, customer-safe wording panel, and timeline/history area.
- Planned visual direction follows the existing ClaimGuard evidence workspace: warm off-white/parchment surfaces, soft tan borders, muted navy/slate text, bronze/gold accents, selected-evidence-first layout, compact operational badges, manual-review indicators, customer-safe wording separated from internal notes, and timeline/audit rows. Dark charcoal panels may be used selectively for review contrast, but the default direction should not become a dark forensic dashboard.
- Phase 3.2 adds the local shell using `src/components/CaseReviewCommandCenter.tsx` and `src/lib/case-command-center/mock-case.ts`. Post-push QA passed: `/case-command-center` renders, `/` remains the existing Phase 1 receipt workflow, `/` does not link to `/case-command-center`, and browser console checks reported no warnings/errors. No deployment occurred. It keeps receipt preservation protected and adds no unsupported-evidence runtime wiring, persistence, upload behavior, integrations, product-photo runtime, OCR/metadata expansion, storage/providers, auth/org/billing work, real evidence, deployment, or live app navigation.
- Phase 3.3 strengthens the `/case-command-center` selected-evidence bench, evidence sidebar, review summary rail, notes/manual decision placement, customer-safe wording placement, and timeline hierarchy. It remains static/local, synthetic-only, unlinked, and does not add persistence or deeper workflow behavior.
- Phase 3.4 expands the `/case-command-center` timeline/audit trail from placeholder cards into a support-rep history structure with synthetic categories, static mock timing, status/severity labels, case-status-after labels, reviewer-impact notes, selected-evidence linkage, and an explicit audit-boundary note. It remains static/local, synthetic-only, unlinked, and does not add persistence, deeper live workflow behavior, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, or `ProductPhotoReviewPanel` routing.
- Phase 3.5 turns the `/case-command-center` notes/manual decision placeholder into a static mock local review workspace with structured decision states, selected-evidence rationale, internal note structure, policy/safety reminders, customer-safe wording handoff guidance, timeline linkage, and not-saved/not-sent boundary copy. It remains static/local, synthetic-only, unlinked, and does not add editable saved notes, form submission, persistence, deeper live workflow behavior, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, or `ProductPhotoReviewPanel` routing.
- Phase 3.6 turns the `/case-command-center` customer-safe wording panel into a static mock response-prep module with suggested variants, wording intent/tone labels, selected-evidence rationale, support-safe guardrails, a rep review checklist, timeline linkage, and not-sent/not-saved boundary copy. It remains static/local, synthetic-only, unlinked, and does not add editable saved text, send/copy-to-ticket behavior, form submission, persistence, deeper live workflow behavior, upload behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, or `ProductPhotoReviewPanel` routing.
- Phase 3.7 improves the `/case-command-center` evidence bench and selected-evidence detail area with grouped synthetic evidence rows, clearer type/status/review-state indicators, structured selected-evidence metadata, synthetic review context, observed signals, limitations, investigation focus, cross-reference links to timeline/manual review/customer-safe wording, and next-step cues. It remains static/local, synthetic-only, unlinked, and does not add upload behavior, file inputs, editable saved evidence state, form submission, persistence, deeper live workflow behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, or `ProductPhotoReviewPanel` routing.
- Phase 3.8 improves the `/case-command-center` top case-orientation layer with a stronger synthetic case title, mock status, priority, static queue/context label, review posture strip, safe next posture, summary chips, local-only/privacy badges, and a non-clickable static command/status bar. It remains static/local, synthetic-only, unlinked, and does not add real actions, upload behavior, file inputs, editable saved state, form submission, persistence, deeper live workflow behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, or `ProductPhotoReviewPanel` routing.
- Phase 3.9 improves the `/case-command-center` review summary into a static case-level intelligence layout with reviewed-evidence groups, missing-information checklist, manual-review drivers, review limitations, safe reviewer posture, selected-evidence synthesis linkage, timeline linkage, manual-decision linkage, customer-safe wording linkage, and an internal-only not-a-scoring-result/not-an-automated-decision boundary. It remains static/local, synthetic-only, unlinked, and does not add real scoring, automated decisions, real actions, upload behavior, file inputs, editable saved state, form submission, persistence, deeper live workflow behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, or `ProductPhotoReviewPanel` routing.
- Phase 3.10 improves the `/case-command-center` final shell responsiveness and visual cohesion with tighter mobile spacing, safer wrapping, better mid-desktop grid behavior, sticky wide-screen scan rails, and reduced right-rail density while preserving the warm off-white ClaimGuard evidence workspace direction. It remains static/local, synthetic-only, unlinked, and does not add real scoring, automated decisions, real actions, upload behavior, file inputs, editable saved state, form submission, persistence, deeper live workflow behavior, integrations, OCR/metadata, storage/providers, auth/billing, real evidence, receipt behavior changes, `ClaimReviewWorkflow` wiring, or `ProductPhotoReviewPanel` routing.

Deferred after Phase 3 closure until explicitly reopened or approved in a future phase:

- Persistent case database.
- Authenticated reviewer accounts.
- Production case queues.
- Ticket-system writebacks.
- Live unsupported-evidence opt-in.
- Product-photo runtime.

## Phase 4: Stronger OCR and AI Integrations

Status: Phase 4.0 planning-only real AI/OCR/photo intelligence readiness is documented in `PHASE_4_0_AI_OCR_PHOTO_INTELLIGENCE_READINESS.md`. Phase 4.1 docs-only OCR/provider architecture planning is documented in `PHASE_4_1_OCR_PROVIDER_ARCHITECTURE_PLAN.md`. Phase 4.2 adds a non-live synthetic OCR fixture harness in `src/lib/analysis/ocr-fixture-harness.ts` with probe coverage in `src/lib/analysis/ocr-fixture-harness.probe.ts`. Phase 4.3 adds a non-live provider-neutral OCR extraction contract in `src/lib/analysis/ocr-extraction-contract.ts` with probe coverage in `src/lib/analysis/ocr-extraction-contract.probe.ts`. Phase 4.4 adds planning-only server-side OCR route and data-flow design in `PHASE_4_4_SERVER_SIDE_OCR_ROUTE_DATA_FLOW_PLAN.md`. Phase 4.5 adds planning-only server-side OCR route skeleton implementation planning in `PHASE_4_5_SERVER_SIDE_OCR_ROUTE_SKELETON_PLAN.md`. Phase 4.6 adds a synthetic-only/mock-only JSON route skeleton at `POST /api/analysis/ocr` with route probe coverage. Phase 4.7 adds an OCR route safety/readiness checkpoint in `PHASE_4_7_OCR_ROUTE_SAFETY_READINESS_CHECKPOINT.md` and tightens the route request shape to exactly `fixtureKey`. Phase 4.8 adds route hardening and developer-only fixture testing documentation in `PHASE_4_8_OCR_ROUTE_HARDENING_FIXTURE_TESTING.md` plus a durable route-source warning. Phase 4.9 adds provider selection planning-only documentation in `PHASE_4_9_OCR_PROVIDER_SELECTION_PLAN.md`. Phase 4.10 adds provider abstraction planning-only documentation in `PHASE_4_10_PROVIDER_ABSTRACTION_PLAN.md`. Phase 4.11 adds mock provider adapter planning-only documentation in `PHASE_4_11_MOCK_PROVIDER_ADAPTER_PLAN.md`. Phase 4.12 adds an isolated synthetic/mock provider adapter skeleton in `src/lib/analysis/providers/mock-provider-adapter.ts` with probe coverage in `src/lib/analysis/providers/mock-provider-adapter.probe.ts`. Phase 4.13 adds a review-only mock provider adapter safety/readiness checkpoint in `PHASE_4_13_MOCK_PROVIDER_ADAPTER_SAFETY_READINESS_CHECKPOINT.md`. Phase 4.14 adds mock adapter developer documentation and usage examples in `PHASE_4_14_MOCK_PROVIDER_ADAPTER_DEVELOPER_USAGE.md`. Phase 4.15 adds mock adapter route integration planning-only documentation in `PHASE_4_15_MOCK_ADAPTER_ROUTE_INTEGRATION_PLAN.md`. Phase 4.16 adds a separate synthetic-only mock provider route skeleton at `POST /api/analysis/mock-provider` with route probe and semantic coverage while preserving the existing exact `fixtureKey` OCR route. Phase 4.17 adds a review-only mock provider route safety/readiness checkpoint in `PHASE_4_17_MOCK_PROVIDER_ROUTE_SAFETY_READINESS_CHECKPOINT.md`. Phase 4.18 adds mock provider route developer documentation and usage examples in `PHASE_4_18_MOCK_PROVIDER_ROUTE_DEVELOPER_USAGE.md`. Phase 4.19 adds OpenAI Vision sandbox planning-only documentation in `PHASE_4_19_OPENAI_VISION_SANDBOX_PLAN.md`. Phase 4.20 adds OpenAI Vision sandbox prompt/output contract planning-only documentation in `PHASE_4_20_OPENAI_VISION_PROMPT_OUTPUT_CONTRACT_PLAN.md`. Phase 4.21 adds OpenAI Vision sandbox schema planning-only documentation in `PHASE_4_21_OPENAI_VISION_SANDBOX_SCHEMA_PLAN.md`. Phase 4.22 adds OpenAI Vision sandbox fixture-policy planning-only documentation in `PHASE_4_22_OPENAI_VISION_SANDBOX_FIXTURE_POLICY_PLAN.md`. Phase 4.23 adds OpenAI Vision sandbox validation/probe planning-only documentation in `PHASE_4_23_OPENAI_VISION_SANDBOX_VALIDATION_PROBE_PLAN.md`. Phase 4.24 adds synthetic fixture metadata schema planning-only documentation in `PHASE_4_24_SYNTHETIC_FIXTURE_METADATA_SCHEMA_PLAN.md`. Real AI/OCR/photo analysis has not started, and no real provider-backed analysis should be implemented until a later explicitly approved implementation slice.

Meaning:

- Provider-neutral OCR/AI interfaces.
- External OCR or AI analysis behind explicit approval and privacy controls.
- Confidence, cost, latency, and fallback planning.
- Safety filters for generated model output.
- AI/OCR/photo outputs as review signals, not final verdicts.
- Manual-review and customer-safe wording discipline for model-assisted workflows.

Phase 4.0 planning decision:

- Stronger OCR should improve receipt text extraction, field parsing, merchant/order/date/total confidence, and Amazon receipt structure validation without changing receipt behavior until a named implementation slice is approved.
- Real AI or vision output should be structured as observable evidence signals with confidence, uncertainty, limitations, and no-decision markers.
- Product-photo intelligence should remain careful signal planning for damage visibility, context completeness, possible reuse/duplicate signals, compression/editing/artifact uncertainty, metadata context, and AI-generated-image uncertainty without "fake photo" or fraud-confirmation wording.
- Real evidence handling requires a privacy/data-flow, retention, deletion, provider logging, metadata, and storage plan before implementation.
- The current off-white/parchment evidence workspace direction remains the product direction; Phase 4 is intelligence readiness, not another Command Center redesign.

Phase 4.1 OCR/provider architecture decision:

- Future stronger OCR should be introduced behind a provider-neutral boundary that can normalize browser-local, server-local, mocked, or future provider output without locking ClaimGuard to one SDK or provider.
- The future OCR contract should separate input policy, text blocks, structured receipt fields, field confidence, provider metadata summaries, failure states, unsupported-file states, and raw OCR availability policy.
- Amazon receipt/order-page validation should remain structure and consistency readiness only: order/date/total cues, section presence, payment/shipping redaction considerations, marketplace limitations, and safe uncertainty wording. It must not produce automated fraud conclusions.
- Browser-local OCR remains the privacy-preserving default when sufficient. Server-side OCR may be needed later for multi-page PDFs, layout/table reconstruction, preprocessing, reliability, timeout/cost controls, or provider-backed extraction, but API keys must live server-side and no storage should exist by default.
- OCR results should become evidence review signals with confidence and limitations. Do not create a fraud score, migrate `LocalAnalysisResult`, change receipt report semantics, or imply external verification.
- The next safe task is Phase 4.2 synthetic OCR fixture harness work before any real provider, route, SDK, credential, env var, upload, storage, or live scoring work.

Phase 4.2 synthetic OCR fixture harness decision:

- The synthetic OCR fixture harness is non-live, fixture-only, provider-free, route-free, UI-free, upload-free, storage-free, and real-evidence-free.
- The harness defines synthetic OCR-like text blocks, expected structured receipt fields, field confidence, extraction confidence, manual-review drivers, limitations, safe summaries, unsupported states, provider-unavailable synthetic failure states, empty OCR output, and receipt-regression safety markers.
- Fixture coverage includes clean receipt OCR, Amazon-like order OCR, missing total, missing merchant, conflicting date/total cues, noisy OCR text, receipt-like incomplete text, unsupported non-receipt text, ambiguous marketplace/order-screen text, synthetic provider timeout, and empty OCR output.
- The probe proves the harness remains isolated from `analyzeEvidenceFile`, live report mapping, `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, upload, providers, storage, integrations, case queues, and real evidence.
- Phase 4.2 does not change receipt behavior, does not migrate `LocalAnalysisResult`, does not add OCR providers/SDKs/env vars/routes/components, and does not process real evidence.
- Phase 4.3 provider-neutral OCR extraction contract decision:

- The provider-neutral OCR extraction contract is non-live, synthetic-only, provider-free, route-free, UI-free, upload-free, storage-free, and real-evidence-free.
- The contract normalizes Phase 4.2 synthetic fixture outputs into extracted text blocks, structured receipt fields, field-level confidence, extraction confidence, manual-review drivers, limitations, unsupported outcome details, synthetic provider-failure details, safe summary wording, review signal levels, and manual-review requirements.
- OCR confidence remains a review signal, not proof. Missing, conflicting, low-confidence, unsupported, ambiguous, empty, and provider-unavailable states drive manual review or operational limitation wording rather than any claim disposition.
- Amazon-like receipt/order-screen structure remains readiness and manual-comparison context only. It does not become a source verdict or external verification claim.
- The probe proves the contract remains isolated from `analyzeEvidenceFile`, live report mapping, `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, upload, providers, storage, integrations, case queues, and real evidence.
- Phase 4.3 does not change receipt behavior, does not migrate `LocalAnalysisResult`, does not add OCR providers/SDKs/env vars/routes/components, and does not process real evidence.
- Phase 4.4 server-side OCR route and data-flow planning decision:

- The future route should be planned as `POST /api/analysis/ocr`, but no route is implemented in Phase 4.4.
- The route should accept one temporary eligible evidence payload only after a separate approved milestone and should reject unsupported MIME types, over-limit files, excessive pages/dimensions, empty payloads, multiple files, retention requests, and unauthenticated or unauthorized callers before any provider boundary.
- The first future route milestone should keep files in memory only, retain no evidence files, retain no raw OCR, retain no provider payloads, log no customer identifiers, create no object URLs, and add no long-term storage.
- Provider payloads should be minimized to temporary evidence bytes plus requested OCR outputs; internal notes, customer messages, ticket/case identifiers, policy decisions, raw metadata, and provider raw responses must not be sent or logged by default.
- Provider timeout, unavailable, malformed, partial, empty, unsupported, and policy-blocked states should normalize to safe operational limitations or manual-review drivers, never customer-risk conclusions.
- The Phase 4.3 OCR extraction contract remains the provider-neutral normalization boundary. `ocr-fixture-harness.ts` remains synthetic test input only.
- Phase 4.4 does not change receipt behavior, does not migrate `LocalAnalysisResult`, does not add OCR providers/SDKs/env vars/routes/components/uploads/storage/persistence, and does not process real evidence.
- The next safe task is Phase 4.5 server-side OCR route skeleton implementation planning only, or a separately approved synthetic-only/mock-provider route skeleton; no live route, provider call, SDK, credential, upload, storage, persistence, real evidence, or live workflow wiring should start without explicit approval.

- Phase 4.5 server-side OCR route skeleton planning decision:

- Phase 4.5 is planning-only and does not create `POST /api/analysis/ocr`.
- The future Phase 4.6 skeleton route should be `POST /api/analysis/ocr`, but it must remain JSON-only, synthetic-only, mock-only, provider-free, SDK-free, env-free, upload-free, storage-free, persistence-free, UI-free, live-analyzer-free, and receipt-behavior-free.
- Future accepted input should be limited to allowlisted synthetic fixture keys or approved synthetic OCR fixture-like JSON payloads. Phase 4.6 must reject real files, binary uploads, multipart form data, object URLs, storage handles, provider payloads, and customer identifiers.
- The future output should use the Phase 4.2 OCR fixture harness and Phase 4.3 extraction contract to return review-support-only extracted text block summaries, structured fields, field confidence, extraction confidence, manual-review drivers, limitations, safe summaries, unsupported/provider-failure reasons, review signal level, and manual-review requirements.
- The future skeleton must not return a fraud score, a fabricated/altered/forged evidence conclusion, a final claim decision, automatic deny/refund wording, live receipt report output, `LocalAnalysisResult`, customer-facing accusation language, or external verification claims.
- Phase 4.6 must stay isolated from `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, `analyzeEvidenceFile`, `LocalAnalysisResult`, `report-adapter`, upload flow, receipt parser/scoring/report behavior, case command center route, and production UI paths.
- Required Phase 4.6 probes should cover route import/isolation, accepted synthetic fixtures, rejected inputs, timeout/failure fixtures, unsafe wording, provider/env/package absence, protected runtime imports, upload/storage/object URL absence, no `LocalAnalysisResult` migration, and no `analyzeEvidenceFile` change.
- The next safe task is an explicitly requested Phase 4.6 synthetic-only/mock-provider route skeleton implementation. Live OCR/provider work remains blocked.
- Phase 4.6 synthetic OCR route skeleton decision:

- `POST /api/analysis/ocr` exists as a JSON-only, synthetic fixture-key route skeleton. It is mock-only and uses only `src/lib/analysis/ocr-fixture-harness.ts` plus `src/lib/analysis/ocr-extraction-contract.ts`.
- The route accepts allowlisted synthetic fixture keys for clean receipt, Amazon-like order, missing total, missing merchant, conflicting date/total, noisy OCR, incomplete receipt-like text, unsupported non-receipt text, ambiguous marketplace screen, synthetic provider timeout, and empty OCR output.
- The route returns contract-derived OCR extraction signals, field confidence, extraction confidence, manual-review drivers, limitations, safe summaries, unsupported/provider-failure reasons, review signal level, no-retention markers, and manual-review requirements. These are review-support signals only.
- The route returns safe operational validation failures for missing/unknown fixture keys, malformed JSON, unsupported content types, multipart form data, real-file-like payloads, binary-like payloads, object/data/image/file URLs, storage handles, provider payloads, and private identifier fields.
- `src/app/api/analysis/ocr/route.probe.ts` covers accepted synthetic cases, validation failures, unsupported/timeout/empty states, unsafe wording absence, provider/env/package absence, protected runtime import isolation, upload/storage/object URL absence, no `LocalAnalysisResult` migration, no `analyzeEvidenceFile` touch, and no SDK/package additions.
- Phase 4.6 does not add providers, SDKs, env vars, uploads, storage, persistence, UI, live analyzer wiring, live receipt output, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `LocalAnalysisResult` changes, `analyzeEvidenceFile` changes, receipt parser/scoring/report changes, real evidence handling, or deployment.
- Phase 4.7 OCR route safety/readiness checkpoint decision:

- Phase 4.7 keeps `POST /api/analysis/ocr` synthetic-only and confirms the route is acceptable only as a JSON fixture-key skeleton.
- The route now rejects any JSON request field other than `fixtureKey`; route/probe semantic coverage is active in `scripts/check-report-semantics.mjs`.
- The checkpoint confirms isolation from `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, `analyzeEvidenceFile`, `LocalAnalysisResult`, report mapping, upload, parser/scoring/report behavior, providers, storage, env vars, packages, real evidence, and deployment.
- Phase 4.8 OCR route hardening and developer-only fixture testing decision:

- Phase 4.8 documents `POST /api/analysis/ocr` as a developer-only synthetic fixture boundary, not live OCR.
- It documents allowed exact `fixtureKey` requests, disallowed request classes, safe response behavior, safety/privacy locks, developer smoke instructions, and route-hardening coverage.
- The route now includes a source-level developer warning that it must not be wired to uploads, UI, providers, storage, or real evidence without a separately approved milestone; the route probe and semantic checker verify that warning.
- Phase 4.9 provider selection planning decision:

- Phase 4.9 compares OpenAI Vision-style multimodal analysis, Google Cloud Vision / Document AI, AWS Textract, Tesseract/local OCR, and a hybrid pipeline for ClaimGuard's future OCR and photo-intelligence needs.
- The recommended staged strategy is OCR-specialized extraction first for receipt fields and order screenshots, OpenAI Vision-style reasoning later for screenshots, layout context, product-photo context, and altered/AI-generated-image uncertainty signals, local OCR as development/fallback baseline, and ClaimGuard's internal OCR extraction contract as source of truth.
- All provider outputs remain evidence sources and review signals, not decision makers. OCR confidence, vision confidence, field mismatch, and altered/AI-generated-image confidence are manual-review or uncertainty signals only.
- Phase 4.10 provider abstraction planning decision:

- Phase 4.10 defines the future provider-neutral adapter boundary at the planning level only. It covers provider categories, adapter concepts, OCR result shape, vision result shape, failure normalization, privacy/redaction boundaries, cost/timeout boundaries, and mock-before-live rules.
- The existing `POST /api/analysis/ocr` route remains synthetic fixture-key only and must not be wired to live providers. The existing `ocr-extraction-contract` remains the OCR normalization boundary; future provider adapters should feed the contract, not replace it.
- Phase 4.11 mock provider adapter planning decision:

- Phase 4.11 defines the future mock-before-live adapter path at the planning level only. It covers mock OCR, mock multimodal vision reasoning, provider failure, timeout, unsupported, cost/usage, and redaction-status categories; future module boundary under `src/lib/analysis/providers/`; synthetic-only input shape; mock OCR output shape; mock vision output shape; failure/timeout simulation; privacy/retention flags; route/contract relationship; Phase 4.12 probe requirements; and safety language rules.
- The existing `POST /api/analysis/ocr` route remains exact fixture-key only and should not call a mock adapter unless separately approved in Phase 4.12. Future mock OCR adapter output should feed `ocr-extraction-contract`; future mock vision output should remain separate from receipt scoring until a later approved signal-combination phase.
- Phase 4.12 mock provider adapter skeleton decision:

- Phase 4.12 implements the mock-before-live adapter skeleton under `src/lib/analysis/providers/` without adding providers, SDKs, credentials, env vars, uploads, storage, persistence, UI wiring, live analyzer wiring, real evidence handling, or route integration.
- The mock OCR provider uses synthetic fixture cases and the existing `ocr-extraction-contract` to return review-support-only extracted text candidates, structured field candidates, simulated confidence, usage metadata, limitations, privacy flags, and contract-compatibility metadata.
- The mock vision provider returns synthetic visual context summaries, product-photo/screenshot observations, uncertainty-only image consistency signals, manual-review drivers, limitations, usage metadata, and privacy flags; it remains separate from receipt scoring and `LocalAnalysisResult`.
- Failure simulation covers timeout, unavailable, malformed response, unsupported evidence, empty output, rate/cost limit, redaction failure, safety refusal, and internal normalization failure as operational or evidence limitations only.
- The existing `POST /api/analysis/ocr` route remains exact fixture-key only and is not wired to the adapter. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Phase 4.13 mock provider adapter safety/readiness checkpoint decision:

- Phase 4.13 confirms the Phase 4.12 adapter remains mock-only, synthetic-only, provider-free, SDK-free, env-free, upload-free, storage-free, persistence-free, customer-data-free, external-network-free, UI-free, live-analyzer-free, live-receipt-behavior-free, and unwired from the existing OCR route and live receipt workflow.
- The checkpoint documents input rejection, mock OCR output, mock vision output, failure simulation, privacy/retention flags, route/contract separation, probe/check coverage, safety language findings, and Phase 4.14 gate options.
- Semantic coverage now includes the Phase 4.13 checkpoint document.
- The existing `POST /api/analysis/ocr` route remains exact fixture-key only and is not wired to the adapter. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Phase 4.14 mock provider adapter developer usage decision:

- Phase 4.14 documents safe developer usage of the existing Phase 4.12 mock provider adapter without changing runtime behavior.
- The guide covers synthetic-only examples for mock OCR success, mock vision success, timeout, unavailable, malformed response, unsupported evidence, empty output, rate/cost limit, redaction failure, safety refusal, and normalization failure.
- The guide records disallowed usage examples for real receipts, real product photos, real screenshots, base64 images, object/data/image/file URLs, storage handles, customer identifiers, raw real OCR, support tickets, order/customer fields, provider payloads, live route uploads, and UI upload flow objects.
- OCR confidence, vision confidence, and altered-or-AI-generated-image uncertainty remain review-support signals only. Failure outputs remain operational or evidence limitations only.
- The existing `POST /api/analysis/ocr` route remains exact fixture-key only and is not wired to the adapter. `ocr-extraction-contract` remains the OCR normalization boundary; mock vision remains separate from receipt scoring and live analyzer behavior; `analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.
- Semantic coverage now includes the Phase 4.14 developer usage document.
- The next safe options are Phase 4.15 mock adapter route integration planning only, Phase 4.15 OpenAI Vision sandbox planning only with no implementation, or Phase 4.15 OCR provider abstraction skeleton planning only. Live OCR/provider work, route wiring, real evidence handling, SDKs, env vars, uploads, storage, persistence, UI wiring, receipt behavior changes, and `LocalAnalysisResult` migration remain blocked unless Robert explicitly opens a named implementation slice.
- Phase 4.15 mock adapter route integration planning decision:

- Phase 4.15 plans possible future mock adapter route integration without implementing it.
- The existing `POST /api/analysis/ocr` route remains exact fixture-key only and is not wired to the mock adapter. Existing route behavior and mock adapter behavior remain unchanged.
- The safest future implementation option, if Robert explicitly approves route integration later, is a separate synthetic-only mock provider route rather than extending the current OCR route.
- Future request planning is limited to synthetic fixture keys, mock provider type, mock/synthetic mode, evidence type hints, and synthetic behavior keys. Future validation must reject real files, base64 images, URLs, object/data/image/file URLs, storage handles, customer identifiers, raw real OCR, provider payloads, ticket/order/customer fields, non-synthetic modes, multipart uploads, and binary uploads.
- Future response planning keeps mock OCR contract output separate from mock vision uncertainty signals, includes privacy/retention flags and operational limitations, and must never return live provider payloads, a fraud score, a final claim decision, accusation language, `LocalAnalysisResult`, or receipt report adapter output.
- Semantic coverage now includes the Phase 4.15 route integration plan.
- Phase 4.16 mock provider route skeleton implementation decision:

- `POST /api/analysis/mock-provider` exists as a separate JSON-only synthetic mock-provider route skeleton.
- The route accepts only allowlisted mock provider types, synthetic behavior keys, `mode: "synthetic"`, safe evidence hints, and allowlisted OCR fixture keys for mock OCR. Mock vision uses a synthetic evidence type hint and remains separate from OCR fixtures and receipt scoring.
- The route calls only the existing mock provider adapter, preserves mock OCR output through the existing OCR extraction contract boundary, and keeps mock vision uncertainty separate as review-support signal material.
- The route rejects unsupported content types, multipart input, malformed JSON, missing/unknown provider types, missing/unknown behavior keys, missing/unknown OCR fixture keys, unexpected fields, files, binary-like payloads, base64-like payloads, object/data/image/file URLs, storage handles, customer identifiers, raw OCR text, provider payloads, ticket/order/customer fields, and non-synthetic modes.
- `src/app/api/analysis/mock-provider/route.probe.ts` is registered in `check:product-photo-probes` and covers success, failure modes, validation rejection, privacy flags, response safety, protected import isolation, package isolation, and existing OCR route regression safety. `scripts/check-report-semantics.mjs` covers the new route and probe boundary.
- The existing `POST /api/analysis/ocr` route remains exact `fixtureKey` only and is not wired to the mock adapter. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Phase 4.17 mock provider route safety/readiness checkpoint decision:

- Phase 4.17 confirms `POST /api/analysis/mock-provider` remains synthetic-only, mock-only, provider-free, SDK-free, env-free, upload-free, storage-free, persistence-free, customer-data-free, external-network-free, UI-free, live-analyzer-free, and live-receipt-behavior-free.
- The separate-route architecture remains correct: `/api/analysis/ocr` stays exact `fixtureKey` only and receipt-OCR-fixture focused, while `/api/analysis/mock-provider` stays synthetic mock-provider focused.
- The mock-provider route input validation and probe coverage reject unsupported content types, multipart, malformed JSON, missing/unknown provider or behavior, missing/unknown OCR fixture, unexpected fields, files, binary/base64-like payloads, URLs, storage handles, customer identifiers, raw OCR text, provider payloads, ticket/order/customer fields, and non-synthetic modes.
- Route outputs remain mock OCR/mock vision only, include privacy/retention flags, frame failures as operational or evidence limitations, and do not include live provider payloads, fraud scores, proof language, fake/forged accusation language, final claim decisions, automatic deny/refund wording, `LocalAnalysisResult`, or live receipt report output.
- Semantic coverage now includes the Phase 4.17 route safety/readiness checkpoint.
- Phase 4.18 mock provider route developer usage decision:

- Phase 4.18 documents safe developer usage of the existing separate `POST /api/analysis/mock-provider` route without changing route behavior.
- The guide covers synthetic-only request examples for mock OCR success, mock vision success, timeout, unavailable, malformed response, unsupported evidence, empty output, rate/cost limit, redaction failure, safety refusal, and normalization failure.
- The guide documents validation failure examples for unsupported content type, multipart, malformed JSON, missing/unknown provider type, missing/unknown behavior, missing/unknown OCR fixture, unexpected fields, file-like payloads, base64-like payloads, URL-like payloads, storage handles, customer identifiers, raw OCR text, provider payloads, ticket/order/customer fields, and non-synthetic mode.
- `ok: true`, `ok: false`, mock OCR confidence, mock vision confidence, and altered-or-AI-generated-image uncertainty are documented as synthetic review-signal or limitation states only, never proof findings or claim outcomes.
- Privacy/retention guidance preserves file retained false, raw OCR retained false, provider payload retained/logged false, external network called false, storage used false, env used false, no real customer data accepted, and no real evidence accepted.
- The existing `POST /api/analysis/ocr` route remains exact `fixtureKey` only and is not wired to the mock-provider route or adapter. `ocr-extraction-contract` remains the OCR normalization boundary; mock vision remains separate from receipt scoring; `analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.
- Semantic coverage now includes the Phase 4.18 developer usage document.
- Phase 4.19 OpenAI Vision sandbox planning decision:

- Phase 4.19 plans a possible future developer-only OpenAI Vision-style sandbox without implementing it.
- The plan covers synthetic/anonymized-fixture-only sandbox purpose, allowed and disallowed evidence categories, future OpenAI Vision role, prompt safety, separate output contract, privacy/retention rules, cost/timeout rules, relationship to existing routes and the mock adapter, future QA/probe gates, safety language rules, and Phase 4.20 options.
- Future vision output remains a reasoning and uncertainty layer only. Altered-or-AI-generated-image 1-100 values are uncertainty signals for manual review, not proof, not a customer accusation, not a final claim decision, and not a single fraud score.
- Existing `POST /api/analysis/ocr` remains exact `fixtureKey` only. Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Semantic coverage now includes the Phase 4.19 OpenAI Vision sandbox plan.
- Phase 4.20 OpenAI Vision prompt/output contract planning decision:

- Phase 4.20 defines future developer-only sandbox prompt template families and the future structured output contract without implementing them.
- Planned prompt families cover synthetic receipt visual review, synthetic order screenshot review, synthetic product photo review, synthetic damaged-product review, synthetic altered/AI-generated-image uncertainty review, mixed synthetic evidence review, unsupported/ambiguous evidence handling, and provider failure/timeout limitation handling.
- The future conceptual output shape stays separate from `LocalAnalysisResult`, live receipt report output, receipt scoring, claim disposition, customer-facing messaging, and existing OCR/mock-provider route response contracts.
- The required 1-100 "altered-or-AI-generated-image uncertainty" field is a review signal only, a manual-review driver, not proof, not a final decision, not a customer accusation, and not a fraud score.
- Future output must separate direct visual observations, inferred uncertainty signals, confidence notes, limitations, manual-review drivers, and safe support summaries. Unsupported evidence remains an evidence limitation only, and provider failures remain operational limitations only.
- Privacy constraints require synthetic/anonymized fixtures only by default, redaction before anonymized fixture testing, no raw identifiers, no raw OCR, no object URLs, no storage handles, no provider payload dumps, and no prompt/payload replay unless separately approved.
- Semantic coverage now includes the Phase 4.20 prompt/output contract plan.
- Phase 4.21 OpenAI Vision sandbox schema planning decision:

- Phase 4.21 defines the future developer-only sandbox schema without implementing runtime types. It covers schema identity, allowed enum/value sets, evidence classification, visual summaries, observations, uncertainty signals, altered-or-AI-generated-image uncertainty, confidence notes, manual-review drivers, limitations, safe summaries, privacy/retention metadata, cost/timeout metadata, completed/unsupported/refusal/failure shapes, validation rules, and future QA/probe requirements.
- The future conceptual output shape stays separate from `LocalAnalysisResult`, live receipt report output, receipt scoring, claim disposition, customer-facing messaging, and existing OCR/mock-provider route response contracts.
- The required 1-100 altered-or-AI-generated-image uncertainty field remains a review signal only, a manual-review driver, not proof, not a final decision, not a customer accusation, and not a fraud score. The value is nullable or omitted when not applicable.
- Future schema validation must require allowed enums, no raw identifiers, no provider payload dumps, no object URLs, no storage handles, no public image URLs, no proof language, no automatic disposition wording, required limitations for unsupported/failure states, nullable altered/AI uncertainty when not applicable, observation/signal separation, and sandbox/openai-vision-style identity locks.
- Existing `POST /api/analysis/ocr` remains exact `fixtureKey` only. Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Semantic coverage now includes the Phase 4.21 schema plan.
- Phase 4.22 OpenAI Vision sandbox fixture-policy planning decision:
- Phase 4.22 defines the future sandbox fixture policy without creating fixture files/images. It covers future allowed synthetic fixture categories, redacted/anonymized fixture approval policy, disallowed fixture categories, fixture naming and metadata policy, scenario matrix, altered-or-AI-generated-image uncertainty fixture rules, privacy/retention rules, fixture QA/probe requirements, route/mock-adapter/schema-plan relationships, and approval gates.
- Synthetic fixtures remain preferred by default. Redacted/anonymized real-world-style fixtures require a separate approved phase with Robert approval, source documentation, redaction process, identifier removal, EXIF/location metadata removal, raw OCR removal, retention/deletion policy, fixture ownership policy, legal/privacy checkpoint, private-identifier scan, and separate approval for any provider payload replay.
- Existing `POST /api/analysis/ocr` remains exact `fixtureKey` only. Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Semantic coverage now includes the Phase 4.22 fixture-policy plan.
- Phase 4.23 OpenAI Vision sandbox validation/probe planning decision:
- Phase 4.23 defines the future validation/probe plan without implementing validators or probes beyond narrow semantic checker coverage. It covers validation categories, probe categories, semantic safety wording scans, altered-or-AI-generated-image uncertainty validation, observation-vs-signal separation validation, privacy/identifier scans, fixture-policy enforcement validation, unsupported/failure-state probes, schema/output validation probes, route/runtime/package guard scans, downloadable-package safety checks, execution strategy, route/mock-adapter/fixture-policy/schema relationships, and approval gates.
- Future downloadable/self-hosted package safety checks should block real evidence, unapproved redacted/anonymized fixtures, private fixture metadata, raw OCR dumps, provider payload dumps, secrets, object URLs, storage handles, unsafe demo data, live-provider assumptions, and customer-facing accusation examples from installable artifacts.
- Existing `POST /api/analysis/ocr` remains exact `fixtureKey` only. Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Semantic coverage now includes the Phase 4.23 validation/probe plan.
- Phase 4.24 synthetic fixture metadata schema planning decision:
- Phase 4.24 defines future fixture metadata purpose/scope, top-level identity fields, allowed/disallowed category and evidence enums, prompt/schema linkage fields, expected-output metadata, altered-or-AI-generated-image uncertainty metadata, privacy/identifier/redaction fields, retention/ownership fields, package-distribution safety fields, cost/timeout expectation fields, required vs optional field groups, metadata validation expectations, relationships to existing routes/plans, and approval gates.
- Future downloadable/self-hosted package metadata should block real evidence, private fixtures, provider payloads, secrets, object URLs, storage handles, unsafe demo data, live-provider assumptions, and unapproved redacted/anonymized content from installable artifacts.
- Existing `POST /api/analysis/ocr` remains exact `fixtureKey` only. Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Semantic coverage now includes the Phase 4.24 synthetic fixture metadata schema plan.
- Phase 4.25 OpenAI Vision sandbox validation/probe implementation planning decision:
- Phase 4.25 defines the Phase 4.26 local static validation/probe implementation sequence without implementing the probes. It covers files to inspect, blocked patterns and planning-only exceptions, no-SDK/env/provider-call checks, no-upload/storage/object URL checks, protected runtime and route boundary checks, no-real-evidence/private-identifier checks, provider-payload/raw-OCR blocks, altered-or-AI-generated-image uncertainty wording, observation-vs-signal separation, unsupported/failure shape checks, fixture metadata policy checks, package/distribution safety checks, commit-blocking vs package-blocking behavior, expected script names, approval gates, and the Phase 4.26 recommendation.
- Existing `POST /api/analysis/ocr` remains exact `fixtureKey` only. Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- Semantic coverage now includes the Phase 4.25 validation/probe implementation plan.
- Phase 4.26 local static sandbox validation/probe implementation decision:
- Phase 4.26 implements `scripts/check-vision-sandbox-boundaries.mjs` and npm script `check:vision-sandbox-boundaries` without adding dependencies. The checker covers package/provider/env/call surfaces, protected runtime/package diffs, sandbox runtime wiring, OCR/mock-provider route markers, private identifiers, provider payload/raw OCR, public URL/object URL/storage handles in future sandbox artifacts, fixture metadata safety fields, altered-or-AI-generated-image uncertainty wording, unsafe outcome wording in future artifacts, observation-vs-signal safety signals, and package artifact paths.
- `PHASE_4_26_SANDBOX_VALIDATION_PROBES.md` documents implemented checks, false-positive controls, commit-blocking/package-blocking behavior, deferred checks, specialist findings, and the Phase 4.27 recommendation.
- Existing `POST /api/analysis/ocr` remains exact `fixtureKey` only. Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only. `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser/scoring/report behavior, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain unchanged.
- The next safe option is Phase 4.27 synthetic fixture metadata only. Live OCR/provider work, real evidence handling, SDKs, env vars, uploads, storage, persistence, UI wiring, receipt behavior changes, fixture files/images, runtime schema/types, and `LocalAnalysisResult` migration remain blocked unless Robert explicitly opens a named implementation slice.

Deferred until a later Phase 4 implementation slice is explicitly opened:

- Real OCR provider connections.
- Real AI vision or language model calls.
- Sending real evidence to third-party services.
- Provider-specific commitments.
- Provider SDKs, credentials, environment variables, routes, storage, persistence, and deployment changes.
- `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `LocalAnalysisResult` migration, and receipt behavior changes.

## Phase 5: Customer and Ticket Integrations

Status: Future phase.

Meaning:

- Ticket and email context.
- Gmail, Drive, Zendesk, Freshdesk, or other support-system planning.
- Customer/order context import.
- Evidence-to-ticket linking.
- Integration audit trails.

Deferred until Phase 5 is explicitly opened:

- Live integrations.
- Credential handling.
- Ticket writebacks.
- Automated customer messaging.

## Phase 6: SaaS Platform

Status: Future phase.

Meaning:

- Auth.
- Organizations and users.
- Data model and retention policy.
- Billing readiness if needed.
- Admin and reviewer permissions.
- Production storage and audit controls.

Deferred until Phase 6 is explicitly opened:

- Billing.
- Multi-tenant production data storage.
- Enterprise admin surfaces.
- Real customer onboarding.

## Phase 7: Enterprise Fraud Intelligence

Status: Future phase.

Meaning:

- Cross-case risk signals.
- Merchant, channel, account, claim-history, and evidence-pattern intelligence.
- Enterprise reporting.
- Review-support insights across claims.
- Pattern detection with strong safety and privacy controls.

Deferred until Phase 7 is explicitly opened:

- Enterprise dashboards.
- Automated denial systems.
- Customer profiling claims.
- Cross-customer intelligence without a clear privacy and legal review.

## Cross-Phase Safety Requirements

- Keep "External Verification: Not performed" unless a real explicitly opened integration performs it.
- Keep scores framed as evidence reliability and internal consistency.
- Preserve manual-review language.
- Do not accuse customers.
- Do not store or commit real customer evidence.
- Document data movement before any future integration is implemented.
