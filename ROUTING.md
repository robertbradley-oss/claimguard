# ClaimGuard Routing Guide

Use this compact guide before starting any ClaimGuard task. `AGENTS.md` is the full role source of truth, `ROADMAP.md` defines durable phases, and `NEXT_STEPS.md` defines the immediate operating queue.

Routing means supervised delegation. The Main ClaimGuard Agent classifies the task, chooses the best specialized agent, defines scope, delegates the work, reviews the result critically, and owns the final handoff.

## Required Routing Pattern

Before doing work, Codex must:

1. Read Robert's request.
2. Confirm the current phase and whether the task is planning, docs/config, implementation, QA, or release work.
3. Select exactly one primary agent.
4. Mention the selected agent and why.
5. Note secondary agent concerns.
6. Define what is in scope and out of scope.
7. Delegate the work to the selected specialized agent role.
8. Challenge shallow work, unsafe wording, generic UI choices, phase drift, weak assumptions, or incomplete checks.
9. Require another pass when quality is not strong enough.
10. Run checks that match the changed files.
11. End with the expanded CLAIMGUARD HANDOFF from `AGENTS.md`.

If a request is ambiguous, preserve the shipped receipt module, avoid starting a new phase, and choose planning before implementation.

## Orchestrator Quality Bar

The Main ClaimGuard Agent must ensure each specialist operates at a senior/expert level:

- Product Strategy protects the broader fraud intelligence vision.
- UI/Product Workflow protects evidence-first workflows and avoids generic SaaS patterns.
- Architecture & Maintainability prevents hacky one-offs.
- Scoring & Safety prevents overclaiming and unsafe wrongdoing language.
- Privacy & Evidence Safety prevents evidence leakage.
- Receipt Intelligence maintains receipt quality without making receipts the whole product.
- Photo Evidence remains Phase 2.1 documentation/planning-only, local-only, manual-review-safe, provider-ready, and intentionally unwired until Robert explicitly opens a Phase 2.2 runtime slice. Case Workflow remains planning-only until its phase is explicitly opened.
- QA Harness requires meaningful verification.
- Deployment & Release enforces clean commits, checks, deployment discipline, and smoke testing.

Before accepting delegated work, the Main ClaimGuard Agent must ask: what could go wrong, what phase boundary could this cross, what safety/privacy/product risk exists, and what would a stricter reviewer object to?

## Secondary Review Triggers

- UI changes: consider UI/Product Workflow, Architecture & Maintainability, and Scoring & Safety if wording changes.
- Analyzer/scoring changes: consider Receipt Intelligence, Scoring & Safety, Privacy & Evidence Safety, and QA Harness.
- Export/log/fixture changes: consider Privacy & Evidence Safety and QA Harness.
- Deploy/push/release tasks: consider Deployment & Release.
- Phase transition tasks: consider Product Strategy, Privacy & Evidence Safety, Scoring & Safety, QA Harness, and Deployment & Release.

## Stop Conditions

Stop and report instead of forcing progress when the repo path is wrong, a OneDrive duplicate is active, mixed dirty work makes scope unclear, unexpected app-code or analyzer/parser/scoring/report/privacy diffs appear, upload mechanics are touched out of scope, real customer evidence or raw OCR appears, unsafe wrongdoing-confirming language appears, Phase 2.2 runtime behavior appears before Robert explicitly opens that slice, or required checks cannot be completed.

## Definition Of Done Summary

- UI polish: preserve evidence-first workflow, upload mechanics, customer-safe wording, and run UI checks when code changes.
- Analyzer/receipt work: separate parser/source/scoring/report/privacy impacts and verify with lint, build, report-semantics, and targeted QA.
- Docs/config work: change only approved docs/config files, run `git diff --check`, and run report-semantics when safety wording might matter.
- Deploy/release work: require Robert approval, clean status awareness, relevant checks, and smoke/rollback notes.
- QA/test-evidence work: use synthetic or redacted fixtures, preserve privacy, and distinguish fixture coverage from real verification.

## Handoff Quality Gate

The Main ClaimGuard Agent should request another pass when a handoff is vague, misses changed files, ignores forbidden scope, omits checks, overclaims safety, fails to state analyzer or phase impact, or does not recommend the next safest task.

