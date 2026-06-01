# Phase 4.26 Sandbox Validation Probes

Date: 2026-06-01

Primary agent role: QA Harness Agent

Supporting reviews: Product Strategy, Architecture and Maintainability, Receipt Intelligence, Integration Readiness, Scoring and Safety, Privacy and Evidence Safety, Deployment and Release

## 1. Purpose And Scope

Phase 4.26 implements local static OpenAI Vision sandbox boundary validation only. The implementation adds a repo-local checker that scans source, package metadata, planning docs, and future sandbox metadata/fixture directories for boundary drift before live AI, provider SDKs, provider calls, uploads, storage, runtime schema/types, fixtures, route wiring, UI wiring, or real evidence handling are introduced.

Sandbox documentation and future artifacts must continue to separate observation, uncertainty signal, limitation, and manual-review guidance.

This milestone does not add OpenAI SDKs, provider SDKs, provider calls, provider credential environment variables, live OCR, multipart parsing, binary upload parsing, storage, persistence, route behavior changes, runtime schema/types, fixture metadata files, fixture image/files, UI, package artifacts, real evidence, anonymized/redacted real evidence, deployment, live AI/Vision/photo analysis, `ClaimReviewWorkflow` wiring, `ProductPhotoReviewPanel` routing, `analyzeEvidenceFile` changes, `LocalAnalysisResult` changes, or receipt parser/scoring/report behavior changes.

## 2. Implemented Files

Implemented:

- `scripts/check-vision-sandbox-boundaries.mjs`
- `package.json` script `check:vision-sandbox-boundaries`

Updated source-of-truth/semantic coverage:

- `scripts/check-report-semantics.mjs`
- `ROADMAP.md`
- `NEXT_STEPS.md`
- `REPO_SOURCE_OF_TRUTH.md`
- `AGENTS.md`
- `AGENT_LOG.md`

## 3. Implemented Static Check Categories

The Phase 4.26 checker includes these local-only checks:

- Package dependency guard for OpenAI/provider SDK packages.
- Package lock guard for provider dependency entries.
- Provider SDK import guard across source and scripts.
- Provider credential environment variable guard across source and scripts.
- Provider endpoint/call guard outside the checker scripts themselves.
- Protected runtime diff guard for source files, protected routes, protected components, and `package-lock.json`.
- Allowed changed-file guard for this gated package.
- Sandbox runtime wiring guard against Phase 4.24 through Phase 4.29 sandbox concepts entering protected runtime files.
- OCR route marker guard confirming exact synthetic `fixtureKey` route boundary markers remain present.
- Mock-provider route marker guard confirming synthetic/mock-only route markers remain present.
- Private identifier guard for sandbox docs and future sandbox fixture/metadata directories.
- Provider payload/raw OCR guard for future sandbox artifact directories.
- Public URL/object URL/storage-handle guard for future sandbox artifact directories.
- Fixture metadata policy guard for future metadata JSON/markdown files.
- Altered-or-AI-generated-image uncertainty wording guard across sandbox docs.
- Unsafe outcome wording guard for future sandbox artifact directories.
- Observation-vs-signal separation signal checks across sandbox docs.
- Package artifact path guard.
- Phase 4.25 package-safety and commit/package blocking signal checks.

## 4. Intentional False-Positive Controls

The checker distinguishes safety-rule documentation from executable or artifact content:

- Provider call and endpoint regex definitions are allowed inside checker scripts.
- Blocked terms in Phase 4.19 through Phase 4.25 planning docs are treated as safety-rule content when they appear in stop-condition, disallowed-wording, blocked-pattern, or package-safety sections.
- Hard provider payload/raw OCR, public URL/object URL/storage-handle, and unsafe outcome wording scans apply to future sandbox artifact directories, not to historical planning docs that are explicitly documenting disallowed wording.
- Existing `tesseract.js` and `exifr` dependencies are not treated as new OpenAI/provider SDK additions for this package.
- Existing receipt upload UI remains unchanged and is not treated as sandbox upload implementation.

