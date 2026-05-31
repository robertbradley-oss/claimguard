# Phase 3.1 Case Workflow Design Concept

This is a planning/design-only Phase 3.1 checkpoint. It does not implement Phase 3 code, add routes, add components, edit `ClaimReviewWorkflow`, wire unsupported-evidence runtime, add live unsupported-evidence UI, route `ProductPhotoReviewPanel`, change receipt behavior, add database/storage/auth/orgs/billing, add providers/integrations, expand OCR/metadata/image analysis, commit, push, or deploy.

Current pushed checkpoint: `ba06d6b` (`docs: plan phase 3 case workflow readiness`). Phase 3.0 is complete and pushed. Phase 3 implementation has not started. Receipt behavior remains unchanged. Unsupported/product-photo runtime remains non-live and blocked.

## Phase 3.1 Decision

The future Case Review Command Center should be an evidence-review operations surface, not a generic SaaS dashboard and not a marketing-style page.

The safest first implementation after Phase 3.1 is Phase 3.2: a non-persistent local case shell with mock/local case data only, receipt behavior protected, no live unsupported-evidence runtime, no product-photo analysis, no persistence, and no integrations.

Phase 3.1 should be accepted before any implementation work begins.

## Visual Direction

The Case Review Command Center should extend ClaimGuard's current dark forensic workspace into a multi-evidence case review product.

Design posture:

- Dark forensic dashboard with deep navy and charcoal operational surfaces.
- Enterprise evidence-review feel, built for repeated support-review work.
- Fraud-risk intelligence posture that emphasizes trust, verification limits, manual review, and auditability.
- Serious enterprise tone: calm, dense, precise, and support-safe.
- Evidence viewer first: the selected evidence item should be the dominant visual anchor.
- Signals and recommendations should read as review aids, not automated outcomes.

Avoid:

- Generic SaaS dashboard patterns with interchangeable stat cards.
- Centered hero sections or landing-page composition.
- Default demo-card layouts.
- Identical white-card panels.
- Decorative gradients, bokeh/orb backgrounds, or playful visual language.
- Result cards that compete equally instead of creating a clear review hierarchy.

The interface should feel like a case file, evidence bench, and reviewer command surface in one workspace.

## Layout Concept

Recommended desktop layout:

```text
Case header/status strip
Evidence list/sidebar | Selected evidence viewer | Case review/action rail
Timeline/history band or lower drawer
```

Recommended mobile layout:

```text
Case header/status strip
Segmented sections: Evidence | Summary | Notes | Wording | History
Selected evidence appears first inside Evidence
```

Primary regions:

- Case header/status strip: case id, workflow status, review priority, privacy posture, external-verification status, and next recommended support action.
- Evidence list/sidebar: compact evidence rows grouped by type and review state.
- Selected evidence viewer: dominant evidence inspection shell for the active item.
- Evidence signal summary: evidence-level review signals, limitations, confidence, and manual-review indicators.
- Case-level review summary: synthesis across all evidence items, missing information, and support-relevant uncertainty.
- Notes/manual decision area: internal reviewer notes, escalation reason, and human-entered decision state.
- Customer-safe wording area: separate editable response copy for customer communication.
- Timeline/audit history area: review events, state changes, copied wording events, manual decision updates, and evidence-review milestones.
- Recommended support action area: primary next step for the support rep, separate from final policy disposition.

## Screen Hierarchy

First viewport priorities:

1. Case identity and current workflow status.
2. Selected evidence item and its review state.
3. Case-level recommendation and customer-safe wording availability.
4. Evidence list and evidence count by state.
5. Notes, manual decision, and timeline access.

The command center should not open on analytics. It should open on the active case and selected evidence.

## Planned Design-System Primitives

These are planned primitives only. Do not create them in code during Phase 3.1.

### Case Status Badges

Purpose:

- Show workflow state, not evidence truth.

Planned labels:

- `New`
- `Evidence review`
- `Needs more information`
- `Manual review`
- `Ready for support decision`
- `Escalated`
- `Resolved`

Rules:

- Use compact security-style badges with a small status dot or left rail.
- Use amber for manual review and red only for attention/escalation, not for accusation.
- Do not use labels that imply final automated disposition.

### Evidence Type Badges

Purpose:

- Distinguish evidence categories quickly without implying whether evidence is reliable.

Planned labels:

- `Receipt`
- `Order screenshot`
- `Shipping confirmation`
- `Customer message`
- `Product-photo-like unsupported`
- `Unsupported evidence`

Rules:

- Use neutral nouns.
- Use product-photo-like only for lightweight routing/context, not analysis.
- Unsupported evidence remains manual-review-only.

### Risk / Attention Badges

Purpose:

- Surface review priority and uncertainty.

Planned labels:

- `Low attention`
- `Review signals`
- `Manual review recommended`
- `Needs clearer copy`
- `Additional information needed`
- `Escalation review`

