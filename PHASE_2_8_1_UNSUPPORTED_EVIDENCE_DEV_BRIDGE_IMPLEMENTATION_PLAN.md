# Phase 2.8.1 Unsupported Evidence Dev Bridge Implementation Plan

This is a docs-only Phase 2.8.1 implementation plan for a future Phase 2.8.2 dev-only unsupported-evidence review bridge. It does not implement runtime, add a route, add UI, wire `ClaimReviewWorkflow`, start Phase 2.9, commit, push, deploy, or change receipt behavior.

Current pushed checkpoint: `bc69d25` (`docs: plan phase 2.8 unsupported evidence bridge`). Product-photo runtime remains non-live. The default-off pre-analysis wrapper and the workflow boundary helper remain unwired. Unsupported-evidence UI does not exist. Receipt behavior is unchanged.

## Phase 2.8.1 Decision

Phase 2.8.2 should implement the first unsupported-evidence review bridge as a separate route-local developer story/probe surface:

- Route file: `src/app/dev/unsupported-evidence-review/page.tsx`
- Synthetic cases file: `src/app/dev/unsupported-evidence-review/render-cases.ts`
- URL: `/dev/unsupported-evidence-review`

The route must be production-disabled with `process.env.NODE_ENV !== "production"` and `notFound()` from `next/navigation`, matching the existing `/dev/pre-analysis-evidence-gate`, `/dev/product-photo-adapter-readiness`, and `/dev/product-photo-review-panel` pattern.

The route must remain unlinked from app navigation, `/`, and `/test-evidence`.

The first implementation should be route-local. Do not add `src/components/UnsupportedEvidenceReviewPanel.tsx` in Phase 2.8.2 unless Robert explicitly changes the scope. A reusable component can wait until the synthetic route proves the visual contract.

## Data And Import Shape

Phase 2.8.2 should use literal synthetic hardcoded review-state cases only.

`render-cases.ts` may import types from `src/lib/analysis/unsupported-evidence-review-state.ts`, but it should not value-import or call `mapUnsupportedEvidenceReviewState`.

The route should import only:

- `notFound` from `next/navigation`
- the colocated synthetic cases from `./render-cases`
- optional type-only imports needed for local presentation helpers

The future bridge must not import the workflow boundary helper. `workflow-pre-analysis-gate-boundary.ts` is useful as a probe-only caller-boundary contract, but importing it in the dev route would blur a visual story with future workflow behavior.

If a later slice needs generated cases, prefer a separate probe or explicit approval before value-importing the mapper. For Phase 2.8.2, literal objects are safer because they prove rendering without executing mapper, wrapper, analyzer, workflow, or report code.

## Rendering Shape

The page should render each synthetic case as an unsupported-evidence stopped-state review card. It should feel like a developer review story for support-safe stopped states, not a live support workflow and not a product-photo report.

Recommended page sections:

- Header: synthetic non-live developer unsupported-evidence review.
- Non-live badges: Local/dev only, Synthetic review states only, Manual review only, Runtime live: No.
- Case list with distinct visible outcomes.
- Per-case summary and support guidance.
- No-live isolation markers.
- Blocked output reasons.
- Privacy/safety posture.

Visible fields to show from each synthetic `UnsupportedEvidenceReviewDisplay`-shaped case:

- `evidenceTypeLabel`
- `reviewStatus` as the unsupported/manual-review status
- `manualReviewGuidance`
- `customerSafeWording`
- `confidenceTreatment.label`, `confidenceTreatment.summary`, and `confidenceTreatment.scoreBoundaryNotice`
- `blockedOutputReasons`
- `allowedNextActions`
- `externalVerification`
- `verificationStatus`
- no-live markers such as `runtimeLive`, `productPhotoRuntimeLive`, `manualReviewOnly`, `ocrInvoked`, `metadataInvoked`, `analyzerInvoked`, `liveReportAdapterInvoked`, and `productPhotoReviewPanelRouted`

Confidence and uncertainty treatment:

- Show `Not analyzed` for stopped unsupported/product-photo-like cases.
- Show `Routing inconclusive` for unknown/inconclusive cases.
- Keep the score-boundary notice visible so reviewers understand the stopped state is not a score.
- Do not show numeric confidence, risk bands, receipt scores, product-photo scores, authenticity scores, or proof labels.

Allowed next actions should be displayed as reviewer-support actions only:

- Manual review.
- Request an eligible receipt if available.
- Use support policy and available evidence.

## Required Synthetic Cases

`render-cases.ts` should export readonly literal cases. Recommended shape:

```ts
import type { UnsupportedEvidenceReviewDisplay } from "@/lib/analysis/unsupported-evidence-review-state";

export type UnsupportedEvidenceReviewRenderCase = {
  key: string;
  title: string;
  caption: string;
  review: UnsupportedEvidenceReviewDisplay;
};
```