## 5. Commit-Blocking Behavior

The checker is commit-blocking for this gated package when it finds:

- Provider SDK dependencies or lockfile entries.
- Provider SDK imports.
- Provider credential environment variable reads.
- Provider endpoint/call implementation outside checker scripts.
- Protected runtime/source/route/component/package-lock diffs.
- Sandbox concepts wired into protected runtime files.
- Existing OCR route marker drift.
- Existing mock-provider route marker drift.
- Private identifier patterns in sandbox docs or future sandbox artifact directories.
- Provider payload/raw OCR material in future sandbox artifact directories.
- Public URL, object URL, data URL, file URL, or storage-handle material in future sandbox artifact directories.
- Missing required fixture metadata safety fields after metadata exists.
- Unsafe outcome wording in future sandbox artifact directories.
- Package artifact paths before approval.

## 6. Package-Blocking Behavior

The checker blocks package creation indirectly by failing if package artifact paths appear before approval. Future package creation should also run this script before any archive, installer, release bundle, self-hosted template, or downloadable package is created.

Package-safe sandbox content must remain synthetic, non-identifying, approved for distribution when shipped, free of provider payloads and raw OCR, free of public/object URL evidence references, and free of live-provider assumptions.

## 7. Deferred Checks

The following checks are intentionally deferred until matching artifacts exist:

- Strict enum validation for Phase 4.27 metadata values.
- Fixture binary/EXIF inspection for Phase 4.29 image assets.
- Per-fixture metadata-to-asset matching.
- Fixture dimensions, file-size budgets, and image-origin/license checks.
- Package archive contents inspection.
- Runtime schema/output validation, because runtime schema/types remain blocked.

The Phase 4.26 checker is designed so Phase 4.27 metadata and Phase 4.29 fixture work can add narrower validation without changing live runtime.

## 8. Relationship To Existing Routes And Runtime

Existing `POST /api/analysis/ocr` remains exact `fixtureKey` JSON-only synthetic fixture route behavior.

Existing `POST /api/analysis/mock-provider` remains synthetic/mock-only and adapter-only.

The mock provider adapter remains the test boundary.

`analyzeEvidenceFile` remains unchanged.

`LocalAnalysisResult` remains unchanged.

Receipt parser/scoring/report behavior remains unchanged.

`ClaimReviewWorkflow` remains unchanged.

`ProductPhotoReviewPanel` remains unrouted.

The new checker is a local script only and is not imported by runtime code, routes, analyzers, report adapters, components, or upload paths.

## 9. Specialist Review Findings

Product Strategy Agent: The checker protects the future 1-100 altered-or-AI-generated-image uncertainty direction by requiring review-signal and not-proof framing before fixture or provider work.

Architecture and Maintainability Agent: The checker is isolated under `scripts/`, uses only Node built-ins, and does not introduce dependencies, runtime imports, route handlers, schema/types, or app wiring.

Receipt Intelligence Agent: Receipt behavior remains protected by route marker checks and protected runtime diff checks.

Integration Readiness Agent: Provider SDK/env/call checks are in place without provider imports, provider clients, network calls, secrets, or endpoint execution.

Scoring and Safety Reviewer Agent: Unsafe outcome wording is blocked for future artifact directories, while planning docs may still document disallowed examples.

Privacy and Evidence Safety Agent: Future metadata/fixture directories are guarded for identifiers, provider payloads, raw OCR, public URLs, object URLs, data URLs, file URLs, and storage handles.

Deployment and Release Agent: Package artifacts remain blocked before approval. No deployment or package creation occurred.

## 10. Phase Gate Recommendation

Recommended Phase 4.27 task:

Implement synthetic fixture metadata only, with no image/evidence files, no runtime schema/types, no route changes, no provider SDK/env/calls, no uploads/storage/persistence, no real evidence, no package artifacts, no UI, no receipt behavior changes, no `analyzeEvidenceFile` changes, and no `LocalAnalysisResult` changes. Run `check:vision-sandbox-boundaries` alongside the existing gates after metadata is added.
