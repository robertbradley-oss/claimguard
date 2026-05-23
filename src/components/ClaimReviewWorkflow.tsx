"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthenticityResultCard } from "@/components/AuthenticityResultCard";
import { UploadPanel } from "@/components/UploadPanel";
import {
  mockAnalysisSteps,
  mockAnalysisReports,
  type AnalysisStatus,
  type EvidenceType,
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

export function ClaimReviewWorkflow() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [activeAnalysisStep, setActiveAnalysisStep] = useState(0);
  const evidenceType = useMemo(() => getEvidenceType(selectedFile), [selectedFile]);
  const report = mockAnalysisReports[evidenceType];

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
    setStatus(file ? "uploaded" : "idle");
    setActiveAnalysisStep(0);
  }

  function handleReset() {
    setSelectedFile(null);
    setStatus("idle");
    setActiveAnalysisStep(0);
  }

  function handleRunAnalysis() {
    if (!selectedFile || status === "analyzing") {
      return;
    }

    setActiveAnalysisStep(0);
    setStatus("analyzing");
  }

  return (
    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(400px,1fr)]">
      <div>
        <UploadPanel
          selectedFile={selectedFile}
          status={status}
          hasCompletedReport={status === "complete"}
          evidenceLabel={selectedFile ? report.evidenceLabel : "Awaiting upload"}
          analysisSteps={mockAnalysisSteps}
          activeAnalysisStep={activeAnalysisStep}
          onFileSelect={handleFileSelect}
          onRunAnalysis={handleRunAnalysis}
          onReset={handleReset}
        />
      </div>

      <AuthenticityResultCard report={report} status={status} />
    </div>
  );
}
