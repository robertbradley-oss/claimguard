# Phase 2.7.1 Unsupported Evidence Reviewer State Contract

This is a docs-only Phase 2.7.1 contract. It does not implement, wire, route, enable, render, or deploy anything.

Phase 2.7.0 is pushed. Product-photo runtime remains non-live. The default-off `analyzeEvidenceFileWithPreAnalysisGate` wrapper remains unwired from live callers. `analyzeEvidenceFile` remains the live receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, receipt behavior is unchanged, and no unsupported-evidence UI exists yet.

## Contract Goal

Define the reviewer state that must exist before any future live caller can opt into the default-off pre-analysis gate wrapper.

This state is a stop state for files that cannot safely enter the current receipt-only analysis path. It is not a receipt report, not a product-photo report, not a claim decision, and not product-photo analysis.

## State Name And Purpose

Recommended internal state name:

- `unsupportedEvidenceReview`

Recommended result discriminator for a future UI/view contract:

- `resultKind: "unsupported-evidence-review"`

Purpose:

- Tell a support reviewer that automated receipt analysis did not run for this evidence.
- Explain the limitation in neutral terms.
- Keep the file in manual-review territory.
- Avoid routing unsupported or product-photo-like evidence into receipt scoring, receipt report fields, or product-photo report surfaces.
- Preserve receipt analysis behavior for receipt allow paths.

This state may later consume a derived unsupported result from the wrapper. It must not consume raw files, image bytes, raw metadata, raw OCR, product-photo analyzer output, receipt parser output, or live report adapter output.

## Supported Outcomes

The future reviewer state must support these wrapper non-allow outcomes:

- `unsupported-evidence`
- `legacy-damage-photo-quarantine`
- `product-photo-like-unsupported`
- `unknown-inconclusive`

Outcome meanings:

- `unsupported-evidence`: The file does not match an eligible receipt/default path using lightweight hints.
- `legacy-damage-photo-quarantine`: Legacy `damage-photo` terminology appeared and must be treated as a quarantine/compatibility signal, not a live product-photo route.
- `product-photo-like-unsupported`: Lightweight hints suggest product-photo-like evidence, but product-photo runtime remains non-live.
- `unknown-inconclusive`: Lightweight hints are insufficient to route the file into automated receipt analysis.

These outcomes must stay manual-review-only. None of them can imply evidence truth, customer intent, claim disposition, product-photo analysis, or external verification.

## Evidence Type Labels

Recommended stable labels:

| Outcome | Reviewer label | Evidence type display |
| --- | --- | --- |
| `unsupported-evidence` | `Unsupported evidence` | `Unsupported evidence type` |
| `legacy-damage-photo-quarantine` | `Legacy damage-photo terminology quarantined` | `Legacy photo terminology` |
| `product-photo-like-unsupported` | `Product-photo-like evidence unsupported` | `Product photo evidence not supported for live analysis` |
| `unknown-inconclusive` | `Evidence type inconclusive` | `Evidence type could not be routed` |

Label rules:

- Use neutral nouns, not proof or validity labels.
- Use `product-photo-like` only to describe lightweight routing hints.
- Treat `damage-photo` as legacy/non-canonical terminology.
- Do not label the file as fake, forged, invalid, verified, genuine, approved, rejected, or denied.
- Do not call the state a receipt report or product-photo report.

## Required Reviewer Fields

A future implementation should derive a small display contract from the unsupported result. Suggested fields:

```ts
type UnsupportedEvidenceReviewerState = {
  resultKind: "unsupported-evidence-review";
  stateName: "unsupportedEvidenceReview";
  boundary: "pre-analysis-evidence-gate";
  outcome:
    | "unsupported-evidence"
    | "legacy-damage-photo-quarantine"
    | "product-photo-like-unsupported"
    | "unknown-inconclusive";
  reviewerLabel: string;
  evidenceTypeDisplay: string;
  reviewSummary: string;
  recommendedSupportAction: string;
  customerSafeWording: string;
  uncertaintyLevel: "not-analyzed" | "inconclusive-routing";
  confidenceSummary: string;
  manualReviewGuidance: string[];
  limitations: string[];
  externalVerification: "Not performed";
  verificationStatus: "Not externally verified";
  runtimeLive: false;
  productPhotoRuntimeLive: false;
  manualReviewOnly: true;
  receiptScoreShown: false;
  productPhotoReportShown: false;
  proofOfPurchaseLanguageShown: false;
  ocrInvoked: false;
  metadataInvoked: false;
  analyzerInvoked: false;
  providersStorageIntegrationsCaseQueuesInvoked: false;
};
```