Rules:

- Prefer "attention" and "review priority" over definitive risk conclusions.
- Color cannot be the only signal; every badge needs readable text.
- Do not use approval, rejection, denial, or wrongdoing language.

### Manual Review Indicators

Purpose:

- Make manual-review-only states unmistakable.

Planned elements:

- Manual review rail.
- "External Verification: Not performed" line.
- "Verification Status: Not externally verified" line.
- "No automated analysis result for this evidence item" line for unsupported/stopped evidence.
- Limitation list with no OCR/no metadata/no product-photo analysis when applicable.

Rules:

- Manual-review indicators must stay visible in unsupported states.
- They should appear near the evidence state and again in the case summary when unsupported evidence affects the case.

### Evidence Cards / List Rows

Purpose:

- Let reps move between evidence items quickly.

Planned row content:

- Evidence type badge.
- Short title.
- Review state.
- One-line safe summary.
- Last reviewed marker.
- Limitation count or attention badge.

Rules:

- Do not show raw filenames, raw OCR, customer identifiers, order identifiers, or private metadata in list rows.
- Active row should use a strong left rail and subtle glow, not a large card expansion.
- Rows should be dense enough for multi-evidence cases.

### Selected Evidence Shell

Purpose:

- Provide the central evidence inspection surface.

Planned sections:

- Evidence type and review state header.
- Preview/inspection area only when a future approved implementation safely owns preview handling.
- Review findings or stopped-state explanation.
- Limitations.
- Evidence-level recommended next action.
- Privacy posture.

Rules:

- Receipt evidence can summarize existing receipt analysis after the existing analyzer runs.
- Unsupported/product-photo-like evidence should show a stopped/manual-review state only after separately approved implementation.
- Product-photo analysis and `ProductPhotoReviewPanel` routing remain blocked.

### Review Summary Blocks

Purpose:

- Summarize case-level review posture.

Planned blocks:

- Evidence reviewed.
- Missing information.
- Manual-review drivers.
- Recommended support action.
- Customer-safe wording status.

Rules:

- Summary blocks should not become generic metric cards.
- They should explain what a reviewer needs to do next.

### Timeline Event Rows

Purpose:

- Make review history auditable.

Planned event types:

- Case opened.
- Evidence added.
- Receipt analysis completed.
- Unsupported evidence stopped.
- Note added.
- Manual decision updated.
- Customer-safe wording copied.
- Case status changed.
- Escalation added.

Rules:

- Timeline events should use privacy-safe summaries.
- Do not include raw evidence details, raw OCR, identifiers, filenames, provider payloads, or private customer content.
- Event copy should describe reviewer action, not customer intent.

### Customer-Safe Wording Cards

Purpose:

- Keep external communication separate from internal review notes.

Planned content:

- Draft customer-safe wording.
- Copy button.
- Last copied marker.
- Safety note that wording is review-support copy, not an automated final decision.

Rules:

- Customer-safe wording must avoid accusation, proof claims, final automated decisions, and external-verification claims.
- The card should never display internal notes by default.

### Action Recommendation Panels

Purpose:

- Give the support rep one clear next step.

Planned actions:

- Request eligible receipt.
- Request clearer copy.
- Continue manual review.
- Escalate to senior review.
- Mark ready for support decision.
- Draft customer-safe response.

Rules:

- Recommendations are support actions, not claim decisions.
- Do not use automatic denial or automatic refund language.

## Interaction Model

### Evidence Selection

- Clicking an evidence row selects it and updates the selected evidence viewer.
- The case-level summary remains visible while evidence changes.
- Unsupported evidence should remain visibly manual-review-only when selected.
- Switching evidence should not reset notes or manual decision state.

### Case Status Changes

- Status changes should be explicit reviewer actions.
- Status labels describe workflow position only.
- Changing status should add a timeline event.
- Status changes should not alter analyzer output.

### Adding Review Notes

- Notes are internal-only by default.
- Notes should support short operational observations, not raw evidence dumps.
- Notes should not be copied into customer-safe wording automatically.
- Adding a note should add a timeline event with a privacy-safe summary.

### Setting Manual Decision

- Manual decision should be reviewer-entered and clearly separate from AI-assisted signals.
- Allowed planning labels should be workflow-safe, such as `Pending`, `Needs more information`, `Escalate`, `Ready for support decision`, or `Resolved by reviewer`.
- Manual decision should not be presented as ClaimGuard's automated decision.

### Copying Customer-Safe Wording

- Copying customer-safe wording should be an explicit action.
- The UI should confirm copy success and record a timeline event.
- Copied wording should omit internal notes and private evidence details.
- The wording card should remain editable in future implementation, but edits require privacy/safety checks before any export surface is approved.

### Reviewing Timeline / History

