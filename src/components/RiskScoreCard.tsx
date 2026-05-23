import { Activity, ArrowRight, BarChart3, ShieldAlert } from "lucide-react";
import type { AnalysisConfidence, AnalysisStatus, RiskLevel } from "@/lib/claim-data";

type RiskScoreCardProps = {
  score: number;
  riskLevel: RiskLevel;
  status?: AnalysisStatus;
  reviewLabel?: string;
  confidenceLevel?: AnalysisConfidence;
  signalCount?: number;
  suggestedAction?: string;
};

const riskClass: Record<RiskLevel, string> = {
  Low: "cg-risk-low",
  Medium: "cg-risk-medium",
  High: "cg-risk-high",
};

const riskLabel: Record<RiskLevel, string> = {
  Low: "Low Concern",
  Medium: "Review Suggested",
  High: "Elevated Risk",
};

const severityDistribution: Record<RiskLevel, { low: number; medium: number; high: number }> = {
  Low: { low: 72, medium: 22, high: 6 },
  Medium: { low: 38, medium: 48, high: 14 },
  High: { low: 22, medium: 34, high: 44 },
};

export function RiskScoreCard({
  score,
  riskLevel,
  status = "complete",
  reviewLabel = "Manual review recommended",
  confidenceLevel = "Medium confidence",
  signalCount = 0,
  suggestedAction = "Use the report to guide manual verification before resolving the claim.",
}: RiskScoreCardProps) {
  const isPending = status !== "complete";
  const distribution = severityDistribution[riskLevel];

  return (
    <section className="cg-forensic-panel rounded-[1.35rem] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cg-cyan)]">
            Risk intelligence
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Scoring module</h2>
        </div>
        <span
          className={`shrink-0 rounded-lg border px-3 py-1 text-xs font-bold ${
            isPending ? "cg-security-badge" : riskClass[riskLevel]
          }`}
        >
          {isPending ? "Awaiting report" : riskLabel[riskLevel]}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/62 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cg-text-muted)]">
              Authenticity confidence
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-6xl font-semibold leading-none tabular-nums text-white">
                {isPending ? "--" : score}
              </span>
              <span className="font-mono text-sm text-[var(--cg-text-muted)]">/100</span>
            </div>
          </div>
          <ShieldAlert className="mb-2 size-9 text-[var(--cg-cyan)]" aria-hidden="true" />
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#13243a]">
          <div
            className={`h-full rounded-full ${
              riskLevel === "High"
                ? "bg-[var(--cg-red)]"
                : riskLevel === "Medium"
                  ? "bg-[var(--cg-amber)]"
                  : "bg-[var(--cg-green)]"
            }`}
            style={{ width: isPending ? "0%" : `${score}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {[
          { label: "Confidence", value: isPending ? "Pending" : confidenceLevel, icon: Activity },
          { label: "Signals", value: isPending ? "--" : `${signalCount} detected`, icon: BarChart3 },
          { label: "Review state", value: isPending ? "Evidence needed" : reviewLabel, icon: ShieldAlert },
        ].map((item) => (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3" key={item.label}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">
              <item.icon className="size-3.5 text-[var(--cg-cyan)]" aria-hidden="true" />
              {item.label}
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[var(--cg-border)] bg-[#06101f]/62 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cg-text-muted)]">
          Severity distribution
        </p>
        <div className="mt-3 space-y-2">
          {[
            { label: "Low concern", value: distribution.low, color: "bg-[var(--cg-green)]" },
            { label: "Review suggested", value: distribution.medium, color: "bg-[var(--cg-amber)]" },
            { label: "Manual review", value: distribution.high, color: "bg-[var(--cg-red)]" },
          ].map((item) => (
            <div className="grid grid-cols-[112px_1fr_34px] items-center gap-2 text-xs" key={item.label}>
              <span className="font-semibold text-[var(--cg-text-muted)]">{item.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-[#13243a]">
                <span className={`block h-full rounded-full ${item.color}`} style={{ width: isPending ? "0%" : `${item.value}%` }} />
              </span>
              <span className="font-mono text-[var(--cg-text-soft)]">{isPending ? "--" : item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[rgba(74,222,128,0.26)] bg-[rgba(74,222,128,0.08)] p-3">
        <div className="flex items-start gap-2">
          <ArrowRight className="mt-0.5 size-4 shrink-0 text-[var(--cg-green)]" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cg-green)]">
              Recommended support action
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--cg-text-soft)]">
              {isPending ? "Attach evidence and run mock analysis to receive support-safe guidance." : suggestedAction}
            </p>
            <button
              className="mt-3 rounded-lg bg-[var(--cg-blue)] px-4 py-2 text-sm font-bold text-[#02111f] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cg-cyan)]"
              type="button"
            >
              Mark as Reviewed
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
