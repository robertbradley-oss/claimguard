# Phase 4.37 OpenAI Vision Provider Config Skeleton

## 1. Purpose And Scope

Phase 4.37 implements the OpenAI Vision provider configuration skeleton approved by Robert under Phase 4.36 Choice A. This is provider configuration skeleton implementation only. It does not authorize API-credit usage, live OpenAI calls, synthetic fixture provider calls, or real evidence processing.

The skeleton defines disabled-by-default provider configuration behavior for a future OpenAI Vision sandbox provider path. It does not implement a provider client, request builder, request execution, provider adapter, provider response normalization, API key usage, live timeout/retry execution, upload handling, storage, persistence, UI, route behavior, receipt scoring, `analyzeEvidenceFile` changes, or `LocalAnalysisResult` output.

This is not live AI and not production analysis. It is not provider-backed OCR. It is not a customer-facing evidence decision path.

This phase adds no evidence observation output, no provider signal output, and no evidence limitation output beyond documentation of the inert configuration boundary.

## 2. Implementation Summary

Phase 4.37 adds `src/lib/analysis/vision-sandbox/provider-config.ts` as a sandbox-only inert configuration module. The module exports:

- `VISION_SANDBOX_PROVIDER_CONFIG_PHASE`.
- Strict timeout and fixture-batch constants.
- A disabled-by-default `VisionSandboxProviderConfig` shape.
- A passive `VisionSandboxProviderConfigCandidate` shape for future-approved config review.
- `VISION_SANDBOX_PROVIDER_CONFIG_DEFAULTS`.
- `resolveVisionSandboxProviderConfig`.

The resolver accepts optional candidate values as inert data only. It always returns the disabled defaults and a guard result. Unsafe candidate values, such as provider enablement, broader evidence scope, enabled payload logging, enabled raw OCR retention, automatic retry, excessive timeout, or provider-enabled package mode, are reported as guard violations and still do not enable provider behavior.

The skeleton is exported from `src/lib/analysis/vision-sandbox/index.ts` and covered by `src/lib/analysis/vision-sandbox/vision-sandbox.probe.ts`.

No `.env.example` is added in Phase 4.37. The current sandbox works without provider config, the config skeleton does not read environment values, and API-credit-using work still requires separate approval. A future `.env.example` may be added only in a later approved hardening/setup phase with placeholders only, no secrets, no real values, provider disabled by default, and no real evidence guidance.

## 3. Disabled-By-Default Behavior

Provider configuration defaults to disabled:

- `providerEnabled: false`.
- `providerCallsAllowed: false`.
- `requestExecutionAllowed: false`.
- `apiCreditUsageAllowed: false`.
- `secretsRequired: false`.
- `envConfigRequired: false`.

Future provider calls are not possible from this skeleton. No function in the module can execute a provider call, spend API credits, read a secret, process evidence bytes, upload data, create storage, persist data, or alter route/runtime behavior.

## 4. Config Shape

The inert config shape includes:

- `providerMode`.
- `providerFamily`.
- `providerEnabled`.
- `modelName`.
- `timeoutMs`.
- `timeoutCeilingMs`.
- `retryPolicy`.
- `maxFixtureBatchSize`.
- `costLimitMode`.
- `payloadLoggingPolicy`.
- `rawOcrRetentionPolicy`.
- `evidenceScope`.
- `packageSafetyMode`.

Rules enforced by defaults and probes:

- `providerEnabled` defaults to false.
- `evidenceScope` remains `synthetic-fixture-only`.
- `payloadLoggingPolicy` defaults to `disabled`.
- `rawOcrRetentionPolicy` defaults to `disabled`.
- `retryPolicy.automaticRetriesEnabled` defaults to false.
- `retryPolicy.maxAttempts` defaults to 1.
- `timeoutMs` is below the strict ceiling.
- `maxFixtureBatchSize` defaults to 1.
- No field contains a real secret.
- No field contains a real provider value.
- No field enables API-credit-using behavior.

## 5. Environment Guidance

Phase 4.37 does not add `.env`, `.env.local`, or `.env.example`.

Environment guidance remains:

- Current sandbox checks work without provider config.
- Provider config is disabled by default.
- API-credit-using work requires separate Robert approval.
- Real evidence must not be used.
- Real provider values and secrets must not be committed.
- Self-hosted users can configure providers later only after approved setup guidance exists.

The boundary checker now fails if real `.env` or `.env.local` files exist in the repo root during sandbox boundary checks. It also continues to block provider SDK imports, provider endpoint/call patterns, provider env reads in source/scripts, provider dependencies, package artifacts, route/runtime drift, unsafe fixture metadata, and unsafe wording.