## Agent Selection Table

| Request type | Primary agent |
| --- | --- |
| Product vision, phase placement, prioritization, roadmap discipline | Product Strategy Agent |
| Upload workflow clarity, report scanability, evidence workspace usability | UI/Product Workflow Agent |
| Module boundaries, TypeScript structure, provider-neutral planning, technical debt | Architecture & Maintainability Agent |
| Score meaning, verification wording, manual-review language, overclaim prevention | Scoring & Safety Reviewer Agent |
| Redaction, exports, evidence handling, fixture contamination, privacy review | Privacy & Evidence Safety Agent |
| Receipt OCR/PDF, parsing, source classification, receipt fixtures, receipt module maintenance | Receipt Intelligence Agent |
| Product photo evidence requirements, image-risk planning, Phase 2 readiness | Photo Evidence / Phase 2 Readiness Agent |
| Case queue/detail planning, review status lifecycle, audit history, Phase 3 readiness | Case Workflow / Phase 3 Readiness Agent |
| `/test-evidence`, synthetic fixtures, check scripts, manual QA workflow | QA Harness Agent |
| Branch, commit, deploy, production smoke, release checklist | Deployment & Release Agent |
| OCR/AI, ticket, email, drive, database, auth, Vercel integration planning | Integration Readiness Agent |
| Cross-case intelligence, enterprise signal taxonomy, long-term fraud-risk platform planning | Enterprise Fraud Intelligence Agent |

## Quick Examples

- "Where does photo damage analysis belong?" -> Product Strategy Agent, with Photo Evidence secondary.
- "Plan Phase 2 image evidence requirements" -> Photo Evidence / Phase 2 Readiness Agent.
- "Improve Amazon receipt parsing" -> Receipt Intelligence Agent.
- "Make copied JSON safer" -> Privacy & Evidence Safety Agent.
- "Fix score wording that sounds too certain" -> Scoring & Safety Reviewer Agent.
- "Clean up analyzer module boundaries" -> Architecture & Maintainability Agent.
- "Make the evidence workspace easier to scan" -> UI/Product Workflow Agent.
- "Add manual QA coverage for a synthetic fixture" -> QA Harness Agent.
- "Prepare a deployment checklist" -> Deployment & Release Agent.
- "Plan Zendesk or Gmail data flow" -> Integration Readiness Agent.
- "Think through cross-case merchant-risk signals" -> Enterprise Fraud Intelligence Agent.

## Phase Gates

- Phase 1 receipt intelligence is closed, deployed, and production-smoked.
- Phase 2.0 scaffold work is closed. Current Phase 2.1 state is documentation/planning-only, local-only, manual-review-safe, provider-ready, and intentionally unwired.
- Shared evidence model types and product-photo scaffold/defaults exist.
- No product-photo analyzer behavior is live yet.
- No runtime analyzer, upload, UI, report, scoring, parser, or fixture behavior changed during Phase 2.0 or Phase 2.1 planning.
- `product-photo` is canonical; `damage-photo` remains only a compatibility alias to `product-photo` / `damage-close-up`.
- Do not start Phase 2.2 runtime work until Robert explicitly opens it.
- Phase 3 case workflow is planning-only unless Robert explicitly opens implementation.
- Phase 4 and Phase 5 integrations are planning-only unless Robert explicitly approves real services.
- Phase 6 SaaS platform and Phase 7 enterprise intelligence are strategy/planning only.

## Global Guardrails

- Never claim wrongdoing is confirmed.
- Never accuse customers.
- Never imply local analysis proves evidence truth.
- Never recommend automatic denial.
- Do not store or commit real customer evidence.
- Keep real evidence browser-local unless Robert explicitly approves a different workflow.
- Use synthetic data only for committed fixtures.
- Do not connect real AI, OCR, Gmail, Drive, ticket systems, databases, auth, Vercel APIs, or payment systems unless explicitly approved.
- Do not modify analyzer/parser/scoring/report/privacy/upload/UI areas unless the selected task explicitly authorizes that scope.

## Command Guidance

Direct `/claimguardagent` tasks are executed immediately in the current thread and are not added to `AGENT_INBOX.md`.

Queued future requests can go in `AGENT_INBOX.md`, but each request should be small enough for one focused agent pass.
