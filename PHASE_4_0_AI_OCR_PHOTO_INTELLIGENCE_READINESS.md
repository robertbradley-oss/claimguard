# Phase 4.0 AI/OCR/Photo Intelligence Readiness Plan

This is a planning-only Phase 4.0 readiness checkpoint under `ROADMAP.md` heading "Phase 4: Stronger OCR and AI Integrations".

It does not implement real AI, OCR provider calls, photo analysis, upload behavior, persistence, storage, integrations, scoring changes, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `LocalAnalysisResult` migration, receipt behavior changes, deployment, commit, or push.

## Current State

Phase 1 Receipt Intelligence is closed, pushed, deployed, and production-smoked. `/` remains the Phase 1 receipt workflow.

Phase 2 Photo Evidence is closed as non-live unsupported/product-photo readiness. Product-photo runtime remains non-live. The product-photo analyzer, adapter, report view model, and `ProductPhotoReviewPanel` remain readiness surfaces only; `ProductPhotoReviewPanel` is not routed into the live workflow. The pre-analysis evidence gate and default-off runtime wrapper exist, but remain unwired from live callers.

Phase 3 Case Review Workflow is closed as a static/local Case Review Command Center shell. `/case-command-center` exists as a static/local, synthetic-only, unlinked, non-persistent, off-white/parchment shell. It is publicly reachable by direct production URL after the closure deploy, but `/` does not link to it. Latest deployed closure commit: `003a88d` (`docs: close phase 3 case workflow shell`). Receipt behavior remains unchanged. `ClaimReviewWorkflow` remains unchanged. `analyzeEvidenceFile` remains the receipt analyzer entrypoint. `LocalAnalysisResult` remains receipt-shaped. No persistence, uploads, integrations, OCR/metadata expansion, storage/providers, auth/billing, saved state, live actions, live scoring, ticket/export/send behavior, or real evidence handling has been added.

Phase 4 implementation has not started.

## Phase 4.0 Decision

Phase 4 should make ClaimGuard smarter by improving evidence signals, not by making AI the decision-maker.

The safest Phase 4 path is to plan provider-neutral OCR, AI, and photo-intelligence boundaries before any real provider, prompt, storage, upload, or live workflow work. AI/OCR/photo outputs should become review signals with confidence, uncertainty, limitations, and manual-review guidance. They must not become proof claims, fraud conclusions, automatic denial/refund decisions, or final case outcomes.

Phase 4.0 closes as planning-only when this document and source-of-truth docs describe:

- What stronger OCR should eventually improve.
- How AI or vision model output can be represented safely.
- How product-photo intelligence can remain careful and non-accusatory.
- What privacy/data architecture must exist before real evidence leaves the current browser-local posture.
- What integration, scoring, QA, and safety gates must precede implementation.
- What Phase 4 explicitly must not do yet.

## Product Thesis

ClaimGuard should become an evidence intelligence platform for support reviewers, not an automated adjudication engine.

Phase 4 intelligence should help reviewers answer:

- What can be read from the submitted evidence?
- Which extracted fields are reliable enough for manual comparison?
- What evidence limitations or uncertainty should the reviewer understand?
- Which evidence items may need clearer copies, additional context, or policy review?
- Which signals should be compared against support policy or future approved systems?

Phase 4 intelligence should not answer:

- Whether a customer did something wrong.
- Whether evidence is proven genuine or not genuine.
- Whether a claim should be denied, approved, refunded, or escalated automatically.
- Whether external verification happened when no approved integration performed it.

All future AI/OCR/photo intelligence should preserve:

- Manual review as the final workflow posture.
- Customer-safe wording.
- "External Verification: Not performed" until an approved integration changes it.
- Evidence scores as local evidence quality and review readiness, not external truth.
- The current off-white/parchment ClaimGuard evidence workspace direction. Phase 4 is intelligence readiness, not another Command Center redesign or a return to the old dark forensic default.

## Stronger OCR Readiness

Current OCR context:

- `analyzeEvidenceFile(file)` calls `extractOcr(file)` before parsing, metadata inspection, image heuristics, scoring, and report mapping.
- Browser-local OCR currently uses PDF text extraction where available, PDF rendered OCR fallback, and Tesseract.js for image OCR.
- `LocalAnalysisResult` stores the receipt-shaped OCR result, parsed receipt, metadata, image heuristics, signals, score, finding groups, and customer-safe wording.

Future OCR improvements should be planned as provider-neutral signal upgrades, not immediate runtime changes.

Future OCR goals:

