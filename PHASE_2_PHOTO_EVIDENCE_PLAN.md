# Phase 2 Photo Evidence Plan

This document defines Phase 2 before implementation. It is planning guidance only.

Phase 1 Receipt Intelligence is closed, pushed, deployed, and production-smoked. Phase 2 has not started. Robert must explicitly open Phase 2 implementation before app code, analyzer logic, fixtures, upload behavior, provider integrations, or UI behavior changes are made.

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

Phase 2 must not claim that a customer caused damage, altered an image, submitted invalid evidence, or should receive an automatic outcome.

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
- A way to categorize review-support signals for damage visibility, product context, image quality, and image consistency.
- A step toward a shared evidence model that can support receipts, screenshots, PDFs, photos, and future evidence types.
- A manual-review support tool with safe customer language.

Phase 2 is not:

- A real AI vision integration unless Robert separately approves that work.
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
- Require full product context as the grounding companion because a close-up alone can be misleading or incomplete.
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
- Image consistency needs manual review.
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

- The customer altered the photo.
- The image proves the damage is real.
- The image proves the damage is not real.
- The claim should be rejected.
- The customer submitted misleading evidence.
- The evidence is definitively valid or invalid.
- AI detected manipulation.
- The photo is externally verified.
- The customer caused the damage.
- The claim is approved or rejected based on photo analysis.

Avoid strong labels unless they are carefully framed:

- Do not use "manipulated image" as a final label.
- Do not use "AI-generated image" as a final label.
- Do not use "tampered photo" as a final label.
- Use "image consistency signal," "potential editing indicator," or "manual review recommended" when the evidence only supports further review.

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
- If GPS is ever needed for a future approved workflow, it requires a separate privacy and retention decision.

## 8. Image-Quality And Manipulation-Signal Categories

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
- Duplicate or reused-looking photo needing future review.
- Screenshot-of-photo context needing review.
- Metadata and visual context mismatch needing review.

Important distinction:

- Quality limits support clearer-photo requests.
- Consistency signals support manual review.
- Neither category proves the image was edited or that the claim outcome is determined.

## 9. AI-Generated-Image Uncertainty Rules

Phase 2 may plan for AI-generated-image uncertainty, but implementation must wait until Robert explicitly opens it and approves any provider or local model.

Rules:

- Do not claim an image is AI-generated from local heuristics alone.
- Do not expose an "AI-generated" verdict to support reps unless the underlying evidence and policy are approved.
- Use "image-generation uncertainty signal" only as internal review-support wording.
- Require multiple supporting signals before surfacing any AI-image concern.
- Prefer "manual review recommended" over categorical labels.
- Keep customer-facing language neutral and focused on requesting clearer or additional product context.
- Treat AI-image signals as low-confidence unless validated by approved tooling and QA evidence.

Safe internal wording:

- "Image-generation uncertainty signal."
- "Visual consistency needs manual review."
- "Photo context is insufficient to assess from current image."
- "Additional photo evidence may be needed."

## 10. Duplicate / Reuse Detection Future Notes

Duplicate and reuse detection belongs to a later readiness path unless Robert explicitly opens it.

Future possibilities:

- Compare submitted image against other evidence in the same case.
- Compare near-duplicates across uploads within a browser-local session.
- Track perceptual hash summaries if a privacy model is approved.
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
- `External Verification: Not performed` remains the default until an approved integration changes it.
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
    "status": "Not externally verified",
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
- Whether the result is local-only and not externally verified.

## 16. Phase 2 Implementation Prerequisites

Before Robert opens Phase 2 implementation, the project should have:

- Robert approval to begin Phase 2 implementation.
- A reviewed shared evidence model plan.
- Clear separation between receipt analysis and photo evidence analysis.
- A product-photo signal taxonomy.
- A photo privacy and EXIF handling policy.
- A privacy-safe photo observation format.
- Synthetic fixture categories approved.
- Manual QA expectations for photo evidence.
- Customer-safe support copy patterns.
- A decision on whether Phase 2 is local-heuristics-only or provider-readiness-only.
- Explicit confirmation that no AI/vision provider will be connected unless separately approved.
- A rollback-safe implementation order.

## 17. First Implementation Tasks After Robert Explicitly Opens Phase 2

When Robert explicitly opens Phase 2 implementation, the first safe implementation tasks should be:

1. Add shared evidence model types without changing receipt behavior.
2. Add product-photo planning-only types for damage close-up and full product context without running provider analysis.
3. Extract shared UI/result concepts from receipt-specific fields where needed.
4. Add synthetic photo fixture scaffolding for damage close-ups and full product context companion photos.
5. Add privacy-safe photo observation export shape.
6. Add manual QA documentation for photo fixtures.
7. Add local image-quality-only photo signals for damage close-ups if approved.
8. Add photo customer-safe response patterns that request a wider product context image when needed.
9. Add serial/model label planning after the close-up/context path is stable.
10. Run lint, build, report-semantics, and manual route checks for affected surfaces.

Implementation should move in small commits so receipt behavior can be audited separately from photo behavior.

## 18. Explicit Do-Not-Build-Yet List

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
- Any workflow that stores or shares raw customer photo metadata without explicit approval.

## Challenge-Mode Notes

What could go wrong:

- Phase 2 could accidentally inherit receipt-specific fields and make photos look like failed receipts.
- Image-quality limits could be mistaken for customer-risk signals.
- Metadata absence could be overinterpreted.
- AI-image language could overclaim uncertainty.
- Real photo fixtures could leak private backgrounds, labels, serials, addresses, or GPS metadata.

Required discipline:

- Keep Phase 2 planning separate from implementation.
- Keep receipt behavior stable.
- Keep the warm/light evidence-lab UI direction unless Robert asks for broader visual work.
- Keep all photo outputs manual-review-support only.
- Keep privacy-safe summaries as the default sharing format.