This suggested type is documentation only. Do not add it to code until Robert explicitly approves a future implementation slice.

## What The Support Rep Should See

Required visible information for a future rendered state:

- A clear unsupported/manual-review status.
- The neutral evidence type label.
- A short explanation that the current automated flow is receipt-only for live analysis.
- A support action that asks for an eligible receipt document or routes the item to manual review.
- A visible note that external verification was not performed.
- A visible note that no automated analysis result was produced for the stopped file.
- A limitation list that says no OCR, metadata processing, receipt score, or product-photo analysis ran for the stopped file.
- A confidence/uncertainty indicator that means "not analyzed" or "routing inconclusive," not evidence confidence.

The state should be compact enough for a support workflow, but complete enough that a reviewer knows what did and did not happen.

## Required Wording

Recommended review summary:

```text
Automated receipt analysis did not run for this file because the evidence type is not supported by the current live receipt-only flow.
```

Recommended product-photo-like summary:

```text
This file appears product-photo-like from lightweight routing hints, but product-photo runtime is not live. Use manual review or request an eligible receipt document.
```

Recommended legacy quarantine summary:

```text
Legacy damage-photo terminology was quarantined before automated receipt analysis. Treat this as unsupported for live analysis and continue with manual review.
```

Recommended unknown/inconclusive summary:

```text
The file could not be routed to automated receipt analysis with lightweight hints only. Manual review is required.
```

Recommended support action:

```text
Manual review only. Request an eligible receipt document or route the file to a reviewer.
```

Recommended customer-safe wording:

```text
We could not run automated receipt analysis on this file type. Please provide an eligible receipt document if available, or our team can review the submitted evidence manually.
```

Recommended limitation wording:

```text
No receipt score was produced for this file.
No product-photo analysis was performed.
External verification was not performed.
OCR and metadata processing were not run for this stopped file.
This state is not a claim decision.
```

## Confidence And Uncertainty

Unsupported evidence must not use receipt confidence, product-photo confidence, or evidence authenticity confidence.

Allowed uncertainty labels:

- `Not analyzed`
- `Routing inconclusive`
- `Unsupported for automated receipt analysis`
- `Manual review required`

Allowed confidence summary:

```text
Confidence is not assigned because automated analysis did not run.
```

Allowed inconclusive-routing summary:

```text
Lightweight routing hints were insufficient for automated receipt analysis. This should be handled by manual review.
```

Forbidden confidence behavior:

- Do not show a numeric score.
- Do not show a receipt reliability score.
- Do not show a product-photo score.
- Do not show risk bands that look like receipt analysis output.
- Do not imply a high or low likelihood that the evidence is true, altered, or claim-supporting.

## Must Not Be Shown

The unsupported-evidence reviewer state must not show:

- Fraud confirmation.
- Fake or forged claim wording.
- Product-photo report output when runtime is unsupported.
- Receipt score for non-receipt evidence.
- Proof-of-purchase wording for unsupported evidence.
- Verified, valid, invalid, genuine, approved, rejected, denied, automatic denial, or final outcome wording.
- Customer-accusation language.
- External verification language beyond `External Verification: Not performed` and `Verification Status: Not externally verified`.
- Product-photo analyzer signals, product-photo report view-model fields, or `ProductPhotoReviewPanel` output.
- Raw OCR, raw EXIF, raw metadata, image previews, filenames, paths, object URLs, data URLs, provider payloads, storage handles, integration handles, case queue handles, customer identifiers, order identifiers, claim identifiers, ticket identifiers, or evidence identifiers.

## Receipt Preservation Contract

Future implementation must prove:

- Receipt image allow paths still return the same receipt-shaped `LocalAnalysisResult`.
- PDF receipt allow paths still return the same receipt-shaped `LocalAnalysisResult`.
- Order screenshot/default allow paths preserve existing behavior.
- `analyzeEvidenceFile` remains unchanged.
- `LocalAnalysisResult` remains unchanged and receipt-shaped.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` remains receipt-only.
- Receipt parser, scoring, fixtures, OCR behavior, metadata handling, `/test-evidence`, and receipt report wording remain unchanged unless Robert explicitly opens a separate receipt-maintenance task.
- Unsupported outcomes are never forced into receipt score, receipt risk, receipt report, or receipt parser fields.

## Future Implementation Gates

Before any runtime/UI implementation:

- Robert explicitly approves the implementation slice and named allowed/protected files.
- This contract is accepted or amended.
- The future derived display contract is covered by semantic/privacy checks.
- Future probes prove non-allow outcomes stop before OCR, metadata, analyzer, report adapter, upload/UI/report/scoring/parser/fixture, provider/storage/integration/case-queue, and ProductPhotoReviewPanel paths.
- Future probes prove receipt allow paths remain unchanged.
- Future UI/browser smoke plan exists if any rendered reviewer state is added.
- Future copy is checked for manual-review-only and non-accusatory wording.
- Rollback behavior is documented before live caller opt-in.

## Future QA And Browser Smoke Requirements

For a future implementation slice, minimum probe cases:

- `unsupported-evidence`
- `legacy-damage-photo-quarantine`
- `product-photo-like-unsupported`
- `unknown-inconclusive`
- receipt image allow path
- PDF receipt allow path
- order screenshot/default allow path
- hostile/private sentinel omission
- long-text wrapping for customer-safe wording
- all no-live/no-OCR/no-metadata/no-provider flags visible or asserted

Minimum semantic/privacy checks:

- Deny proof, fake/forged, fraud confirmation, final outcome, approval, rejection, denial, automatic disposition, and customer-accusation wording outside explicit forbidden-wording documentation.
- Deny receipt score and product-photo report wording on unsupported state files.
- Deny imports from product-photo analyzer, ProductPhotoReviewPanel routing, live report adapter mapping, upload modules, providers, storage, integrations, case queues, fixtures, parser, scoring, and analyzer entrypoints unless explicitly approved.
- Deny raw filenames, paths, object URLs, data URLs, image bytes, raw OCR, raw EXIF, raw metadata, customer/order/claim/ticket/evidence IDs, provider payloads, and storage/integration handles.

Minimum browser smoke, only if rendered UI is added:

- Desktop and mobile views load without console errors.
- Unsupported/manual-review status is visible.
- External verification not performed is visible.
- No receipt score is visible.
- No product-photo report is visible.
- No image/file preview is visible.
- Text wraps without overlap or clipped labels.
- `/` receipt workflow remains linked only to the existing receipt flow unless a separate live opt-in is explicitly approved.

## Protected Surfaces

Protected until Robert explicitly approves a future implementation slice:

- `src/lib/analysis/analyzer.ts`
- `src/lib/analysis/types.ts`
- `src/lib/analysis/report-adapter.ts`
- `src/lib/analysis/receipt-parser.ts`
- `src/lib/analysis/scoring.ts`
- `src/lib/test-evidence/`
- `src/components/ClaimReviewWorkflow.tsx`
- `src/components/UploadPanel.tsx`
- `src/components/ProductPhotoReviewPanel.tsx`
- `src/app/page.tsx`
- `src/app/test-evidence/`
- Upload files
- Live report mapping
- Product-photo analyzer/routing files
- Providers, storage, integrations, case queues
- OCR/metadata code
- Fixtures
- Package scripts/dependencies
- Deployment files

## Stop Conditions

Stop any future implementation if:

- Product-photo runtime becomes live.
- The wrapper is wired into live callers without Robert explicitly approving that slice.
- `analyzeEvidenceFile` changes.
- `LocalAnalysisResult` changes or receives unsupported/product-photo fields.
- Receipt analysis behavior changes unexpectedly.
- ProductPhotoReviewPanel is used for unsupported evidence.
- Unsupported evidence is mapped through the receipt report adapter.
- A receipt score is shown for non-receipt evidence.
- Product-photo report output is shown for unsupported evidence.
- OCR or metadata processing runs for stopped non-allow files.
- Providers, storage, integrations, case queues, network calls, auth, database, or deployment paths appear.
- Real evidence, real metadata fixtures, private identifiers, raw OCR, raw EXIF, raw metadata, paths, URLs, or screenshots with private details appear.
- Wording implies proof, external verification happened, wrongdoing, customer accusation, automatic disposition, approval, rejection, denial, or final claim outcome.
- Required checks fail or cannot be interpreted safely.

## Phase 2.7.1 Decision

This contract is sufficient as a docs-only planning artifact for reviewer-state acceptance criteria. It does not make unsupported evidence visible in the app and does not authorize runtime opt-in.

Recommended next safe task after review:

```text
/claimguardagent review and, if approved, commit the docs-only Phase 2.7.1 unsupported-evidence reviewer state contract if docs-safe checks pass; do not push, deploy, implement UI, wire runtime, change upload/report mapping, route ProductPhotoReviewPanel, edit analyzer entrypoints, or change receipt behavior
```
