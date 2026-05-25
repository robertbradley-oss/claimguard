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
- `analyzer-routing` remains unwired from live UI, upload, report, scoring, and parser paths.
- Product-photo runtime analyzer behavior is still not live.
- `analyzeEvidenceFile` remains the live receipt analyzer entrypoint and still protects the shipped receipt pipeline.
- `LocalAnalysisResult` remains unchanged and receipt-path shaped.
- The shared-result and product-photo result probes confirm product-photo shared results do not require receipt-only OCR/parser/result fields and keep external verification as not performed / not externally verified.
- Probe-only isolation assertions now explicitly record that the product-photo shared-result boundary does not invoke `analyzeEvidenceFile`, analyzer routing, UI, upload, report mapping, scoring, parser, fixtures, providers, storage, integrations, or case queues.
- Probe sample data is synthetic and records no file bytes, image buffers, raw EXIF objects, provider handles, storage handles, integration handles, or case queue handles.
- No runtime analyzer routing, upload, UI, report, scoring, parser, metadata extraction, or fixture behavior changed during Phase 2.0, Phase 2.1, or Phase 2.2 helper/boundary work.
- Runtime routing remains blocked until Robert explicitly opens that slice.
- `product-photo` is canonical.
- `damage-photo` remains only a compatibility alias to `product-photo` / `damage-close-up`.

## Next Safe Tasks

1. Plan any live analyzer integration in a separate planning prompt before implementation.
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

This is a docs-only integration plan. It records the safest future path for analyzer routing without opening runtime behavior, wiring product-photo analysis into the UI, or changing the shipped receipt analyzer path.

Staged order:

1. Complete this docs-only live-routing integration plan and keep `routeAnalyzerEvidenceInput` decision-only and unwired.
2. Expand probe coverage for the planned contract before any runtime wiring is attempted.
3. Refine type-only/shared-result boundaries only if the staged plan requires a result model that can safely represent receipts and product photos without forcing one into the other's shape.
4. Add probe coverage that proves the non-live product-photo shared-result boundary stays unwired from live analyzer/UI/upload/report/scoring/parser paths.
5. Add a guarded internal route-to-adapter path that is still not callable by UI/upload/report/scoring/parser paths.
6. Seek separate approval for live analyzer/UI/upload integration only after the result shape, report mapping, probes, and safety wording are ready.

Live-use conditions before any future integration:

- Receipt files must preserve current `LocalAnalysisResult` behavior, including the existing `analyzeEvidenceFile` live receipt entrypoint.
- Product-photo results must not be forced into receipt-shaped `LocalAnalysisResult` without a planned shared result model.
- `src/lib/analysis/report-adapter.ts` must support product-photo-safe mapping before any product-photo result can be displayed in the UI.
- UI language must stay manual-review-only and must not imply proof, customer wrongdoing, or automatic denial.
- Product-photo analysis must remain local-heuristics-only, provider-ready, and not externally verified unless a future authorized provider slice explicitly changes that.
- No real photos, real metadata fixtures, providers, storage, integrations, or case queues are part of this staged path.
- The product-photo runtime flag remains guarded until Robert explicitly opens it.

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
/claimguardagent plan the next live analyzer-routing integration slice as docs-only: define guardrails, prerequisites, and checks for any future runtime wiring; do not implement live routing, UI/upload changes, report mapping, scoring, parser behavior, fixtures, providers, storage, integrations, or case queues
```
