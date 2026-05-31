# Phase 2.7.4 Live Opt-In Readiness Checkpoint

This is a docs-only Phase 2.7.4 planning checkpoint. It does not implement, wire, route, enable, render, commit, push, or deploy anything.

Phase 2.7.3 is closed and pushed at `0d90260` (`docs: close phase 2.7.3 mapper probe`). Product-photo runtime remains non-live. The default-off `analyzeEvidenceFileWithPreAnalysisGate` wrapper remains unwired from live callers. The unsupported-evidence mapper/probe exists, but unsupported evidence is not visible in the app and no live opt-in has started.

## Planning Question

After the non-live unsupported-evidence mapper/probe, the next readiness question is:

```text
Where could a future default-off live opt-in safely happen without changing receipt analyzer semantics, receipt report mapping, or unsupported-evidence display rules?
```

## Decision

The safest next live-opt-in readiness step is a workflow/caller boundary design checkpoint.

Recommended next slice:

- Phase 2.7.5 docs-only workflow/caller boundary opt-in design.

Not recommended as the next step:

- Dev-only harness view: useful later for browser and visual QA, but premature before the live caller boundary and unsupported display ownership are settled.
- Non-live report-adapter shape probe: unsafe as the next step because unsupported evidence is not a receipt report and should not be pulled toward `mapLocalAnalysisToReport`.
- Feature-flag/default-off opt-in plan: important later, but premature until the caller boundary, rollback behavior, and unsupported state handling are written down.
- Pause: safe if Robert wants to stop here, but if continuing, the caller boundary design is the next narrow planning move.

## Opt-In Boundary Decision

Future live opt-in should happen at the workflow/caller boundary, not inside `analyzeEvidenceFile`.

Why:

- `analyzeEvidenceFile` should remain the receipt analyzer body.
- `LocalAnalysisResult` should remain receipt-shaped for now.
- Receipt allow paths should continue through the existing receipt analyzer and receipt report adapter.
- Unsupported outcomes should remain separate from receipt reports.
- A caller boundary can make the unsupported branch explicit without migrating receipt types or report mapping.

Likely future caller to study, without editing it in this phase:

- `ClaimReviewWorkflow`, where live receipt analysis currently calls `analyzeEvidenceFile(selectedFile)` and then maps the receipt-shaped result through the live receipt report flow.

Rejected first opt-in locations:

- Inside `analyzeEvidenceFile`, because it would pressure unsupported outcomes into `LocalAnalysisResult`.
- Inside the live report adapter, because unsupported evidence is not a receipt report.
- Inside `ProductPhotoReviewPanel`, because unsupported evidence is a stop state, not a product-photo analysis result.
- Inside upload mechanics, because upload should not own analysis result semantics.

## Result Shape Decision

`LocalAnalysisResult` must remain unchanged and receipt-shaped for now.

Unsupported evidence must not be added to:

- `LocalAnalysisResult`
- receipt score fields
- receipt parser fields
- receipt report adapter fields
- product-photo report view models
- `ProductPhotoReviewPanel`

Any future caller opt-in should treat the wrapper result as a boundary union outside the receipt result:

- receipt allow path: existing receipt `LocalAnalysisResult`
- unsupported stop path: derived unsupported-evidence review state

That future union must not be made live until Robert explicitly approves an implementation slice and the required gates below are met.

## Unsupported Output Decision

Unsupported-evidence output should remain separate from receipt reports.

It may use the existing non-live `unsupportedEvidenceReview` derived state as the display contract source, but it must not be mapped through the live receipt report adapter. It must also remain separate from product-photo report output and from `ProductPhotoReviewPanel`.

Allowed future meaning:

- The automated receipt analyzer did not run for this stopped file.
- Manual review is recommended.
- An eligible receipt document may be requested if available.
- External verification was not performed.
- No receipt score, product-photo analysis, OCR, metadata processing, provider call, storage write, integration call, or case-queue action ran for the stopped file.

Forbidden future meaning:

- The evidence is true or false.
- The customer did something wrong.
- The claim should be approved, rejected, denied, or automatically dispositioned.
- A product-photo report was produced.
- A receipt score or proof-of-purchase result was produced.

## Next Implementation Posture

No implementation is authorized by this checkpoint.

If Robert later approves implementation, the next implementation should be a caller-boundary guard probe or default-off caller-boundary guard slice, not a dev-only harness and not a report-adapter shape probe.

The implementation should still avoid live UI until the caller behavior and unsupported state handling are explicit. A dev-only harness can follow after the caller-boundary design if browser/manual QA needs a rendered synthetic unsupported state. A feature-flag/default-off plan can follow once the exact caller substitution, rollback path, and protected files are accepted.

## Conditions Before Any Live Runtime Or UI Opt-In

All of these must be true before any live UI or runtime opt-in:

- Robert explicitly approves the implementation slice and names allowed/protected files.
- The opt-in is placed at the workflow/caller boundary, not inside `analyzeEvidenceFile`.
- `analyzeEvidenceFile` remains unchanged.
- `LocalAnalysisResult` remains unchanged and receipt-shaped.
- Existing receipt image, PDF receipt, screenshot/default, report, parser, scoring, fixture, upload, and `/test-evidence` behavior are preserved.
- Unsupported outcomes are handled outside `mapLocalAnalysisToReport`.
- Unsupported outcomes are not routed to `ProductPhotoReviewPanel`.
- Unsupported outcomes do not display receipt scores, product-photo scores, proof-of-purchase status, risk bands, parser fields, or product-photo report fields.
- Non-allow outcomes stop before OCR, metadata processing, analyzer calls, live report mapping, upload/report/scoring/parser/fixture paths, providers, storage, integrations, case queues, and deployment/release config.
- Semantic/privacy coverage includes every new unsupported display, adapter, caller, or guard file.
- Rollback behavior is documented before a live caller is changed.
- Browser/manual QA steps exist before any rendered unsupported state is added.

## Browser And Manual QA Required Before UI-Facing Unsupported State

Browser QA is not required for this docs-only checkpoint.

Before any future UI-facing unsupported state, run browser/manual QA for:

- `/` still loads the existing receipt workflow.
- Receipt upload and completed receipt report still behave as before.
- Unsupported/manual-review status is visible only when the approved unsupported state is intentionally rendered.
- `External Verification: Not performed` and `Verification Status: Not externally verified` are visible.
- No receipt score, receipt score breakdown, proof-of-purchase status, product-photo report, or product-photo panel appears for unsupported evidence.
- No image preview, file preview, object URL, data URL, raw OCR, raw metadata, filename, path, customer/order/ticket/claim/evidence ID, provider payload, storage handle, integration handle, or case queue handle is displayed.
- Desktop and mobile views have no console errors, text overlap, clipped labels, or confusing scroll behavior.
- Any dev-only route is unlinked, synthetic-only, production-disabled, and not `/test-evidence`.

Manual QA must use synthetic or structurally redacted data only. Do not add real evidence files or screenshots.

## Forbidden Wording

Future runtime, UI, docs, probes, and QA artifacts must not use wording that implies:

- fraud is confirmed
- wrongdoing is confirmed
- the customer is lying
- evidence is fake, forged, verified, valid, invalid, genuine, approved, rejected, denied, or automatically denied
- local analysis proves truth
- external verification happened
- unsupported evidence passed or failed proof of purchase
- a final claim outcome or support policy disposition has been made
- a receipt score or product-photo report exists for unsupported evidence

Allowed wording should stay close to:

- `Manual review recommended`
- `Manual review only`
- `Unsupported for automated receipt analysis`
- `Evidence type inconclusive`
- `External Verification: Not performed`
- `Verification Status: Not externally verified`
- `No receipt score was produced for this file`
- `No product-photo analysis was performed`
- `This state is not a claim decision`

## Protected Surfaces

These remain protected during Phase 2.7.4 and any later planning until Robert explicitly opens a named implementation exception:

- `analyzeEvidenceFile`
- `LocalAnalysisResult`
- `ClaimReviewWorkflow`
- upload flow
- live report adapter mapping
- `ProductPhotoReviewPanel` routing
- receipt parser
- scoring
- fixtures
- providers
- storage
- integrations
- case queues
- OCR/metadata processing
- deployment/release config

Also protected:

- `src/app/page.tsx`
- `src/app/test-evidence/`
- `src/components/UploadPanel.tsx`
- `src/lib/analysis/report-adapter.ts`
- `src/lib/analysis/receipt-parser.ts`
- `src/lib/analysis/scoring.ts`
- `src/lib/test-evidence/`
- package scripts/dependencies unless a future probe registration is explicitly opened

## Checks For This Docs-Only Checkpoint

Required:

- `git status --short --branch`
- `git diff --check`
- `npm.cmd run check:report-semantics`
- protected code diff scan confirming no runtime/UI/code files changed

Do not run browser checks for this checkpoint because no UI is changed.

## Stop Conditions

Stop any future task if:

- runtime, UI, upload, report mapping, parser, scoring, fixtures, provider, storage, integration, case queue, OCR/metadata, or deployment files change without explicit approval
- the wrapper is wired into a live caller without a completed caller-boundary plan and rollback path
- unsupported evidence is forced into `LocalAnalysisResult` or receipt report mapping
- unsupported evidence is routed to `ProductPhotoReviewPanel`
- product-photo runtime becomes live
- receipt behavior changes
- real evidence, raw OCR, raw metadata, private identifiers, paths, filenames, screenshots, provider payloads, storage handles, integration handles, or case workflow identifiers are added
- required checks fail or cannot be interpreted safely

## Phase 2.7.4 Decision

Phase 2.7.4 remains docs-only. The next safest readiness step is a workflow/caller boundary design checkpoint. Live opt-in should remain blocked until Robert explicitly approves a later implementation slice with allowed files, rollback behavior, semantic/privacy coverage, receipt-preservation probes, and browser/manual QA requirements for any UI-facing unsupported state.

Recommended next safe task:

```text
/claimguardagent create a docs-only Phase 2.7.5 workflow/caller boundary opt-in design for the default-off pre-analysis gate wrapper; decide exact future allowed/protected files, receipt-preservation probes, unsupported-state handling outside LocalAnalysisResult and live report mapping, rollback path, and browser/manual QA gates; do not implement runtime, wire ClaimReviewWorkflow, add unsupported-evidence UI, route ProductPhotoReviewPanel, change upload/report/parser/scoring/fixtures, commit, push, or deploy unless explicitly approved
```
