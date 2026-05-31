# Phase 4.4 Server-Side OCR Route Data-Flow Plan

This is a planning-only Phase 4.4 milestone under `ROADMAP.md` heading "Phase 4: Stronger OCR and AI Integrations".

It plans a future server-side OCR route and evidence data flow before any route, provider, upload, storage, or persistence work is implemented. It does not implement a route, add OCR providers, add SDKs, add credentials or environment variables, add upload behavior, store files, process real evidence, add UI, change runtime behavior, change receipt behavior, wire `ClaimReviewWorkflow`, route `ProductPhotoReviewPanel`, migrate `LocalAnalysisResult`, add AI/Vision calls, deploy, or start Phase 4.5.

## Current State

Phase 4.0 planning-only real AI/OCR/photo intelligence readiness is complete. Phase 4.1 OCR/provider architecture planning is complete. Phase 4.2 synthetic OCR fixture harness is implemented in `src/lib/analysis/ocr-fixture-harness.ts`. Phase 4.3 provider-neutral OCR extraction contract is implemented in `src/lib/analysis/ocr-extraction-contract.ts`.

Production remains:

- `/`: Phase 1 receipt workflow.
- `/case-command-center`: directly reachable, unlinked from `/`, static/local, synthetic-only, non-persistent, off-white/parchment, and manual-review framed.

Current receipt architecture remains unchanged:

- `analyzeEvidenceFile(file)` remains the live receipt analyzer entrypoint.
- `extractOcr(file)` remains the browser-local OCR implementation used by the Phase 1 receipt workflow.
- `parseReceiptText(ocr.text)` remains the live receipt parser.
- `LocalAnalysisResult` remains receipt-shaped.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` remains receipt-report mapping only.
- `External Verification: Not performed` remains the correct state.
- `ClaimReviewWorkflow` remains unwired from Phase 4 OCR work.
- `ProductPhotoReviewPanel` remains unrouted.

No server OCR route exists. No provider, SDK, env var, upload behavior, storage, persistence, real evidence handling, provider payload, customer data, live scoring, integration, route implementation, deployment, or receipt behavior change has been added.

## Purpose And Scope

The future server-side OCR route should exist only if browser-local OCR becomes insufficient for approved receipt/order evidence scenarios such as:

- Multi-page PDFs that exceed browser performance or reliability limits.
- Dense receipt/order screenshots where layout reconstruction matters.
- Image preprocessing that cannot be done reliably in the browser.
- Provider-backed text-block or structured field extraction after a provider and privacy policy are approved.
- Centralized timeout, cost, retry, rate-limit, and operational reporting controls.

Phase 4.4 exists to plan that future route before implementation. It defines the route boundary, data flow, privacy and retention rules, provider payload minimization, timeout/failure behavior, cost controls, security prerequisites, contract integration, safety language rules, and phase gates.

Phase 4.4 does not authorize:

- A server route.
- A provider call.
- A provider SDK.
- Credentials or env vars.
- Upload implementation.
- File or raw OCR storage.
- Persistence.
- Real customer evidence processing.
- Real customer data handling.
- UI changes.
- Live receipt behavior changes.
- `LocalAnalysisResult` migration.
- `ClaimReviewWorkflow` wiring.
- `ProductPhotoReviewPanel` routing.
- AI/photo intelligence implementation.

## Future Route Boundary

Recommended future route shape:

- `POST /api/analysis/ocr`

The exact route name should be confirmed in the implementation milestone, but the route should live under an analysis namespace rather than a broad generic file-processing endpoint.

### Future Route Would Accept

A future route should accept one temporary evidence payload per request:

- Evidence kind hint: `receipt`, `order-screenshot`, `pdf-receipt`, or `unknown`.
- File kind: image, PDF, or unsupported.
- MIME type from upload metadata plus server-side sniffed MIME type.
- Size in bytes.
- Optional page-count hint for PDFs after validation.
- Optional image-dimension hint after validation.
- Requested outputs, such as text blocks, structured receipt fields, and layout hints.
- Privacy policy flags that explicitly disable retention by default.

The first implementation should use synthetic or mock payloads only until real evidence processing is separately approved.

### Future Route Would Return

A future route should return a provider-neutral OCR extraction result:

- Status: completed, partial, unsupported, failed, timed-out, not-run, or empty.
- Extracted text blocks when policy allows returning them.
- Structured receipt extraction signals.
- Field confidence.
- Extraction confidence.
- Manual-review drivers.
- Limitations.
- Unsupported reason when applicable.
- Provider failure reason when applicable.
- Provider metadata summary with no raw provider response.
- Privacy markers, including file retained false, raw OCR retained false, provider payload logged false, and external verification not performed.
- Safe summary wording with review-support-only framing.

### Future Route Would Reject

The route should reject before any provider boundary:

- Unsupported MIME types.
- Files over the approved size limit.
- PDFs over the approved page-count limit.
- Images over the approved dimension or pixel-count limit.
- Empty payloads.
- Multiple files in one request.
- Requests missing explicit processing mode.
- Requests with customer, claim, ticket, case, or evidence identifiers if the milestone does not approve them.
- Requests that ask for retention, storage handles, provider raw payload return, or final support disposition.
- Requests from unauthenticated or unauthorized callers once the route is exposed beyond local/synthetic testing.

### Future Route Must Never Do

The route must never:

- Make a support decision.
- Produce a fraud verdict.
- Produce a single fraud score.
- Claim external verification unless a separate approved integration performs it.
- Store files by default.
- Retain raw OCR by default.
- Log raw text, file names, addresses, payment details, order identifiers, customer identifiers, provider request bodies, provider raw responses, trace URLs, or object URLs.
- Send internal claim notes, customer messages, ticket history, or policy decisions to OCR providers.
- Mutate live receipt behavior without a separate approved milestone.

## Data-Flow Design

Future server-side OCR data flow should be explicit and temporary:

1. Client upload or event selects one eligible evidence item.
2. Client sends the temporary evidence payload to `POST /api/analysis/ocr` only after the route is approved.
3. Server receives the payload in memory.
4. Server validates auth, organization access, content length, declared MIME type, sniffed MIME type, file kind, file size, page count, and image dimensions.
5. Server rejects unsupported or over-limit payloads before any provider request.
6. Server creates a minimized provider request only if provider processing is explicitly allowed for the mode.
7. Server applies timeout control around local/server OCR or provider OCR.
8. Provider or local OCR returns text blocks, layout hints, structured extraction hints, or a failure state.
9. Server normalizes provider/local output through the provider-neutral OCR extraction contract boundary.
10. Server returns review-support-only OCR extraction signals, limitations, and manual-review drivers.
11. Server discards evidence bytes, raw provider payloads, raw provider responses, and raw OCR according to the approved no-retention default.

The route should treat the provider request boundary as a narrow adapter layer. Provider-specific response details should be normalized before any app-facing result is created.

Safe failure flow:

1. Provider unavailable, timeout, malformed response, unsupported evidence, empty OCR, or policy-blocked processing occurs.
2. Route returns a safe failure or unsupported result.
3. Result recommends manual review or clearer eligible evidence where appropriate.
4. Result records operational limitations separately from customer-risk or evidence-quality signals.
5. Result does not change receipt score semantics and does not issue any final support disposition.

## Privacy And Retention Policy

Phase 4.4 recommends a strict no-retention default for any future route:

- Evidence files retained: no.
- Raw OCR text retained: no.
- Provider payloads retained: no.
- Provider raw responses retained: no.
- Object URLs created or retained: no.
- Long-term storage: no.
- File names logged: no.
- Customer identifiers logged: no.
- Provider request IDs stored: no, unless a later audit policy explicitly approves redacted operational tracking.

Temporary processing expectations:

- Evidence bytes should exist only in request memory.
- Temporary buffers should be released after response creation.
- No disk writes, object storage, database rows, queue payload retention, or screenshots should be added by the first route milestone.
- Error logs should use generic event codes and redacted operational metadata only.
- Derived field values should be returned only when needed for reviewer comparison and should not be stored by the route.

Redaction expectations:

- Do not log raw OCR text.
- Do not log merchant names, full order numbers, addresses, emails, phone numbers, payment details, tracking numbers, names, loyalty IDs, barcodes, QR values, metadata, filenames, paths, or private background details.
- Summaries should prefer field presence, count, confidence, limitation, and review-driver wording.
- Provider-bound payloads should avoid extra case/customer context.

Future storage prerequisites before persistence:

- Authenticated user and organization model.
- Evidence access-control model.
- File retention and deletion policy.
- Raw OCR retention policy.
- Provider payload logging policy.
- Audit-log schema and redaction rules.
- Support-rep visibility rules for raw versus summarized OCR.
- Data export and deletion procedures.
- Incident and rollback procedure for provider exposure.

## Provider Payload Boundary

In a later approved provider phase, a provider request may include only the minimum needed evidence input:

- Temporary image or PDF bytes for the eligible evidence item.
- Requested OCR outputs, such as text blocks and layout hints.
- Minimal file-kind and MIME context.
- Optional page or image constraints.
- A provider-neutral schema or instruction that asks for extraction signals, not decisions.

Provider requests must not include:

- Customer names.
- Addresses.
- Emails.
- Phone numbers as separate metadata.
- Full order identifiers as extra context.
- Ticket IDs.
- Claim IDs.
- Case IDs.
- Evidence IDs.
- Internal notes.
- Customer messages.
- Support policy decisions.
- Prior risk score.
- Payment details as extra context.
- Raw metadata beyond what is necessary to process the evidence.
- Provider trace URLs or credentials.

Provider responses must not be logged raw. Provider errors should be normalized into:

- `timed-out`.
- `provider-unavailable`.
- `failed`.
- `partial`.
- `malformed-response`.
- `not-run`.

Provider timeout/unavailable states are operational limitations. They should never become customer-risk signals, field mismatch claims, or evidence-quality conclusions.

## Timeout And Failure Behavior

Recommended first timeout ceiling:

- 8 to 12 seconds for synchronous OCR route work.
- Prefer 10 seconds as an initial ceiling for a route skeleton.
- Large PDFs or expensive provider work should move to a later queued/background design instead of extending synchronous request time.

Retry policy recommendation:

- No automatic retry in the first route skeleton.
- At most one retry may be considered later for idempotent provider failures after cost controls and duplicate-provider-trace handling exist.
- Do not retry unsupported files, malformed files, over-limit files, policy-blocked requests, or empty OCR outputs.

Failure states:

- Provider unavailable: return operational limitation and manual-review fallback.
- Provider timeout: return timed-out or provider-unavailable with no customer-risk implication.
- Provider malformed response: return failed with limitation that OCR output could not be normalized.
- Empty OCR output: return empty output and manual-review guidance.
- Unsupported file: return unsupported before provider call.
- Policy blocked: return not-run with policy limitation.
- Partial OCR: return partial result with explicit missing-page or incomplete-field limitations.

Safe wording examples:

- "OCR extraction was unavailable for this evidence item."
- "Manual review recommended."
- "A clearer eligible proof-of-purchase document may be needed."
- "No external verification was performed."
- "Provider timeout is an operational limitation, not a customer-risk signal."
- "Field confidence should be used for reviewer comparison only."

Unsafe wording:

- Do not say local or provider OCR proves authenticity.
- Do not say failed OCR indicates wrongdoing.
- Do not say a receipt, screenshot, or photo is fake, forged, or fraudulent.
- Do not recommend any automatic claim disposition, payment action, or policy disposition.

## Cost And Abuse Controls

Future route work should define explicit limits before provider calls:

- Maximum file size.
- Maximum PDF page count.
- Maximum image dimensions or pixel count.
- Maximum one evidence item per request.
- Maximum OCR requests per user/session/case over a time window.
- Timeout ceiling.
- No automatic retries by default.
- Provider cost estimate captured as operational metadata only.
- Provider usage metering by organization after auth exists.

Recommended initial planning limits for a future skeleton:

- Images: small support-evidence images only, with a strict byte and pixel limit selected during implementation.
- PDFs: one to three pages unless queued processing is approved.
- Requests: one evidence item per request.
- Public use: blocked until auth and rate limiting exist.

Queue/background processing considerations:

- Use queued OCR only after storage, retention, deletion, audit, and access-control policies exist.
- Do not put raw evidence or raw OCR in queue payloads by default.
- Queue payloads should use short-lived references only after storage policy is approved.
- Background workers should use the same provider-neutral normalization and safety language rules.

## Security Prerequisites

Before live route exposure, ClaimGuard needs:

- Authentication.
- Organization or team context.
- Evidence access-control rules.
- CSRF or same-origin protections appropriate to the app architecture.
- Server-side MIME sniffing.
- File signature validation.
- File size enforcement before buffering large payloads.
- PDF page-count and image-dimension validation.
- Malware scanning or equivalent risk review before accepting broader file types.
- Secure provider secret handling.
- Provider key rotation process.
- Provider timeout and cost controls.
- Audit-log design that records event type and status without raw evidence.
- Abuse monitoring and rate limiting.

Secure secret handling requirements:

- No provider credentials in client code.
- No provider credentials in committed files.
- No provider credentials in docs beyond generic placeholders.
- No env vars added until a provider implementation milestone is approved.
- No provider dashboard URLs, trace URLs, or raw request IDs in app logs by default.

## Contract Integration

Phase 4.2 `ocr-fixture-harness.ts` should remain synthetic testing input only.

Phase 4.3 `ocr-extraction-contract.ts` should remain the provider-neutral normalization boundary. A future route should adapt provider/local OCR output into the contract shape or a future approved extension of that contract, then return review-support-only structured extraction signals.

The future route should not call `analyzeEvidenceFile` in its first skeleton. It should not change `extractOcr`, `parseReceiptText`, `scoreAnalysis`, `mapLocalAnalysisToReport`, `LocalAnalysisResult`, upload behavior, or the live receipt report.

Future integration options:

- Synthetic route probe uses fixture-like payloads to prove validation and failure behavior without provider calls.
- Provider mock adapter maps mock provider output into the Phase 4.3 contract for route testing.
- A later receipt migration milestone may compare server OCR fields to existing parser fields, but only after receipt regression gates are defined.

No `LocalAnalysisResult` migration is part of Phase 4.4.

## Safety Language Rules

All future server OCR route output must preserve these rules:

- OCR confidence is a review signal, not proof.
- Field mismatch is a manual-review driver, not a fraud verdict.
- Amazon-like structure validation is a readiness and structure hint only.
- Provider failure is an operational limitation.
- Unsupported files are eligibility or coverage limits.
- Empty OCR output is an evidence-quality limitation.
- No single fraud score.
- No fraud-confirmation language.
- No fake, forged, or accusation language.
- No automatic claim disposition, payment action, or policy-disposition wording.
- No final-outcome language.
- No external verification claim unless a separate approved integration performs it.

Customer-safe and reviewer-safe phrasing should prefer:

- "Manual review recommended."
- "Needs reviewer comparison."
- "OCR confidence is limited."
- "Field extraction is incomplete."
- "Provider unavailable."
- "No external verification was performed."
- "A clearer eligible proof-of-purchase document may be needed."
- "This is a review-support signal."

Future AI/photo authenticity direction must follow the same rule: any 1-100 confidence-style output for AI-generated or altered-photo possibility must be framed as uncertainty and review priority, not proof of alteration, proof that the image is synthetic, or proof of customer wrongdoing.

## QA And Documentation Gates

Phase 4.4 closeout should confirm:

- Planning document exists.
- Source-of-truth docs reference Phase 4.4 as planning-only.
- No `src`, route, component, package, config, deployment, provider, upload, storage, persistence, or runtime files changed.
- `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser, scoring, and report adapter remain untouched.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- `npm.cmd run check:report-semantics` passes.
- `npm.cmd run check:product-photo-probes` passes.
- `git diff --check` passes.
- Protected diff and provider/env/route scans are clean.

