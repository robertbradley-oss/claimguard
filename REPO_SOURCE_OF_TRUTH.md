# ClaimGuard Repo Source Of Truth

Use `C:\Users\robby\Projects\ClaimGuard` as the active ClaimGuard source-of-truth repo.

Do not make ClaimGuard code, fixture, package, or documentation edits in `C:\Users\robby\OneDrive\Documents\GitHub\claimguard`. That OneDrive checkout is an outdated duplicate and should be treated as read-only reference material unless Robert explicitly says otherwise.

The OneDrive Documents path may exist as a shell starting point, but it is not the active Git working tree.

## Branch And Release Discipline

- Check `git status --short --branch` before and after work.
- Preserve unrelated user changes.
- Do not commit, push, deploy, rewrite history, or change repo visibility unless Robert explicitly asks.
- Do not stage `.env*`, `.vercel/`, `.next/`, `node_modules/`, real customer evidence, raw OCR from private evidence, private JSON exports, screenshots containing private details, or credentials.
- Keep release notes clear about whether work was docs/config-only, app behavior, analyzer logic, UI, QA, or deployment.

## Phase-Aware Workflow

- Phase 1 Receipt Intelligence is closed, deployed, and production-smoked.
- Phase 2 Photo Evidence remains planning/readiness-only/non-live. Phase 2.6 is closed after pushed commit `6f3170a` (`fix: tighten unsupported evidence wording guards`).
- Phase 2.4 adapter-readiness and runtime-blocker planning is complete.
- A guarded, non-live product-photo adapter contract exists and is pushed.
- A pre-analysis evidence gate exists and is pushed, but remains decision-only and unwired. A default-off pre-analysis gate runtime wrapper/probe also exists and is pushed, but remains unwired from live callers.
- Product-photo runtime remains non-live; no product-photo analyzer behavior is live yet.
- `analyzeEvidenceFile` remains the live receipt analyzer entrypoint.
- `LocalAnalysisResult` remains unchanged and receipt-shaped.
- Receipt behavior remains unchanged.
- UI, upload, live report adapter mapping, scoring, parser, and fixtures remain untouched by product-photo runtime.
- No providers, storage, integrations, case queues, real photos, or real metadata fixtures were added.
- `product-photo` is canonical.
- `damage-photo` remains legacy/non-canonical and only a compatibility alias to `product-photo` / `damage-close-up`.
- Dev-only adapter/gate harness work is closed as Phase 2.5 and remains no-live, synthetic-only, unlinked, and production-disabled.
- Phase 2.6 closed with product-photo runtime non-live, `analyzeEvidenceFile` unchanged, `LocalAnalysisResult` unchanged, receipt behavior unchanged, UI/upload/live report adapter mapping/scoring/parser/fixtures untouched, no ProductPhotoReviewPanel routing added by `6f3170a`, no providers/storage/integrations/case queues, no OCR/metadata processing, and no deployment.
- Phase 2.7.0 is docs-only planning for live-opt-in readiness of the default-off wrapper and unsupported-evidence reviewer state. It does not authorize implementation.
- Phase 2.7.1 is docs-only planning for the unsupported-evidence reviewer state contract. It defines the future stop-state name, neutral labels/copy, support action wording, confidence/uncertainty rules, what must not be shown, receipt-preservation gates, future QA/browser requirements, protected surfaces, and implementation stop conditions.
- Phase 2.7.2 is docs-only planning for a future non-live unsupported-evidence display/mapping probe. It recommends an executable pure mapper/probe before any rendered UI, and keeps unsupported evidence out of receipt scores, proof-of-purchase wording, product-photo reports, ProductPhotoReviewPanel, and live runtime paths.
- Phase 2.7.3 is closed and pushed at `0d90260` (`docs: close phase 2.7.3 mapper probe`). It adds and closes that pure non-live unsupported-evidence display/mapping probe in `src/lib/analysis/unsupported-evidence-review-state.ts` with active coverage in `src/lib/analysis/unsupported-evidence-review-state.probe.ts`, `scripts/run-product-photo-probes.cjs`, and `scripts/check-report-semantics.mjs`. It remains isolated from live runtime, rendered UI, upload, report mapping, ProductPhotoReviewPanel, parser/scoring/fixtures, providers/storage/integrations/case queues, OCR/metadata, `analyzeEvidenceFile`, and `LocalAnalysisResult`.
- Phase 2.7.4 is docs-only planning in `PHASE_2_7_4_LIVE_OPT_IN_READINESS_CHECKPOINT.md`. It decides the next safest readiness step is workflow/caller boundary design, with future opt-in at the caller boundary rather than inside `analyzeEvidenceFile`; `LocalAnalysisResult` remains receipt-shaped; unsupported-evidence output stays separate from receipt reports and ProductPhotoReviewPanel; and dev-only harness, report-adapter shape probe, and feature-flag/default-off opt-in planning are not the next step.
- Phase 2.7.5 is docs-only planning in `PHASE_2_7_5_WORKFLOW_CALLER_BOUNDARY_OPT_IN_DESIGN.md`. It decides the future default-off opt-in should be owned by the `ClaimReviewWorkflow` run-analysis boundary or a small workflow-local helper used only from that boundary. It keeps `analyzeEvidenceFile` receipt-only, `LocalAnalysisResult` receipt-shaped, unsupported-evidence output outside receipt reports and ProductPhotoReviewPanel, and mapper use limited to derived-state mapping outside live receipt analysis.
- Phase 2.7.7 is closed and pushed at `32d013b` (`feat: add workflow boundary probe for unsupported evidence`). It adds the probe-only workflow/caller boundary helper and probe, keeps the helper default-off and outside live callers, does not call `analyzeEvidenceFile` or `mapLocalAnalysisToReport`, does not produce or migrate `LocalAnalysisResult`, does not route `ProductPhotoReviewPanel`, and adds no rendered UI.
- Phase 2.7.8 is docs-only source-of-truth alignment after `32d013b`; it should only update status docs, next-work guidance, and release/phase truth. It must not change runtime code, UI, upload flow, analyzer/parser/scoring/report/fixture behavior, providers/storage/integrations/case queues, OCR/metadata, package/deploy config, or receipt behavior.
- Phase 2.8.0 is docs-only acceleration planning in `PHASE_2_8_0_UNSUPPORTED_EVIDENCE_DEV_BRIDGE_PLAN.md`. It chooses a separate unlinked, production-disabled dev-only story/probe route as the safest future bridge for unsupported-evidence review visibility, not `/test-evidence`, not live `ClaimReviewWorkflow`, not live UI, and not `ProductPhotoReviewPanel`.
- The next safest move is review and, if approved, commit the docs-only Phase 2.8.0 plan. Do not wire the wrapper into live callers or change runtime/UI/upload/report behavior without explicit approval.
- Phase 2.9 must not start until Phase 2.8 defines or proves the dev-only/user-visible bridge.
- Do not start product-photo runtime, UI/upload wiring, analyzer routing, live report mapping, provider, storage, integration, or case-queue work until Robert explicitly opens that slice.
- Future-phase planning is allowed when requested.
- Future-phase implementation requires explicit approval from Robert.
- Use `ROADMAP.md` for durable phase definitions.
- Use `NEXT_STEPS.md` for the immediate working queue.
- Use `AGENTS.md` and `ROUTING.md` to select the correct agent role before work.

