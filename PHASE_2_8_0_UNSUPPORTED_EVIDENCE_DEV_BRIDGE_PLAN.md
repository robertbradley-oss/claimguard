# Phase 2.8.0 Unsupported Evidence Dev Bridge Plan

This is a docs-only Phase 2.8.0 acceleration plan. It does not implement, wire, route, render, commit, push, deploy, or start Phase 2.9.

Phase 2.7.8 is pushed at `79b3bfb` (`docs: align phase 2.7.8 source truth`). Phase 2.7 produced the unsupported-evidence reviewer state contract, display/mapping probe plan, non-live mapper/probe, workflow/caller boundary opt-in design, and probe-only workflow/caller boundary helper. Product-photo runtime remains non-live. The default-off pre-analysis wrapper and workflow boundary helper remain unwired. Unsupported-evidence UI does not exist. Receipt behavior is unchanged.

## Planning Question

What is the safest way to create a dev-only/user-visible bridge for unsupported-evidence review without making it live product behavior?

## Decision

Phase 2.8 should target a separate dev-only, unlinked, production-disabled story/probe route for unsupported-evidence review.

Recommended future shape, only after Robert explicitly approves implementation:

- Route: `src/app/dev/unsupported-evidence-review/page.tsx`
- Synthetic cases: `src/app/dev/unsupported-evidence-review/render-cases.ts`
- URL: `/dev/unsupported-evidence-review`

The route should display literal synthetic unsupported-evidence review states derived from the already-proven Phase 2.7 contracts. It should be browser-checkable, but it must not participate in the live receipt workflow, upload flow, report mapping, or product-photo UI.

## Why This Option

Chosen option: separate dev-only story/probe route.

Why it is safest:

- It gives developers a visible bridge for review-state QA without touching `/`, `/test-evidence`, or `ClaimReviewWorkflow`.
- It can be unlinked from app navigation and disabled in production with `notFound()` or equivalent.
- It can use literal synthetic cases only, avoiding files, uploads, object URLs, raw OCR, raw metadata, filenames, or provider payloads.
- It supports desktop/mobile browser QA for wording, wrapping, visibility, and console cleanliness before any live UI is considered.
- It keeps the existing receipt analyzer, receipt report adapter, and receipt result shape out of the unsupported-evidence display path.

Rejected as the Phase 2.8 target:

- `/test-evidence` extension: rejected because `/test-evidence` is receipt/manual-QA oriented and would blur unsupported-evidence review with receipt QA.
- Live `ClaimReviewWorkflow` insertion: rejected because it would be live workflow work and belongs after the dev bridge is proven.
- ProductPhotoReviewPanel routing: rejected because unsupported evidence is a stop state, not product-photo analysis or a product-photo report.
- Pure library probe only: already covered by Phase 2.7; Phase 2.8 needs a browser-checkable bridge.
- Standalone exported app component first: possible later, but a route-local renderer is safer for the first bridge because it avoids creating a reusable app surface before the display contract is visually proven.

## What The Bridge May Show

The future dev route may show only derived synthetic unsupported-evidence review state:

- unsupported/manual-review status
- neutral evidence type label
- support-rep summary
- customer-safe wording
- manual-review guidance
- confidence treatment as `Not analyzed` or `Routing inconclusive`
- allowed next actions
- blocked output reasons
- `External Verification: Not performed`
- `Verification Status: Not externally verified`
- no-live/no-score/no-report markers

Required synthetic cases:

- generic unsupported evidence
- product-photo-like unsupported evidence
- legacy damage-photo terminology compatibility case
- unknown/inconclusive routing
- order screenshot unsupported state
- ambiguous PDF unsupported state
- receipt-like-not-parseable stopped state
- hostile/private sentinel omission case
- long-text wrapping case
- no-live marker case

