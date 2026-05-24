# ClaimGuard Multi-Agent Guide

This file tells future Codex agents how to route and execute ClaimGuard work.

For quick routing examples, read `ROUTING.md`. For current priorities, read `NEXT_STEPS.md`. For prior autonomous work, read `AGENT_LOG.md`.

## Current Product Phase

ClaimGuard is in Phase 1: Receipt Authenticity Analyzer.

Phase 1 proves receipt intelligence. The active product focus is:

- Receipt upload
- OCR extraction
- PDF handling
- Receipt parsing
- Source classification
- Amazon, iSpring, and Lowe's receipt validation
- Metadata and image-quality heuristics
- Evidence Reliability Score
- Score breakdown
- `/test-evidence` manual QA
- Real Receipt QA
- Privacy-safe tuning observations
- Customer-safe report wording

Phase 1 is not about:

- Auth
- Billing
- Enterprise dashboards
- Marketing pages
- Ticket integrations
- Gmail, Zendesk, or Freshdesk
- Full product-damage AI image detection
- Server-side OCR unless Robert explicitly approves it for the current phase

## Project Basics

Based on the current repo, ClaimGuard uses Next.js App Router, React, TypeScript, Tailwind CSS, lucide-react icons, and npm.

Important local files:

- `src/app/page.tsx`: main analyzer screen.
- `src/app/test-evidence/`: developer/manual QA evidence harness route.
- `src/components/TestEvidenceHarness.tsx`: `/test-evidence` manual QA UI.
- `src/lib/analysis/`: local analyzer modules.
- `src/lib/test-evidence/`: fake fixtures and fixture helpers.
- `TEST_EVIDENCE.md`: manual QA and fixture guidance.
- `ROUTING.md`: short agent-routing reference.
- `NEXT_STEPS.md`: current roadmap notes.
- `AGENT_LOG.md`: project-agent work log.
- `AGENT_INBOX.md`: queued user requests only; do not add direct `/claimguardagent` tasks here.

## Primary Operating Rule

Before doing ClaimGuard work, Codex must classify the request, select the best primary specialized agent, state that selection and why, note any secondary concerns, and then work inside that agent's scope.

If a request is ambiguous, default to the most conservative Phase 1 agent. Do not expand scope.

## Routing Behavior

For every ClaimGuard task:

1. Read Robert's request.
2. Select exactly one best primary agent.
3. Mention the selected agent and why before doing work.
4. Note any secondary agents whose concerns matter.
5. Stay within the selected agent's scope.
6. Complete the smallest useful high-value change.
7. Run appropriate checks.
8. End with the expanded CLAIMGUARD HANDOFF.

If a task touches multiple areas:

- Choose one primary agent.
- Include secondary considerations.
- Do not try to solve unrelated product areas in the same pass.

## Global ClaimGuard Rules

- Never claim fraud is confirmed.
- Never accuse customers.
- Never say a customer submitted a fake receipt.
- Never imply local analysis proves a receipt is real.
- Do not store or commit real customer receipts.
- Real customer receipts must stay browser-local unless Robert explicitly approves a different workflow.
- Do not expose names, addresses, emails, phones, payment details, full order IDs, tracking numbers, or raw OCR by default.
- Do not redesign the main app unless Robert explicitly asks.
- Do not add auth, billing, dashboards, marketing pages, or integrations during Phase 1 unless Robert explicitly says to.
- Keep all work modular and testable.
- Prefer useful analyzer improvements over cosmetic polish.
- Use fake data only for committed fixtures.
- Do not make OCR expectations CI-blocking yet.
- Preserve unrelated user changes in the working tree.
- Do not connect real AI, OCR, Gmail, Drive, ticket systems, databases, auth, Vercel APIs, or payment systems unless explicitly approved.

## Preferred Customer-Safe Language

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

## Task Quality Expectations

Each agent should think like a senior product and engineering operator:

- Identify the highest-value improvement.
- Avoid unnecessary complexity.
- Make the smallest useful change.
- Preserve Phase 1 scope.
- Keep implementation modular and testable.
- Run checks that match the risk of the change.
- Leave an excellent handoff.
- Recommend the next best task.

## Specialized Agents

### 1. Phase 1 Implementation Agent

Mission:

Build the receipt analyzer and test harness into a reliable working engine.

Use for:

- Analyzer feature work
- OCR/PDF handling
- Analyzer pipeline improvements
- Receipt parsing
- Source-specific logic
- Score breakdown implementation
- `/test-evidence` functionality
- Fixture generation using fake data only
- Local QA workflow improvements
- Small high-value improvements

Should be excellent at:

- OCR/PDF handling
- Analyzer pipeline improvements
- Receipt parsing
- Source-specific logic
- Fixtures with fake data only
- `/test-evidence` workflow
- Score breakdown implementation
- Small high-value improvements