- Stronger receipt text extraction for low-quality receipt photos, mobile screenshots, PDF receipts, and order-detail pages.
- Better line reconstruction for totals, taxes, shipping, discounts, item rows, multi-shipment orders, and payment cues.
- Better field parsing for merchant, order number, purchase date, line item/product detail, total, and payment method.
- Field-level confidence for merchant/order/date/total/payment/line items, shown as review confidence rather than proof.
- Amazon receipt structure validation, including order number format, order placed/date cues, items ordered cues, order summary, shipment context, invoice/detail pages, promotion/subscription wording, and total/payment consistency.
- Vendor-aware confidence for supported receipt sources without claiming external verification.
- Clear browser-local OCR limits for poor image quality, sparse text, handwriting, complex screenshots, compressed images, and PDFs without useful text layers.
- Explicit criteria for when server-side OCR may be needed, such as multi-page PDFs, heavy image preprocessing, better table/layout recognition, worker reliability, or provider-backed field extraction.

Receipt behavior protections before implementation:

- Preserve `analyzeEvidenceFile` as the receipt analyzer entrypoint until a named migration is explicitly approved.
- Preserve `LocalAnalysisResult` as receipt-shaped until a separate result-shape migration is approved.
- Preserve `/` upload/analyze/report behavior and `/test-evidence` receipt QA.
- Add receipt regression probes before changing OCR or parser behavior.
- Prove supported receipt sources still parse expected fields from synthetic fixtures.
- Preserve safe score semantics, external-verification wording, and customer-safe wording.
- Keep raw OCR retention and display rules explicit before expanding any OCR storage, export, logs, or prompts.

## Real AI / Vision Readiness

Future OpenAI Vision or similar model use should be treated as a provider-neutral planning area until Robert explicitly approves a provider and implementation slice.

Potential evidence types an AI/vision model could inspect later:

- Receipt images where browser-local OCR is insufficient.
- Order screenshots where visual layout or field grouping matters.
- Product photos for damage visibility and requested view completeness.
- Packaging, serial/model label, installation-context, or wider product-context photos.
- Mixed evidence images where the first step is classification or routing, not a verdict.

Safe prompt and output-contract principles:

- Prompts should ask for observable evidence signals, not fraud conclusions.
- Outputs should use structured fields with confidence, uncertainty, limitations, and recommended reviewer checks.
- The contract should separate OCR text extraction, visual observation, field confidence, image-quality limits, metadata context, and support-safe wording.
- The contract should require "not externally verified" unless an approved external verification source was actually used.
- The contract should avoid customer names, addresses, order IDs, raw payment values, raw metadata, GPS, device identifiers, and private background details unless a privacy policy explicitly allows that handling.
- The contract should include an explicit "no final decision" or "review support only" marker.

Required wording rules:

- Do not use fraud-confirmation language.
- Do not label evidence "fake", "forged", "fraudulent", or "manipulated" as a conclusion.
- Use terms like "potential alteration indicator", "image-quality limitation", "consistency signal", "metadata context", "inconclusive", and "manual review recommended".
- Represent model uncertainty directly, including "not enough information", "limited image quality", and "requires reviewer comparison".
- Never map model output directly to automatic denial, refund, rejection, approval, or final policy disposition.

How AI output should fit into case review:

- AI output should become evidence-level review signals.
- Case-level synthesis should explain what needs review, what is missing, and which policy comparison remains human-owned.
- Customer-safe wording should be generated or suggested only through a reviewed contract that prevents accusations, final outcomes, and exposure of internal notes.
- AI output should be auditable later only after persistence and audit logging are explicitly approved.

## Product-Photo Intelligence Readiness

Product-photo intelligence should build on Phase 2 readiness without making product-photo runtime live by accident.

Potential future signals:

- Damage visibility review: whether the claimed damage area is visible, partially visible, context-missing, or inconclusive.
- Product context review: whether the photo shows the whole product, close-up only, packaging context, installation context, or serial/model label context.
- Requested-view completeness: whether support may need a wider product photo, clearer damage close-up, serial/model label, packaging context, installation context, or proof-of-purchase match.
- Reuse or duplicate possibility signals, limited to careful similarity or context signals and never a conclusion that reuse happened.
- Compression, editing, cropping, image-quality, and artifact uncertainty signals, framed as limitations or review cues.
- Metadata/EXIF context possibilities, including whether metadata is available, stripped, limited, or privacy-sensitive.
- AI-generated-image uncertainty only as a careful review signal, never as a "fake photo" conclusion.

Product-photo wording rules:

- Do not say "fake photo".
- Do not say "fraud confirmed".
- Do not accuse the customer.
- Do not claim a product photo is externally verified.
- Do not imply that damage is proven or disproven by AI alone.
- Prefer "manual review recommended", "damage visibility is inconclusive", "additional product context may be needed", "metadata context is limited", and "image consistency signal needs reviewer comparison".

Product-photo runtime protections:

