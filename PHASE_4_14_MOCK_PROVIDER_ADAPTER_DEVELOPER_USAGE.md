# Phase 4.14 Mock Provider Adapter Developer Usage

Date: 2026-05-31

Primary agent role: Architecture and Maintainability Agent

Supporting reviews: Product Strategy, Receipt Intelligence, Integration Readiness, Scoring and Safety, Privacy and Evidence Safety, QA Harness, Deployment and Release

## Purpose And Scope

Phase 4.14 documents how developers may use the Phase 4.12 mock provider adapter for safe boundary testing and future planning.

The mock provider adapter exists for developer testing of provider boundary behavior only. It helps test synthetic provider-like OCR output, synthetic vision-review output, failure normalization, privacy flags, usage metadata, and safe review wording before any live provider work is approved.

This milestone does not add route integration, live OCR, OpenAI Vision implementation, Google/AWS/Tesseract implementation, OCR providers, SDKs, environment variables, uploads, multipart parsing, binary parsing, storage, persistence, UI, real evidence processing, live AI/Vision/photo analysis, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `analyzeEvidenceFile` changes, `LocalAnalysisResult` changes, receipt parser/scoring/report changes, deployment, or Phase 4.15 work.

The adapter is not production analysis. It is not live OCR. It is not OpenAI Vision. It is not Google Cloud Vision, AWS Textract, Tesseract, or any external provider. It must remain synthetic-only, mock-only, provider-free, SDK-free, env-free, upload-free, storage-free, persistence-free, customer-data-free, external-network-free, UI-free, live-analyzer-free, and live-receipt-behavior-free until a separately approved milestone changes that boundary.

## Safe Usage Rules

Use the adapter only from developer probes, local scripts, or future approved synthetic-only tests. The input must be a small object containing only:

- `providerMode: MOCK_PROVIDER_MODE`.
- `evidenceTypeHint: "receipt"`, `"order-screenshot"`, `"product-photo"`, or `"unknown"`.
- `behavior`, when testing a specific synthetic behavior.
- `fixtureKey`, when testing mock OCR against an allowlisted synthetic OCR fixture.

Never pass files, images, URLs, customer data, raw OCR from real evidence, provider payloads, or route upload objects.

Allowed fixture examples must use only allowlisted synthetic fixture keys such as `clean-receipt-ocr`, `missing-total-ocr`, `unsupported-non-receipt-text`, `provider-timeout-synthetic-failure`, or `empty-ocr-output`.

## Safe Usage Examples

These examples are developer-only sketches. They are not route handlers, UI flows, provider implementations, or upload processors.

### Mock OCR Success

```ts
import { MOCK_PROVIDER_MODE, runMockOcrProvider } from "@/lib/analysis/providers/mock-provider-adapter";

const result = runMockOcrProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "receipt",
  behavior: "success",
  fixtureKey: "clean-receipt-ocr",
});

if (result.ok && result.result.resultKind === "mock-ocr-success") {
  result.result.contractCompatibility.canFeedOcrExtractionContract;
  result.result.simulatedConfidence.reviewSignalLevel;
  result.result.privacy.realEvidenceUsed;
}
```

Expected interpretation: synthetic OCR candidates and confidence are available for contract comparison only. Confidence is a review signal, not proof of evidence truth.

### Mock Vision Success

```ts
import { MOCK_PROVIDER_MODE, runMockVisionProvider } from "@/lib/analysis/providers/mock-provider-adapter";

const result = runMockVisionProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "product-photo",
  behavior: "success",
});

if (result.ok && result.result.resultKind === "mock-vision-success") {
  result.result.imageConsistencyUncertainty.value;
  result.result.imageConsistencyUncertainty.reviewSignalOnly;
  result.result.imageConsistencyUncertainty.uncertaintyOnly;
}
```

Expected interpretation: the `1-100` value is a synthetic altered-or-AI-generated-image uncertainty placeholder for manual review planning only.

### Timeout Failure

```ts
const result = runMockOcrProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "receipt",
  behavior: "timeout",
  fixtureKey: "clean-receipt-ocr",
});
```