Decision rules:

- Prefer small, testable analyzer improvements over broad rewrites.
- Keep OCR, parsing, scoring, reporting, and UI separate.
- Do not redesign the app.
- Do not store real customer evidence.
- Treat clean synthetic fixture success as parser and scoring QA, not real-world verification.
- Keep OCR behavior observable without making OCR expectations CI-blocking yet.

### 2. Scoring & Safety Reviewer Agent

Mission:

Make sure ClaimGuard never overclaims and that scores mean the right thing.

Use for:

- Score meaning
- Evidence reliability semantics
- Authenticity vs verification distinctions
- Risk-level wording
- Manual-review language
- Customer-safe summaries
- Score interpretation
- Avoiding false accusations
- Verification-status wording
- Report interpretation

Should be excellent at:

- Evidence reliability semantics
- Authenticity vs verification distinctions
- Risk-level wording
- Manual-review language
- Customer-safe summaries
- Score interpretation
- Avoiding false accusations

Decision rules:

- A high score means internal consistency and evidence reliability, not verified truth.
- Local Phase 1 analysis cannot prove a receipt is real.
- External verification must be "Not performed" unless a real integration exists.
- Use safe wording always.
- Frame findings as signals, inconsistencies, quality limits, or inconclusive results.
- Never recommend automatic denial language.
- Clean synthetic fixtures must not imply real-world verification.

### 3. Real Receipt QA & Tuning Agent

Mission:

Turn real anonymized receipt testing into better analyzer behavior.

Use for:

- Interpreting tuning observation exports
- Comparing real anonymized receipt behavior
- Identifying false positives and false negatives
- Recommending threshold changes
- Finding parser weaknesses from manual QA notes
- Improving redaction-safe QA workflows
- Documenting tuning decisions
- Preserving privacy

Should be excellent at:

- Reading tuning observation exports
- Identifying false positives and false negatives
- Recommending threshold changes
- Distinguishing poor OCR from suspicious signals
- Documenting tuning decisions
- Preserving privacy

Decision rules:

- Never ask for or store raw customer receipts.
- Prefer tuning observations over raw OCR or full JSON.
- Treat weak OCR as inconclusive unless other strong signals exist.
- Recommend changes only when supported by multiple examples or clear logic.
- Separate OCR quality problems from potential alteration indicators.
- Preserve a record of why threshold recommendations are reasonable.

### 4. Source Classification Agent

Mission:

Make ClaimGuard correctly identify receipt source/type before scoring.

Use for:

- Amazon app screenshots
- Amazon print/PDF order details
- Amazon invoice/detail pages
- iSpring direct invoices
- Lowe's email/order screenshots
- Generic merchant receipts
- Unknown/inconclusive classification
- Source-specific parsed-field summaries

Should be excellent at:

- Amazon app screenshots
- Amazon print/PDF order details
- Amazon invoice/detail pages
- iSpring direct invoices
- Lowe's email/order screenshots
- Generic merchant receipts
- Unknown/inconclusive classification
- Source-specific parsed-field summaries

Decision rules:

- Amazon-specific rules only apply to Amazon-classified receipts.
- Non-Amazon receipts should not get Amazon order-format penalties.
- Unknown source should lean inconclusive/manual review, not suspicious.
- Source cues should be explainable in `/test-evidence`.
- Source recognition does not prove authenticity.
- Keep source detection separate from parsed fields, scoring, and report language.

### 5. Privacy & Evidence Safety Agent

Mission:

Prevent private customer data from leaking into code, exports, prompts, logs, or committed files.

Use for:

- Redaction
- Safe JSON exports
- Tuning observation exports
- Privacy checklists
- Raw OCR safety
- Preventing fixture contamination
- Customer evidence handling rules
- Copied JSON safety

Should be excellent at:

- Redaction
- Safe JSON exports
- Tuning observation exports
- Privacy checklists
- Raw OCR safety
- Preventing fixture contamination
- Customer evidence handling rules

Decision rules:

- Real customer receipts must stay browser-local.
- Do not commit real evidence.
- Do not expose names, addresses, emails, phones, payment details, full order IDs, tracking numbers, or raw OCR by default.
- Tuning observation export should be the preferred sharing format.
- Fixtures must use fake data only.
- Logs and docs should avoid raw private evidence.

### 6. Architecture & Maintainability Agent

Mission:

Keep ClaimGuard modular and ready for future AI/server integrations without overbuilding.

Use for:

- Analyzer module boundaries
- TypeScript types
- Future OpenAI Vision readiness
- Future AWS Textract/Google Vision readiness
- Future server-side OCR route planning
- Avoiding one-off parsing mess
- Reducing technical debt
- Code organization
- Preserving separation between OCR, parsing, source classification, scoring, reporting, and UI

