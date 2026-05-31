export type SyntheticOcrFixtureStatus =
  | "structured"
  | "needs-review"
  | "unsupported"
  | "provider-unavailable"
  | "empty";

export type SyntheticOcrTextBlockKind = "merchant" | "order" | "date" | "amount" | "item" | "payment" | "shipping" | "noise" | "unknown";

export type SyntheticOcrTextBlock = {
  id: string;
  text: string;
  kind: SyntheticOcrTextBlockKind;
  confidence: number;
  pageNumber: number;
};

export type SyntheticReceiptFieldKey =
  | "merchant"
  | "orderNumber"
  | "purchaseDate"
  | "subtotal"
  | "tax"
  | "shipping"
  | "total"
  | "itemLines"
  | "marketplaceHints";

export type SyntheticReceiptFieldExpectation = {
  value?: string | string[];
  confidence: number;
  status: "extracted" | "not-extracted" | "needs-review" | "conflicting" | "not-applicable";
  evidenceBlockIds: string[];
  limitation?: string;
};

export type SyntheticStructuredReceiptFields = Partial<
  Record<SyntheticReceiptFieldKey, SyntheticReceiptFieldExpectation>
>;

export type SyntheticOcrFixtureExpectedOutput = {
  status: SyntheticOcrFixtureStatus;
  extractedTextBlocks: readonly SyntheticOcrTextBlock[];
  structuredFields: SyntheticStructuredReceiptFields;
  fieldConfidence: Partial<Record<SyntheticReceiptFieldKey, number>>;
  extractionConfidence: number;
  manualReviewDrivers: readonly string[];
  limitations: readonly string[];
  safeSummary: string;
  unsupportedReason?: string;
};

export type SyntheticOcrFixtureCase = {
  key: string;
  title: string;
  fixtureKind:
    | "clean-receipt"
    | "amazon-like"
    | "missing-field"
    | "conflict"
    | "noisy"
    | "incomplete"
    | "unsupported"
    | "ambiguous"
    | "provider-failure"
    | "empty";
  sourceKind: "synthetic-fixture";
  providerCallsAllowed: false;
  liveRuntimeAllowed: false;
  rawOcrLikeText: string;
  expectedOutput: SyntheticOcrFixtureExpectedOutput;
  receiptRegressionSafety: {
    analyzeEvidenceFileUnchanged: true;
    localAnalysisResultUnchanged: true;
    uploadFlowUnchanged: true;
    reportMappingUnchanged: true;
    claimReviewWorkflowUnwired: true;
    productPhotoReviewPanelUnrouted: true;
  };
};

export type SyntheticOcrFixtureHarnessResult = {
  harnessName: "phase-4.2-synthetic-ocr-fixture-harness";
  phase: "4.2";
  runtimeLive: false;
  providerFree: true;
  routeFree: true;
  uploadFree: true;
  storageFree: true;
  realEvidenceFree: true;
  fixtures: readonly SyntheticOcrFixtureCase[];
  summary: {
    totalFixtures: number;
    structuredFixtures: number;
    manualReviewFixtures: number;
    unsupportedFixtures: number;
    providerUnavailableFixtures: number;
    emptyFixtures: number;
    receiptRegressionSafetyCovered: boolean;
    safeSummary:
      "Synthetic OCR expectations only. OCR confidence is a review signal, not proof or a final decision.";
  };
};

const regressionSafety = {
  analyzeEvidenceFileUnchanged: true,
  localAnalysisResultUnchanged: true,
  uploadFlowUnchanged: true,
  reportMappingUnchanged: true,
  claimReviewWorkflowUnwired: true,
  productPhotoReviewPanelUnrouted: true,
} as const;

function block(
  id: string,
  text: string,
  kind: SyntheticOcrTextBlockKind,
  confidence: number,
): SyntheticOcrTextBlock {
  return {
    id,
    text,
    kind,
    confidence,
    pageNumber: 1,
  };
}

function field(
  value: SyntheticReceiptFieldExpectation["value"],
  confidence: number,
  status: SyntheticReceiptFieldExpectation["status"],
  evidenceBlockIds: string[],
  limitation?: string,
): SyntheticReceiptFieldExpectation {
  return {
    value,
    confidence,
    status,
    evidenceBlockIds,
    ...(limitation ? { limitation } : {}),
  };
}

