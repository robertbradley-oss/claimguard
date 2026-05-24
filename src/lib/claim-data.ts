import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileSearch,
  Inbox,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RiskLevel = "Low" | "Medium" | "High";

export type RedFlag = {
  label: string;
  detail: string;
  confidence: "Low confidence" | "Inconclusive" | "Manual review recommended";
};

export type AnalysisConfidence = "High confidence" | "Medium confidence" | "Low confidence";

export type RiskSignalGroup = {
  category:
    | "Receipt/document formatting"
    | "Image/photo integrity"
    | "Customer/ticket pattern"
    | "Missing verification data";
  summary: string;
  signals: {
    label: string;
    detail: string;
    confidence: "Low confidence" | "Inconclusive" | "Manual review recommended" | "No material signal";
  }[];
};

export type AnalysisStatus = "idle" | "uploaded" | "analyzing" | "complete";

export type EvidenceType = "receipt" | "screenshot" | "pdf" | "damage-photo";

export type AnalysisStep = {
  label: string;
  detail: string;
};

export type MockAnalysisReport = {
  evidenceType: EvidenceType;
  evidenceLabel: string;
  scoreLabel?: "Evidence Reliability Score";
  score: number;
  riskLevel: RiskLevel;
  confidenceLevel: AnalysisConfidence;
  reviewLabel: string;
  verificationStatus?: "Not externally verified" | "Locally analyzed only" | "External verification unavailable";
  externalVerification?: "Not performed";
  internalStructureConfidence?: number;
  scoreMeaning?: {
    highScore: string;
    lowOrMediumScore: string;
    safetyNote: string;
  };
  primaryFinding: string;
  scoreExplanation: string;
  summary: string;
  suggestedAction: string;
  supportRecommendation: string;
  customerSafeWording: string;
  signalVsProof: string;
  redFlags: RedFlag[];
  riskSignalGroups: RiskSignalGroup[];
  whatToVerifyNext: string[];
  verificationChecks: {
    label: string;
    result: "Clear" | "Review" | "Inconclusive";
    detail: string;
  }[];
};

export type CaseRecord = {
  id: string;
  customer: string;
  submittedAt: string;
  lastUpdated: string;
  assignedReviewer: string;
  reviewQueue: string;
  item: string;
  channel: string;
  risk: RiskLevel;
  score: number;
  status: string;
  evidence?: string;
  report: MockAnalysisReport;
  ticket: {
    customerNote: string;
    uploadedFile: string;
    fileDetails: string;
    orderNumber: string;
    claimReason: string;
    purchaseChannel: string;
    supportRepNotes: string;
    sla: string;
    requestedAction: string;
  };
};

export type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Claim Review", icon: FileSearch },
  { label: "Inbox", icon: Inbox },
  { label: "Safe Replies", icon: MessageSquareText },
  { label: "Policies", icon: ShieldCheck },
  { label: "Settings", icon: SlidersHorizontal },
];

export const redFlags: RedFlag[] = [
  {
    label: "Potential alteration detected",
    detail: "Receipt total alignment differs from nearby fields.",
    confidence: "Manual review recommended",
  },
  {
    label: "Needs proof of purchase verification",
    detail: "Merchant name is visible, but order ID clarity is limited.",
    confidence: "Inconclusive",
  },
  {
    label: "Low confidence image consistency check",
    detail: "Damage photo lighting does not match the surrounding product surface.",
    confidence: "Low confidence",
  },
];