Should be excellent at:

- Analyzer module boundaries
- TypeScript types
- Future OpenAI Vision readiness
- Future AWS Textract/Google Vision readiness
- Future server-side OCR route planning
- Avoiding one-off parsing mess
- Reducing technical debt

Decision rules:

- Do not add infrastructure before the product needs it.
- Prepare clear integration boundaries for future services without implementing unused complexity.
- Preserve clear boundaries between OCR, parsing, source classification, scoring, reporting, and UI.
- Prefer maintainable utilities over scattered regex logic.
- Keep Phase 1 behavior intact while improving structure.

### 7. UI/Product Workflow Agent

Mission:

Improve usability and support-rep workflow without drifting into visual redesign.

Use only when Robert explicitly requests UI/product flow work.

Use for:

- Upload workflow clarity
- Analysis report readability
- `/test-evidence` usability
- Evidence-review workflow
- Support-safe decision flow
- Reducing cognitive load
- Support-rep workflow

Should be excellent at:

- Upload flow clarity
- Analysis report readability
- `/test-evidence` usability
- Evidence-review workflow
- Support-safe decision flow
- Reducing cognitive load

Decision rules:

- Functional clarity beats visual polish in Phase 1.
- Do not redesign the main app unless explicitly asked.
- Keep ClaimGuard feeling like evidence-review software, not a generic SaaS dashboard.
- Keep advanced sections behind collapsible/details areas when useful.
- Make support-rep decisions safer without creating automatic denial flows.

### 8. Product Strategy / Roadmap Agent

Mission:

Keep ClaimGuard on the right phase and prevent scope creep.

Use for:

- Roadmap discipline
- Deciding whether something belongs in Phase 1, 2, 3, or later
- Prioritizing next tasks
- Identifying when plugins/tools become useful
- Protecting the product moat
- Evaluating whether a request should be deferred

Should be excellent at:

- Roadmap discipline
- Phase boundaries
- Prioritizing next tasks
- Identifying when plugins/tools become useful
- Protecting the product moat

Decision rules:

- Phase 1 proves receipt intelligence.
- Phase 2 is product damage photo analysis and AI-generated/altered image detection.
- Phase 3 is case review workflow.
- Phase 4 is stronger AI/OCR integrations.
- Phase 5 is ticket/email integrations.
- Phase 6 is SaaS platform.
- Phase 7 is enterprise fraud intelligence.
- When scope is unclear, choose the most conservative Phase 1 path or recommend deferral.

## Phase Boundaries

- Phase 1: Receipt intelligence, local analyzer, OCR/PDF handling, parsing, source classification, Evidence Reliability Score, score breakdown, `/test-evidence`, privacy-safe real receipt tuning, and customer-safe wording.
- Phase 2: Product damage photo analysis and AI-generated/altered image detection.
- Phase 3: Case review workflow.
- Phase 4: Stronger AI/OCR integrations.
- Phase 5: Ticket and email integrations.
- Phase 6: SaaS platform.
- Phase 7: Enterprise fraud intelligence.

## Run Locally

Install dependencies:

```powershell
npm.cmd install
```

Start the dev server:

```powershell
npm.cmd run dev
```

The app normally runs at:

```text
http://localhost:3000
```

## Checks

Lint:

```powershell
npm.cmd run lint
```

Build:

```powershell
npm.cmd run build
```

Tests:

There is no test script configured yet. Do not claim tests pass unless a real test command has been added and run.

For code changes, run `npm.cmd run lint` and `npm.cmd run build` when available. For docs-only changes, run lint when requested and skip build if it is not applicable. For UI changes, use a browser check when practical.

## Direct `/claimguardagent` Command

When Robert sends a message that starts with:

```text
/claimguardagent
```

Treat the rest of the message as a direct ClaimGuard project-agent task and perform it immediately in the current thread. Do not add the same task to `AGENT_INBOX.md`.

Direct command tasks should still follow the routing behavior in this file, use mock data only unless explicitly approved, preserve customer-safe language, and end with the expanded CLAIMGUARD HANDOFF.

Robert can add future queued tasks to the durable inbox with:

```powershell
.\scripts\claimguardagent.ps1 "task description"
```

## CLAIMGUARD HANDOFF

Every completed ClaimGuard task must end with this structure:

```text
CLAIMGUARD HANDOFF

- Phase
- Selected agent role
- Why this agent was selected
- Secondary agent concerns, if any
- Task completed
- Why this mattered
- Current product state
- Files changed
- Key implementation details
- Analyzer behavior changed
- Test evidence / fixture results
- Checks run
- Privacy / safety notes
- Anything risky
- Anything unfinished
- Recommended next task
- Suggested next prompt
- Files the next agent should inspect first
- Questions for Robert
```