Expected interpretation: timeout is an operational limitation only. It is not a customer-risk signal.

### Unavailable Failure

```ts
const result = runMockOcrProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "receipt",
  behavior: "unavailable",
  fixtureKey: "clean-receipt-ocr",
});
```

Expected interpretation: unavailable means the synthetic provider operation could not proceed. Manual review may be needed because the mock operation did not produce output.

### Malformed Response Failure

```ts
const result = runMockOcrProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "receipt",
  behavior: "malformed-response",
  fixtureKey: "clean-receipt-ocr",
});
```

Expected interpretation: malformed response is a normalization or provider-boundary test case only. It is not evidence about the customer or claim.

### Unsupported Evidence

```ts
const result = runMockVisionProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "unknown",
  behavior: "unsupported-evidence",
});
```

Expected interpretation: unsupported evidence is an evidence-coverage limitation only. Do not force unsupported evidence into receipt fields or product-photo conclusions.

### Empty Output

```ts
const result = runMockOcrProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "receipt",
  behavior: "empty-output",
  fixtureKey: "empty-ocr-output",
});
```

Expected interpretation: empty output means the synthetic provider returned no usable output. It should drive manual review or clearer eligible evidence, not a claim outcome.

### Rate Or Cost Limit

```ts
const result = runMockVisionProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "product-photo",
  behavior: "rate-cost-limit",
});
```

Expected interpretation: rate or cost limit is an operational limit only. It should not be treated as a risk signal about the evidence or customer.

### Redaction Failure

```ts
const result = runMockOcrProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "receipt",
  behavior: "redaction-failure",
  fixtureKey: "clean-receipt-ocr",
});
```

Expected interpretation: redaction failure blocks synthetic processing readiness. It is a privacy/safety stop, not an evidence conclusion.

### Safety Refusal

```ts
const result = runMockVisionProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "product-photo",
  behavior: "safety-refusal",
});
```

Expected interpretation: safety refusal means no analysis output should be used. Manual review should rely on approved evidence and support policy.

### Normalization Failure

```ts
const result = runMockOcrProvider({
  providerMode: MOCK_PROVIDER_MODE,
  evidenceTypeHint: "receipt",
  behavior: "internal-normalization-error",
  fixtureKey: "clean-receipt-ocr",
});
```

Expected interpretation: normalization failure is an internal boundary failure. It should be handled as an operational limitation and should not become app-facing evidence scoring.

## Disallowed Usage Examples

Developers must not call the mock adapter with any of these input classes:

- Real receipts.
- Real product photos.
- Real screenshots.
- Base64 images.
- Object URLs.
- Data URLs.
- Image URLs.
- File URLs.
- Storage handles.
- Customer identifiers.
- Raw real OCR text.
- Support tickets.
- Order or customer fields.
- Provider payloads.
- Live route uploads.
- UI upload flow objects.
- File-like objects, blobs, bytes, multipart form data, local paths, filenames, payment details, addresses, emails, phones, tracking values, case identifiers, claim identifiers, evidence identifiers, or private metadata.

Unsafe sketches:

```ts
runMockOcrProvider({ providerMode: MOCK_PROVIDER_MODE, evidenceTypeHint: "receipt", file: "[blocked file object]" });
runMockVisionProvider({ providerMode: MOCK_PROVIDER_MODE, evidenceTypeHint: "product-photo", imageUrl: "[blocked image URL]" });
runMockOcrProvider({ providerMode: MOCK_PROVIDER_MODE, evidenceTypeHint: "receipt", rawOcrText: "[blocked raw OCR text]" });
runMockVisionProvider({ providerMode: MOCK_PROVIDER_MODE, evidenceTypeHint: "product-photo", providerPayload: "[blocked provider payload]" });
```

These are intentionally disallowed. If a future task needs any of these shapes, stop and create a separate privacy, retention, route, upload, provider, and probe plan before implementation.

## Output Interpretation

Mock OCR confidence is a review signal only.

Mock vision confidence is a review signal only.

The altered-or-AI-generated-image uncertainty value is synthetic and review-only. It does not prove alteration, does not prove an image is synthetic, does not identify customer wrongdoing, and does not decide a claim.