Required cases:

- Generic unsupported evidence.
- Product-photo-like unsupported evidence.
- Legacy damage-photo terminology compatibility case with no unsafe visible accusation.
- Unknown/inconclusive routing.
- Order screenshot unsupported state.
- Ambiguous PDF unsupported state.
- Receipt-like-not-parseable stopped state.
- Hostile/private sentinel omission case that does not render the raw sentinel.
- Long-text wrapping case.
- Manual-review-only no-live marker case.

All synthetic text must be generic and privacy-safe. Do not include realistic order IDs, claim IDs, ticket IDs, evidence IDs, customer names, addresses, phone numbers, emails, paths, filenames, provider IDs, storage IDs, integration IDs, device serials, barcodes, QR values, or copied metadata.

## What Must Not Be Shown

The route must not show:

- Receipt score.
- Receipt score breakdown.
- Authenticity score.
- Product-photo score.
- Product-photo report.
- ProductPhotoReviewPanel.
- Proof-of-purchase wording.
- Evidence truth, evidence validity, or external verification conclusions.
- Fraud confirmation.
- Fake, forged, manipulated, or customer-accusation language.
- Deny/refund/approve/reject automated decision language.
- Parser fields, raw OCR, raw EXIF, raw metadata, original filenames, paths, image previews, file previews, object URLs, data URLs, image URLs, provider payloads, storage handles, integration handles, case queue handles, or workflow identifiers.

## Files Eligible In Phase 2.8.2

Eligible only after Robert explicitly opens the implementation slice:

- `src/app/dev/unsupported-evidence-review/page.tsx`
- `src/app/dev/unsupported-evidence-review/render-cases.ts`
- `scripts/check-report-semantics.mjs`, only to add semantic/privacy/import coverage for the dev route and render cases
- `NEXT_STEPS.md`
- `ROADMAP.md`
- `REPO_SOURCE_OF_TRUTH.md`
- `AGENT_LOG.md`

Optional only if separately approved:

- `src/components/UnsupportedEvidenceReviewPanel.tsx`
- `src/components/UnsupportedEvidenceReviewPanel.probe.tsx`
- `scripts/run-product-photo-probes.cjs`, only if a new executable probe is added

## Protected Files And Surfaces

Do not touch in Phase 2.8.2:

- `src/lib/analysis/analyzer.ts`
- `analyzeEvidenceFile`
- `src/lib/analysis/types.ts`
- `LocalAnalysisResult`
- `src/lib/analysis/report-adapter.ts`
- live report adapter mapping
- `src/components/ClaimReviewWorkflow.tsx`
- live run-analysis path
- `src/components/ProductPhotoReviewPanel.tsx`
- ProductPhotoReviewPanel routing
- upload flow
- `src/app/page.tsx`
- `src/app/test-evidence/`
- `src/components/TestEvidenceHarness.tsx`
- parser
- scoring
- fixtures, unless synthetic dev-only render cases are explicitly isolated in `src/app/dev/unsupported-evidence-review/render-cases.ts`
- providers, storage, integrations, and case queues
- OCR/metadata processing
- deployment config
- live navigation
- package dependencies

## Semantic And Privacy Guards For Phase 2.8.2

`scripts/check-report-semantics.mjs` should add coverage proving:

- the dev route imports `notFound`
- the dev route gates production with `process.env.NODE_ENV !== "production"` and calls `notFound()`
- the dev route and render cases are included in semantic checks
- `/` does not link to `/dev/unsupported-evidence-review`
- `/test-evidence` does not link to or import `/dev/unsupported-evidence-review`
- render cases are literal synthetic review-state objects
- the mapper is not value-imported or called
- the workflow boundary helper is not imported
- analyzer, report adapter, parser, scoring, upload, fixtures, providers, storage, integrations, case queues, OCR/metadata, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` are not imported
- no `File`, `Blob`, `createObjectURL`, `objectUrl`, `imageUrl`, `dataUrl`, `fetch`, browser storage, raw OCR, raw metadata, filenames, paths, IDs, provider payloads, or retained handles appear
- no receipt score, authenticity score, product-photo report, proof-of-purchase wording, fraud confirmation, fake/forged/manipulation accusation, automatic denial, approval, rejection, refund decision, or final claim outcome appears
- `External Verification: Not performed`, `Verification Status: Not externally verified`, and manual-review-only wording remain visible

## Required Checks For Phase 2.8.2

Implementation checks:

- `git status --short --branch`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:report-semantics`
- `npm.cmd run check:product-photo-probes`
- `git diff --check`
- protected code diff scan confirming only eligible files changed
- final `git status --short --branch`

