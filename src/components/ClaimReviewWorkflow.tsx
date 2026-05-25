"use client";

/* eslint-disable @next/next/no-img-element -- Local object URL evidence previews cannot be optimized through next/image. */

import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  FileImage,
  FileJson,
  FileSearch,
  FileText,
  FileUp,
  Hash,
  ImageIcon,
  Layers,
  ListChecks,
  Loader2,
  MessageSquareText,
  ReceiptText,
  RotateCcw,
  ScanLine,
  ScanText,
  ShieldCheck,
  Type,
  UploadCloud,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  mockAnalysisReports,
  mockAnalysisSteps,
  type AnalysisStatus,
  type MockAnalysisReport,
  type RedFlag,
  type RiskLevel,
} from "@/lib/claim-data";
import { analyzeEvidenceFile, getEvidenceTypeFromFile } from "@/lib/analysis/analyzer";
import { renderPdfFirstPagePreview } from "@/lib/analysis/pdf-preview";
import { mapLocalAnalysisToReport } from "@/lib/analysis/report-adapter";
import type { LocalAnalysisResult } from "@/lib/analysis/types";
import { formatFileSize } from "@/lib/file-format";

type IconChip = {
  label: string;
  Icon: LucideIcon;
};

const acceptedFileTypeChips: IconChip[] = [
  { label: "Receipt photo", Icon: Camera },
  { label: "Order screenshot", Icon: FileImage },
  { label: "PDF receipt", Icon: FileText },
  { label: "Receipt image", Icon: ImageIcon },
];

const claimGuardCheckChips: IconChip[] = [
  { label: "OCR extraction", Icon: ScanText },
  { label: "Date consistency", Icon: CalendarCheck },
  { label: "Total consistency", Icon: Hash },
  { label: "Metadata review", Icon: Layers },
  { label: "Image quality", Icon: FileSearch },
  { label: "Font analysis", Icon: Type },
];

const analyzerReviewItems: IconChip[] = [
  { label: "Document structure", Icon: ReceiptText },
  { label: "Extracted fields", Icon: ListChecks },
  { label: "Image quality", Icon: FileImage },
  { label: "Consistency signals", Icon: ScanLine },
  { label: "Customer-safe wording", Icon: MessageSquareText },
];

const evidenceInputAccept = "image/*,.png,.jpg,.jpeg,.webp,.gif,.heic,.heif,.pdf,application/pdf";

const riskTone: Record<RiskLevel, string> = {
  Low: "cg-risk-low",
  Medium: "cg-risk-medium",
  High: "cg-risk-high",
};

function isSupportedEvidenceFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    /\.(pdf|png|jpe?g|webp|gif|heic|heif)$/i.test(file.name)
  );
}

function isPdfEvidenceFile(file: File | null) {
  return Boolean(file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")));
}

function copiedLabel(label: string, copyNotice: string | null) {
  return copyNotice === label ? <ClipboardCheck className="size-4" aria-hidden="true" /> : <Clipboard className="size-4" aria-hidden="true" />;
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

function buildSummary(report: MockAnalysisReport) {
  return [
    `${report.scoreLabel ?? "Evidence Reliability Score"}: ${report.score}/100`,
    `Verification Status: ${report.verificationStatus ?? "Not externally verified"}`,
    `External Verification: ${report.externalVerification ?? "Not performed"}`,
    `Risk level: ${report.riskLevel}`,
    `Confidence: ${report.confidenceLevel}`,
    `Recommendation: ${report.suggestedAction}`,
    `Top signals: ${report.redFlags.map((flag) => flag.label).join("; ") || "No material review signals detected."}`,
  ].join("\n");
}

function buildPrivacySafeExport(report: MockAnalysisReport, result: LocalAnalysisResult | null) {
  return JSON.stringify(
    {
      type: "privacy-safe-analysis-summary",
      scoreLabel: report.scoreLabel ?? "Evidence Reliability Score",
      score: report.score,
      riskLevel: report.riskLevel,
      confidenceLevel: report.confidenceLevel,
      reviewLabel: report.reviewLabel,
      verificationStatus: report.verificationStatus ?? "Not externally verified",
      externalVerification: report.externalVerification ?? "Not performed",
      evidenceType: report.evidenceType,
      sourceClassification: result
        ? {
            label: result.receipt.sourceClassification.label,
            confidence: result.receipt.sourceClassification.confidence,
          }
        : null,
      ocr: result
        ? {
            engine: result.ocr.engine,
            averageConfidence: result.ocr.averageConfidence,
            quality: result.ocr.quality.label,
            wordCount: result.ocr.quality.wordCount,
          }
        : null,
      parsedFieldPresence: result
        ? {
            merchant: Boolean(result.receipt.merchantName),
            orderNumber: Boolean(result.receipt.orderNumber),
            purchaseDate: Boolean(result.receipt.purchaseDate),
            total: Boolean(result.receipt.total),
            paymentMethod: Boolean(result.receipt.paymentMethod),
            lineItems: result.receipt.structure.hasLineItems,
            missingFieldCount: result.receipt.missingFields.length,
          }
        : null,
      topSignals: report.redFlags.map((flag) => ({
        label: flag.label,
        confidence: flag.confidence,
      })),
      recommendedSupportAction: report.suggestedAction,
      privacyNote:
        "This summary omits original filenames, raw OCR text, parsed private-bearing values, complete analyzer JSON, and customer identifiers.",
    },
    null,
    2,
  );
}

function FieldRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid gap-1 border-b border-[rgba(125,103,64,0.16)] py-3 last:border-b-0 sm:grid-cols-[190px_minmax(0,1fr)]">
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--cg-text-muted)]">{label}</dt>
      <dd className="break-words text-sm text-[var(--cg-text)]">{value || "Not extracted"}</dd>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-lg border border-[var(--cg-border)] bg-[rgba(255,253,247,0.78)] shadow-[0_14px_36px_rgba(77,62,36,0.06)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--cg-text)]">
        {title}
        <span className="text-[var(--cg-amber)] transition group-open:rotate-180">v</span>
      </summary>
      <div className="border-t border-[rgba(125,103,64,0.14)] px-4 py-4">{children}</div>
    </details>
  );
}

