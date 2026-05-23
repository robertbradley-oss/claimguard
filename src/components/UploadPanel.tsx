"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import {
  FileImage,
  FileText,
  Loader2,
  Play,
  UploadCloud,
  X,
} from "lucide-react";
import { formatFileSize } from "@/lib/file-format";
import type { AnalysisStatus, AnalysisStep } from "@/lib/claim-data";

const acceptedTypes = "image/png,image/jpeg,image/webp,application/pdf";

type UploadPanelProps = {
  selectedFile: File | null;
  status: AnalysisStatus;
  hasCompletedReport?: boolean;
  evidenceLabel: string;
  analysisSteps: AnalysisStep[];
  activeAnalysisStep: number;
  onFileSelect: (file: File | null) => void;
  onRunAnalysis: () => void;
  onReset: () => void;
};

export function UploadPanel({
  selectedFile,
  status,
  hasCompletedReport = false,
  evidenceLabel,
  analysisSteps,
  activeAnalysisStep,
  onFileSelect,
  onRunAnalysis,
  onReset,
}: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  function handleSelectedFile(file: File | null) {
    onFileSelect(file);
  }

  function handleResetSelection() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsDragging(false);
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
    <section className="cg-panel min-h-[520px] rounded-xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#00A7A5]">Evidence upload</p>
          <h2 className="mt-1 text-lg font-semibold text-[#061426]">Upload claim evidence</h2>
        </div>
        <span className="rounded-md border border-[#E4F0F7] bg-[#F8FCFF] px-2.5 py-1 text-xs font-medium text-slate-600">
          Mock analysis
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

      <button
        className={`mt-5 flex min-h-36 cursor-pointer items-center gap-4 rounded-xl border border-dashed px-5 py-6 text-left transition ${
          isDragging
            ? "border-[#08AEEA] bg-[#F7FBFF]"
            : "border-[#D5E8F3] bg-[#F8FCFF] hover:border-[#8DDAEB] hover:bg-white"
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
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white text-[#08AEEA] ring-1 ring-[#DDECF5]">
          <UploadCloud className="size-7" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-900">
            {isDragging ? "Release to attach evidence" : "Drop or choose a receipt, product photo, screenshot, or PDF"}
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            Local mock review only. PNG, JPG, WEBP, or PDF up to 25 MB.
          </span>
        </span>
      </button>

      {selectedFile && fileMeta ? (
        <div className="mt-5 rounded-xl border border-[#E4F0F7] bg-[#F8FCFF] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-[#00A7A5] ring-1 ring-[#DDECF5]">
              {selectedFile.type === "application/pdf" ? (
                <FileText className="size-5" aria-hidden="true" />
              ) : (
                <FileImage className="size-5" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">{fileMeta.name}</p>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                    status === "uploaded"
                      ? "bg-[#E9FFF0] text-[#0B5F2A] ring-1 ring-[#41D66F]/35"
                      : "bg-white text-slate-600 ring-1 ring-[#E4F0F7]"
                  }`}
                >
                  {status === "uploaded" ? "Ready to analyze" : status === "complete" ? "Analyzed" : "Selected"}
                </span>
              </div>
              <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Evidence type", value: evidenceLabel },
                  { label: "File type", value: fileMeta.type },
                  { label: "File size", value: fileMeta.size },
                ].map((item) => (
                  <div className="rounded-md bg-white px-3 py-2 ring-1 ring-[#E4F0F7]" key={item.label}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-xs font-semibold text-slate-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <button
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={handleResetSelection}
              aria-label="Remove selected file"
              disabled={isAnalyzing}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {isAnalyzing ? (
        <div className="mt-5 rounded-xl border border-[#E4F0F7] bg-white p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="size-4 shrink-0 animate-spin text-[#08AEEA]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Evidence review in progress</p>
              <p className="mt-1 truncate text-xs text-slate-500">{currentStep}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E4F0F7]">
            <div className="h-full w-2/3 rounded-full cg-brand-gradient" />
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          className="cg-primary-button inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed"
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

        <div className="rounded-md border border-[#E4F0F7] bg-[#F8FCFF] px-3 py-2 text-xs leading-5 text-slate-600 sm:flex-1">
          {status === "idle"
            ? "Select claim evidence to generate a support-safe mock report."
            : status === "uploaded"
              ? `${evidenceLabel} selected. Ready to analyze with local mock checks.`
              : status === "analyzing"
                ? currentStep
                : "Mock report complete. Use results as review guidance only."}
        </div>
      </div>
    </section>
  );
}
