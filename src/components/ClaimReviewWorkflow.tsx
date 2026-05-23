"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, Globe2, MoreHorizontal, UserRound } from "lucide-react";
import { RecentCasesTable } from "@/components/RecentCasesTable";
import { RedFlagsList } from "@/components/RedFlagsList";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { TicketPreview } from "@/components/TicketPreview";
import { UploadPanel } from "@/components/UploadPanel";
import {
  mockAnalysisReports,
  mockAnalysisSteps,
  recentCases,
  type AnalysisStatus,
  type EvidenceType,
  type RiskLevel,
} from "@/lib/claim-data";

function getEvidenceType(file: File | null): EvidenceType {
  if (!file) {
    return "receipt";
  }

  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }

  if (name.includes("screenshot") || name.includes("screen")) {
    return "screenshot";
  }

  if (
    file.type.startsWith("image/") &&
    (name.includes("damage") ||
      name.includes("photo") ||
      name.includes("crack") ||
      name.includes("product"))
  ) {
    return "damage-photo";
  }

  return "receipt";
}

const caseStatus: Record<RiskLevel, string> = {
  Low: "Low Concern",
  Medium: "Needs Review",
  High: "Manual Review Required",
};

export function ClaimReviewWorkflow() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [activeAnalysisStep, setActiveAnalysisStep] = useState(0);
  const [activeCaseId, setActiveCaseId] = useState<string | undefined>(recentCases[0]?.id);
  const evidenceType = useMemo(() => getEvidenceType(selectedFile), [selectedFile]);
  const activeCase = recentCases.find((claim) => claim.id === activeCaseId);
  const report = activeCase?.report ?? mockAnalysisReports[evidenceType];
  const reviewStatus: AnalysisStatus = activeCase ? "complete" : status;
  const visibleCaseId = activeCase?.id ?? (selectedFile ? "CG-LOCAL" : "CG-INTAKE");
  const visibleChannel = activeCase?.channel ?? "Web Form";
  const visibleReviewer = activeCase?.assignedReviewer ?? "Unassigned";
  const visibleSubmitted = activeCase?.submittedAt ?? "Awaiting upload";
  const visibleUpdated =
    activeCase?.lastUpdated ?? (status === "complete" ? "Just completed" : status === "analyzing" ? "Analyzing now" : "Awaiting evidence");
  const visibleStatus =
    reviewStatus === "complete"
      ? caseStatus[report.riskLevel]
      : status === "uploaded"
        ? "Verification Incomplete"
        : status === "analyzing"
          ? "Document Consistency Review"
          : "Awaiting Evidence";

  useEffect(() => {
    if (status !== "analyzing") {
      return;
    }

    const stepTimer = window.setInterval(() => {
      setActiveAnalysisStep((currentStep) =>
        Math.min(currentStep + 1, mockAnalysisSteps.length - 1),
      );
    }, 850);

    const completeTimer = window.setTimeout(() => {
      window.clearInterval(stepTimer);
      setActiveAnalysisStep(mockAnalysisSteps.length - 1);
      setStatus("complete");
    }, mockAnalysisSteps.length * 850 + 500);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(completeTimer);
    };
  }, [status]);

  function handleFileSelect(file: File | null) {
    setSelectedFile(file);
    setActiveCaseId(undefined);
    setStatus(file ? "uploaded" : "idle");
    setActiveAnalysisStep(0);
  }

  function handleReset() {
    setSelectedFile(null);
    setActiveCaseId(recentCases[0]?.id);
    setStatus("idle");
    setActiveAnalysisStep(0);
  }

  function handleRunAnalysis() {
    if (!selectedFile || status === "analyzing") {
      return;
    }

    setActiveCaseId(undefined);
    setActiveAnalysisStep(0);
    setStatus("analyzing");
  }

  function handleCaseSelect(caseId: string) {
    setActiveCaseId(caseId);
    setSelectedFile(null);
    setStatus("idle");
    setActiveAnalysisStep(0);
  }

  return (
    <div className="mx-auto grid max-w-[1560px] gap-4">
      <header className="px-1 py-2">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <button className="inline-flex items-center gap-2 text-sm text-[var(--cg-text-muted)] transition hover:text-white" type="button">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Queue
            </button>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-3xl font-semibold text-white">{visibleCaseId}</h1>
              <span className="rounded-md border border-[rgba(251,191,36,0.45)] bg-[rgba(251,191,36,0.1)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--cg-amber)]">
                {visibleStatus}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--cg-text-muted)]">
              {[
                { icon: Globe2, value: activeCase?.ticket.purchaseChannel ?? "Web Form" },
                { icon: CalendarDays, value: visibleSubmitted },
                { icon: Clock3, value: visibleUpdated },
                { icon: UserRound, value: visibleChannel },
              ].map((item) => (
                <span className="inline-flex items-center gap-2" key={item.value}>
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.value}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl px-3 py-2 text-sm text-[var(--cg-text-muted)]">
              <p className="text-xs">Assigned to</p>
              <p className="font-semibold text-white">{visibleReviewer}</p>
            </div>
            <button className="rounded-lg border border-[var(--cg-border)] px-4 py-2 text-sm font-semibold text-white transition hover:border-[var(--cg-border-strong)]" type="button">
              Case actions
            </button>
            <button className="grid size-10 place-items-center rounded-lg border border-[var(--cg-border)] text-[var(--cg-text-muted)] transition hover:border-[var(--cg-border-strong)] hover:text-white" type="button" aria-label="More case actions">
              <MoreHorizontal className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.68fr)]">
        <div className="grid min-w-0 gap-4">
          <UploadPanel
            selectedFile={selectedFile}
            status={status}
            hasCompletedReport={status === "complete"}
            evidenceLabel={selectedFile ? report.evidenceLabel : "Receipt"}
            report={report}
            caseRecord={activeCase}
            analysisSteps={mockAnalysisSteps}
            activeAnalysisStep={activeAnalysisStep}
            onFileSelect={handleFileSelect}
            onRunAnalysis={handleRunAnalysis}
            onReset={handleReset}
          />

          <TicketPreview
            selectedFile={selectedFile}
            status={reviewStatus}
            report={report}
            caseRecord={activeCase}
          />
        </div>

        <aside className="grid min-w-0 content-start gap-4">
          <RiskScoreCard
            score={report.score}
            riskLevel={report.riskLevel}
            status={reviewStatus}
            reviewLabel={report.reviewLabel}
            confidenceLevel={report.confidenceLevel}
            signalCount={report.redFlags.length}
            suggestedAction={report.suggestedAction}
          />

          <RedFlagsList
            flags={report.redFlags}
            status={reviewStatus}
            evidenceLabel={report.evidenceLabel}
            riskLevel={report.riskLevel}
          />
        </aside>
      </div>

      <RecentCasesTable
        cases={recentCases}
        activeCaseId={activeCaseId}
        newlyAnalyzedCaseId={!activeCase && status === "complete" ? "new-upload" : undefined}
        onCaseSelect={handleCaseSelect}
      />
    </div>
  );
}
