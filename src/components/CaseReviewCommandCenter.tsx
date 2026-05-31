"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock3,
  ClipboardList,
  FilePlus2,
  FileSearch,
  History,
  Link2,
  ListChecks,
  MessageSquareText,
  NotebookText,
  PanelLeft,
  PenLine,
  ScanLine,
  ShieldCheck,
  Tags,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  phase32MockCase,
  type CaseAttentionLevel,
  type CaseCustomerSafeWordingTone,
  type CaseEvidenceBenchGroup,
  type CaseEvidenceItem,
  type CaseEvidenceReviewState,
  type CaseManualDecisionTone,
  type CaseTimelineCategory,
  type CaseTimelineSeverity,
} from "@/lib/case-command-center/mock-case";

const attentionTone: Record<CaseAttentionLevel, string> = {
  "Low attention": "border-[rgba(95,143,100,0.34)] bg-[rgba(95,143,100,0.10)] text-[var(--cg-green)]",
  "Review signals": "border-[rgba(184,133,24,0.34)] bg-[rgba(184,133,24,0.10)] text-[var(--cg-amber)]",
  "Manual review recommended": "border-[rgba(154,87,52,0.36)] bg-[rgba(154,87,52,0.10)] text-[var(--cg-copper)]",
};

const evidenceIcon: Record<CaseEvidenceItem["type"], LucideIcon> = {
  Receipt: FileSearch,
  "Order screenshot": ScanLine,
  "Shipping confirmation": ClipboardList,
  "Customer message": MessageSquareText,
  "Product-photo-like unsupported": AlertTriangle,
};

const evidenceGroupLabels: readonly CaseEvidenceBenchGroup[] = [
  "Reviewed receipt evidence",
  "Needs clearer context",
  "Manual-review-only evidence",
  "Context for response planning",
];

const evidenceReviewStateTone: Record<CaseEvidenceReviewState, string> = {
  "Receipt analysis complete":
    "border-[rgba(95,143,100,0.34)] bg-[rgba(95,143,100,0.10)] text-[var(--cg-green)]",
  "Needs clearer copy":
    "border-[rgba(184,133,24,0.38)] bg-[rgba(184,133,24,0.12)] text-[var(--cg-amber)]",
  "Context only":
    "border-[rgba(111,120,134,0.34)] bg-[rgba(111,120,134,0.10)] text-[var(--cg-blue)]",
  "Unsupported manual review":
    "border-[rgba(154,87,52,0.40)] bg-[rgba(154,87,52,0.12)] text-[var(--cg-copper)]",
};

const timelineCategoryIcon: Record<CaseTimelineCategory, LucideIcon> = {
  "Evidence added": FilePlus2,
  "Analysis completed": CheckCircle2,
  "Manual review needed": AlertTriangle,
  "Rep note drafted": PenLine,
  "Customer-safe wording prepared": MessageSquareText,
  "Case status changed": ClipboardList,
  "Escalation marker": AlertTriangle,
};

const timelineSeverityTone: Record<CaseTimelineSeverity, string> = {
  Informational: "border-[rgba(125,103,64,0.20)] bg-[rgba(255,253,247,0.76)] text-[var(--cg-text-muted)]",
  Complete: "border-[rgba(95,143,100,0.34)] bg-[rgba(95,143,100,0.10)] text-[var(--cg-green)]",
  "Needs review": "border-[rgba(184,133,24,0.38)] bg-[rgba(184,133,24,0.12)] text-[var(--cg-amber)]",
  Escalation: "border-[rgba(154,87,52,0.40)] bg-[rgba(154,87,52,0.12)] text-[var(--cg-copper)]",
};

const timelineDotTone: Record<CaseTimelineSeverity, string> = {
  Informational: "border-[rgba(125,103,64,0.28)] bg-[var(--cg-bg-paper)] text-[var(--cg-text-muted)]",
  Complete: "border-[rgba(95,143,100,0.42)] bg-[rgba(95,143,100,0.14)] text-[var(--cg-green)]",
  "Needs review": "border-[rgba(184,133,24,0.48)] bg-[rgba(184,133,24,0.15)] text-[var(--cg-amber)]",
  Escalation: "border-[rgba(154,87,52,0.48)] bg-[rgba(154,87,52,0.16)] text-[var(--cg-copper)]",
};

