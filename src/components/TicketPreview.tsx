import {
  BadgeDollarSign,
  CalendarDays,
  FileCheck2,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import type { AnalysisStatus, CaseRecord, MockAnalysisReport } from "@/lib/claim-data";

type TicketPreviewProps = {
  selectedFile: File | null;
  status: AnalysisStatus;
  report: MockAnalysisReport;
  caseRecord?: CaseRecord;
};

export function TicketPreview({ selectedFile, status, report, caseRecord }: TicketPreviewProps) {
  const customer = caseRecord?.customer ?? "New customer";
  const channel = caseRecord?.channel ?? "Local upload";
  const customerNote =
    caseRecord?.ticket.customerNote ??
    "The customer submitted claim evidence for warranty review. Verify purchase details before deciding next steps.";
  const orderNumber = caseRecord?.ticket.orderNumber ?? "Pending match";
  const claimReason = caseRecord?.ticket.claimReason ?? "Warranty evidence review";
  const submitted = caseRecord?.submittedAt ?? (selectedFile ? "Just now" : "Awaiting upload");
  const evidence = caseRecord?.evidence ?? (selectedFile ? report.evidenceLabel : "No attachment selected");
  const customerSince = caseRecord ? "Jan 12, 2024" : "Pending profile";
  const lifetimeValue = caseRecord ? "$1,248.72" : "Pending";

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="cg-command-panel rounded-[1.15rem] p-4">
        <h2 className="text-base font-semibold uppercase tracking-wide text-white">Case context</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {[
            { label: "Customer", value: customer, icon: UserRound },
            { label: "Claim reason", value: claimReason, icon: PackageCheck },
            { label: "Channel", value: channel, icon: FileCheck2 },
            { label: "Order / RMA", value: orderNumber, icon: ShoppingBag },
            { label: "Customer since", value: customerSince, icon: CalendarDays },
            { label: "Lifetime value", value: lifetimeValue, icon: BadgeDollarSign },
          ].map((item) => (
            <div className="grid grid-cols-[1fr_auto] gap-3" key={item.label}>
              <dt className="flex items-center gap-2 text-[var(--cg-text-muted)]">
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </dt>
              <dd className="max-w-[220px] truncate text-right font-medium text-[var(--cg-text-soft)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="cg-command-panel rounded-[1.15rem] p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold uppercase tracking-wide text-white">Customer message</h2>
          <MessageCircle className="size-5 text-[var(--cg-cyan)]" aria-hidden="true" />
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-[#06101f]/58 p-4">
          <p className="text-sm leading-6 text-[var(--cg-text-soft)]">&quot;{customerNote}&quot;</p>
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-[var(--cg-text-muted)]">
          <span>Submitted {submitted}</span>
          <span>{evidence}</span>
          <span>{status === "analyzing" ? "Analysis running" : "Support-safe review"}</span>
        </div>
      </article>
    </section>
  );
}
