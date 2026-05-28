# Phase 2 Photo Evidence Plan

This document defines Phase 2 before runtime implementation. It is planning guidance only.

Phase 1 Receipt Intelligence is closed, pushed, deployed, and production-smoked. Phase 2.0 scaffold work is closed. Phase 2.1 Product Photo Local Heuristic Design is reviewed and closed. Phase 2.2 Product Photo Boundary and Display Readiness is closed after non-live helper, result, routing, view-model, display, synthetic render-host, semantic/privacy guard, and desktop/mobile browser-QA work. Phase 2.3 Product Photo Local Heuristic Analyzer hardening is closed after the no-live-wiring readiness closeout. Phase 2.4 adapter readiness planning is closed for the non-live checkpoint. Phase 2.4.5 legacy `damage-photo` quarantine/migration planning is closed in `LEGACY_DAMAGE_PHOTO_QUARANTINE_PLAN.md`. Phase 2.4.6 no-live legacy classifier quarantine hardening is closed: the live classifier now collapses legacy damage/product/photo/crack image filename cues to the existing receipt/default path instead of returning `damage-photo`. This is classifier-label hardening only, not a pre-OCR/pre-metadata product-photo privacy boundary. The durable Phase 2.4 adapter readiness plan lives in `PRODUCT_PHOTO_ADAPTER_READINESS_PLAN.md`; the Phase 2.4.3 dev-only adapter review harness plan lives in `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md`; the Phase 2.4.4 runtime blockers plan lives in `PRODUCT_PHOTO_RUNTIME_BLOCKERS_PLAN.md`.

Phase 2.2 did not make product-photo runtime live. `analyzeEvidenceFile` remains the live receipt analyzer entrypoint, `LocalAnalysisResult` remains receipt-shaped, receipt UI/report behavior remains unchanged, and product-photo remains out of upload routing, live report adapter mapping, scoring, parser behavior, fixtures, providers, storage, integrations, and case queues.

Phase 2.3.5 and Phase 2.3.6 did not make product-photo runtime live. Canonical `product-photo` remains the only Phase 2 product-photo concept. Legacy `damage-photo` remains a receipt-era/mock compatibility alias and must not be treated as live canonical product-photo support without a separate authorized quarantine/routing slice.

ClaimGuard is a fraud-risk screening and evidence intelligence platform for support and warranty teams. Receipt analysis is one evidence module inside that broader system. Phase 2 should add photo evidence readiness without turning ClaimGuard into a toy image checker, a generic AI chatbot, a generic SaaS dashboard, or an automatic decision system.

The active UI direction remains the current polished warm/light evidence-lab workspace. The long-term ClaimGuard vision still points toward evidence intelligence and fraud-review command-center behavior, but Phase 2 does not require a dark command-center redesign. The current surface can stay light, focused, and enterprise-serious if the workflow remains evidence-first, dense enough for review, and free of generic SaaS patterns.

## 1. Phase 2 Purpose

Phase 2 prepares ClaimGuard to review product-damage photos as a second evidence module alongside receipt intelligence.

The purpose is to help support reviewers understand whether a submitted product photo is useful, complete, internally consistent, and ready for manual warranty or claims review.

Phase 2 should help answer:

- Is the damaged area visible enough for review?
- Is the product context complete enough to understand what is being shown?
- Is the photo quality sufficient for manual inspection?
- Are there local image-quality, context, metadata, or consistency signals that should guide the next review step?
- What additional photo or proof-of-purchase detail should support request when the current evidence is inconclusive?

Phase 2 must not claim customer intent, decide whether evidence is true, or create an automatic outcome.

Initial Phase 2 emphasis:

1. Damage close-ups.
2. Full product context as the required companion category.
3. Serial/model labels.
4. Packaging damage.
5. Installation context.

Damage close-ups are the core Phase 2 use case, but they are easy to misread without broader context. Full product context should ground the close-up so support can understand what product or system the damage belongs to and whether the evidence is useful for manual review.

## 2. What Phase 2 Is And Is Not

Phase 2 is:

- A photo evidence planning and implementation phase after Robert explicitly opens implementation.
- A product-damage photo evidence module.
- A local evidence-quality and context review layer.
- A way to categorize review-support signals for damage visibility, product context, image quality, and image consistency uncertainty.
- A step toward a shared evidence model that can support receipts, screenshots, PDFs, photos, and future evidence types.
- A manual-review support tool with safe customer language.

Phase 2 is not:

- A real AI vision integration unless Robert separately opens that work.
- A third-party evidence upload workflow.
- A final authenticity or wrongdoing determination.
- A replacement for support policy or human review.
- A case queue, audit history, database, auth system, ticket integration, or enterprise intelligence feature.
- A dark command-center redesign.
- A reason to destabilize Phase 1 receipt behavior.

## 3. Product Damage Photo Evidence Taxonomy

Phase 2 should classify product photo evidence using review-oriented categories. These categories support manual review; they do not prove intent or determine the claim outcome.

Evidence subject:

