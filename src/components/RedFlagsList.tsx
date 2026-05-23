import { AlertCircle, CheckCircle2, Radar } from "lucide-react";
import type { AnalysisStatus, RedFlag, RiskLevel } from "@/lib/claim-data";

type RedFlagsListProps = {
  flags: RedFlag[];
  status?: AnalysisStatus;
  evidenceLabel: string;
  riskLevel: RiskLevel;
};

const severityByRisk: Record<RiskLevel, string[]> = {
  Low: ["Low concern", "Verification note", "Low concern"],
  Medium: ["Review suggested", "Verification incomplete", "Low confidence"],
  High: ["Elevated risk", "Review suggested", "Manual review required"],
};

const signalTitles = [
  "Possible Image Manipulation",
  "Date Consistency",
  "Unusual Price Point",
  "Payment Method",
];

const confidencePercent = ["78%", "62%", "58%", "35%"];

export function RedFlagsList({
  flags,
  status = "complete",
  evidenceLabel,
  riskLevel,
}: RedFlagsListProps) {
  const isPending = status !== "complete";

  return (
    <section className="cg-command-panel rounded-[1.15rem] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cg-cyan)]">
            Signal monitor
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Detected signals</h2>
          <p className="mt-1 text-xs text-[var(--cg-text-muted)]">Signals guide manual review, not conclusions.</p>
        </div>
        <span className="cg-security-badge rounded-lg px-3 py-1 text-xs font-semibold">
          {isPending ? "Pending" : `${flags.length} signals`}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {isPending ? (
          <div className="rounded-xl border border-dashed border-[var(--cg-border-strong)] bg-[#06101f]/58 p-4 text-sm leading-6 text-[var(--cg-text-muted)]">
            <div className="flex items-start gap-3">
              <Radar className="mt-0.5 size-5 shrink-0 text-[var(--cg-cyan)]" aria-hidden="true" />
              <p>Detected signals will appear here after the mock analysis completes.</p>
            </div>
          </div>
        ) : null}

        {!isPending &&
          flags.slice(0, 4).map((flag, index) => {
            const severity = severityByRisk[riskLevel][index] ?? severityByRisk[riskLevel][0];
            const title = signalTitles[index] ?? flag.label;

            return (
              <article
                className="cg-evidence-rail rounded-xl border border-[var(--cg-border)] bg-[#06101f]/62 p-3 transition hover:border-[var(--cg-border-strong)] hover:bg-[#0b1728]/70"
                key={flag.label}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.1)] text-[var(--cg-amber)]">
                    <AlertCircle className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{title}</p>
                      <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--cg-text-muted)]">
                        SIG-{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-[var(--cg-text-muted)]">{flag.detail}</p>

                    <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                      {[
                        { label: "Severity", value: severity },
                        { label: "Confidence", value: confidencePercent[index] ?? flag.confidence },
                        { label: "Evidence source", value: evidenceLabel },
                      ].map((item) => (
                        <div className="rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-2" key={item.label}>
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">
                            {item.label}
                          </dt>
                          <dd className="mt-1 text-xs font-semibold text-[var(--cg-text-soft)]">{item.value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-[rgba(74,222,128,0.22)] bg-[rgba(74,222,128,0.07)] p-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--cg-green)]" aria-hidden="true" />
                      <p className="text-xs leading-5 text-[var(--cg-text-soft)]">
                        Manual review recommended before final support action. Ask for verification only when needed.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}
