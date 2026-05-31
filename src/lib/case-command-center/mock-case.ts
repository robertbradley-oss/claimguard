export type CaseWorkflowStatus =
  | "Evidence review"
  | "Needs more information"
  | "Manual review"
  | "Ready for support decision"
  | "Escalated";

export type CaseAttentionLevel = "Low attention" | "Review signals" | "Manual review recommended";

export type CaseEvidenceType =
  | "Receipt"
  | "Order screenshot"
  | "Shipping confirmation"
  | "Customer message"
  | "Product-photo-like unsupported";

export type CaseEvidenceReviewState =
  | "Receipt analysis complete"
  | "Needs clearer copy"
  | "Context only"
  | "Unsupported manual review";

export type CaseEvidenceItem = {
  key: string;
  type: CaseEvidenceType;
  title: string;
  reviewState: CaseEvidenceReviewState;
  attentionLevel: CaseAttentionLevel;
  safeSummary: string;
  limitations: readonly string[];
  signals: readonly string[];
  recommendedReviewerAction: string;
  externalVerification: "Not performed";
  verificationStatus: "Not externally verified";
  noLiveAnalysis?: {
    ocrInvoked: false;
    metadataInvoked: false;
    productPhotoRuntimeLive: false;
    productPhotoReviewPanelRouted: false;
  };
};

export type CaseTimelineEvent = {
  key: string;
  label: string;
  timestamp: string;
  actor: string;
  detail: string;
};

export type CaseReviewSummary = {
  evidenceReviewed: string;
  missingInformation: readonly string[];
  manualReviewDrivers: readonly string[];
  recommendedSupportAction: string;
};

export type ClaimGuardLocalCase = {
  caseRef: string;
  workflowStatus: CaseWorkflowStatus;
  attentionLevel: CaseAttentionLevel;
  privacyPosture: string;
  customerClaimSummary: string;
  evidenceItems: readonly CaseEvidenceItem[];
  reviewSummary: CaseReviewSummary;
  internalNotesPlaceholder: readonly string[];
  customerSafeWordingDraft: string;
  timeline: readonly CaseTimelineEvent[];
};

export const phase32MockCase: ClaimGuardLocalCase = {
  caseRef: "Local case alpha",
  workflowStatus: "Manual review",
  attentionLevel: "Manual review recommended",
  privacyPosture: "Synthetic local review state only. No customer evidence is stored by this shell.",
  customerClaimSummary:
    "Customer reports a shipment concern and submitted mixed evidence for support review. Details are intentionally redacted in this local shell.",
  evidenceItems: [
    {
      key: "receipt-summary",
      type: "Receipt",
      title: "Receipt review summary",
      reviewState: "Receipt analysis complete",
      attentionLevel: "Review signals",
      safeSummary:
        "Local receipt analysis summary is represented as a case evidence item without changing the receipt analyzer.",
      limitations: [
        "External Verification: Not performed",
        "Verification Status: Not externally verified",
        "Score reflects local evidence quality and internal consistency only",
      ],
      signals: [
        "Review signal: extracted fields are present enough for support review",
        "Review signal: manual policy check still required",
      ],
      recommendedReviewerAction:
        "Compare the receipt summary with support policy and other available case evidence.",
      externalVerification: "Not performed",
      verificationStatus: "Not externally verified",
    },
    {
      key: "order-context",
      type: "Order screenshot",
      title: "Order context screenshot",
      reviewState: "Needs clearer copy",
      attentionLevel: "Review signals",
      safeSummary:
        "Screenshot context is included as local reviewer context only and is not treated as external verification.",
      limitations: [
        "No provider lookup was performed",
        "No raw screenshot or private order details are represented",
        "Needs manual review before support action",
      ],
      signals: [
        "Review signal: screenshot context may help compare dates and item context",
        "Needs clearer evidence if the support team cannot read the submitted copy",
      ],
      recommendedReviewerAction:
        "Request a clearer copy if the submitted context is not readable enough for policy review.",
      externalVerification: "Not performed",
      verificationStatus: "Not externally verified",
    },
    {
      key: "photo-unsupported",
      type: "Product-photo-like unsupported",
      title: "Product-photo-like evidence",
      reviewState: "Unsupported manual review",
      attentionLevel: "Manual review recommended",
      safeSummary:
        "This evidence type is represented as unsupported/manual-review-only. No automated analysis result was produced for this evidence item.",
      limitations: [
        "OCR was not run for this evidence item",
        "Metadata processing was not run for this evidence item",
        "Product-photo runtime is not live",
        "ProductPhotoReviewPanel is not routed",
      ],
      signals: [
        "Manual review recommended before action",
        "Could not be verified from available evidence in this local shell",
      ],
      recommendedReviewerAction:
        "Use support policy and available evidence, or request eligible receipt evidence if needed.",
      externalVerification: "Not performed",
      verificationStatus: "Not externally verified",
      noLiveAnalysis: {
        ocrInvoked: false,
        metadataInvoked: false,
        productPhotoRuntimeLive: false,
        productPhotoReviewPanelRouted: false,
      },
    },
    {
      key: "customer-message",
      type: "Customer message",
      title: "Customer context summary",
      reviewState: "Context only",
      attentionLevel: "Low attention",
      safeSummary:
        "Message context is summarized for reviewer orientation only and is kept separate from customer-safe response wording.",
      limitations: [
        "No private message text is stored in the mock case",
        "Context does not replace evidence review",
      ],
      signals: [
        "Review signal: customer context may explain what additional information to request",
        "Manual decision remains reviewer-entered",
      ],
      recommendedReviewerAction:
        "Use the context to choose the next support question without copying internal notes to the customer.",
      externalVerification: "Not performed",
      verificationStatus: "Not externally verified",
    },
  ],
  reviewSummary: {
    evidenceReviewed: "Four synthetic evidence items are staged for local case review.",
    missingInformation: [
      "Clearer eligible receipt copy may be needed if support policy requires it",
      "External order verification is not connected",
      "Unsupported evidence requires manual review outside automated analysis",
    ],
    manualReviewDrivers: [
      "Mixed evidence types in one case",
      "Unsupported product-photo-like evidence is not live-analyzed",
      "Support action should remain separate from local review signals",
    ],
    recommendedSupportAction:
      "Continue manual review, compare eligible receipt context with policy, and request clearer evidence if needed.",
  },
  internalNotesPlaceholder: [
    "Internal note placeholder: summarize reviewer observations without raw evidence details.",
    "Manual decision placeholder: keep human-entered status separate from automated review signals.",
  ],
  customerSafeWordingDraft:
    "Thanks for sending the information. We are reviewing the available evidence and may ask for a clearer receipt or additional context if it is needed to complete the support review.",
  timeline: [
    {
      key: "case-opened",
      label: "Case opened",
      timestamp: "Local mock time",
      actor: "Reviewer",
      detail: "Synthetic case shell loaded with redacted summary fields.",
    },
    {
      key: "receipt-summarized",
      label: "Receipt summary staged",
      timestamp: "Local mock time",
      actor: "Reviewer",
      detail: "Receipt evidence represented as a privacy-safe local summary.",
    },
    {
      key: "unsupported-stopped",
      label: "Unsupported evidence marked",
      timestamp: "Local mock time",
      actor: "ClaimGuard shell",
      detail: "Product-photo-like evidence remains manual-review-only and not live-analyzed.",
    },
    {
      key: "wording-drafted",
      label: "Customer-safe wording drafted",
      timestamp: "Local mock time",
      actor: "Reviewer",
      detail: "Draft wording is separated from internal notes and avoids final automated disposition.",
    },
  ],
};
