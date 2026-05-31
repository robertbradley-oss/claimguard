# Phase 4.7 OCR Route Safety Readiness Checkpoint

Date: 2026-05-31

Primary agent role: Architecture & Maintainability Agent

Supporting reviews: Product Strategy, Receipt Intelligence, Integration Readiness, Scoring/Safety, Privacy, QA, Deployment

## Checkpoint Scope

Phase 4.7 is a review-only safety/readiness checkpoint for the Phase 4.6 synthetic OCR route skeleton. The only implementation change made during the checkpoint is a narrow validation hardening fix: `POST /api/analysis/ocr` now rejects any JSON request field other than `fixtureKey`.

This checkpoint does not start live OCR, provider work, uploads, storage, persistence, UI wiring, real evidence handling, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `LocalAnalysisResult` migration, `analyzeEvidenceFile` changes, receipt behavior changes, deployment, or live analyzer work.

## Phase 4.6 Route Status

`POST /api/analysis/ocr` exists at `src/app/api/analysis/ocr/route.ts` as a JSON-only, synthetic-only, mock-provider route skeleton. It accepts a small JSON object containing exactly one allowlisted synthetic fixture key and resolves that fixture through:

- `src/lib/analysis/ocr-fixture-harness.ts`
- `src/lib/analysis/ocr-extraction-contract.ts`

The route returns contract-derived OCR extraction signals, structured fields, field confidence, extraction confidence, manual-review drivers, limitations, safe summaries, unsupported/provider-failure reasons, review signal level, manual-review requirement, and no-retention markers.

The route rejects non-POST methods, non-JSON content, multipart content, malformed JSON, missing fixture keys, unknown fixture keys, unexpected fields, real-file-like fields, binary-like fields, URL-like values, storage handles, provider payloads, and private identifier fields.

## Route Exposure Assessment

The route is exposed as a Next.js API route, but the current exposure is acceptable for the Phase 4.6/4.7 skeleton because it is constrained to synthetic JSON fixture-key requests only. It does not accept files, multipart uploads, image bytes, object URLs, storage handles, provider payloads, customer identifiers, or live provider configuration.

This route must not be connected to upload flows, production UI, real evidence, case workflow state, provider calls, or persisted storage until a later explicitly approved live/provider implementation slice defines authentication, authorization, abuse controls, privacy handling, retention, deletion, provider payload minimization, and receipt-regression gates.

## Isolation Review

The route remains isolated from protected live runtime and UI surfaces:

- No `ClaimReviewWorkflow` import or wiring.
- No `ProductPhotoReviewPanel` routing.
- No `analyzeEvidenceFile` usage.
- No `LocalAnalysisResult` usage or migration.
- No `report-adapter`, receipt parser, scoring, upload, case command center, provider, storage, integration, or case queue coupling.
- No package dependency changes or provider SDK additions.
- No environment variable reads.
- No network calls, object URL creation, browser storage, file inputs, file/blob construction, or logging.

## Validation Review

Validation coverage is sufficient for the current skeleton scope after the Phase 4.7 tightening. The route now requires an exact fixture-key request shape:

```json
{ "fixtureKey": "clean-receipt-ocr" }
```

Rejected input classes include:

- Non-JSON and malformed JSON.
- Multipart form data.
- Missing or unknown fixture keys.
- Unexpected JSON fields.
- Real-file-like, binary-like, and image-like payloads.
- Object URLs, data URLs, image URLs, file URLs, and storage handles.
- Provider payload fields.
- Customer, case, claim, ticket, evidence, order, tracking, email, phone, or address-like identifiers.

## Output Safety Review

The route output stays review-support-only. It does not return a fraud score, authenticity verdict, fabricated/altered/forged evidence conclusion, proof claim, final claim outcome, automatic support disposition, refund instruction, denial instruction, customer accusation, live receipt report, raw provider payload, raw real OCR, or `LocalAnalysisResult`.

Unsafe response language is guarded by `src/app/api/analysis/ocr/route.probe.ts` and semantic coverage in `scripts/check-report-semantics.mjs`.

## Privacy Review

The route remains synthetic-only and does not process real evidence or private customer data. It retains no file, no raw OCR, no provider payload, and no provider payload log. It creates no object URLs, reads no browser storage, writes no storage, uses no persistence, reads no env vars, and performs no network calls.

The probe confirms private identifier-like request fields are rejected and that retention flags remain false in successful and provider-failure synthetic responses.

## Probe Recommendations

Current probe coverage is sufficient for Phase 4.7 after:

- Adding the unexpected-field rejection probe.
- Adding semantic checker coverage for the route and route probe.
- Keeping the direct route probe registered in `check:product-photo-probes`.

No additional route/probe changes are recommended before the next documentation or planning slice.

## Specialist Review Findings

Product Strategy: Phase 4.7 is a readiness checkpoint only. The route may support future OCR planning, but it should not be presented as production OCR or real evidence analysis.

Architecture & Maintainability: The route is acceptably narrow after exact request-shape validation. It should remain a thin API boundary over the Phase 4.2 fixture harness and Phase 4.3 extraction contract.

Receipt Intelligence: Synthetic receipt cases cover clean, marketplace-like, missing-field, conflict, noisy, incomplete, unsupported, provider-failure, and empty-output states without changing receipt runtime behavior.

Integration Readiness: No provider, SDK, env var, auth, storage, persistence, ticket, email, drive, database, or case queue integration exists. Live provider work remains blocked.

Scoring/Safety: OCR confidence remains a review signal with limitations and manual-review drivers. It does not become a claim score or support decision.

Privacy: No real evidence or customer data enters the route. No retained file, raw OCR, provider payload, storage handle, or object URL is created.

QA: Required checks should include lint, build, report semantics, product-photo probes, direct route probe, diff checks, protected diff scans, provider/env/package scans, import scans, upload/storage/object URL scans, unsafe wording scans, and private identifier scans.

Deployment: No deployment is appropriate for Phase 4.7. The route remains a skeleton and should not be promoted as live OCR.

## Phase Gate Recommendation Before 4.8

Live OCR/provider work should remain blocked after Phase 4.7. The safest next task is one of:

- Option A: Phase 4.8 route hardening and developer-only fixture test documentation.
- Option B: Phase 4.8 provider-selection planning and live-provider prerequisite checklist.
- Option C: Pause Phase 4 implementation and perform a broader source-of-truth readiness review.

Recommended next move: Option A or Option B. Do not add live providers in Phase 4.8 unless Robert explicitly approves a named live/provider implementation slice.

## Stop Conditions

Stop before commit or push if any check shows:

- Provider SDKs, credentials, env vars, provider calls, network calls, persistence, storage, uploads, object URLs, real evidence handling, or private identifiers.
- `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, `analyzeEvidenceFile`, `LocalAnalysisResult`, live report mapping, receipt parser/scoring/report behavior, or receipt behavior changes.
- Unsafe customer-facing wording, final claim outcome language, automatic disposition language, support policy disposition, external verification claims, or customer accusation language in route responses.
- Missing semantic/probe coverage for the route safety boundary.
