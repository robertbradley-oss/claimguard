# Phase 4.18 Mock Provider Route Developer Usage

Date: 2026-05-31

Primary agent role: Architecture and Maintainability Agent

Supporting reviews: Product Strategy, Receipt Intelligence, Integration Readiness, Scoring and Safety, Privacy and Evidence Safety, QA Harness, Deployment and Release

## Purpose And Scope

Phase 4.18 documents how developers may safely call the separate synthetic-only `POST /api/analysis/mock-provider` route.

The route exists for developer-boundary testing only. It is useful for checking mock OCR, mock vision, route validation, failure normalization, privacy flags, and separation from the existing OCR fixture route before any live provider work is approved.

This route is not live OCR. It is not OpenAI Vision, Google Cloud Vision, AWS Textract, Tesseract, or production analysis. It is not connected to uploads, UI, storage, persistence, live receipt behavior, case workflow behavior, or customer evidence processing.

Phase 4.18 does not add route behavior. It does not add OpenAI Vision implementation, Google/AWS/Tesseract implementation, OCR providers, SDKs, environment variables, real uploads, multipart parsing, binary parsing, storage, persistence, UI, real evidence processing, live OCR, live AI/Vision/photo analysis, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `analyzeEvidenceFile` changes, `LocalAnalysisResult` changes, receipt parser/scoring/report changes, deployment, or Phase 4.19 work.

## Request Shape

Send only small JSON objects to `POST /api/analysis/mock-provider` with `Content-Type: application/json`.

Allowed fields:

- `providerType`: `mock-ocr` or `mock-vision`.
- `behavior`: `success`, `timeout`, `unavailable`, `malformed-response`, `unsupported-evidence`, `empty-output`, `rate-cost-limit`, `redaction-failure`, `safety-refusal`, or `internal-normalization-error`.
- `mode`: exactly `synthetic`.
- `evidenceTypeHint`: optional allowlisted synthetic hint: `receipt`, `order-screenshot`, `product-photo`, or `unknown`.
- `fixtureKey`: required for `mock-ocr`; not allowed for `mock-vision`.

Use only allowlisted synthetic OCR fixture keys when `providerType` is `mock-ocr`, such as `clean-receipt-ocr`, `missing-total-ocr`, `unsupported-non-receipt-text`, `provider-timeout-synthetic-failure`, or `empty-ocr-output`.

Do not send real names, emails, phone numbers, addresses, order numbers, tracking numbers, ticket identifiers, images, receipt text, URLs, base64 values, storage handles, provider payloads, real customer data, or real evidence.

## Safe Synthetic Request Examples

These examples are developer-only JSON examples. They are not production callers, upload flows, UI wiring, provider implementations, or live analysis.

### Mock OCR Success

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "evidenceTypeHint": "receipt",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected interpretation: synthetic OCR candidate extraction succeeded for boundary testing only. OCR confidence is a review signal, not evidence authenticity.

### Mock Vision Success

```json
{
  "providerType": "mock-vision",
  "behavior": "success",
  "mode": "synthetic",
  "evidenceTypeHint": "product-photo"
}
```

Expected interpretation: synthetic vision review output is available for planning only. The altered-or-AI-generated-image uncertainty value is a review-only uncertainty signal.

### Timeout Failure

