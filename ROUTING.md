# ClaimGuard Routing Guide

Use this quick guide before starting any ClaimGuard task.

ClaimGuard is in Phase 1: Receipt Authenticity Analyzer. If a request is ambiguous, choose the most conservative Phase 1 agent and do not expand scope.

## Required Routing Pattern

Before doing work, Codex must:

1. Read Robert's request.
2. Select the best primary agent.
3. Mention the selected agent and why.
4. Note any secondary agents whose concerns matter.
5. Stay within the selected agent's scope.
6. Complete the task.
7. End with the expanded CLAIMGUARD HANDOFF from `AGENTS.md`.

If a task touches multiple areas, choose one primary agent, mention secondary considerations, and avoid trying to do everything at once.

## Agent Roles

- Phase 1 Implementation Agent: Builds the receipt analyzer and test harness into a reliable working engine. Handles OCR/PDF work, analyzer pipeline improvements, parsing, score breakdowns, fake fixtures, `/test-evidence`, and small high-value Phase 1 improvements.
- Scoring & Safety Reviewer Agent: Makes sure ClaimGuard never overclaims and that scores mean internal consistency/evidence reliability, not verified truth. Handles risk semantics, verification wording, manual-review language, report interpretation, and accusation prevention.
- Real Receipt QA & Tuning Agent: Turns anonymized real receipt observations into better analyzer behavior. Handles tuning exports, false positives/false negatives, threshold recommendations, OCR-vs-signal interpretation, and privacy-safe QA workflows.
- Source Classification Agent: Makes ClaimGuard correctly identify receipt source/type before scoring. Handles Amazon app screenshots, Amazon PDFs/order details, Amazon invoice/detail pages, iSpring direct invoices, Lowe's email/order screenshots, generic receipts, unknown classification, and source-specific parsed-field summaries.
- Privacy & Evidence Safety Agent: Prevents private customer data from leaking into code, exports, prompts, logs, or committed files. Handles redaction, safe JSON exports, tuning observation exports, raw OCR safety, privacy checklists, and fixture contamination prevention.
- Architecture & Maintainability Agent: Keeps ClaimGuard modular and future-ready without overbuilding. Handles analyzer boundaries, TypeScript cleanup, future OpenAI Vision/AWS Textract/Google Vision readiness, server-side OCR route planning, and technical debt reduction.
- UI/Product Workflow Agent: Improves usability and support-rep workflow without drifting into visual redesign. Handles upload flow clarity, report readability, `/test-evidence` usability, evidence-review workflow, support-safe decision flow, and cognitive-load reduction. Use only when Robert explicitly asks for UI/product flow work.
- Product Strategy / Roadmap Agent: Keeps ClaimGuard on the right phase and prevents scope creep. Handles roadmap discipline, phase placement, prioritization, plugin/tool timing, moat protection, and deferral decisions.

## Which Agent Handles Which Task

- "Fix the score overclaiming authenticity" -> Scoring & Safety Reviewer Agent
- "Improve Amazon order parsing" -> Source Classification Agent
- "Make copied JSON safer" -> Privacy & Evidence Safety Agent
- "Clean up analyzer module structure" -> Architecture & Maintainability Agent
- "Improve /test-evidence upload usability" -> UI/Product Workflow Agent
- "Analyze real receipt tuning observations" -> Real Receipt QA & Tuning Agent
- "What phase does AI image detection belong in?" -> Product Strategy / Roadmap Agent
- "Add OCR confidence labels" -> Phase 1 Implementation Agent
- "Add iSpring receipt source summary" -> Source Classification Agent
- "Recommend next ClaimGuard task" -> Product Strategy / Roadmap Agent
- "Create fake PDF fixtures for Lowe's testing" -> Phase 1 Implementation Agent
- "Review whether clean synthetic receipts should score 94" -> Scoring & Safety Reviewer Agent
- "Prevent full order IDs from copied output" -> Privacy & Evidence Safety Agent
- "Prepare analyzer for future Textract" -> Architecture & Maintainability Agent
- "Make the report easier for support reps to scan" -> UI/Product Workflow Agent

## Phase Boundaries

- Phase 1: Receipt upload, OCR extraction, PDF handling, receipt parsing, source classification, Amazon/iSpring/Lowe's validation, metadata/image-quality heuristics, Evidence Reliability Score, score breakdown, `/test-evidence`, Real Receipt QA, privacy-safe tuning observations, and customer-safe report wording.
- Phase 2: Product damage photo analysis and AI-generated/altered image detection.
- Phase 3: Case review workflow.
- Phase 4: Stronger AI/OCR integrations.
- Phase 5: Ticket and email integrations.
- Phase 6: SaaS platform.
- Phase 7: Enterprise fraud intelligence.

Phase 1 is not about auth, billing, enterprise dashboards, marketing pages, ticket integrations, Gmail/Zendesk/Freshdesk, full product-damage AI image detection, or server-side OCR unless Robert explicitly approves that scope.

## Safe Language Rules

Prefer:

- "Evidence Reliability Score"
- "Receipt Reliability Score"
- "Internal consistency"
- "Verification Status: Not externally verified"
- "External Verification: Not performed"
- "Potential alteration indicators"
- "Manual review recommended"
- "Receipt details could not be fully verified"
- "Findings are inconclusive"
- "Additional proof of purchase may be needed"

Avoid:

- "Verified authentic"
- "Definitely real"
- "Fake receipt"
- "Fraud confirmed"
- "Customer committed fraud"
- "Deny this claim"

## Global Guardrails

- Never claim fraud is confirmed.
- Never accuse customers.
- Never imply local Phase 1 analysis proves a receipt is real.
- Do not store or commit real customer receipts.
- Keep real receipt work browser-local and privacy-safe.
- Use fake data only for committed fixtures.
- Do not add new product areas unless explicitly requested.
- Do not redesign the main app unless explicitly asked.
- Keep OCR, parsing, source classification, scoring, reporting, and UI modular.

## Handoff Requirement

Every completed task must end with the expanded CLAIMGUARD HANDOFF from `AGENTS.md`, including selected agent, secondary concerns, files changed, checks run, privacy/safety notes, risks, unfinished work, recommended next task, suggested next prompt, and files the next agent should inspect first.