- Damage close-up: the first supported Phase 2 photo category and main analysis target. It shows scratches, cracks, dents, leaks, broken fittings, or other visible damage patterns, but requires context before support treats it as useful review evidence.
- Full product context: the required companion category for damage close-ups. It shows the whole product, system, or enough surrounding context to identify where the close-up belongs.
- Serial/model label photo: a follow-on category for policy or product matching when model, SKU, label, or serial context is needed.
- Packaging or shipping damage photo: a later category for box, label area, cushioning, carrier, or transit context.
- Installation/context photo: a later category for installation area, usage context, or surrounding environment when support troubleshooting rules are ready.
- Mixed evidence image: combines product, receipt, screenshot, label, or other evidence in one image.
- Inconclusive photo: too cropped, blurry, dark, small, or ambiguous to classify safely.

Priority notes:

- Start with damage close-up review because it is the core warranty/support damage evidence path.
- Require full product context as the grounding companion because a close-up alone can be incomplete.
- Add serial/model labels after the core close-up/context path because label review is closer to verification and OCR.
- Add packaging damage after serial/model labels because it is more of a shipping or carrier evidence path.
- Add installation context later because it can require product knowledge, plumbing context, support troubleshooting rules, or policy-specific interpretation.

Damage visibility:

- Damage clearly visible.
- Damage partially visible.
- Damage claimed but not visible from current image.
- Damage area visible but product context missing.
- Product visible but damage area missing.
- Multiple damage areas visible.
- Possible normal wear, installation context, or lighting artifact requiring manual review.

Product context:

- Product identity visible.
- Product identity partially visible.
- Product identity not visible.
- Model or serial context visible.
- Purchase/receipt context not present.
- Photo needs purchase matching against receipt or order record.

Review completeness:

- Single photo may be sufficient for initial triage.
- Needs wider product photo.
- Needs close-up of damaged area.
- Needs serial/model label photo.
- Needs packaging/shipping context.
- Needs proof-of-purchase matching.
- Needs support-policy review before next step.

## 4. Safe Signal Language

Use signal language that guides review without sounding accusatory.

Preferred signal labels:

- Photo quality limits review.
- Product context is incomplete.
- Damage area needs clearer view.
- Wider product photo recommended.
- Serial or model context needed.
- Packaging context may be useful.
- Image consistency uncertainty needs manual review.
- Metadata context is limited.
- Findings are inconclusive from current photo.
- Manual review recommended.
- Additional evidence may be needed.
- Purchase match still required.

Preferred explanations:

- "The current photo does not show enough surrounding product context for confident manual review."
- "The damaged area is visible, but a wider product photo would help confirm location and product identity."
- "Image quality may limit review. A clearer photo may be needed before support can complete the case."
- "Metadata is context only and should not be used by itself as a claim decision."
- "External verification was not performed."
- "This signal supports review priority only."

## 5. Forbidden And Unsafe Wording

Avoid wording that accuses the customer, treats local signals as proof, or implies automatic outcomes.

Do not say:

- The image proves the damage is real.
- The image proves the damage is not real.
- The evidence is definitively valid or invalid.
- The photo received a final external evidence determination.
- The customer caused the damage.
- The claim outcome is decided based on photo analysis.

Avoid strong labels unless they are carefully framed:

- Do not use final evidence-origin labels from local signals.
- Use "image consistency uncertainty," "additional context needed," or "manual review recommended" when the evidence only supports further review.

## 6. Customer-Safe Support Language Rules

Customer-facing language should ask for useful evidence without accusation.

Safe patterns:

- "Thanks for sending the photo. To complete the review, could you send one wider image showing the full product and the damaged area together?"
- "The current photo is helpful, but we need one clearer image before we can finish the warranty review."
- "Could you also send a photo of the model or serial label if it is available?"
- "We may need one proof-of-purchase detail to match the product to the order record."
- "Some details are hard to confirm from the current image, so an additional photo may help us complete the review."

Rules:

- Ask for the minimum additional evidence needed.
- Explain the reason in neutral terms.
- Do not mention suspected wrongdoing.
- Do not expose internal score details to customers by default.
- Do not tell customers that the image passed or failed an authenticity check.
- Keep support language focused on completing review, warranty policy, product context, and purchase matching.

## 7. Photo Metadata / EXIF Privacy Rules

Photo metadata can contain private or sensitive information. Treat it as evidence context only.

Phase 2 metadata rules:

- Do not expose raw EXIF by default.
- Do not copy or export GPS coordinates.
- Do not expose device serial numbers, camera owner fields, software identifiers, file paths, or precise timestamps by default.
- Do not treat missing EXIF as suspicious by itself.
- Do not treat stripped metadata as proof of editing.
- Do not store real customer photo metadata in committed fixtures, docs, screenshots, issues, logs, or prompts.
- Keep real customer photo evidence browser-local unless Robert explicitly approves another workflow.
- Prefer presence/count/status summaries over raw metadata values.

Safe metadata summary fields:

- metadataContext: Available, Limited, or Unavailable.
- dimensionsPresent: true or false.
- dimensionsBucket: small, medium, large, or very large.
- captureTimestampPresent: true or false.
- gpsPresent: true or false, but never raw coordinates.
- editingSoftwareFieldPresent: true or false, but no raw software value by default.
- metadataNotes: safe short notes.

GPS handling:

- GPS presence can be noted for privacy review.
- Raw coordinates must be omitted from copied summaries and fixtures.
- If GPS is ever needed for a future explicitly opened workflow, it requires a separate privacy and retention decision.

## 8. Image-Quality And Consistency-Uncertainty Categories

Phase 2 should separate quality limits from image consistency signals. Poor quality is often just poor quality; it must not be treated as evidence of wrongdoing.

Image-quality categories:

- Blur or motion blur.
- Low resolution.
- Heavy compression.
- Poor lighting.
- Glare or reflection.
- Occlusion.
- Tight crop.
- Low contrast.
- Partial product visibility.
- File too small or unusually downscaled.
- Unsupported or degraded format.

Damage-review categories:

- Damage visible.
- Damage location unclear.
- Damage scale unclear.
- Damage near product edge or label.
- Damage context missing.
- Product identity missing.
- Serial/model context missing.
- Multiple photos needed.

Image consistency categories:

- Lighting inconsistency needing review.
- Edge inconsistency needing review.
- Compression mismatch needing review.
- Local texture inconsistency needing review.
- Duplicate or reuse context needing future review.
- Screenshot-of-photo context needing review.
- Metadata and visual context mismatch needing review.

Important distinction:

- Quality limits support clearer-photo requests.
- Consistency-uncertainty signals support manual review.
- Neither category proves evidence truth or determines the claim outcome.

## 9. Provider-Dependent Image-Origin Uncertainty Rules

Phase 2 may plan for image-origin uncertainty, but implementation must wait until Robert explicitly opens provider or local-model support.

Rules:

- Do not make image-origin determinations from local heuristics alone.
- Do not expose categorical image-origin conclusions to support reps unless the underlying evidence and policy are explicitly opened.
- Use "image-origin uncertainty signal" only as internal review-support wording.
- Require multiple supporting signals before surfacing any image-origin concern.
- Prefer "manual review recommended" over categorical labels.
- Keep customer-facing language neutral and focused on requesting clearer or additional product context.
- Treat image-origin signals as low-confidence unless validated by explicitly opened tooling and QA evidence.

Safe internal wording:

- "Image-origin uncertainty signal."
- "Visual consistency needs manual review."
- "Photo context is insufficient to assess from current image."
- "Additional photo evidence may be needed."

## 10. Duplicate / Reuse Detection Future Notes

Duplicate and reuse detection belongs to a later readiness path unless Robert explicitly opens it.

Future possibilities:

- Compare submitted image against other evidence in the same case.
- Compare near-duplicates across uploads within a browser-local session.
- Track perceptual hash summaries if a privacy model is explicitly opened.
- Detect repeated product photos across claims only after platform, retention, privacy, and legal review.

Do not build yet:

- Cross-customer image matching.
- Enterprise photo reuse intelligence.
- Persistent image fingerprint storage.
- Automatic escalation based on duplicate detection.
- Real database-backed image history.

Phase 2 can document how duplicate/reuse notes might fit later, but should not implement cross-case intelligence.

## 11. Fit With A Future Shared Evidence Model

Phase 2 should move toward a shared evidence model before adding photo-specific behavior.

Future shared fields:

- evidenceId.
- evidenceType.
- evidenceLabel.
- inputFileSummary.
- localProcessingSummary.
- verificationStatus.
- externalVerification.
- evidenceQuality.
- evidenceContext.
- extractedAttributes.
- signals.
- findingGroups.
- score.
- scoreMeaning.
- recommendedSupportAction.
- customerSafeWording.
- privacySafeExport.

Evidence-specific modules should populate module sections:

- receipt: source classification, parsed fields, receipt structure, OCR details, proof-of-purchase matching cues.
- productPhoto: damage visibility, product context, image quality, image consistency, photo metadata context, requested additional views.
- screenshot: source context, crop/context completeness, visible fields, account/order context.
- pdf: text layer, page count, preview status, document structure.

Shared model rules:

- The top-level score remains evidence reliability and review readiness, not proof.
- `External Verification: Not performed` remains the default until an explicitly opened integration changes it.
- Receipt-specific fields must not be required for photo evidence.
- Photo-specific fields must not change receipt scoring by accident.
- Shared signal categories should be broad enough for future case review without forcing Phase 3 implementation.

## 12. What Should Remain Receipt-Specific

The following should stay in the receipt module:

- Merchant/source classification.
- Amazon, iSpring, Lowe's, Home Depot, Costco, Lazada, generic merchant, and unknown receipt lanes.
- Order-number extraction and validation.
- Purchase date extraction.
- Total, subtotal, tax, shipping, discount, refund, and payment parsing.
- Line item and product-detail parsing from OCR text.
- Receipt structure confidence.
- Receipt-specific score details.
- Receipt-specific source summaries.
- Receipt-specific fixture set.
- Receipt-specific OCR tuning notes.

Do not make product photos pretend to have receipt fields. A photo may need purchase matching, but that should be represented as a review requirement, not missing receipt fields.

## 13. QA Fixture Plan

Phase 2 QA should use synthetic or anonymized-safe photos only.

Synthetic fixture categories:

- Clear damage close-up with visible damage area.
- Damage close-up with missing full-product context.
- Damage close-up with poor image quality.
- Full product context companion photo for a damage close-up.
- Full product context photo with no visible damage from current image.
- Blurry or low-resolution damage photo.
- Overexposed or glare-heavy photo.
- Tight crop showing damage but not product identity.
- Photo with serial/model label visible.
- Packaging damage photo.
- Installation/context photo.
- Screenshot of a product photo.
- Multiple-photo scenario represented as separate synthetic files only after the single-photo model is stable.

Anonymized-safe real photo QA:

- Use local-only, browser-memory sessions.
- Remove faces, people, addresses, labels, serials, QR codes, barcodes, account identifiers, location metadata, and private background details unless they are explicitly needed and privacy-reviewed.
- Do not commit real photos.
- Do not include real photo screenshots in docs or issues.
- Prefer synthetic fixtures for committed assets.

Manual expectations:

- Fixture labels remain advisory until enough stable evidence exists.
- Do not make photo fixture expectations CI-blocking at first.
- Keep OCR expectations separate from photo-quality expectations.
- Distinguish damage visibility, product context, metadata context, and image consistency in fixture results.

## 14. Privacy-Safe Observation Format

Photo observations should omit raw private-bearing content by default.

Preferred observation shape:

```json
{
  "exportType": "privacy-safe-photo-evidence-observation",
  "privacyPosture": "Omit raw photo, original filename, EXIF values, GPS coordinates, serial/model values, labels, barcodes, faces, people, addresses, and background private details by default.",
  "evidenceType": "product-photo",
  "file": {
    "mimeType": "image/jpeg",
    "sizeBucket": "medium",
    "dimensionBucket": "large"
  },
  "photoContext": {
    "subjectType": "damage-close-up",
    "damageVisibility": "partially-visible",
    "productContext": "incomplete",
    "serialOrModelContextPresent": false,
    "packagingContextPresent": false
  },
  "quality": {
    "qualityLevel": "limited",
    "qualityLimits": ["tight-crop", "low-light"]
  },
  "metadata": {
    "metadataContext": "limited",
    "gpsPresent": false,
    "captureTimestampPresent": false,
    "rawExifOmitted": true
  },
  "signals": [
    {
      "title": "Product context is incomplete",
      "severity": "Medium",
      "confidence": 62,
      "recommendation": "Request a wider product photo showing the damaged area and surrounding product context."
    }
  ],
  "score": {
    "label": "Evidence Reliability Score",
    "value": 64,
    "meaning": "Score reflects photo review readiness and local evidence quality only."
  },
  "verification": {
    "status": "Local analysis only",
    "externalVerification": "Not performed"
  }
}
```

Observation rules:

- No raw image.
- No original filename.
- No raw EXIF.
- No GPS coordinates.
- No serial/model value by default.
- No barcode/QR contents.
- No faces, names, addresses, or background private details.
- No customer accusation language.
- No automatic outcome language.

## 15. Manual Review Recommendations

Photo evidence should guide support toward the next useful step.

Recommendation patterns:

- Request a wider product photo when the close-up lacks context.
- Request a closer damage photo when the damage area is hard to see.
- Request a serial/model label photo only when policy requires it.
- Request packaging or shipping context only when transit damage is relevant.
- Match product photo evidence against receipt/order evidence before final handling.
- Keep cases in manual review when image quality or context is inconclusive.
- Escalate to a senior reviewer when multiple signals are present, but do not imply an automatic result.

Recommendation output should include:

- Why the current photo is incomplete or useful.
- What single additional evidence item would help most.
- Whether proof-of-purchase matching is still needed.
- Whether metadata is only context.
- Whether the result is local-only and external verification was not performed.

## 16. Phase 2 Runtime Implementation Prerequisites

Before Robert opens Phase 2 runtime implementation, the project should have:

- Clear separation between receipt analysis and photo evidence analysis.
- A product-photo signal taxonomy.
- A photo privacy and EXIF handling policy.
- A privacy-safe photo observation format.
- Synthetic fixture categories explicitly opened.
- Manual QA expectations for photo evidence.
- Customer-safe support copy patterns.
- A decision on whether the next slice is local-heuristics-only or provider-readiness-only.
- Explicit confirmation that no AI/vision provider will be connected unless separately opened.
- A rollback-safe implementation order.

## 16A. Product-Photo-Safe Report/UI Mapping Gate

Product-photo report/UI mapping must be planned and reviewed before product-photo results appear in any support surface.

This gate means an isolated adapter or view-model can translate the shared product-photo result into a support-safe summary. It does not mean live upload routing, live analyzer routing, UI display, report display, scoring changes, parser changes, fixture changes, provider calls, storage, integrations, or case queues.

The first mapping implementation slice should:

- Keep receipt report behavior unchanged.
- Keep `LocalAnalysisResult` receipt-shaped.
- Keep product-photo in `ProductPhotoEvidenceAnalysisResult` or the shared `EvidenceAnalysisResult` envelope.
- Keep `analyzeEvidenceFile` as the live receipt analyzer entrypoint.
- Keep product-photo runtime non-live.
- Map only derived review-support fields such as review readiness, local evidence quality, product context, damage visibility review context, image quality limits, image consistency review signals, requested next views, manual-review recommendation, score meaning, review priority, confidence, and external verification not performed.
- Omit raw photo bytes, raw metadata, raw EXIF, original filenames, GPS coordinates, raw serial/model/label values, barcode or QR contents, people, faces, addresses, private backgrounds, customer identifiers, provider output, storage handles, integration IDs, and case queue IDs.
- Keep customer and reviewer language neutral, inconclusive where needed, manual-review-only, and focused on the next useful evidence request.

Required checks before product-photo mapping can be displayed:

- A product-photo mapping probe that proves product-photo maps to a separate display-safe shape, not `LocalAnalysisResult`.
- A result-shape probe that forbids receipt-only fields, final-decision fields, raw metadata fields, provider output, storage handles, integration handles, and case queue fields.
- A privacy probe that proves display/export output omits private-bearing fields.
- A wording probe or semantic check expansion that covers product-photo mapping and future display surfaces.
- Isolation checks proving mapping does not invoke upload routing, live analyzer routing, `analyzeEvidenceFile`, parser, scoring changes, fixtures, providers, storage, integrations, or queues.

Stop if implementation requires receipt-only result fields, changes receipt report output, exposes private photo or metadata content, implies evidence truth or customer wrongdoing, or needs live routing before a separate runtime slice is opened.

## 16B. Product-Photo Report/UI Display Gate

Product-photo UI display must remain blocked until a separate implementation slice proves that product-photo review output can be presented without changing the receipt workflow, upload routing, analyzer routing, live report-adapter mapping, scoring, parser behavior, fixtures, providers, storage, integrations, or case queues.

The first display slice should consume only `ProductPhotoReportViewModel` or a similarly narrow product-photo display model. It should not consume `ProductPhotoEvidenceAnalysisResult` directly, should not spread product-photo module details or metadata summaries, should not reuse receipt-only report models, and should not make product-photo runtime behavior live.

Safe display content:

- Review readiness, local evidence quality, score meaning and scope, review priority, confidence, limitations, product context status, damage visibility review context, requested additional views, manual-review recommendation, customer-safe wording, and external verification not performed.
- Privacy posture fields showing raw/private-bearing content is omitted.
- Review signals framed only as manual-review support.

Display and export must omit:

- Raw photo bytes, image buffers, raw EXIF, raw metadata, original filenames, precise timestamps, GPS coordinates, raw serial/model/label values, barcode or QR contents, people, faces, addresses, customer identifiers, private backgrounds, private evidence snippets, provider output, storage handles, integration IDs, case queue IDs, retained image fingerprints, and final outcome fields.

Before implementation, require:

- A product-photo display-shape probe proving the UI consumes a product-photo-specific view model, not `LocalAnalysisResult` or receipt report types.
- A UI isolation probe proving no upload routing, live analyzer routing, `analyzeEvidenceFile`, parser, receipt scoring, fixtures, providers, storage, integrations, or case queues are invoked.
- Receipt preservation checks proving the receipt UI/report path remains unchanged.
- Privacy display/export checks proving forbidden fields cannot render or copy.
- Safe-wording coverage for every new display/export file.
- Passing lint, build, report semantic checks, and diff check.

Stop if product-photo display requires receipt-only fields, appears inside receipt-specific OCR/parser/extracted-data UI, changes receipt behavior, exposes raw/private-bearing evidence, implies proof or a completed support outcome, or depends on live routing/provider/case-workflow behavior before those slices are explicitly opened.

### First Standalone Component Slice

The first standalone product-photo display component slice should be planned as a component contract before implementation.

The future component is a support-facing product-photo evidence-review panel, tentatively `ProductPhotoReviewPanel`. It consumes only the safe report view model and remains separate from the live upload/analyzer workflow.

Required prop contract:

```ts
import type { ProductPhotoReportViewModel } from "@/lib/analysis/product-photo-report-view-model";

type ProductPhotoReviewPanelProps = {
  viewModel: ProductPhotoReportViewModel;
};
```

Do not add additional props in the first component slice. In particular, do not pass files, blobs, object URLs, image URLs, image bytes, metadata summaries, raw product-photo results, callbacks, export payloads, upload state, receipt report types, or live analyzer state.

The component should render one cohesive evidence-review panel rather than a generic card stack. Required sections are:

- Header with review title, manual-review/local-only status, and external verification not performed.
- Separate review priority, confidence, evidence quality, score meaning, limitations, and recommended action.
- Product context with requested additional views and purchase/order match need.
- Review signals as the primary rationale, with severity, confidence, review note, and recommended review step.
- Privacy posture showing derived-summary-only handling and raw/private-bearing fields excluded.

The component must not own image preview display. Any evidence preview anchoring belongs to a later `ClaimReviewWorkflow` insertion slice and must not introduce object URLs, raw images, or file handles into the display component.

The future slice must add semantic/privacy coverage for every new display/export file, prove receipt UI/report behavior remains unchanged, and keep product-photo runtime non-live. Stop if the component needs live routing, report-adapter mapping, receipt-only fields, raw/private data, provider output, storage/integration/case handles, final outcome wording, or external-verification wording beyond not performed.

### Non-Live Render Host Gate

`ProductPhotoReviewPanel` now exists as an isolated display component. A future render host may be useful for browser and visual QA, but it must remain a synthetic developer verification surface rather than live product-photo UI.

Recommended posture:

- Prefer a non-route component/browser harness if suitable tooling is added later.
- If a URL-based browser check is needed first, use a separate unlinked developer route such as `src/app/dev/product-photo-review-panel/page.tsx` with colocated literal synthetic cases in `src/app/dev/product-photo-review-panel/render-cases.ts`.
- Do not place the host under `/test-evidence`, because that surface is receipt/manual QA and can couple the host to live analyzer expectations.
- Production-disable the route with `notFound()` or equivalent unless Robert explicitly approves deployed QA access.

Host data must be literal `ProductPhotoReportViewModel` cases only. Do not call the product-photo mapper, product-photo analyzer, analyzer routing, receipt analyzer, report adapter, upload flow, fixture helpers, provider code, storage code, integrations, or case queues. Do not import existing probe files into the host.

