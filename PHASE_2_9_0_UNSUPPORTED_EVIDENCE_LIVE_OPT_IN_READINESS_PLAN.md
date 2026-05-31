# Phase 2.9.0 Unsupported Evidence Live Opt-In Readiness Plan

This is a docs-only Phase 2.9.0 planning checkpoint. It does not implement runtime behavior, wire live callers, add UI, add routes, edit upload/report/parser/scoring/fixtures, start Phase 3 implementation, commit, push, deploy, or change receipt behavior.

Current pushed checkpoint: `75a4981` (`docs: close phase 2.8 dev bridge`). Phase 2.8.2 is closed. The dev-only unsupported-evidence review bridge exists at `/dev/unsupported-evidence-review`, remains unlinked and production-blocked with `notFound()` / 404 under `next start`, and uses literal synthetic cases only. Product-photo and unsupported-evidence runtime remain non-live. The pre-analysis wrapper remains default-off and unwired. The workflow boundary helper remains probe-only, default-off, and unwired. `ClaimReviewWorkflow` remains the live receipt workflow. Unsupported-evidence live UI does not exist. Receipt behavior is unchanged. No deployment was performed.

## Planning Questions

- Is unsupported evidence ready for any live opt-in implementation work yet?
- If not, what blocks it?
- If yes later, what is the narrowest safe live-opt-in path?
- What must remain dev-only, probe-only, or protected?
- What browser/manual QA, semantic/privacy checks, and source-of-truth updates must exist before live UI?
- What should Phase 3 inherit from Phase 2?
- Can Phase 2 close after this planning checkpoint, or does it need one final closeout?

## Decision

Unsupported evidence is not ready for live opt-in implementation yet.

Phase 2.9.0 should close the planning question, not open runtime work. The safest next step after this document is a review-only Phase 2.9.1 / Phase 2 closeout checkpoint. If that closeout passes, Phase 2 can close as a non-live readiness phase. If the closeout finds stale source-of-truth wording, missing guard coverage, or overbroad future-runtime claims, fix those docs first before closing Phase 2.

No additional Phase 2 planning checkpoint is needed unless the review-only closeout finds a blocker. Live unsupported-evidence runtime, live UI insertion, product-photo runtime, providers, storage, integrations, and case workflow belong to later explicitly opened implementation phases.

## Current Readiness Answer

Unsupported evidence is ready for planning-only handoff, not live opt-in work.

What is ready:

- A decision-only pre-analysis evidence gate exists.
- A default-off pre-analysis wrapper exists and remains unwired.
- A probe-only workflow boundary helper exists and remains default-off/unwired.
- A non-live unsupported-evidence mapper/probe exists.
- A dev-only, browser-checkable unsupported-evidence review bridge exists with literal synthetic cases.
- Semantic/import/privacy guards cover the dev bridge, mapper, workflow boundary helper, and protected live files.
- Browser closeout verified the dev bridge renders in development, is unlinked from `/`, contains no file/image inputs, contains no forbidden visible wording, and returns 404 under production `next start`.

What is not ready:

- Unsupported evidence is not wired into `ClaimReviewWorkflow`.
- No live unsupported-evidence UI exists.
- `LocalAnalysisResult` remains receipt-shaped.
- `analyzeEvidenceFile` remains receipt-only.
- `ProductPhotoReviewPanel` remains unrouted.
- No real product-photo analysis exists.
- No OCR, metadata, image analysis, provider, storage, integration, or case queue path exists for unsupported evidence.
- No case-review workflow, audit history, or case persistence exists.

These are intentional blockers, not defects.

## Live Opt-In Blockers

Live opt-in must remain blocked until all of the following are deliberately resolved in later approved phases:

- A future live caller boundary is explicitly opened by Robert.
- The product decision is clear about whether unsupported evidence is a local stop state, a case workflow state, or both.
- A workflow state model exists that can hold receipt-completed and unsupported-stopped branches without changing `LocalAnalysisResult`.
- A live UI surface is designed for unsupported stop states without using receipt reports or `ProductPhotoReviewPanel`.
- Browser/manual QA proves the default-off receipt path is unchanged and the enabled unsupported state is safe.
- Semantic/privacy checks cover any new live workflow, display, export/copy, and navigation surfaces.
- Source-of-truth docs are updated before implementation to name the exact files, protected surfaces, checks, and rollback/disable posture.
- Phase 3 case workflow requirements are clear enough to avoid building unsupported evidence into a temporary UI that later conflicts with case audit/history needs.

## Narrowest Safe Future Live Opt-In Path

If Robert later opens live opt-in work, the narrowest safe path is a default-off workflow/caller boundary slice.

The future slice should:

- Keep `analyzeEvidenceFile` receipt-only and unchanged.
- Keep `LocalAnalysisResult` receipt-shaped.
- Keep `mapLocalAnalysisToReport(result: LocalAnalysisResult)` receipt-only.
- Add a workflow-local branch around the `ClaimReviewWorkflow` run-analysis path, or a tiny workflow-local helper used only from that path.
- Keep the guard default-off.
- When disabled, follow the current receipt path exactly.
- When explicitly enabled for QA, route receipt allow outcomes through the existing receipt path.
- When explicitly enabled for QA, route unsupported outcomes into a separate unsupported-stopped workflow branch.
- Derive unsupported display state from already sanitized outcome/context only.
- Avoid receipt reports, receipt scores, parser fields, product-photo reports, `ProductPhotoReviewPanel`, raw OCR, raw metadata, filenames, IDs, object URLs, providers, storage, integrations, and case queues.

The future slice should not be a deployment-default behavior. It should be a local/default-off implementation with explicit browser/manual QA before any release decision.

## What Remains Dev-Only

The following must remain dev-only:

- `/dev/unsupported-evidence-review`.
- Literal synthetic unsupported-evidence render cases.
- Browser visual QA surfaces for unsupported stopped states.
- Any screenshots or browser artifacts, unless explicitly approved and privacy-reviewed.
- Synthetic bridge wording/layout stress cases.

The dev bridge should not become app navigation, `/test-evidence`, live reviewer UI, report output, export/copy output, or a production-accessible QA surface without a separate approved plan.

## What Remains Probe-Only

The following must remain probe-only or non-live until a named implementation slice opens them:

- `workflow-pre-analysis-gate-boundary`.
- Unsupported-evidence mapper usage as live workflow state derivation.
- Product-photo analyzer/readiness boundaries.
- Product-photo report view model and `ProductPhotoReviewPanel` routing.
- Pre-analysis wrapper opt-in from live callers.
- Any product-photo or unsupported-evidence runtime guard behavior.

Probe-only artifacts may inform a future implementation plan, but should not be imported into live app paths by accident.

## Protected Surfaces

Protected until a future prompt explicitly opens a named slice:

- `analyzeEvidenceFile`.
- `LocalAnalysisResult` and receipt-shaped result types.
- Live report adapter mapping.
- `ClaimReviewWorkflow` live run-analysis path.
- `ProductPhotoReviewPanel` routing.
- Upload flow and upload/reset mechanics.
- Parser.
- Scoring.
- Fixtures.
- Providers, storage, integrations, and case queues.
- OCR and metadata processing.
- Deployment config and package/config/public files.
- Live navigation and `/test-evidence`.
- Receipt behavior and receipt report/export behavior.

Any diff touching these during Phase 2.9.0 is a stop condition.

## Browser And Manual QA Required Before Live UI

Before any future live UI or workflow insertion is accepted, QA must prove:

- Default-off behavior is visually and behaviorally indistinguishable from the current receipt workflow.
- Receipt image/PDF/screenshot/default allow paths still upload, analyze, report, and copy/export as before.
- Unsupported state appears only with the approved guard explicitly enabled for QA.
- Unsupported state is visibly manual-review-only.
- Unsupported state says external verification was not performed and not externally verified.
- No receipt score, authenticity score, proof-of-purchase status, product-photo report, `ProductPhotoReviewPanel`, final claim outcome, approval/rejection/denial, or automatic disposition appears.
- No file preview, image preview, object URL, data URL, raw OCR, raw EXIF, raw metadata, original filename, path, customer/order/ticket/claim/evidence ID, provider payload, storage handle, integration handle, or case queue handle appears.
- Desktop and mobile layouts have no console errors, text overlap, clipped labels, horizontal overflow, confusing nested scroll, or color-only state semantics.
- `/` remains the live receipt workflow.
- `/test-evidence` remains receipt QA unless a separate approved task changes it.
- Production behavior is explicitly verified before release if any production-reachable route or branch is added.

Manual QA must use synthetic or structurally redacted data only.

## Semantic And Privacy Checks Required Before Live UI

Before live UI or live caller work, semantic/privacy coverage must prove:

- New live workflow or display files are included in `scripts/check-report-semantics.mjs`.
- The guard is default-off.
- Unsupported evidence is not stored in `LocalAnalysisResult`.
- Unsupported evidence is not passed to `mapLocalAnalysisToReport`.
- Unsupported evidence is not routed to `ProductPhotoReviewPanel`.
- Receipt score, authenticity score, proof-of-purchase, product-photo report, fraud confirmation, fake/forged/manipulated accusation, customer accusation, approval/rejection/denial, automatic refund/deny decision, and final claim outcome wording are denied.
- Raw OCR, raw metadata, filenames, paths, IDs, file/blob/object/data URLs, provider payloads, storage handles, integration handles, and case queue handles are denied.
- Live app files do not link to dev-only routes.
- `/test-evidence` does not become the unsupported-evidence live bridge.
- Import scans prove protected layers are not crossed.
- Product-photo probes continue to pass.