export const mockAnalysisReports: Record<EvidenceType, MockAnalysisReport> = {
  receipt: {
    evidenceType: "receipt",
    evidenceLabel: "Receipt",
    score: 72,
    riskLevel: "Medium",
    confidenceLevel: "Medium confidence",
    reviewLabel: "Manual review recommended",
    primaryFinding: "Purchase evidence is usable, but key fields need a manual match.",
    scoreExplanation:
      "A 72 score means the receipt has enough readable purchase context to continue review, with several fields that still need a human match.",
    summary:
      "Receipt details are mostly readable, but the order ID and total formatting should be checked against the purchase record.",
    suggestedAction:
      "Route to manual review and request proof-of-purchase verification if the order cannot be matched internally.",
    supportRecommendation:
      "Keep the case in manual review until the order ID, total, and purchase date are matched against the internal order record.",
    customerSafeWording:
      "Thanks for sending this in. We need one additional proof-of-purchase verification step before we can complete the warranty review.",
    signalVsProof:
      "These are review signals only. They are not proof that the customer changed the receipt or that the claim should be denied.",
    redFlags: [
      {
        label: "Needs proof-of-purchase verification",
        detail: "The merchant and total are visible, but the order ID needs a clearer match.",
        confidence: "Manual review recommended",
      },
      {
        label: "Receipt formatting risk signal",
        detail: "Line spacing around the total differs from nearby receipt fields.",
        confidence: "Inconclusive",
      },
    ],
    riskSignalGroups: [
      {
        category: "Receipt/document formatting",
        summary: "Readable receipt with one formatting area that deserves closer review.",
        signals: [
          {
            label: "Total-line spacing differs from nearby fields",
            detail: "The amount area has a spacing pattern that should be compared with the original order record.",
            confidence: "Inconclusive",
          },
        ],
      },
      {
        category: "Image/photo integrity",
        summary: "No strong image integrity concern from the mock receipt view.",
        signals: [
          {
            label: "Visible receipt image is clear enough for review",
            detail: "The submitted image is readable, though it still needs source purchase verification.",
            confidence: "No material signal",
          },
        ],
      },
      {
        category: "Customer/ticket pattern",
        summary: "The ticket pattern does not create a separate escalation signal in this mock case.",
        signals: [
          {
            label: "Claim reason matches a normal warranty review path",
            detail: "The customer request can continue through the standard support workflow while fields are checked.",
            confidence: "No material signal",
          },
        ],
      },
      {
        category: "Missing verification data",
        summary: "Order matching is the main missing verification step.",
        signals: [
          {
            label: "Order ID needs a clearer match",
            detail: "The order ID is partially visible and should be confirmed against customer account history.",
            confidence: "Manual review recommended",
          },
        ],
      },
    ],
    whatToVerifyNext: [
      "Match order ID against the customer account or commerce record.",
      "Compare receipt total and purchase date with the warranty policy window.",
      "Confirm merchant name is an accepted proof-of-purchase source.",
    ],
    verificationChecks: [
      {
        label: "Merchant visibility",
        result: "Clear",
        detail: "Store name is readable enough for normal support review.",
      },
      {
        label: "Order ID match",
        result: "Review",
        detail: "Order ID is partially visible and should be checked against the customer account.",
      },
      {
        label: "Total and date consistency",
        result: "Inconclusive",
        detail: "Visible fields are usable, but formatting differs around the total line.",
      },
    ],
  },
  screenshot: {
    evidenceType: "screenshot",
    evidenceLabel: "Screenshot",
    score: 64,
    riskLevel: "Medium",
    confidenceLevel: "Low confidence",
    reviewLabel: "Inconclusive",
    primaryFinding: "The screenshot has purchase context, but not enough for final verification.",
    scoreExplanation:
      "A 64 score means the screenshot gives partial purchase context, but the missing account, merchant, and timestamp details lower confidence.",
    summary:
      "The screenshot includes useful purchase context, but account and timestamp details are incomplete for final verification.",
    suggestedAction:
      "Ask for the original order confirmation or a full-page screenshot that includes the order date and merchant details.",
    supportRecommendation:
      "Pause resolution until the customer provides a full order confirmation or the rep can verify the purchase from account history.",
    customerSafeWording:
      "Thanks for the screenshot. Could you send the full order confirmation so we can verify the purchase details?",
    signalVsProof:
      "Missing context is a review signal, not proof that the screenshot is unreliable or that the customer submitted incorrect information.",
    redFlags: [
      {
        label: "Incomplete purchase context",
        detail: "The screenshot does not show enough surrounding order information.",
        confidence: "Inconclusive",
      },
      {
        label: "Low confidence timestamp check",
        detail: "The submitted view does not include a complete date and time reference.",
        confidence: "Low confidence",
      },
    ],
    riskSignalGroups: [
      {
        category: "Receipt/document formatting",
        summary: "The screenshot is not a full receipt and omits key purchase fields.",
        signals: [
          {
            label: "Partial document view",
            detail: "The crop does not show the full order confirmation, merchant footer, or complete purchase details.",
            confidence: "Inconclusive",
          },
        ],
      },
      {
        category: "Image/photo integrity",
        summary: "The visible screenshot does not show a strong alteration signal, but context is limited.",
        signals: [
          {
            label: "Limited screenshot boundaries",
            detail: "The submitted view lacks surrounding browser or app context that would help support verify the source.",
            confidence: "Low confidence",
          },
        ],
      },
      {
        category: "Customer/ticket pattern",
        summary: "The claim can continue, but the ticket needs supporting purchase context.",
        signals: [
          {
            label: "Customer supplied partial evidence",
            detail: "The ticket includes a purchase claim, but the current evidence does not complete normal policy verification.",
            confidence: "Inconclusive",
          },
        ],
      },
      {
        category: "Missing verification data",
        summary: "Order date, merchant details, and account context remain unresolved.",
        signals: [
          {
            label: "Timestamp and merchant details incomplete",
            detail: "The date, time, merchant identity, and order source should be verified before a support decision.",
            confidence: "Manual review recommended",
          },
        ],
      },
    ],
    whatToVerifyNext: [
      "Request the original order confirmation or a full-page screenshot.",
      "Confirm order date and merchant details against account records.",
      "Check that the product SKU or item name matches the warranty claim.",
    ],
    verificationChecks: [
      {
        label: "Order context",
        result: "Review",
        detail: "The visible section omits supporting account and merchant details.",
      },
      {
        label: "Timestamp clarity",
        result: "Inconclusive",
        detail: "Date and time context is incomplete in the submitted view.",
      },
      {
        label: "Customer-safe reply",
        result: "Clear",
        detail: "A full order confirmation request is appropriate and non-accusatory.",
      },
    ],
  },
  pdf: {
    evidenceType: "pdf",
    evidenceLabel: "PDF receipt",
    score: 81,
    riskLevel: "Low",
    confidenceLevel: "Medium confidence",
    reviewLabel: "Standard verification",
    primaryFinding: "No high-risk signals were generated in this mock review.",
    scoreExplanation:
      "An 81 score means this mock review generated no high-risk visible signals, while metadata and purchase matching still need normal human verification.",
    summary:
      "No high-risk signals were generated in this mock review. Manual policy verification is still recommended.",
    suggestedAction:
      "Proceed with standard proof-of-purchase verification only if the order record matches policy requirements.",
    supportRecommendation:
      "Continue through the standard review path once the order record, policy window, and product details are verified.",
    customerSafeWording:
      "Thanks for providing the receipt. We are checking it against the warranty requirements and will follow up shortly.",
    signalVsProof:
      "This mock result does not confirm authenticity. It only means this mock review found fewer visible signals needing escalation.",
    redFlags: [
      {
        label: "Low confidence metadata signal",
        detail: "PDF metadata is unavailable in the mock review, so the report relies on visible fields only.",
        confidence: "Low confidence",
      },
    ],
    riskSignalGroups: [
      {
        category: "Receipt/document formatting",
        summary: "No high-risk formatting signal was generated in this mock review.",
        signals: [
          {
            label: "Readable merchant, date, and total",
            detail: "The PDF presents the main receipt fields for normal support review. Manual policy verification is still recommended.",
            confidence: "No material signal",
          },
        ],
      },
      {
        category: "Image/photo integrity",
        summary: "No image-specific concern is available from the PDF-only mock review.",
        signals: [
          {
            label: "Photo integrity not evaluated",
            detail: "This evidence is a PDF receipt, so product photo consistency is not part of the current mock result.",
            confidence: "No material signal",
          },
        ],
      },
      {
        category: "Customer/ticket pattern",
        summary: "The ticket can stay in the standard policy review path.",
        signals: [
          {
            label: "Claim context aligns with normal support handling",
            detail: "The submitted PDF gives enough context to continue standard warranty verification.",
            confidence: "No material signal",
          },
        ],
      },
      {
        category: "Missing verification data",
        summary: "Metadata is unavailable, so support should rely on purchase-system matching.",
        signals: [
          {
            label: "Document metadata not reviewed in mock mode",
            detail: "The MVP does not inspect PDF metadata; reps should verify visible fields against internal records.",
            confidence: "Low confidence",
          },
        ],
      },
    ],
    whatToVerifyNext: [
      "Match the receipt to the internal order record.",
      "Confirm the purchase date is inside the warranty window.",
      "Check product model or SKU against the claim item.",
    ],
    verificationChecks: [
      {
        label: "Visible receipt fields",
        result: "Clear",
        detail: "Merchant, date, and total are sufficiently readable for a normal policy check.",
      },
      {
        label: "Purchase match",
        result: "Review",
        detail: "Support should still confirm the purchase against the order record.",
      },
      {
        label: "Document metadata",
        result: "Inconclusive",
        detail: "Metadata is not evaluated in this mock-only MVP.",
      },
    ],
  },
  "damage-photo": {
    evidenceType: "damage-photo",
    evidenceLabel: "Product damage photo",
    score: 58,
    riskLevel: "High",
    confidenceLevel: "Medium confidence",
    reviewLabel: "Manual review recommended",
    primaryFinding: "The damage is visible, but context is limited enough to require review.",
    scoreExplanation:
      "A 58 score means the photo shows the damage, but limited product context and mixed image signals make this a manual-review case.",
    summary:
      "The product damage is visible, but the image has mixed context signals that should be reviewed before resolution.",
    suggestedAction:
      "Route to a senior support review and request one additional photo showing the full product, serial area, and damage location.",
    supportRecommendation:
      "Escalate to senior support review and request a wider product photo before approving, denying, or requesting replacement handling.",
    customerSafeWording:
      "Thanks for the photo. To finish the review, could you send one more image showing the full product and the damaged area together?",
    signalVsProof:
      "Image signals can indicate where to look next, but they are not proof of alteration or customer intent.",
    redFlags: [
      {
        label: "Potential alteration detected",
        detail: "Edges around the damaged area differ from the surrounding product surface.",
        confidence: "Manual review recommended",
      },
      {
        label: "Image context risk signal",
        detail: "The close crop limits product identification and damage location context.",
        confidence: "Inconclusive",
      },
      {
        label: "Low confidence lighting check",
        detail: "Lighting around the damage does not fully match the rest of the visible surface.",
        confidence: "Low confidence",
      },
    ],
    riskSignalGroups: [
      {
        category: "Receipt/document formatting",
        summary: "No receipt was supplied with the product photo in this mock scenario.",
        signals: [
          {
            label: "Receipt context unavailable",
            detail: "The report cannot compare receipt formatting because the submitted evidence is a damage photo.",
            confidence: "Inconclusive",
          },
        ],
      },
      {
        category: "Image/photo integrity",
        summary: "The photo has several integrity signals that need human inspection.",
        signals: [
          {
            label: "Edges around damaged area need review",
            detail: "The damaged area has edge and lighting differences that should be inspected against a wider image.",
            confidence: "Manual review recommended",
          },
          {
            label: "Close crop limits context",
            detail: "The photo does not show enough surrounding product surface to evaluate the damage location confidently.",
            confidence: "Inconclusive",
          },
        ],
      },
      {
        category: "Customer/ticket pattern",
        summary: "The ticket needs more product-identification context before resolution.",
        signals: [
          {
            label: "Product identity not fully visible",
            detail: "The current photo does not show the full product, serial area, or packaging context.",
            confidence: "Manual review recommended",
          },
        ],
      },
      {
        category: "Missing verification data",
        summary: "Additional photo and purchase data are needed before the rep decides next steps.",
        signals: [
          {
            label: "Serial area and purchase match missing",
            detail: "Support should request a wider image and confirm purchase eligibility against the order record.",
            confidence: "Manual review recommended",
          },
        ],
      },
    ],
    whatToVerifyNext: [
      "Request a wider photo showing the full product and damaged area together.",
      "Ask for the serial area or model label if warranty policy requires it.",
      "Match the product and purchase date against the customer order record.",
    ],
    verificationChecks: [
      {
        label: "Damage visibility",
        result: "Clear",
        detail: "The damaged area is visible in the submitted image.",
      },
      {
        label: "Product context",
        result: "Review",
        detail: "The photo is tightly cropped and does not show the full product.",
      },
      {
        label: "Image consistency",
        result: "Inconclusive",
        detail: "Lighting and edge context should be reviewed before resolution.",
      },
    ],
  },
};