Required synthetic cases should cover missing context, complete context, no requested views, multiple requested views, low/medium/high score states, no review signals, long text, limited or missing metadata summaries, label context with raw values omitted, and high-score-not-proof copy.

The host must not include or render real photos, uploaded images, image URLs, object URLs, file/blob data, raw EXIF, raw metadata, original filenames, raw label values, serial/model/barcode/QR values, case IDs, ticket IDs, evidence IDs, claim IDs, customer identifiers, provider IDs, storage IDs, integration IDs, case queue IDs, URLs, Windows paths, or realistic order/customer details.

Visual QA should verify:

- Desktop and mobile rendering.
- No console errors.
- Required sections visible.
- Score, review priority, confidence, evidence quality, and limitations visually distinct.
- Manual-review-only copy visible.
- `External Verification: Not performed` visible.
- High score does not imply proof.
- Severity and confidence are labeled with text, not color alone.
- No text overlap, no clipped labels, no primary nested scrolling, and no analysis-running motion.

The future host files must be added to `scripts/check-report-semantics.mjs` as product-photo display surfaces. Semantic checks should deny forbidden imports, raw/private field names, URL/path patterns, private identifiers, realistic customer/order data, unsafe outcome wording, and any permission to wire the host into the live workflow.

Stop if the host touches `ClaimReviewWorkflow`, `/`, `/test-evidence`, upload routing, `analyzeEvidenceFile`, analyzer routing, live report mapping, scoring, parser behavior, fixtures, providers, storage, integrations, case queues, receipt UI/report behavior, `LocalAnalysisResult`, or product-photo runtime behavior.

## 16C. Product-Photo Adapter Readiness Gate

Phase 2.4 plans and hardens the non-live adapter contract before any live adapter implementation. The complete adapter readiness plan is maintained in `PRODUCT_PHOTO_ADAPTER_READINESS_PLAN.md`.

The adapter readiness gate means:

- A future adapter contract may be implemented only as a dev/probe-only boundary.
- The future adapter may accept sanitized `ProductPhotoEvidenceAnalysisResult` or `ProductPhotoReportViewModel` shaped data only.
- The future adapter must derive or canonicalize score, confidence, review priority, local signal level, source kind, review status, evidence summary, recommended support action, customer-safe wording, limitations, signals, external-verification status, privacy posture, and non-live boundary flags.
- The future adapter must not accept raw files, image bytes, image buffers, object URLs, image URLs, raw EXIF, raw metadata, original filenames, precise timestamps, GPS coordinates, raw labels, provider output, storage handles, integration handles, case queue handles, or customer/case identifiers.
- The future adapter must not require `LocalAnalysisResult`, `MockAnalysisReport`, receipt OCR fields, receipt parser fields, receipt score breakdown, receipt report adapter output, or receipt fixtures.
- The future adapter must keep all product-photo findings manual-review-only and must not imply proof, customer wrongdoing, final claim outcome, automatic handling, external verification, approval, rejection, denial, or policy disposition.

Phase 2.4.1 implementation status:

- `prepareProductPhotoAdapterReadinessForDevOnlyBoundary` exists inside the isolated product-photo adapter module as a dev/probe-only readiness boundary.
- The readiness boundary accepts sanitized `ProductPhotoEvidenceAnalysisResult` and `ProductPhotoReportViewModel` shaped data only, derives/canonicalizes readiness fields, and keeps `runtimeLive: false`.
- The adapter-readiness probe actively checks canonical `product-photo` result/view-model inputs, hostile unsupported values, low/medium/high score scope, privacy sentinels, exact metadata omission, and import/isolation boundaries.
- The readiness boundary is not imported by upload, UI, live report mapping, `analyzeEvidenceFile`, analyzer routing, receipt scoring/parser/fixtures, providers, storage, integrations, or case queues.

Legacy `damage-photo` handling remains quarantine-only:

- New adapter/readiness files should use canonical `product-photo`.
- `damage-photo` may appear in future probes only as a compatibility/quarantine scenario.
- The adapter must not treat `damage-photo` as canonical runtime support.
- The Phase 2.4.1 dev routing adapter now refuses to build product-photo details for the legacy alias and the readiness probe confirms the alias is not accepted as adapter readiness.
- Future live routing must handle legacy `damage-photo` quarantine in a separate authorized slice before product-photo runtime support.

Before any Phase 2.4.1 adapter contract implementation, the future prompt must preserve:

- `analyzeEvidenceFile` as the live receipt analyzer entrypoint.
- `LocalAnalysisResult` as receipt-shaped.
- `mapLocalAnalysisToReport(result: LocalAnalysisResult)` as receipt-only.
- `ClaimReviewWorkflow`, upload, live report mapping, receipt scoring/parser/fixtures, providers, storage, integrations, case queues, real photos, and real metadata fixtures as blocked.

Required future gates:

- `npm.cmd run check:report-semantics`.
- `npm.cmd run check:product-photo-probes`.
- Adapter-specific probe registration if a new probe module is added.
- Semantic coverage for every new adapter/readiness file.
- Protected import/coupling scans.
- Unsafe wording checks.
- Raw metadata/privacy sentinel checks.
- Receipt preservation checks.

### Phase 2.4.3 Dev-Only Adapter Review Harness Plan

