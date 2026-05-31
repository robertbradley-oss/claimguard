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

Status: Closed as non-live unsupported/product-photo readiness after the Phase 2.9.1 review-only closeout. Product-photo and unsupported-evidence runtime remain non-live; unsupported evidence is not ready for live opt-in implementation; and any future runtime/UI/upload/report/provider/storage/integration/case-queue/OCR/metadata work requires a separate explicit approval.

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
- Phase 2.9.0 adds the docs-only unsupported-evidence live-opt-in readiness plan in `PHASE_2_9_0_UNSUPPORTED_EVIDENCE_LIVE_OPT_IN_READINESS_PLAN.md`. It decides unsupported evidence is not ready for live opt-in implementation because the workflow remains unwired, live unsupported-evidence UI does not exist, `LocalAnalysisResult` remains receipt-shaped, `analyzeEvidenceFile` remains receipt-only, ProductPhotoReviewPanel remains unrouted, no real product-photo/OCR/metadata/provider/storage/integration/case-queue work exists, and Phase 3 case workflow/audit/persistence foundations do not exist yet. The narrowest later path is a default-off workflow/caller boundary slice after explicit approval. Phase 2.9.1 review-only closeout passed after `095fd18`, so Phase 2 is closed as a non-live readiness phase. No deployment occurred; receipt behavior remains unchanged; Phase 3 has not started.
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

Status: Future phase. Phase 3 may begin as planning-only case workflow readiness; implementation is not approved until Robert explicitly opens a named implementation slice.

Meaning:

- Case queue and case detail concepts.
- Review status lifecycle.
- Reviewer notes and actions.
- Audit history.
- Evidence grouping across receipts, photos, and context.
- Safe support workflows that keep humans in the decision loop.

Deferred until Phase 3 is explicitly opened:

- Persistent case database.
- Authenticated reviewer accounts.
- Production case queues.
- Ticket-system writebacks.

## Phase 4: Stronger OCR and AI Integrations

Status: Future phase.

Meaning:

- Provider-neutral OCR/AI interfaces.
- External OCR or AI analysis behind explicit approval and privacy controls.
- Confidence, cost, latency, and fallback planning.
- Safety filters for generated model output.

Deferred until Phase 4 is explicitly opened:

- Real OCR provider connections.
- Real AI vision or language model calls.
- Sending real evidence to third-party services.
- Provider-specific commitments.

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
