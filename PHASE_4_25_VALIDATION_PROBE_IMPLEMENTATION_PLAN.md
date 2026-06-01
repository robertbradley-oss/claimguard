# Phase 4.25 Validation Probe Implementation Plan

Date: 2026-06-01

Primary agent role: QA Harness Agent

Supporting reviews: Product Strategy, Architecture and Maintainability, Receipt Intelligence, Integration Readiness, Scoring and Safety, Privacy and Evidence Safety, Deployment and Release

## 1. Purpose And Scope

Phase 4.25 is an OpenAI Vision sandbox validation/probe implementation planning-only milestone. ClaimGuard needs a precise implementation plan before adding local static validation in Phase 4.26 because the guardrails must protect the Phase 4.19 through Phase 4.24 sandbox plans without accidentally opening live AI, provider execution, upload handling, route wiring, runtime schema/types, real evidence, or downloadable package artifacts.

This milestone is planning-only. No new validation/probe implementation is added. No runtime schema/types are added. No fixture metadata files, fixture files, or fixture images are added. This milestone does not add OpenAI SDKs, provider SDKs, environment variables, provider calls, provider implementation, live OCR, multipart parsing, binary upload parsing, storage, persistence, UI, route behavior changes, real evidence processing, package artifacts, deployment, or live AI/Vision/photo analysis. It does not wire `ClaimReviewWorkflow`, does not route `ProductPhotoReviewPanel`, does not change `analyzeEvidenceFile`, does not change `LocalAnalysisResult`, does not change receipt parser/scoring/report behavior, does not change existing `POST /api/analysis/ocr` behavior, and does not change existing `POST /api/analysis/mock-provider` behavior.

This is not live AI. It is not validation implementation. It is not fixture metadata implementation. It is not fixture creation. It is a plan for the local static checks that Phase 4.26 may implement if all gates pass.

## 2. Phase 4.26 Probe Implementation Set

Phase 4.26 should implement the highest-value local static scans first:

- No OpenAI/provider SDK imports or dependencies.
- No provider credential environment variable additions.
- No provider call patterns or provider endpoint execution.
- No upload, storage, persistence, object URL, public image URL, or data URL additions in sandbox-related work.
- No protected runtime import or wiring changes.
- No `analyzeEvidenceFile` or `LocalAnalysisResult` changes.
- No real evidence fixture additions.
- No private identifier patterns in future sandbox docs, metadata, fixture areas, or package-facing sample areas.
- No provider payload dumps, request IDs, dashboard links, raw provider errors, or raw OCR dumps.
- No unsafe wording outside explicit disallowed-wording documentation sections.
- Altered-or-AI-generated-image uncertainty wording remains review-signal-only and not proof.
- Observation-vs-signal separation language remains present.
- Unsupported/failure shapes remain limitation-only and operational where appropriate.
- Fixture metadata policy and package/distribution safety language remain explicit.

If implementing every scan becomes too broad, Phase 4.26 should implement no-SDK/env/provider-call, no-upload/storage/runtime-wiring, privacy/identifier, unsafe wording, altered/AI uncertainty, fixture-metadata/package-safety, and protected-file scans first, then document deferred checks.

## 3. Files To Inspect

The Phase 4.26 static check should inspect:

- `package.json`
- `package-lock.json`
- `scripts/check-report-semantics.mjs`
- `scripts/run-product-photo-probes.cjs`
- New static validation scripts under `scripts/`, if added.
- `PHASE_4_19_OPENAI_VISION_SANDBOX_PLAN.md`
- `PHASE_4_20_OPENAI_VISION_PROMPT_OUTPUT_CONTRACT_PLAN.md`
- `PHASE_4_21_OPENAI_VISION_SANDBOX_SCHEMA_PLAN.md`
- `PHASE_4_22_OPENAI_VISION_SANDBOX_FIXTURE_POLICY_PLAN.md`
- `PHASE_4_23_OPENAI_VISION_SANDBOX_VALIDATION_PROBE_PLAN.md`
- `PHASE_4_24_SYNTHETIC_FIXTURE_METADATA_SCHEMA_PLAN.md`
- This Phase 4.25 implementation plan.
- Future Phase 4.27 metadata directories, only after that phase creates them.
- Future Phase 4.29 fixture directories, only after that phase creates them.
- `src/app/api/analysis/ocr/route.ts`
- `src/app/api/analysis/ocr/route.probe.ts`
- `src/app/api/analysis/mock-provider/route.ts`
- `src/app/api/analysis/mock-provider/route.probe.ts`
- `src/lib/analysis/providers/mock-provider-adapter.ts`
- `src/lib/analysis/providers/mock-provider-adapter.probe.ts`
- `src/lib/analysis/ocr-extraction-contract.ts`
- `src/lib/analysis/analyzer.ts`
- `src/lib/analysis/types.ts`
- `src/components/ClaimReviewWorkflow.tsx`
- `src/components/ProductPhotoReviewPanel.tsx`
- `src/components/UploadPanel.tsx`
- Source-of-truth docs when they mention sandbox, fixtures, package distribution, or provider readiness.