Failure outputs are operational limitations or evidence limitations only. Timeout, unavailable, malformed response, unsupported evidence, empty output, rate/cost limit, redaction failure, safety refusal, and normalization failure should never be interpreted as a fraud verdict, proof, final decision, automatic denial, automatic refund, or automatic claim disposition.

No mock output should be shown to customers as a conclusion. Mock output is developer planning material for reviewer-support signal design.

## Relationship To Existing Route And Contract

The existing `POST /api/analysis/ocr` route remains exact fixture-key only.

The existing route is not wired to the mock adapter. Phase 4.14 does not add route integration or live behavior.

The existing `ocr-extraction-contract` remains the OCR normalization boundary. Mock OCR can help test future provider-like outputs into that contract using synthetic fixtures only.

Mock vision remains separate from receipt scoring, receipt parsing, live analyzer behavior, and `LocalAnalysisResult`.

`analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged. Receipt parser, scoring, report adapter, upload flow, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain protected.

## Developer Stop Conditions

Stop future work immediately if:

- Route integration is added without explicit milestone approval.
- SDK, credential, environment variable, package dependency, provider call, or external network work appears.
- Uploads, multipart parsing, binary parsing, storage, persistence, object URL handling, data URL handling, image URL handling, file URL handling, or real evidence processing appears.
- Real evidence, private identifiers, raw real OCR, provider payloads, support tickets, order/customer fields, or customer data appears.
- `analyzeEvidenceFile` or `LocalAnalysisResult` changes.
- The existing OCR route is wired to the mock adapter without a separately approved milestone.
- `ClaimReviewWorkflow` is wired or `ProductPhotoReviewPanel` is routed.
- Receipt parser, scoring, report behavior, upload behavior, or live receipt behavior changes.
- Output wording uses accusation, proof, final-decision, automatic deny/refund, fraud-confirmation, or customer-wrongdoing language.
- Required checks fail or cannot be interpreted safely.

## Phase Gate Recommendation

Before Phase 4.15, all of these must remain true:

- No live OCR.
- No providers.
- No SDKs.
- No environment variables.
- No route integration.
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
- Existing OCR route remains exact fixture-key only.
- Mock adapter remains unwired from the OCR route and live receipt workflow.
- `analyzeEvidenceFile` and `LocalAnalysisResult` remain unchanged.

Recommended safe next options after Phase 4.14:

Option A: Phase 4.15 mock adapter route integration planning only.

Option B: Phase 4.15 OpenAI Vision sandbox planning only, with no SDK, env var, provider implementation, route wiring, upload wiring, storage, persistence, or real evidence processing.

Option C: Phase 4.15 OCR provider abstraction skeleton planning only.

Do not recommend or start live OpenAI Vision implementation unless Robert explicitly asks to start that path with privacy, retention, provider, secret-handling, route, upload, and receipt-regression scope.

## Specialist Review Findings

Product Strategy Agent: Developer documentation keeps the mock-before-live path useful while preventing mock uncertainty signals from becoming product verdicts.

Architecture and Maintainability Agent: The adapter remains isolated under `src/lib/analysis/providers/`, and Phase 4.14 does not require runtime file changes.

Receipt Intelligence Agent: Mock OCR usage remains tied to synthetic fixtures and the OCR extraction contract; receipt parser/scoring/report behavior remains unchanged.

Integration Readiness Agent: Live provider work remains blocked. No SDK, credential, env var, provider payload, upload path, storage path, persistence path, route integration, or external network path belongs in this milestone.

Scoring and Safety Reviewer Agent: OCR confidence, vision confidence, and altered-or-AI-generated-image uncertainty remain review-support signals only.

Privacy and Evidence Safety Agent: Examples use synthetic fixture keys and omit customer identifiers, provider payloads, real evidence, raw real OCR, images, URLs, storage handles, and private metadata.

QA Harness Agent: Existing mock provider adapter probe coverage is sufficient for Phase 4.14; semantic coverage should include this developer documentation.

Deployment and Release Agent: Commit and push are appropriate only after required checks and scans pass; deployment remains out of scope.
