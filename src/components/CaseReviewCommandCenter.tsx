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
  "Low attention": "border-[rgba(74,222,128,0.32)] bg-[rgba(74,222,128,0.08)] text-[var(--cg-green)]",
  "Review signals": "border-[rgba(24,183,255,0.34)] bg-[rgba(24,183,255,0.08)] text-[var(--cg-cyan)]",
  "Manual review recommended": "border-[rgba(251,191,36,0.36)] bg-[rgba(251,191,36,0.10)] text-[var(--cg-amber)]",
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

function SecurityBadge({ label, tone = "slate" }: { label: string; tone?: "slate" | "cyan" | "green" | "amber" }) {
  const toneClass =
    tone === "cyan"
      ? "border-[rgba(24,183,255,0.32)] bg-[rgba(24,183,255,0.08)] text-[var(--cg-cyan)]"
      : tone === "green"
        ? "border-[rgba(74,222,128,0.32)] bg-[rgba(74,222,128,0.08)] text-[var(--cg-green)]"
        : tone === "amber"
          ? "border-[rgba(251,191,36,0.34)] bg-[rgba(251,191,36,0.10)] text-[var(--cg-amber)]"
          : "border-white/12 bg-white/[0.045] text-[var(--cg-text-soft)]";

  return <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${toneClass}`}>{label}</span>;
}

function SectionLabel({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">
      <Icon className="size-3.5 text-[var(--cg-cyan)]" aria-hidden="true" />
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
      className={`w-full border px-3 py-3 text-left transition ${
        active
          ? "border-[rgba(53,217,255,0.48)] bg-[rgba(24,183,255,0.10)] shadow-[inset_3px_0_0_rgba(53,217,255,0.85)]"
          : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.055]"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center border border-white/10 bg-[#071426] text-[var(--cg-cyan)]">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-white">{item.type}</span>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] ${attentionTone[item.attentionLevel]}`}>
              {item.attentionLevel}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--cg-text-soft)]">{item.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--cg-text-muted)]">{item.safeSummary}</p>
        </div>
      </div>
    </button>
  );
}