export const recentCases: CaseRecord[] = [
  {
    id: "CG-1048",
    customer: "Maya R.",
    submittedAt: "Today, 10:42 AM",
    lastUpdated: "11:18 AM",
    assignedReviewer: "A. Chen",
    reviewQueue: "Warranty manual review",
    item: "iSpring RCC7AK filter system",
    channel: "Zendesk",
    risk: "Medium",
    score: 68,
    status: "Manual review",
    evidence: "Receipt and damage photo",
    report: mockAnalysisReports.receipt,
    ticket: {
      customerNote:
        "The under-sink filter housing started leaking after installation. I attached the receipt and a photo of the cracked canister.",
      uploadedFile: "maya-r-ispring-rcc7ak-receipt.jpg",
      fileDetails: "JPG image | 3.4 MB",
      orderNumber: "ORD-IS-884219",
      claimReason: "Housing leak after installation",
      purchaseChannel: "Direct web store",
      supportRepNotes:
        "Verify order total and purchase date before replacement handling. Customer has provided one receipt image and one damage photo.",
      sla: "Review by 4:00 PM",
      requestedAction: "Warranty replacement review",
    },
  },
  {
    id: "CG-1047",
    customer: "Jon Bell",
    submittedAt: "Today, 9:18 AM",
    lastUpdated: "10:05 AM",
    assignedReviewer: "M. Rivera",
    reviewQueue: "Standard policy check",
    item: "iSpring WSP50 spin-down filter",
    channel: "Email",
    risk: "Low",
    score: 91,
    status: "Policy check ready",
    evidence: "PDF receipt",
    report: mockAnalysisReports.pdf,
    ticket: {
      customerNote:
        "The sediment filter arrived with a damaged clear housing. I uploaded the invoice from my order confirmation.",
      uploadedFile: "jon-bell-wsp50-invoice.pdf",
      fileDetails: "PDF document | 819 KB",
      orderNumber: "ORD-IS-882904",
      claimReason: "Damaged housing on arrival",
      purchaseChannel: "Email order confirmation",
      supportRepNotes:
        "Visible invoice fields are readable. Confirm purchase window and product model before standard warranty approval.",
      sla: "Review by 2:30 PM",
      requestedAction: "Standard warranty approval",
    },
  },
  {
    id: "CG-1046",
    customer: "N. Patel",
    submittedAt: "Yesterday, 4:55 PM",
    lastUpdated: "Today, 8:12 AM",
    assignedReviewer: "R. Brooks",
    reviewQueue: "Senior support review",
    item: "iSpring UVF11A lamp kit",
    channel: "Intercom",
    risk: "High",
    score: 38,
    status: "Proof requested",
    evidence: "Product damage photo",
    report: mockAnalysisReports["damage-photo"],
    ticket: {
      customerNote:
        "The replacement UV lamp appears cracked near the connector. I sent a close-up image but can provide more photos if needed.",
      uploadedFile: "patel-uvf11a-closeup.webp",
      fileDetails: "WEBP image | 2.1 MB",
      orderNumber: "ORD-IS-879331",
      claimReason: "Connector area crack",
      purchaseChannel: "Intercom attachment",
      supportRepNotes:
        "Close crop limits product context. Request wider product photo showing serial area and damage location together.",
      sla: "Review by tomorrow, 11:00 AM",
      requestedAction: "Senior support review",
    },
  },
  {
    id: "CG-1045",
    customer: "Elena M.",
    submittedAt: "Yesterday, 2:07 PM",
    lastUpdated: "Yesterday, 3:44 PM",
    assignedReviewer: "T. Nguyen",
    reviewQueue: "Proof-of-purchase verification",
    item: "iSpring ED2000 conditioner",
    channel: "Shopify",
    risk: "Medium",
    score: 72,
    status: "Manual review",
    evidence: "Order screenshot",
    report: mockAnalysisReports.screenshot,
    ticket: {
      customerNote:
        "The water conditioner stopped powering on. I attached a screenshot from the order page because I cannot find the email receipt.",
      uploadedFile: "elena-m-ed2000-order-screenshot.png",
      fileDetails: "PNG image | 1.6 MB",
      orderNumber: "ORD-IS-877618",
      claimReason: "Unit stopped powering on",
      purchaseChannel: "Shopify account screenshot",
      supportRepNotes:
        "Screenshot is partial. Ask for full order confirmation or match order details against account history.",
      sla: "Review by tomorrow, 9:30 AM",
      requestedAction: "Proof-of-purchase verification",
    },
  },
];

export const mockAnalysisSteps: AnalysisStep[] = [
  {
    label: "Reading document text",
    detail: "Extracting visible merchant, date, total, product, and claim context from the selected evidence.",
  },
  {
    label: "Checking formatting consistency",
    detail: "Looking for receipt or document layout differences that should be reviewed by a support rep.",
  },
  {
    label: "Reviewing image integrity signals",
    detail: "Checking visible crop, lighting, and image-context signals without making a final determination.",
  },
  {
    label: "Comparing claim details",
    detail: "Matching the evidence type to the ticket item, requested action, and proof-of-purchase needs.",
  },
  {
    label: "Preparing support-safe report",
    detail: "Writing manual review guidance, verification steps, and a customer-safe suggested reply.",
  },
];

export const statusCards = [
  {
    label: "Open reviews",
    value: "28",
    trend: "+6 today",
    icon: Clock3,
  },
  {
    label: "Low-risk clears",
    value: "184",
    trend: "91% this week",
    icon: CheckCircle2,
  },
  {
    label: "Manual checks",
    value: "43",
    trend: "Avg. 7 min",
    icon: AlertTriangle,
  },
];