```json
{
  "providerType": "mock-ocr",
  "behavior": "timeout",
  "mode": "synthetic",
  "evidenceTypeHint": "receipt",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected interpretation: timeout is an operational limitation only. It is not a customer-risk signal.

### Unavailable Failure

```json
{
  "providerType": "mock-ocr",
  "behavior": "unavailable",
  "mode": "synthetic",
  "evidenceTypeHint": "receipt",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected interpretation: unavailable means the synthetic mock provider did not produce output. Treat it as an operational limitation.

### Malformed Response Failure

```json
{
  "providerType": "mock-ocr",
  "behavior": "malformed-response",
  "mode": "synthetic",
  "evidenceTypeHint": "receipt",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected interpretation: malformed response tests provider-boundary normalization only. It is not evidence about the customer or claim.

### Unsupported Evidence Failure

```json
{
  "providerType": "mock-vision",
  "behavior": "unsupported-evidence",
  "mode": "synthetic",
  "evidenceTypeHint": "unknown"
}
```

Expected interpretation: unsupported evidence is an evidence-coverage limitation only. It should not be forced into receipt fields or product-photo conclusions.

### Empty Output Failure

```json
{
  "providerType": "mock-ocr",
  "behavior": "empty-output",
  "mode": "synthetic",
  "evidenceTypeHint": "receipt",
  "fixtureKey": "empty-ocr-output"
}
```

Expected interpretation: empty output means no usable synthetic output was produced. It should drive manual review or clearer eligible evidence, not a claim outcome.

### Rate Or Cost Limit Failure

```json
{
  "providerType": "mock-vision",
  "behavior": "rate-cost-limit",
  "mode": "synthetic",
  "evidenceTypeHint": "product-photo"
}
```

Expected interpretation: rate or cost limit is an operational limit only. It should not be treated as a risk signal about evidence or a customer.

### Redaction Failure

```json
{
  "providerType": "mock-ocr",
  "behavior": "redaction-failure",
  "mode": "synthetic",
  "evidenceTypeHint": "receipt",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected interpretation: redaction failure is a privacy/safety stop for processing readiness. It is not an evidence conclusion.

### Safety Refusal Failure

```json
{
  "providerType": "mock-vision",
  "behavior": "safety-refusal",
  "mode": "synthetic",
  "evidenceTypeHint": "product-photo"
}
```

Expected interpretation: safety refusal means no analysis output should be used. Manual review should rely on approved evidence and support policy.

### Normalization Failure

```json
{
  "providerType": "mock-vision",
  "behavior": "internal-normalization-error",
  "mode": "synthetic",
  "evidenceTypeHint": "product-photo"
}
```

Expected interpretation: normalization failure is an internal boundary failure. It should remain an operational limitation and should not become app-facing scoring.

## Validation Failure Examples

These examples show request classes that should be rejected. The placeholder values are intentionally synthetic and non-sensitive.

### Unsupported Content Type

```text
Content-Type: text/plain
Body: {"providerType":"mock-ocr","behavior":"success","mode":"synthetic","fixtureKey":"clean-receipt-ocr"}
```

Expected result: rejected with `UNSUPPORTED_CONTENT_TYPE`.

### Multipart Form Data

```text
Content-Type: multipart/form-data; boundary=synthetic-boundary
Body: [blocked multipart body omitted]
```

Expected result: rejected with `UNSUPPORTED_CONTENT_TYPE`.

### Malformed JSON

```text
{
```

Expected result: rejected with `MALFORMED_JSON`.

### Missing Provider Type

```json
{
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected result: rejected with `MISSING_PROVIDER_TYPE`.

### Unknown Provider Type

```json
{
  "providerType": "mock-live-provider",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected result: rejected with `UNKNOWN_PROVIDER_TYPE`.

### Missing Behavior

```json
{
  "providerType": "mock-ocr",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected result: rejected with `MISSING_SYNTHETIC_BEHAVIOR`.

### Unknown Behavior

```json
{
  "providerType": "mock-ocr",
  "behavior": "live-analysis",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected result: rejected with `UNKNOWN_SYNTHETIC_BEHAVIOR`.

### Missing OCR Fixture

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic"
}
```

Expected result: rejected with `MISSING_FIXTURE_KEY`.

### Unknown OCR Fixture

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "unknown-synthetic-fixture"
}
```

Expected result: rejected with `UNKNOWN_FIXTURE_KEY`.

### Unexpected Field

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr",
  "extraSyntheticNote": "blocked"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### File-Like Payload

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr",
  "file": "[blocked file-like payload omitted]"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### Base64-Like Payload

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr",
  "base64": "[blocked base64-like payload omitted]"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### URL-Like Payload

```json
{
  "providerType": "mock-vision",
  "behavior": "success",
  "mode": "synthetic",
  "evidenceTypeHint": "product-photo",
  "imageUrl": "[blocked URL-like payload omitted]"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### Storage Handle

```json
{
  "providerType": "mock-vision",
  "behavior": "success",
  "mode": "synthetic",
  "evidenceTypeHint": "product-photo",
  "storageHandle": "[blocked storage handle omitted]"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### Customer Identifier

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr",
  "customerId": "[blocked customer identifier omitted]"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### Raw OCR Text

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr",
  "rawOcrText": "[blocked raw OCR text omitted]"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### Provider Payload

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr",
  "providerPayload": "[blocked provider payload omitted]"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### Ticket, Order, Or Customer Field

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "synthetic",
  "fixtureKey": "clean-receipt-ocr",
  "ticket": "[blocked support field omitted]"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

### Non-Synthetic Mode

```json
{
  "providerType": "mock-ocr",
  "behavior": "success",
  "mode": "live",
  "fixtureKey": "clean-receipt-ocr"
}
```

Expected result: rejected with `UNSUPPORTED_INPUT_BOUNDARY`.

## Expected Response Interpretation

`ok: true` means synthetic mock execution succeeded. It does not mean evidence is authentic, externally verified, complete, altered, unaltered, AI-generated, or customer-risky.

`ok: false` means either route validation failed or the synthetic mock provider returned a simulated failure. It does not mean customer risk.

Mock OCR confidence is a review signal only.

Mock vision confidence is a review signal only.

Altered-or-AI-generated-image uncertainty is synthetic and review-only. It does not prove alteration, does not prove an image is synthetic, does not identify customer wrongdoing, and does not decide a claim.

Failure outputs are operational limitations or evidence limitations only. Timeout, unavailable, malformed response, unsupported evidence, empty output, rate/cost limit, redaction failure, safety refusal, and normalization failure should never be interpreted as a proof finding, final decision, automatic denial, automatic refund, or automatic claim disposition.

No output from this route should be shown to customers as a conclusion.

## Privacy And Retention Flags

Developers should expect mock-provider responses to indicate or preserve:

- `fileRetained: false`.
- `rawOcrRetained: false`.
- `providerPayloadRetained: false`.
- `providerPayloadLogged: false`.
- `externalNetworkCalled: false`.
- `storageUsed: false`.
- `envUsed: false`.
- No real customer data accepted.
- No real evidence accepted.

These flags are part of the route's safety posture. If any later response begins indicating retained files, retained raw OCR, logged provider payloads, network calls, storage use, environment variable use, real customer data, or real evidence, stop and treat that as a phase-boundary violation.

## Relationship To Existing OCR Route And Contract

The existing `POST /api/analysis/ocr` route remains exact `fixtureKey` only.

The existing OCR route remains receipt-OCR-fixture focused. It is not wired to the mock-provider route and is not wired to the mock provider adapter.

The mock-provider route is separate and provider-boundary focused. It supports `mock-ocr` and `mock-vision` only for synthetic developer-boundary testing.

The existing `ocr-extraction-contract` remains the OCR normalization boundary. Mock OCR can use the extraction contract through the adapter and synthetic OCR fixtures only.

Mock vision remains separate from receipt scoring, receipt parser behavior, receipt report behavior, and live analyzer behavior.

`analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.

## Developer Stop Conditions

Stop future work immediately if:

- Live provider work appears.
- SDKs, credentials, environment variables, provider calls, or external network calls appear.
- Uploads, multipart parsing, binary parsing, storage, or persistence appear.
- Real evidence or customer identifiers appear.
- Existing OCR route behavior changes.
- The mock-provider route begins accepting binary input, multipart input, URLs, or storage handles.
- Protected runtime files change.
- `analyzeEvidenceFile` or `LocalAnalysisResult` changes.
- `ClaimReviewWorkflow` is wired to this route.
- `ProductPhotoReviewPanel` is routed because of this route.
- Receipt parser, scoring, report, fixture, upload, or live receipt behavior changes.
- Any output uses accusation, proof, final-decision, automatic deny/refund, wrongdoing-confirmation, or customer-blame language.

## Phase Gate Recommendation Before 4.19

Before Phase 4.19, all of these must remain true:

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
- Existing OCR route remains exact `fixtureKey` only.
- Existing OCR route is not wired to the mock adapter or mock-provider route.
- Mock-provider route remains synthetic-only, mock-only, and adapter-only.
- `analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.
- No deployment occurs.

Recommended safe next options after Phase 4.18:

Option A: Phase 4.19 OpenAI Vision sandbox planning only, with no SDK, environment variable, provider implementation, route wiring, upload wiring, storage, persistence, real evidence processing, or live analysis.

Option B: Phase 4.19 provider abstraction interface skeleton planning only.

Option C: Phase 4.19 mock-provider route access guard planning only.

Do not recommend or start live OpenAI Vision implementation unless Robert explicitly asks to start that path with privacy, retention, provider, secret-handling, route, upload, and receipt-regression scope.

## Specialist Review Findings

Product Strategy Agent: The route documentation helps developers explore AI/photo intelligence safely while preserving the product posture: signals and uncertainty support manual review, not conclusions.

Architecture and Maintainability Agent: Documentation should describe the separate route without changing runtime behavior. The existing OCR route contract and mock-provider route boundary remain distinct.

Receipt Intelligence Agent: The existing receipt OCR route and OCR extraction contract remain the receipt-focused path. Receipt parser, scoring, reporting, `analyzeEvidenceFile`, and `LocalAnalysisResult` remain unchanged.

Integration Readiness Agent: This milestone does not add providers, SDKs, credentials, environment variables, provider payloads, uploads, storage, persistence, external network calls, or live integrations.

Scoring and Safety Reviewer Agent: `ok`, confidence, and image uncertainty must remain review-signal language only. No output should become a proof finding, final claim outcome, automatic support action, or customer accusation.

Privacy and Evidence Safety Agent: Examples use synthetic fixture keys and placeholder disallowed values only. The route must continue rejecting real evidence, private identifiers, raw OCR text, provider payloads, URLs, storage handles, multipart input, binary-like input, and base64-like input.

QA Harness Agent: Existing route and OCR regression probes already cover the documented success, failure, validation, privacy, and route-separation cases. Phase 4.18 adds semantic coverage for this developer guide.

Deployment and Release Agent: Commit and push are appropriate only after required checks pass, protected runtime files remain untouched, and no deployment occurs.
