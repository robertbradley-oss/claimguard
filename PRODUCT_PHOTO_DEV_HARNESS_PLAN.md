# Product-Photo Dev-Only Adapter Review Harness Plan

This is the Phase 2.4.3 docs-only plan for a possible future adapter review harness.

Phase 2.4.2 is complete and review-only. Product-photo runtime remains non-live. `runtimeLive` remains false, `manualReviewOnly` remains true, `analyzeEvidenceFile` remains the live receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, and receipt behavior remains unchanged.

This plan does not implement a harness, route, component, adapter execution path, upload path, report mapping, provider, storage, integration, case queue, fixture, or deployment.

## Purpose

A dev-only adapter review harness would exist only to inspect already-derived product-photo adapter readiness outputs in a static, synthetic developer surface.

The harness should help reviewers inspect:

- `readinessAccepted`.
- `inputKind`.
- `runtimeLive`.
- `manualReviewOnly`.
- Isolation and privacy flags.
- Unsupported and quarantine outcomes.
- Score, confidence, review priority, and local signal level as separate concepts.
- Whether customer-safe wording stays neutral and manual-review-only.

The harness must not be a customer-facing workflow, support decisioning surface, live evidence review surface, analyzer runner, upload experience, or product-photo production support signal.

## Required Posture

The safest future harness posture is display-only with literal synthetic adapter-readiness cases. It should not call `prepareProductPhotoAdapterReadinessForDevOnlyBoundary` from a route or component, because route-level adapter execution could make a dev review surface look like runtime adapter behavior.

If a rendered harness is later approved, its cases should be hand-authored objects satisfying the readiness display shape. At most, a render-cases file may use type-only imports for the adapter readiness result type. No value import from `src/lib/analysis/product-photo-routing-adapter.ts` should be used in the rendered harness.

The route name, file names, and visible copy must make the boundary obvious. A suitable route would be `/dev/product-photo-adapter-readiness`, with visible copy such as "Synthetic non-live developer adapter readiness review." The route must be unlinked from the app, production-disabled by default, and visually impossible to confuse with customer support workflow.

## Synthetic Readiness Cases

A future harness should show only literal synthetic cases:

- Canonical accepted product-photo analysis-result readiness.
- Canonical accepted product-photo report-view-model readiness.
- Unsupported receipt-like input collapse.
- Top-level legacy `damage-photo` quarantine.
- Nested analysis-result legacy `damage-photo` quarantine.
- Nested report-view-model legacy `damage-photo` quarantine.
- Top-level receipt, unknown, unsupported, and unsupported mismatch collapse.
- Hostile override or sentinel omission case.
- Missing or limited metadata bucket case.
- Manual-review-only output with `runtimeLive: false`.
- Adapter refused-readiness case where `readinessAccepted` is false.
- No-signal or empty-signal case.
- Long-text stress case for layout review.

These cases are review fixtures for a dev display surface only. They are not real product-photo fixtures, not uploaded evidence, and not analyzer inputs.

## Fields To Display

A future harness should display derived, privacy-safe fields only:

- `readinessAccepted`.
- `inputKind`.
- `evidenceType`.
- `runtimeLive`.
- `manualReviewOnly`.
- `sourceKind`.
- Confidence or readiness label.
- Review priority.
- Local signal level.
- Quarantine or unsupported reason.
- Privacy and isolation flags.
- Limitations.
- Recommended support action.
- Customer-safe wording.
- Probe/status marker.

The harness must never display raw metadata, raw identifiers, raw label values, exact dimensions, precise timestamps, GPS coordinates, filenames, object URLs, image URLs, image bytes, provider payloads, storage handles, integration handles, case queue handles, customer identifiers, ticket data, order data, or case data.

## Hard Blocked Inputs

The future harness must never accept:

- Uploaded files.
- Real photos.
- Real metadata fixtures.
- EXIF or raw metadata.
- Filenames.
- Object URLs, image URLs, data URLs, image bytes, or image buffers.
- Provider outputs.
- Storage handles.
- Integration handles.
- Case queue handles.
- Customer identifiers.
- Ticket, order, claim, evidence, or customer data.

No browser storage, route params, search params, fetch calls, or file inputs should be involved.

## Hard Blocked Imports And Paths

A future rendered harness must not import or call:

- `analyzeEvidenceFile`.
- Live analyzer routing.
- Upload files or upload components.
- `ClaimReviewWorkflow`.
- `TestEvidenceHarness`.
- Live report adapter mapping.
- `LocalAnalysisResult`.
- Receipt parser, scoring, or fixtures.
- Providers, storage, integrations, case queues, databases, auth, or background jobs.
- `ProductPhotoReviewPanel` unless a separate prompt explicitly chooses to reuse it for display and resolves duplicate-id/browser QA concerns first.
- Production app page or layout files, unless Robert later explicitly approves only a clearly isolated dev route link.

Blocked import paths include:

- `@/lib/analysis/analyzer`.
- `@/lib/analysis/analyzer-routing`.
- `@/lib/analysis/product-photo-analyzer`.
- `@/lib/analysis/product-photo-routing-adapter` as a value import.
- `@/lib/analysis/report-adapter`.
- `@/lib/analysis/scoring`.
- `@/lib/analysis/receipt-parser`.
- `@/lib/test-evidence`.
- `@/components/ClaimReviewWorkflow`.
- `@/components/TestEvidenceHarness`.
- Upload components.
- Provider, storage, integration, or case queue modules.
- `next/image`.

## Blocked Live Gates

The following gates must stay closed:

- Product-photo runtime routing.
- Upload routing.
- `analyzeEvidenceFile` product-photo support.
- `ClaimReviewWorkflow` product-photo insertion.
- Live report adapter mapping.
- `LocalAnalysisResult` migration.
- Receipt parser, scoring, and fixture changes.
- Providers or external AI/OCR/vision calls.
- Storage, integrations, case queues, ticket systems, databases, auth, background jobs, or deployment.
- Real-photo or real-metadata support.

The legacy live receipt-era `damage-photo` filename classification path remains a pre-runtime blocker. It must be quarantined or migrated in a separate authorized slice before any live product-photo runtime support can be considered. The adapter readiness quarantine does not by itself clean up that legacy live receipt-shaped path.

## Semantic And Probe Requirements

Before or during any future harness implementation:

- `npm.cmd run check:report-semantics` must guard every new harness file.
- `npm.cmd run check:product-photo-probes` must continue to pass with the existing imported modules.
- Harness-specific semantic markers must prove the route is dev-only, synthetic-only, production-disabled by default, and unlinked from live workflow.
- No-live-import checks must deny analyzer, analyzer routing, upload, report adapter, scoring, parser, fixture, provider, storage, integration, and case queue imports.
- Static checks must deny raw/private markers, URL/path patterns, realistic identifiers, raw metadata fields, filenames, object URL fields, file/blob references, fetch/browser-storage usage, unsafe outcome wording, and spread of raw result or metadata objects.
- If implementation adds a harness-specific executable probe, it must be registered intentionally; do not assume the existing `check:product-photo-probes` runner executes component or route probes.
- Hostile score-bearing view-model cases must not make the harness imply strong readiness. They should either render as refused/collapsed readiness or be clearly labeled as hostile/sentinel-omission cases.
- Verify no real evidence, raw private markers, customer identifiers, filenames, order numbers, ticket IDs, case IDs, provider IDs, storage IDs, integration IDs, or case queue IDs appear in harness cases.

Missing semantic coverage for a new harness file is a stop condition.

## Browser QA Criteria

If a rendered dev surface is later implemented, browser QA must verify:

- The route is dev-only, unlinked, and production-disabled by default.
- A clear non-live/dev-only banner is visible.
- The banner states no uploads, no evidence analysis, no customer-facing workflow, and external verification was not performed.
- No upload controls, file inputs, media preview controls, image elements, object URLs, or real photos appear.
- No network, provider, storage, integration, or case queue calls occur.
- `readinessAccepted` and `inputKind` are visible.
- `runtimeLive: false` and `manualReviewOnly: true` are visible.
- Quarantine and unsupported states are visually distinct from accepted readiness.
- Score, confidence/readiness, review priority, local signal level, limitations, privacy flags, and isolation flags remain visually separate.
- No customer-safe copy implies approval, rejection, verification, confirmed wrongdoing, final outcome, policy disposition, or proof.
- Desktop and mobile layouts have no horizontal overflow, clipped labels, text overlap, or primary nested scrolling.
- Duplicate ARIA IDs are absent when rendering multiple cases.
- `/`, `/test-evidence`, and app navigation remain unlinked to the harness.