Protected diff scan should explicitly confirm no changes to:

- `src/lib/analysis/analyzer.ts`
- `src/lib/analysis/types.ts`
- `src/lib/analysis/report-adapter.ts`
- `src/components/ClaimReviewWorkflow.tsx`
- `src/components/ProductPhotoReviewPanel.tsx`
- `src/app/page.tsx`
- `src/app/test-evidence/`
- `src/components/TestEvidenceHarness.tsx`
- parser, scoring, upload, fixtures, providers, storage, integrations, case queues, OCR/metadata, package/deploy config, and live navigation files

## Browser And Manual QA For Phase 2.8.2

Run browser/manual QA only after the future route exists.

Verify:

- `/dev/unsupported-evidence-review` loads in local development.
- production mode returns `notFound()` or otherwise makes the route inaccessible.
- `/` still loads the receipt workflow and has no visible link to the dev route.
- `/test-evidence` remains receipt QA and has no visible link to the dev route.
- every required synthetic case is visible.
- evidence type label, unsupported/manual-review status, manual-review guidance, customer-safe wording, confidence/uncertainty treatment, blocked output reasons, and allowed next actions are visible.
- `External Verification: Not performed` and `Verification Status: Not externally verified` are visible.
- no receipt score, authenticity score, proof-of-purchase wording, product-photo report, ProductPhotoReviewPanel, fraud confirmation, fake/forged/manipulation accusation, deny/refund automated decision, file input, image preview, object URL, or raw/private identifier appears.
- desktop and mobile layouts have no console errors, text overlap, clipped labels, horizontal overflow, confusing nested scroll, or color-only state semantics.
- screenshots, if captured, contain only synthetic data and are not committed unless Robert explicitly approves.

## Implementation Blockers

Stop Phase 2.8.2 if:

- the route needs live upload state, `File`, `Blob`, object URLs, image/data URLs, fetch, browser storage, route params, real evidence, raw OCR, raw metadata, filenames, paths, IDs, provider output, storage/integration handles, or case workflow identifiers
- the route needs `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, `analyzeEvidenceFile`, `LocalAnalysisResult`, live report adapter mapping, parser, scoring, upload, fixtures, providers, storage, integrations, case queues, OCR/metadata, package/deploy config, or live navigation changes
- the route needs to value-import or call the workflow boundary helper
- the route cannot stay production-disabled and unlinked
- semantic/privacy guard coverage cannot be added
- required checks fail or cannot be interpreted safely
- any visible wording implies proof, external verification happened, customer wrongdoing, fake/forged/manipulated evidence, automatic denial, approval, rejection, refund decision, or final claim outcome

## Phase 2.9 Gate

Phase 2.9 must not begin until all of the following are true:

- Phase 2.8.1 is accepted, committed, and pushed if Robert approves.
- Phase 2.8.2 is explicitly opened by Robert, implemented, checked, browser-verified, committed, and pushed, or Robert explicitly accepts a docs-only definition as sufficient.
- The dev bridge remains unlinked, production-disabled, synthetic-only, and browser-verified.
- Receipt behavior remains unchanged.
- `analyzeEvidenceFile` remains untouched.
- `LocalAnalysisResult` remains receipt-shaped.
- unsupported evidence remains outside receipt reports and live report mapping.
- `ClaimReviewWorkflow` remains unwired to unsupported evidence.
- ProductPhotoReviewPanel is not routed for unsupported evidence.
- Product-photo runtime remains non-live unless Robert separately opens a named runtime slice.
- Robert explicitly approves the Phase 2.9 scope.

## Recommended Phase 2.8.2 Prompt

```text
/claimguardagent implement Phase 2.8.2 dev-only unsupported-evidence review bridge as a route-local, unlinked, production-disabled developer route at src/app/dev/unsupported-evidence-review/page.tsx with literal synthetic UnsupportedEvidenceReviewDisplay-shaped cases in src/app/dev/unsupported-evidence-review/render-cases.ts; use at most type-only imports from unsupported-evidence-review-state; do not value-import/call the mapper or workflow boundary helper; do not use /test-evidence, ClaimReviewWorkflow, upload routing, analyzeEvidenceFile, LocalAnalysisResult, report-adapter mapping, parser, scoring, fixtures outside the colocated synthetic render cases, ProductPhotoReviewPanel, providers, storage, integrations, case queues, OCR/metadata, real evidence, image/object/data URLs, raw metadata, private identifiers, package/config/public/deployment changes, live navigation, Phase 2.9, push, or deploy; add semantic/privacy coverage; run lint, build, report semantics, product-photo probes, diff check, protected diff scans, and browser checks for desktop/mobile plus production-disabled/unlinked behavior
```
