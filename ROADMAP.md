# ClaimGuard Roadmap

This file is the durable product roadmap and phase definition source of truth. It describes what ClaimGuard is becoming, what each phase means, and what is explicitly deferred.

Use `NEXT_STEPS.md` for the immediate working queue. Do not turn `NEXT_STEPS.md` into the long-term roadmap.

## Product Vision

ClaimGuard is a fraud-risk screening and evidence intelligence platform for support and claims teams.

The product should help reviewers understand whether submitted evidence is reliable, internally consistent, and ready for manual decision-making. It should support safe review decisions without accusing customers, confirming wrongdoing, or replacing human judgment.

Receipt analysis is one evidence module. Future ClaimGuard can include photo evidence analysis, case review workflow, customer and ticket context, integrations, audit history, scoring signals, and enterprise fraud intelligence.

## Durable Principles

- Evidence signals support review; they do not prove intent or wrongdoing.
- ClaimGuard should explain why something needs manual review.
- Real customer evidence requires privacy, retention, and audit discipline.
- Future integrations should be provider-neutral until a provider is selected.
- Each phase should produce a usable capability without forcing later infrastructure early.
- Safety language and external-verification semantics apply across every phase.

## Phase 1: Receipt Intelligence

Status: Closed, pushed, deployed, and production-smoked.

Latest production polish checkpoint: `19ef25e` (`polish post-phase1 evidence workspace`).

Meaning:

- Receipt upload and local analysis.
- OCR/PDF handling.
- Receipt parsing.
- Source classification.
- Vendor/source-specific receipt intelligence.
- Metadata and image-quality heuristics.
- Evidence Reliability Score and score breakdown.
- `/test-evidence` manual QA harness.
- Privacy-safe tuning observations.
- Customer-safe report wording.

Explicitly deferred from Phase 1:

- Product damage photo analysis.
- Case review workflow.
- Real ticket/email integrations.
- Auth, billing, database, and SaaS platform work.
- Enterprise dashboards and cross-case intelligence.
- Real external verification claims.

## Phase 2: Photo Evidence

Status: Phase 2.0 implementation has officially started as scaffold-only, local-heuristics-only, provider-ready, and intentionally unwired.

Meaning:

- Product-damage photo evidence model.
- Photo quality and visibility signals.
- Planning for image consistency uncertainty signals.
- Provider-neutral image analysis contracts.
- Manual-review language for photo findings.

Current implementation boundary:

- Shared evidence and product-photo scaffold/type-boundary work is allowed.
- Shared evidence model types and product-photo scaffold/defaults exist.
- No product-photo analyzer behavior is live yet.
- No runtime analyzer, upload, UI, report, scoring, parser, fixture, storage, integration, or external provider behavior is live for Phase 2 yet.
- `product-photo` is canonical.
- `damage-photo` remains only a compatibility alias to `product-photo` / `damage-close-up`.
- Do not start Phase 2.1 until Robert/ChatGPT explicitly confirms the scaffold review is complete.

Deferred until Robert explicitly approves a later Phase 2 runtime slice:

- Implementing product damage photo analysis.
- Connecting AI vision providers.
- Changing the current app to add photo-analysis behavior.
- Storing or sending real customer photos to services.

## Phase 3: Case Review Workflow

Status: Future phase.

Meaning:

- Case queue and case detail concepts.
- Review status lifecycle.
- Reviewer notes and actions.
- Audit history.
- Evidence grouping across receipts, photos, and context.
- Safe support workflows that keep humans in the decision loop.

Deferred until Phase 3 is explicitly opened:

- Persistent case database.
- Authenticated reviewer accounts.
- Production case queues.
- Ticket-system writebacks.

## Phase 4: Stronger OCR and AI Integrations

Status: Future phase.

Meaning:

- Provider-neutral OCR/AI interfaces.
- External OCR or AI analysis behind explicit approval and privacy controls.
- Confidence, cost, latency, and fallback planning.
- Safety filters for generated model output.

Deferred until Phase 4 is explicitly opened:

- Real OCR provider connections.
- Real AI vision or language model calls.
- Sending real evidence to third-party services.
- Provider-specific commitments.

## Phase 5: Customer and Ticket Integrations

Status: Future phase.

Meaning:

- Ticket and email context.
- Gmail, Drive, Zendesk, Freshdesk, or other support-system planning.
- Customer/order context import.
- Evidence-to-ticket linking.
- Integration audit trails.

Deferred until Phase 5 is explicitly opened:

- Live integrations.
- Credential handling.
- Ticket writebacks.
- Automated customer messaging.

## Phase 6: SaaS Platform

Status: Future phase.

Meaning:

- Auth.
- Organizations and users.
- Data model and retention policy.
- Billing readiness if needed.
- Admin and reviewer permissions.
- Production storage and audit controls.

Deferred until Phase 6 is explicitly opened:

- Billing.
- Multi-tenant production data storage.
- Enterprise admin surfaces.
- Real customer onboarding.

## Phase 7: Enterprise Fraud Intelligence

Status: Future phase.

Meaning:

- Cross-case risk signals.
- Merchant, channel, account, claim-history, and evidence-pattern intelligence.
- Enterprise reporting.
- Review-support insights across claims.
- Pattern detection with strong safety and privacy controls.

Deferred until Phase 7 is explicitly opened:

- Enterprise dashboards.
- Automated denial systems.
- Customer profiling claims.
- Cross-customer intelligence without a clear privacy and legal review.

## Cross-Phase Safety Requirements

- Keep "External Verification: Not performed" unless a real approved integration performs it.
- Keep scores framed as evidence reliability and internal consistency.
- Preserve manual-review language.
- Do not accuse customers.
- Do not store or commit real customer evidence.
- Document data movement before any future integration is implemented.
