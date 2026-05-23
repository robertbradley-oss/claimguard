"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import {
  AlertTriangle,
  FileImage,
  Fingerprint,
  Loader2,
  Maximize2,
  Minus,
  Play,
  Plus,
  RotateCw,
  ScanLine,
  UploadCloud,
  X,
} from "lucide-react";
import { formatFileSize } from "@/lib/file-format";
import type { AnalysisStatus, AnalysisStep, CaseRecord, MockAnalysisReport } from "@/lib/claim-data";

const acceptedTypes = "image/png,image/jpeg,image/webp,application/pdf";
const acceptedFileTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

type UploadPanelProps = {
  selectedFile: File | null;
  status: AnalysisStatus;
  hasCompletedReport?: boolean;
  evidenceLabel: string;
  report: MockAnalysisReport;
  caseRecord?: CaseRecord;
  analysisSteps: AnalysisStep[];
  activeAnalysisStep: number;
  onFileSelect: (file: File | null) => void;
  onRunAnalysis: () => void;
  onReset: () => void;
};

function evidenceHash(seed: string) {
  let value = 0;
  for (const character of seed) {
    value = (value * 31 + character.charCodeAt(0)) % 0xffffff;
  }

  return `sha256:${value.toString(16).padStart(6, "0")}-mock`;
}