function SelectedEvidencePanel({ item }: { item: CaseEvidenceItem }) {
  return (
    <section className="min-h-[520px] border border-[rgba(53,217,255,0.22)] bg-[#071426] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionLabel icon={FileSearch} label="Selected evidence" />
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-white">{item.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cg-text-soft)]">{item.safeSummary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecurityBadge label={item.type} tone="cyan" />
            <SecurityBadge label={item.reviewState} tone={item.reviewState === "Unsupported manual review" ? "amber" : "slate"} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <div className="relative min-h-[320px] overflow-hidden border border-white/10 bg-[#020814] p-5">
          <div className="absolute inset-0 opacity-35 [background:linear-gradient(rgba(53,217,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(53,217,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-cyan)]">Evidence inspection shell</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--cg-text-soft)]">
                Phase 3.2 renders privacy-safe local summaries only. No raw evidence preview, file bytes, object URL,
                OCR text, metadata payload, provider response, storage handle, or integration handle is represented.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--cg-text-muted)]">External Verification</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.externalVerification}</p>
              </div>
              <div className="border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--cg-text-muted)]">Verification Status</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.verificationStatus}</p>
              </div>
              <div className="border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--cg-text-muted)]">Manual Decision</p>
                <p className="mt-1 text-sm font-semibold text-white">Reviewer-entered only</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="border border-white/10 bg-white/[0.035] p-4">
            <SectionLabel icon={Activity} label="Review signals" />
            <ul className="mt-3 space-y-2">
              {item.signals.map((signal) => (
                <li key={signal} className="border border-white/10 bg-[#06111f] px-3 py-2 text-sm leading-6 text-[var(--cg-text-soft)]">
                  {signal}
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-white/10 bg-white/[0.035] p-4">
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
            <section className="border border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.08)] p-4">
              <SectionLabel icon={ShieldCheck} label="No-live markers" />
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--cg-text-muted)]">OCR invoked</dt>
                  <dd className="font-semibold text-white">{item.noLiveAnalysis.ocrInvoked ? "Yes" : "No"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--cg-text-muted)]">Metadata invoked</dt>
                  <dd className="font-semibold text-white">{item.noLiveAnalysis.metadataInvoked ? "Yes" : "No"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--cg-text-muted)]">Product-photo runtime live</dt>
                  <dd className="font-semibold text-white">{item.noLiveAnalysis.productPhotoRuntimeLive ? "Yes" : "No"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--cg-text-muted)]">ProductPhotoReviewPanel routed</dt>
                  <dd className="font-semibold text-white">{item.noLiveAnalysis.productPhotoReviewPanelRouted ? "Yes" : "No"}</dd>
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
    <main className="min-h-screen bg-[#020814] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1540px] flex-col gap-4 px-4 py-4 sm:px-6">
        <header className="border border-white/10 bg-[#06111f] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.26)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <SecurityBadge label="Phase 3.2 local shell" tone="cyan" />
                <SecurityBadge label={phase32MockCase.workflowStatus} tone="amber" />
                <SecurityBadge label="Mock/local data only" />
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal text-white sm:text-3xl">Case Review Command Center</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--cg-text-soft)]">
                {phase32MockCase.caseRef}. {phase32MockCase.customerClaimSummary}
              </p>
            </div>
            <div className="grid min-w-[250px] gap-2 text-sm">
              <div className={`border px-3 py-2 ${attentionTone[phase32MockCase.attentionLevel]}`}>
                {phase32MockCase.attentionLevel}
              </div>
              <div className="border border-white/10 bg-white/[0.035] px-3 py-2 text-[var(--cg-text-soft)]">
                {phase32MockCase.privacyPosture}
              </div>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-4 xl:grid-cols-[310px_minmax(0,1fr)_390px]">
          <aside className="border border-white/10 bg-[#06111f] p-4">
            <SectionLabel icon={PanelLeft} label="Evidence list" />
            <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">
              Synthetic case evidence only. Rows omit raw filenames, private identifiers, raw OCR, and metadata.
            </p>
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
            <section className="border border-white/10 bg-[#06111f] p-4">
              <SectionLabel icon={ClipboardList} label="Case review summary" />
              <p className="mt-3 text-sm leading-6 text-[var(--cg-text-soft)]">{phase32MockCase.reviewSummary.evidenceReviewed}</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">Manual-review drivers</p>
                  <ul className="mt-2 space-y-2">
                    {phase32MockCase.reviewSummary.manualReviewDrivers.map((driver) => (
                      <li key={driver} className="text-sm leading-6 text-[var(--cg-text-soft)]">
                        {driver}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">Missing information</p>
                  <ul className="mt-2 space-y-2">
                    {phase32MockCase.reviewSummary.missingInformation.map((item) => (
                      <li key={item} className="text-sm leading-6 text-[var(--cg-text-soft)]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 border border-[rgba(74,222,128,0.24)] bg-[rgba(74,222,128,0.08)] p-3 text-sm leading-6 text-[var(--cg-text-soft)]">
                {phase32MockCase.reviewSummary.recommendedSupportAction}
              </p>
            </section>

            <section className="border border-white/10 bg-[#06111f] p-4">
              <SectionLabel icon={NotebookText} label="Notes and manual decision" />
              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]" htmlFor="manual-decision">
                Reviewer-entered decision state
              </label>
              <select
                className="mt-2 w-full border border-white/10 bg-[#020814] px-3 py-2 text-sm text-white"
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
                className="mt-2 min-h-24 w-full resize-y border border-white/10 bg-[#020814] px-3 py-2 text-sm leading-6 text-white"
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

            <section className="border border-[rgba(74,222,128,0.28)] bg-[rgba(74,222,128,0.07)] p-4">
              <SectionLabel icon={MessageSquareText} label="Customer-safe wording" />
              <p className="mt-3 text-sm leading-6 text-[var(--cg-text-soft)]">{phase32MockCase.customerSafeWordingDraft}</p>
              <p className="mt-3 text-xs leading-5 text-[var(--cg-text-muted)]">
                Customer-safe wording is separate from internal notes and does not state a final automated outcome.
              </p>
            </section>
          </aside>
        </div>

        <section className="border border-white/10 bg-[#06111f] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionLabel icon={History} label="Timeline and audit history placeholder" />
            <SecurityBadge label="Browser-local mock events" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {phase32MockCase.timeline.map((event) => (
              <article key={event.key} className="border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 className="size-3.5 text-[var(--cg-green)]" aria-hidden="true" />
                  {event.label}
                </div>
                <p className="mt-2 text-xs text-[var(--cg-text-muted)]">
                  {event.timestamp} / {event.actor}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--cg-text-soft)]">{event.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