Phase 2.4.3 is docs-only. It defines a possible future dev-only adapter review harness in `PRODUCT_PHOTO_DEV_HARNESS_PLAN.md` without implementing a route, component, harness, runtime adapter execution path, upload path, live report mapping, provider, storage, integration, case queue, real photo fixture, or real metadata fixture.

The planned harness may review only literal synthetic adapter-readiness outputs. It should be display-only and must not call `prepareProductPhotoAdapterReadinessForDevOnlyBoundary` from a route or component. A rendered harness, if later approved, should use static synthetic cases that make `readinessAccepted`, `inputKind`, `runtimeLive: false`, `manualReviewOnly: true`, unsupported collapse, and legacy `damage-photo` quarantine visible.

The harness must not accept uploads, files, real photos, raw EXIF, raw metadata, filenames, object URLs, image URLs, provider output, storage handles, integration handles, case queue handles, customer identifiers, ticket/order/customer data, or browser storage. It must not import analyzer, analyzer routing, upload files, `ClaimReviewWorkflow`, `TestEvidenceHarness`, live report adapter mapping, scoring, parser, fixtures, providers, storage, integrations, or case queues.

Future implementation must add harness-specific semantic/privacy/import guards before or during the slice. Browser QA must verify the dev-only banner, no upload controls, no file input, no network/provider calls, visually distinct unsupported/quarantine states, visible readiness gates, mobile layout, no duplicate ARIA IDs, and no copy implying approval, rejection, verification, confirmed wrongdoing, proof, or final outcome.

The legacy live receipt-era `damage-photo` filename classification path remains a pre-runtime blocker. It must be quarantined or migrated in a separate authorized slice before product-photo runtime support can be considered; the adapter readiness quarantine does not by itself make product-photo runtime safe.

### Phase 2.4.4 Adapter Readiness Closeout And Runtime Blockers

Phase 2.4.4 closes adapter readiness planning as complete enough for the non-live checkpoint. The closeout decision means the adapter readiness boundary, active adapter readiness probe, dev-only harness plan, and current semantic/probe guards are sufficient to preserve non-live adapter readiness. It does not mean product-photo runtime support is ready.

The remaining runtime blockers are tracked in `PRODUCT_PHOTO_RUNTIME_BLOCKERS_PLAN.md`. The first blocker is the legacy live receipt-era `damage-photo` filename classification path. That path is separate from adapter readiness quarantine and must be planned, quarantined, or migrated before any product-photo runtime, upload classification, UI display, live report adapter mapping, `analyzeEvidenceFile` integration, `LocalAnalysisResult` migration, provider, storage, integration, or case workflow work.

Future agents must treat `readinessAccepted` as contract/shape acceptance only. It must not be described as runtime readiness, support-decision readiness, external verification, or production product-photo support.

Phase 2.4.5 should be docs-only legacy `damage-photo` quarantine/migration planning. It should choose the intended first-boundary rule before any code hardening and define exact allowed/protected files, receipt preservation criteria, semantic/probe gates, browser/privacy gates, and stop conditions.

Phase 2.4.5 decision:

- The safest first future hardening boundary is filename/evidence-type classification before live analyzer execution.
- `product-photo` remains the only canonical Phase 2 photo evidence type.
- `damage-photo` remains legacy receipt-era/mock compatibility terminology only.
- Future `damage-photo` handling must quarantine, collapse unsupported, or migrate to `product-photo` only through explicit gated conversion.
- The recommended Phase 2.4.6 milestone is no-live classifier quarantine hardening, with `analyzeEvidenceFile`, `LocalAnalysisResult`, upload, UI, live report mapping, scoring, parser, fixtures, providers, storage, integrations, case queues, real photos, and real metadata fixtures protected unless explicitly approved.

Phase 2.4.6 implementation status:

- The live classifier boundary now lives in `src/lib/analysis/analyzer-classifier.ts`.
- `src/lib/analysis/analyzer.ts` re-exports and uses that classifier while preserving the existing receipt-shaped `analyzeEvidenceFile` body.
- Legacy damage/product/photo/crack image filename cues no longer return `damage-photo`; they collapse to the existing receipt/default classification path.
- PDF, screenshot, normal receipt image, and null/default classification behavior is covered by `src/lib/analysis/analyzer-classifier.probe.ts`.
- `scripts/run-product-photo-probes.cjs` now imports 10 active probe modules, including the classifier quarantine probe and analyzer-routing guard probe.
- `scripts/check-report-semantics.mjs` now covers classifier quarantine markers, the non-live analyzer-routing guard, and the active probe registrations.
- Product-photo runtime remains non-live and unwired from upload, UI, live report mapping, scoring, parser, fixtures, providers, storage, integrations, and case queues.

## 17. Phase 2.1 First-Pass Local Heuristic Signals

Phase 2.1 starts with a small signal catalog only. These signals are manual-review support language and future implementation guidance; they do not run in `analyzeEvidenceFile`, do not change `LocalAnalysisResult`, do not affect scoring, and do not change upload, UI, report mapping, fixtures, receipt parsing, metadata extraction behavior, routing, storage, integrations, or case queues.