const manualDecisionTone: Record<CaseManualDecisionTone, string> = {
  "Active review": "border-[rgba(184,133,24,0.38)] bg-[rgba(184,133,24,0.11)] text-[var(--cg-amber)]",
  "Escalation path": "border-[rgba(154,87,52,0.40)] bg-[rgba(154,87,52,0.12)] text-[var(--cg-copper)]",
  "Info needed": "border-[rgba(111,120,134,0.34)] bg-[rgba(111,120,134,0.10)] text-[var(--cg-blue)]",
  "Safety hold": "border-[rgba(95,143,100,0.34)] bg-[rgba(95,143,100,0.10)] text-[var(--cg-green)]",
};

const wordingTone: Record<CaseCustomerSafeWordingTone, string> = {
  Neutral: "border-[rgba(111,120,134,0.34)] bg-[rgba(111,120,134,0.10)] text-[var(--cg-blue)]",
  "Information request": "border-[rgba(184,133,24,0.38)] bg-[rgba(184,133,24,0.11)] text-[var(--cg-amber)]",
  "Manual review": "border-[rgba(95,143,100,0.34)] bg-[rgba(95,143,100,0.10)] text-[var(--cg-green)]",
  "Policy review": "border-[rgba(154,87,52,0.36)] bg-[rgba(154,87,52,0.10)] text-[var(--cg-copper)]",
};

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

  return (
    <span className={`inline-flex max-w-full items-center rounded-md border px-2.5 py-1 text-xs font-medium leading-5 ${toneClass}`}>
      {label}
    </span>
  );
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
    <div className={`flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide ${textClass}`}>
      <Icon className={`size-3.5 shrink-0 ${iconClass}`} aria-hidden="true" />
      <span className="min-w-0">{label}</span>
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
      className={`w-full rounded-md border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,133,24,0.42)] ${
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
            <span className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.72)] px-2 py-0.5 text-[11px] font-semibold text-[var(--cg-text-muted)]">
              {item.typeLabel}
            </span>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${evidenceReviewStateTone[item.reviewState]}`}>
              {item.reviewState}
            </span>
          </div>
          <p className="mt-1 break-words text-sm font-semibold text-[var(--cg-text)]">{item.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--cg-text-muted)]">{item.safeSummary}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${attentionTone[item.attentionLevel]}`}>
              {item.attentionLevel}
            </span>
            <span className="text-xs font-medium text-[var(--cg-amber)]">{item.statusLabel}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function EvidenceSidebar({
  selectedEvidence,
  onSelect,
}: {
  selectedEvidence: CaseEvidenceItem;
  onSelect: (key: string) => void;
}) {
  const manualReviewCount = phase32MockCase.evidenceItems.filter(
    (item) => item.attentionLevel === "Manual review recommended" || item.reviewState === "Unsupported manual review",
  ).length;

  return (
    <aside className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.58)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
      <SectionLabel icon={PanelLeft} label="Evidence bench" />
      <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">
        Synthetic case evidence only. Rows omit raw filenames, private identifiers, raw OCR, and metadata.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <FieldTile label="Items" value={String(phase32MockCase.evidenceItems.length)} />
        <FieldTile label="Needs review" value={String(manualReviewCount)} />
        <FieldTile label="Live data" value="No" />
      </div>

      <div className="mt-4 rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.62)] p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">
            Selected
          </p>
          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${evidenceReviewStateTone[selectedEvidence.reviewState]}`}>
            {selectedEvidence.reviewState}
          </span>
        </div>
        <p className="mt-2 break-words text-sm font-semibold text-[var(--cg-text)]">{selectedEvidence.title}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--cg-text-muted)]">{selectedEvidence.submittedContext}</p>
      </div>

      <div className="mt-4 space-y-5 xl:space-y-4">
        {evidenceGroupLabels.map((group) => {
          const items = phase32MockCase.evidenceItems.filter((item) => item.benchGroup === group);

          if (items.length === 0) {
            return null;
          }

          return (
            <section key={group}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">
                  {group}
                </p>
                <span className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.68)] px-2 py-0.5 text-[11px] font-medium text-[var(--cg-text-muted)]">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <EvidenceRow
                    active={item.key === selectedEvidence.key}
                    item={item}
                    key={item.key}
                    onSelect={() => onSelect(item.key)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function FieldTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.72)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[var(--cg-text)]">{value}</p>
    </div>
  );
}

function HeaderSummaryChip({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-h-[112px] rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.74)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--cg-text)]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{detail}</p>
    </div>
  );
}

function CaseHeaderOrientation() {
  const header = phase32MockCase.headerContext;

  return (
    <header className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.74)] p-4 shadow-[0_18px_42px_rgba(77,62,36,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label="Phase 3.10 final shell polish" tone="bronze" />
            <StatusBadge label={phase32MockCase.workflowStatus} tone="amber" />
            <StatusBadge label="Mock/local data only" />
            <StatusBadge label={header.priorityLabel} tone="amber" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">
            Case Review Command Center / {header.caseType}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-[var(--cg-text)] sm:text-3xl">
            {header.caseTitle}
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--cg-text-muted)]">
            {phase32MockCase.caseRef}. {phase32MockCase.customerClaimSummary}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FieldTile label="Mock status" value={phase32MockCase.workflowStatus} />
            <FieldTile label="Queue context" value={header.queueContext} />
            <FieldTile label="Review priority" value={header.priorityLabel} />
          </div>
        </div>

        <aside className="rounded-lg border border-[rgba(26,31,39,0.28)] bg-[var(--cg-bg-panel)] p-4 shadow-[0_18px_42px_rgba(77,62,36,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <SectionLabel icon={ShieldCheck} label="Local privacy posture" tone="dark" />
          <p className="mt-3 text-sm leading-6 text-[var(--cg-dark-muted)]">{phase32MockCase.privacyPosture}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {header.privacyBadges.map((badge) => (
              <StatusBadge key={badge} label={badge} tone="dark" />
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-4 rounded-lg border border-[rgba(184,133,24,0.24)] bg-[rgba(246,241,232,0.66)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionLabel icon={ClipboardList} label="Review posture strip" />
            <p className="mt-2 text-sm leading-6 text-[var(--cg-text)]">{header.reviewPosture}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">{header.safeNextPosture}</p>
          </div>
          <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${attentionTone[phase32MockCase.attentionLevel]}`}>
            {phase32MockCase.attentionLevel}
          </span>
        </div>
        <p className="mt-3 rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.68)] p-3 text-xs leading-5 text-[var(--cg-text-subtle)]">
          {header.localOnlyBoundary}
        </p>
      </section>

      <section className="mt-4">
        <SectionLabel icon={ListChecks} label="Evidence and review summary chips" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {header.summaryChips.map((chip) => (
            <HeaderSummaryChip key={chip.label} label={chip.label} value={chip.value} detail={chip.detail} />
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.64)] p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionLabel icon={CircleDot} label="Static command/status bar" />
          <StatusBadge label="Orientation labels only" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {header.commandBarItems.map((item) => (
            <div
              className="min-h-[112px] rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.58)] p-3"
              key={item.key}
            >
              <p className="text-xs font-semibold text-[var(--cg-text)]">{item.label}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-amber)]">{item.status}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-4 text-sm leading-6 text-[var(--cg-text-muted)]">{header.statusNarrative}</p>
    </header>
  );
}

