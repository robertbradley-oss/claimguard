import { AlertCircle, CheckCircle2, FileSearch, Loader2, ShieldCheck } from "lucide-react";
import type { AnalysisStatus, MockAnalysisReport, RiskLevel } from "@/lib/claim-data";

type AuthenticityResultCardProps = {
  report: MockAnalysisReport;
  status: AnalysisStatus;
};

const riskStyles: Record<RiskLevel, string> = {
  Low: "bg-[#E9FFF0] text-[#0B5F2A] ring-[#41D66F]/40",
  Medium: "bg-[#F7FBFF] text-[#066B8F] ring-[#19D3F3]/45",
  High: "bg-[#FFF1F2] text-[#9F1239] ring-[#FECDD3]",
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
      className={`cg-panel relative min-h-[520px] overflow-hidden rounded-xl p-5 sm:p-6 ${
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
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
            isComplete ? riskStyles[report.riskLevel] : "bg-[#F8FCFF] text-slate-500 ring-[#E4F0F7]"
          }`}
        >
          {isComplete ? `${report.riskLevel} risk` : isAnalyzing ? "Analyzing" : "Awaiting upload"}
        </span>
      </div>

      <div className={`mt-6 flex flex-col gap-5 sm:flex-row sm:items-center ${isComplete ? "sm:gap-6" : ""}`}>
        <div className={`relative shrink-0 ${isComplete ? "size-36" : "size-28"}`}>
          <svg className={`${isComplete ? "size-36" : "size-28"} -rotate-90`} viewBox="0 0 104 104" role="img" aria-label="Authenticity score">
            <circle cx="52" cy="52" r="44" fill="none" stroke="#E4F0F7" strokeWidth="10" />
            <circle
              cx="52"
              cy="52"
              r="44"
              fill="none"
              stroke={isComplete ? "#08AEEA" : "#E4F0F7"}
              strokeLinecap="round"
              strokeWidth="10"
              strokeDasharray={`${progress} ${circumference - progress}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${isComplete ? "text-5xl" : "text-3xl"} font-bold text-[#061426]`}>
              {isComplete ? report.score : "--"}
            </span>
            <span className="text-xs font-medium text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#00A7A5]">
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

      <div className="mt-5 border-t border-[#E4F0F7] pt-4">
        <h3 className="text-sm font-semibold text-[#061426]">Key risk signals</h3>
        <div className="mt-3 space-y-2.5">
          {!isComplete ? (
            <div className="rounded-xl border border-dashed border-[#D5E8F3] bg-[#F8FCFF] p-5 text-sm leading-6 text-slate-600">
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
            <div className="flex gap-3 rounded-lg border border-[#E4F0F7] bg-[#F8FCFF] p-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#41D66F]" aria-hidden="true" />
              <p className="text-sm leading-5 text-slate-700">
                No high-risk signals were generated in this mock review.
              </p>
            </div>
          ) : null}

          {isComplete
            ? visibleSignals.map((flag) => (
                <article className="rounded-lg border border-[#E4F0F7] bg-white p-3" key={flag.label}>
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

      <div className="mt-4 rounded-lg border border-[#E4F0F7] bg-[#F8FCFF] p-4 text-sm leading-6 text-slate-600">
        <span className="font-semibold text-slate-900">Manual review note:</span> This mock review does
        not confirm authenticity or determine customer intent. Manual policy verification is still
        recommended.
      </div>

      <details className="mt-3 rounded-lg border border-[#E4F0F7] bg-white px-4 py-3">
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
