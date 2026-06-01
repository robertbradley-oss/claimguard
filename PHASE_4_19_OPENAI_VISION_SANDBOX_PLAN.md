# Phase 4.19 OpenAI Vision Sandbox Plan

Date: 2026-05-31

Primary agent role: Integration Readiness Agent

Supporting reviews: Product Strategy, Architecture and Maintainability, Receipt Intelligence, Scoring and Safety, Privacy and Evidence Safety, QA Harness, Deployment and Release

## Purpose And Scope

Phase 4.19 is an OpenAI Vision sandbox planning-only milestone. ClaimGuard needs this planning checkpoint before implementation because a vision sandbox would affect evidence data flow, prompt safety, provider boundaries, privacy, retention, timeout and cost behavior, and receipt-regression risk.

This milestone does not add OpenAI SDKs, provider SDKs, environment variables, provider calls, provider implementation, live OCR, real uploads, multipart parsing, binary parsing, storage, persistence, UI, real evidence processing, or production analysis. It does not wire `ClaimReviewWorkflow`, does not route `ProductPhotoReviewPanel`, does not change `analyzeEvidenceFile`, does not change `LocalAnalysisResult`, does not change receipt parser/scoring/report behavior, does not change the existing `POST /api/analysis/ocr` route, does not change the existing `POST /api/analysis/mock-provider` route, does not deploy, and does not start Phase 4.20.

This is not live AI. It is not production analysis. It is a planning document for a possible future developer-only OpenAI Vision-style sandbox using synthetic or separately approved anonymized fixture evidence only.

## Current Baseline

Current route and provider boundaries remain unchanged:

- Existing `POST /api/analysis/ocr` remains a JSON-only synthetic fixture-key route.
- Existing `POST /api/analysis/ocr` requires an exact JSON body containing only `fixtureKey`.
- Existing `POST /api/analysis/ocr` is not wired to the mock provider adapter.
- Existing `POST /api/analysis/mock-provider` remains a separate JSON-only synthetic mock-provider route.
- Existing `POST /api/analysis/mock-provider` calls only the mock provider adapter.
- Existing mock-provider route supports `mock-ocr` and `mock-vision` for developer-boundary testing only.
- The mock provider adapter remains the current test boundary before live provider behavior.
- The Phase 4.2 OCR fixture harness and Phase 4.3 OCR extraction contract remain the OCR normalization baseline.
- `analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.
- Receipt behavior remains unchanged.

## Future Sandbox Purpose

A future OpenAI Vision-style sandbox may help ClaimGuard test visual reasoning over synthetic or anonymized evidence without turning vision output into a live decision path.

Future sandbox work may test:

- Screenshot and layout reasoning.
- Receipt layout and context observations.
- Product photo context observations.
- Synthetic damaged-product context examples.
- Altered-or-AI-generated-image uncertainty signals.
- Safe structured output shape.
- Limitation reporting.
- Manual-review driver generation.
- Safe summary wording for internal reviewer use.

The sandbox should help ClaimGuard learn prompt, output, and privacy requirements before any provider implementation. It should not become live receipt analysis, live product-photo analysis, or a production route.

## Future Allowed Evidence Categories

Future sandbox input planning may allow only these categories:

- Synthetic receipt images.
- Synthetic order screenshots.
- Synthetic product-photo fixtures.
- Synthetic damaged-product examples.
- Anonymized and redacted fixture images only after a separate approved phase.

No real customer evidence is allowed by default. Real customer evidence should remain blocked until a later approved retention, privacy, access-control, deletion, and audit milestone.

## Future Disallowed Evidence Categories

Future sandbox work must reject or avoid:

- Real customer receipts.
- Real customer product photos.
- Real support ticket attachments.
- Customer names.
- Emails.
- Phone numbers.
- Addresses.
- Order numbers.
- Tracking numbers.
- Ticket identifiers.
- Raw unredacted OCR text.
- Provider payload dumps.
- Storage handles.
- Object URLs.
- Public image URLs.
- Production upload flow objects.
- Case, claim, evidence, or integration identifiers.
- Filenames, local paths, payment details, private background details, raw metadata, or support notes.

If a future sandbox needs any of these inputs, stop and create a separate privacy, retention, redaction, route, upload, provider, and probe plan before implementation.

## Future OpenAI Vision Role

OpenAI Vision-style analysis should be a future reasoning layer, not a decision maker.

It may support:

- Visual context summary.
- Screenshot and layout observations.
- Product-photo observations.
- Receipt visual consistency observations.
- Altered-or-AI-generated-image uncertainty signal.
- Confidence-style 1-100 uncertainty output only if carefully framed.
- Confidence notes.
- Limitations.
- Manual-review drivers.
- Safe internal reviewer summary.

It must not produce:

- Fraud confirmation.
- Fake or forged conclusion.
- Proof language.
- Automatic deny, refund, approval, or rejection wording.
- Final claim decision.
- Single fraud score.
- Customer-facing accusation.
- Live receipt report output.
- `LocalAnalysisResult`.

The altered-or-AI-generated-image 1-100 value, if later approved, must mean uncertainty and reviewer attention only. It must not mean the image is altered, synthetic, genuine, or associated with customer wrongdoing.

## Future Prompt Strategy

Future prompts must be designed before any provider call exists.

Prompts must:

- Ask for uncertainty and review signals only.
- Forbid fraud conclusions.
- Forbid fake or forged accusations.
- Require limitations.
- Require manual-review framing.
- Separate observations from conclusions.
- Identify low-confidence areas.
- Avoid customer-facing blame language.
- Request structured output only.
- Avoid returning raw private identifiers.
- Avoid creating support dispositions.
- Preserve `External Verification: Not performed` unless a later approved integration actually verifies evidence.
- Treat provider uncertainty as evidence-review context, not as proof or final outcome.

Prompt output instructions should explicitly say that the model should not decide whether a claim should be approved, rejected, denied, or refunded.

## Future Output Contract

A future OpenAI Vision sandbox output shape should be separate from OCR extraction, receipt scoring, and live report output.

Planned fields:

- Provider mode: sandbox.
- Evidence type.
- Visual summary.
- Observation list.
- Uncertainty signals.
- Altered-or-AI-generated-image uncertainty value, 1-100, if applicable.
- Confidence notes.
- Manual-review drivers.
- Limitations.
- Safe support summary.
- Privacy flags.
- Retention flags.
- Provider failure reason when applicable.
- Cost and timeout metadata.

Future output must stay separate from:

- `LocalAnalysisResult`.
- Live receipt report output.
- Receipt scoring.
- Claim disposition.
- Customer-facing messaging.
- Upload state.
- Storage state.
- Provider raw payloads.

No future sandbox output should become the Evidence Reliability Score or a single fraud score.

## Privacy And Retention Plan

Future sandbox privacy rules:

- No real evidence by default.
- No raw provider payload logging.
- No raw OCR retention.
- No customer identifiers.
- No object URL retention.
- No storage unless separately approved.
- No persistence unless separately approved.
- No provider payload replay unless separately approved.
- Redaction required before any anonymized fixture testing.
- Explicit deletion and retention policy before real evidence is considered.
- File retained: false by default.
- Raw OCR retained: false by default.
- Provider payload retained: false by default.
- Provider payload logged: false by default.
- External network called should be false until a later implementation phase explicitly opens provider calls.

A future implementation plan must define what data leaves ClaimGuard, what is redacted first, what is logged, what is never logged, when temporary data is deleted, and who can access any retained artifact before any real evidence is considered.

## Cost And Timeout Plan

Future sandbox cost and timeout rules:

- Strict timeout ceiling.
- No automatic retry by default.
- Small image and page limits.
- Developer-only usage.
- No public access.
- Cost metadata required.
- Provider failure normalized as operational limitation.
- Rate and cost limit behavior documented.
- No customer-risk conclusion from provider failure.
- One evidence item per first sandbox request unless a later phase explicitly approves batching.
- No queued or background raw-evidence processing until storage, retention, deletion, audit, and access-control policies exist.

Timeout, rate limit, malformed response, provider refusal, and cost limit states must be treated as operational limitations only.

## Relationship To Existing Routes And Mock Adapter

Existing `POST /api/analysis/ocr` remains exact fixture-key only. Phase 4.19 does not modify or expand it.

Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only. Phase 4.19 does not modify it, extend it, or wire it to any live provider.

OpenAI Vision sandbox work should not modify either existing route without a separately approved milestone.

The mock provider adapter remains the test boundary before live provider behavior. Future OpenAI Vision sandbox planning should follow the Phase 4.10 provider abstraction plan and preserve the Phase 4.11 through Phase 4.18 mock-before-live path.

`analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged. Receipt parser, scoring, report adapter, upload flow, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain protected.

## Future QA And Probe Requirements

Before any OpenAI Vision sandbox implementation, future probes and checks should prove:

- No SDK, environment variable, or package change until approved.
- No real evidence fixtures.
- No upload or storage route.
- No protected runtime imports.
- No `LocalAnalysisResult` migration.
- No `analyzeEvidenceFile` change.
- Unsafe wording scan.
- Private identifier scan.
- Prompt safety scan.
- Output schema safety scan.
- Timeout and failure behavior probe.
- Retention and privacy flag probe.
- Cost metadata probe.
- Provider payload logging scan.
- No route or UI wiring scan.
- No existing OCR route behavior change.
- No existing mock-provider route behavior change.
- No provider raw payloads in source, fixtures, docs, logs, or screenshots.

Required future implementation checks should include lint, build, report semantics, product-photo probes, diff check, protected code diff scan, route/provider/env/package diff scan, protected import scan, upload/storage/object URL scan, unsafe wording scan, and private identifier scan.

## Safety Language Rules

Future OpenAI Vision sandbox wording must preserve these rules:

- Vision confidence is review signal only.
- Altered-or-AI-generated-image confidence is uncertainty signal only.
- Visual inconsistency is manual-review driver only.
- Provider failures are operational limitations only.
- Unsupported evidence is an evidence limitation only.
- No proof language.
- No fake or forged accusation language.
- No fraud-confirmation language.
- No automatic deny/refund wording.
- No approval or rejection wording.
- No final claim decision.
- No single fraud score.
- No customer-facing blame language.

Preferred language:

- "Manual review recommended."
- "This is a review-support signal."
- "The visual observation is inconclusive."
- "The uncertainty value should guide reviewer attention only."
- "No external verification was performed."
- "Provider unavailable."
- "Operational limitation only."

## Specialist Review Findings

Product Strategy Agent: The sandbox should advance ClaimGuard's broader evidence-intelligence direction without collapsing vision output into a verdict. Vision is useful for context, layout, and uncertainty signals, not support decisions.

Architecture and Maintainability Agent: Future sandbox output should follow provider abstraction planning and remain separate from OCR extraction, receipt scoring, `LocalAnalysisResult`, live report output, routes, and UI until a later approved implementation slice.

Receipt Intelligence Agent: Receipt OCR precision remains the OCR-specialized lane. Future vision observations may add context later, but receipt parser, scoring, report behavior, `analyzeEvidenceFile`, and `LocalAnalysisResult` must remain unchanged.

Integration Readiness Agent: Live provider work remains blocked. No SDK, credential, environment variable, provider call, upload handling, storage, persistence, or real evidence path belongs in Phase 4.19.

Scoring and Safety Reviewer Agent: Altered-or-AI-generated-image confidence must remain uncertainty only. No output should become proof, a single fraud score, a customer accusation, or a claim outcome.

Privacy and Evidence Safety Agent: The future sandbox must default to synthetic evidence only, reject identifiers and production upload objects, avoid raw provider payload logging, and require a separate retention/deletion policy before real evidence is considered.

QA Harness Agent: A future sandbox implementation needs prompt, schema, privacy, timeout, cost, failure, protected-import, route/UI wiring, unsafe wording, and private identifier probes before any provider call.

Deployment and Release Agent: Phase 4.19 is documentation/source-of-truth plus narrow semantic coverage only. Commit and push are appropriate only after checks pass, protected runtime files remain untouched, and no deployment occurs.

## Phase Gate Recommendation

Before Phase 4.20, all of these must remain true:

- No live OCR.
- No OpenAI SDK.
- No provider SDKs.
- No environment variables.
- No provider calls.
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
- Existing OCR route remains exact `fixtureKey` only.
- Existing mock-provider route remains synthetic/mock-only and adapter-only.
- `analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.
- No deployment occurs.

Recommended next safe options after Phase 4.19:

Option A: Phase 4.20 OpenAI Vision sandbox prompt/output contract planning.

Option B: Phase 4.20 OpenAI Vision sandbox implementation plan, still no SDK, environment variable, or provider code.

Option C: Phase 4.20 OpenAI Vision sandbox skeleton, only if Robert explicitly approves implementation and only if it remains synthetic/anonymized-fixture-only.

Do not recommend live OpenAI Vision implementation yet unless Robert explicitly asks to start that path with privacy, retention, provider, secret-handling, route, upload, and receipt-regression scope.

## Stop Conditions

Stop future work if:

- Any OpenAI SDK or provider SDK is added.
- Any environment variable is added.
- Any provider call is implemented.
- Any real upload path is implemented.
- Existing OCR route behavior changes.
- Existing mock-provider route behavior changes.
- Multipart or binary files are accepted.
- Storage or persistence is added.
- Real evidence or real identifiers are accepted.
- Protected runtime files are modified.
- `ClaimReviewWorkflow` is modified.
- `ProductPhotoReviewPanel` is routed.
- `analyzeEvidenceFile` behavior changes.
- `LocalAnalysisResult` changes.
- Receipt behavior changes.
- Output wording implies proof, customer wrongdoing, external verification, automatic support action, or final claim outcome.
- Required checks fail or cannot be interpreted safely.

## Closeout Criteria

Phase 4.19 is ready to close when:

- This OpenAI Vision sandbox planning document exists.
- `ROADMAP.md`, `NEXT_STEPS.md`, `REPO_SOURCE_OF_TRUTH.md`, `AGENTS.md`, and `AGENT_LOG.md` reflect Phase 4.19 planning-only status.
- Semantic coverage includes this planning document.
- No runtime/source/route/component/package/config/deployment files changed, except narrow semantic-checker coverage.
- No OpenAI SDK, provider SDK, environment variable, provider call, upload path, storage, persistence, UI wiring, real evidence, live scoring, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `LocalAnalysisResult` migration, `analyzeEvidenceFile` changes, OCR route behavior changes, mock-provider route behavior changes, or receipt behavior changes were added.
- Required checks pass.
- The next recommended task is Phase 4.20 prompt/output contract planning or implementation planning, not live provider implementation.
