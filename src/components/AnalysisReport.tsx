import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  ImageIcon,
  Info,
  ListChecks,
  Loader2,
  MessageSquareText,
  ShieldQuestion,
  TicketCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AnalysisStatus, MockAnalysisReport, RiskSignalGroup } from "@/lib/claim-data";

type AnalysisReportProps = {
  report: MockAnalysisReport;
  status: AnalysisStatus;
};

const checkStyles = {
  Clear: "cg-risk-low",
  Review: "cg-risk-medium",
  Inconclusive: "border-amber-300/45 bg-amber-300/10 text-amber-100",
};

const signalStyles = {
  "Manual review recommended": "border-amber-300/45 bg-amber-300/10 text-amber-100",
  Inconclusive: "cg-risk-medium",
  "Low confidence": "cg-security-badge",
  "No material signal": "cg-risk-low",
};

const categoryIcons: Record<RiskSignalGroup["category"], LucideIcon> = {
  "Receipt/document formatting": FileText,
  "Image/photo integrity": ImageIcon,
  "Customer/ticket pattern": UserRound,
  "Missing verification data": ClipboardCheck,
};

export function AnalysisReport({ report, status }: AnalysisReportProps) {
  const isComplete = status === "complete";
  const isAnalyzing = status === "analyzing";

  return (
    <section className="cg-command-panel rounded-[1.35rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cg-cyan)]">Mock report</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Evidence analysis report</h2>
        </div>
        <span className="cg-security-badge rounded-lg px-3 py-1 text-xs font-semibold">
          {isComplete ? report.reviewLabel : isAnalyzing ? "Analyzing" : "Awaiting evidence"}
        </span>
      </div>

      {!isComplete ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--cg-border-strong)] bg-[#06101f]/58 p-5">
          <div className="h-2 overflow-hidden rounded-full bg-[#13243a]">
            <div
              className={`h-full rounded-full cg-brand-gradient ${isAnalyzing ? "w-2/3 animate-pulse" : "w-1/4"}`}
            />
          </div>
          <div className="mt-4 flex items-start gap-3">
            {isAnalyzing ? (
              <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-[var(--cg-cyan)]" aria-hidden="true" />
            ) : (
              <ShieldQuestion className="mt-0.5 size-5 shrink-0 text-[var(--cg-cyan)]" aria-hidden="true" />
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {isAnalyzing ? "Building mock authenticity report" : "No completed report yet"}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--cg-text-muted)]">
                {isAnalyzing
                  ? "Checking evidence clarity, purchase context, and manual review signals."
                  : "Upload evidence or select a case to generate support-safe review guidance."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isComplete ? (
        <div className="mt-5 space-y-5">
          <div className="cg-ticket-paper rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#526175]">Primary finding</p>
            <p className="mt-1 text-base font-bold text-[var(--cg-text-paper)]">{report.primaryFinding}</p>
            <p className="mt-2 text-sm leading-6 text-[#344155]">
              This is a mock report for support prioritization. It is not a final decision about the
              customer or claim.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <article className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/62 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Gauge className="size-4 text-[var(--cg-cyan)]" aria-hidden="true" />
                Evidence Reliability Score
              </div>
              <p className="mt-3 font-mono text-4xl font-semibold text-white">{report.score}</p>
              <p className="text-xs font-medium text-[var(--cg-text-muted)]">out of 100</p>
              <p className="mt-3 text-sm leading-5 text-[var(--cg-text-muted)]">{report.scoreExplanation}</p>
            </article>

            <article className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/62 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldQuestion className="size-4 text-[var(--cg-green)]" aria-hidden="true" />
                Confidence level
              </div>
              <p className="mt-3 text-lg font-semibold text-white">{report.confidenceLevel}</p>
              <p className="mt-3 text-sm leading-5 text-[var(--cg-text-muted)]">
                Confidence reflects how complete the submitted evidence is for manual support review.
              </p>
            </article>

            <article className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/62 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="size-4 text-[var(--cg-amber)]" aria-hidden="true" />
                Risk level
              </div>
              <p className="mt-3 text-lg font-semibold text-white">{report.riskLevel} risk</p>
              <p className="mt-3 text-sm leading-5 text-[var(--cg-text-muted)]">
                Use the level to prioritize review effort, not to accuse or automatically resolve the claim.
              </p>
            </article>
          </div>

          <div className="rounded-2xl border border-[rgba(74,222,128,0.26)] bg-[rgba(74,222,128,0.08)] p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-[var(--cg-green)]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-white">Risk signal, not proof</p>
                <p className="mt-1 text-sm leading-6 text-[var(--cg-text-muted)]">{report.signalVsProof}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/62 p-4">
          <ShieldQuestion className="size-5 text-[var(--cg-cyan)]" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-semibold text-white">Evidence summary</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">
            {isComplete
              ? report.summary
              : "The report will summarize visible evidence and verification needs after analysis."}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/62 p-4">
          <CheckCircle2 className="size-5 text-[var(--cg-green)]" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-semibold text-white">Suggested support action</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">
            {isComplete
              ? report.suggestedAction
              : "Suggested support action will appear once the mock report is complete."}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/62 p-4">
          <MessageSquareText className="size-5 text-[var(--cg-cyan)]" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-semibold text-white">Customer-safe wording</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">
            {isComplete
              ? report.customerSafeWording
              : "Customer-facing wording will avoid accusations and focus on verification steps."}
          </p>
        </article>
      </div>

      {isComplete ? (
        <div className="mt-5 space-y-5">
          <section className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/52">
            <div className="border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Risk signals by category</h3>
              <p className="mt-1 text-xs text-[var(--cg-text-muted)]">
                Each category is a prompt for manual review, not a final claim determination.
              </p>
            </div>
            <div className="grid gap-3 p-4 xl:grid-cols-2">
              {report.riskSignalGroups.map((group) => {
                const CategoryIcon = categoryIcons[group.category];

                return (
                  <article className="rounded-2xl border border-[var(--cg-border)] bg-[#0b1728]/74 p-3" key={group.category}>
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--cg-border-strong)] bg-[rgba(24,183,255,0.12)] text-[var(--cg-cyan)]">
                        <CategoryIcon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white">{group.category}</h4>
                        <p className="mt-1 text-sm leading-5 text-[var(--cg-text-muted)]">{group.summary}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-3">
                      {group.signals.map((signal) => (
                        <div className="rounded-xl border border-white/10 bg-[#06101f]/72 p-3" key={signal.label}>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <p className="text-sm font-semibold text-white">{signal.label}</p>
                            <span
                              className={`w-fit shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                                signalStyles[signal.confidence]
                              }`}
                            >
                              {signal.confidence}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-5 text-[var(--cg-text-muted)]">{signal.detail}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/52">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <ListChecks className="size-4 text-[var(--cg-green)]" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white">What to verify next</h3>
              </div>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-3">
              {report.whatToVerifyNext.map((item) => (
                <div className="flex gap-3 rounded-xl border border-white/10 bg-[#0b1728]/76 p-3" key={item}>
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--cg-green)]" aria-hidden="true" />
                  <p className="text-sm leading-5 text-[var(--cg-text-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/52">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <TicketCheck className="size-4 text-[var(--cg-cyan)]" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white">Verification checks</h3>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {report.verificationChecks.map((check) => (
                <div className="grid gap-3 px-4 py-3 sm:grid-cols-[180px_120px_1fr]" key={check.label}>
                  <p className="text-sm font-semibold text-white">{check.label}</p>
                  <span
                    className={`w-fit rounded-lg border px-2.5 py-1 text-xs font-semibold ${checkStyles[check.result]}`}
                  >
                    {check.result}
                  </span>
                  <p className="text-sm leading-5 text-[var(--cg-text-muted)]">{check.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-[rgba(74,222,128,0.26)] bg-[rgba(74,222,128,0.08)] p-4 text-sm leading-6 text-[var(--cg-text-muted)]">
            <span className="font-semibold text-white">Manual review support only:</span> This mock
            analysis is designed to help support reps prioritize verification steps. This mock result
            does not confirm authenticity, determine customer intent, or replace policy-based human review.
            Manual policy verification is still recommended.
          </div>
        </div>
      ) : null}
    </section>
  );
}
