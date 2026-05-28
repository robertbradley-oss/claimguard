# Product-Photo Adapter Readiness Plan

This is the Phase 2.4 guarded non-live adapter readiness plan.

Phase 2.3 analyzer hardening is closed. Product-photo analyzer, result, report view-model, display, visual host, semantic guard, and executable probes remain non-live and unwired. `analyzeEvidenceFile` remains the live receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, and receipt behavior remains unchanged.

Phase 2.4.1 implementation note: the first guarded non-live adapter readiness boundary now exists inside `src/lib/analysis/product-photo-routing-adapter.ts` as `prepareProductPhotoAdapterReadinessForDevOnlyBoundary`, with active probe coverage in `src/lib/analysis/product-photo-adapter-readiness.probe.ts`. It remains dev/probe-only and does not open live product-photo routing.

Phase 2.4.2 is complete, review-only, and clean. Phase 2.4.3 is a docs-only dev-only adapter review harness plan in `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md`; it does not implement a harness, route, component, runtime adapter execution, upload path, live report mapping, provider, storage, integration, case queue, real photo, or real metadata fixture.

## 1. Phase 2.4 Objective

Phase 2.4 prepares a future non-live adapter contract before any adapter implementation.

The objective is to define how a future product-photo adapter can prove readiness without becoming live routing, upload handling, UI insertion, live report mapping, provider work, storage, integrations, case queues, real-photo support, or real metadata fixture work.

Phase 2.4 must preserve these rules:

- Product-photo remains non-live and manual-review-only.
- `product-photo` remains the canonical Phase 2 evidence type.
- Existing receipt analysis remains the active runtime path.
- Future adapter work must be probe/dev-only until a separate runtime slice is explicitly opened.
- A future adapter must support review readiness, not evidence truth, customer intent, policy disposition, or final claim outcome.

## 2. Safest Next Milestone

The safest next non-live milestone is Phase 2.4.1: add a probe-only product-photo adapter contract boundary that consumes sanitized product-photo readiness data and returns an adapter-readiness summary.

Phase 2.4.1 should not route files, call analyzers from the live app, render UI, change report mapping, or migrate receipt result types. It should only prove the future adapter contract can:

- Accept sanitized `ProductPhotoEvidenceAnalysisResult` or `ProductPhotoReportViewModel` shaped data.
- Preserve non-live boundary flags.
- Preserve manual-review-only wording.
- Prove receipt behavior is untouched through import and signature checks.
- Prove raw/private-bearing data and provider/storage/integration/case handles cannot cross the adapter boundary.

If any implementation detail requires live file routing, upload state, `ClaimReviewWorkflow`, `mapLocalAnalysisToReport`, `LocalAnalysisResult`, receipt scoring/parser/fixtures, providers, storage, integrations, case queues, real photos, or real metadata fixtures, Phase 2.4.1 must stop and return to docs-only planning.

## 3. Future Adapter Contract Boundaries

A future non-live adapter may accept only sanitized, local, product-photo-specific input:

- `ProductPhotoEvidenceAnalysisResult`, after analyzer canonicalization.
- `ProductPhotoReportViewModel`, after report-view-model canonicalization.
- Synthetic/probe-only adapter context such as boundary name, readiness gate name, and probe scenario label.
- Bucketed metadata summaries only, with omission flags already true.
- Canonical product-photo subject type, damage visibility, product context, requested additional views, quality level, metadata context, review priority, confidence, and local signal level.

A future non-live adapter must derive or canonicalize:

- Score and score scope.
- Confidence.
- Review priority.
- Local signal level.
- Source kind.
- Review label/status.
- Evidence summary.
- Recommended support action.
- Customer-safe wording.
- Limitations.
- Review signals and finding groups.
- External-verification status.
- Privacy posture.
- Non-live boundary flags.

A future non-live adapter must never accept or output:

- `File`, `Blob`, object URL, image URL, data URL, image bytes, image buffer, retained image fingerprint, or preview ownership.
- Raw EXIF, raw metadata objects, original filenames, precise timestamps, raw GPS coordinates, device owner fields, device serial fields, or raw editing-software values.
- Raw serial/model/label/barcode/QR values.
- Customer names, addresses, emails, phone numbers, order IDs, ticket IDs, evidence IDs, case IDs, provider IDs, storage IDs, integration IDs, or case queue IDs.
- Provider payload, provider handle, storage handle, integration handle, case queue handle, or case workflow handle.
- Caller-provided score, confidence, review priority, local signal level, source kind, summary, support action, customer wording, limitation, or signal text without canonicalization.
- Final decision, policy disposition, claim outcome, customer intent, automatic handling, or evidence-truth fields.
- `LocalAnalysisResult`, `MockAnalysisReport`, receipt OCR/parser fields, receipt score breakdowns, or receipt report adapter output.

The contract must avoid receipt-shaped assumptions:

- Do not require OCR fields, parsed receipt fields, receipt source classification, receipt score breakdown, receipt finding groups, receipt report types, or receipt fixture expectations.
- Do not force product-photo readiness into `LocalAnalysisResult`.
- Do not import or call `mapLocalAnalysisToReport`.
- Do not import or call `analyzeEvidenceFile`.
- Keep product-photo adapter output separate from receipt runtime output.

## 4. Scoring And Safety Contract

The adapter must preserve these meanings:

- Score means local product-photo evidence quality and review readiness only.
- Confidence means completeness/readiness for local review, not likelihood of truth or fraud.
- Review priority means triage attention only, not a support outcome.
- Local signal level summarizes local review signals only.
- Source kind must collapse to safe non-live values such as synthetic fixture or manual-review context.
- Evidence summary must state local review context and external verification not performed.
- Recommended support action must remain manual-review support and request only the minimum useful additional context.
- Customer-safe wording must ask neutrally for clearer/wider evidence or purchase matching when needed.
- Limitations must include local-only analysis, external verification not performed, high score not proof, and metadata context only.
- Signals must remain review-support signals with severity and confidence labels; they must not become proof, accusation, or final outcome language.

Unsafe wording gates must reject:

- Customer accusation or intent language.
- Confirmed wrongdoing language.
- Proof or authenticity claims.
- External verification claims beyond not performed.
- Automatic outcome, automatic decision, automatic disposition, approval, rejection, denial, or policy-disposition language.
- High-score language that implies the product photo, claim, or evidence is proven.
- Image-origin conclusions unless a future authorized provider/local-model slice defines validated evidence and QA gates.

All product-photo findings must remain manual-review-only. A future adapter may say `Review recommended` or `Manual review recommended`; it must not say the claim is complete, cleared, rejected, denied, valid, invalid, true, false, genuine, or not genuine.

## 5. Legacy `damage-photo` Quarantine

`damage-photo` is a receipt-era/mock compatibility alias only. It is not the canonical Phase 2 product-photo runtime type.

Before any future adapter implementation:

- The adapter contract must accept canonical `product-photo` only.
- If legacy `damage-photo` appears in a probe, it must appear only as a quarantine scenario that maps to a guarded compatibility note, not as adapter input for live runtime.
- Canonical analyzer and report-view-model files must continue to exclude `damage-photo`.
- Future adapter probes must prove `damage-photo` is not treated as canonical runtime support.
- Future live routing must handle legacy `damage-photo` quarantine in a separate authorized slice before product-photo runtime support.

The quarantine expectation is:

- Existing receipt-era/mock paths can still contain `damage-photo` until a separate cleanup or migration is opened.
- New product-photo adapter/readiness files must use `product-photo`.
- Any reference to `damage-photo` in new probes must be explicitly labeled compatibility/quarantine-only.
- No future adapter should make live behavior decisions from `damage-photo`.

## 6. Semantic And Probe Gates

Before any adapter contract implementation, these gates must be in place or extended during the same implementation slice:

- `npm.cmd run check:report-semantics`.
- `npm.cmd run check:product-photo-probes`.
- Adapter-specific probe import through `scripts/run-product-photo-probes.cjs`, if a new probe module is added.
- Semantic guard coverage for the new adapter file and probe file.
- Protected import scans proving no `analyzeEvidenceFile`, analyzer routing live call, upload module, `ClaimReviewWorkflow`, live report adapter mapping, receipt scoring, receipt parser, receipt fixtures, provider, storage, integration, or case queue import.
- Shape probes proving adapter output does not require `LocalAnalysisResult`, receipt OCR/parser fields, or receipt report types.
- Safety probes proving score, confidence, review priority, local signal level, source kind, summary, support action, customer wording, limitations, and signals are derived or canonicalized.
- Privacy probes proving raw photo bytes, image buffers, URLs, raw EXIF, raw metadata, original filenames, raw labels, precise timestamps, GPS coordinates, provider output, storage handles, integration handles, and case queue handles are absent.
- Legacy alias probes proving `damage-photo` is compatibility/quarantine-only and not canonical adapter runtime input.
- Receipt preservation probes proving `mapLocalAnalysisToReport(result: LocalAnalysisResult)` remains receipt-only and `ClaimReviewWorkflow` remains on the existing receipt analyzer/report path.

Missing semantic coverage for any new adapter/readiness file is a stop condition.

## 7. Blocked Live Gates

Phase 2.4 and Phase 2.4.1 must not touch or implement:

- `analyzeEvidenceFile`.
- Upload routing or upload mechanics.
- `ClaimReviewWorkflow` insertion.
- Live report adapter mapping.
- `LocalAnalysisResult` migration.
- Receipt parser behavior.
- Receipt scoring behavior.
- Receipt fixtures.
- `/test-evidence` product-photo behavior.
- Providers or external AI/OCR/vision calls.
- Storage, integrations, case queues, ticket systems, databases, auth, or background jobs.
- Real product photos.
- Real metadata fixtures.
- Product-photo runtime routing.
- Product-photo UI insertion in the active workflow.

These gates remain blocked even if an adapter contract probe passes.

## 8. Allowed Future Implementation Files

Likely allowed files for Phase 2.4.1, if the implementation prompt explicitly opens it:

- `src/lib/analysis/product-photo-adapter-readiness.ts` or another narrowly named non-live adapter contract module.
- `src/lib/analysis/product-photo-adapter-readiness.probe.ts`.
- `scripts/run-product-photo-probes.cjs`, only to register the new probe.
- `scripts/check-report-semantics.mjs`, only to guard the new adapter/probe files.
- `NEXT_STEPS.md`.
- `PHASE_2_PHOTO_EVIDENCE_PLAN.md`.
- `PRODUCT_PHOTO_ADAPTER_READINESS_PLAN.md`.
- `AGENT_LOG.md`.

Any future file name should make the non-live intent obvious. Avoid names that imply live routing, upload handling, report mapping, workflow insertion, or provider execution.

## 9. Protected Future Implementation Files

Protected files for Phase 2.4.1:

- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/analyzer-routing.ts`, unless the future prompt explicitly opens a decision-only probe update and still blocks adapter invocation.
- `src/lib/analysis/report-adapter.ts`.
- `src/lib/analysis/types.ts`, unless a tiny additive type is explicitly authorized and no receipt shape changes.
- `src/lib/analysis/scoring.ts`.
- `src/lib/analysis/receipt-parser.ts`.
- `src/lib/test-evidence/fixtures.ts`.
- `src/lib/test-evidence/tuning-thresholds.ts`.
- `src/components/ClaimReviewWorkflow.tsx`.
- `src/components/TestEvidenceHarness.tsx`.
- `src/components/ProductPhotoReviewPanel.tsx`, unless the future prompt explicitly opens display contract changes.
- Upload components and active app route files.
- Provider, storage, integration, case queue, auth, database, and background job files.

If any protected file changes unexpectedly, stop and report before continuing.

## 10. Pass/Fail Criteria For Phase 2.4.1

Pass criteria:

- New adapter boundary is dev/probe-only and reports `runtimeLive: false`.
- Product-photo output remains manual-review-only.
- Adapter output uses canonical `product-photo` and quarantines `damage-photo`.
- Score, confidence, review priority, local signal level, source kind, summary, support action, customer wording, limitations, and signals are derived or canonicalized.
- Adapter output omits raw/private-bearing fields and handles.
- `LocalAnalysisResult` remains receipt-shaped and unchanged.
- `analyzeEvidenceFile` remains untouched and uncalled by product-photo adapter code.
- Receipt report adapter signature remains `mapLocalAnalysisToReport(result: LocalAnalysisResult)`.
- `ClaimReviewWorkflow`, upload, UI, live report mapping, receipt scoring/parser/fixtures, providers, storage, integrations, and case queues remain untouched.
- Required checks pass: lint, build, report semantics, product-photo probes, diff check, and targeted boundary scans.

Fail criteria:

- The adapter needs live file routing, upload state, UI insertion, or live report mapping.
- The adapter consumes raw file/photo/metadata/label values or provider/storage/integration/case handles.
- The adapter accepts caller overrides for readiness fields without derivation/canonicalization.
- The adapter references `LocalAnalysisResult`, receipt parser/OCR fields, receipt score breakdown, or receipt report types as required product-photo input.
- `damage-photo` becomes canonical runtime input.
- Any wording implies proof, external verification, customer wrongdoing, final outcome, automatic handling, approval, rejection, denial, or policy disposition.
- Required semantic/probe coverage is missing or a check fails.

## 11. Recommended Phase 2.4.1 Slice

Recommended next slice:

Implement a no-live adapter contract/probe boundary only if Robert explicitly opens implementation. The slice should create a product-photo adapter readiness module and probe that prove the contract is safe, non-live, canonical, privacy-safe, and receipt-preserving.

Do not use Phase 2.4.1 to route product photos through the app. Do not use it to display product-photo results in the live workflow. Do not migrate receipt results. Do not connect providers or store evidence.

Suggested Phase 2.4.1 prompt:

```text
/claimguardagent implement the Phase 2.4.1 guarded non-live product-photo adapter contract/probe only: create a probe/dev-only adapter readiness boundary that accepts sanitized product-photo result or report-view-model data, derives/canonicalizes score, confidence, review priority, local signal level, source kind, summary, support action, customer wording, limitations, and signals, quarantines legacy damage-photo as compatibility-only, and proves no LocalAnalysisResult, analyzeEvidenceFile, upload, ClaimReviewWorkflow, live report adapter, receipt scoring/parser/fixtures, providers, storage, integrations, case queues, real photos, or real metadata fixtures are touched; add semantic/probe coverage; run lint, build, report-semantics, product-photo-probes, diff check, and boundary scans; commit if safe; do not push
```

## 12. Phase 2.4.3 Dev Harness Planning Gate

The Phase 2.4.3 dev harness planning gate is intentionally separate from the adapter boundary implementation.

A future dev-only adapter review harness may display only literal synthetic adapter-readiness cases. It must not call `prepareProductPhotoAdapterReadinessForDevOnlyBoundary` from a route or component, because route-level adapter execution could blur a developer review surface into runtime adapter behavior. At most, future render cases may use type-only imports for the adapter readiness output shape.

The complete harness plan lives in `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md` and defines:

- Safe purpose and non-live scope.
- Synthetic readiness cases.
- Fields that may display.
- Hard blocked inputs, imports, and live gates.
- Semantic/probe requirements.
- Browser QA criteria.
- Stop conditions.
- Exact future allowed and protected files.

Phase 2.4.4 should remain docs-only and focus on adapter readiness closeout plus next-runtime-blockers planning, especially the legacy live receipt-era `damage-photo` classification path that must be quarantined or migrated before any live product-photo runtime support.
