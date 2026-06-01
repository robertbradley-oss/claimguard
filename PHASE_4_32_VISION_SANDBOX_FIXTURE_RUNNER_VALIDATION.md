# Phase 4.32 Vision Sandbox Fixture-Runner Validation

Phase 4.32 is a script/module-only OpenAI Vision sandbox skeleton hardening and fixture-runner validation slice.

It adds a local developer runner for the existing approved synthetic fixture registry. The runner validates every synthetic fixture reference, confirms the expected sandbox result status, checks requested analysis-mode handling and fallback behavior, verifies unsupported/failure simulations remain limitation-only, and keeps privacy, retention, package-safety, and runtime-isolation guard status explicit.

## What Changed

- Added `src/lib/analysis/vision-sandbox/fixture-runner.ts`.
- Added npm script `check:vision-sandbox-fixture-runner`.
- Added `scripts/check-vision-sandbox-fixture-runner.cjs`.
- Extended the existing skeleton probe so `check:vision-sandbox-skeleton` also exercises the fixture runner.
- Extended semantic and sandbox-boundary checks for the new runner and script.

## Validation Coverage

The fixture runner verifies:

- All 12 approved synthetic fixture keys are covered.
- Every resolved fixture reference points to an existing synthetic SVG asset or markdown simulation.
- Default analysis mode matches fixture metadata.
- Explicit allowed analysis mode requests are accepted.
- Incompatible analysis mode requests fall back to the fixture metadata mode.
- Completed synthetic outputs preserve observation and signal separation.
- Unsupported and failure-state outputs remain limitation-only with no altered-or-AI-generated-image uncertainty value.
- Privacy and retention markers stay closed to customer identifiers, raw OCR, provider payloads, storage, persistence, and file retention.
- Package-safety markers remain distributable-synthetic-demo only, with no provider access, no env secrets, and no package artifact.

## Safety Boundary

Phase 4.32 adds no SDK, no env var, no provider call, no route behavior, no upload, no storage, no persistence, no UI wiring, no real evidence, no fixture asset or metadata change, no package artifact, no receipt behavior change, no `analyzeEvidenceFile` change, and no `LocalAnalysisResult` change.

The runner produces developer validation results only. It does not analyze real evidence, perform OCR, call an external vision service, create a report for support reps, or make a claim decision. Altered-or-AI-generated-image uncertainty remains a review signal only, not proof, not a final decision, and not a fraud score.

## Specialist Review

Primary agent: Integration Readiness Agent.

Secondary concerns:

- QA Harness Agent: the new runner is executable and covers fixture references, mode behavior, failure simulations, and guard states.
- Privacy & Evidence Safety Agent: the runner uses only synthetic fixture metadata/assets and validates privacy/retention markers.
- Scoring & Safety Reviewer Agent: the runner preserves manual-review-only wording and limitation-only failure semantics.

## Checks

Required checks for this slice:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:report-semantics`
- `npm.cmd run check:vision-sandbox-boundaries`
- `npm.cmd run check:vision-sandbox-skeleton`
- `npm.cmd run check:vision-sandbox-fixture-runner`
- `git diff --check`

Browser checks are not required because Phase 4.32 adds no route, page, rendered component, or UI behavior.

## Next Safe Task

The next recommended task is a separate OpenAI Vision sandbox developer usage and readiness checkpoint documentation pass, still with no SDK/env/provider calls, no route behavior, no upload/storage/persistence, no real evidence, no UI wiring, no receipt behavior change, no `analyzeEvidenceFile` change, and no `LocalAnalysisResult` change.