function EmptyDetail() {
  return <p className="text-sm text-[var(--cg-text-muted)]">Upload and analyze evidence to populate this section.</p>;
}

function Chip({ label, Icon }: IconChip) {
  return (
    <span className="cg-lab-chip inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs">
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

function AnalyzerReviewItem({ label, Icon }: IconChip) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-[rgba(235,229,218,0.72)] bg-[rgba(255,253,247,0.04)] px-3 py-2 text-sm text-[var(--cg-text-soft)]">
      <Icon className="size-4 shrink-0 text-[var(--cg-amber)]" aria-hidden="true" />
      <span>{label}</span>
    </li>
  );
}

function SignalItem({ signal, tone = "dark" }: { signal: RedFlag; tone?: "dark" | "light" }) {
  const isDark = tone === "dark";

  return (
    <li
      className={
        isDark
          ? "rounded-lg border border-[rgba(235,229,218,0.16)] bg-[rgba(255,253,247,0.05)] p-3"
          : "rounded-lg border border-[rgba(125,103,64,0.16)] bg-[rgba(255,253,247,0.78)] p-3"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-sm font-medium ${isDark ? "text-[var(--cg-dark-text)]" : "text-[var(--cg-text)]"}`}>{signal.label}</p>
        <span
          className={`rounded-md border px-2 py-1 text-xs ${
            isDark
              ? "border-[rgba(235,229,218,0.16)] text-[var(--cg-text-soft)]"
              : "border-[rgba(125,103,64,0.18)] text-[var(--cg-text-muted)]"
          }`}
        >
          {signal.confidence}
        </span>
      </div>
      <p className={`mt-2 text-sm leading-6 ${isDark ? "text-[var(--cg-dark-muted)]" : "text-[var(--cg-text-muted)]"}`}>{signal.detail}</p>
    </li>
  );
}

export function ClaimReviewWorkflow() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [activeAnalysisStep, setActiveAnalysisStep] = useState(0);
  const [localAnalysisResult, setLocalAnalysisResult] = useState<LocalAnalysisResult | null>(null);
  const [localReport, setLocalReport] = useState<MockAnalysisReport | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [isDraggingEvidence, setIsDraggingEvidence] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewError, setPdfPreviewError] = useState<string | null>(null);
  const [isPdfPreviewLoading, setIsPdfPreviewLoading] = useState(false);

  const evidenceType = useMemo(() => getEvidenceTypeFromFile(selectedFile), [selectedFile]);
  const report = localReport ?? mockAnalysisReports[evidenceType];
  const hasCompletedReport = status === "complete" && Boolean(localReport);
  const isAnalyzing = status === "analyzing";
  const shouldShowAnalysisDetails = hasCompletedReport && Boolean(localAnalysisResult);
  const isPdfFile = isPdfEvidenceFile(selectedFile);
  const currentStep = mockAnalysisSteps[activeAnalysisStep];
  const topSignals = hasCompletedReport ? report.redFlags.slice(0, 3) : [];
  const previewUrl = useMemo(
    () => (selectedFile?.type.startsWith("image/") ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );
  const visiblePreviewUrl = previewUrl ?? pdfPreviewUrl;
  const privacySafeExport = useMemo(
    () => buildPrivacySafeExport(report, hasCompletedReport ? localAnalysisResult : null),
    [hasCompletedReport, localAnalysisResult, report],
  );
  const uploadStatusLabel = isAnalyzing
    ? "Analyzing locally"
    : hasCompletedReport
      ? "Analysis complete"
      : selectedFile
        ? "Ready to analyze"
        : "Awaiting evidence";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!selectedFile || !isPdfFile) {
      return;
    }

    let isCancelled = false;
    let nextPreviewUrl: string | null = null;

    renderPdfFirstPagePreview(selectedFile)
      .then((preview) => {
        nextPreviewUrl = preview.objectUrl;
        if (isCancelled) {
          URL.revokeObjectURL(preview.objectUrl);
          return;
        }

        setPdfPreviewUrl(preview.objectUrl);
      })
      .catch((error) => {
        console.error(error);
        if (!isCancelled) {
          setPdfPreviewError("PDF preview could not render in this browser. Local analysis can still run.");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsPdfPreviewLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      if (nextPreviewUrl) {
        URL.revokeObjectURL(nextPreviewUrl);
      }
    };
  }, [isPdfFile, selectedFile]);

  function handleFileSelect(file: File | null) {
    if (!file) {
      return;
    }

    if (!isSupportedEvidenceFile(file)) {
      setUploadError("Use a receipt image, order screenshot, or PDF receipt.");
      return;
    }

    const isPdf = isPdfEvidenceFile(file);
    setSelectedFile(file);
    setLocalAnalysisResult(null);
    setLocalReport(null);
    setAnalysisError(null);
    setUploadError(null);
    setPdfPreviewUrl(null);
    setPdfPreviewError(null);
    setIsPdfPreviewLoading(isPdf);
    setStatus("uploaded");
    setActiveAnalysisStep(0);
    setCopyNotice(null);
  }

  function triggerFilePicker() {
    inputRef.current?.click();
  }

  function handleUploadKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      triggerFilePicker();
    }
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (Array.from(event.dataTransfer.types).includes("Files")) {
      setIsDraggingEvidence(true);
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    if (!isDraggingEvidence) {
      setIsDraggingEvidence(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setIsDraggingEvidence(false);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingEvidence(false);
    handleFileSelect(event.dataTransfer.files.item(0));
  }

  function handleReset() {
    setSelectedFile(null);
    setLocalAnalysisResult(null);
    setLocalReport(null);
    setAnalysisError(null);
    setUploadError(null);
    setPdfPreviewUrl(null);
    setPdfPreviewError(null);
    setIsPdfPreviewLoading(false);
    setStatus("idle");
    setActiveAnalysisStep(0);
    setCopyNotice(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleRunAnalysis() {
    if (!selectedFile || isAnalyzing) {
      return;
    }

    setLocalAnalysisResult(null);
    setLocalReport(null);
    setAnalysisError(null);
    setActiveAnalysisStep(0);
    setStatus("analyzing");

    const stepTimer = window.setInterval(() => {
      setActiveAnalysisStep((current) => Math.min(current + 1, mockAnalysisSteps.length - 1));
    }, 900);

    try {
      const result = await analyzeEvidenceFile(selectedFile);
      setLocalAnalysisResult(result);
      setLocalReport(mapLocalAnalysisToReport(result));
      setActiveAnalysisStep(mockAnalysisSteps.length - 1);
      setStatus("complete");
    } catch (error) {
      console.error(error);
      setAnalysisError("Local analysis could not complete. Try a clearer image, a smaller PDF, or another evidence file.");
      setStatus("uploaded");
      setActiveAnalysisStep(0);
    } finally {
      window.clearInterval(stepTimer);
    }
  }

  async function handleCopy(label: string, text: string) {
    await copyTextToClipboard(text);
    setCopyNotice(label);
    window.setTimeout(() => setCopyNotice(null), 1800);
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-[1344px] content-start gap-3 px-4 pb-6 sm:px-6">
      <header className="-mx-4 flex min-h-[58px] items-center justify-between gap-4 border-b border-[rgba(125,103,64,0.16)] px-4 sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-6 shrink-0">
            <Image className="object-contain" src="/brand/claimguard-logo-mark.png" alt="ClaimGuard" fill priority sizes="24px" />
          </div>
          <div className="cg-phase-badge inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Phase 1 Receipt Authenticity Analyzer</span>
          </div>
        </div>
        <div className="cg-privacy-pill hidden rounded-full px-4 py-2 text-sm sm:block">
          Local browser analysis only. No customer evidence is stored by default.
        </div>
      </header>

      <section className="pt-5">
        <h1 className="text-2xl font-medium tracking-normal text-[var(--cg-text)]">Evidence analysis workspace</h1>
        <p className="mt-1 max-w-3xl text-sm leading-5 text-[var(--cg-text-muted)]">
          Upload one receipt, order screenshot, PDF, or evidence image and review the local analysis result.
        </p>
      </section>

      <div
        className="grid min-h-0 items-stretch gap-5 xl:h-[min(555px,calc(100vh-260px))] xl:min-h-[520px] xl:grid-cols-[minmax(0,1fr)_380px]"
        data-testid="analyzer-workspace-row"
      >
        <section
          className={`cg-evidence-surface flex min-h-0 flex-col rounded-lg p-3 transition ${isDraggingEvidence ? "cg-evidence-surface-active" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept={evidenceInputAccept}
            aria-label="Upload receipt, screenshot, or PDF receipt"
            onChange={(event) => {
              handleFileSelect(event.currentTarget.files?.item(0) ?? null);
              event.currentTarget.value = "";
            }}
          />
          {selectedFile ? (
            <div className="cg-module-header mb-3 flex flex-col gap-3 rounded-lg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-amber)]">Evidence Intake</p>
                <p className="mt-1 text-sm font-medium text-[var(--cg-text)]">Local evidence file selected</p>
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-[var(--cg-text-subtle)]">
                Accepted: JPG / PNG / PDF / screenshots
              </div>
            </div>
          ) : null}
          {!selectedFile ? (
            <div
              className="relative grid min-h-[510px] flex-1 cursor-pointer place-items-center p-6 text-center sm:min-h-[530px] xl:min-h-0"
              onClick={triggerFilePicker}
              onKeyDown={handleUploadKeyDown}
              role="button"
              tabIndex={0}
            >
              <div className="cg-scan-corners" aria-hidden="true" />
              <div className="mx-auto max-w-[620px]">
                <div className="mx-auto grid size-16 place-items-center rounded-xl border border-[rgba(143,93,45,0.24)] bg-[rgba(143,93,45,0.07)] text-[var(--cg-amber)]">
                  <UploadCloud className="size-8" aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-xl font-medium text-[var(--cg-text)]">
                  {isDraggingEvidence ? "Drop evidence to load it" : "Upload evidence to begin"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--cg-text-muted)]">
                  Drag and drop a file here, or choose evidence file.
                </p>
                <p className="mt-1 text-xs text-[var(--cg-text-subtle)]">Accepted file types: images, PDFs, screenshots.</p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {acceptedFileTypeChips.map((chip) => (
                    <Chip key={chip.label} {...chip} />
                  ))}
                </div>

                <div className="mt-5">
                  <button
                    className="cg-primary-button inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition"
                    onClick={(event) => {
                      event.stopPropagation();
                      triggerFilePicker();
                    }}
                    type="button"
                  >
                    <FileUp className="size-4" aria-hidden="true" />
                    Choose evidence file
                  </button>
                </div>

                <div className="mx-auto my-6 h-px max-w-[520px] bg-[rgba(125,103,64,0.16)]" />

                <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-text-subtle)]">What ClaimGuard checks</p>
                <div className="mx-auto mt-3 grid max-w-[450px] gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {claimGuardCheckChips.map((chip) => (
                    <Chip key={chip.label} {...chip} />
                  ))}
                </div>
                <p className="mx-auto mt-4 max-w-[390px] text-xs leading-5 text-[var(--cg-text-subtle)]">
                  ClaimGuard reviews evidence for potential inconsistencies and recommends manual review when needed.
                </p>
                {uploadError ? <p className="mt-4 text-sm font-medium text-[var(--cg-red)]">{uploadError}</p> : null}
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col gap-3">
              <div className="cg-scan-corners" aria-hidden="true" />
              <div
                className="flex flex-col gap-2 rounded-lg border border-[rgba(125,103,64,0.18)] bg-[rgba(255,253,247,0.9)] px-2.5 py-1.5 xl:flex-row xl:items-center xl:justify-between"
                data-testid="evidence-command-bar"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--cg-text)]" title="Original filename hidden">
                    Local evidence file
                  </p>
                  <p className="mt-0.5 truncate text-xs leading-4 text-[var(--cg-text-muted)]">
                    {formatFileSize(selectedFile.size)} | {selectedFile.type || "Unknown type"} | {report.evidenceLabel}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5 xl:flex-nowrap">
                  <span className="whitespace-nowrap rounded-md border border-[rgba(95,143,100,0.3)] bg-[rgba(95,143,100,0.08)] px-2.5 py-1.5 text-xs font-medium text-[var(--cg-green)]">
                    {uploadStatusLabel}
                  </span>
                  {hasCompletedReport ? (
                    <span className="whitespace-nowrap rounded-md border border-[rgba(95,143,100,0.3)] bg-[rgba(95,143,100,0.12)] px-2.5 py-1.5 text-xs font-medium text-[var(--cg-green)]">
                      Analysis Complete
                    </span>
                  ) : (
                    <button
                      className="cg-primary-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed"
                      disabled={isAnalyzing}
                      onClick={handleRunAnalysis}
                      type="button"
                    >
                      {isAnalyzing ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ScanLine className="size-4" aria-hidden="true" />}
                      {isAnalyzing ? "Analyzing Evidence" : "Run Local Analysis"}
                    </button>
                  )}
                  <button
                    className="whitespace-nowrap rounded-md border border-[var(--cg-border)] bg-[rgba(255,253,247,0.72)] px-2.5 py-1.5 text-xs font-medium text-[var(--cg-text)] transition hover:border-[var(--cg-border-strong)]"
                    onClick={triggerFilePicker}
                    type="button"
                  >
                    Replace file
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[var(--cg-border)] bg-[rgba(255,253,247,0.72)] px-2.5 py-1.5 text-xs font-medium text-[var(--cg-text)] transition hover:border-[var(--cg-border-strong)]"
                    onClick={handleReset}
                    type="button"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Analyze Another File
                  </button>
                </div>
              </div>

              {uploadError ? (
                <div className="rounded-lg border border-[rgba(170,78,69,0.32)] bg-[rgba(170,78,69,0.08)] p-3 text-sm font-medium text-[var(--cg-red)]">
                  {uploadError}
                </div>
              ) : null}

              <div
                className={`cg-preview-frame relative grid min-h-0 flex-1 place-items-center overflow-hidden rounded-lg border transition ${
                  isDraggingEvidence ? "border-[rgba(184,133,24,0.78)]" : "border-[rgba(125,103,64,0.22)]"
                }`}
                data-testid="evidence-preview-frame"
              >
                {visiblePreviewUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <img
                      className="h-full w-full object-contain"
                      src={visiblePreviewUrl}
                      alt={isPdfFile ? "First page preview of selected PDF receipt" : "Preview of selected receipt evidence"}
                      data-testid={isPdfFile ? "pdf-page-preview" : "image-evidence-preview"}
                    />
                  </div>
                ) : isPdfFile && isPdfPreviewLoading ? (
                  <div className="grid place-items-center gap-3 p-6 text-center">
                    <Loader2 className="size-10 animate-spin text-[var(--cg-amber)]" aria-hidden="true" />
                    <div>
                      <p className="text-base font-medium text-[var(--cg-text)]">Rendering PDF preview</p>
                      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--cg-text-muted)]">
                        ClaimGuard is preparing the first page for visual inspection.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid place-items-center gap-3 p-6 text-center">
                    {isPdfFile ? (
                      <FileText className="size-20 text-[var(--cg-amber)]" aria-hidden="true" />
                    ) : (
                      <ImageIcon className="size-20 text-[var(--cg-amber)]" aria-hidden="true" />
                    )}
                    <div>
                      <p className="text-base font-medium text-[var(--cg-text)]">
                        {isPdfFile ? "PDF preview could not render" : "Evidence preview unavailable"}
                      </p>
                      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--cg-text-muted)]">
                        {pdfPreviewError ?? "ClaimGuard can still run local OCR and document consistency checks on the selected file."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </section>

        <aside className="cg-analyzer-panel flex min-h-0 flex-col overflow-hidden rounded-lg p-4" data-testid="analyzer-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-amber)]">Analyzer result</p>
              <h2 className="mt-1 text-base font-medium text-[var(--cg-dark-text)]">
                {hasCompletedReport ? report.reviewLabel : selectedFile ? "Ready for local analysis" : "Awaiting evidence"}
              </h2>
            </div>
            <div
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                hasCompletedReport ? riskTone[report.riskLevel] : "border-[rgba(235,229,218,0.14)] bg-[rgba(255,253,247,0.06)] text-[var(--cg-dark-muted)]"
              }`}
            >
              {hasCompletedReport ? report.riskLevel : isAnalyzing ? "Analyzing" : selectedFile ? "Ready" : "Pending"}
            </div>
          </div>

          <div className="cg-analyzer-scroll mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {!selectedFile ? (
            <>
              <div className="mt-6 rounded-lg border border-[rgba(235,229,218,0.12)] bg-[rgba(255,253,247,0.05)] p-4">
                <p className="text-sm leading-6 text-[var(--cg-dark-text)]">
                  Upload one receipt, order screenshot, PDF, or claim image to begin.
                </p>
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-dark-subtle)]">Analyzer will review</p>
                <ul className="mt-3 grid gap-2">
                  {analyzerReviewItems.map((item) => (
                    <AnalyzerReviewItem key={item.label} {...item} />
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="mt-5 rounded-lg border border-[rgba(235,229,218,0.12)] bg-[rgba(255,253,247,0.05)] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-dark-subtle)]">Review recommendation</p>
                <p className="mt-2 text-sm leading-6 text-[var(--cg-dark-text)]">
                  {hasCompletedReport
                    ? report.suggestedAction
                    : isAnalyzing
                      ? currentStep.detail
                      : "Run local analysis to review document consistency, evidence quality, and support-safe next steps."}
                </p>
              </div>

              {isAnalyzing ? (
                <div className="mt-4 rounded-lg border border-[rgba(184,133,24,0.34)] bg-[rgba(184,133,24,0.08)] p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-5 animate-spin text-[var(--cg-amber)]" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-[var(--cg-dark-text)]">{currentStep.label}</p>
                      <p className="mt-1 text-xs text-[var(--cg-dark-muted)]">{currentStep.detail}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {analysisError ? (
                <div className="mt-4 rounded-lg border border-[rgba(170,78,69,0.45)] bg-[rgba(170,78,69,0.14)] p-4 text-sm text-[#ffd9d5]">
                  {analysisError}
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <div className="rounded-lg border border-[rgba(235,229,218,0.12)] bg-[rgba(255,253,247,0.05)] p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-dark-subtle)]">Evidence reliability</p>
                  <p className="mt-2 text-xl font-medium text-[var(--cg-dark-text)]">{hasCompletedReport ? report.score : "--"}</p>
                  <p className="mt-1 text-xs text-[var(--cg-dark-muted)]">local score / 100</p>
                </div>
                <div className="rounded-lg border border-[rgba(235,229,218,0.12)] bg-[rgba(255,253,247,0.05)] p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-dark-subtle)]">Risk level</p>
                  <p className="mt-2 text-lg font-medium text-[var(--cg-dark-text)]">{hasCompletedReport ? report.riskLevel : "Pending"}</p>
                  <p className="mt-2 text-xs text-[var(--cg-dark-muted)]">Review guidance only</p>
                </div>
                <div className="rounded-lg border border-[rgba(235,229,218,0.12)] bg-[rgba(255,253,247,0.05)] p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-dark-subtle)]">Confidence</p>
                  <p className="mt-2 text-lg font-medium text-[var(--cg-dark-text)]">
                    {hasCompletedReport ? report.confidenceLevel : "Pending"}
                  </p>
                  <p className="mt-2 text-xs text-[var(--cg-dark-muted)]">
                    {hasCompletedReport ? `${report.internalStructureConfidence ?? "--"}% structure` : "External verification not performed"}
                  </p>
                </div>
              </div>

              {hasCompletedReport ? (
                <>
                  <div className="mt-4 rounded-lg border border-[rgba(184,133,24,0.24)] bg-[rgba(184,133,24,0.08)] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-amber)]">Score meaning</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--cg-dark-muted)]">
                      {(report.scoreMeaning?.highScore ??
                        "High score means the receipt is readable and structurally consistent based on local evidence analysis.")}{" "}
                      {(report.scoreMeaning?.safetyNote ?? "High score does not prove the receipt is real.")}
                    </p>
                  </div>
                </>
              ) : null}

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-dark-subtle)]">Top detected signals</p>
                <ul className="mt-3 grid gap-3">
                  {topSignals.length > 0 ? (
                    topSignals.map((signal) => <SignalItem key={`${signal.label}-${signal.detail}`} signal={signal} />)
                  ) : (
                    <li className="rounded-lg border border-[rgba(235,229,218,0.12)] bg-[rgba(255,253,247,0.04)] p-3 text-sm leading-6 text-[var(--cg-dark-muted)]">
                      {hasCompletedReport ? "No material review signals detected beyond standard verification." : "Signals will appear after analysis."}
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-5 rounded-lg border border-[rgba(95,143,100,0.34)] bg-[rgba(95,143,100,0.12)] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#cfe6d0]">Customer-safe response snippet</p>
                <p className="mt-2 text-sm leading-6 text-[var(--cg-dark-text)]">
                  {hasCompletedReport ? report.customerSafeWording : "Customer-facing language will be generated after local analysis."}
                </p>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(235,229,218,0.16)] px-3 py-2 text-sm font-medium text-[var(--cg-dark-text)] transition hover:border-[rgba(235,229,218,0.38)] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!hasCompletedReport}
                  onClick={() => handleCopy("summary", buildSummary(report))}
                  type="button"
                >
                  {copiedLabel("summary", copyNotice)}
                  Copy Summary
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(235,229,218,0.16)] px-3 py-2 text-sm font-medium text-[var(--cg-dark-text)] transition hover:border-[rgba(235,229,218,0.38)] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!hasCompletedReport}
                  onClick={() => handleCopy("customer", report.customerSafeWording)}
                  type="button"
                >
                  {copiedLabel("customer", copyNotice)}
                  Copy Customer-Safe Response
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(235,229,218,0.16)] px-3 py-2 text-sm font-medium text-[var(--cg-dark-text)] transition hover:border-[rgba(235,229,218,0.38)] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!hasCompletedReport}
                  onClick={() => handleCopy("summary-json", privacySafeExport)}
                  type="button"
                >
                  <FileJson className="size-4" aria-hidden="true" />
                  Copy Safe Summary
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(235,229,218,0.16)] px-3 py-2 text-sm font-medium text-[var(--cg-dark-text)] transition hover:border-[rgba(235,229,218,0.38)]"
                  onClick={handleReset}
                  type="button"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Analyze Another File
                </button>
              </div>

            </>
          )}
          </div>
        </aside>
      </div>

      {shouldShowAnalysisDetails ? (
        <details className="cg-analysis-drawer group mb-8 rounded-lg" data-testid="analysis-details-drawer">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-amber)]">Analysis Details</p>
              <p className="mt-1 text-sm text-[var(--cg-text-muted)]">Review OCR metrics, metadata summaries, signals, notes, and privacy-safe export details.</p>
            </div>
            <span className="text-sm font-medium text-[var(--cg-text)] transition group-open:rotate-180">v</span>
          </summary>
          <div className="grid gap-3 border-t border-[rgba(125,103,64,0.14)] p-4">
            <DetailSection title="Extracted Data">
              {localAnalysisResult ? (
                <dl>
                  <FieldRow label="Source classification" value={`${localAnalysisResult.receipt.sourceClassification.label} (${localAnalysisResult.receipt.sourceClassification.confidence}%)`} />
                  <FieldRow label="Verification status" value={localAnalysisResult.verificationStatus.status} />
                  <FieldRow label="External verification" value={localAnalysisResult.externalVerification} />
                  <FieldRow label="Internal structure confidence" value={`${localAnalysisResult.internalStructureConfidence}%`} />
                  <FieldRow label="Merchant present" value={localAnalysisResult.receipt.merchantName ? "Detected" : "Not detected"} />
                  <FieldRow label="Order number present" value={localAnalysisResult.receipt.orderNumber ? "Detected" : "Not detected"} />
                  <FieldRow label="Purchase date present" value={localAnalysisResult.receipt.purchaseDate ? "Detected" : "Not detected"} />
                  <FieldRow label="Total present" value={localAnalysisResult.receipt.total ? "Detected" : "Not detected"} />
                  <FieldRow label="Payment method present" value={localAnalysisResult.receipt.paymentMethod ? "Detected" : "Not detected"} />
                  <FieldRow label="Missing fields" value={localAnalysisResult.receipt.missingFields.join(", ") || "None"} />
                </dl>
              ) : (
                <EmptyDetail />
              )}
            </DetailSection>

            <DetailSection title="Metadata">
              {localAnalysisResult ? (
                <dl>
                  <FieldRow label="Original filename" value="Hidden in UI" />
                  <FieldRow label="MIME type" value={localAnalysisResult.metadata.mimeType} />
                  <FieldRow label="File size" value={formatFileSize(localAnalysisResult.metadata.sizeBytes)} />
                  <FieldRow label="Metadata context" value={localAnalysisResult.metadata.context.summary} />
                  <FieldRow label="Metadata notes" value={localAnalysisResult.metadata.metadataNotes.join(" | ") || "None"} />
                </dl>
              ) : (
                <EmptyDetail />
              )}
            </DetailSection>

            <DetailSection title="OCR Details">
              {localAnalysisResult ? (
                <div className="grid gap-4">
                  <dl>
                    <FieldRow label="OCR engine" value={localAnalysisResult.ocr.engine} />
                    <FieldRow label="Average confidence" value={`${localAnalysisResult.ocr.averageConfidence}%`} />
                    <FieldRow label="Quality" value={localAnalysisResult.ocr.quality.label} />
                    <FieldRow label="Word count" value={localAnalysisResult.ocr.quality.wordCount} />
                  </dl>
                  <div className="rounded-lg border border-[rgba(125,103,64,0.16)] bg-[rgba(255,253,247,0.82)] p-4 text-sm leading-6 text-[var(--cg-text-muted)]">
                    Raw OCR text is intentionally hidden in the main analyzer. Use privacy-safe summaries for review notes.
                  </div>
                </div>
              ) : (
                <EmptyDetail />
              )}
            </DetailSection>

            <DetailSection title="Signal Breakdown">
              {hasCompletedReport ? (
                <div className="grid gap-4">
                  <p className="text-sm leading-6 text-[var(--cg-text-muted)]">{report.signalVsProof}</p>
                  <ul className="grid gap-3">
                    {report.redFlags.length > 0 ? report.redFlags.map((signal) => <SignalItem key={`${signal.label}-${signal.detail}`} signal={signal} tone="light" />) : <li className="text-sm text-[var(--cg-text-muted)]">No material review signals detected.</li>}
                  </ul>
                </div>
              ) : (
                <EmptyDetail />
              )}
            </DetailSection>

            <DetailSection title="Manual Review Notes">
              {hasCompletedReport ? (
                <div className="grid gap-4 text-sm leading-6 text-[var(--cg-text-muted)]">
                  <div className="rounded-lg border border-[rgba(95,143,100,0.24)] bg-[rgba(95,143,100,0.08)] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--cg-green)]">Customer-safe response</p>
                    <p className="mt-2 text-[var(--cg-text)]">{report.customerSafeWording}</p>
                  </div>
                  <p>{report.supportRecommendation}</p>
                  <ul className="grid gap-2">
                    {report.whatToVerifyNext.map((item) => (
                      <li className="flex gap-2" key={item}>
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-[var(--cg-green)]" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyDetail />
              )}
            </DetailSection>

            <DetailSection title="Export / Debug Info">
              {hasCompletedReport || localAnalysisResult ? (
                <div className="grid gap-4">
                  {hasCompletedReport ? (
                    <>
                      <button
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--cg-border)] bg-[rgba(255,253,247,0.72)] px-3 py-2 text-sm font-medium text-[var(--cg-text)] transition hover:border-[var(--cg-border-strong)]"
                        onClick={() => handleCopy("json-detail", privacySafeExport)}
                        type="button"
                      >
                        <FileJson className="size-4" aria-hidden="true" />
                        Copy Privacy-Safe Summary
                      </button>
                      <pre className="max-h-96 overflow-auto rounded-lg border border-[rgba(125,103,64,0.16)] bg-[rgba(255,253,247,0.82)] p-4 text-xs leading-5 text-[var(--cg-text-muted)]">
                        {privacySafeExport}
                      </pre>
                    </>
                  ) : null}

                  {localAnalysisResult ? (
                    <>
                      <div className="rounded-lg border border-[rgba(182,106,53,0.24)] bg-[rgba(182,106,53,0.08)] p-4 text-sm leading-6 text-[var(--cg-copper)]">
                        <AlertTriangle className="mr-2 inline size-4" aria-hidden="true" />
                        Debug values are for local tuning only and should not be shown as final customer determinations.
                      </div>
                      <dl>
                        <FieldRow label="Score label" value={localAnalysisResult.scoreLabel} />
                        <FieldRow label="Verification status" value={localAnalysisResult.verificationStatus.status} />
                        <FieldRow label="Score formula" value={localAnalysisResult.scoreBreakdown.formula} />
                        <FieldRow label="Signal penalty" value={localAnalysisResult.scoreBreakdown.signalPenalty} />
                        <FieldRow label="OCR penalty" value={localAnalysisResult.scoreBreakdown.ocrPenalty} />
                        <FieldRow label="Field bonus" value={localAnalysisResult.scoreBreakdown.fieldBonus} />
                        <FieldRow label="Interpretation" value={localAnalysisResult.scoreBreakdown.interpretation} />
                        <FieldRow label="Image quality" value={localAnalysisResult.imageHeuristics.qualitySummary} />
                      </dl>
                    </>
                  ) : null}
                </div>
              ) : (
                <EmptyDetail />
              )}
            </DetailSection>
          </div>
        </details>
      ) : null}
    </div>
  );
}