const cleanBlocks = [
  block("clean-merchant", "Synthetic Market", "merchant", 96),
  block("clean-order", "Receipt Ref SYN-REC-001", "order", 93),
  block("clean-date", "Purchase Date 2026-04-12", "date", 92),
  block("clean-item-1", "Replacement Filter Pack 29.00", "item", 90),
  block("clean-subtotal", "Subtotal 29.00", "amount", 94),
  block("clean-tax", "Tax 2.32", "amount", 93),
  block("clean-total", "Total 31.32", "amount", 95),
] as const;

const amazonBlocks = [
  block("amazon-merchant", "Synthetic Marketplace", "merchant", 94),
  block("amazon-order", "Order Ref SYN-AMZ-ORDER-001", "order", 92),
  block("amazon-date", "Order placed April 18 2026", "date", 91),
  block("amazon-item", "Items ordered Filter Cartridge Set", "item", 89),
  block("amazon-summary", "Order Summary", "unknown", 88),
  block("amazon-total", "Order Total 48.27", "amount", 93),
  block("amazon-payment", "Payment cue present", "payment", 86),
  block("amazon-shipping", "Delivery cue present", "shipping", 84),
] as const;

const missingTotalBlocks = [
  block("missing-total-merchant", "Synthetic Parts Store", "merchant", 91),
  block("missing-total-order", "Order Ref SYN-MISS-TOTAL", "order", 88),
  block("missing-total-date", "Date 2026-04-20", "date", 86),
  block("missing-total-item", "Replacement Valve Kit", "item", 79),
  block("missing-total-tax", "Tax line present", "amount", 62),
] as const;

const missingMerchantBlocks = [
  block("missing-merchant-order", "Receipt Ref SYN-MISS-MERCHANT", "order", 84),
  block("missing-merchant-date", "Date 2026-04-21", "date", 82),
  block("missing-merchant-item", "Synthetic Item Row", "item", 74),
  block("missing-merchant-total", "Total 22.40", "amount", 86),
] as const;

const conflictingBlocks = [
  block("conflict-merchant", "Synthetic Outlet", "merchant", 88),
  block("conflict-order", "Receipt Ref SYN-CONFLICT", "order", 85),
  block("conflict-date-1", "Order Date 2026-04-22", "date", 81),
  block("conflict-date-2", "Invoice Date 2026-05-02", "date", 76),
  block("conflict-total-1", "Total 41.10", "amount", 79),
  block("conflict-total-2", "Amount Paid 49.10", "amount", 74),
] as const;

const noisyBlocks = [
  block("noisy-merchant", "Synthet1c Hardware", "merchant", 58),
  block("noisy-order", "Ref SYN-NO1SY", "order", 52),
  block("noisy-date", "Date 2026-0?-24", "date", 44),
  block("noisy-item", "Filt3r K1t", "item", 49),
  block("noisy-total", "T0tal 3?.90", "amount", 46),
] as const;

const incompleteBlocks = [
  block("incomplete-heading", "Receipt", "unknown", 64),
  block("incomplete-item", "Service Part", "item", 47),
] as const;

const unsupportedBlocks = [
  block("unsupported-note", "Synthetic warranty narrative without receipt structure", "unknown", 72),
] as const;

const ambiguousBlocks = [
  block("ambiguous-marketplace", "Synthetic order screen", "merchant", 68),
  block("ambiguous-action", "Track package", "noise", 74),
  block("ambiguous-status", "Return window", "noise", 71),
  block("ambiguous-item", "Filter Cartridge", "item", 66),
] as const;