Future Phase 4.5 route skeleton gates should add:

- Synthetic-only route tests or probes.
- No-provider mock adapter tests.
- Request validation tests.
- Unsupported/timeout/provider-unavailable/malformed/empty output tests.
- Privacy scan proving no raw evidence or identifiers are logged.
- Receipt regression check proving `/` behavior is unchanged.
- Explicit production-disabled or default-off behavior if any route exists before live approval.

## Phase 4.5 Gate Recommendation

Phase 4.5 should not start during this task.

Before Phase 4.5 can safely implement a server-side OCR route skeleton, all of the following should be true:

- Robert explicitly opens Phase 4.5 implementation scope.
- The route skeleton is synthetic-only or mock-provider-only.
- No real provider calls are allowed.
- No provider SDK or env var is added unless explicitly approved for that phase.
- The route is production-disabled or otherwise unreachable for real evidence unless a live route milestone is explicitly approved.
- Request validation rules are written before provider adapter code.
- No file storage, raw OCR retention, provider payload logging, or persistence is added.
- No upload UI or live workflow caller is wired to the route.
- No `analyzeEvidenceFile` behavior changes.
- No `LocalAnalysisResult` migration.
- No receipt parser/scoring/report mapping changes.
- Failure states and safe wording are covered by executable probes.
- Privacy and protected-file scans are required before commit.