If a new executable probe is added, it must be registered with the relevant runner before the slice can close.

## Source-Of-Truth Updates Required Before Live Work

Before any future live opt-in implementation, update source-of-truth docs to include:

- Exact phase number and scope.
- Exact allowed files.
- Exact protected files.
- Default-off guard and rollback/disable posture.
- Browser/manual QA steps.
- Semantic/privacy guard additions.
- Receipt behavior preservation criteria.
- Product-photo runtime status.
- Whether the work is local QA only, production-reachable, or deployment-bound.
- Whether Phase 3 case workflow dependencies are still deferred.

Minimum docs to inspect and likely update:

- `NEXT_STEPS.md`.
- `REPO_SOURCE_OF_TRUTH.md`.
- `ROADMAP.md`.
- `AGENT_LOG.md`.
- A phase-specific implementation plan document.

Agent/routing docs should be updated only if phase boundaries or operating rules change.

## What Phase 3 Should Inherit

Phase 3 should inherit these Phase 2 decisions:

- Unsupported evidence is a stopped/manual-review state, not a receipt report.
- Unsupported evidence should stay outside `LocalAnalysisResult`.
- Receipt reports and receipt scores are not carriers for unsupported outcomes.
- Product-photo review panels are not generic unsupported-evidence panels.
- External verification remains not performed unless a real approved integration performs it.
- Review states must be customer-safe, non-accusatory, and manual-review-only.
- Case workflow should own future audit/history, reviewer notes, status lifecycle, persistence, and escalation.
- Any future case record should store derived, privacy-safe review summaries only unless a separate privacy/data-retention plan approves more.
- Real evidence, raw OCR, raw metadata, filenames, and identifiers need explicit retention and audit rules before leaving browser-local handling.

## Phase 2 Closeout Recommendation

Phase 2.9.1 review-only closeout passed after this Phase 2.9.0 plan was reviewed, committed, and pushed. Phase 2 is closed as non-live unsupported/product-photo readiness.

The final closeout confirmed:

- `main` was clean and synced at `095fd18`.
- Phase 2 remains non-live.
- Dev-only routes remain unlinked and production-blocked, including `/dev/unsupported-evidence-review` returning 404 under `next start`.
- `ClaimReviewWorkflow` remains unwired.
- Unsupported-evidence live UI does not exist.
- `ProductPhotoReviewPanel` remains unrouted.
- `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt report mapping, upload, parser, scoring, fixtures, providers/storage/integrations/case queues, OCR/metadata, and receipt behavior are unchanged.
- Semantic/privacy checks, product-photo probes, build, protected-path scans, and dev/prod bridge verification passed.
- No deployment occurred.
- Phase 3 has not started and may begin only as planning-only case workflow readiness unless Robert explicitly opens implementation.

No further Phase 2 planning checkpoint is needed before moving to Phase 3.0 planning-only case workflow readiness.

## Stop Conditions

Stop any future implementation if:

- Live runtime work starts without explicit approval.
- `ClaimReviewWorkflow` is wired before a named implementation slice.
- `analyzeEvidenceFile` changes.
- `LocalAnalysisResult` changes.
- Unsupported evidence enters receipt reports.
- ProductPhotoReviewPanel is routed for unsupported evidence.
- Upload, parser, scoring, fixtures, OCR/metadata, providers, storage, integrations, case queues, package/config/public/deployment files, or live navigation change unexpectedly.
- Real evidence, raw OCR, raw metadata, filenames, paths, IDs, object URLs, provider payloads, storage handles, integration handles, screenshots, or case workflow identifiers appear.
- Wording implies proof, external verification happened, customer wrongdoing, fake/forged/manipulated evidence, approval, rejection, denial, automatic disposition, or final claim outcome.
- Required checks fail or cannot be interpreted safely.

## Recommended Next Task

After Phase 2.9.1 closeout, run Phase 3.0 planning-only case workflow readiness.

Recommended planning prompt:

```text
/claimguardagent run Phase 3.0 planning-only case workflow readiness after Phase 2 closed as non-live unsupported/product-photo readiness; define case review states, audit/history needs, reviewer actions, privacy/retention boundaries, and handoff requirements; do not implement Phase 3 code, wire ClaimReviewWorkflow, add live unsupported-evidence UI, route ProductPhotoReviewPanel, change upload/report/parser/scoring/fixtures, change receipt behavior, connect providers/storage/integrations/case queues/OCR/metadata, deploy, or push
```
