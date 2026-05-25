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
- Shared evidence model types, product-photo scaffold/defaults, signal builders, summary/completeness helpers, compile probes, an exported-only analyzer builder, analyzer and routing-adapter probes, a dev-only recognition boundary, a dev-only routing adapter, a dev-only analyzer routing guard, and an optional file-aware routing boundary exist.
- The recognition boundary is isolated and dev-only. `recognizeProductPhotoEvidence` is not called by `analyzeEvidenceFile`.
- The routing adapter composes the recognition boundary and product-photo analyzer builder only inside an isolated dev-only module.
- The routing adapter returns its own adapter-specific result, not `LocalAnalysisResult`.
- The routing adapter is imported only by `product-photo-routing-adapter.probe.ts`.
- The routing adapter is not called by `analyzeEvidenceFile`.
- The analyzer routing guard is isolated and dev-only. It does not call the product-photo routing adapter, and product-photo candidates remain guarded as an unsupported live path.
- The optional file-aware routing boundary uses synthetic file-like context only, keeps runtime routing disabled by default, and is not called by the live UI or upload flow.
- Product-photo runtime analyzer behavior is still not live.
- `analyzeEvidenceFile` remains the live receipt analyzer entrypoint and still protects the shipped receipt pipeline.
- `LocalAnalysisResult` remains unchanged and receipt-path shaped.
- No runtime analyzer routing, upload, UI, report, scoring, parser, metadata extraction, or fixture behavior changed during Phase 2.0, Phase 2.1, or Phase 2.2 helper/boundary work.
- Runtime routing remains blocked until Robert explicitly opens that slice.
- `product-photo` is canonical.
- `damage-photo` remains only a compatibility alias to `product-photo` / `damage-close-up`.

## Next Safe Tasks

1. Add a dev-only receipt-path preservation/status probe for `analyzer-routing` before any live wiring.
2. Plan any live analyzer integration in a separate planning prompt before implementation.
3. Keep the dev-only routing adapter out of `analyzeEvidenceFile` until Robert explicitly opens a runtime-routing slice.
4. Keep `recognizeProductPhotoEvidence` out of `analyzeEvidenceFile` until Robert explicitly opens a runtime-routing slice.
5. Keep the analyzer routing guard and optional file-aware boundary out of the live UI/upload flow until a separate live-routing plan is explicitly opened.
6. Keep `LocalAnalysisResult` receipt-path shaped until a separate shared-result migration slice is planned.
7. Keep image-consistency uncertainty dormant until a future explicitly opened provider, validated local-metrics, and QA-evidence slice.
8. Confirm the product-photo helpers, analyzer builder, probes, recognition boundary, routing adapter, analyzer routing guard, and optional file-aware boundary remain unwired from runtime analyzer, upload, UI, report, scoring, parser, metadata extraction, and fixture behavior.
9. Keep the shipped receipt module stable unless Robert explicitly requests maintenance.
10. Preserve a clean operational queue after each completed agent task.

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
/claimguardagent implement a dev-only receipt-path preservation/status probe for analyzer-routing; do not implement live wiring; do not call the routing adapter or recognizeProductPhotoEvidence from analyzeEvidenceFile; do not change LocalAnalysisResult, upload, UI, scoring, report mapping, parser behavior, fixtures, providers, storage, integrations, or case queues
```
