import { notFound } from "next/navigation";

import { ProductPhotoReviewPanel } from "@/components/ProductPhotoReviewPanel";

import { productPhotoReviewPanelRenderCases } from "./render-cases";

function isProductPhotoVisualHostEnabled() {
  return process.env.NODE_ENV !== "production";
}

export default function ProductPhotoReviewPanelVisualHostPage() {
  if (!isProductPhotoVisualHostEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#020814] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-white/10 pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--cg-cyan)]">
            Synthetic non-live visual QA surface
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">
            ProductPhotoReviewPanel render host
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--cg-text-soft)]">
            This unlinked developer route renders literal synthetic ProductPhotoReportViewModel cases only. It is
            not a live workflow, does not analyze uploads, does not display photos, and is disabled in
            production by default.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg border border-[rgba(24,183,255,0.28)] bg-[rgba(24,183,255,0.08)] px-3 py-1 text-xs font-medium text-[var(--cg-cyan)]">
              Local/dev only
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-medium text-[var(--cg-text-soft)]">
              Synthetic view models only
            </span>
            <span className="rounded-lg border border-[rgba(251,191,36,0.28)] bg-[rgba(251,191,36,0.08)] px-3 py-1 text-xs font-medium text-[var(--cg-amber)]">
              Manual review only
            </span>
          </div>
        </header>

        <section aria-labelledby="visual-host-cases-title" className="space-y-5">
          <div>
            <h2 id="visual-host-cases-title" className="text-lg font-semibold text-white">
              Synthetic review states
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--cg-text-muted)]">
              Cases cover limited quality, medium review priority, and stronger manual-review context without
              photos, files, raw metadata, external payloads, retained handles, or workflow identifiers.
            </p>
          </div>

          {productPhotoReviewPanelRenderCases.map((viewModel) => (
            <ProductPhotoReviewPanel key={viewModel.reviewTitle} viewModel={viewModel} />
          ))}
        </section>
      </div>
    </main>
  );
}