function TimelineAuditTrail({ selectedEvidence }: { selectedEvidence: CaseEvidenceItem }) {
  const selectedEvidenceEvents = phase32MockCase.timeline.filter((event) =>
    event.relatedEvidenceKeys.includes(selectedEvidence.key),
  );

  return (
    <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.62)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionLabel icon={History} label="Timeline and audit trail" />
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--cg-text-muted)]">
            Synthetic audit events show how the case moved through evidence intake, local review, manual-review
            routing, notes, customer-safe wording, and escalation readiness without persistence or live integrations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label="Synthetic audit structure" />
          <StatusBadge label={phase32MockCase.workflowStatus} tone="amber" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <FieldTile label="Audit events" value={String(phase32MockCase.timeline.length)} />
        <FieldTile label="Selected evidence links" value={String(selectedEvidenceEvents.length)} />
        <FieldTile label="Current case status" value={phase32MockCase.workflowStatus} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          {phase32MockCase.timeline.map((event) => {
            const Icon = timelineCategoryIcon[event.category];
            const isSelectedEvidenceEvent = event.relatedEvidenceKeys.includes(selectedEvidence.key);

            return (
              <article
                className={`relative rounded-md border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] ${
                  isSelectedEvidenceEvent
                    ? "border-[rgba(184,133,24,0.50)] bg-[rgba(255,253,247,0.86)]"
                    : "border-[rgba(125,103,64,0.16)] bg-[rgba(255,253,247,0.64)]"
                }`}
                key={event.key}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`grid size-9 shrink-0 place-items-center rounded-md border ${timelineDotTone[event.severity]}`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="break-words text-sm font-semibold text-[var(--cg-text)]">{event.statusLabel}</span>
                        {isSelectedEvidenceEvent ? <StatusBadge label="Selected evidence" tone="bronze" /> : null}
                      </div>
                      <p className="mt-1 text-xs font-medium text-[var(--cg-text-subtle)]">
                        {event.category} / {event.actor}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-md border px-2 py-1 font-medium ${timelineSeverityTone[event.severity]}`}>
                      {event.severity}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.72)] px-2 py-1 font-medium text-[var(--cg-text-muted)]">
                      <Clock3 className="size-3" aria-hidden="true" />
                      {event.relativeTime}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-[var(--cg-text-muted)]">{event.detail}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                  <div className="rounded-md border border-[rgba(125,103,64,0.16)] bg-[rgba(246,241,232,0.64)] px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">
                      Static mock time
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--cg-text)]">{event.timestamp}</p>
                  </div>
                  <div className="rounded-md border border-[rgba(125,103,64,0.16)] bg-[rgba(246,241,232,0.64)] px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">
                      Reviewer impact
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[var(--cg-text-muted)]">{event.reviewerImpact}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] px-2 py-1 text-xs font-medium text-[var(--cg-text-muted)]">
                    <CircleDot className="size-3" aria-hidden="true" />
                    Status after event: {event.caseStatusAfter}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-3 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-lg border border-[rgba(26,31,39,0.28)] bg-[var(--cg-bg-panel)] p-4 shadow-[0_18px_42px_rgba(77,62,36,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <SectionLabel icon={FileSearch} label="Selected evidence trail" tone="dark" />
            <p className="mt-3 text-sm leading-6 text-[var(--cg-dark-muted)]">
              {selectedEvidence.title} has {selectedEvidenceEvents.length} linked mock audit event
              {selectedEvidenceEvents.length === 1 ? "" : "s"}.
            </p>
            <div className="mt-3 space-y-2">
              {selectedEvidenceEvents.map((event) => (
                <div key={event.key} className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
                  <p className="text-xs font-semibold text-[var(--cg-dark-text)]">{event.statusLabel}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--cg-dark-subtle)]">{event.relativeTime}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-4">
            <SectionLabel icon={ShieldCheck} label="Audit boundary" />
            <p className="mt-3 text-sm leading-6 text-[var(--cg-text-muted)]">
              Events are static mock values from local case data. They do not imply a saved audit record, ticket
              writeback, external verification, storage, provider activity, or a final support outcome.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ManualReviewWorkspace({ selectedEvidence }: { selectedEvidence: CaseEvidenceItem }) {
  const workspace = phase32MockCase.manualReviewWorkspace;
  const selectedRationale = workspace.selectedEvidenceRationale[selectedEvidence.key] ?? [];

  return (
    <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.68)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionLabel icon={NotebookText} label="Manual review workspace" />
          <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">{workspace.summary}</p>
        </div>
        <StatusBadge label="Mock local review plan" tone="bronze" />
      </div>

      <div className="mt-4 rounded-md border border-[rgba(95,143,100,0.30)] bg-[rgba(95,143,100,0.08)] p-3 text-sm leading-6 text-[var(--cg-text)]">
        {workspace.notSavedBoundary}
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-2 2xl:grid-cols-1">
        {workspace.decisionStates.map((state) => (
          <article
            className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.72)] p-3"
            key={state.key}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[var(--cg-text)]">{state.label}</span>
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${manualDecisionTone[state.tone]}`}>
                {state.tone}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{state.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[rgba(26,31,39,0.28)] bg-[var(--cg-bg-panel)] p-4 shadow-[0_14px_34px_rgba(77,62,36,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <SectionLabel icon={FileSearch} label="Selected evidence rationale" tone="dark" />
        <p className="mt-3 text-sm font-semibold text-[var(--cg-dark-text)]">{selectedEvidence.title}</p>
        <ul className="mt-3 space-y-2">
          {selectedRationale.map((item) => (
            <li key={item} className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-sm leading-6 text-[var(--cg-dark-muted)]">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-1">
        <section className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.58)] p-3">
          <SectionLabel icon={PenLine} label="Internal note structure" />
          <ul className="mt-3 space-y-2">
            {workspace.internalNotes.map((note) => (
              <li key={note} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                {note}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.58)] p-3">
          <SectionLabel icon={ShieldCheck} label="Policy and safety reminders" />
          <ul className="mt-3 space-y-2">
            {workspace.policyConsiderations.map((item) => (
              <li key={item} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 space-y-2 rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-3">
        <p className="text-sm leading-6 text-[var(--cg-text-muted)]">{workspace.customerSafeHandoff}</p>
        <p className="text-xs leading-5 text-[var(--cg-text-subtle)]">{workspace.timelineConnection}</p>
      </div>
    </section>
  );
}

function CustomerSafeWordingModule({ selectedEvidence }: { selectedEvidence: CaseEvidenceItem }) {
  const wording = phase32MockCase.customerSafeWordingModule;
  const selectedRationale =
    wording.selectedEvidenceRationale[selectedEvidence.key] ??
    "Use the selected evidence summary to keep customer-facing wording neutral and support-safe.";

  return (
    <section className="rounded-lg border border-[rgba(95,143,100,0.30)] bg-[rgba(255,253,247,0.70)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionLabel icon={MessageSquareText} label="Customer-safe wording module" />
          <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">{wording.summary}</p>
        </div>
        <StatusBadge label={wording.status} tone="green" />
      </div>

      <div className="mt-4 rounded-md border border-[rgba(95,143,100,0.32)] bg-[rgba(95,143,100,0.09)] p-3 text-sm leading-6 text-[var(--cg-text)]">
        {wording.notSentBoundary}
      </div>

      <div className="mt-4 rounded-lg border border-[rgba(26,31,39,0.28)] bg-[var(--cg-bg-panel)] p-4 shadow-[0_14px_34px_rgba(77,62,36,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionLabel icon={FileSearch} label="Internal-only rationale link" tone="dark" />
            <p className="mt-3 text-sm font-semibold text-[var(--cg-dark-text)]">{selectedEvidence.title}</p>
          </div>
          <StatusBadge label={selectedEvidence.reviewState} tone="dark" />
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--cg-dark-muted)]">{selectedRationale}</p>
        <p className="mt-3 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-xs leading-5 text-[var(--cg-dark-subtle)]">
          {wording.internalRationaleBoundary}
        </p>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-3 2xl:grid-cols-1">
        {wording.variants.map((variant) => (
          <article
            className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.76)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]"
            key={variant.key}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--cg-text)]">{variant.label}</p>
                <p className="mt-1 text-xs font-medium text-[var(--cg-text-subtle)]">{variant.intent}</p>
              </div>
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${wordingTone[variant.tone]}`}>
                {variant.tone}
              </span>
            </div>
            <p className="mt-3 rounded-md border border-[rgba(125,103,64,0.16)] bg-[rgba(246,241,232,0.62)] p-3 text-sm leading-6 text-[var(--cg-text)]">
              {variant.draft}
            </p>
            <p className="mt-3 text-xs leading-5 text-[var(--cg-text-muted)]">{variant.whenToUse}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {variant.avoids.map((item) => (
                <span
                  className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.62)] px-2 py-1 text-[11px] font-medium text-[var(--cg-text-muted)]"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-1">
        <section className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.58)] p-3">
          <SectionLabel icon={ShieldCheck} label="Support-safe guardrails" />
          <ul className="mt-3 space-y-2">
            {wording.guardrails.map((item) => (
              <li key={item} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.58)] p-3">
          <SectionLabel icon={CheckCircle2} label="Rep review checklist" />
          <ul className="mt-3 space-y-2">
            {wording.repReviewChecklist.map((item) => (
              <li key={item} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-4 rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-3 text-xs leading-5 text-[var(--cg-text-subtle)]">
        {wording.timelineConnection}
      </p>
    </section>
  );
}

function SelectedEvidencePanel({ item }: { item: CaseEvidenceItem }) {
  return (
    <section className="cg-forensic-panel rounded-lg">
      <div className="border-b border-[rgba(125,103,64,0.16)] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel icon={FileSearch} label="Selected evidence bench" />
            <h2 className="mt-2 break-words text-xl font-semibold tracking-normal text-[var(--cg-text)] sm:text-2xl">{item.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cg-text-muted)]">{item.safeSummary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.68)] px-2.5 py-1 text-xs font-medium text-[var(--cg-text-muted)]">
                {item.typeLabel}
              </span>
              <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${evidenceReviewStateTone[item.reviewState]}`}>
                {item.reviewState}
              </span>
              <span className="rounded-md border border-[rgba(184,133,24,0.30)] bg-[rgba(184,133,24,0.09)] px-2.5 py-1 text-xs font-medium text-[var(--cg-amber)]">
                {item.statusLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={item.type} tone="bronze" />
            <StatusBadge label={item.attentionLevel} tone={item.attentionLevel === "Manual review recommended" ? "amber" : "slate"} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] 2xl:gap-5">
        <div className="space-y-4">
          <div className="cg-evidence-surface min-h-[300px] rounded-lg p-4 sm:min-h-[330px] sm:p-5">
            <div className="cg-scan-corners" aria-hidden="true" />
            <div className="flex min-h-[252px] flex-col justify-between gap-6 sm:min-h-[286px] sm:gap-8">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-amber)]">Privacy-safe inspection shell</p>
                <p className="mt-3 text-sm leading-6 text-[var(--cg-text-muted)]">
                  Phase 3.7 renders structured local summaries and mock evidence-detail planning only. No raw evidence preview,
                  file bytes, object URL, OCR text, metadata payload, provider response, storage handle, or integration
                  handle is represented.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <FieldTile label="External Verification" value={item.externalVerification} />
                <FieldTile label="Verification Status" value={item.verificationStatus} />
                <FieldTile label="Manual Decision" value="Reviewer-entered only" />
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.68)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">
            <SectionLabel icon={Tags} label="Structured evidence metadata" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {item.metadata.map((field) => (
                <FieldTile key={field.label} label={field.label} value={field.value} />
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--cg-text-muted)]">{item.submittedContext}</p>
          </section>

          <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.68)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">
            <SectionLabel icon={ClipboardList} label="Synthetic review context" />
            <p className="mt-3 text-sm leading-6 text-[var(--cg-text)]">{item.reviewContext}</p>
          </section>

          <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.68)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">
            <SectionLabel icon={CheckCircle2} label="Recommended reviewer action" />
            <p className="mt-3 text-sm leading-6 text-[var(--cg-text)]">{item.recommendedReviewerAction}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-[rgba(26,31,39,0.28)] bg-[var(--cg-bg-panel)] p-4 shadow-[0_18px_42px_rgba(77,62,36,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <SectionLabel icon={Activity} label="Observed review signals" tone="dark" />
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

          <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.62)] p-4">
            <SectionLabel icon={ListChecks} label="Investigation focus" />
            <ul className="mt-3 space-y-2">
              {item.investigationFocus.map((focus) => (
                <li key={focus} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                  {focus}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-[rgba(95,143,100,0.30)] bg-[rgba(95,143,100,0.08)] p-4">
            <SectionLabel icon={Link2} label="Cross-reference trail" />
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-[var(--cg-text)]">Timeline</dt>
                <dd className="mt-1 leading-6 text-[var(--cg-text-muted)]">{item.connections.timeline}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--cg-text)]">Manual review</dt>
                <dd className="mt-1 leading-6 text-[var(--cg-text-muted)]">{item.connections.manualReview}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--cg-text)]">Customer-safe wording</dt>
                <dd className="mt-1 leading-6 text-[var(--cg-text-muted)]">{item.connections.customerSafeWording}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-[rgba(184,133,24,0.30)] bg-[rgba(184,133,24,0.09)] p-4">
            <SectionLabel icon={CheckCircle2} label="Next-step cues" />
            <ul className="mt-3 space-y-2">
              {item.nextStepCues.map((cue) => (
                <li key={cue} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                  {cue}
                </li>
              ))}
            </ul>
          </section>

          {item.noLiveAnalysis ? (
            <section className="rounded-lg border border-[rgba(184,133,24,0.36)] bg-[rgba(184,133,24,0.10)] p-4">
              <SectionLabel icon={ShieldCheck} label="No-live markers" />
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <dt className="text-[var(--cg-text-muted)]">OCR invoked</dt>
                  <dd className="font-semibold text-[var(--cg-text)]">{item.noLiveAnalysis.ocrInvoked ? "Yes" : "No"}</dd>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <dt className="text-[var(--cg-text-muted)]">Metadata invoked</dt>
                  <dd className="font-semibold text-[var(--cg-text)]">{item.noLiveAnalysis.metadataInvoked ? "Yes" : "No"}</dd>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <dt className="text-[var(--cg-text-muted)]">Product-photo runtime live</dt>
                  <dd className="font-semibold text-[var(--cg-text)]">{item.noLiveAnalysis.productPhotoRuntimeLive ? "Yes" : "No"}</dd>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
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

function ReviewSummaryIntelligencePanel({ selectedEvidence }: { selectedEvidence: CaseEvidenceItem }) {
  const summary = phase32MockCase.reviewSummary;
  const selectedConnection =
    summary.selectedEvidenceConnection[selectedEvidence.key] ??
    "Selected evidence should be interpreted as local reviewer context only.";

  return (
    <section className="rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.72)] p-4 shadow-[0_18px_42px_rgba(77,62,36,0.10),inset_0_1px_0_rgba(255,255,255,0.70)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <SectionLabel icon={ClipboardList} label="Case review synthesis" />
          <h2 className="mt-2 text-xl font-semibold tracking-normal text-[var(--cg-text)]">
            Static case-level intelligence layout
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">{summary.synthesisNarrative}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label="Phase 3.9 review summary layout" tone="bronze" />
          <StatusBadge label={summary.status} tone="green" />
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[rgba(184,133,24,0.30)] bg-[rgba(184,133,24,0.09)] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-amber)]">{summary.synthesisLabel}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">{summary.synthesisBoundary}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {summary.evidenceReviewedGroups.map((group) => (
          <div
            className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.62)] p-3"
            key={group.label}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-subtle)]">{group.label}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--cg-text)]">{group.value}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{group.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-1">
        <section className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-3">
          <SectionLabel icon={AlertTriangle} label="Missing information checklist" />
          <ul className="mt-3 space-y-2">
            {summary.missingInformation.map((item) => (
              <li key={item} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-3">
          <SectionLabel icon={ListChecks} label="Manual-review drivers" />
          <ul className="mt-3 space-y-2">
            {summary.manualReviewDrivers.map((driver) => (
              <li key={driver} className="text-sm leading-6 text-[var(--cg-text-muted)]">
                {driver}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-1">
        <section className="rounded-lg border border-[rgba(26,31,39,0.28)] bg-[var(--cg-bg-panel)] p-4 shadow-[0_14px_34px_rgba(77,62,36,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <SectionLabel icon={FileSearch} label="Selected-evidence synthesis link" tone="dark" />
          <p className="mt-3 text-sm font-semibold text-[var(--cg-dark-text)]">{selectedEvidence.title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--cg-dark-muted)]">{selectedConnection}</p>
        </section>

        <section className="rounded-lg border border-[rgba(95,143,100,0.30)] bg-[rgba(95,143,100,0.08)] p-4">
          <SectionLabel icon={ShieldCheck} label="Safe reviewer posture" />
          <p className="mt-3 text-sm leading-6 text-[var(--cg-text)]">{summary.safeReviewerPosture}</p>
        </section>
      </div>

      <section className="mt-4 rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(246,241,232,0.58)] p-3">
        <SectionLabel icon={AlertTriangle} label="Review limitations" />
        <ul className="mt-3 space-y-2">
          {summary.limitations.map((limitation) => (
            <li key={limitation} className="text-sm leading-6 text-[var(--cg-text-muted)]">
              {limitation}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-3 2xl:grid-cols-1">
        <div className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-3">
          <SectionLabel icon={History} label="Timeline link" />
          <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{summary.timelineConnection}</p>
        </div>
        <div className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-3">
          <SectionLabel icon={NotebookText} label="Manual decision link" />
          <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{summary.manualDecisionConnection}</p>
        </div>
        <div className="rounded-md border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.70)] p-3">
          <SectionLabel icon={MessageSquareText} label="Customer-safe wording link" />
          <p className="mt-2 text-xs leading-5 text-[var(--cg-text-muted)]">{summary.customerSafeWordingConnection}</p>
        </div>
      </div>

      <p className="mt-4 rounded-md border border-[rgba(95,143,100,0.30)] bg-[rgba(95,143,100,0.09)] p-3 text-sm leading-6 text-[var(--cg-text)]">
        {summary.recommendedSupportAction}
      </p>
    </section>
  );
}

export function CaseReviewCommandCenter() {
  const [selectedKey, setSelectedKey] = useState(phase32MockCase.evidenceItems[0]?.key ?? "");

  const selectedEvidence = useMemo(
    () => phase32MockCase.evidenceItems.find((item) => item.key === selectedKey) ?? phase32MockCase.evidenceItems[0],
    [selectedKey],
  );

  return (
    <main className="min-h-screen bg-[var(--cg-bg)] text-[var(--cg-text)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-3 py-3 sm:px-5 sm:py-5 2xl:px-6">
        <CaseHeaderOrientation />

        <div className="grid flex-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_390px]">
          <EvidenceSidebar selectedEvidence={selectedEvidence} onSelect={setSelectedKey} />

          <SelectedEvidencePanel item={selectedEvidence} />

          <aside className="space-y-4 xl:col-span-2 2xl:col-span-1 2xl:sticky 2xl:top-4 2xl:max-h-[calc(100vh-2rem)] 2xl:overflow-y-auto">
            <ReviewSummaryIntelligencePanel selectedEvidence={selectedEvidence} />

            <ManualReviewWorkspace selectedEvidence={selectedEvidence} />

            <CustomerSafeWordingModule selectedEvidence={selectedEvidence} />
          </aside>
        </div>

        <TimelineAuditTrail selectedEvidence={selectedEvidence} />
      </div>
    </main>
  );
}
