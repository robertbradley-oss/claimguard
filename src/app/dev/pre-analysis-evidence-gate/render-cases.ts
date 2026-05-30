import type { PreAnalysisEvidenceGateDecision } from "@/lib/analysis/pre-analysis-evidence-gate";

// Dev-only, synthetic review fixtures for the pre-analysis evidence gate harness.
//
// These are literal, hand-authored decisions that mirror what the gate builder
// would produce. The gate builder is NOT value-imported and is NOT called at
// render time, so this dev surface can never be mistaken for runtime gate
// execution. No real files, photos, metadata, identifiers, object URLs, or
// handles appear here.

export type PreAnalysisEvidenceGateReviewCase = {
  key: string;
  title: string;
  hintLabel: string;
  decision: PreAnalysisEvidenceGateDecision;
};

const COMMON_LIMITATIONS = [
  "Decision-only pre-analysis evidence gate; no OCR, metadata inspection, analyzer, adapter, or report mapping was invoked.",
  "Decision is based on synthetic filename, type, and category hints only.",
  "Product-photo runtime remains non-live and manual-review-only.",
];

const NO_LIVE_MARKERS = {
  boundary: "pre-analysis-evidence-gate",
  devOnly: true,
  productPhotoRuntimeLive: false,
  runtimeLive: false,
  manualReviewOnly: true,
  ocrInvoked: false,
  metadataInvoked: false,
  analyzerInvoked: false,
  adapterInvoked: false,
  uiUploadReportScoringParserFixturePathsInvoked: false,
  providersStorageIntegrationsCaseQueuesInvoked: false,
} as const;

export const preAnalysisEvidenceGateReviewCases: readonly PreAnalysisEvidenceGateReviewCase[] = [
  {
    key: "receipt-image-allow",
    title: "Receipt-style image hint",
    hintLabel: "Synthetic receipt-style image hint",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "allow-receipt-default-path",
      allowReceiptDefaultPath: true,
      reasons: ["receipt-style filename cue preserved on the receipt/default path"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Receipt, PDF receipt, and order-screenshot handling may continue on the existing receipt/default path unchanged.",
      ],
    },
  },
  {
    key: "pdf-receipt-allow",
    title: "PDF receipt-style hint",
    hintLabel: "Synthetic PDF receipt-style hint",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "allow-receipt-default-path",
      allowReceiptDefaultPath: true,
      reasons: ["pdf-style hint preserved on the receipt/default path"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Receipt, PDF receipt, and order-screenshot handling may continue on the existing receipt/default path unchanged.",
      ],
    },
  },
  {
    key: "order-screenshot-allow",
    title: "Order screenshot-style hint",
    hintLabel: "Synthetic order-screenshot-style hint",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "allow-receipt-default-path",
      allowReceiptDefaultPath: true,
      reasons: ["screenshot-style hint preserved on the receipt/default path"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Receipt, PDF receipt, and order-screenshot handling may continue on the existing receipt/default path unchanged.",
      ],
    },
  },
  {
    key: "product-photo-like-unsupported",
    title: "Product-photo-like image hint",
    hintLabel: "Synthetic product-photo-like image hint",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "product-photo-like-unsupported",
      allowReceiptDefaultPath: false,
      reasons: ["image-like hint with product-photo filename cue"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Input appears product-photo-like; product-photo runtime is non-live, so no OCR/metadata should run and manual review is recommended.",
      ],
    },
  },
  {
    key: "legacy-damage-photo-quarantine",
    title: "Legacy damage-photo hint",
    hintLabel: "Synthetic legacy damage-photo compatibility hint",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "legacy-damage-photo-quarantine",
      allowReceiptDefaultPath: false,
      legacyCompatibility: {
        alias: "damage-photo",
        canonicalEvidenceType: "product-photo",
        quarantined: true,
        runtimeCandidate: false,
      },
      reasons: ["legacy damage-photo filename cue"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Legacy damage-photo compatibility input is quarantined and remains non-canonical; it should be routed to manual review only.",
      ],
    },
  },
  {
    key: "unsupported-evidence",
    title: "Unsupported media-type hint",
    hintLabel: "Synthetic unsupported media-type hint",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "unsupported-evidence",
      allowReceiptDefaultPath: false,
      reasons: ["unsupported synthetic media-type hint"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Input is unsupported for the current live receipt analyzer and should be routed to manual review only.",
      ],
    },
  },
  {
    key: "unknown-inconclusive",
    title: "Unknown image hint",
    hintLabel: "Synthetic image hint without a receipt, screenshot, or product-photo cue",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "unknown-inconclusive",
      allowReceiptDefaultPath: false,
      reasons: ["image-like hint without receipt, screenshot, or product-photo cue"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Lightweight hints are insufficient to classify the input before analysis; receipt behavior is preserved and manual review is recommended.",
      ],
    },
  },
  {
    key: "hostile-sentinel-omission",
    title: "Hostile sentinel hint (raw value omitted)",
    hintLabel:
      "Synthetic hostile hint with a private sentinel name; the decision below carries only generic reasons and no raw value",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "legacy-damage-photo-quarantine",
      allowReceiptDefaultPath: false,
      legacyCompatibility: {
        alias: "damage-photo",
        canonicalEvidenceType: "product-photo",
        quarantined: true,
        runtimeCandidate: false,
      },
      reasons: ["legacy damage-photo filename cue"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Raw filenames and private values are never echoed; only generic, privacy-safe reasons are returned.",
      ],
    },
  },
  {
    key: "long-text-layout-stress",
    title: "Long-text layout stress",
    hintLabel:
      "Synthetic long-text layout stress case used only to verify wrapping, spacing, and scan-ability of reasons and limitations across desktop and mobile widths without any real evidence content",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "unknown-inconclusive",
      allowReceiptDefaultPath: false,
      reasons: ["image-like hint without receipt, screenshot, or product-photo cue"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Lightweight hints are insufficient to classify the input before analysis; receipt behavior is preserved and manual review is recommended.",
        "This intentionally long synthetic limitation string exists only to stress test layout wrapping and spacing so reviewers can confirm long decision text remains readable, does not overflow horizontally, does not overlap neighbouring content, and does not introduce nested primary scrolling on either desktop or mobile widths.",
      ],
    },
  },
  {
    key: "manual-review-only-no-live-marker",
    title: "Manual-review-only no-live marker",
    hintLabel: "Synthetic case emphasizing the no-live and manual-review-only markers",
    decision: {
      ...NO_LIVE_MARKERS,
      outcome: "product-photo-like-unsupported",
      allowReceiptDefaultPath: false,
      reasons: ["explicit product-photo-like synthetic hint"],
      limitations: [
        ...COMMON_LIMITATIONS,
        "Input appears product-photo-like; product-photo runtime is non-live, so no OCR/metadata should run and manual review is recommended.",
      ],
    },
  },
];
