# ClaimGuard Repo Source Of Truth

Use `C:\Users\robby\Projects\ClaimGuard` as the active ClaimGuard source-of-truth repo.

Do not make ClaimGuard code, fixture, package, or documentation edits in `C:\Users\robby\OneDrive\Documents\GitHub\claimguard`. That OneDrive checkout is an outdated duplicate and should be treated as read-only reference material unless Robert explicitly says otherwise.

## Pre-Commit Review Checklist

Before preparing Phase 1 work for commit:

- Confirm `git status --short --branch` is running from `C:\Users\robby\Projects\ClaimGuard`.
- Group changes by review area: analyzer engine, `/test-evidence` harness, source classification and fixtures, reliability-score semantics, docs/routing, package/script changes, and brand assets.
- Manually review risky files before staging, especially analyzer/scoring modules, `src/components/ClaimReviewWorkflow.tsx`, dependency changes, and fixture data.
- Confirm committed fixtures are synthetic or privacy-safe only. Do not stage real customer receipts, raw OCR from customer evidence, copied private JSON, `.env*`, `.vercel/`, `.next/`, or `node_modules/`.
- Run `npm.cmd run lint`, `npm.cmd run build`, and `npm.cmd run check:report-semantics`.
- Browser-check `/test-evidence` when practical, using synthetic fixtures or anonymized browser-local evidence only.
- Preserve Phase 1 semantics: Evidence Reliability Score measures local evidence quality and internal consistency, not externally verified authenticity.
