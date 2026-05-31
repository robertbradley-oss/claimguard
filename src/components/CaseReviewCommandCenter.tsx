"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  History,
  MessageSquareText,
  NotebookText,
  PanelLeft,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { phase32MockCase, type CaseAttentionLevel, type CaseEvidenceItem } from "@/lib/case-command-center/mock-case";

const attentionTone: Record<CaseAttentionLevel, string> = {
  "Low attention": "border-[rgba(95,143,100,0.34)] bg-[rgba(95,143,100,0.10)] text-[var(--cg-green)]",
  "Review signals": "border-[rgba(184,133,24,0.34)] bg-[rgba(184,133,24,0.10)] text-[var(--cg-amber)]",
  "Manual review recommended": "border-[rgba(154,87,52,0.36)] bg-[rgba(154,87,52,0.10)] text-[var(--cg-copper)]",
};

const darkAttentionTone: Record<CaseAttentionLevel, string> = {
  "Low attention": "border-[rgba(95,143,100,0.42)] bg-[rgba(95,143,100,0.12)] text-[#d9f0d8]",
  "Review signals": "border-[rgba(184,133,24,0.44)] bg-[rgba(184,133,24,0.14)] text-[#f5d796]",
  "Manual review recommended": "border-[rgba(251,191,36,0.42)] bg-[rgba(251,191,36,0.14)] text-[#ffe0a8]",
};

const evidenceIcon: Record<CaseEvidenceItem["type"], LucideIcon> = {
  Receipt: FileSearch,
  "Order screenshot": ScanLine,
  "Shipping confirmation": ClipboardList,
  "Customer message": MessageSquareText,
  "Product-photo-like unsupported": AlertTriangle,
};

const manualDecisionOptions = [
  "Pending reviewer action",
  "Needs more information",
  "Escalate for senior review",
  "Ready for support decision",
  "Resolved by reviewer",
] as const;

function StatusBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: "slate" | "bronze" | "green" | "amber" | "dark";
}) {
  const toneClass =
    tone === "bronze"
      ? "border-[rgba(184,133,24,0.38)] bg-[rgba(255,253,247,0.74)] text-[var(--cg-amber)]"
      : tone === "green"
        ? "border-[rgba(95,143,100,0.34)] bg-[rgba(95,143,100,0.10)] text-[var(--cg-green)]"
        : tone === "amber"
          ? "border-[rgba(154,87,52,0.34)] bg-[rgba(154,87,52,0.10)] text-[var(--cg-copper)]"
          : tone === "dark"
            ? "border-white/15 bg-white/[0.06] text-[var(--cg-dark-muted)]"
            : "border-[rgba(125,103,64,0.22)] bg-[rgba(255,253,247,0.72)] text-[var(--cg-text-muted)]";

  return <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${toneClass}`}>{label}</span>;
}

function SectionLabel({
  icon: Icon,
  label,
  tone = "light",
}: {
  icon: LucideIcon;
  label: string;
  tone?: "light" | "dark";
}) {
  const textClass = tone === "dark" ? "text-[var(--cg-dark-subtle)]" : "text-[var(--cg-text-muted)]";
  const iconClass = "text-[var(--cg-amber)]";

  return (
    <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${textClass}`}>
      <Icon className={`size-3.5 ${iconClass}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function EvidenceRow({
  item,
  active,
  onSelect,
}: {
  item: CaseEvidenceItem;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = evidenceIcon[item.type];

  return (
    <button
      className={`w-full rounded-md border px-3 py-3 text-left transition ${
        active
          ? "border-[rgba(184,133,24,0.66)] bg-[rgba(255,253,247,0.92)] shadow-[inset_3px_0_0_rgba(184,133,24,0.86),0_12px_28px_rgba(77,62,36,0.10)]"
          : "border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.58)] hover:border-[rgba(184,133,24,0.42)] hover:bg-[rgba(255,253,247,0.82)]"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-md border border-[rgba(125,103,64,0.20)] bg-[rgba(246,241,232,0.86)] text-[var(--cg-amber)]">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--cg-text-muted)]">{item.type}</span>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] ${attentionTone[item.attentionLevel]}`}>
              {item.attentionLevel}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--cg-text)]">{item.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--cg-text-muted)]">{item.safeSummary}</p>
          <p className="mt-2 text-xs font-medium text-[var(--cg-amber)]">{item.reviewState}</p>
        </div>
      </div>
    </button>
  );
}

function FieldTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.72)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--cg-text)]">{value}</p>
    </div>
  );
}

function SelectedEvidencePanel({ item }: { item: CaseEvidenceItem }) {
  return (
    <section className="cg-forensic-panel min-h-[560px] rounded-lg">
      <div className="border-b border-[rgba(125,103,64,0.16)] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel icon={FileSearch} label="Selected evidence bench" />
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-[var(--cg-text)]">{item.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cg-text-muted)]">{item.safeSummary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={item.type} tone="bronze" />
            <StatusBadge label={item.reviewState} tone={item.reviewState === "Unsupported manual review" ? "amber" : "slate"} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="space-y-4">
          <div className="cg-evidence-surface min-h-[330px] rounded-lg p-5">
            <div className="cg-scan-corners" aria-hidden="true" />
            <div className="flex min-h-[286px] flex-col justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-amber)]">Privacy-safe inspection shell</p>
                <p className="mt-3 text-sm leading-6 text-[var(--cg-text-muted)]">
                  Phase 3.3 renders structured local summaries only. No raw evidence preview, file bytes, object URL,
                  OCR text, metadata payload, provider response, storage handle, or integration handle is represented.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <FieldTile label="External Verification" value={item.externalVerification} />
                <FieldTile label="Verification Status" value={item.verificationStatus} />
                <FieldTile label="Manual Decision" value="Reviewer-entered only" />
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.68)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">
            <SectionLabel icon={CheckCircle2} label="Recommended reviewer action" />
            <p className="mt-3 text-sm leading-6 text-[var(--cg-text)]">{item.recommendedReviewerAction}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-[rgba(26,31,39,0.28)] bg-[var(--cg-bg-panel)] p-4 shadow-[0_18px_42px_rgba(77,62,36,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <SectionLabel icon={Activity} label="Review signals" tone="dark" />
            <ul className="mt-3 space-y-2">
              {item.signals.map((signal) => (
                <li key={signal} className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-sm leading-6 text-[var(--cg-dark-muted)]">
                  {signal}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.62)] p-4">
            <SectionLabel icon={AlertTriangle} label="Limitations" />
            <ul className="mt-3 space-y-2">
              {item.limitations.map((limitation) => (
                <li key={limitation} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                  {limitation}
                </li>
              ))}
            </ul>
          </section>

          {item.noLiveAnalysis ? (
            <section className="rounded-lg border border-[rgba(184,133,24,0.36)] bg-[rgba(184,133,24,0.10)] p-4">
              <SectionLabel icon={ShieldCheck} label="No-live markers" />
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--cg-text-muted)]">OCR invoked</dt>
                  <dd className="font-semibold text-[var(--cg-text)]">{item.noLiveAnalysis.ocrInvoked ? "Yes" : "No"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--cg-text-muted)]">Metadata invoked</dt>
                  <dd className="font-semibold text-[var(--cg-text)]">{item.noLiveAnalysis.metadataInvoked ? "Yes" : "No"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--cg-text-muted)]">Product-photo runtime live</dt>
                  <dd className="font-semibold text-[var(--cg-text)]">{item.noLiveAnalysis.productPhotoRuntimeLive ? "Yes" : "No"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--cg-text-muted)]">ProductPhotoReviewPanel routed</dt>
                  <dd className="font-semibold text-[var(--cg-text)]">{item.noLiveAnalysis.productPhotoReviewPanelRouted ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

export function CaseReviewCommandCenter() {
  const [selectedKey, setSelectedKey] = useState(phase32MockCase.evidenceItems[0]?.key ?? "");
  const [manualDecision, setManualDecision] = useState<(typeof manualDecisionOptions)[number]>("Pending reviewer action");
  const [internalNote, setInternalNote] = useState("");

  const selectedEvidence = useMemo(
    () => phase32MockCase.evidenceItems.find((item) => item.key === selectedKey) ?? phase32MockCase.evidenceItems[0],
    [selectedKey],
  );

  return (
    <main className="min-h-screen bg-[var(--cg-bg)] text-[var(--cg-text)]">
      <div className="mx-auto flex min-h-screen max-w-[1540px] flex-col gap-4 px-4 py-4 sm:px-6">
        <header className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] px-4 py-4 shadow-[0_18px_42px_rgba(77,62,36,0.08),inset_0_1px_0_rgba(255,255,255,0.72)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label="Phase 3.3 local shell polish" tone="bronze" />
                <StatusBadge label={phase32MockCase.workflowStatus} tone="amber" />
                <StatusBadge label="Mock/local data only" />
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal text-[var(--cg-text)] sm:text-3xl">Case Review Command Center</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--cg-text-muted)]">
                {phase32MockCase.caseRef}. {phase32MockCase.customerClaimSummary}
              </p>
            </div>
            <div className="grid min-w-[260px] gap-2 text-sm">
              <div className={`rounded-md border px-3 py-2 font-medium ${attentionTone[phase32MockCase.attentionLevel]}`}>
                {phase32MockCase.attentionLevel}
              </div>
              <div className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.66)] px-3 py-2 text-[var(--cg-text-muted)]">
                {phase32MockCase.privacyPosture}
              </div>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_390px]">
          <aside className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.58)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
            <SectionLabel icon={PanelLeft} label="Evidence bench" />
            <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">
              Synthetic case evidence only. Rows omit raw filenames, private identifiers, raw OCR, and metadata.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <FieldTile label="Items" value={String(phase32MockCase.evidenceItems.length)} />
              <FieldTile label="Selected" value="1" />
              <FieldTile label="Live data" value="No" />
            </div>
            <div className="mt-4 space-y-3">
              {phase32MockCase.evidenceItems.map((item) => (
                <EvidenceRow
                  active={item.key === selectedEvidence.key}
                  item={item}
                  key={item.key}
                  onSelect={() => setSelectedKey(item.key)}
                />
              ))}
            </div>
          </aside>

          <SelectedEvidencePanel item={selectedEvidence} />

          <aside className="space-y-4">
            <section className="rounded-lg border border-[rgba(26,31,39,0.28)] bg-[var(--cg-bg-panel)] p-4 shadow-[0_18px_42px_rgba(77,62,36,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionLabel icon={ClipboardList} label="Case review summary" tone="dark" />
                <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${darkAttentionTone[phase32MockCase.attentionLevel]}`}>
                  {phase32MockCase.attentionLevel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--cg-dark-muted)]">{phase32MockCase.reviewSummary.evidenceReviewed}</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-dark-subtle)]">Manual-review drivers</p>
                  <ul className="mt-2 space-y-2">
                    {phase32MockCase.reviewSummary.manualReviewDrivers.map((driver) => (
                      <li key={driver} className="text-sm leading-6 text-[var(--cg-dark-muted)]">
                        {driver}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-dark-subtle)]">Missing information</p>
                  <ul className="mt-2 space-y-2">
                    {phase32MockCase.reviewSummary.missingInformation.map((item) => (
                      <li key={item} className="text-sm leading-6 text-[var(--cg-dark-muted)]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 rounded-md border border-[rgba(95,143,100,0.30)] bg-[rgba(95,143,100,0.12)] p-3 text-sm leading-6 text-[#d9f0d8]">
                {phase32MockCase.reviewSummary.recommendedSupportAction}
              </p>
            </section>

            <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.68)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">
              <SectionLabel icon={NotebookText} label="Notes and manual decision" />
              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]" htmlFor="manual-decision">
                Reviewer-entered decision state
              </label>
              <select
                className="mt-2 w-full rounded-md border border-[rgba(125,103,64,0.24)] bg-[var(--cg-bg-paper)] px-3 py-2 text-sm text-[var(--cg-text)]"
                id="manual-decision"
                onChange={(event) => setManualDecision(event.target.value as (typeof manualDecisionOptions)[number])}
                value={manualDecision}
              >
                {manualDecisionOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]" htmlFor="internal-note">
                Internal note placeholder
              </label>
              <textarea
                className="mt-2 min-h-24 w-full resize-y rounded-md border border-[rgba(125,103,64,0.24)] bg-[var(--cg-bg-paper)] px-3 py-2 text-sm leading-6 text-[var(--cg-text)]"
                id="internal-note"
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Add local reviewer notes here. Do not paste raw evidence, private customer details, or raw OCR."
                value={internalNote}
              />
              <ul className="mt-3 space-y-2">
                {phase32MockCase.internalNotesPlaceholder.map((note) => (
                  <li key={note} className="text-xs leading-5 text-[var(--cg-text-muted)]">
                    {note}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-[rgba(95,143,100,0.30)] bg-[rgba(95,143,100,0.08)] p-4">
              <SectionLabel icon={MessageSquareText} label="Customer-safe wording" />
              <p className="mt-3 text-sm leading-6 text-[var(--cg-text)]">{phase32MockCase.customerSafeWordingDraft}</p>
              <p className="mt-3 text-xs leading-5 text-[var(--cg-text-muted)]">
                Customer-safe wording is separate from internal notes and does not state a final automated outcome.
              </p>
            </section>
          </aside>
        </div>

        <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.62)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionLabel icon={History} label="Timeline and audit history placeholder" />
            <StatusBadge label="Browser-local mock events" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {phase32MockCase.timeline.map((event) => (
              <article key={event.key} className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--cg-text)]">
                  <CheckCircle2 className="size-3.5 text-[var(--cg-green)]" aria-hidden="true" />
                  {event.label}
                </div>
                <p className="mt-2 text-xs text-[var(--cg-text-subtle)]">
                  {event.timestamp} / {event.actor}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">{event.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
