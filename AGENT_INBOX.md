# ClaimGuard Agent Inbox

Use this file to communicate with the autonomous ClaimGuard project agent.

## How To Use

Add requests under **Open Requests**. Keep each request small enough for one focused project-agent pass.

Good requests:

- Polish the upload-to-analysis workflow.
- Review the dashboard for mobile layout issues.
- Improve mock risk report copy.
- Add a mock case detail view.
- Summarize current repo health.

Do not request real integrations here unless you are ready for explicit approval in the Codex thread.

## Open Requests

Add new requests below this line.

```text
[priority: high] 9AM CHECK-IN INSTRUCTIONS FOR ROBERT

At the 9am review point, do not continue making changes until Robert reviews the overnight result.

Prepare a concise morning checkpoint that includes:

1. Current branch and sync state:
   - git status --short --branch
   - latest commit hash
   - whether main is pushed and synced with origin/main

2. Overnight work summary:
   - commits created
   - files changed per commit
   - which planned slices were completed
   - which slices were skipped or stopped

3. Safety verification:
   - confirm whether runtime behavior changed
   - confirm whether analyzer.ts changed
   - confirm whether upload behavior changed
   - confirm whether UI changed
   - confirm whether fixtures changed
   - confirm whether report mapping/scoring/parser behavior changed

4. Checks:
   - npm.cmd run lint
   - npm.cmd run build
   - npm.cmd run check:report-semantics
   - git diff --check

5. Risk callout:
   - anything risky
   - anything intentionally left unwired
   - anything Robert should inspect before the next task

6. Recommended next move:
   - one safest next Phase 2 task
   - whether to continue scaffolding, begin local heuristic design, or pause for review

Do not start a new slice after preparing the 9am checkpoint unless Robert explicitly approves it.

End with the CLAIMGUARD HANDOFF format.

[priority: medium] Example: Improve the upload-to-analysis workflow using mock data only.
```

## Completed Requests

- 2026-05-23: Added a "ChatGPT Handoff Requirement" section to `AGENTS.md` with the exact required ClaimGuard handoff format.

## Parking Lot

Use this section for ideas that are not ready for implementation.

- Add real OCR later.
- Add real AI vision later.
- Plan database schema after the mock workflow is stable.
- Direct `/claimguardagent` commands should be sent in the Codex thread, not stored in this inbox.
