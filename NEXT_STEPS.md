# ClaimGuard Next Steps

This file is the near-term operational queue. Keep it short, current, and actionable.

Use `ROADMAP.md` for durable product roadmap, future modules, and phase definitions.

## Current Checkpoint

- Phase 1 Receipt Intelligence is closed, pushed, deployed, and production-smoked.
- Post-Phase-1 evidence workspace polish is live from commit `19ef25e`.
- Phase 2.0 scaffold work is closed.
- Phase 2.1 Product Photo Local Heuristic Design is reviewed and closed for the current planning slice.
- Phase 2.2 helper implementation has started as small, local-only, manual-review-support-only, intentionally unwired helper work.
- Current pushed Phase 2.2 work includes:
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
- Probe sample data is synthetic and records no file bytes, image buffers, raw EXIF objects, provider handles, storage handles, integration handles, or case queue handles.
- No runtime analyzer routing, upload, UI, report, scoring, parser, metadata extraction, or fixture behavior changed during Phase 2.0, Phase 2.1, or Phase 2.2 helper/boundary work.
- Runtime routing remains blocked until Robert explicitly opens that slice.
- `product-photo` is canonical.
- `damage-photo` remains only a compatibility alias to `product-photo` / `damage-close-up`.

## Next Safe Tasks

1. Keep the first product-photo display work probe-only and unwired; do not add a standalone display component or live UI insertion until a separate prompt explicitly opens that slice.
2. Keep the decision-only public analyzer routing wrapper out of live UI/upload/report/scoring/parser paths until a separate live-routing plan is explicitly opened.
3. Keep the dev-only routing adapter out of `analyzeEvidenceFile` until Robert explicitly opens a runtime-routing slice.
4. Keep `recognizeProductPhotoEvidence` out of `analyzeEvidenceFile` until Robert explicitly opens a runtime-routing slice.
5. Keep the analyzer routing guard and optional file-aware boundary out of the live UI/upload flow until a separate live-routing plan is explicitly opened.
6. Keep `LocalAnalysisResult` receipt-path shaped until a separate shared-result migration slice is explicitly opened.
7. Keep image-consistency uncertainty dormant until a future explicitly opened provider, validated local-metrics, and QA-evidence slice.
8. Keep the product-photo helpers, analyzer builder, probes, recognition boundary, routing adapter, analyzer routing guard, optional file-aware boundary, preservation probe, and public wrapper unwired from runtime analyzer, upload, UI, report, scoring, parser, metadata extraction, and fixture behavior.
9. Keep the shipped receipt module stable unless Robert explicitly requests maintenance.
10. Preserve a clean operational queue after each completed agent task.

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
/claimguardagent implement the first isolated product-photo UI display probe slice only: add a standalone product-photo display component and required probes that consume ProductPhotoReportViewModel only; do not edit ClaimReviewWorkflow.tsx, upload routing, analyzeEvidenceFile, analyzer-routing live behavior, report-adapter.ts, LocalAnalysisResult, receipt behavior, scoring, parser behavior, fixtures, providers, storage, integrations, or case queues; expand semantic checks only for the new display surface; run lint, build, report semantics, and diff check; commit only if safe; do not push
```
