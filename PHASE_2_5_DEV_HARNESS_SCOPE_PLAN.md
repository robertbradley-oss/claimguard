# Phase 2.5 Dev-Only Adapter/Gate Review Harness Scope Plan

> Status: Phase 2.5.1 implemented the gate-first harness from Section 10. `src/app/dev/pre-analysis-evidence-gate/page.tsx` + `render-cases.ts` render literal synthetic `PreAnalysisEvidenceGateDecision` cases on a production-disabled, unlinked dev route with no-live markers and no builder/value imports, covered by `scripts/check-report-semantics.mjs` guards. The remaining open slice is Phase 2.5.2: the adapter-readiness review harness (`/dev/product-photo-adapter-readiness`), to be opened separately.

This is the Phase 2.5.0 docs-only scope plan. It defines what Phase 2.5 is, what it must prove, what it must not touch, and what "done" means before any implementation begins.

It does not implement a harness, route, component, render-case file, adapter/gate execution path, upload path, report mapping, provider, storage, integration, case queue, fixture, or deployment.

Phase 2.4 is closed as a non-live adapter/readiness/runtime-blocker phase. Product-photo runtime remains non-live. `runtimeLive` remains false, `manualReviewOnly` remains true, `analyzeEvidenceFile` remains the live receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, and receipt behavior remains unchanged. Latest pushed commit at planning time: `ecc45cd` (`docs: align agents phase 2.4 status`).

This plan extends `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md` (which scoped only the adapter-readiness harness) to also cover the Phase 2.4.10 `pre-analysis-evidence-gate` decision outputs. Where the two docs overlap, the stricter constraint wins.

## 1. What Phase 2.5 Is

Phase 2.5 is the **dev-only adapter/gate review harness phase**: a no-live, synthetic-only developer surface for inspecting already-derived product-photo adapter readiness outputs and pre-analysis evidence gate decisions before any product-photo runtime, upload, or UI work.

Phase 2.5 is primarily the dev-only review harness phase. Planning confirms this is the safest next milestone: the adapter readiness boundary (Phase 2.4.1) and the pre-analysis evidence gate (Phase 2.4.10) now both produce stable, privacy-safe decision shapes that a reviewer benefits from seeing rendered, but neither should be wired into runtime to be reviewed. A display-only harness closes that gap without opening any live gate.

Phase 2.5 objective:
- Dev-only adapter/gate review-harness readiness.
- Synthetic-only evidence states rendered as static cases.
- No live upload, runtime, analyzer execution, or report mapping.
- No production support workflow and no customer-facing surface.
- No real customer evidence, photos, or metadata.

## 2. What Phase 2.5 Is Not

Phase 2.5 is explicitly not:
- Main UI polish or any change to the production app page/layout.
- Product-photo upload or any file input.
- `analyzeEvidenceFile` integration or any analyzer execution.
- `LocalAnalysisResult` or `types.ts` migration.
- Live report adapter mapping (`mapLocalAnalysisToReport`) changes.
- Provider, storage, integration, case queue, ticket, database, auth, or background-job work.
- Real photo or real metadata fixture support.
- Deployment.
- Wiring the adapter readiness boundary or the pre-analysis evidence gate into any live path.

## 3. Future Dev-Only Harness Scope

If Robert later explicitly opens implementation, the harness must:
- Display static, literal synthetic cases only.
- Be able to show adapter readiness outcomes (`ProductPhotoAdapterReadinessResult`-shaped) and pre-analysis evidence gate decisions (`PreAnalysisEvidenceGateDecision`-shaped).
- Show `readinessAccepted`, `inputKind`, `runtimeLive`, and `manualReviewOnly` for adapter cases.
- Show `outcome`, `allowReceiptDefaultPath`, `runtimeLive`, and `manualReviewOnly` for gate cases.
- Make unsupported, quarantine, product-photo-like-unsupported, and unknown-inconclusive states visually distinct from accepted/allow states.
- Keep score, confidence/readiness, review priority, local signal level, limitations, privacy flags, and isolation flags visually separate.
- Carry a visible non-live/dev-only banner stating no uploads, no evidence analysis, no customer-facing workflow, and external verification not performed.

The harness must not:
- Include upload controls, file inputs, drag-drop, media previews, or image elements.
- Call the live analyzer, OCR, metadata extraction, the adapter/gate as runtime, providers, storage, integrations, or case queues.
- Use route params, search params, browser storage, fetch, object URLs, image URLs, data URLs, files, or blobs.
- Be linked from `/`, `/test-evidence`, layout, or app navigation.
- Render in production by default (must guard with `process.env.NODE_ENV !== "production"` and `notFound()`).

