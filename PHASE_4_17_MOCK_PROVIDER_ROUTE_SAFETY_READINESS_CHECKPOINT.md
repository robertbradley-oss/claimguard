# Phase 4.17 Mock Provider Route Safety Readiness Checkpoint

Date: 2026-05-31

Primary agent role: Architecture and Maintainability Agent

Supporting reviews: Product Strategy, Receipt Intelligence, Integration Readiness, Scoring and Safety, Privacy and Evidence Safety, QA Harness, Deployment and Release

## Scope

Phase 4.17 is a review-only safety and readiness checkpoint for the Phase 4.16 mock-provider route skeleton.

This milestone verifies that `POST /api/analysis/mock-provider` remains a synthetic/mock developer boundary and not a live provider, upload, storage, UI, or real-evidence path.

This milestone does not add OpenAI Vision implementation, Google/AWS/Tesseract implementation, OCR providers, SDKs, environment variables, real uploads, multipart parsing, binary parsing, storage, persistence, UI, real evidence processing, live OCR, live AI/Vision/photo analysis, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `analyzeEvidenceFile` changes, `LocalAnalysisResult` changes, receipt parser/scoring/report changes, deployment, or Phase 4.18 implementation.

## Phase 4.16 Route Status

Phase 4.16 added:

- `src/app/api/analysis/mock-provider/route.ts`.
- `src/app/api/analysis/mock-provider/route.probe.ts`.
- Probe registration in `scripts/run-product-photo-probes.cjs`.
- Semantic boundary coverage in `scripts/check-report-semantics.mjs`.

What exists now:

- `POST /api/analysis/mock-provider` is a separate JSON-only synthetic mock-provider route skeleton.
- The route calls only the existing mock provider adapter in `src/lib/analysis/providers/mock-provider-adapter.ts`.
- The route supports `mock-ocr` and `mock-vision` for developer-boundary testing only.
- The route is not linked from UI and is not wired to upload, storage, live analyzer, receipt scoring, or case workflow behavior.

Accepted request shape is limited to:

- `providerType`: `mock-ocr` or `mock-vision`.
- `behavior`: `success`, `timeout`, `unavailable`, `malformed-response`, `unsupported-evidence`, `empty-output`, `rate-cost-limit`, `redaction-failure`, `safety-refusal`, or `internal-normalization-error`.
- `mode`: exactly `synthetic`.
- `evidenceTypeHint`: optional allowlisted synthetic hint.
- `fixtureKey`: required only for `mock-ocr` and limited to allowlisted synthetic OCR fixtures.

Rejected input classes include unsupported content types, multipart input, malformed JSON, missing or unknown provider types, missing or unknown behavior keys, missing or unknown OCR fixture keys where applicable, unexpected fields, files, binary-like payloads, base64-like payloads, object/data/image/file URLs, storage handles, customer identifiers, raw OCR text, provider payloads, ticket/order/customer fields, and non-synthetic modes.

Route responses return either mock OCR output, mock vision output, or mock-provider failure output from the existing adapter. Validation failures use operational route errors and do not echo raw input, private markers, provider payloads, or stack traces.

No live provider behavior exists. No provider SDK, credential, environment variable, external network call, upload parser, storage client, persistence layer, UI entry point, real evidence path, or customer-data path was found.

## Separate-Route Architecture Assessment

The separate route remains safer than expanding `/api/analysis/ocr` because it preserves the current OCR route contract and keeps mock provider behavior visibly isolated.

Confirmed:

- `POST /api/analysis/ocr` remains exact `fixtureKey` only.
- `POST /api/analysis/ocr` remains receipt-OCR-fixture focused.
- `POST /api/analysis/mock-provider` remains synthetic mock-provider focused.
- Mock OCR and mock vision route behavior is not mixed into the existing OCR route.
- The two route concerns remain separate enough for regression probes and semantic checks to reason about each boundary independently.

## Mock-Only Route Boundary Assessment

The mock-provider route remains:

- Synthetic-only.
- Mock-only.
- Provider-free.
- SDK-free.
- Env-free.
- Upload-free.
- Storage-free.
- Persistence-free.
- Customer-data-free.
- External-network-free.
- UI-free.
- Live-analyzer-free.
- Live-receipt-behavior-free.

The route imports only the existing mock provider adapter. It does not import provider SDKs, `analyzeEvidenceFile`, `LocalAnalysisResult`, report mapping, receipt parser/scoring, upload components, `ClaimReviewWorkflow`, or `ProductPhotoReviewPanel`.

## Input Validation Review

The route rejects:

- Unsupported content types.
- `multipart/form-data`.
- Malformed JSON.
- Missing or unknown provider type.
- Missing or unknown behavior.
- Missing or unknown OCR fixture where applicable.
- Unexpected fields.
- Real files and file-like objects.
- Binary-like payloads.
- Base64-like payloads.
- Object URLs.
- Data URLs.
- Image URLs.
- File URLs.
- Storage handles.
- Customer identifiers.
- Raw real OCR text.
- Provider payloads.
- Ticket, order, and customer fields.
- Non-synthetic modes.

Nested objects and arrays are rejected by the route-level unsupported-shape guard unless they are already blocked by exact top-level field validation. The adapter repeats its own validation before producing output.

## Mock Route Output Review

Route responses:

- Return mock OCR or mock vision outputs only.
- Include privacy and retention flags.
- Include operational or evidence limitations for failure simulations.
- Include manual-review drivers where applicable.
- Preserve OCR extraction contract output only for mock OCR through the adapter.
- Keep mock vision uncertainty separate from receipt scoring.

Route responses do not include:

- Live provider payloads.
- Raw provider responses.
- Raw real OCR text.
- Real evidence bytes or image data.
- A fraud score.
- Proof language.
- Fake or forged accusation language.
- A final claim decision.
- Automatic deny/refund wording.
- `LocalAnalysisResult`.
- Live receipt report output.

Route responses do not include live provider payloads and do not include `LocalAnalysisResult`.

The mock vision `1-100` altered-or-AI-generated-image placeholder remains an uncertainty signal for manual review planning only. It does not prove alteration, prove an image is synthetic, accuse a customer, or decide a claim.

## Relationship To Existing Route And Contract

Confirmed:

- Existing `POST /api/analysis/ocr` remains unchanged.
- Existing OCR route is not wired to the mock adapter.
- New mock-provider route calls only the mock provider adapter.
- Existing `ocr-extraction-contract` remains the receipt OCR normalization boundary.
- Mock OCR can use the extraction contract through the adapter and synthetic OCR fixtures only.
- Mock vision remains separate from receipt scoring.
- `analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.

The existing OCR route still imports only:

- `src/lib/analysis/ocr-fixture-harness.ts`.
- `src/lib/analysis/ocr-extraction-contract.ts`.

The mock-provider route imports only:

- `src/lib/analysis/providers/mock-provider-adapter.ts`.

## Probe And Check Coverage Review

Coverage exists for:

- Mock-provider route import and isolation.
- Mock OCR route success.
- Mock vision route success.
- Timeout failure.
- Unavailable failure.
- Malformed response.
- Unsupported evidence.
- Empty output.
- Rate/cost limit.
- Redaction failure.
- Safety refusal.
- Normalization failure.
- Missing provider type rejection.
- Unknown provider type rejection.
- Missing behavior rejection.
- Unknown behavior rejection.
- Missing and unknown OCR fixture rejection.
- Unexpected field rejection.
- Malformed JSON rejection.
- Unsupported content type rejection.
- Multipart rejection.
- Base64-like payload rejection.
- Object/data/image/file URL rejection.
- Storage handle rejection.
- Customer identifier rejection.
- Provider payload rejection.
- Non-synthetic mode rejection.
- No provider SDK/package use.
- No environment variable usage.
- No upload, storage, or object URL behavior.
- No protected runtime imports.
- No unsafe wording.
- No `LocalAnalysisResult` shape.
- Existing OCR route regression guard.

`MOCK_PROVIDER_ROUTE_DEVELOPER_PROBE` is registered in `scripts/run-product-photo-probes.cjs`.

`scripts/check-report-semantics.mjs` covers the mock-provider route, route probe, import boundary, behavior boundary, and this checkpoint document.

## Safety Language Review

Safety findings:

- OCR confidence is a review signal only.
- Vision confidence is a review signal only.
- Altered/AI-generated-image uncertainty is a review signal only.
- Provider/mock failures are operational limitations only.
- Unsupported evidence is an evidence limitation only.
- No proof language belongs in output.
- No fake/forged accusation language belongs in output.
- No fraud-confirmation language belongs in output.
- No automatic deny/refund wording belongs in output.
- No final claim decision belongs in output.
- No single fraud score belongs in output.

The route and adapter wording remain aligned with ClaimGuard's manual-review posture.

## Specialist Review Findings

Product Strategy Agent: The mock-provider route is useful as a developer API-boundary test but must remain separated from product verdicts and customer-visible conclusions.

Architecture and Maintainability Agent: The separate route is the correct architecture. It preserves the existing OCR route contract while allowing mock OCR and mock vision behavior to be tested through a contained boundary.

Receipt Intelligence Agent: Receipt behavior remains unchanged. The existing OCR route and OCR extraction contract remain the receipt OCR path. Mock vision remains outside receipt scoring.

Integration Readiness Agent: No live provider, SDK, credential, environment variable, provider payload, external network call, storage, persistence, upload path, or integration path exists.

Scoring and Safety Reviewer Agent: Route outputs remain review-signal-only and limitation-only. No final disposition, automatic support action, proof wording, or single fraud score was added.

Privacy and Evidence Safety Agent: The route rejects real evidence, identifiers, raw OCR text, provider payloads, URLs, storage handles, multipart input, binary-like payloads, and base64-like payloads. Retention and external-network markers remain false.

QA Harness Agent: Route probe coverage, product-photo probe registration, OCR route regression coverage, and semantic checker coverage are sufficient for this checkpoint.

Deployment and Release Agent: No deployment is part of Phase 4.17. Commit and push are appropriate only after checks pass and protected runtime files remain untouched.

## Phase Gate Recommendation Before 4.18

Before any Phase 4.18 work, all of these must remain true:

- No live OCR.
- No providers.
- No SDKs.
- No environment variables.
- No upload implementation.
- No storage implementation.
- No persistence.
- No real evidence.
- No real customer data.
- No provider payloads.
- No customer identifiers.
- No scoring migration.
- No UI changes.
- No live receipt behavior changes.
- No deployment.
- Existing OCR route remains exact `fixtureKey` only.
- Existing OCR route is not wired to the mock adapter.
- Mock-provider route remains synthetic-only and mock-only.
- `analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.

Recommended safe next options after Phase 4.17:

Option A: Phase 4.18 mock provider route developer documentation and usage examples.

Option B: Phase 4.18 OpenAI Vision sandbox planning only, with no SDK, environment variable, provider implementation, route wiring, upload wiring, storage, persistence, or real evidence processing.

Option C: Phase 4.18 provider abstraction interface skeleton planning only.

Do not recommend or start live OpenAI Vision implementation unless Robert explicitly asks to start that path with privacy, retention, provider, secret-handling, route, upload, and receipt-regression scope.

## Stop Conditions

Stop future work if:

- Any live provider work is implemented.
- Any SDK, credential, environment variable, package dependency, provider call, external call, upload path, storage path, persistence layer, or deployment config appears without explicit approval.
- Any multipart, binary, object URL, image URL, data URL, storage handle, provider payload, raw OCR, real evidence, or customer identifier path is accepted.
- Existing OCR route behavior changes.
- Existing OCR route is wired to the mock adapter.
- Protected runtime files are modified.
- `ClaimReviewWorkflow` is modified.
- `ProductPhotoReviewPanel` is routed.
- `analyzeEvidenceFile` behavior changes.
- `LocalAnalysisResult` changes.
- Receipt parser/scoring/report behavior changes.
- Safety wording implies proof, customer wrongdoing, external verification, automatic support action, or final claim outcome.
- Required checks fail.