Browser screenshots, if captured, must include only synthetic harness content and must not capture real evidence, uploaded previews, object URLs, browser storage state, filenames, or metadata.

## Stop Conditions

Stop any future harness implementation if:

- Any live import appears.
- Any upload control, file input, file/blob object, image preview, object URL, image URL, data URL, or fetch call appears.
- Any real photo or real metadata fixture is proposed.
- Any provider, storage, integration, case queue, ticket, database, auth, or background-job path appears.
- `LocalAnalysisResult`, `analyzeEvidenceFile`, live report adapter mapping, receipt parser, receipt scoring, receipt fixtures, upload files, or live workflow files need changes.
- Product-photo becomes visible in the customer-facing workflow.
- Unsafe wording appears.
- `readinessAccepted`, `inputKind`, `runtimeLive: false`, or `manualReviewOnly: true` is hidden, ambiguous, or omitted.
- The harness needs route/search params, browser storage, external data, copied private JSON, or real identifiers.
- Required checks fail or cannot be interpreted safely.

## Future Allowed Files

If Robert explicitly opens a future implementation slice, the exact allowed implementation files should be limited to:

- `src/app/dev/product-photo-adapter-readiness/page.tsx`.
- `src/app/dev/product-photo-adapter-readiness/render-cases.ts`.
- `scripts/check-report-semantics.mjs`, only to add harness semantic/privacy/import coverage.
- `src/app/dev/product-photo-adapter-readiness/product-photo-adapter-readiness-harness.probe.ts`, only if the future prompt explicitly asks for executable harness probes.
- `NEXT_STEPS.md`.
- `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md`.
- `PRODUCT_PHOTO_ADAPTER_READINESS_PLAN.md`.
- `PHASE_2_PHOTO_EVIDENCE_PLAN.md`.
- `AGENT_LOG.md`.

Any future file name must include dev-only or adapter-readiness intent. Avoid names that imply live product-photo support.

## Protected Files

The following files must remain protected for any future harness implementation unless Robert explicitly opens a separate slice:

- `src/app/page.tsx`.
- `src/app/layout.tsx`.
- `src/app/test-evidence/page.tsx`.
- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/TestEvidenceHarness.tsx`.
- `src/components/ProductPhotoReviewPanel.tsx`.
- `src/components/ProductPhotoReviewPanel.probe.tsx`.
- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/analyzer-routing.ts`.
- `src/lib/analysis/product-photo-routing-adapter.ts`.
- `src/lib/analysis/product-photo-adapter-readiness.probe.ts`.
- `src/lib/analysis/product-photo-analyzer.ts`.
- `src/lib/analysis/product-photo-report-view-model.ts`.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/types.ts`.
- `src/lib/analysis/scoring.ts`.
- `src/lib/analysis/receipt-parser.ts`.
- `src/lib/test-evidence/fixtures.ts`.
- Upload files.
- Package scripts and dependencies unless the future prompt explicitly opens test tooling.
- Provider, storage, integration, case queue, database, auth, and background-job files.

## Phase 2.4.4 Recommendation

Phase 2.4.4 is docs-only: adapter readiness closeout and next-runtime-blockers planning. The closeout and blocker inventory live in `PRODUCT_PHOTO_RUNTIME_BLOCKERS_PLAN.md`.

The Phase 2.4.4 task should:

- Reconcile Phase 2.4 status after the 2.4.1 implementation and patch stack.
- Record Phase 2.4.2 as complete, review-only, and clean.
- Record Phase 2.4.3 as this docs-only dev harness plan.
- Identify pre-runtime blockers, especially the legacy live receipt-era `damage-photo` classification path.
- Decide whether the next safe task is another docs-only closeout or a narrowly scoped quarantine/migration plan.
- Keep all live product-photo routing, upload, UI, report adapter, `LocalAnalysisResult`, receipt behavior, providers, storage, integrations, case queues, and deployment blocked.

Phase 2.4.4 decision:

- Adapter readiness planning is complete enough to close the non-live checkpoint.
- The dev-only harness remains planned only and unimplemented.
- The next safest milestone is Phase 2.4.5 docs-only legacy `damage-photo` quarantine/migration planning.