export function UploadPanel({
  selectedFile,
  status,
  hasCompletedReport = false,
  evidenceLabel,
  report,
  caseRecord,
  analysisSteps,
  activeAnalysisStep,
  onFileSelect,
  onRunAnalysis,
  onReset,
}: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileMeta = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    const extension = selectedFile.name.split(".").pop()?.toUpperCase() ?? "File";
    const readableType =
      selectedFile.type === "application/pdf"
        ? "PDF document"
        : selectedFile.type.startsWith("image/")
          ? `${extension} image`
          : selectedFile.type || "Unknown file type";

    return {
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      type: readableType,
    };
  }, [selectedFile]);

  const isAnalyzing = status === "analyzing";
  const canAnalyze = Boolean(selectedFile) && !isAnalyzing;
  const actionLabel =
    isAnalyzing
      ? "Analyzing evidence"
      : status === "complete" || hasCompletedReport
        ? selectedFile
          ? "Re-run mock analysis"
          : "Run another review"
        : "Run mock analysis";
  const currentStep = analysisSteps[activeAnalysisStep]?.label ?? "Preparing support-safe mock review";
  const viewerFileName = caseRecord?.ticket.uploadedFile ?? fileMeta?.name ?? "No evidence selected";
  const viewerFileDetails = caseRecord?.ticket.fileDetails ?? (fileMeta ? `${fileMeta.type} | ${fileMeta.size}` : "Awaiting receipt, screenshot, PDF, or photo");
  const evidenceId = caseRecord ? `EV-${caseRecord.id.replace("CG-", "")}-A` : selectedFile ? "EV-LOCAL-001" : "EV-PENDING";
  const uploadedAt = caseRecord?.submittedAt ?? (selectedFile ? "Just now" : "Awaiting upload");
  const hashValue = evidenceHash(`${viewerFileName}-${report.evidenceType}-${report.score}`);
  const viewerTitle = caseRecord || selectedFile ? report.evidenceLabel : "Evidence viewer";
  const hasEvidence = Boolean(caseRecord || selectedFile);

  function isAcceptedFile(file: File) {
    return acceptedFileTypes.includes(file.type) || /\.(png|jpe?g|webp|pdf)$/i.test(file.name);
  }

  function handleSelectedFile(file: File | null) {
    if (!file) {
      setUploadError(null);
      onFileSelect(null);
      return;
    }

    if (!isAcceptedFile(file)) {
      setUploadError("Unsupported evidence type. Upload a PNG, JPG, WEBP, or PDF for mock review.");
      onFileSelect(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploadError(null);
    onFileSelect(file);
  }

  function handleResetSelection() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsDragging(false);
    setUploadError(null);
    onReset();
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (isAnalyzing) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    if (droppedFile) {
      handleSelectedFile(droppedFile);
    }
  }

  return (
    <section className="cg-forensic-panel rounded-[1.35rem] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cg-cyan)]">
            Evidence
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Evidence under review</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cg-text-muted)]">
            Inspect the submitted receipt, screenshot, PDF, or product photo in the scan frame.
          </p>
        </div>
        <span className="cg-security-badge rounded-full px-3 py-1 text-xs font-semibold">
          Mock analysis only
        </span>
      </div>

      <input
        ref={fileInputRef}
        className="sr-only"
        type="file"
        accept={acceptedTypes}
        disabled={isAnalyzing}
        onChange={(event) => handleSelectedFile(event.currentTarget.files?.[0] ?? null)}
      />

      <div className="mt-5 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-[var(--cg-border-strong)] bg-[#020713]/70 p-3 shadow-[var(--cg-shadow-blue)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--cg-text-muted)]">
                {evidenceId}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">{viewerTitle}</h3>
            </div>
            <div className="flex items-center gap-1.5">
              {[Minus, Plus, RotateCw, Maximize2].map((Icon, index) => (
                <button
                  className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-[var(--cg-text-muted)] transition hover:border-[var(--cg-border-strong)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cg-cyan)]"
                  type="button"
                  aria-label={["Zoom out", "Zoom in", "Rotate preview", "Open full evidence preview"][index]}
                  key={index}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#07101d]">
            <div className="pointer-events-none absolute inset-x-5 top-0 z-10 flex justify-between text-[9px] font-semibold text-[var(--cg-cyan)]/50">
              {Array.from({ length: 11 }, (_, index) => (
                <span className="h-3 border-l border-[var(--cg-cyan)]/35 pl-1" key={index}>
                  {index}
                </span>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-5 left-0 z-10 grid content-between text-[9px] font-semibold text-[var(--cg-cyan)]/50">
              {Array.from({ length: 7 }, (_, index) => (
                <span className="w-5 border-t border-[var(--cg-cyan)]/35 pt-1 text-right" key={index}>
                  {index}
                </span>
              ))}
            </div>

            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[88px_minmax(0,1fr)]">
              <div className="grid content-start gap-3">
                {[viewerFileName, caseRecord?.ticket.uploadedFile ?? "damage-photo.jpg", "Add files"].map((item, index) => (
                  <button
                    className={`min-h-24 rounded-lg border p-2 text-xs transition ${
                      index === 0
                        ? "border-[var(--cg-blue)] bg-[rgba(24,183,255,0.16)] text-white"
                        : index === 2
                          ? "border-dashed border-white/18 bg-transparent text-[var(--cg-text-muted)] hover:border-[var(--cg-border-strong)]"
                          : "border-white/10 bg-white/[0.04] text-[var(--cg-text-muted)] hover:border-white/20"
                    }`}
                    type="button"
                    key={`${item}-${index}`}
                  >
                    {index === 2 ? (
                      <span className="grid h-full place-items-center">+<br />Add files</span>
                    ) : (
                      <span className="block">
                        <span className="mx-auto mb-2 block h-14 rounded bg-[#d9ded6]/80" />
                        <span className="line-clamp-2 break-words">{index === 0 ? "Primary" : "Photo"}</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div>
              {hasEvidence ? (
                <div className="mx-auto max-w-lg">
                  <div
                    className={`relative min-h-[360px] overflow-hidden rounded-xl ${
                      report.evidenceType === "damage-photo"
                        ? "border border-[rgba(53,217,255,0.34)] bg-[radial-gradient(circle_at_35%_35%,rgba(148,163,184,0.36),transparent_22%),linear-gradient(135deg,#273447,#0d1725)]"
                        : "cg-ticket-paper"
                    } p-5`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,rgba(53,217,255,0.12)_50%,transparent_100%)] opacity-20" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={report.evidenceType === "damage-photo" ? "text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80" : "text-xs font-bold uppercase tracking-[0.18em] text-[#526175]"}>
                            {viewerFileName}
                          </p>
                          <p className={report.evidenceType === "damage-photo" ? "mt-2 text-2xl font-semibold text-white" : "mt-2 text-2xl font-bold text-[var(--cg-text-paper)]"}>
                            {report.evidenceType === "damage-photo" ? "Product damage image" : "Purchase evidence"}
                          </p>
                        </div>
                        <span className={report.evidenceType === "damage-photo" ? "rounded-md border border-cyan-200/25 bg-cyan-200/10 px-2 py-1 text-xs font-bold text-cyan-100" : "rounded-md border border-[rgba(20,33,51,0.14)] bg-white/60 px-2 py-1 text-xs font-bold text-[#526175]"}>
                          {report.reviewLabel}
                        </span>
                      </div>

                      {report.evidenceType === "damage-photo" ? (
                        <div className="mt-8 grid min-h-48 place-items-center rounded-lg border border-dashed border-cyan-200/28 bg-black/16">
                          <div className="text-center">
                            <FileImage className="mx-auto size-12 text-[var(--cg-cyan)]" aria-hidden="true" />
                            <p className="mt-3 text-sm font-semibold text-white">Damage area marked for manual review</p>
                            <p className="mt-1 text-xs text-cyan-100/70">Request wider product context before resolution.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-8 space-y-3 font-mono text-sm text-[#344155]">
                          <div className="h-3 w-2/3 rounded bg-[#142133]/18" />
                          <div className="h-3 w-11/12 rounded bg-[#142133]/16" />
                          <div className="h-3 w-10/12 rounded bg-[#142133]/16" />
                          <div className="my-6 border-t border-dashed border-[#142133]/18" />
                          <div className="grid grid-cols-2 gap-3">
                            <span>Order</span>
                            <span className="text-right font-bold">{caseRecord?.ticket.orderNumber ?? "Pending match"}</span>
                            <span>Total/date</span>
                            <span className="text-right font-bold">Requires verification</span>
                            <span>Source</span>
                            <span className="text-right font-bold">{caseRecord?.ticket.purchaseChannel ?? "Local upload"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  className={`grid min-h-[360px] w-full cursor-pointer place-items-center rounded-xl border border-dashed px-5 py-6 text-center transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cg-cyan)] ${
                    isDragging
                      ? "border-[var(--cg-cyan)] bg-[rgba(24,183,255,0.14)]"
                      : "border-[var(--cg-border-strong)] bg-[#06101f]/68 hover:bg-[#0b1728]"
                  } ${isAnalyzing ? "cursor-not-allowed opacity-70" : ""}`}
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    if (!isAnalyzing) {
                      setIsDragging(true);
                    }
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={handleDrop}
                >
                  <span>
                    <UploadCloud className="mx-auto size-12 text-[var(--cg-cyan)]" aria-hidden="true" />
                    <span className="mt-4 block text-lg font-semibold text-white">
                      {isDragging ? "Release to attach evidence" : "Drop evidence into the scan frame"}
                    </span>
                    <span className="mt-2 block max-w-md text-sm leading-6 text-[var(--cg-text-muted)]">
                      Receipts, product photos, screenshots, and PDFs appear here as inspected evidence.
                    </span>
                  </span>
                </button>
              )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[rgba(74,222,128,0.28)] bg-[rgba(74,222,128,0.1)] px-3 py-2 font-semibold text-[var(--cg-green)]">
                <Fingerprint className="size-4" aria-hidden="true" />
                Document detected: {report.evidenceLabel}
              </span>
              <span className="font-mono text-[var(--cg-text-muted)]">{hashValue}</span>
            </div>
          </div>
        </div>

        <aside className="grid content-start gap-3">
          <div className="rounded-2xl border border-[var(--cg-border)] bg-[#06101f]/62 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cg-text-muted)]">
              File metadata
            </p>
            <dl className="mt-3 space-y-3 text-sm">
              {[
                { label: "Evidence ID", value: evidenceId },
                { label: "Uploaded", value: uploadedAt },
                { label: "Type", value: evidenceLabel },
                { label: "Details", value: viewerFileDetails },
                { label: "Hash", value: hashValue },
              ].map((item) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3" key={item.label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--cg-text-muted)]">{item.label}</dt>
                  <dd className="mt-1 break-words font-mono text-xs text-[var(--cg-text-soft)]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {selectedFile ? (
            <button
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-left text-sm font-semibold text-[var(--cg-text-soft)] transition hover:border-[var(--cg-border-strong)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={handleResetSelection}
              disabled={isAnalyzing}
            >
              Remove local evidence
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              className="flex items-center justify-between rounded-xl border border-[var(--cg-border-strong)] bg-[rgba(24,183,255,0.1)] px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-[rgba(24,183,255,0.16)]"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Attach new evidence
              <UploadCloud className="size-4" aria-hidden="true" />
            </button>
          )}
        </aside>
      </div>

      {uploadError ? (
        <div className="mt-5 rounded-2xl border border-[rgba(251,113,133,0.42)] bg-[rgba(251,113,133,0.12)] p-4 text-sm leading-6 text-rose-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--cg-red)]" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Evidence upload needs attention</p>
              <p className="mt-1 text-rose-100/85">{uploadError}</p>
            </div>
          </div>
        </div>
      ) : null}

      {isAnalyzing ? (
        <div className="mt-5 rounded-2xl border border-[var(--cg-border-strong)] bg-[#06101f]/78 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="size-4 shrink-0 animate-spin text-[var(--cg-cyan)]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Evidence review in progress</p>
              <p className="mt-1 truncate text-xs text-[var(--cg-text-muted)]">{currentStep}</p>
            </div>
            <ScanLine className="size-5 text-[var(--cg-green)]" aria-hidden="true" />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#13243a]">
            <div className="h-full w-2/3 rounded-full cg-brand-gradient" />
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-[220px_1fr]">
        <button
          className="cg-primary-button inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed"
          type="button"
          onClick={onRunAnalysis}
          disabled={!canAnalyze}
        >
          {isAnalyzing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {actionLabel}
        </button>

        <div className="rounded-xl border border-[var(--cg-border)] bg-[#06101f]/64 px-4 py-3 text-xs leading-5 text-[var(--cg-text-muted)]">
          <span className="inline-flex items-center gap-2 font-semibold text-[var(--cg-text-soft)]">
            <Fingerprint className="size-3.5 text-[var(--cg-cyan)]" aria-hidden="true" />
            Current state:
          </span>{" "}
          {status === "idle"
            ? hasEvidence
              ? "Selected case evidence is loaded in the scan frame."
              : "Attach evidence or open a case from the queue."
            : status === "uploaded"
              ? `${evidenceLabel} selected. Ready for local mock analysis.`
              : status === "analyzing"
                ? currentStep
                : "Mock report complete. Use results as review guidance only."}
        </div>
      </div>
    </section>
  );
}
