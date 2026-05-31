# ClaimGuard Design System

ClaimGuard should look like a fraud-risk evidence review command center for support and warranty teams. It should not look like a generic white-card SaaS template, a default shadcn demo, or a centered landing page.

## Design Principles

- Evidence first: every screen should communicate claim evidence, document review, and support decisioning.
- Evidence viewer first: uploaded receipts, screenshots, PDFs, and product photos should feel like inspected artifacts, not generic attachments.
- Keep the primary screen minimal: left navigation, calm case header, dominant central evidence viewer, compact right risk/signals stack, lower case context, and a small recent-case queue.
- Dark operational shell: use deep navy and charcoal as the base, with bright but controlled blue and verification green accents.
- Dense but readable: support reps should scan scores, tickets, evidence, review signals, and safe wording quickly.
- Professional, not cyberpunk: forensic textures, grid lines, receipt-paper surfaces, and scanline accents are acceptable when subtle.
- Support-safe: visual urgency can indicate review priority, but copy must never accuse a customer or confirm fraud.

## Tokens

### Background Colors

- `--cg-bg`: `#06101f` app background.
- `--cg-bg-deep`: `#020713` deepest shell/nav surfaces.
- `--cg-bg-panel`: `#0b1728` primary evidence panels.
- `--cg-bg-panel-2`: `#101f34` raised panels.
- `--cg-bg-paper`: `#f4f7f2` receipt/document preview surfaces.
- `--cg-bg-muted`: `#13243a` subdued controls and inactive states.

### Text Colors

- `--cg-text`: `#edf7ff` primary text on dark.
- `--cg-text-muted`: `#9fb4c8` secondary text.
- `--cg-text-soft`: `#c8d8e8` supporting text.
- `--cg-text-paper`: `#142133` text on document/receipt surfaces.

### Accent Colors

- `--cg-blue`: `#18b7ff` electric review blue.
- `--cg-cyan`: `#35d9ff` scanline cyan.
- `--cg-green`: `#4ade80` verification green.
- `--cg-amber`: `#fbbf24` manual-review amber.
- `--cg-red`: `#fb7185` high-priority review red.

### Border Styles

- `--cg-border`: `rgba(100, 169, 214, 0.28)` standard dark-surface border.
- `--cg-border-strong`: `rgba(53, 217, 255, 0.45)` active evidence border.
- `--cg-border-paper`: `rgba(20, 33, 51, 0.14)` document surface border.
- Use fine 1px borders, inset highlights, and left accent rails instead of thick generic card outlines.

### Shadows And Glows

- `--cg-shadow-panel`: `0 24px 80px rgba(0, 0, 0, 0.34)`.
- `--cg-shadow-blue`: `0 0 0 1px rgba(53, 217, 255, 0.2), 0 18px 48px rgba(24, 183, 255, 0.12)`.
- `--cg-shadow-green`: `0 0 0 1px rgba(74, 222, 128, 0.24), 0 18px 48px rgba(74, 222, 128, 0.1)`.
- Glows should be restrained and tied to active review states, not random decoration.

### Risk States

- Low: verification green, standard verification, fewer visible signals.
- Medium: electric blue/cyan, manual review recommended, inconclusive or mixed context.
- High: red plus amber, senior/manual review recommended, additional evidence needed.
- Risk language must remain careful: "risk signal," "manual review recommended," "inconclusive," and "needs proof-of-purchase verification."

### Card Styles

- `cg-forensic-panel`: dark evidence-review panel with scanline texture.
- `cg-command-panel`: raised dark command-center panel.
- `cg-ticket-paper`: off-white ticket/document surface that resembles receipt paper.
- `cg-scan-frame`: evidence-viewer surface with ruler ticks, scanline overlay, metadata, and document/photo inspection affordances.
- Panels should vary in width, rhythm, and emphasis. Avoid making every card the same size and shape.

### Badge Styles

- Badges are compact, security-style labels with uppercase or short title-case text.
- Use colored left dots, fine borders, and subtle glow for state.
- Avoid pill overload; badges should convey risk, status, evidence type, or queue priority.

### Typography Scale

- Page title: 30-40px, tight line-height, semibold.
- Section heading: 16-22px, semibold.
- Operational labels: 11-12px, uppercase, tracked.
- Body: 13-15px, readable line-height.
- Numeric score: large monospace or tabular-style display.

### Spacing

- App shell: 16-24px gutters.
- Panel padding: 16-28px depending on emphasis.
- Dense lists/tables: 10-14px vertical rhythm.
- Use asymmetric layouts where useful: sidebar plus main command grid, larger upload/report panels, smaller status/risk modules.

## Component Direction

- Dashboard layout: dark shell with subtle grid/scanline texture, investigation record header, dominant evidence viewer, case queue, and review report.
- Sidebar: compact grouped navigation for Investigation, Intelligence, Automation, and Settings.
- Upload panel: evidence workstation with scan-frame viewer, zoom controls, evidence ID, upload timestamp, file metadata, hash-style details, and local mock analysis action.
- Ticket preview: two compact lower panels for Case Context and Customer Message. These should support the evidence viewer, not compete with it.
- Risk score card: compact risk summary with score, risk level, recommendation, confidence, signal count, evidence quality, and one primary support action.
- Red flags list: "Detected signals" or "Review signals," not accusations; dense signal rows with severity, confidence, evidence source, and manual review recommendation.
- Recent cases table: small operational queue with case ID, customer, risk, status, and updated time. Avoid analytics-table density.
- Empty/loading/error states: dark forensic surfaces that explain the next safe action without sounding accusatory.

## Phase 3 Case Review Command Center Direction

Phase 3.1 is documented in `PHASE_3_1_CASE_WORKFLOW_DESIGN_CONCEPT.md`. This is product/design planning only and does not authorize implementation.

The future Case Review Command Center should extend the current evidence workspace into a multi-evidence case file:

- Keep the case header/status strip calm, dense, and operational.
- Make the selected evidence viewer the dominant center of the screen.
- Use an evidence list/sidebar for receipt evidence, order screenshots, shipping confirmations, customer context, and unsupported/product-photo-like evidence.
- Use a compact case-level action rail for review summary, recommended support action, notes/manual decision, and customer-safe wording.
- Put timeline/audit history in a lower band, drawer, or secondary section so it supports review without competing with selected evidence.
- Preserve dark forensic surfaces, scan-frame cues, fine borders, left rails, and restrained blue/green/amber/red state accents.
- Avoid generic SaaS stat cards, centered hero sections, default demo-card layouts, and repeated identical white panels.
- Keep manual-review-only and external-verification-not-performed states visible wherever unsupported or uncertain evidence appears.

Planned Phase 3 primitives include case status badges, evidence type badges, attention badges, manual-review indicators, dense evidence rows, selected evidence shells, review summary blocks, timeline event rows, customer-safe wording cards, and support-action recommendation panels. These primitives should be implemented only after Robert explicitly opens a Phase 3 implementation slice.