- Do not route `ProductPhotoReviewPanel` until Robert explicitly approves a named live or non-live routing slice.
- Do not wire product-photo analysis into `ClaimReviewWorkflow`.
- Do not call product-photo analyzers from `analyzeEvidenceFile`.
- Do not change `LocalAnalysisResult` for product-photo.
- Do not add upload routing, report mapping, scoring, parser, fixtures, provider calls, storage, integrations, or case queues for product-photo during Phase 4.0.
- Keep Phase 2 product-photo artifacts as readiness inputs, not live workflow behavior.

## Data And Privacy Architecture

Real evidence handling is the main Phase 4 risk. Before any real AI/OCR/provider work, ClaimGuard needs a data-flow and retention plan.

Required boundaries:

- No real customer evidence should be used in implementation, fixtures, prompts, screenshots, logs, or commits unless Robert explicitly approves the exact workflow.
- A file retention policy is required before persistence.
- A storage/provider decision is required before uploads or server-side analysis.
- Metadata privacy handling must define which EXIF fields are read, omitted, displayed, logged, sent to providers, stored, or deleted.
- Raw OCR retention must be explicitly approved before storing or exporting OCR text.
- Object URLs, image previews, image bytes, raw metadata, raw labels, and provider payloads must not be retained without a policy.
- Evidence deletion and retention strategy must exist before any storage.
- Audit logging should be planned only after persistence exists; until then, audit rows remain static/local/synthetic or browser-local only.
- Provider requests must be redacted or minimized by default.
- Provider response storage must be explicitly scoped; response IDs, traces, logs, and debugging captures can be sensitive.

Privacy questions to answer before implementation:

- Which evidence leaves the browser, and why?
- Which derived fields are safe to keep?
- How long are uploaded files retained?
- How are files deleted?
- Where are provider logs stored?
- Can support reps view raw OCR or only derived summaries?
- What is copied/exported, and what stays internal?
- What should be excluded from screenshots and browser artifacts?

## Integration Boundaries

Phase 4 may plan integrations, but must not implement them during Phase 4.0.

Provider areas to evaluate later:

- OpenAI Vision or similar multimodal model for structured visual review signals.
- AWS Textract or Google Vision as OCR/receipt/document alternatives.
- Browser-local OCR as a privacy-preserving default where it is sufficient.
- Provider-neutral OCR abstraction that can support browser-local, server-side OCR, and future external providers.
- Supabase/Postgres or equivalent database only after persistence scope, retention, and auth are planned.
- File storage only after evidence retention, deletion, access control, and audit requirements are planned.
- Zendesk, Freshdesk, Gmail, Drive, and ticket/customer context integrations later, likely Phase 5 rather than Phase 4.

Provider failure and operations planning:

- Provider timeout, rate-limit, cost, quota, and retry behavior must be explicit.
- Failed provider calls should produce "analysis unavailable" or "manual review recommended", not risky conclusions.
- Cost controls should include file size/page count limits, image resizing policy, queueing rules, and per-case budget signals.
- Latency handling should distinguish in-progress, failed, partial, and unavailable analysis states.
- Provider fallback should preserve receipt behavior and manual review.
- Credentials must not be added until implementation is approved.

## Scoring Architecture

Stronger signals should feed a review signal model, not a single certainty score.

Planning rules:

- AI/OCR/photo signals should remain evidence-level review signals with severity, confidence, source, explanation, recommendation, and limitations.
- Do not migrate `LocalAnalysisResult` yet.
- Do not break the receipt analyzer or receipt report adapter.
- Do not convert AI/vision output into a single "fraud score".
- Preserve the "Evidence Reliability Score" meaning as local evidence quality and review readiness.
- Keep confidence, review priority, risk/attention, and score meaning separate.
- Case-level synthesis can summarize review posture, but should not become an automated claim outcome.
- External verification stays "Not performed" unless a real approved integration performs it.

Possible future direction:

- Keep receipt score as receipt-local reliability.
- Add a separate shared signal envelope only after a migration plan proves receipt compatibility.
- Aggregate case-level review signals only as manual-review guidance.
- Use "review priority" or "attention level" for workflow triage, not "fraud score" certainty.

## QA And Safety Gates

Before any Phase 4 implementation, require:

- Semantic report guards for new prompt/output contracts, provider display files, OCR summaries, AI wording, photo-signal wording, and export/copy surfaces.
- Browser checks for any UI or route touched by implementation.
- Fixture-only tests first, with synthetic or structurally redacted evidence.
- A synthetic evidence corpus for receipts, order screenshots, PDFs, product-photo-like cases, low-quality OCR, missing fields, metadata-limited images, and hostile prompt-output cases.
- Privacy review for data movement, provider payloads, logs, screenshots, storage, retention, deletion, and exports.
- Prompt/output contract review before any model call.
- Explicit no-overclaiming and no-accusation language checks.
- Receipt regression tests before changing OCR, parser, score, report, or upload behavior.
- Product-photo runtime remains gated until Robert explicitly approves a named implementation slice.
- Protected code/import scans confirming implementation did not cross analyzer, UI, upload, report, provider, storage, or route boundaries outside the approved slice.
- `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run check:report-semantics`, `npm.cmd run check:product-photo-probes`, `git diff --check`, and final `git status --short --branch` for any implementation slice.