export const SYNTHETIC_OCR_FIXTURE_CASES = [
  {
    key: "clean-receipt-ocr",
    title: "Clean synthetic receipt OCR",
    fixtureKind: "clean-receipt",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: cleanBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "structured",
      extractedTextBlocks: cleanBlocks,
      structuredFields: {
        merchant: field("Synthetic Market", 96, "extracted", ["clean-merchant"]),
        orderNumber: field("SYN-REC-001", 93, "extracted", ["clean-order"]),
        purchaseDate: field("2026-04-12", 92, "extracted", ["clean-date"]),
        subtotal: field("29.00", 94, "extracted", ["clean-subtotal"]),
        tax: field("2.32", 93, "extracted", ["clean-tax"]),
        total: field("31.32", 95, "extracted", ["clean-total"]),
        itemLines: field(["Replacement Filter Pack"], 90, "extracted", ["clean-item-1"]),
        marketplaceHints: field(["generic synthetic merchant"], 78, "extracted", ["clean-merchant"]),
      },
      fieldConfidence: {
        merchant: 96,
        orderNumber: 93,
        purchaseDate: 92,
        subtotal: 94,
        tax: 93,
        total: 95,
        itemLines: 90,
        marketplaceHints: 78,
      },
      extractionConfidence: 93,
      manualReviewDrivers: [],
      limitations: ["Synthetic fixture only. No external verification was performed."],
      safeSummary: "Synthetic receipt fields are complete enough for future parser-contract comparison.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "amazon-like-order-ocr",
    title: "Amazon-like synthetic order OCR",
    fixtureKind: "amazon-like",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: amazonBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "structured",
      extractedTextBlocks: amazonBlocks,
      structuredFields: {
        merchant: field("Synthetic Marketplace", 94, "extracted", ["amazon-merchant"]),
        orderNumber: field("SYN-AMZ-ORDER-001", 92, "extracted", ["amazon-order"]),
        purchaseDate: field("2026-04-18", 91, "extracted", ["amazon-date"]),
        total: field("48.27", 93, "extracted", ["amazon-total"]),
        itemLines: field(["Filter Cartridge Set"], 89, "extracted", ["amazon-item"]),
        marketplaceHints: field(["marketplace order page", "order summary", "delivery cue"], 88, "extracted", [
          "amazon-summary",
          "amazon-shipping",
        ]),
      },
      fieldConfidence: {
        merchant: 94,
        orderNumber: 92,
        purchaseDate: 91,
        total: 93,
        itemLines: 89,
        marketplaceHints: 88,
      },
      extractionConfidence: 91,
      manualReviewDrivers: ["Compare order/date/total cues against the purchase record."],
      limitations: ["Marketplace-like structure is synthetic and not externally verified."],
      safeSummary: "Amazon-like structure is available as a future manual comparison signal.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "missing-total-ocr",
    title: "Synthetic receipt OCR missing total",
    fixtureKind: "missing-field",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: missingTotalBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "needs-review",
      extractedTextBlocks: missingTotalBlocks,
      structuredFields: {
        merchant: field("Synthetic Parts Store", 91, "extracted", ["missing-total-merchant"]),
        orderNumber: field("SYN-MISS-TOTAL", 88, "extracted", ["missing-total-order"]),
        purchaseDate: field("2026-04-20", 86, "extracted", ["missing-total-date"]),
        total: field(undefined, 18, "not-extracted", [], "Total was not found in synthetic OCR blocks."),
        itemLines: field(["Replacement Valve Kit"], 79, "needs-review", ["missing-total-item"]),
      },
      fieldConfidence: {
        merchant: 91,
        orderNumber: 88,
        purchaseDate: 86,
        total: 18,
        itemLines: 79,
      },
      extractionConfidence: 70,
      manualReviewDrivers: ["Total is missing and should be compared manually before relying on extracted fields."],
      limitations: ["Missing total may reflect partial capture or OCR coverage limits."],
      safeSummary: "Synthetic OCR is usable, but total extraction needs manual review.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "missing-merchant-ocr",
    title: "Synthetic receipt OCR missing merchant",
    fixtureKind: "missing-field",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: missingMerchantBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "needs-review",
      extractedTextBlocks: missingMerchantBlocks,
      structuredFields: {
        merchant: field(undefined, 20, "not-extracted", [], "Merchant/platform marker was not found."),
        orderNumber: field("SYN-MISS-MERCHANT", 84, "extracted", ["missing-merchant-order"]),
        purchaseDate: field("2026-04-21", 82, "extracted", ["missing-merchant-date"]),
        total: field("22.40", 86, "extracted", ["missing-merchant-total"]),
        itemLines: field(["Synthetic Item Row"], 74, "needs-review", ["missing-merchant-item"]),
      },
      fieldConfidence: {
        merchant: 20,
        orderNumber: 84,
        purchaseDate: 82,
        total: 86,
        itemLines: 74,
      },
      extractionConfidence: 68,
      manualReviewDrivers: ["Merchant is missing, so source-specific assumptions should not be applied."],
      limitations: ["Merchant absence is a review signal, not a final decision."],
      safeSummary: "Synthetic OCR has core fields but lacks merchant context.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "conflicting-date-total-ocr",
    title: "Synthetic receipt OCR with conflicting date and total cues",
    fixtureKind: "conflict",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: conflictingBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "needs-review",
      extractedTextBlocks: conflictingBlocks,
      structuredFields: {
        merchant: field("Synthetic Outlet", 88, "extracted", ["conflict-merchant"]),
        orderNumber: field("SYN-CONFLICT", 85, "extracted", ["conflict-order"]),
        purchaseDate: field(["2026-04-22", "2026-05-02"], 61, "conflicting", [
          "conflict-date-1",
          "conflict-date-2",
        ]),
        total: field(["41.10", "49.10"], 58, "conflicting", ["conflict-total-1", "conflict-total-2"]),
      },
      fieldConfidence: {
        merchant: 88,
        orderNumber: 85,
        purchaseDate: 61,
        total: 58,
      },
      extractionConfidence: 64,
      manualReviewDrivers: ["Date and total conflicts require manual comparison against the purchase record."],
      limitations: ["Conflicts may reflect multiple sections, OCR grouping limits, or a partial document."],
      safeSummary: "Synthetic OCR found conflicting fields that should drive manual review.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "noisy-ocr-text",
    title: "Synthetic noisy OCR text",
    fixtureKind: "noisy",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: noisyBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "needs-review",
      extractedTextBlocks: noisyBlocks,
      structuredFields: {
        merchant: field("Synthet1c Hardware", 58, "needs-review", ["noisy-merchant"]),
        orderNumber: field("SYN-NO1SY", 52, "needs-review", ["noisy-order"]),
        purchaseDate: field(undefined, 44, "needs-review", ["noisy-date"], "Date text is uncertain."),
        total: field(undefined, 46, "needs-review", ["noisy-total"], "Amount text is uncertain."),
        itemLines: field(["Filt3r K1t"], 49, "needs-review", ["noisy-item"]),
      },
      fieldConfidence: {
        merchant: 58,
        orderNumber: 52,
        purchaseDate: 44,
        total: 46,
        itemLines: 49,
      },
      extractionConfidence: 50,
      manualReviewDrivers: ["Low-confidence text should be checked visually before relying on extracted fields."],
      limitations: ["Noisy OCR is an evidence-quality limit."],
      safeSummary: "Synthetic noisy OCR remains review-support only.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "receipt-like-incomplete-ocr",
    title: "Synthetic receipt-like but incomplete OCR",
    fixtureKind: "incomplete",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: incompleteBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "needs-review",
      extractedTextBlocks: incompleteBlocks,
      structuredFields: {
        merchant: field(undefined, 18, "not-extracted", []),
        orderNumber: field(undefined, 12, "not-extracted", []),
        purchaseDate: field(undefined, 12, "not-extracted", []),
        total: field(undefined, 12, "not-extracted", []),
        itemLines: field(["Service Part"], 47, "needs-review", ["incomplete-item"]),
      },
      fieldConfidence: {
        merchant: 18,
        orderNumber: 12,
        purchaseDate: 12,
        total: 12,
        itemLines: 47,
      },
      extractionConfidence: 28,
      manualReviewDrivers: ["Core receipt fields are absent from the synthetic OCR text."],
      limitations: ["Receipt-like text is too incomplete for structured extraction confidence."],
      safeSummary: "Synthetic OCR is incomplete and should lead to manual review.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "unsupported-non-receipt-text",
    title: "Synthetic unsupported non-receipt OCR",
    fixtureKind: "unsupported",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: unsupportedBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "unsupported",
      extractedTextBlocks: unsupportedBlocks,
      structuredFields: {},
      fieldConfidence: {},
      extractionConfidence: 12,
      manualReviewDrivers: ["Text does not contain enough receipt structure for this OCR fixture contract."],
      limitations: ["Unsupported synthetic text should not be forced into receipt fields."],
      safeSummary: "Synthetic non-receipt text is unsupported for structured receipt extraction.",
      unsupportedReason: "No merchant/order/date/total receipt structure detected.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "ambiguous-marketplace-screen-ocr",
    title: "Synthetic ambiguous marketplace screen OCR",
    fixtureKind: "ambiguous",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: ambiguousBlocks.map((item) => item.text).join("\n"),
    expectedOutput: {
      status: "needs-review",
      extractedTextBlocks: ambiguousBlocks,
      structuredFields: {
        merchant: field("Synthetic order screen", 68, "needs-review", ["ambiguous-marketplace"]),
        itemLines: field(["Filter Cartridge"], 66, "needs-review", ["ambiguous-item"]),
        marketplaceHints: field(["order screen", "action/status rows present"], 54, "needs-review", [
          "ambiguous-marketplace",
          "ambiguous-action",
          "ambiguous-status",
        ]),
      },
      fieldConfidence: {
        merchant: 68,
        itemLines: 66,
        marketplaceHints: 54,
      },
      extractionConfidence: 52,
      manualReviewDrivers: ["Action/status rows should not be treated as item or payment evidence."],
      limitations: ["Ambiguous marketplace screen text may need source-specific parsing later."],
      safeSummary: "Synthetic marketplace screen OCR needs manual interpretation.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "provider-timeout-synthetic-failure",
    title: "Synthetic provider timeout failure",
    fixtureKind: "provider-failure",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: "",
    expectedOutput: {
      status: "provider-unavailable",
      extractedTextBlocks: [],
      structuredFields: {},
      fieldConfidence: {},
      extractionConfidence: 0,
      manualReviewDrivers: ["OCR extraction unavailable; manual review or a clearer eligible document may be needed."],
      limitations: ["Synthetic timeout case only. No provider was called."],
      safeSummary: "Synthetic provider-unavailable output is a safe failure state, not a final decision.",
      unsupportedReason: "Synthetic timeout state.",
    },
    receiptRegressionSafety: regressionSafety,
  },
  {
    key: "empty-ocr-output",
    title: "Synthetic empty OCR output",
    fixtureKind: "empty",
    sourceKind: "synthetic-fixture",
    providerCallsAllowed: false,
    liveRuntimeAllowed: false,
    rawOcrLikeText: "",
    expectedOutput: {
      status: "empty",
      extractedTextBlocks: [],
      structuredFields: {
        merchant: field(undefined, 0, "not-extracted", []),
        orderNumber: field(undefined, 0, "not-extracted", []),
        purchaseDate: field(undefined, 0, "not-extracted", []),
        total: field(undefined, 0, "not-extracted", []),
      },
      fieldConfidence: {
        merchant: 0,
        orderNumber: 0,
        purchaseDate: 0,
        total: 0,
      },
      extractionConfidence: 0,
      manualReviewDrivers: ["OCR returned no text in this synthetic fixture."],
      limitations: ["No structured receipt fields can be extracted from empty OCR output."],
      safeSummary: "Synthetic empty OCR output should produce an evidence-quality limit.",
      unsupportedReason: "No OCR text available.",
    },
    receiptRegressionSafety: regressionSafety,
  },
] as const satisfies readonly SyntheticOcrFixtureCase[];

export function runSyntheticOcrFixtureHarness(): SyntheticOcrFixtureHarnessResult {
  const fixtures = SYNTHETIC_OCR_FIXTURE_CASES;

  return {
    harnessName: "phase-4.2-synthetic-ocr-fixture-harness",
    phase: "4.2",
    runtimeLive: false,
    providerFree: true,
    routeFree: true,
    uploadFree: true,
    storageFree: true,
    realEvidenceFree: true,
    fixtures,
    summary: {
      totalFixtures: fixtures.length,
      structuredFixtures: fixtures.filter((fixture) => fixture.expectedOutput.status === "structured").length,
      manualReviewFixtures: fixtures.filter((fixture) => fixture.expectedOutput.status === "needs-review").length,
      unsupportedFixtures: fixtures.filter((fixture) => fixture.expectedOutput.status === "unsupported").length,
      providerUnavailableFixtures: fixtures.filter((fixture) => fixture.expectedOutput.status === "provider-unavailable").length,
      emptyFixtures: fixtures.filter((fixture) => fixture.expectedOutput.status === "empty").length,
      receiptRegressionSafetyCovered: fixtures.every((fixture) =>
        Object.values(fixture.receiptRegressionSafety).every(Boolean),
      ),
      safeSummary:
        "Synthetic OCR expectations only. OCR confidence is a review signal, not proof or a final decision.",
    },
  };
}
