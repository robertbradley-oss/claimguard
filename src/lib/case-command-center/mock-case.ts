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

export type CaseEvidenceBenchGroup =
  | "Reviewed receipt evidence"
  | "Needs clearer context"
  | "Manual-review-only evidence"
  | "Context for response planning";

export type CaseEvidenceMetadata = {
  label: string;
  value: string;
};

export type CaseEvidenceConnections = {
  timeline: string;
  manualReview: string;
  customerSafeWording: string;
};

export type CaseEvidenceItem = {
  key: string;
  type: CaseEvidenceType;
  typeLabel: string;
  title: string;
  benchGroup: CaseEvidenceBenchGroup;
  reviewState: CaseEvidenceReviewState;
  statusLabel: string;
  attentionLevel: CaseAttentionLevel;
  submittedContext: string;
  safeSummary: string;
  reviewContext: string;
  metadata: readonly CaseEvidenceMetadata[];
  limitations: readonly string[];
  signals: readonly string[];
  investigationFocus: readonly string[];
  nextStepCues: readonly string[];
  connections: CaseEvidenceConnections;
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

export type CaseTimelineCategory =
  | "Evidence added"
  | "Analysis completed"
  | "Manual review needed"
  | "Rep note drafted"
  | "Customer-safe wording prepared"
  | "Case status changed"
  | "Escalation marker";

export type CaseTimelineSeverity = "Informational" | "Complete" | "Needs review" | "Escalation";

export type CaseTimelineEvent = {
  key: string;
  category: CaseTimelineCategory;
  statusLabel: string;
  severity: CaseTimelineSeverity;
  timestamp: string;
  relativeTime: string;
  actor: string;
  detail: string;
  caseStatusAfter: CaseWorkflowStatus;
  relatedEvidenceKeys: readonly string[];
  reviewerImpact: string;
};

export type CaseManualDecisionTone = "Active review" | "Escalation path" | "Info needed" | "Safety hold";

export type CaseManualDecisionState = {
  key: string;
  label: string;
  tone: CaseManualDecisionTone;
  detail: string;
};

export type CaseManualReviewWorkspace = {
  summary: string;
  notSavedBoundary: string;
  decisionStates: readonly CaseManualDecisionState[];
  internalNotes: readonly string[];
  policyConsiderations: readonly string[];
  selectedEvidenceRationale: Record<string, readonly string[]>;
  customerSafeHandoff: string;
  timelineConnection: string;
};

export type CaseCustomerSafeWordingTone = "Neutral" | "Information request" | "Manual review" | "Policy review";

export type CaseCustomerSafeWordingVariant = {
  key: string;
  label: string;
  intent: string;
  tone: CaseCustomerSafeWordingTone;
  draft: string;
  whenToUse: string;
  avoids: readonly string[];
};

export type CaseCustomerSafeWordingModule = {
  status: string;
  summary: string;
  notSentBoundary: string;
  selectedEvidenceRationale: Record<string, string>;
  variants: readonly CaseCustomerSafeWordingVariant[];
  guardrails: readonly string[];
  repReviewChecklist: readonly string[];
  internalRationaleBoundary: string;
  timelineConnection: string;
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
  manualReviewWorkspace: CaseManualReviewWorkspace;
  customerSafeWordingModule: CaseCustomerSafeWordingModule;
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
      typeLabel: "Eligible receipt summary",
      title: "Receipt review summary",
      benchGroup: "Reviewed receipt evidence",
      reviewState: "Receipt analysis complete",
      statusLabel: "Local receipt summary available",
      attentionLevel: "Review signals",
      submittedContext:
        "Represented as an eligible receipt evidence summary for local support review.",
      safeSummary:
        "Local receipt analysis summary is represented as a case evidence item without changing the receipt analyzer.",
      reviewContext:
        "Use this item as the strongest eligible purchase-context signal, while keeping external verification and final support action separate.",
      metadata: [
        { label: "Evidence type", value: "Receipt" },
        { label: "Review state", value: "Receipt analysis complete" },
        { label: "Submitted context", value: "Eligible receipt evidence summary" },
        { label: "External verification", value: "Not performed" },
      ],
      limitations: [
        "External Verification: Not performed",
        "Verification Status: Not externally verified",
        "Score reflects local evidence quality and internal consistency only",
      ],
      signals: [
        "Review signal: extracted fields are present enough for support review",
        "Review signal: manual policy check still required",
      ],
      investigationFocus: [
        "Compare receipt context with screenshot context before requesting more information.",
        "Treat local score language as evidence reliability only, not a final case outcome.",
      ],
      nextStepCues: [
        "Check whether support policy requires a clearer eligible receipt copy.",
        "Use customer-safe wording if asking for additional eligible evidence.",
      ],
      connections: {
        timeline: "Linked to receipt summary added and receipt review summary complete events.",
        manualReview: "Feeds the manual-review comparison between eligible receipt context and other evidence.",
        customerSafeWording: "Supports a neutral request for clearer eligible receipt evidence if needed.",
      },
      recommendedReviewerAction:
        "Compare the receipt summary with support policy and other available case evidence.",
      externalVerification: "Not performed",
      verificationStatus: "Not externally verified",
    },
    {
      key: "order-context",
      type: "Order screenshot",
      typeLabel: "Order context",
      title: "Order context screenshot",
      benchGroup: "Needs clearer context",
      reviewState: "Needs clearer copy",
      statusLabel: "Readability needs review",
      attentionLevel: "Review signals",
      submittedContext:
        "Represented as a redacted order-context summary for local review only.",
      safeSummary:
        "Screenshot context is included as local reviewer context only and is not treated as external verification.",
      reviewContext:
        "Use this item to understand timing and item context, but request a clearer copy if the context is not readable enough for policy review.",
      metadata: [
        { label: "Evidence type", value: "Order screenshot" },
        { label: "Review state", value: "Needs clearer copy" },
        { label: "Submitted context", value: "Redacted order-context summary" },
        { label: "External verification", value: "Not performed" },
      ],
      limitations: [
        "No provider lookup was performed",
        "No raw screenshot or private order details are represented",
        "Needs manual review before support action",
      ],
      signals: [
        "Review signal: screenshot context may help compare dates and item context",
        "Needs clearer evidence if the support team cannot read the submitted copy",
      ],
      investigationFocus: [
        "Use screenshot context as supporting context only.",
        "Keep readability concerns separate from conclusions about the customer or evidence.",
      ],
      nextStepCues: [
        "Ask for a clearer copy only if policy review cannot proceed with the current context.",
        "Cross-check with the receipt summary before drafting a customer-facing request.",
      ],
      connections: {
        timeline: "Linked to order context added and internal note drafted events.",
        manualReview: "Guides whether the reviewer asks for clearer context before policy comparison.",
        customerSafeWording: "Supports careful wording that asks for a clearer copy without implying external checking.",
      },
      recommendedReviewerAction:
        "Request a clearer copy if the submitted context is not readable enough for policy review.",
      externalVerification: "Not performed",
      verificationStatus: "Not externally verified",
    },
    {
      key: "photo-unsupported",
      type: "Product-photo-like unsupported",
      typeLabel: "Unsupported evidence",
      title: "Product-photo-like evidence",
      benchGroup: "Manual-review-only evidence",
      reviewState: "Unsupported manual review",
      statusLabel: "Stopped before automated analysis",
      attentionLevel: "Manual review recommended",
      submittedContext:
        "Represented as product-photo-like evidence that remains unsupported and manual-review-only.",
      safeSummary:
        "This evidence type is represented as unsupported/manual-review-only. No automated analysis result was produced for this evidence item.",
      reviewContext:
        "Use this item as a boundary marker: it may matter to the support review, but it does not have an automated finding in this shell.",
      metadata: [
        { label: "Evidence type", value: "Product-photo-like unsupported" },
        { label: "Review state", value: "Unsupported manual review" },
        { label: "Submitted context", value: "Unsupported manual-review-only evidence" },
        { label: "External verification", value: "Not performed" },
      ],
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
      investigationFocus: [
        "Keep this evidence outside automated receipt analysis and outside product-photo runtime.",
        "Use support policy or request eligible receipt evidence when this item cannot support review by itself.",
      ],
      nextStepCues: [
        "Escalate for policy review if unsupported evidence is central to the case.",
        "Avoid customer-facing wording that describes an automated product-photo finding.",
      ],
      connections: {
        timeline: "Linked to unsupported evidence marked, status moved to manual review, and senior review may be needed events.",
        manualReview: "Drives the unsupported/manual-review-only branch of the local review plan.",
        customerSafeWording: "Requires language that says manual review is in progress, not that automated analysis found an issue.",
      },
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
      typeLabel: "Customer context",
      title: "Customer context summary",
      benchGroup: "Context for response planning",
      reviewState: "Context only",
      statusLabel: "Context only",
      attentionLevel: "Low attention",
      submittedContext:
        "Represented as a redacted customer-context summary for response planning only.",
      safeSummary:
        "Message context is summarized for reviewer orientation only and is kept separate from customer-safe response wording.",
      reviewContext:
        "Use this item to choose a helpful next question, while keeping internal rationale and private message details out of customer-facing text.",
      metadata: [
        { label: "Evidence type", value: "Customer message" },
        { label: "Review state", value: "Context only" },
        { label: "Submitted context", value: "Redacted message-context summary" },
        { label: "External verification", value: "Not performed" },
      ],
      limitations: [
        "No private message text is stored in the mock case",
        "Context does not replace evidence review",
      ],
      signals: [
        "Review signal: customer context may explain what additional information to request",
        "Manual decision remains reviewer-entered",
      ],
      investigationFocus: [
        "Use context to reduce back-and-forth without exposing internal rationale.",
        "Do not treat customer context as evidence verification.",
      ],
      nextStepCues: [
        "Select wording that asks for the narrowest missing context.",
        "Keep reviewer notes separate from any customer-facing draft.",
      ],
      connections: {
        timeline: "Linked to internal note drafted and customer-safe wording ready events.",
        manualReview: "Helps the reviewer decide which follow-up question is appropriate.",
        customerSafeWording: "Feeds courteous wording while excluding internal review rationale.",
      },
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
  manualReviewWorkspace: {
    summary:
      "Manual review is still required because the case combines eligible receipt context, screenshot context, and unsupported product-photo-like evidence.",
    notSavedBoundary:
      "Static mock review plan only. These notes and decision states are not saved, submitted, or sent to any external system.",
    decisionStates: [
      {
        key: "needs-review",
        label: "Needs review",
        tone: "Active review",
        detail: "Reviewer should compare available evidence with support policy before choosing a customer response.",
      },
      {
        key: "request-more-information",
        label: "Request more information",
        tone: "Info needed",
        detail: "A clearer eligible receipt copy may be useful if policy requires stronger purchase context.",
      },
      {
        key: "escalate",
        label: "Escalate",
        tone: "Escalation path",
        detail: "Senior review may be useful when mixed evidence types need a second policy check.",
      },
      {
        key: "reviewer-required",
        label: "Reviewer decision required",
        tone: "Safety hold",
        detail: "The shell does not decide the claim, send a message, or update a case record.",
      },
    ],
    internalNotes: [
      "Compare receipt summary with screenshot context before requesting more information.",
      "Keep unsupported product-photo-like evidence in manual review; no automated analysis result is available.",
      "Use customer-safe wording if asking for a clearer receipt or additional context.",
    ],
    policyConsiderations: [
      "External Verification: Not performed",
      "Verification Status: Not externally verified",
      "Support action should remain reviewer-entered",
      "Do not copy internal notes into customer-facing wording",
    ],
    selectedEvidenceRationale: {
      "receipt-summary": [
        "Receipt summary can support policy comparison, but it is not externally verified.",
        "Review local evidence-quality signals alongside other case context.",
      ],
      "order-context": [
        "Screenshot context may help align dates and item context.",
        "A clearer copy may be needed if the submitted context is not readable enough.",
      ],
      "photo-unsupported": [
        "Product-photo-like evidence remains unsupported and manual-review-only.",
        "No OCR, metadata processing, or product-photo runtime analysis was performed.",
      ],
      "customer-message": [
        "Customer context can guide the next support question.",
        "Keep internal rationale separate from customer-safe response wording.",
      ],
    },
    customerSafeHandoff:
      "Use the customer-safe wording panel when asking for clearer evidence or additional context; do not include internal review rationale.",
    timelineConnection:
      "Timeline entries show when notes, wording, manual review, and escalation markers were staged as mock events.",
  },
  customerSafeWordingModule: {
    status: "Mock local response prep",
    summary:
      "Static response-prep guidance helps the reviewer choose careful customer-facing language while the case remains in manual review.",
    notSentBoundary:
      "Mock local wording only. These suggested responses are not sent, not saved, and not connected to any ticket, message, or external system.",
    selectedEvidenceRationale: {
      "receipt-summary":
        "Receipt context can support a clearer information request, but it is not externally verified and should not be described as a final result.",
      "order-context":
        "Screenshot context may justify asking for a clearer copy or additional context without implying the screenshot was externally checked.",
      "photo-unsupported":
        "Unsupported product-photo-like evidence should be described as needing manual review, not as an automated finding.",
      "customer-message":
        "Customer context can shape a courteous follow-up while keeping internal review rationale out of the customer-facing wording.",
    },
    variants: [
      {
        key: "request-clearer-receipt",
        label: "Request clearer receipt",
        intent: "Request more information",
        tone: "Information request",
        draft:
          "Thanks for sending the information. To continue the support review, please share a clearer eligible receipt or any additional context requested by the support team.",
        whenToUse:
          "Use when eligible receipt context is incomplete or not readable enough for policy review.",
        avoids: [
          "Does not accuse the customer",
          "Does not describe a final support outcome",
          "Does not claim external verification happened",
        ],
      },
      {
        key: "manual-review-needed",
        label: "Manual review still in progress",
        intent: "Manual review needed",
        tone: "Manual review",
        draft:
          "We are still reviewing the available information. If more detail is needed, the support team may ask for another eligible document or clarification.",
        whenToUse:
          "Use when the case has mixed evidence and the reviewer has not chosen a support action.",
        avoids: [
          "Does not present ClaimGuard as the decision maker",
          "Does not state that submitted evidence proved or disproved the claim",
          "Does not promise a specific result",
        ],
      },
      {
        key: "policy-review",
        label: "Policy review handoff",
        intent: "Policy review",
        tone: "Policy review",
        draft:
          "The support team is comparing the available information with the applicable review policy. We may follow up if another eligible document is needed.",
        whenToUse:
          "Use when the next step is policy comparison rather than a direct evidence request.",
        avoids: [
          "Does not expose internal notes",
          "Does not mention unsupported analysis details",
          "Does not imply automated denial or refund handling",
        ],
      },
      {
        key: "escalation-or-courtesy",
        label: "Escalation or courtesy review pending",
        intent: "Escalation / courtesy exception pending",
        tone: "Neutral",
        draft:
          "We are checking the next available support path for this case. We will use the information provided and may request more context if needed.",
        whenToUse:
          "Use when a senior reviewer or courtesy-path review may be considered, but no outcome has been chosen.",
        avoids: [
          "Does not promise an exception",
          "Does not describe an escalation as a conclusion",
          "Does not disclose internal review rationale",
        ],
      },
    ],
    guardrails: [
      "No accusation or wrongdoing confirmation",
      "No statement that evidence is proven genuine or not genuine",
      "No automated denial, refund, or final decision language",
      "No private evidence details, raw OCR, metadata, or internal notes",
    ],
    repReviewChecklist: [
      "Confirm the selected wording matches the current manual review state.",
      "Keep internal rationale separate from the customer-facing message.",
      "Ask only for eligible evidence or context the support policy allows.",
      "Do not present local review signals as external verification.",
    ],
    internalRationaleBoundary:
      "Customer-safe wording is separate from internal notes. Selected-evidence rationale is for reviewer orientation only and should not be copied into customer-facing wording.",
    timelineConnection:
      "The timeline marks wording as prepared in the mock shell, not delivered or recorded in a live system.",
  },
  timeline: [
    {
      key: "case-opened",
      category: "Case status changed",
      statusLabel: "Case opened",
      severity: "Informational",
      timestamp: "Today 09:12",
      relativeTime: "42 minutes ago",
      actor: "Reviewer",
      detail: "Synthetic case shell loaded with redacted summary fields and no stored customer evidence.",
      caseStatusAfter: "Evidence review",
      relatedEvidenceKeys: [],
      reviewerImpact: "Creates a local review workspace before any support action is considered.",
    },
    {
      key: "receipt-evidence-added",
      category: "Evidence added",
      statusLabel: "Receipt summary added",
      severity: "Informational",
      timestamp: "Today 09:18",
      relativeTime: "36 minutes ago",
      actor: "Reviewer",
      detail: "Receipt evidence was represented as a privacy-safe local summary, without raw OCR or file details.",
      caseStatusAfter: "Evidence review",
      relatedEvidenceKeys: ["receipt-summary"],
      reviewerImpact: "Adds eligible receipt context for comparison with support policy.",
    },
    {
      key: "receipt-analysis-completed",
      category: "Analysis completed",
      statusLabel: "Receipt review summary complete",
      severity: "Complete",
      timestamp: "Today 09:21",
      relativeTime: "33 minutes ago",
      actor: "ClaimGuard shell",
      detail: "Local receipt review summary is staged as an evidence item; external verification was not performed.",
      caseStatusAfter: "Evidence review",
      relatedEvidenceKeys: ["receipt-summary"],
      reviewerImpact: "Gives the rep local evidence-quality signals without changing receipt analyzer behavior.",
    },
    {
      key: "order-context-added",
      category: "Evidence added",
      statusLabel: "Order context added",
      severity: "Informational",
      timestamp: "Today 09:28",
      relativeTime: "26 minutes ago",
      actor: "Reviewer",
      detail: "Order screenshot context was summarized for manual comparison only.",
      caseStatusAfter: "Evidence review",
      relatedEvidenceKeys: ["order-context"],
      reviewerImpact: "May help the rep decide whether a clearer copy is needed.",
    },
    {
      key: "unsupported-stopped",
      category: "Manual review needed",
      statusLabel: "Unsupported evidence marked",
      severity: "Needs review",
      timestamp: "Today 09:34",
      relativeTime: "20 minutes ago",
      actor: "ClaimGuard shell",
      detail: "Product-photo-like evidence remains manual-review-only and no automated analysis result was produced.",
      caseStatusAfter: "Manual review",
      relatedEvidenceKeys: ["photo-unsupported"],
      reviewerImpact: "Prompts the rep to use support policy or request eligible receipt evidence if needed.",
    },
    {
      key: "status-manual-review",
      category: "Case status changed",
      statusLabel: "Status moved to manual review",
      severity: "Needs review",
      timestamp: "Today 09:35",
      relativeTime: "19 minutes ago",
      actor: "Reviewer",
      detail: "Case status reflects mixed evidence and unsupported manual-review-only evidence.",
      caseStatusAfter: "Manual review",
      relatedEvidenceKeys: ["receipt-summary", "order-context", "photo-unsupported"],
      reviewerImpact: "Keeps the workflow human-entered and avoids a system-made support recommendation.",
    },
    {
      key: "rep-note-drafted",
      category: "Rep note drafted",
      statusLabel: "Internal note drafted",
      severity: "Informational",
      timestamp: "Today 09:41",
      relativeTime: "13 minutes ago",
      actor: "Reviewer",
      detail: "Internal note placeholder records what to compare next without private evidence details.",
      caseStatusAfter: "Manual review",
      relatedEvidenceKeys: ["customer-message", "order-context"],
      reviewerImpact: "Separates internal review context from language that may be sent to the customer.",
    },
    {
      key: "wording-drafted",
      category: "Customer-safe wording prepared",
      statusLabel: "Customer-safe wording ready",
      severity: "Complete",
      timestamp: "Today 09:46",
      relativeTime: "8 minutes ago",
      actor: "Reviewer",
      detail: "Draft wording asks for clearer receipt context if needed and avoids presenting a support outcome.",
      caseStatusAfter: "Manual review",
      relatedEvidenceKeys: ["customer-message"],
      reviewerImpact: "Gives the rep a careful response draft while the case remains under manual review.",
    },
    {
      key: "escalation-marker",
      category: "Escalation marker",
      statusLabel: "Senior review may be needed",
      severity: "Escalation",
      timestamp: "Today 09:51",
      relativeTime: "3 minutes ago",
      actor: "Reviewer",
      detail: "Escalation marker is available if policy requires a second reviewer for mixed evidence.",
      caseStatusAfter: "Manual review",
      relatedEvidenceKeys: ["photo-unsupported", "receipt-summary"],
      reviewerImpact: "Flags a review pathway, not a conclusion about the customer or evidence.",
    },
  ],
};