Posture: prefer hand-authored literal synthetic case objects with type-only imports for the result/decision types. Do not value-import `prepareProductPhotoAdapterReadinessForDevOnlyBoundary` or `buildPreAnalysisEvidenceGateDecision` into a route/component, so a dev review surface can never be mistaken for runtime adapter/gate execution.

## 4. Synthetic Cases

The harness should show only literal synthetic cases. Required coverage:

Adapter readiness cases:
- Accepted product-photo analysis-result readiness.
- Accepted product-photo report-view-model readiness.
- Top-level legacy `damage-photo` quarantine.
- Nested analysis-result legacy `damage-photo` quarantine.
- Nested report-view-model legacy `damage-photo` quarantine.
- Top-level receipt/unknown/unsupported mismatch collapse (`readinessAccepted` false).
- Hostile override / private sentinel omission case.
- Missing or limited metadata bucket case.
- Manual-review-only output with `runtimeLive: false`.

Pre-analysis evidence gate cases:
- Receipt-like `allow-receipt-default-path`.
- PDF receipt-like `allow-receipt-default-path`.
- Order screenshot `allow-receipt-default-path`.
- Product-photo-like `product-photo-like-unsupported`.
- Legacy damage-photo `legacy-damage-photo-quarantine`.
- Unsupported evidence `unsupported-evidence`.
- Unknown `unknown-inconclusive`.
- Hostile override / private sentinel omission (raw filename never echoed).

Shared/layout cases:
- Long-text layout stress case.
- Manual-review-only / no-live marker case (`runtimeLive: false`, `manualReviewOnly: true` visibly present).

These are review fixtures for a dev display surface only. They are not real product-photo fixtures, not uploaded evidence, and not analyzer inputs.

## 5. Future Implementation Allowed Files

If Robert explicitly opens a Phase 2.5 implementation slice, allowed files should be limited to:
- A clearly isolated dev-only route, e.g. `src/app/dev/product-photo-readiness-review/page.tsx` (or separate `/dev/product-photo-adapter-readiness` and `/dev/pre-analysis-evidence-gate` routes).
- A clearly isolated dev-only render/case file, e.g. `src/app/dev/<route>/render-cases.ts`.
- A clearly isolated dev-only display component only if necessary, e.g. `src/components/DevReadinessReviewPanel.tsx`. Reuse of `ProductPhotoReviewPanel` is allowed only if a future prompt explicitly resolves duplicate-id/browser-QA concerns first.
- `scripts/check-report-semantics.mjs`, only to add harness semantic/import/privacy coverage.
- `scripts/run-product-photo-probes.cjs` or a harness probe, only if the future prompt explicitly asks for executable harness probes.
- Docs/status files: `PHASE_2_5_DEV_HARNESS_SCOPE_PLAN.md`, `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md`, `PHASE_2_PHOTO_EVIDENCE_PLAN.md`, `NEXT_STEPS.md`, `AGENT_LOG.md`, `ROADMAP.md`.

Any future file name must include dev-only / adapter-readiness / gate-review intent. Avoid names that imply live product-photo support.

## 6. Protected Files

These must remain unchanged for any Phase 2.5 harness implementation unless Robert explicitly opens a separate slice:
- `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/test-evidence/page.tsx`.
- `src/components/ClaimReviewWorkflow.tsx`, `src/components/UploadPanel.tsx`, `src/components/TestEvidenceHarness.tsx`.
- `src/components/ProductPhotoReviewPanel.tsx`, `src/components/ProductPhotoReviewPanel.probe.tsx`.
- `src/lib/analysis/analyzer.ts` (the live `analyzeEvidenceFile` entrypoint), `src/lib/analysis/analyzer-routing.ts`, `src/lib/analysis/analyzer-classifier.ts`.
- `src/lib/analysis/product-photo-routing-adapter.ts`, `src/lib/analysis/product-photo-adapter-readiness.probe.ts`, `src/lib/analysis/product-photo-analyzer.ts`, `src/lib/analysis/product-photo-report-view-model.ts`.
- `src/lib/analysis/pre-analysis-evidence-gate.ts`, `src/lib/analysis/pre-analysis-evidence-gate.probe.ts` (type-only imports allowed; no behavior change).
- `src/lib/analysis/report-adapter.ts`, `src/lib/analysis/scoring.ts`, `src/lib/analysis/receipt-parser.ts`, `src/lib/analysis/types.ts`.
- `src/lib/test-evidence/fixtures.ts` and receipt fixtures.
- Upload files and routes.
- Providers, storage, integrations, case queues, database, auth, and background-job files.
- Package scripts and dependencies, unless the future prompt explicitly opens test tooling.
- Production app page/layout, unless Robert later explicitly approves only a clearly isolated dev route (still unlinked).

## 7. Required Gates Before Any Phase 2.5 Implementation

