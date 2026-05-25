# ClaimGuard Next Steps

This file is the near-term operational queue. Keep it short, current, and actionable.

Use `ROADMAP.md` for durable product roadmap, future modules, and phase definitions.

## Current Checkpoint

- Phase 1 Receipt Intelligence is closed, pushed, deployed, and production-smoked.
- Post-Phase-1 evidence workspace polish is live from commit `19ef25e`.
- Phase 2.0 scaffold work is closed.
- Phase 2.1 Product Photo Local Heuristic Design is reviewed and closed for the current planning slice.
- Phase 2.2 helper implementation has started as small, local-only, manual-review-support-only, intentionally unwired helper work.
- The first two Phase 2.2 helper commits are done and pushed:
  - `44d09f0` added unwired product-photo signal builders.
  - `50f8284` added unwired product-photo file summary, review completeness, and local review signal helpers.
- Shared evidence model types, product-photo scaffold/defaults, signal builders, and summary helpers exist.
- No product-photo analyzer behavior is live yet.
- No runtime analyzer, upload, UI, report, scoring, parser, metadata extraction, or fixture behavior changed during Phase 2.0, Phase 2.1, or the first two Phase 2.2 helper commits.
- `product-photo` is canonical.
- `damage-photo` remains only a compatibility alias to `product-photo` / `damage-close-up`.

## Next Safe Tasks

1. Review the current Phase 2.2 helper-only state before adding any more product-photo code.
2. Add developer-only tests or probes for the unwired product-photo helper functions using synthetic metadata/review objects, if Robert opens that slice.
3. Keep image-consistency uncertainty dormant until a future explicitly opened provider, validated local-metrics, and QA-evidence slice.
4. Confirm the product-photo helpers remain unwired from runtime analyzer, upload, UI, report, scoring, parser, metadata extraction, and fixture behavior.
5. Keep the shipped receipt module stable unless Robert explicitly requests maintenance.
6. Preserve a clean operational queue after each completed agent task.

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
- Do not add live product damage photo analysis.
- Do not modify app UI.
- Do not modify upload/input/reset behavior.
- Do not modify analyzer, parser, scoring, report, privacy, or fixture logic.
- Do not connect real AI, OCR, ticket, email, drive, database, auth, Vercel, or payment systems.
- Do not change package dependencies.
- Do not deploy unless Robert explicitly asks.

## Current Recommended Next Prompt

```text
/claimguardagent review the current Phase 2.2 product-photo helper-only state and, if safe, add developer-only synthetic tests/probes for the unwired helpers; do not make runtime, UI, upload, analyzer, scoring, parser, report, metadata extraction, or fixture changes
```