Phase 4.0 docs-only closeout should run:

- `git status --short --branch`.
- `git diff --stat`.
- `git diff --check`.
- `npm.cmd run check:report-semantics`.
- `npm.cmd run check:product-photo-probes`.
- Protected code diff scan confirming no runtime/UI/code files changed.

## Recommended Phase 4 Sequence

1. Phase 4.0 planning-only real AI/OCR/photo intelligence readiness.
2. Phase 4.1 OCR/provider architecture plan: provider-neutral OCR boundaries, data flow, receipt regression requirements, and no-provider implementation constraints.
3. Phase 4.2 synthetic OCR fixture harness plan/implementation: synthetic receipts and expected field confidence only, no real evidence and no external providers.
4. Phase 4.3 server-side analysis route planning: data egress, retention, deletion, provider payload, error, cost, and auth/storage prerequisites, with no route implementation until approved.
5. Phase 4.4 AI Vision prompt/output contract design: structured output schemas, forbidden wording, uncertainty handling, no-decision markers, and prompt/privacy review.
6. Phase 4.5 product-photo signal model design: damage visibility, context completeness, duplicate/reuse possibility, artifact uncertainty, metadata context, and AI-generated-image uncertainty as careful signals only.
7. Phase 4.6 non-live AI/OCR integration prototype: synthetic-only, provider-disabled or mocked by default unless Robert explicitly approves real provider credentials and data flow.
8. Phase 4.7 QA/safety review before any live opt-in: receipt regression, privacy review, prompt/output review, product-photo gate review, browser QA, and rollback/default-off plan.

## What Phase 4 Should Not Do Yet

Phase 4.0 does not authorize:

- Live AI analysis.
- Live photo analysis.
- Real customer evidence processing.
- Persistence or storage.
- Provider credentials.
- Environment variables.
- Provider SDKs or dependencies.
- Deployment changes.
- `ClaimReviewWorkflow` wiring.
- `ProductPhotoReviewPanel` routing.
- `analyzeEvidenceFile` changes.
- `LocalAnalysisResult` migration.
- Receipt behavior changes.
- Upload behavior changes.
- Ticket/email/drive/customer integrations.
- Billing, auth, organizations, or SaaS platform work.
- Command Center redesign or polish.

Command Center UI still needs future refinement, but Phase 4 should wait until intelligence needs are clearer. The current visual direction remains warm off-white/parchment with selective dark contrast only.

## Phase 4.1 Recommendation

The next safest task is Phase 4.1 OCR/provider architecture planning.

Phase 4.1 should define provider-neutral OCR interfaces, data-flow boundaries, privacy rules, receipt-regression gates, provider-failure behavior, and cost/latency constraints. It should not add providers, SDKs, credentials, routes, env vars, upload behavior, persistence, AI/vision calls, product-photo runtime, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `LocalAnalysisResult` migration, or receipt behavior changes.

## Stop Conditions

Stop any future Phase 4 work if:

- Implementation begins during a planning-only slice.
- A provider SDK, credential, env var, route, API handler, storage, database, auth, billing, or deployment config appears without explicit approval.
- Real customer evidence, raw OCR, metadata, filenames, paths, IDs, object URLs, provider payloads, logs, screenshots, or private customer details enter docs, fixtures, prompts, commits, or artifacts without explicit approval.
- `analyzeEvidenceFile`, `LocalAnalysisResult`, receipt parser, scoring, report adapter, upload flow, `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, product-photo runtime, or case-shell UI changes outside a named approved slice.
- AI output is framed as proof, fraud confirmation, fake/forged evidence, customer wrongdoing, automatic denial/refund/approval, or final claim outcome.
- External verification is implied without an approved external verification integration.
- Required checks fail or cannot be interpreted safely.

## Closeout Criteria

Phase 4.0 is ready to close when:

- This planning document exists.
- `ROADMAP.md`, `NEXT_STEPS.md`, `REPO_SOURCE_OF_TRUTH.md`, `AGENTS.md`, and `AGENT_LOG.md` reflect Phase 4.0 planning-only status.
- No runtime/UI/code/route/component/script/package/config/deployment files changed.
- Docs-safe checks pass.
- The next recommended task is Phase 4.1 OCR/provider architecture planning, not implementation.