- `npm.cmd run lint`.
- `npm.cmd run build`.
- `npm.cmd run check:report-semantics`.
- `npm.cmd run check:product-photo-probes` (must continue to pass; currently 11 modules).
- `git diff --check`.
- No-live import scans: deny `@/lib/analysis/analyzer`, `analyzer-routing`, `report-adapter`, `scoring`, `receipt-parser`, `@/lib/test-evidence`, `@/components/ClaimReviewWorkflow`, `@/components/TestEvidenceHarness`, upload components, providers/storage/integrations/case queues, `next/image`, and value imports of the adapter/gate builders.
- No upload/file-input scan: deny `<input type="file"`, file/blob/object-url/image-url/data-url, drag-drop handlers, `<img`, `createObjectURL`.
- No provider/storage/integration/case-queue scan.
- Unsafe wording scan (report-semantics corpus): no proof/verification/approval/rejection/confirmed-wrongdoing/automatic-disposition wording.
- Privacy/raw-marker scan: no raw EXIF, raw metadata, original filenames, raw label/serial values, exact dimensions, GPS, timestamps, customer/ticket/order/case/claim/evidence/provider/storage/integration IDs.
- Browser QA only if a rendered route/component is added (see `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md` Browser QA Criteria).
- Every new harness file must be covered by `scripts/check-report-semantics.mjs`. Missing semantic coverage for a new harness file is a stop condition.

## 8. Stop Conditions

Stop any future harness implementation if:
- Any live runtime import appears.
- Any upload control, file input, file/blob object, image preview, object URL, image URL, data URL, or fetch call appears.
- `analyzeEvidenceFile` is touched, imported, or called.
- `LocalAnalysisResult` or `types.ts` changes.
- `ClaimReviewWorkflow`, `UploadPanel`, `TestEvidenceHarness`, or the production app page/layout changes.
- Live report adapter mapping changes.
- Receipt parser, scoring, or fixture behavior changes unexpectedly.
- A real photo or real metadata fixture appears.
- Any provider, storage, integration, case queue, ticket, database, auth, or background-job path appears.
- Unsafe wording appears.
- `readinessAccepted`, `inputKind`, `outcome`, `runtimeLive: false`, or `manualReviewOnly: true` is hidden, ambiguous, or omitted where applicable.
- The harness needs route/search params, browser storage, external data, copied private JSON, or real identifiers.
- Required checks fail or cannot be interpreted safely.

## 9. Phase 2.5 Done Criteria

Phase 2.5 is done when:
- This docs-only scope plan is complete and committed (Phase 2.5.0).
- Any dev-only harness is implemented only if Robert explicitly opens that slice; otherwise Phase 2.5 can close as planning-complete.
- If implemented, the harness remains unlinked, production-disabled by default, and synthetic-only.
- If a route/component renders, browser QA passes (desktop + mobile, no overflow/overlap/clipping/duplicate ARIA IDs, visible non-live banner).
- All semantic/probe checks pass and `check:product-photo-probes` still imports its modules.
- No live runtime, upload, UI, or report-adapter behavior changed.
- No real evidence, photos, or metadata were introduced.
- A clear handoff exists before any Phase 2.6 or runtime-facing product-photo work.

## 10. Recommended Phase 2.5.1

Recommended next milestone: **Phase 2.5.1 — no-live dev-only review harness implementation, gate-first.**

Rationale: the `pre-analysis-evidence-gate` decision shape is the newest and most self-contained boundary (its contract is `@/`-free and pure), so a literal synthetic render-case file plus a production-disabled dev route is the smallest safe first rendered surface. The adapter-readiness harness can follow as Phase 2.5.2.

Phase 2.5.1 allowed files:
- `src/app/dev/pre-analysis-evidence-gate/page.tsx`.
- `src/app/dev/pre-analysis-evidence-gate/render-cases.ts` (type-only import of `PreAnalysisEvidenceGateDecision`; literal synthetic decisions only).
- `scripts/check-report-semantics.mjs`, only to add harness semantic/import/privacy coverage for the new files.
- `NEXT_STEPS.md`, `AGENT_LOG.md`, `PHASE_2_5_DEV_HARNESS_SCOPE_PLAN.md`.

Phase 2.5.1 protected files: all files in Section 6, plus all existing `src/lib/analysis/*.ts` behavior.

Phase 2.5.1 checks: lint, build, check:report-semantics, check:product-photo-probes, git diff --check, no-live/import/upload/provider/privacy/unsafe-wording scans, and browser QA for the new dev route.

Phase 2.5.1 stop conditions: all Section 8 stop conditions, plus any sign the gate decisions are produced at runtime in the route rather than authored as literal synthetic cases.

Alternative Phase 2.5.1 (if Robert prefers a pause): a review-only closeout confirming the harness scope and deferring rendered implementation. Either path keeps product-photo runtime, upload, UI, report mapping, providers, storage, integrations, case queues, and deployment blocked.