The check should fail closed if a required file is missing, unless the missing file belongs to a later phase that has not created its directory yet.

## 4. Blocked Patterns And Planning-Only Exceptions

Blocked patterns should include:

- Provider SDK imports, provider client constructors, and provider package dependencies.
- Provider credential environment variable reads or newly documented real credential values.
- Provider network calls, provider endpoint URLs, fetch-call-like provider execution snippets, or shell execution snippets.
- Multipart parsing, binary upload parsing, file upload route acceptance, object URL creation, storage handles, public image URL ingestion, file URL ingestion, data URL ingestion, or persistence calls.
- Runtime imports from sandbox artifacts into analyzer, report, receipt, route, upload, workflow, or product-photo UI surfaces.
- `analyzeEvidenceFile` signature, behavior, or dependency changes.
- `LocalAnalysisResult` changes or migration language.
- Provider payload dumps, raw OCR dumps, request IDs, stack traces, dashboard links, or replay fixtures.
- Real evidence, anonymized/redacted customer evidence, customer identifiers, order/tracking/ticket identifiers, private contact details, addresses, precise timestamps, and external copyrighted/customer imagery.
- Proof, final-decision, customer-accusation, automatic deny/refund, fake/forged confirmation, or single fraud-score wording outside explicit "disallowed wording" or "must not use" documentation sections.

Allowed planning-only exceptions:

- The words for blocked concepts may appear inside explicit safety-rule, stop-condition, disallowed-output-pattern, or "do not add" sections.
- Existing approved Phase 4.19 through Phase 4.25 planning docs may describe future concepts if they state no implementation is added.
- Existing mock provider route and adapter code may remain as the synthetic/mock-only boundary already approved in prior phases.
- Existing Tesseract and EXIF-related dependencies may remain because they predate this package and are not OpenAI/provider SDK additions for this milestone.

## 5. No-SDK/Env/Provider-Call Checks

Phase 4.26 should block:

- New OpenAI/provider SDK dependencies.
- New provider credential environment variable usage.
- Provider client construction.
- Provider endpoint calls.
- Provider request/response logging.
- Provider payload replay fixtures.
- Provider-specific implementation branches in routes, analyzers, or scripts.

Allowed:

- Planning references that explicitly state SDK/env/provider work is blocked.
- Existing synthetic mock provider adapter and mock provider route behavior.
- Static scanning code that looks for these blocked patterns without importing provider SDKs or calling networks.

## 6. No-Upload/Storage/Object-URL Checks

Phase 4.26 should block:

- Multipart parsing.
- Binary upload parsing.
- File/blob acceptance in new sandbox paths.
- `createObjectURL`, object URL fields, data URL fields, public image URL fields, file URL fields, and storage handles.
- Database, storage, persistence, or case-queue writes for evidence.

Allowed:

- Existing receipt workflow upload UI remains unchanged.
- Planning text may mention these terms only as blocked behavior.
- Future fixture files may be planned, but not created until Phase 4.29.

## 7. No-Runtime-Wiring And No-Route-Behavior-Change Checks

Phase 4.26 should compare protected surfaces against the intended boundary:

- `POST /api/analysis/ocr` remains exact `fixtureKey` JSON-only synthetic fixture route behavior.
- `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only.
- `analyzeEvidenceFile` remains unchanged.
- `LocalAnalysisResult` remains unchanged.
- Receipt parser, scoring, report mapping, `ClaimReviewWorkflow`, `ProductPhotoReviewPanel`, and upload behavior remain unchanged.
- Sandbox planning, metadata, and future fixture assets are not imported into runtime routes or UI.

The check should fail if sandbox work is wired into live analyzer/report/UI/route paths before a separately approved phase.

## 8. No-Real-Evidence And No-Private-Identifier Checks

Phase 4.26 should scan future docs, metadata, and fixture areas for:

- Customer names.
- Email addresses.
- Phone numbers.
- Postal addresses.
- Realistic order numbers.
- Tracking numbers.
- Ticket/case/customer/evidence identifiers.
- Public image URLs.
- File URLs.
- Object URLs.
- Storage handles.
- Raw OCR dumps.
- Provider payload dumps.
- EXIF/location metadata.
- Real screenshots of accounts, marketplaces, customers, receipts, or product photos.

Future metadata and fixture files should fail if identifier status is unknown, package distribution status is missing, synthetic status is missing, or a redacted/anonymized fixture appears without a separate approval gate.

## 9. No-Provider-Payload Logging Checks

Phase 4.26 should block raw provider request/response material in:

- Docs.
- Metadata.
- Fixtures.
- Logs.
- Scripts.
- Package-facing sample data.
- Future schema/output examples.

Allowed provider-failure language should be high-level only, such as timeout, unavailable, rate-limited, cost-limit, refusal, malformed response, schema validation failure, or internal sandbox error. Provider failure is operational only and must not become a customer risk signal.

## 10. Altered/AI Uncertainty Wording Checks

Phase 4.26 should require the phrase "altered-or-AI-generated-image uncertainty" where the 1-100 future direction is discussed.

The scan should require:

- Review signal only.
- Manual-review driver only.
- Not proof.
- Not a final decision.
- Not a fraud score.
- Low concern does not confirm authenticity.
- High concern does not confirm alteration, AI generation, fake evidence, forgery, fraud, or a claim outcome.

The scan should block:

- AI-generated confidence.
- Fake image score.
- Forgery score.
- Confirmed AI-generated.
- Confirmed altered.
- Manipulation proven.
- Customer accusation language.
- Automatic deny/refund recommendations.

## 11. Observation-Vs-Signal Separation Checks

Phase 4.26 should require language that separates:

- Direct observations.
- Inferred uncertainty signals.
- Confidence notes.
- Limitations.
- Manual-review drivers.
- Safe support summaries.

The scan should block direct observations that become conclusions, manual-review drivers that become dispositions, unsupported evidence that becomes customer suspicion, or operational failures that become evidence risk.

## 12. Unsupported/Failure Shape Planning Checks

Phase 4.26 should require unsupported and failure planning language for:

- Unsupported evidence.
- Refusal.
- Provider timeout.
- Provider unavailable.
- Provider rate-limited.
- Cost-limit reached.
- Malformed provider response.
- Schema validation failed.
- Internal sandbox error.

Each failure/unsupported state should require limitation/safe-summary framing and should block altered/AI uncertainty values unless explicitly applicable and safely framed.

## 13. Fixture Metadata Policy Checks

Phase 4.26 should enforce the Phase 4.24 future metadata policy when metadata appears:

- Required identity fields are present.
- Enum values are allowlisted.
- `fixtureKey` is stable, non-identifying, and package-safe.
- Synthetic status is explicit.
- Redaction status is explicit.
- Approval status is explicit.
- Package distribution status is explicit.
- Prompt/schema linkage is planning-only.
- Expected outputs are test expectations only.
- Disallowed output patterns are explicit.

Metadata validation should fail closed when required safety fields are absent.

## 14. Package/Distribution Safety Checks

Phase 4.26 should block package-facing artifacts or sample data that include:

- Real evidence.
- Private identifiers.
- Secrets.
- Real provider credentials.
- Provider payloads.
- Raw OCR.
- Object URLs.
- Storage handles.
- Public image URLs for evidence.
- Unsafe demo labels.
- Live-provider assumptions.

Commit-blocking checks should fail on unsafe repo contents. Package-blocking checks should additionally fail before any future archive, installer, self-hosted template, release bundle, or downloadable artifact is created.

## 15. Commit-Blocking Vs Package-Blocking Behavior

Commit-blocking failures:

- SDK/env/provider call additions.
- Protected route/runtime behavior changes.
- Real evidence or identifier content.
- Unsafe wording outside allowed safety-rule sections.
- Missing fixture metadata safety fields after metadata exists.
- Missing synthetic/package status after fixture metadata exists.
- Provider payload or raw OCR content.

Package-blocking failures:

- Any package artifact before approval.
- Any package artifact containing unsafe sample data.
- Any missing distribution status.
- Any fixture not marked synthetic or not approved for package/demo mode.
- Any live-provider assumption in package setup.

Phase 4.26 may implement commit-blocking scans first and document package-blocking behavior for future package creation if no package artifacts exist yet.

## 16. Expected Script Names And Semantic Checker Sections

Recommended Phase 4.26 implementation:

- Add `scripts/check-vision-sandbox-boundaries.mjs` as a local static validation script.
- Add `check:vision-sandbox-boundaries` to `package.json` without adding dependencies.
- Keep `scripts/check-report-semantics.mjs` as the semantic/source-of-truth coverage script.
- Keep `scripts/run-product-photo-probes.cjs` for existing imported probe modules.

Recommended static-check sections:

- File inventory.
- Package dependency guard.
- Provider SDK/env guard.
- Provider call guard.
- Upload/storage/object URL guard.
- Protected runtime/import guard.
- Route behavior marker guard.
- Fixture/metadata directory guard.
- Private identifier guard.
- Provider payload/raw OCR guard.
- Unsafe wording guard with allowed disallowed-wording sections.
- Altered/AI uncertainty wording guard.
- Observation-vs-signal guard.
- Package-safety guard.

The implementation should not add dependencies, runtime imports, provider SDK imports, network calls, route handlers, fixture images, or runtime schema/types.

## 17. Approval Gates Before Implementation

Phase 4.26 may begin only if:

- Phase 4.25 is committed and pushed.
- The repo is clean and synced.
- Required checks pass.
- Robert's current package request remains the approval for validation/probe implementation only.
- The implementation stays local static scanning only.
- No SDK/env/provider/upload/storage/runtime/schema/fixture/image/route/UI/receipt behavior work is added.
- No real evidence is introduced.
- No package artifacts are introduced.

Stop before implementation if the intended checks require provider packages, network calls, route execution, fixture creation, runtime schema/types, or real evidence samples.

## 18. Phase Gate Recommendation

Recommended Phase 4.26 task:

Implement local static validation probes only, preferably `scripts/check-vision-sandbox-boundaries.mjs` plus an npm script, covering no SDK/env/provider calls, no uploads/storage/object URLs, protected runtime/route boundaries, privacy/identifier safety, provider payload/raw OCR blocks, unsafe wording, altered-or-AI-generated-image uncertainty framing, observation-vs-signal separation, fixture metadata policy, and package/distribution safety. Do not add dependencies, SDKs, env vars, provider calls, route changes, runtime schema/types, fixtures, images, UI, upload/storage/persistence, real evidence, package artifacts, receipt behavior changes, `analyzeEvidenceFile` changes, or `LocalAnalysisResult` changes.

## Specialist Review Findings

Product Strategy Agent: The plan protects Robert's future AI/photo intelligence direction while keeping altered-or-AI-generated-image uncertainty as a reviewer aid rather than a truth or disposition engine.

Architecture and Maintainability Agent: The highest-value Phase 4.26 implementation is a static boundary script plus npm entrypoint. It should stay separate from runtime code and should not import sandbox plans into analyzer, route, report, or UI surfaces.

Receipt Intelligence Agent: Receipt behavior remains protected. The implementation plan explicitly preserves the existing OCR route, receipt parser, scoring, report mapping, `analyzeEvidenceFile`, and `LocalAnalysisResult`.

Integration Readiness Agent: No provider SDK/env/call work is allowed. Static checks should detect integration surfaces while avoiding provider packages, network calls, or credential references.

Scoring and Safety Reviewer Agent: Unsafe proof, fraud, fake/forged, automatic disposition, and customer-blame wording should be blocked outside disallowed-wording safety sections.

Privacy and Evidence Safety Agent: Real evidence, identifiers, provider payloads, raw OCR, public URLs, object URLs, storage handles, EXIF/location metadata, and package-unsafe sample data remain blocked by default.

QA Harness Agent: Phase 4.26 should implement fail-closed local scans and document any deferred checks rather than broadening into runtime testing or provider execution.

Deployment and Release Agent: Package creation remains blocked. Package-safety checks can be defined now, but no archive, installer, release bundle, deployment, or package artifact should be created.

## Stop Conditions

Stop and do not commit/push if:

- Any validation/probe implementation is added in Phase 4.25 beyond narrow semantic checker/source-of-truth coverage.
- Any SDK, provider SDK, provider call, provider endpoint execution, provider client, or provider credential environment variable is added.
- Any route behavior changes.
- Any upload, multipart parsing, binary parsing, storage, persistence, object URL, public image URL ingestion, or file URL handling is added.
- Any runtime schema/type is added.
- Any fixture metadata file, fixture file, or fixture image is added.
- Any real evidence, anonymized/redacted real fixture, provider payload, raw OCR dump, identifier, package artifact, UI wiring, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `analyzeEvidenceFile` change, `LocalAnalysisResult` change, receipt parser/scoring/report behavior change, or deployment is added.

## Closeout Criteria

Phase 4.25 is ready to close when:

- This implementation plan exists.
- Source-of-truth docs reflect Phase 4.25 planning-only status.
- Semantic coverage includes Phase 4.25 implementation-plan safety wording.
- No new validation/probe implementation was added.
- No fixture metadata/files/images were added.
- No SDK/env/provider/upload/storage/runtime/schema/route/UI/receipt behavior/package artifact changes were added.
- The next recommended task is Phase 4.26 local static validation/probe implementation only.
