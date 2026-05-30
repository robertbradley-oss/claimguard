import { notFound } from "next/navigation";

import type { PreAnalysisEvidenceGateDecision } from "@/lib/analysis/pre-analysis-evidence-gate";

import { preAnalysisEvidenceGateReviewCases } from "./render-cases";

function isPreAnalysisGateHostEnabled() {
  return process.env.NODE_ENV !== "production";
}

type OutcomePresentation = {
  label: string;
  badgeClass: string;
};

function outcomePresentation(outcome: PreAnalysisEvidenceGateDecision["outcome"]): OutcomePresentation {
  switch (outcome) {
    case "allow-receipt-default-path":
      return {
        label: "Allow receipt/default path",
        badgeClass: "border-[rgba(52,211,153,0.32)] bg-[rgba(52,211,153,0.10)] text-[#34d399]",
      };
    case "legacy-damage-photo-quarantine":
      return {
        label: "Legacy damage-photo quarantine",
        badgeClass: "border-[rgba(244,63,94,0.34)] bg-[rgba(244,63,94,0.10)] text-[#fb7185]",
      };
    case "product-photo-like-unsupported":
      return {
        label: "Product-photo-like unsupported",
        badgeClass: "border-[rgba(251,191,36,0.32)] bg-[rgba(251,191,36,0.10)] text-[var(--cg-amber)]",
      };
    case "unsupported-evidence":
      return {
        label: "Unsupported evidence",
        badgeClass: "border-[rgba(251,146,60,0.32)] bg-[rgba(251,146,60,0.10)] text-[#fb923c]",
      };
    case "unknown-inconclusive":
    default:
      return {
        label: "Unknown / inconclusive",
        badgeClass: "border-white/15 bg-white/[0.05] text-[var(--cg-text-soft)]",
      };
  }
}

function MarkerRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-xs text-[var(--cg-text-muted)]">{label}</span>
      <span className="text-xs font-semibold text-[var(--cg-text-soft)]">{value ? "Yes" : "No"}</span>
    </div>
  );
}

export default function PreAnalysisEvidenceGateHostPage() {
  if (!isPreAnalysisGateHostEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#020814] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="border-b border-white/10 pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--cg-cyan)]">
            Synthetic non-live developer gate review
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">
            Pre-analysis evidence gate review host
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--cg-text-soft)]">
            This unlinked developer route renders literal synthetic pre-analysis evidence gate decisions only. It
            does not analyze uploads, does not run OCR or metadata processing, does not display photos or files,
            does not call the gate builder, and is disabled in production by default. The gate is decision-only and
            is not wired into the live receipt analyzer.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg border border-[rgba(24,183,255,0.28)] bg-[rgba(24,183,255,0.08)] px-3 py-1 text-xs font-medium text-[var(--cg-cyan)]">
              Local/dev only
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-medium text-[var(--cg-text-soft)]">
              Synthetic decisions only
            </span>
            <span className="rounded-lg border border-[rgba(251,191,36,0.28)] bg-[rgba(251,191,36,0.08)] px-3 py-1 text-xs font-medium text-[var(--cg-amber)]">
              Manual review only
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-medium text-[var(--cg-text-soft)]">
              Runtime live: No
            </span>
          </div>
        </header>

        <section aria-labelledby="gate-host-cases-title" className="space-y-5">
          <div>
            <h2 id="gate-host-cases-title" className="text-lg font-semibold text-white">
              Synthetic gate decision states
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--cg-text-muted)]">
              Allow, unsupported, quarantine, product-photo-like, and inconclusive states are shown as distinct
              outcomes without files, uploads, raw metadata, identifiers, external payloads, or retained handles.
            </p>
          </div>

          {preAnalysisEvidenceGateReviewCases.map((reviewCase) => {
            const { decision } = reviewCase;
            const presentation = outcomePresentation(decision.outcome);
            const headingId = `gate-case-${reviewCase.key}`;

            return (
              <article
                key={reviewCase.key}
                aria-labelledby={headingId}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 id={headingId} className="text-base font-semibold text-white">
                      {reviewCase.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--cg-text-muted)]">{reviewCase.hintLabel}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg border px-3 py-1 text-xs font-semibold ${presentation.badgeClass}`}
                  >
                    {presentation.label}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-wide text-[var(--cg-text-muted)]">Outcome</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-[var(--cg-text-soft)]">{decision.outcome}</dd>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-wide text-[var(--cg-text-muted)]">
                      Allow receipt/default path
                    </dt>
                    <dd className="mt-0.5 text-xs font-semibold text-[var(--cg-text-soft)]">
                      {decision.allowReceiptDefaultPath ? "Yes" : "No"}
                    </dd>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-wide text-[var(--cg-text-muted)]">Posture</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-[var(--cg-text-soft)]">
                      Runtime live: No · Manual review only: Yes
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">
                    Decision reason
                  </h4>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {decision.reasons.map((reason) => (
                      <li key={reason} className="text-sm leading-6 text-[var(--cg-text-soft)]">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {decision.legacyCompatibility ? (
                  <div className="mt-4 rounded-md border border-[rgba(244,63,94,0.28)] bg-[rgba(244,63,94,0.06)] px-3 py-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[#fb7185]">
                      Legacy compatibility
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-[var(--cg-text-soft)]">
                      Alias {decision.legacyCompatibility.alias} · canonical{" "}
                      {decision.legacyCompatibility.canonicalEvidenceType} · quarantined{" "}
                      {decision.legacyCompatibility.quarantined ? "Yes" : "No"} · runtime candidate{" "}
                      {decision.legacyCompatibility.runtimeCandidate ? "Yes" : "No"}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">
                    No-live isolation markers
                  </h4>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <MarkerRow label="OCR invoked" value={decision.ocrInvoked} />
                    <MarkerRow label="Metadata processing invoked" value={decision.metadataInvoked} />
                    <MarkerRow label="Analyzer invoked" value={decision.analyzerInvoked} />
                    <MarkerRow label="Adapter invoked" value={decision.adapterInvoked} />
                    <MarkerRow
                      label="UI / upload / report / scoring / parser / fixture invoked"
                      value={decision.uiUploadReportScoringParserFixturePathsInvoked}
                    />
                    <MarkerRow
                      label="Providers / storage / integrations / case queues invoked"
                      value={decision.providersStorageIntegrationsCaseQueuesInvoked}
                    />
                    <MarkerRow label="Product-photo runtime live" value={decision.productPhotoRuntimeLive} />
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">
                    Limitations
                  </h4>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {decision.limitations.map((limitation) => (
                      <li key={limitation} className="text-sm leading-6 text-[var(--cg-text-soft)]">
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
