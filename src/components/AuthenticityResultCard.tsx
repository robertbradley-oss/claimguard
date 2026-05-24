import { AlertCircle, CheckCircle2, FileSearch, Loader2, ShieldCheck } from "lucide-react";
import type { AnalysisStatus, MockAnalysisReport, RiskLevel } from "@/lib/claim-data";

type AuthenticityResultCardProps = {
  report: MockAnalysisReport;
  status: AnalysisStatus;
};

const riskStyles: Record<RiskLevel, string> = {
  Low: "bg-[#ECFFF2] text-[#0B5F2A] ring-[#41D66F]/45 shadow-[0_8px_18px_rgba(65,214,111,0.12)]",
  Medium: "bg-[#F2FCFF] text-[#066B8F] ring-[#19D3F3]/50 shadow-[0_8px_18px_rgba(8,174,234,0.1)]",
  High: "bg-[#FFF1F2] text-[#9F1239] ring-[#FECDD3] shadow-[0_8px_18px_rgba(225,29,72,0.08)]",
};

export function AuthenticityResultCard({ report, status }: AuthenticityResultCardProps) {
  const isComplete = status === "complete";
  const isAnalyzing = status === "analyzing";
  const circumference = 2 * Math.PI * 44;
  const score = isComplete ? report.score : 0;
  const progress = (score / 100) * circumference;
  const visibleSignals = report.redFlags.slice(0, 3);

  return (
    <section
      className={`cg-panel relative min-h-[540px] overflow-hidden rounded-2xl p-5 sm:p-7 ${
        isComplete ? "shadow-[0_22px_54px_rgba(8,174,234,0.14)]" : ""
      }`}
    >
      {isComplete ? <div className="absolute inset-x-0 top-0 h-1 cg-brand-gradient" /> : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Authenticity result</p>
          <h2 className="mt-1 text-xl font-semibold text-[#061426]">Evidence review</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
            isComplete ? riskStyles[report.riskLevel] : "bg-[#F8FCFF] text-slate-500 ring-[#E4F0F7]"
          }`}
        >
          {isComplete ? `${report.riskLevel} risk` : isAnalyzing ? "Analyzing" : "Awaiting upload"}
        </span>
      </div>

      <div className={`mt-7 flex flex-col gap-5 sm:flex-row sm:items-center ${isComplete ? "sm:gap-7" : ""}`}>
        <div className={`relative shrink-0 rounded-full bg-white shadow-[0_18px_42px_rgba(8,174,234,0.1)] ring-1 ring-[#E4F0F7] ${isComplete ? "size-40" : "size-32"}`}>
          <svg className={`${isComplete ? "size-40" : "size-32"} -rotate-90`} viewBox="0 0 104 104" role="img" aria-label="Evidence Reliability Score">
            <defs>
              <linearGradient id="scoreGradient" x1="16" y1="16" x2="88" y2="88">
                <stop offset="0%" stopColor="#08AEEA" />
                <stop offset="58%" stopColor="#00A7A5" />
                <stop offset="100%" stopColor="#41D66F" />
              </linearGradient>
            </defs>
            <circle cx="52" cy="52" r="44" fill="none" stroke="#E4F0F7" strokeWidth="10" />
            <circle
              cx="52"
              cy="52"
              r="44"
              fill="none"
              stroke={isComplete ? "url(#scoreGradient)" : "#E4F0F7"}
              strokeLinecap="round"
              strokeWidth="10"
              strokeDasharray={`${progress} ${circumference - progress}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${isComplete ? "text-5xl" : "text-3xl"} font-semibold text-[#061426]`}>
              {isComplete ? report.score : "--"}
            </span>
            <span className="text-xs font-medium text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#008F91]">
            {isAnalyzing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="size-4" aria-hidden="true" />
            )}
            {isComplete ? report.reviewLabel : isAnalyzing ? "Preparing evidence review" : "No review yet"}
          </div>
          {isComplete || isAnalyzing ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isComplete
                ? report.summary
                : "Checking visible evidence signals and preparing support-safe guidance."}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 border-t border-[#E4F0F7] pt-5">
        <h3 className="text-sm font-semibold text-[#061426]">Key risk signals</h3>
        <div className="mt-3 space-y-2.5">
          {!isComplete ? (
            <div className="rounded-2xl border border-dashed border-[#D5E8F3] bg-gradient-to-br from-white to-[#F6FCFF] p-5 text-sm leading-6 text-slate-600">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#08AEEA] ring-1 ring-[#DDECF5]">
                  <FileSearch className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Ready for evidence</p>
                  <p className="mt-1">
                    Once you upload a file and run analysis, this card will show the score, risk level,
                    and the most important review signals.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {isComplete && visibleSignals.length === 0 ? (
            <div className="flex gap-3 rounded-xl border border-[#E4F0F7] bg-[#F8FCFF] p-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#41D66F]" aria-hidden="true" />
              <p className="text-sm leading-5 text-slate-700">
                No high-risk signals were generated in this mock review.
              </p>
            </div>
          ) : null}

          {isComplete
            ? visibleSignals.map((flag) => (
                <article className="rounded-xl border border-[#E4F0F7] bg-white p-3 shadow-[0_10px_24px_rgba(6,20,38,0.035)]" key={flag.label}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-[#FFF8EA] text-amber-700 ring-1 ring-amber-200">
                      <AlertCircle className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{flag.label}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{flag.detail}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">{flag.confidence}</p>
                    </div>
                  </div>
                </article>
              ))
            : null}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E4F0F7] bg-[#F8FCFF] p-4 text-sm leading-6 text-slate-600">
        <span className="font-semibold text-slate-900">Manual review note:</span> This mock review does
        not confirm authenticity or determine customer intent. Manual policy verification is still
        recommended.
      </div>

      <details className="mt-3 rounded-2xl border border-[#E4F0F7] bg-white px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#061426]">Review guidance</summary>
        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <p>Use risk signals only as prompts for manual verification.</p>
          <p>Use &quot;manual review recommended&quot; when evidence is mixed.</p>
          <p>Use &quot;inconclusive&quot; when a signal is not reliable.</p>
        </div>
      </details>
    </section>
  );
}
