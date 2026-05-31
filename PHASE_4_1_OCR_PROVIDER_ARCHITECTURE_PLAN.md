# Phase 4.1 OCR/Provider Architecture Plan

This is a docs-only Phase 4.1 architecture checkpoint under `ROADMAP.md` heading "Phase 4: Stronger OCR and AI Integrations".

It plans future OCR/provider boundaries before implementation. It does not implement OCR, add provider SDKs, add credentials or environment variables, add server routes, change upload behavior, store files, process real evidence, change receipt behavior, wire `ClaimReviewWorkflow`, route `ProductPhotoReviewPanel`, migrate `LocalAnalysisResult`, add AI/Vision calls, deploy, commit, or push.

## Current State

Phase 4.0 planning-only real AI/OCR/photo intelligence readiness is complete and pushed at `1876f37` (`docs: plan phase 4 ai ocr readiness`). Vercel auto-deployed that checkpoint successfully. Production remains:

- `/`: Phase 1 receipt workflow.
- `/case-command-center`: directly reachable, unlinked from `/`, static/local, synthetic-only, non-persistent, off-white/parchment, and manual-review framed.

Phase 4 implementation has not started.

Current receipt architecture:

- `analyzeEvidenceFile(file)` remains the live receipt analyzer entrypoint.
- `extractOcr(file)` currently uses browser-local PDF text extraction, PDF rendered OCR fallback, Tesseract.js image OCR, or an unsupported OCR result.
- `parseReceiptText(ocr.text)` extracts receipt fields from OCR text.
- `LocalAnalysisResult` remains receipt-shaped and includes OCR, parsed receipt, metadata, image heuristics, review signals, score breakdown, safe recommendations, and customer-safe wording.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` remains receipt-report mapping only.
- `External Verification: Not performed` remains the correct state.
- Product-photo runtime remains non-live, `ProductPhotoReviewPanel` remains unrouted, and `ClaimReviewWorkflow` remains unwired.

## Phase 4.1 Decision

Phase 4.1 should define a provider-neutral OCR boundary that can later improve receipt intelligence without replacing manual review, without provider lock-in, and without changing shipped receipt behavior.

Stronger OCR should become a better evidence-reading layer. It should help ClaimGuard read more text, reconstruct receipt structure, expose field-level confidence, and explain limitations. It should not become proof that a receipt is real, proof that a customer did something wrong, or an automated claim decision.

The future OCR boundary should be designed as an optional signal source around the receipt analyzer, not an immediate replacement for:

- `analyzeEvidenceFile`.
- `LocalAnalysisResult`.
- existing receipt parser behavior.
- existing report semantics.
- upload flow.
- browser-local privacy posture.

## OCR Architecture Thesis

Stronger OCR should improve receipt intelligence in five ways:

- More complete text extraction for low-quality receipt photos, order screenshots, mobile screenshots, and PDF receipts.
- Better receipt layout reconstruction for totals, taxes, shipping, discounts, item lines, payment sections, and marketplace/order-page sections.
- More reliable structured receipt fields with field-level confidence and limitations.
- Better Amazon receipt/order-page validation readiness through section and consistency signals.
- Cleaner failure states when OCR is unavailable, unsupported, too expensive, too slow, or unsafe to run.

The reviewer posture must stay manual-review-first:

- OCR confidence is evidence-reading confidence, not evidence truth.
- Missing, conflicting, or low-confidence fields are manual review drivers.
- A field mismatch should never become an automated fraud conclusion.
- A high OCR confidence result does not prove authenticity.
- External verification remains "Not performed" unless a later approved integration actually verifies against an external source.

## Provider-Neutral OCR Boundary

Future OCR should be introduced behind a provider-neutral contract before any provider is selected.

Recommended future boundary name:

- `ReceiptOcrProvider` or `EvidenceOcrProvider` for the provider adapter.
- `performOcrExtraction(input)` for a provider-neutral orchestration function.
- `OcrExtractionResult` for the normalized output shape.

These names are planning suggestions only. Do not add files or types during Phase 4.1.

### Input Shape

A future OCR request should accept a minimized, explicit input:

```ts
type PlannedOcrInput = {
  evidenceKindHint: "receipt" | "order-screenshot" | "pdf-receipt" | "unknown";
  fileKind: "image" | "pdf" | "unsupported";
  mimeType: string;
  sizeBytes: number;
  pageCountHint?: number;
  imageDimensionsHint?: {
    width: number;
    height: number;
  };
  bytes: ArrayBuffer | Blob;
  processingMode: "browser-local" | "server-temporary";
  requestedOutputs: {
    textBlocks: boolean;
    structuredReceiptFields: boolean;
    layoutHints: boolean;
  };
  privacyPolicy: {
    allowRawTextReturn: boolean;
    allowProviderProcessing: boolean;
    allowRetention: false;
    redactionMode: "none-yet" | "structural-before-provider" | "provider-output-only";
  };
};
```

Planning constraints:

- Do not pass customer names, order IDs, addresses, payment values, filenames, paths, metadata, or case identifiers unless a later privacy policy explicitly approves that field.
- Do not require storage handles.
- Do not require a case ID.
- Do not require a provider name.
- Do not include env var names or credentials in this contract yet.

### Output Shape

A future OCR response should normalize provider and local OCR output into one shape:

```ts
type PlannedOcrExtractionResult = {
  status: "completed" | "partial" | "unsupported" | "failed" | "timed-out" | "not-run";
  source: "browser-local" | "server-provider" | "server-local" | "mock-synthetic";
  providerKind: "local-browser" | "provider-neutral" | "mock" | "unavailable";
  pages: number;
  textBlocks: PlannedOcrTextBlock[];
  fullText?: string;
  structuredReceipt?: PlannedStructuredReceipt;
  quality: {
    label: "Clear" | "Usable" | "Inconclusive" | "Unreadable";
    averageConfidence?: number;
    coverageConfidence?: number;
    layoutConfidence?: number;
    notes: string[];
  };
  providerMetadata: PlannedProviderMetadata;
  errors: PlannedOcrError[];
  unsupportedReason?: string;
  privacy: {
    rawTextReturned: boolean;
    rawTextRetained: false;
    fileRetained: false;
    providerPayloadLogged: false;
    redactionApplied: boolean;
  };
};
```

`fullText` should be optional because raw OCR availability needs policy control. Existing `OcrExtraction.text` can remain unchanged until a later migration is explicitly approved.

### Extracted Text Blocks

Text blocks should support layout-aware parsing without tying ClaimGuard to one provider:

```ts
type PlannedOcrTextBlock = {
  id: string;
  text: string;
  normalizedText: string;
  confidence?: number;
  pageNumber?: number;
  blockKind: "line" | "word" | "paragraph" | "table-cell" | "unknown";
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    unit: "ratio" | "pixel" | "point";
  };
  relationships?: {
    rowId?: string;
    columnId?: string;
    sectionId?: string;
    followsBlockId?: string;
  };
};
```

Text blocks are future parser inputs, not reviewer-facing private data by default. Any display, export, log, or fixture use must be separately reviewed.

### Structured Receipt Fields

Structured fields should be field-level and confidence-aware:

```ts
type PlannedStructuredReceiptField<TValue = string> = {
  value?: TValue;
  normalizedValue?: string;
  confidence: number;
  status: "extracted" | "not-extracted" | "needs-review" | "conflicting" | "redacted";
  evidenceBlockIds: string[];
  sourceNote: string;
  limitations: string[];
};
```

The future structured receipt object should support:

- merchant.
- order number.
- purchase date.
- total.
- subtotal.
- tax.
- shipping.
- payment indicator.
- shipping indicator.
- item lines.
- marketplace/source hints.
- field-level confidence.
- raw OCR availability policy.

### Provider Metadata Handling

Provider metadata should be minimized and normalized:

```ts
type PlannedProviderMetadata = {
  providerName?: "local-browser" | "future-provider";
  providerVersion?: string;
  modelOrEngine?: string;
  requestIdStored: false;
  rawResponseStored: false;
  latencyMs?: number;
  costEstimateCents?: number;
  pageCountBilled?: number;
  providerWarnings: string[];
};
```

Provider metadata must not expose credentials, request payloads, raw provider responses, provider dashboard URLs, trace URLs, unredacted request IDs, customer identifiers, or file handles unless a later approved audit policy explicitly allows it.

### Failure And Unsupported States

Future OCR must make failure safe and boring:

- `unsupported`: file type, file size, page count, or evidence kind is outside approved OCR scope.
- `failed`: OCR could not complete because of runtime/provider failure.
- `timed-out`: provider or local worker exceeded the approved timeout.
- `partial`: only some pages, blocks, or fields were extracted.
- `not-run`: policy or mode prevented OCR from running.

Safe failure output:

- "OCR unavailable for this evidence item."
- "Manual review recommended."
- "A clearer or eligible proof-of-purchase document may be needed."
- "No external verification was performed."

Unsafe failure output:

- Any implication that unsupported or failed OCR means wrongdoing.
- Any automatic denial, approval, refund, rejection, or policy decision.

## Receipt Extraction Contract

The future structured receipt contract should be additive and privacy-aware.

Required planned fields:

- `merchant`: merchant/platform text when visible.
- `orderNumber`: order or invoice identifier when visible and safe to expose to the reviewer.
- `purchaseDate`: order, invoice, purchase, or transaction date.
- `total`: selected final/order/receipt total.
- `subtotal`: subtotal or item subtotal when available.
- `tax`: tax/VAT/GST/HST when available.
- `shipping`: shipping, delivery, freight, or handling amount when available.
- `paymentIndicator`: payment/tender type or masked indicator if safe.
- `shippingIndicator`: shipping, delivery, pickup, arrival, or fulfillment cue.
- `itemLines`: product/item rows when available.
- `marketplaceHints`: source/layout cues such as Amazon, Home Depot, Costco, Lowe's, Lazada, iSpring, generic merchant, or unknown.
- `fieldConfidence`: confidence per extracted field.
- `rawOcrPolicy`: whether raw OCR exists, can be returned, can be displayed, can be exported, and can be retained.

Item lines should be cautious:

- Keep product names and row structure only when they are clearly item evidence.
- Keep addresses, names, phones, emails, payment rows, seller rows, billing rows, footers, tracking rows, membership rows, and action/status rows out of item evidence.
- Carry `needsReview` when layout confidence is limited.

Payment and shipping indicators should be safe:

- Prefer "payment cue present" or "masked payment cue present" over raw payment values.
- Prefer "shipping/delivery cue present" over addresses or recipient names.
- Do not store or expose full card details, full addresses, customer names, emails, phones, tracking numbers, loyalty/member IDs, or raw private context rows by default.

Raw OCR policy:

- Browser-local raw OCR may be used transiently for parsing and reviewer inspection under current Phase 1 behavior.
- Server-side raw OCR must not be retained, logged, exported, or fixture-copied without an approved retention and redaction policy.
- Provider raw OCR should be treated as sensitive derived evidence.

## Amazon Receipt Validation Readiness

Future Amazon validation should check receipt/order-page structure, not make fraud conclusions.

Expected Amazon receipt/order page sections:

- Order placed/date or invoice date.
- Amazon-style order number when applicable.
- Items ordered or item/product detail.
- Order summary.
- Order total or amount paid.
- Payment cue.
- Ship to, delivery, arriving, shipment, or fulfillment cue.
- Invoice/detail page cue when applicable.
- Sold by or seller cue when applicable.
- Promotion, coupon, Subscribe & Save, refund, or multi-shipment context when applicable.

Consistency checks to plan:

- Order number format matches expected Amazon pattern when an Amazon source is detected.
- Purchase/order date is present and not contradicted by another extracted date.
- Total aligns with order summary or amount paid section.
- Item lines belong to items ordered, not action/status rows such as tracking or returns.
- Multi-shipment wording is preserved as context, not treated as a mismatch by itself.
- Promotion, gift card, refund, or split-payment wording explains amount differences where visible.

Redaction considerations:

- Shipping address, billing address, recipient names, buyer names, emails, phones, and payment details should be presence/count/context signals by default.
- Payment should be summarized as "payment cue present" or "masked payment cue present" unless a future policy permits more.
- Seller and marketplace rows should be summarized when useful for manual matching without exposing private rows.

Marketplace-specific limitations:

- Amazon app screenshots, print order details, invoices, and mobile order pages use different layouts.
- OCR can split labels from adjacent values.
- Order pages can include action rows that are not item evidence.
- Multi-shipment and promotion wording can make totals look incomplete.
- Region, language, currency, marketplace, and invoice variations may require source-specific parsers later.

Safe mismatch wording:

- "Order/date/total fields need manual comparison."
- "Amazon-style structure is incomplete in the extracted text."
- "A mismatch signal may reflect OCR limits, page variation, or a partial screenshot."
- "Manual proof-of-purchase verification is recommended."

Forbidden mismatch wording:

- Do not say the receipt is fake, forged, fraudulent, or manipulated as a conclusion.
- Do not say the customer misrepresented anything.
- Do not recommend automatic denial, approval, refund, or rejection.

## Browser-Local OCR Versus Server-Side OCR

### Browser-Local OCR

Benefits:

- Keeps evidence bytes in the browser under the current Phase 1 posture.
- Avoids server/provider egress for many receipt cases.
- Avoids provider credentials, provider billing, and provider logs.
- Good fit for small image receipts, readable PDFs, and synthetic/manual QA.

Limits:

- Tesseract/PDF worker performance varies by browser and device.
- Large images, multi-page PDFs, dense tables, and mobile screenshots may be slow or incomplete.
- Browser workers may need runtime assets and can be fragile under network/runtime constraints.
- Layout/table recognition is limited.
- No centralized timeout, cost, retry, or queue control.

Privacy benefits and limits:

- Browser-local analysis reduces evidence egress.
- Runtime assets may still load depending on library configuration.
- Raw OCR and full local result exports can still leak private data if copied without review.

### Server-Side OCR

When server-side OCR may be needed:

- Multi-page PDFs beyond browser performance limits.
- Heavy image preprocessing.
- Better table/layout reconstruction.
- Provider-backed receipt extraction.
- Consistent runtime performance.
- Centralized timeout, file-size, page-count, and cost controls.
- Future case workflow processing after retention/audit policy exists.

Requirements:

- API keys must live only on the server.
- Provider SDKs and env vars require explicit approval.
- No storage by default.
- Temporary processing only until retention policy exists.
- Provider payload logging must be disabled or redacted and approved.
- File size, file type, page count, timeout, and cost limits must be explicit.

Tradeoffs:

- Server-side OCR introduces data egress, provider logs, compliance questions, and retention/deletion duties.
- It can improve OCR quality and reliability, but it must be gated by privacy review and synthetic fixtures first.
- Latency and cost must be visible as operational signals, not hidden behind the receipt score.

Fallback behavior:

- If browser OCR is sufficient, do not call a server provider.
- If server OCR is unavailable, fall back to browser-local OCR or safe "analysis unavailable" output.
- If both fail, return manual-review guidance without changing receipt semantics.

## Server-Side Route Planning Boundary

No server-side OCR route should be implemented in Phase 4.1.

Possible future route shape:

- `POST /api/analysis/ocr`
- `POST /api/ocr/extract`
- `POST /api/evidence/ocr`

Route naming should wait until implementation scope is approved. A future route should probably be internal to an analysis boundary, not a public generic file-processing endpoint.

Planned request contract:

- Accept one eligible receipt/order-screenshot/PDF evidence file.
- Accept only approved MIME types.
- Accept explicit processing mode and requested outputs.
- Reject unsupported file types before provider calls.
- Reject files over approved size/page limits.
- Require no case ID or storage handle for the first prototype.
- Use synthetic fixtures only until real evidence processing is approved.

Planned response contract:

- Return normalized `PlannedOcrExtractionResult`.
- Include status, quality, extracted field confidence, limitations, provider metadata summary, and privacy markers.
- Exclude raw provider payloads.
- Exclude raw OCR unless policy allows it.
- Exclude customer identifiers and private metadata by default.

Temporary processing expectations:

- Keep bytes in memory during request processing only.
- Do not write files to disk/object storage.
- Do not retain provider payloads.
- Do not retain raw OCR.
- Do not log file names, paths, raw text, metadata, provider payloads, addresses, payment details, customer identifiers, or order IDs.

Provider timeout/failure handling:

- Configure short OCR timeout and clear timeout status.
- Limit retry behavior to avoid duplicate cost and duplicate provider traces.
- Convert provider failures into `failed`, `timed-out`, or `partial` outputs.
- Do not convert failures into suspicious signals.

Rate-limit/cost controls:

- Limit file size.
- Limit page count.
- Limit image dimensions or require resizing policy.
- Limit per-session or per-case requests.
- Track estimated provider cost as metadata only.
- Consider queueing only after storage/audit design exists.

## Privacy And Data Handling Rules

Phase 4.1 privacy rules:

- No real evidence processing until explicitly approved.
- No raw OCR retention without policy.
- No metadata retention without policy.
- No file storage until retention/deletion policy exists.
- No provider payload logging unless redacted and approved.
- No customer identifiers in fixtures.
- No credentials, provider account details, request IDs, trace IDs, storage IDs, or integration handles in docs or fixtures.
- No screenshots containing real evidence or private data.

Future redaction strategy:

- Use synthetic OCR fixtures first.
- Use structurally redacted fixture text when realistic layout is needed.
- Replace order IDs with pattern placeholders unless the exact pattern itself is under test.
- Replace names, addresses, emails, phones, payment values, tracking numbers, loyalty IDs, serials, barcodes, QR values, device identifiers, GPS, and private background details.
- Keep field-presence and count summaries where raw values are not needed.
- Require manual privacy review before any copied OCR observation is shared outside local QA.

Provider payload policy:

- Minimize input before provider calls where possible.
- Prefer image/document bytes plus requested output schema, not extra case/customer context.
- Do not send internal notes, claim narratives, customer messages, ticket content, or policy decisions to OCR providers during the OCR phase.
- Treat provider response text and layout data as sensitive derived evidence.

## Scoring And Signal Integration

Future OCR results should become review signals, not verdicts.

Planning rules:

- OCR confidence is a signal, not proof.
- Field mismatch is a manual review driver, not a fraud verdict.
- Do not create a single fraud score.
- Do not migrate `LocalAnalysisResult` yet.
- Do not change `Evidence Reliability Score` semantics.
- Do not map provider OCR directly to automatic claim outcomes.
- Preserve receipt report language and `External Verification: Not performed`.

Recommended future signal categories:

- OCR coverage limit.
- Low-confidence field.
- Field conflict needs manual comparison.
- Amazon section incomplete.
- Total/date/order consistency needs review.
- Unsupported OCR file.
- Provider unavailable.

Each signal should include:

- source.
- severity.
- confidence.
- explanation.
- limitation.
- recommended reviewer check.
- explicit no-decision posture.

Do not let future provider output:

- overwrite parser results without confidence comparison.
- silently change receipt scores.
- imply external verification.
- create customer-accusation language.
- become a denial/refund/approval decision.

## QA And Safety Gates Before Implementation

Before any Phase 4 OCR implementation, require:

- Synthetic OCR fixtures first.
- Synthetic Amazon order-page and invoice/detail OCR fixtures.
- Synthetic low-quality OCR and provider-failure fixtures.
- Receipt regression tests or probes proving existing receipt behavior is unchanged.
- Semantic report guards for new OCR wording and display/export surfaces.
- Provider failure fixtures for unsupported, failed, timed-out, partial, and not-run states.
- Privacy review covering bytes, raw OCR, metadata, provider payloads, logs, screenshots, fixtures, exports, retention, and deletion.
- No overclaiming and no accusation language checks.
- Browser/manual checks for any UI route or display touched later.
- Build/lint/probe checks for any implementation slice.
- Protected code diff scan proving only approved files changed.

Docs-only Phase 4.1 closeout should run:

- `git status --short --branch`.
- `git diff --stat`.
- `git diff --check`.
- `npm.cmd run check:report-semantics`.
- `npm.cmd run check:product-photo-probes`.
- Protected code diff scan confirming no runtime/UI/code files changed.

## Recommended Phase 4 Sequence After 4.1

Recommended next safe tasks:

1. Phase 4.2 synthetic OCR fixture harness: add synthetic OCR input/output expectations only; no real evidence and no provider calls.
2. Phase 4.3 OCR extraction contract implementation, non-live if appropriate: add provider-neutral contract/types/probes without wiring live receipt behavior.
3. Phase 4.4 server-side route planning or prototype, non-live: plan or prototype with synthetic-only/mock provider behavior and no credentials.
4. Phase 4.5 AI Vision output contract: structure observable visual signals, uncertainty, limitations, and no-decision markers.
5. Phase 4.6 photo authenticity signal model: define cautious photo signals as review drivers, not proof or accusation.
6. Phase 4.7 non-live provider integration prototype: mocked/default-off or synthetic-only unless Robert explicitly approves provider credentials and data flow.
7. Phase 4.8 safety review before any live opt-in: receipt regression, privacy review, provider review, browser QA, rollback/default-off plan, and release decision.

This sequence updates the Phase 4.0 recommendation by inserting synthetic OCR fixture work before contract implementation and moving any route/prototype behind a stronger fixture and privacy gate.

## Explicitly Blocked Scope

Phase 4.1 does not authorize:

- real OCR implementation.
- real AI/Vision calls.
- provider SDKs.
- provider credentials.
- environment variables.
- uploads.
- storage or persistence.
- real customer evidence.
- raw OCR retention.
- provider payload logging.
- server analysis routes.
- `ClaimReviewWorkflow` wiring.
- `ProductPhotoReviewPanel` routing.
- `LocalAnalysisResult` migration.
- receipt behavior changes.
- report mapping changes.
- parser/scoring/fixture changes.
- deployment changes.
- integrations.
- auth, billing, organizations, or SaaS platform work.
- live scoring.
- automatic decisions.

## Stop Conditions

Stop future OCR/provider work if:

- A provider SDK, credential, env var, API route, upload path, storage path, persistence layer, or deployment config appears without explicit approval.
- Real customer evidence, raw OCR, metadata, filenames, paths, IDs, object URLs, provider payloads, logs, screenshots, or private customer details enter docs, fixtures, prompts, commits, or artifacts without explicit approval.
- `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser, scoring, report adapter, upload flow, `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, product-photo runtime, or case-shell UI changes outside a named approved slice.
- OCR output is framed as proof, fraud confirmation, fake/forged evidence, customer wrongdoing, automatic denial/refund/approval, or final claim outcome.
- External verification is implied without an approved external verification integration.
- Required checks fail or cannot be interpreted safely.

## Closeout Criteria

Phase 4.1 is ready to close when:

- This planning document exists.
- `ROADMAP.md`, `NEXT_STEPS.md`, `REPO_SOURCE_OF_TRUTH.md`, `AGENTS.md`, and `AGENT_LOG.md` reflect Phase 4.1 planning-only status.
- No runtime/UI/code/route/component/script/package/config/deployment files changed.
- Docs-safe checks pass.
- The next recommended task is Phase 4.2 synthetic OCR fixture harness planning/implementation, not live provider work.