Recommended next task:

Phase 4.5 server-side OCR route skeleton planning or implementation should remain separate. The safest next step is a Phase 4.5 implementation plan for a synthetic-only, production-disabled/mock-provider route skeleton, unless Robert chooses to plan AI Vision output contracts first.

## Explicitly Blocked Scope

Phase 4.4 does not authorize:

- Route implementation.
- Provider implementation.
- Provider SDKs.
- Provider credentials.
- Environment variables.
- Upload behavior.
- Storage.
- Persistence.
- Real evidence processing.
- Real customer data.
- Provider payloads.
- Customer identifiers.
- Scoring migration.
- UI changes.
- Live receipt behavior changes.
- `ClaimReviewWorkflow` wiring.
- `ProductPhotoReviewPanel` routing.
- `LocalAnalysisResult` migration.
- Receipt parser/scoring/live fixture changes.
- Deployment.

## Stop Conditions

Stop future work if:

- A route file appears during Phase 4.4.
- A provider SDK, credential, env var, upload path, storage path, persistence layer, package dependency, or deployment config appears without explicit approval.
- Real customer evidence, raw OCR, metadata, filenames, paths, object URLs, IDs, provider payloads, logs, screenshots, or private customer details enter docs, fixtures, prompts, commits, or artifacts.
- Protected runtime files are modified.
- `ClaimReviewWorkflow` is modified.
- `ProductPhotoReviewPanel` is routed.
- `analyzeEvidenceFile` behavior changes.
- `LocalAnalysisResult` changes.
- Receipt behavior changes.
- OCR output or planning wording is framed as proof, fraud confirmation, fake/forged evidence, customer wrongdoing, automatic support action, or final claim disposition.
- Required checks fail or cannot be interpreted safely.

## Closeout Criteria

Phase 4.4 is ready to close when:

- This planning document exists.
- `ROADMAP.md`, `NEXT_STEPS.md`, `REPO_SOURCE_OF_TRUTH.md`, `AGENTS.md`, and `AGENT_LOG.md` reflect Phase 4.4 planning-only status.
- No runtime, route, component, source, package, config, deployment, provider, upload, storage, persistence, or fixture implementation files changed.
- Docs-safe checks pass.
- The next recommended task is Phase 4.5 planning or an explicitly scoped synthetic-only route skeleton plan, not live OCR/provider implementation.