## Pre-Change Review Checklist

Before editing:

- Confirm you are in `C:\Users\robby\Projects\ClaimGuard`.
- Confirm the selected agent and phase boundary.
- Identify whether the task touches docs/config, UI, analyzer/parser/scoring/report/privacy logic, fixtures, dependencies, or release/deploy workflow.
- Confirm private evidence is not being introduced.

## Stop And Report Conditions

Stop and report before continuing when:

- The active path is not `C:\Users\robby\Projects\ClaimGuard`.
- Work appears to be in a OneDrive duplicate or outdated checkout.
- Dirty mixed work makes the current task scope unclear.
- Unexpected app-code, analyzer, parser, scoring, report, privacy, fixture, package, script, or upload-mechanics diffs appear.
- Real customer evidence, private customer data, raw OCR, copied private JSON, or credentials appear in files or logs.
- Unsafe wrongdoing-confirming language, customer-accusation language, or automatic-denial language appears.
- Product-photo runtime behavior, UI/upload wiring, analyzer routing, live report mapping, scoring/report/parser/fixture changes, or provider/storage/integration/case-queue work appears before Robert explicitly opens that runtime slice.
- A required check fails or cannot run.

## Check Guidance

Docs/config-only:

- `git diff --check`
- `npm.cmd run check:report-semantics` when safety wording might matter

Analyzer/parser/scoring/report/privacy/fixture changes:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:report-semantics`
- Targeted synthetic fixture or manual QA checks

UI changes:

- `npm.cmd run lint`
- `npm.cmd run build`
- Browser check affected routes when practical

Release/deploy work:

- `git status --short --branch` before and after
- Confirm exact branch and commit
- Run relevant checks for changed areas
- Perform or document production smoke only when deploy is explicitly requested

## Source Safety

Committed fixtures must be synthetic or structurally redacted. Real customer receipts, photos, ticket content, order details, customer messages, and copied private JSON must not be committed.

Preserve ClaimGuard semantics: evidence scores measure local evidence quality and internal consistency, not externally confirmed truth.