| Signal category | What it can safely mean | What it must not claim | Suggested safe wording | Later implementation readiness |
| --- | --- | --- | --- | --- |
| Photo quality limits review | File-level or visual-quality context may make manual inspection harder. | It must not decide evidence truth, customer intent, policy disposition, or claim outcome. | "Photo quality limits review. A clearer image may be needed before support can complete the case." | Local later: dimensions, file size bucket, format support, compression summary, contrast/lighting heuristics if validated. |
| Product context incomplete | The current image may not show enough surrounding product context to place the close-up. | It must not conclude the submitted image is unreliable or that the customer withheld context. | "Product context is incomplete. Request a wider product photo showing the damaged area and surrounding product." | Local later: subject type, requested companion view state, crop/aspect heuristics, manual reviewer-selected category. |
| Requested view missing or incomplete | The current evidence set is missing a view needed for review, such as wider product, clearer close-up, label, packaging, installation context, or proof-of-purchase match. | It must not create a pass/fail outcome or imply the current photo alone decides the case. | "Additional view may be needed. Request the single next photo or proof detail that would help review most." | Local later: requested view defaults and completeness aggregation from declared evidence type; multi-file set logic should wait until evidence grouping exists. |
| Damage visibility unclear | The current photo does not provide enough review-ready detail about the relevant area. | It must not state whether damage exists, whether damage is absent, or who caused it. | "Damage visibility is unclear from the current photo. A clearer close-up may be needed." | Local later only as an inconclusive/default review state or reviewer-selected note; actual visual assessment should wait for future provider or validated local vision support. |
| Product label/context missing | Model, serial, SKU, or label context may be needed for warranty or product matching. | It must not expose raw label values by default or treat missing label context as a customer-risk conclusion. | "Serial or model context may be needed. Request a label photo if policy requires it." | Local later: requested view state and privacy-safe label presence flags; label readability/OCR should wait for future OCR/provider support. |
| Metadata context unavailable or limited | Metadata is absent, limited, or summarized only as privacy-safe context. | It must not treat missing metadata as a standalone concern or reveal private metadata values. | "Metadata context is limited and should be used as context only." | Local later: existing privacy-safe metadata summary fields, dimensions presence, timestamp presence, GPS presence flag without raw values. |
| Image consistency uncertainty signal | A future signal family may route unusual image-context patterns to manual review. | It must not name a categorical image-origin conclusion, accuse a customer, or determine an outcome. | "Image consistency uncertainty needs manual review." | Wait: keep as a documented category until future provider support, validated local metrics, and QA evidence are explicitly opened. |
| Findings inconclusive | The available photo information is not enough for a confident manual-review path. | It must not sound like a negative decision or final evidence result. | "Findings are inconclusive from the current photo. Additional evidence may be needed." | Local later: aggregate low-context, low-quality, missing-view, and metadata-limited states. |
| Manual review recommended | A reviewer should inspect the evidence and decide the next support step. | It must not automate claim disposition, escalation, or customer messaging. | "Manual review recommended. This signal supports review priority only." | Local later: default recommendation when any Phase 2 photo signal is present or incomplete. |

Initial implementation boundary:

- Local-later signals should be deterministic, privacy-safe, and explainable from file summaries, declared subject type, requested views, metadata summary, or review completeness state.
- Provider-dependent signals should remain dormant planning categories until provider/local-model support, privacy review, QA evidence, and explicit runtime scope are opened.
- Customer-facing wording should ask for the minimum useful additional evidence in neutral terms.

## 18. Proposed Phase 2.2 Implementation Order

1. Add a product-photo signal catalog and type-safe builders in the product-photo module without wiring `analyzeEvidenceFile`.
2. Add local file-summary signal helpers for dimensions, file size bucket, format support, and metadata-context status without changing metadata extraction behavior.
3. Add review-completeness helpers for subject type and requested additional views without changing upload or evidence grouping.
4. Add safe aggregation for "findings inconclusive" and "manual review recommended" inside the unwired product-photo module.
5. Add developer-only tests or probes for the signal helpers using synthetic metadata objects, not photo fixtures.
6. Keep image consistency uncertainty as a dormant category until a future explicitly opened provider/metadata slice defines evidence requirements and QA gates.
7. Review safety wording with `check:report-semantics` before any report, UI, scoring, or runtime mapping work is considered.

Implementation should move in small commits so receipt behavior can be audited separately from photo behavior.

## 19. Explicit Do-Not-Build-Yet List

Do not build yet:

- Real product-damage photo analysis in app code before Robert opens Phase 2 implementation.
- Real AI or computer-vision provider calls.
- Server-side image upload or storage.
- Database persistence.
- Auth or organization features.
- Ticket, email, drive, or support-system integrations.
- Cross-case image matching.
- Enterprise image intelligence.
- Automatic claim outcomes.
- Customer-facing photo verdicts.
- Dark command-center redesign.
- Case queue or audit history UI.
- Receipt scoring changes that are only meant to make photo work easier.
- Fixture changes using real customer photos.
- Any workflow that stores or shares raw customer photo metadata without explicit runtime scope.

## Challenge-Mode Notes

What could go wrong:

- Phase 2 could accidentally inherit receipt-specific fields and make photos look like failed receipts.
- Image-quality limits could be mistaken for customer-risk signals.
- Metadata absence could be overinterpreted.
- Image-origin language could overclaim uncertainty.
- Real photo fixtures could leak private backgrounds, labels, serials, addresses, or GPS metadata.

Required discipline:

- Keep Phase 2 planning separate from implementation.
- Keep receipt behavior stable.
- Keep the warm/light evidence-lab UI direction unless Robert asks for broader visual work.
- Keep all photo outputs manual-review-support only.
- Keep privacy-safe summaries as the default sharing format.