- Timeline should be scannable and chronological.
- Each event should show event type, generic timestamp label, actor placeholder for local mock state, and privacy-safe detail.
- Early Phase 3 should use local mock timestamps only.
- No database-backed audit trail should be implied until persistence is approved.

### Switching Between Evidence Items

- Evidence items should preserve their selected/review state locally.
- Receipt evidence, unsupported evidence, screenshots, shipping confirmations, and customer context should use distinct display treatments.
- The selected evidence viewer should never route unsupported evidence into receipt report UI.

### Unsupported / Manual-Review-Only Evidence

- Unsupported evidence remains a stopped/manual-review state.
- It should not show receipt score, proof-of-purchase status, product-photo report, or `ProductPhotoReviewPanel`.
- It should show what did not run: OCR, metadata, receipt score, product-photo analysis, external verification, providers, storage, integrations.
- It should recommend manual review or requesting eligible evidence.

## Safety And Wording Rules

Global rules:

- Never accuse customers.
- Never say wrongdoing is confirmed.
- Never use definitive authenticity labels for an image, receipt, or document.
- Use neutral review language.
- Treat unsupported evidence as manual-review-only.
- Keep customer-safe wording separate from internal notes.
- Keep manual decisions distinct from AI-assisted signals.
- Keep external verification as "Not performed" unless a real approved integration performs it.
- Keep verification status as "Not externally verified" unless an approved integration changes that status.

Preferred wording:

- `Manual review recommended`
- `Review signal`
- `Needs clearer evidence`
- `Additional information may be needed`
- `External Verification: Not performed`
- `Verification Status: Not externally verified`
- `No automated analysis result was produced for this evidence item`
- `Use support policy and available evidence`

Avoid:

- Customer accusation language.
- Proof or certainty claims.
- Final automated claim disposition.
- Automatic approve/reject/deny/refund language.
- Wording that implies product-photo analysis, OCR, metadata review, provider review, or external verification happened when it did not.

## Technical Boundaries

Phase 3.1 remains planning-only.

Do not add:

- Runtime implementation.
- Routes.
- Components.
- `ClaimReviewWorkflow` edits.
- Database persistence.
- `LocalAnalysisResult` migration.
- Receipt analyzer changes.
- Unsupported-evidence runtime wiring.
- Live unsupported-evidence UI.
- ProductPhotoReviewPanel routing.
- Provider integrations.
- AI vision expansion.
- OCR/metadata expansion.
- Auth, org, billing, or platform work.
- Deployment.

Future implementation should keep any case-shell state local and synthetic until Robert explicitly approves persistence, integrations, or production workflow changes.

## Recommended Phase 3.2 First-Build Target

Phase 3.2 should implement the narrowest non-persistent local case shell only after Robert explicitly approves implementation.

Recommended target:

- A local Case Review Command Center shell.
- Mock/local case data only.
- Case header/status strip.
- Evidence list/sidebar.
- Selected evidence viewer shell.
- Case-level review summary.
- Notes/manual decision area.
- Customer-safe wording area.
- Timeline/history area.
- Recommended support action panel.

Required protections:

- Preserve `analyzeEvidenceFile`.
- Preserve `LocalAnalysisResult`.
- Preserve receipt upload/analyze/report behavior.
- Keep unsupported/product-photo runtime non-live.
- Do not route `ProductPhotoReviewPanel`.
- Do not add database, storage, auth, orgs, billing, providers, integrations, OCR/metadata expansion, or deployment config.
- Use synthetic/local mock case data only.
- Add semantic/privacy checks for new wording/export/copy/timeline surfaces.
- Run lint, build, report semantics, product-photo probes, diff check, protected scans, and browser checks.

Phase 3.2 should prove the workspace shape before introducing live multi-evidence runtime behavior.

## Future Phase 3.2 Eligible Files

Only after Robert explicitly opens Phase 3.2 implementation, likely eligible files could include:

- A new case shell component under `src/components/`.
- A route or page only if Robert explicitly approves where the case shell should live.
- A local mock-case data file, if needed, with synthetic data only.
- `scripts/check-report-semantics.mjs` only for new wording/privacy/import guards.
- Source-of-truth docs for status updates.

Protected unless separately approved:

- `src/components/ClaimReviewWorkflow.tsx`.
- `src/lib/analysis/analyzer.ts`.
- `src/lib/analysis/types.ts`.
- `src/lib/analysis/report-adapter.ts`.
- `src/components/ProductPhotoReviewPanel.tsx`.
- Upload flow.
- Parser, scoring, fixtures, OCR/metadata, providers, storage, integrations, package/deploy config, and live navigation.

## Phase 3.1 Closeout Criteria

Phase 3.1 is ready to close when:

- This design concept exists.
- Source-of-truth docs point to Phase 3.2 as the next implementation candidate only with explicit approval.
- `DESIGN.md` includes the Case Review Command Center direction.
- No runtime/UI/code/route/component files changed.
- Docs-safe checks pass.