The future cases should be literal synthetic objects, not builder calls. `render-cases.ts` may use type-only imports if needed, but should not value-import mapper, wrapper, analyzer, report adapter, ProductPhotoReviewPanel, upload, fixtures, providers, storage, integrations, case queues, OCR, or metadata code.

## What The Bridge Must Not Show

The future dev route must not show:

- receipt score, receipt score breakdown, receipt risk band, parser fields, or receipt report output
- product-photo score, product-photo report fields, product-photo analyzer signals, or `ProductPhotoReviewPanel`
- proof-of-purchase conclusions
- evidence truth, validity, authenticity, approval, rejection, denial, automatic disposition, or final claim outcome
- image previews, file previews, object URLs, data URLs, raw OCR, raw EXIF, raw metadata, original filenames, paths, customer/order/ticket/claim/evidence IDs, provider payloads, storage handles, integration handles, or case queue handles

## Receipt Preservation Requirements

Phase 2.8 and any future dev bridge implementation must keep:

- `analyzeEvidenceFile` untouched and receipt-only
- `LocalAnalysisResult` unchanged and receipt-shaped
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` receipt-only
- unsupported evidence outside receipt reports
- receipt image, PDF receipt, screenshot/default, report, parser, scoring, fixture, upload, and `/test-evidence` behavior unchanged
- product-photo runtime non-live
- the pre-analysis wrapper default-off and unwired from live callers
- the workflow boundary helper probe-only and unwired from live callers

## Eligible Future Implementation Files

Allowed only after Robert explicitly opens a Phase 2.8 implementation slice:

- `src/app/dev/unsupported-evidence-review/page.tsx`
- `src/app/dev/unsupported-evidence-review/render-cases.ts`
- `scripts/check-report-semantics.mjs`, only to add semantic/privacy/import coverage for the dev route and render cases
- `NEXT_STEPS.md`
- `ROADMAP.md`
- `REPO_SOURCE_OF_TRUTH.md`
- `AGENT_LOG.md`

Optional later, only if route-local rendering becomes unwieldy and Robert approves:

- `src/components/UnsupportedEvidenceReviewPanel.tsx`, isolated and unwired from live app paths
- `src/components/UnsupportedEvidenceReviewPanel.probe.tsx`, if a standalone component is created
- `scripts/run-product-photo-probes.cjs`, only if a new executable probe is added

## Protected Files And Surfaces

Protected unless a later prompt explicitly names an exception:

- `src/lib/analysis/analyzer.ts`
- `analyzeEvidenceFile`
- `src/lib/analysis/types.ts`
- `LocalAnalysisResult`
- `src/lib/analysis/report-adapter.ts`
- live receipt report adapter mapping
- `src/components/ClaimReviewWorkflow.tsx`
- live run-analysis path
- `src/components/ProductPhotoReviewPanel.tsx`
- ProductPhotoReviewPanel routing
- `src/components/UploadPanel.tsx`
- upload flow
- `src/app/page.tsx`
- `src/app/test-evidence/`
- `src/components/TestEvidenceHarness.tsx`
- parser
- scoring
- fixtures, unless explicitly synthetic/dev-only in a later approved slice
- providers
- storage
- integrations
- case queues
- OCR/metadata processing
- package/config/public/deployment files

## Required Future Semantic And Privacy Guards

Before any Phase 2.8 implementation is accepted, semantic/privacy checks must prove:

- the dev route is production-disabled and unlinked from `/`
- `/test-evidence` does not import or link the unsupported-evidence route
- the dev route and render cases do not import analyzer, report adapter, parser, scoring, upload, fixtures, providers, storage, integrations, case queues, OCR/metadata, ProductPhotoReviewPanel, or `ClaimReviewWorkflow`
- render cases use literal synthetic derived state only
- no builder calls, file/blob/object URL/data URL/image URL/fetch/browser storage, raw OCR, raw metadata, filenames, paths, IDs, provider payloads, or storage/integration handles appear
- no receipt score, product-photo report, proof-of-purchase, proof/verification, customer accusation, approval/rejection/denial, automatic disposition, or final-outcome wording appears in displayed unsupported state
- external verification remains `Not performed` and verification status remains `Not externally verified`

## Browser And Manual QA For Future Implementation

Browser checks are not required for this docs-only plan.

If the future dev route is implemented, run browser/manual QA for:

- `/dev/unsupported-evidence-review` loads in local development
- the route is inaccessible or returns `notFound()` in production mode
- `/` still loads the existing receipt workflow and does not link the dev route
- `/test-evidence` remains receipt QA and does not link the dev route
- all synthetic outcomes are visible
- manual-review-only wording is visible
- external-verification-not-performed wording is visible
- no receipt score, product-photo report, proof-of-purchase status, image preview, file input, or ProductPhotoReviewPanel appears
- desktop and mobile layouts have no console errors, text overlap, clipped labels, confusing nested scroll, or color-only status semantics
- screenshots, if captured, contain only synthetic data and are not committed unless explicitly approved

Manual QA must use synthetic or structurally redacted data only.

## Phase 2.9 Gate

Phase 2.9 must not begin until Phase 2.8 proves or explicitly defines the dev-only/user-visible bridge.

Minimum conditions before Phase 2.9:

- Phase 2.8.0 plan is accepted, committed, and pushed.
- A later Phase 2.8 implementation slice, if opened, proves a dev-only unsupported-evidence review bridge with semantic/privacy coverage and browser QA.
- Receipt behavior remains unchanged.
- `analyzeEvidenceFile` remains untouched.
- `LocalAnalysisResult` remains receipt-shaped.
- unsupported evidence remains outside receipt reports.
- ProductPhotoReviewPanel is not routed for unsupported evidence.
- Product-photo runtime remains non-live unless Robert separately opens a named runtime slice.
- Robert explicitly approves the Phase 2.9 scope.

## Stop Conditions

Stop any future Phase 2.8 implementation if:

- live runtime, `ClaimReviewWorkflow`, upload flow, report mapping, analyzer, parser, scoring, fixtures, ProductPhotoReviewPanel, providers, storage, integrations, case queues, OCR/metadata, package/config/public/deployment files, or app navigation change unexpectedly
- unsupported evidence is stored in `LocalAnalysisResult`
- unsupported evidence is mapped through `mapLocalAnalysisToReport`
- unsupported evidence is routed to `ProductPhotoReviewPanel`
- product-photo runtime becomes live
- real evidence, raw OCR, raw metadata, filenames, paths, IDs, URLs, screenshots, provider payloads, storage handles, integration handles, or case workflow identifiers appear
- wording implies proof, external verification happened, wrongdoing, customer accusation, automatic disposition, approval, rejection, denial, or final claim outcome
- required checks fail or cannot be interpreted safely

## Recommended Next Safe Task

After this docs plan is reviewed, committed, and pushed, the next safe task is review-only closeout or a narrow Phase 2.8.1 implementation plan/prompt for the dev-only unsupported-evidence review route.

Recommended implementation prompt, only after Robert explicitly approves implementation:

```text
/claimguardagent implement Phase 2.8.1 dev-only unsupported-evidence review bridge as an unlinked production-disabled route at src/app/dev/unsupported-evidence-review/page.tsx with literal synthetic render cases in src/app/dev/unsupported-evidence-review/render-cases.ts; do not use /test-evidence, ClaimReviewWorkflow, upload routing, analyzeEvidenceFile, LocalAnalysisResult, report-adapter mapping, parser, scoring, fixtures, ProductPhotoReviewPanel, providers, storage, integrations, case queues, OCR/metadata, real evidence, image/object/data URLs, raw metadata, private identifiers, package/config/public/deployment changes, Phase 2.9, push, or deploy; add semantic/privacy coverage; run lint, build, report semantics, product-photo probes, diff check, protected diff scans, and browser checks
```
