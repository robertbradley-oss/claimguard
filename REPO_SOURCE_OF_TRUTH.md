# ClaimGuard Repo Source Of Truth

Use `C:\Users\robby\Projects\ClaimGuard` as the active ClaimGuard source-of-truth repo.

Do not make ClaimGuard code, fixture, package, or documentation edits in `C:\Users\robby\OneDrive\Documents\GitHub\claimguard`. That OneDrive checkout is an outdated duplicate and should be treated as read-only reference material unless Robert explicitly says otherwise.

The OneDrive Documents path may exist as a shell starting point, but it is not the active Git working tree.

## Branch And Release Discipline

- Check `git status --short --branch` before and after work.
- Preserve unrelated user changes.
- Do not commit, push, deploy, rewrite history, or change repo visibility unless Robert explicitly asks.
- Do not stage `.env*`, `.vercel/`, `.next/`, `node_modules/`, real customer evidence, raw OCR from private evidence, private JSON exports, screenshots containing private details, or credentials.
- Keep release notes clear about whether work was docs/config-only, app behavior, analyzer logic, UI, QA, or deployment.

## Phase-Aware Workflow

- Phase 1 Receipt Intelligence is closed, deployed, and production-smoked.
- Phase 2.0 implementation has officially started.
- Current Phase 2.0 state is scaffold-only, local-heuristics-only, provider-ready, and intentionally unwired.
- Shared evidence model types and product-photo scaffold/defaults exist.
- No product-photo analyzer behavior is live yet.
- No runtime analyzer, upload, UI, report, scoring, parser, or fixture behavior changed during the overnight Phase 2 scaffold.
- `product-photo` is canonical.
- `damage-photo` remains only a compatibility alias to `product-photo` / `damage-close-up`.
- Do not start Phase 2.1 until Robert/ChatGPT explicitly confirms the scaffold review is complete.
- Future-phase planning is allowed when requested.
- Future-phase implementation requires explicit approval from Robert.
- Use `ROADMAP.md` for durable phase definitions.
- Use `NEXT_STEPS.md` for the immediate working queue.
- Use `AGENTS.md` and `ROUTING.md` to select the correct agent role before work.

## Pre-Change Review Checklist

Before editing:

- Confirm you are in `C:\Users\robby\Projects\ClaimGuard`.
- Confirm the selected agent and phase boundary.
- Identify whether the task touches docs/config, UI, analyzer/parser/scoring/report/privacy logic, fixtures, dependencies, or release/deploy workflow.
- Confirm private evidence is not being introduced.

## Stop And Report Conditions

Stop and report before continuing when:

- The active path is not `C:\Users\robby\Projects\ClaimGuard`.
- Work appears to be in a OneDrive duplicate or outdated checkout.
- Dirty mixed work makes the current task scope unclear.
- Unexpected app-code, analyzer, parser, scoring, report, privacy, fixture, package, script, or upload-mechanics diffs appear.
- Real customer evidence, private customer data, raw OCR, copied private JSON, or credentials appear in files or logs.
- Unsafe wrongdoing-confirming language, customer-accusation language, or automatic-denial language appears.
- Phase 2.1 runtime behavior, UI/upload wiring, analyzer routing, scoring/report/parser/fixture changes, or provider work appears before Robert/ChatGPT explicitly confirms the Phase 2.0 scaffold review is complete.
- A required check fails or cannot run.

## Check Guidance

Docs/config-only:

- `git diff --check`
- `npm.cmd run check:report-semantics` when safety wording might matter

Analyzer/parser/scoring/report/privacy/fixture changes:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:report-semantics`
- Targeted synthetic fixture or manual QA checks

UI changes:

- `npm.cmd run lint`
- `npm.cmd run build`
- Browser check affected routes when practical

Release/deploy work:

- `git status --short --branch` before and after
- Confirm exact branch and commit
- Run relevant checks for changed areas
- Perform or document production smoke only when deploy is explicitly requested

## Source Safety

Committed fixtures must be synthetic or structurally redacted. Real customer receipts, photos, ticket content, order details, customer messages, and copied private JSON must not be committed.

Preserve ClaimGuard semantics: evidence scores measure local evidence quality and internal consistency, not externally confirmed truth.