## 6. Package And Downloadable Safety

The provider configuration skeleton remains package-safe:

- No secrets.
- Provider disabled by default.
- No provider payloads.
- No real evidence.
- No anonymized/redacted real fixtures.
- No package artifacts.
- No live-provider assumptions.
- Downloadable/self-hosted installs remain usable without provider access.
- Future self-hosted provider setup must require a later approved guide.

## 7. Relationship To Current Sandbox

The current sandbox remains script/module-only. The fixture runner remains synthetic-only. The provider config skeleton does not call providers, does not read secrets, does not read real environment values, does not change routes, does not change uploads, does not change receipt scoring, does not use `LocalAnalysisResult`, and does not change `analyzeEvidenceFile`.

Existing `POST /api/analysis/ocr` remains unchanged. Existing `POST /api/analysis/mock-provider` remains unchanged. Receipt parser, scoring, report behavior, upload flow, `ClaimReviewWorkflow`, and `ProductPhotoReviewPanel` remain protected.

## 8. Boundary And Validation Coverage

Phase 4.37 updates checks to cover:

- Real env files.
- Real provider secrets.
- Provider SDK imports.
- Provider network call patterns.
- Accidental API-credit behavior.
- Provider enabled by default.
- Payload logging enabled by default.
- Raw OCR retention enabled by default.
- Evidence scope broader than synthetic fixtures.
- Route/runtime/receipt integration drift.
- Provider config probe coverage.

The existing `check:vision-sandbox-skeleton` command validates default config safety and unsafe candidate blocking through `vision-sandbox.probe.ts`. The existing `check:vision-sandbox-boundaries` command validates static boundaries and package safety.

## 9. Specialist Review Findings

Product Strategy Agent: The skeleton supports future AI/photo intelligence readiness while keeping altered-or-AI-generated-image uncertainty as a review signal only, not proof, not a final claim decision, and not a customer accusation.

Architecture and Maintainability Agent: The config module is isolated under the sandbox boundary, pure data only, exported through the sandbox index, and covered by probes. It does not create a provider client, request execution path, route, UI, upload, storage, receipt scoring, or runtime coupling.

Receipt Intelligence Agent: Receipt behavior remains protected. `analyzeEvidenceFile`, `LocalAnalysisResult`, parser, scoring, report behavior, OCR route behavior, and mock-provider route behavior are unchanged.

Integration Readiness Agent: Choice A is satisfied without API-credit usage. Choice B remains required before any provider call, synthetic fixture provider call, live response normalization, API key usage, or cost-incurring behavior.

Scoring and Safety Reviewer Agent: The skeleton does not produce evidence conclusions, claim outcomes, fraud scores, or customer-facing accusation language. Any future altered-or-AI-generated-image percentage remains a manual-review uncertainty signal only.

Privacy and Evidence Safety Agent: No real evidence, customer data, provider payload, raw OCR retention, storage handle, public/object URL, or secret is introduced. Evidence scope stays synthetic-fixture-only.

QA Harness Agent: Probe and boundary coverage now validates disabled defaults, blocked unsafe candidate config, no provider calls, no payload logging, no raw OCR retention, synthetic-only scope, and package-safe defaults.

Deployment and Release Agent: Commit and push are appropriate only after checks pass. No deployment, package artifact, release bundle, or live provider setup is part of Phase 4.37.

## 10. Phase 4.38 Recommendation

Preferred next phase: Phase 4.38 provider configuration skeleton hardening and `.env.example`/package-safety review, still no provider calls and no API-credit usage.

Alternative: Phase 4.38 first API-credit-using OpenAI Vision sandbox implementation, synthetic fixtures only, only if Robert explicitly approves Choice B.

Do not recommend API-credit-using implementation unless Robert explicitly approves Choice B.

## 11. Closeout Criteria

Phase 4.37 is complete only if:

- Provider configuration skeleton remains inert.
- No live OpenAI implementation is added.
- No OpenAI SDK or provider SDK is added.
- No real env var or real env file is added.
- No secret is added.
- No provider call is added.
- No API-credit-using behavior is added.
- Provider remains disabled by default.
- Evidence scope remains synthetic-fixture-only.
- Payload logging remains disabled by default.
- Raw OCR retention remains disabled by default.
- No route behavior changes are added.
- No upload, storage, persistence, runtime wiring, UI wiring, real evidence path, anonymized/redacted real fixture, provider payload, package artifact, protected runtime change, receipt behavior change, `analyzeEvidenceFile` change, or `LocalAnalysisResult` change is added.
- Required checks pass.
