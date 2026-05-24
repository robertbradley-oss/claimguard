import type { LocalAnalysisResult } from "@/lib/analysis/types";
import type { RiskLevel } from "@/lib/claim-data";

export type SampleEvidenceFixtureId =
  | "clean-receipt"
  | "item-price-receipt"
  | "quantity-sku-receipt"
  | "lowes-email-order"
  | "ispring-direct-invoice"
  | "adjusted-receipt"
  | "amazon-order-page"
  | "amazon-multi-shipment"
  | "amazon-mobile-actions"
  | "amazon-split-labels"
  | "amazon-ocr-order-number"
  | "amazon-split-date"
  | "amazon-split-context"
  | "amazon-invoice-detail"
  | "suspicious-edited-receipt"
  | "poor-quality-receipt"
  | "sparse-high-confidence-pdf"
  | "pdf-receipt";

export type FixtureExpectationResult = {
  label: string;
  status: "Pass" | "Warning" | "Needs Tuning";
  detail: string;
  note: string;
};

export type SampleEvidenceFixture = {
  id: SampleEvidenceFixtureId;
  label: string;
  fileName: string;
  type: "image" | "pdf";
  description: string;
  expectedRisk: RiskLevel;
  expectedOutcome: string;
  tuningNotes: string;
  loadFile: () => Promise<File>;
  evaluate: (result: LocalAnalysisResult) => FixtureExpectationResult[];
};

export type LoadedEvidenceFixture = {
  fixture: SampleEvidenceFixture;
  file: File;
  previewUrl?: string;
};

const fixedLastModified = new Date("2026-05-01T14:30:00.000Z").getTime();

function drawReceiptCanvas(lines: string[], options?: { poorQuality?: boolean; suspiciousMark?: boolean }) {
  const canvas = document.createElement("canvas");
  const width = options?.poorQuality ? 340 : 820;
  const height = options?.poorQuality ? 250 : 1040;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create receipt fixture canvas.");
  }

  context.fillStyle = options?.poorQuality ? "#f7f4ea" : "#fbfbf6";
  context.fillRect(0, 0, width, height);

  if (options?.suspiciousMark) {
    context.fillStyle = "rgba(255, 248, 190, 0.95)";
    context.fillRect(width * 0.54, height * 0.55, width * 0.32, 68);
    context.strokeStyle = "rgba(190, 82, 38, 0.6)";
    context.setLineDash([8, 8]);
    context.strokeRect(width * 0.54, height * 0.55, width * 0.32, 68);
    context.setLineDash([]);
  }

  context.fillStyle = "#111827";
  context.textBaseline = "top";
  context.font = options?.poorQuality ? "13px Arial" : "28px 'Courier New', monospace";

  const left = options?.poorQuality ? 18 : 86;
  const top = options?.poorQuality ? 22 : 78;
  const lineHeight = options?.poorQuality ? 24 : 46;

  lines.forEach((line, index) => {
    context.fillText(line, left, top + index * lineHeight);
  });

  if (options?.poorQuality) {
    const noisyPixels = 520;
    for (let index = 0; index < noisyPixels; index += 1) {
      context.fillStyle = `rgba(30, 41, 59, ${Math.random() * 0.18})`;
      context.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }
  }

  return canvas;
}

function canvasToFile(canvas: HTMLCanvasElement, fileName: string, quality = 0.92) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Could not generate ${fileName}.`));
          return;
        }

        resolve(new File([blob], fileName, { type: blob.type, lastModified: fixedLastModified }));
      },
      "image/jpeg",
      quality,
    );
  });
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdfFile(lines: string[], fileName: string, options?: { fontSize?: number; lineHeight?: number; startY?: number }) {
  const fontSize = options?.fontSize ?? 16;
  const lineHeight = options?.lineHeight ?? 30;
  const startY = options?.startY ?? 720;
  const contentLines = lines
    .map((line, index) => `${index === 0 ? `72 ${startY} Td` : `0 -${lineHeight} Td`} (${escapePdfText(line)}) Tj`)
    .join("\n");
  const stream = `BT\n/F1 ${fontSize} Tf\n${contentLines}\nET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new File([pdf], fileName, { type: "application/pdf", lastModified: fixedLastModified });
}

function hasReviewSignal(result: LocalAnalysisResult) {
  return result.signals.some((signal) => signal.severity === "Medium" || signal.severity === "High");
}

function expectationStatus(condition: boolean, fallback: FixtureExpectationResult["status"] = "Needs Tuning") {
  return condition ? "Pass" : fallback;
}

export const sampleEvidenceFixtures: SampleEvidenceFixture[] = [
  {
    id: "clean-receipt",
    label: "Clean low-risk receipt",
    fileName: "clean-low-risk-receipt.jpg",
    type: "image",
    description: "Readable retail receipt with merchant, order number, date, total, and payment method.",
    expectedRisk: "Low",
    expectedOutcome: "Low risk with no material review signal beyond normal purchase matching.",
    tuningNotes:
      "Use this as the baseline for readable synthetic receipts. Clean synthetic fixtures are expected to score high because they test parser recognition and internal consistency, not real-world verification.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "BEST BUY RECEIPT",
          "Order #: BBY-482917",
          "Date: 04/18/2026",
          "iSpring replacement filter",
          "Subtotal: $84.99",
          "Tax: $6.80",
          "Total: $91.79",
          "Visa ending 4242",
          "Thank you for your purchase",
        ]),
        "clean-low-risk-receipt.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Clean receipt scores low risk",
        status: expectationStatus(result.riskLevel === "Low" && result.score >= 80, "Warning"),
        detail: `Expected Low risk at 80+, received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel === "Low"
            ? "Clean fixture is behaving as the current thresholds expect."
            : "Review OCR text and missing fields before lowering thresholds; synthetic canvas OCR can vary.",
      },
    ],
  },
  {
    id: "item-price-receipt",
    label: "Item-price receipt",
    fileName: "item-price-receipt.jpg",
    type: "image",
    description: "Readable receipt with product names and prices on the same lines plus subtotal, tax, and total summary lines.",
    expectedRisk: "Low",
    expectedOutcome: "Product-price lines should count as item detail while subtotal/tax/total lines remain summary context.",
    tuningNotes:
      "Use this to tune real retail receipts where item names and prices share a line. Summary lines should not be mistaken for purchased-item evidence.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "WALMART RECEIPT",
          "Order #: WMT-829401",
          "Date: 04/24/2026",
          "iSpring filter cartridge $39.98",
          "Replacement wrench kit $8.50",
          "Subtotal: $48.48",
          "Tax: $3.64",
          "Total: $52.12",
          "Mastercard ending 4242",
          "Return policy applies",
        ]),
        "item-price-receipt.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Item-price receipt extracts product-price lines",
        status: expectationStatus(
          result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /iSpring filter cartridge/i.test(candidate)) &&
            result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /Replacement wrench kit/i.test(candidate)),
          "Warning",
        ),
        detail: `Accepted item candidates: ${result.receipt.parsingDetails.lineItemCandidates.join(" | ") || "none"}.`,
        note:
          "Product names with trailing prices should remain item evidence after the price is stripped from the candidate text.",
      },
      {
        label: "Item-price receipt rejects summary amount lines",
        status: expectationStatus(
          !result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /\b(subtotal|tax|total)\b/i.test(candidate)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /Subtotal/i.test(candidate.text)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /Total/i.test(candidate.text)),
          "Warning",
        ),
        detail: `Rejected: ${
          result.receipt.parsingDetails.rejectedLineItemCandidates.map((candidate) => `${candidate.reason}: ${candidate.text}`).join(" | ") ||
          "none"
        }.`,
        note:
          "Subtotal, tax, and total lines should remain amount structure, not purchased-item evidence.",
      },
      {
        label: "Item-price receipt stays low concern",
        status: expectationStatus(result.riskLevel === "Low" && result.score >= 80, "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel === "Low"
            ? "Product-price lines are not creating unnecessary review signals."
            : "Inspect whether summary line rejection or OCR noise is reducing an otherwise readable receipt.",
      },
    ],
  },
  {
    id: "quantity-sku-receipt",
    label: "Quantity and SKU receipt",
    fileName: "quantity-sku-receipt.jpg",
    type: "image",
    description: "Readable retail receipt with SKU, UPC, and quantity prefixes before product names and prices.",
    expectedRisk: "Low",
    expectedOutcome: "SKU/UPC and quantity prefixes should be stripped while product detail remains visible.",
    tuningNotes:
      "Use this to tune retail layouts where item codes or quantities precede product text. Order IDs, totals, and payment lines should remain non-item context.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "TARGET RECEIPT",
          "Order #: 992104",
          "Date: 04/25/2026",
          "SKU 7742 ISPRING FILTER PACK $29.99",
          "2 X REPLACEMENT O RING KIT $15.00",
          "UPC 019876 WRENCH TOOL $5.25",
          "Subtotal: $50.24",
          "Sales Tax: $3.77",
          "Grand Total: $54.01",
          "Visa ending 7742",
        ]),
        "quantity-sku-receipt.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Quantity and SKU receipt strips item prefixes",
        status: expectationStatus(
          result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /ISPRING FILTER PACK/i.test(candidate)) &&
            result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /REPLACEMENT O[- ]RING KIT/i.test(candidate)) &&
            result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /WRENCH TOOL/i.test(candidate)),
          "Warning",
        ),
        detail: `Accepted item candidates: ${result.receipt.parsingDetails.lineItemCandidates.join(" | ") || "none"}.`,
        note:
          "SKU/UPC codes and quantity prefixes should not obscure the purchased-item text used for proof-of-purchase matching.",
      },
      {
        label: "Quantity and SKU receipt rejects non-item structure",
        status: expectationStatus(
          !result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /\b(order|subtotal|tax|total|visa)\b/i.test(candidate)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /Order #/i.test(candidate.text)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /Total/i.test(candidate.text)),
          "Warning",
        ),
        detail: `Rejected: ${
          result.receipt.parsingDetails.rejectedLineItemCandidates.map((candidate) => `${candidate.reason}: ${candidate.text}`).join(" | ") ||
          "none"
        }.`,
        note:
          "Order identifiers, totals, tax, and payment cues should remain structure or matching context, not purchased-item evidence.",
      },
      {
        label: "Quantity and SKU receipt stays low concern",
        status: expectationStatus(result.riskLevel === "Low" && result.score >= 80, "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel === "Low"
            ? "Common retail item-code layouts are not creating unnecessary review signals."
            : "Inspect whether item-code normalization, OCR, or summary-line rejection is reducing an otherwise readable receipt.",
      },
    ],
  },
  {
    id: "suspicious-edited-receipt",
    label: "Suspicious edited receipt",
    fileName: "suspicious-edited-receipt.jpg",
    type: "image",
    description: "Receipt-like image with an invalid Amazon-style order number and an emphasized total area.",
    expectedRisk: "Medium",
    expectedOutcome: "Review signals should be present, especially order-number or field-verification signals.",
    tuningNotes:
      "This fixture is a smoke test for review-signal sensitivity, not proof of real editing detection. Watch whether invalid order patterns and field inconsistencies remain visible.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas(
          [
            "AMAZON RECEIPT",
            "Order #: 123-ABCDE-9999999",
            "Date: 05/02/2026",
            "iSpring RCC7AK Filter System",
            "Subtotal: $129.00",
            "Shipping: $0.00",
            "Tax: $9.68",
            "Total: $48.00",
            "Payment manually entered",
          ],
          { suspiciousMark: true },
        ),
        "suspicious-edited-receipt.jpg",
        0.88,
      ),
    evaluate: (result) => [
      {
        label: "Suspicious receipt triggers review signals",
        status: expectationStatus(hasReviewSignal(result)),
        detail: `${result.signals.length} signal(s) generated: ${result.signals.map((signal) => signal.title).join(", ") || "none"}.`,
        note: hasReviewSignal(result)
          ? "At least one medium/high review signal was generated for manual review."
          : "Needs tuning if the OCR extracted enough text but no review signal was raised.",
      },
      {
        label: "Suspicious receipt does not clear as low-risk clean",
        status: expectationStatus(result.riskLevel !== "Low" || hasReviewSignal(result), "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "Low"
            ? "Risk level is elevated enough for the current synthetic scenario."
            : "A low score may still be acceptable if review signals are shown prominently.",
      },
    ],
  },
  {
    id: "lowes-email-order",
    label: "Lowe's email order",
    fileName: "lowes-email-order.jpg",
    type: "image",
    description: "Lowe's-style order email screenshot with order-card wording, delivered status, long order number, product detail, and totals.",
    expectedRisk: "Low",
    expectedOutcome: "Lowe's email/order screenshots should classify as Lowe's without Amazon-specific order validation.",
    tuningNotes:
      "Use this to tune non-Amazon order email screenshots. The long Lowe's order number and email-card actions should not be treated as Amazon order-format issues.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Lowe's Home Improvement",
          "Thanks, Customer",
          "We've Received Your Order",
          "RO600-ORB Dual-stage Membrane",
          "1 item from Lowe's",
          "Delivered Mon, May 11",
          "Order number 300902124262935542",
          "View order",
          "Review store",
          "Subtotal: $198.77",
          "Shipping: $0.00",
          "Estimated tax: $13.42",
          "Total: $212.19",
          "Payment method Visa ending in 4242",
        ]),
        "lowes-email-order.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Lowe's email order source is classified",
        status: expectationStatus(
          result.receipt.sourceClassification.category === "lowes-email-order" &&
            result.receipt.source === "merchant-receipt",
          "Warning",
        ),
        detail: `Class ${result.receipt.sourceClassification.label}; legacy source ${result.receipt.source}; cues ${result.receipt.sourceClassification.cues.join(
          " | ",
        )}.`,
        note:
          "Lowe's email/order screenshots should get a non-Amazon source category so Amazon-only scoring checks do not apply.",
      },
      {
        label: "Lowe's email order skips Amazon order validation",
        status: expectationStatus(
          result.receipt.structure.amazonOrderFormat === "not-applicable" &&
            !result.signals.some((signal) => /Amazon/i.test(signal.title)),
          "Warning",
        ),
        detail: `Amazon format ${result.receipt.structure.amazonOrderFormat}; signals: ${
          result.signals.map((signal) => signal.title).join(" | ") || "none"
        }.`,
        note:
          "A long Lowe's order number should not become an Amazon order-number issue.",
      },
      {
        label: "Lowe's email order stays low concern",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Lowe's source classification is not creating unnecessary high-risk treatment."
            : "Inspect whether email-card structure, OCR limits, or missing fields are over-penalizing a readable non-Amazon receipt.",
      },
    ],
  },
  {
    id: "ispring-direct-invoice",
    label: "iSpring direct invoice",
    fileName: "ispring-direct-invoice.pdf",
    type: "pdf",
    description: "Synthetic iSpring direct website invoice with order details, Stripe payment, addresses, product table, order history, and footer text.",
    expectedRisk: "Low",
    expectedOutcome: "iSpring direct invoices should classify as iSpring direct and keep product table rows separate from footer/account text.",
    tuningNotes:
      "Use this to tune iSpring direct PDF invoices. This is a clean synthetic fixture, so a high reliability score means parser recognition and internal consistency are working; it does not mean the fake test invoice is externally verified or real. Product table rows should count as item evidence, while address, account nav, order history, testimonial, newsletter, and footer rows should stay out of item evidence.",
    loadFile: () =>
      Promise.resolve(
        createPdfFile(
          [
            "iSpringFilter.com",
            "iSpring Water Systems",
            "REFERRAL WARRANTY DEALER FAQ ACCOUNT 0 ITEMS - $0.00",
            "Home > Account > Invoice",
            "ORDER DETAILS",
            "SYNTHETIC TEST RECEIPT - NOT VALID FOR PURCHASE, WARRANTY, OR CLAIMS",
            "Order ID",
            "#CG-TEST-948271",
            "Status",
            "Shipped",
            "E-Mail",
            "test.customer@example.invalid",
            "Telephone",
            "(555) 010-4826",
            "Shipping Method",
            "Free Shipping",
            "Payment Method",
            "Credit Card / Debit Card Via Stripe",
            "Shipping Address",
            "Alex Example",
            "1234 Sample Creek Drive",
            "Fictional City, GA 30000",
            "United States",
            "Payment Address",
            "Alex Example",
            "1234 Sample Creek Drive",
            "Fictional City, GA 30000",
            "United States",
            "Image Product Model Quantity Unit Price Total",
            "iSpring RCC7AK NSF Certified 75 GPD Alkaline 6-Stage Reverse Osmosis System RCC7AK 1 $241.99 $241.99",
            "iSpring F9K Standard 6-Stage Alkaline Replacement Cartridges F9K 1 $80.99 $80.99",
            "Greatwell MC7 RO Membrane Replacement 75 GPD MC7 1 $42.99 $42.99",
            "Sub-Total: $365.97",
            "Free Shipping: $0.00",
            "Test Coupon 15% Off Replacement Filters: -$18.59",
            "Total: $347.38",
            "Order History",
            "Date Added Status Customer order comment",
            "2026-05-09 Pending",
            "2026-05-11 Shipped Order shipped Tracking#: TESTTRACK123456 Carrier: FedEx",
            "ABOUT US",
            "iSpring Water Systems LLC is a water filtration company specializing in clean water solutions.",
            "CONTACT US",
            "iSpring Customer Support Center",
            "TESTIMONIALS",
            "5.0 of 5 stars - Great filtration system. Verified purchase. Footer text is synthetic.",
            "NEWSLETTER SIGNUP",
            "Sign up to our newsletter and get attractive offers.",
            "HOME WHAT'S NEW REVERSE OSMOSIS SYSTEMS WHOLE HOUSE SYSTEMS REPLACEMENT CARTRIDGES BLOG",
          ],
          "ispring-direct-invoice.pdf",
          { fontSize: 8, lineHeight: 12, startY: 760 },
        ),
      ),
    evaluate: (result) => [
      {
        label: "iSpring direct invoice source is classified",
        status: expectationStatus(
          result.receipt.sourceClassification.category === "ispring-direct-invoice" &&
            result.receipt.source === "merchant-receipt",
          "Warning",
        ),
        detail: `Class ${result.receipt.sourceClassification.label}; legacy source ${result.receipt.source}; cues ${result.receipt.sourceClassification.cues.join(
          " | ",
        )}.`,
        note:
          "iSpring direct PDF invoices should get a non-Amazon source category so Amazon-only scoring checks do not apply.",
      },
      {
        label: "iSpring direct invoice keeps product table rows",
        status: expectationStatus(
          result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /RCC7AK/i.test(candidate)) &&
            result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /F9K/i.test(candidate)) &&
            result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /MC7/i.test(candidate)),
          "Warning",
        ),
        detail: `Accepted item candidates: ${result.receipt.parsingDetails.lineItemCandidates.join(" | ") || "none"}.`,
        note:
          "Product table rows with model, quantity, unit price, and total should remain useful item evidence.",
      },
      {
        label: "iSpring direct invoice has privacy-safe source summary",
        status: expectationStatus(
          result.receipt.sourceSpecificSummary?.category === "ispring-direct-invoice" &&
            (result.receipt.sourceSpecificSummary?.confidence ?? 0) >= 80 &&
            (result.receipt.sourceSpecificSummary?.productTableRowCount ?? 0) >= 3 &&
            !/test\.customer@example\.invalid|\(555\)|1234 Sample Creek|CG-TEST-948271|TESTTRACK/i.test(
              JSON.stringify(result.receipt.sourceSpecificSummary),
            ),
          "Warning",
        ),
        detail: result.receipt.sourceSpecificSummary
          ? `${result.receipt.sourceSpecificSummary.confidence}% confidence; ${result.receipt.sourceSpecificSummary.fieldsPresent}/${result.receipt.sourceSpecificSummary.fieldsExpected} fields; ${result.receipt.sourceSpecificSummary.productTableRowCount ?? 0} product rows.`
          : "No source-specific summary.",
        note:
          "iSpring source summaries should expose field presence, counts, and structure confidence without raw private values.",
      },
      {
        label: "iSpring direct invoice rejects footer and private rows",
        status: expectationStatus(
          !result.receipt.parsingDetails.lineItemCandidates.some((candidate) =>
            /\b(newsletter|testimonials?|about us|contact us|account|shipping address|payment address|example|verified purchase|tracking)\b/i.test(
              candidate,
            ),
          ) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /NEWSLETTER/i.test(candidate.text)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /Shipping Address/i.test(candidate.text)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /test\.customer@example\.invalid/i.test(candidate.text)),
          "Warning",
        ),
        detail: `Rejected: ${
          result.receipt.parsingDetails.rejectedLineItemCandidates.map((candidate) => `${candidate.reason}: ${candidate.text}`).join(" | ") ||
          "none"
        }.`,
        note:
          "Footer, testimonial, newsletter, account/navigation, addresses, emails, phones, and order-history rows should not become product evidence.",
      },
      {
        label: "iSpring direct invoice skips Amazon order validation",
        status: expectationStatus(
          result.receipt.structure.amazonOrderFormat === "not-applicable" &&
            !result.signals.some((signal) => /Amazon/i.test(signal.title)),
          "Warning",
        ),
        detail: `Amazon format ${result.receipt.structure.amazonOrderFormat}; signals: ${
          result.signals.map((signal) => signal.title).join(" | ") || "none"
        }.`,
        note:
          "iSpring direct order IDs should not become Amazon order-number issues.",
      },
      {
        label: "iSpring direct invoice stays low concern",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "iSpring direct invoice structure is being treated as source-specific purchase context."
            : "Inspect whether PDF extraction, footer rejection, or non-Amazon source classification is over-penalizing a readable fake invoice.",
      },
    ],
  },
  {
    id: "amazon-order-page",
    label: "Amazon order page",
    fileName: "amazon-order-page.jpg",
    type: "image",
    description: "Amazon-style order page with order placed, valid order number, item, ship-to, payment, tax, and order total cues.",
    expectedRisk: "Low",
    expectedOutcome: "Amazon structure cues should be detected without raising an Amazon format review signal.",
    tuningNotes:
      "Use this as the readable Amazon baseline. If it raises Amazon structure review signals, inspect whether OCR missed order placed/date, order total, payment method, or ship/delivery cues.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Amazon.com",
          "Order placed: April 21, 2026",
          "Order #: 111-7654321-1234567",
          "Items Ordered",
          "iSpring RCC7AK Filter System",
          "Sold by: iSpring Water Systems",
          "Ship to: Redacted Recipient",
          "Payment Method: Visa ending in 4242",
          "Item subtotal: $189.99",
          "Shipping: $0.00",
          "Tax: $14.25",
          "Order Total: $204.24",
          "Delivered April 24, 2026",
        ]),
        "amazon-order-page.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Amazon order page detects valid order format",
        status: expectationStatus(
          result.receipt.source === "amazon" &&
            result.receipt.structure.amazonOrderFormat === "valid" &&
            result.receipt.orderNumberValid === true,
          "Warning",
        ),
        detail: `Source ${result.receipt.source}; order format ${result.receipt.structure.amazonOrderFormat}; order valid ${String(result.receipt.orderNumberValid)}.`,
        note:
          result.receipt.structure.amazonOrderFormat === "valid"
            ? "Amazon order number format is detected for the readable baseline."
            : "Review OCR text and order-number extraction before tightening Amazon thresholds.",
      },
      {
        label: "Amazon structure cues are present",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasOrderPlacedCue &&
              result.receipt.structure.amazonSignals.hasOrderTotalCue &&
              result.receipt.structure.amazonSignals.hasPaymentCue &&
              result.receipt.structure.amazonSignals.hasShipToOrDeliveryCue,
          ),
          "Warning",
        ),
        detail: JSON.stringify(result.receipt.structure.amazonSignals ?? {}),
        note:
          "Order placed/date, order total, payment, and ship/delivery cues should appear before treating Amazon structure checks as reliable.",
      },
      {
        label: "Amazon baseline stays low concern",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Readable Amazon order-page evidence is not being treated like the suspicious Amazon fixture."
            : "Inspect whether Amazon structure signals are over-penalizing a readable baseline.",
      },
    ],
  },
  {
    id: "amazon-multi-shipment",
    label: "Amazon multi-shipment",
    fileName: "amazon-multi-shipment.jpg",
    type: "image",
    description: "Amazon mobile/order-style receipt with order summary, shipment section, arriving cue, and partial shipment total.",
    expectedRisk: "Low",
    expectedOutcome: "Multi-shipment wording should appear as order-matching context, not a standalone suspicious signal.",
    tuningNotes:
      "Use this to tune Amazon mobile screenshots and multi-shipment pages. Review whether shipment cues, item detail, payment, and order summary are visible without over-penalizing the receipt.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Amazon",
          "Ordered on April 19, 2026",
          "Order # 222-1234567-7654321",
          "Order Summary",
          "Shipment 1 of 2",
          "Arriving April 23",
          "Items in this order",
          "iSpring replacement filter pack",
          "Shipped to Redacted Recipient",
          "Payment Method Visa ending in 4242",
          "Item subtotal: $74.99",
          "Shipping: $0.00",
          "Estimated tax: $5.62",
          "Order Total: $80.61",
        ]),
        "amazon-multi-shipment.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Amazon multi-shipment cues are detected",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasMultiShipmentCue &&
              result.receipt.structure.amazonSignals.hasArrivalOrShipmentCue &&
              result.receipt.structure.amazonSignals.hasOrderSummaryCue,
          ),
          "Warning",
        ),
        detail: JSON.stringify(result.receipt.structure.amazonSignals ?? {}),
        note:
          "Shipment, arrival, and order-summary cues should be visible as order-matching context for Amazon mobile/order pages.",
      },
      {
        label: "Amazon multi-shipment keeps proof cues",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasOrderPlacedCue &&
              result.receipt.structure.amazonSignals.hasItemsOrderedCue &&
              result.receipt.structure.amazonSignals.hasPaymentCue &&
              result.receipt.structure.amazonOrderFormat === "valid",
          ),
          "Warning",
        ),
        detail: `Order format ${result.receipt.structure.amazonOrderFormat}; missing fields: ${result.receipt.missingFields.join(", ") || "none"}.`,
        note:
          "Readable multi-shipment evidence should still expose order date, item detail, payment, and valid order-number format.",
      },
      {
        label: "Amazon multi-shipment does not become automatic high risk",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Multi-shipment wording is being treated as matching context rather than standalone high-risk evidence."
            : "Inspect whether multi-shipment context or OCR limits are over-penalizing a readable Amazon baseline.",
      },
    ],
  },
  {
    id: "amazon-mobile-actions",
    label: "Amazon mobile actions",
    fileName: "amazon-mobile-actions.jpg",
    type: "image",
    description: "Amazon mobile/order screenshot with product detail mixed with action buttons and delivery/status rows.",
    expectedRisk: "Low",
    expectedOutcome: "Action/status rows should be rejected as context while the product line remains item evidence.",
    tuningNotes:
      "Use this to tune real Amazon mobile screenshots where navigation buttons appear near proof-of-purchase details. Action rows should not count as purchased items.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Amazon",
          "Order placed: April 18, 2026",
          "Order # 444-4567890-2345678",
          "iSpring replacement filter pack",
          "Sold by: iSpring Water Systems",
          "Delivered April 23",
          "Track package",
          "Buy again",
          "Return window closed on May 20, 2026",
          "View invoice",
          "Payment Method Visa ending in 4242",
          "Order Total: $74.99",
        ]),
        "amazon-mobile-actions.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Amazon mobile actions keep product detail",
        status: expectationStatus(
          result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /iSpring replacement filter pack/i.test(candidate)),
          "Warning",
        ),
        detail: `Accepted item candidates: ${result.receipt.parsingDetails.lineItemCandidates.join(" | ") || "none"}.`,
        note:
          "The product line should remain visible as item evidence even when Amazon mobile action rows are nearby.",
      },
      {
        label: "Amazon mobile actions reject navigation rows",
        status: expectationStatus(
          !result.receipt.parsingDetails.lineItemCandidates.some((candidate) =>
            /\b(buy again|track package|return window|view invoice|delivered)\b/i.test(candidate),
          ) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /Buy again/i.test(candidate.text)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /Track package/i.test(candidate.text)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some(
              (candidate) => /Return window/i.test(candidate.text) && /Navigation, action, or status text/i.test(candidate.reason),
            ) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /View invoice/i.test(candidate.text)),
          "Warning",
        ),
        detail: `Rejected: ${
          result.receipt.parsingDetails.rejectedLineItemCandidates.map((candidate) => `${candidate.reason}: ${candidate.text}`).join(" | ") ||
          "none"
        }.`,
        note:
          "Mobile action, delivery-status, and invoice/navigation rows should be visible as rejected context instead of purchased-item evidence.",
      },
      {
        label: "Amazon mobile actions stay low concern",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Navigation/action rows are being treated as receipt context rather than suspicious evidence."
            : "Inspect whether action/status rows or OCR limits are over-penalizing a readable Amazon mobile baseline.",
      },
    ],
  },
  {
    id: "amazon-split-labels",
    label: "Amazon split labels",
    fileName: "amazon-split-labels.jpg",
    type: "image",
    description: "Amazon mobile/order receipt where payment and amount labels are split from their values on adjacent OCR lines.",
    expectedRisk: "Low",
    expectedOutcome: "Adjacent amount and payment values should be paired with their labels for clearer parsing.",
    tuningNotes:
      "Use this to tune real mobile screenshots where OCR breaks `Order Total` and `Payment Information` onto separate lines from their values.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Amazon",
          "Order placed: April 17, 2026",
          "Order # 555-5678901-3456789",
          "Items Ordered",
          "iSpring countertop filter cartridge",
          "Payment Information",
          "Visa ending in 4242",
          "Item subtotal",
          "$84.99",
          "Estimated tax",
          "$5.00",
          "Order Total",
          "$89.99",
          "Delivered April 21, 2026",
        ]),
        "amazon-split-labels.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Amazon split labels pair order total",
        status: expectationStatus(
          result.receipt.total === "89.99" && /Orders? Total/i.test(result.receipt.parsingDetails.selectedTotalSource ?? ""),
          "Warning",
        ),
        detail: `Total ${result.receipt.total ?? "none"} from ${result.receipt.parsingDetails.selectedTotalSource ?? "no source"}.`,
        note:
          "Split `Order Total` and value lines should parse as a labeled total instead of a last-visible-amount fallback.",
      },
      {
        label: "Amazon split labels pair payment detail",
        status: expectationStatus(
          /Payment detail after label/i.test(result.receipt.parsingDetails.paymentSource ?? "") &&
            result.receipt.parsingDetails.paymentCandidates.some((candidate) => /Payment Information Visa ending in 4242/i.test(candidate.value)),
          "Warning",
        ),
        detail: `Payment source ${result.receipt.parsingDetails.paymentSource ?? "none"}; candidates: ${
          result.receipt.parsingDetails.paymentCandidates.map((candidate) => `${candidate.label}: ${candidate.value}`).join(" | ") || "none"
        }.`,
        note:
          "Split payment labels should stay tied to the following card detail so real receipt QA can understand why a payment method was selected.",
      },
      {
        label: "Amazon split labels keep proof cues",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasOrderPlacedCue &&
              result.receipt.structure.amazonSignals.hasItemsOrderedCue &&
              result.receipt.structure.amazonSignals.hasOrderTotalCue &&
              result.receipt.structure.amazonSignals.hasPaymentCue &&
              result.receipt.structure.amazonOrderFormat === "valid",
          ),
          "Warning",
        ),
        detail: JSON.stringify(result.receipt.structure.amazonSignals ?? {}),
        note:
          "Readable split-label Amazon receipts should still expose order date, item detail, payment, total, and valid order format.",
      },
      {
        label: "Amazon split labels stay low concern",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Adjacent label/value pairing is not creating unnecessary high-risk treatment."
            : "Inspect whether split-line parsing or OCR limits are over-penalizing a readable Amazon baseline.",
      },
    ],
  },
  {
    id: "amazon-ocr-order-number",
    label: "Amazon OCR order number",
    fileName: "amazon-ocr-order-number.jpg",
    type: "image",
    description: "Amazon receipt where OCR has removed order-number dashes and left the 3-7-7 digit groups spaced apart.",
    expectedRisk: "Low",
    expectedOutcome: "Spaced Amazon order-number groups should normalize to the standard 000-0000000-0000000 format.",
    tuningNotes:
      "Use this to tune Amazon order-number extraction when OCR converts dashes to spaces or drops separators in mobile screenshots.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Amazon",
          "Order placed: April 16, 2026",
          "Order # 666 6789012 4567890",
          "Items Ordered",
          "iSpring replacement membrane",
          "Payment Method Visa ending in 4242",
          "Item subtotal: $64.99",
          "Estimated tax: $4.87",
          "Order Total: $69.86",
          "Delivered April 20, 2026",
        ]),
        "amazon-ocr-order-number.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Amazon OCR order number normalizes spaced groups",
        status: expectationStatus(
          result.receipt.orderNumber === "666-6789012-4567890" &&
            result.receipt.structure.amazonOrderFormat === "valid" &&
            result.receipt.orderNumberValid === true,
          "Warning",
        ),
        detail: `Order ${result.receipt.orderNumber ?? "none"}; format ${result.receipt.structure.amazonOrderFormat}; valid ${String(
          result.receipt.orderNumberValid,
        )}.`,
        note:
          "Spaced 3-7-7 Amazon order-number OCR should normalize before validation, without treating the receipt as invalid-format evidence.",
      },
      {
        label: "Amazon OCR order number keeps proof cues",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasOrderPlacedCue &&
              result.receipt.structure.amazonSignals.hasItemsOrderedCue &&
              result.receipt.structure.amazonSignals.hasOrderTotalCue &&
              result.receipt.structure.amazonSignals.hasPaymentCue,
          ),
          "Warning",
        ),
        detail: JSON.stringify(result.receipt.structure.amazonSignals ?? {}),
        note:
          "Readable Amazon receipts with separator OCR issues should still expose the usual proof-of-purchase cues.",
      },
      {
        label: "Amazon OCR order number stays low concern",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Order-number separator OCR is being normalized before risk scoring."
            : "Inspect whether order-number normalization or OCR limits are over-penalizing a readable Amazon baseline.",
      },
    ],
  },
  {
    id: "amazon-split-date",
    label: "Amazon split date",
    fileName: "amazon-split-date.jpg",
    type: "image",
    description: "Amazon mobile/order receipt where the order-date label and date value appear on adjacent OCR lines.",
    expectedRisk: "Low",
    expectedOutcome: "Adjacent order-date labels should pair with the following date value and keep Amazon proof cues intact.",
    tuningNotes:
      "Use this to tune mobile screenshots where OCR reads `Ordered` or `Order placed` on one line and the purchase date on the next line.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Amazon",
          "Ordered",
          "04/15/2026",
          "Order # 777-7890123-5678901",
          "Items Ordered",
          "iSpring sediment filter pack",
          "Payment Method Visa ending in 4242",
          "Item subtotal: $44.99",
          "Estimated tax: $3.37",
          "Order Total: $48.36",
          "Delivered April 19, 2026",
        ]),
        "amazon-split-date.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Amazon split date pairs adjacent order date",
        status: expectationStatus(
          result.receipt.purchaseDate === "04/15/2026" &&
            /Adjacent order date label/i.test(result.receipt.parsingDetails.purchaseDateSource ?? ""),
          "Warning",
        ),
        detail: `Date ${result.receipt.purchaseDate ?? "none"} from ${result.receipt.parsingDetails.purchaseDateSource ?? "no source"}.`,
        note:
          "A bare Amazon mobile `Ordered` label should pair with the following date line instead of relying on a numeric fallback.",
      },
      {
        label: "Amazon split date keeps date label out of item evidence",
        status: expectationStatus(
          !result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /\b(ordered|04\/15\/2026)\b/i.test(candidate)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /^Ordered$/i.test(candidate.text)),
          "Warning",
        ),
        detail: `Accepted: ${result.receipt.parsingDetails.lineItemCandidates.join(" | ") || "none"}; rejected: ${
          result.receipt.parsingDetails.rejectedLineItemCandidates.map((candidate) => `${candidate.reason}: ${candidate.text}`).join(" | ") ||
          "none"
        }.`,
        note:
          "Split date labels and date values should remain receipt structure context, not purchased-item evidence.",
      },
      {
        label: "Amazon split date keeps proof cues",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasOrderPlacedCue &&
              result.receipt.structure.amazonSignals.hasItemsOrderedCue &&
              result.receipt.structure.amazonSignals.hasOrderTotalCue &&
              result.receipt.structure.amazonSignals.hasPaymentCue &&
              result.receipt.structure.amazonOrderFormat === "valid",
          ),
          "Warning",
        ),
        detail: JSON.stringify(result.receipt.structure.amazonSignals ?? {}),
        note:
          "Readable split-date Amazon receipts should still expose order date, item detail, payment, total, and valid order format.",
      },
      {
        label: "Amazon split date stays low concern",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Adjacent date-label pairing is not creating unnecessary high-risk treatment."
            : "Inspect whether split date parsing or OCR limits are over-penalizing a readable Amazon baseline.",
      },
    ],
  },
  {
    id: "amazon-split-context",
    label: "Amazon split context",
    fileName: "amazon-split-context.jpg",
    type: "image",
    description: "Amazon receipt sections where seller, ship-to, billing, delivery, and payment labels are split from adjacent values.",
    expectedRisk: "Low",
    expectedOutcome: "Adjacent Amazon context rows should be visible for matching without becoming purchased-item evidence.",
    tuningNotes:
      "Use this to tune OCR layouts where labels such as `Sold by`, `Ship to`, `Billing address`, and `Arriving` appear on separate lines from their values.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Amazon",
          "Order placed: April 14, 2026",
          "Order # 888-8901234-6789012",
          "Sold by",
          "iSpring Water Systems",
          "Shipping address",
          "Redacted Recipient",
          "Billing address",
          "REDACTED ADDRESS",
          "Arriving",
          "April 23, 2026",
          "Items Ordered",
          "iSpring replacement filter pack",
          "Payment Information",
          "Visa ending in 4242",
          "Item subtotal: $72.99",
          "Estimated tax: $5.47",
          "Order Total: $78.46",
        ]),
        "amazon-split-context.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Amazon split context captures adjacent context rows",
        status: expectationStatus(
          Boolean(
            result.receipt.parsingDetails.contextCandidates.some(
              (candidate) => candidate.kind === "seller" && candidate.source === "adjacent line",
            ) &&
              result.receipt.parsingDetails.contextCandidates.some(
                (candidate) => candidate.kind === "recipient" && candidate.source === "adjacent line",
              ) &&
              result.receipt.parsingDetails.contextCandidates.some(
                (candidate) => candidate.kind === "billing" && candidate.source === "adjacent line",
              ) &&
              result.receipt.parsingDetails.contextCandidates.some(
                (candidate) => candidate.kind === "delivery" && candidate.source === "adjacent line",
              ),
          ),
          "Warning",
        ),
        detail: `Context rows: ${
          result.receipt.parsingDetails.contextCandidates
            .map((candidate) => `${candidate.kind}/${candidate.source}: ${candidate.value}`)
            .join(" | ") || "none"
        }.`,
        note:
          "Split seller, recipient, billing, and delivery labels should surface as proof-of-purchase matching context.",
      },
      {
        label: "Amazon split context keeps private and section rows out of item evidence",
        status: expectationStatus(
          result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /iSpring replacement filter pack/i.test(candidate)) &&
            !result.receipt.parsingDetails.lineItemCandidates.some((candidate) =>
              /\b(iSpring Water Systems|Redacted Recipient|REDACTED ADDRESS|Visa ending)\b/i.test(candidate),
            ) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /iSpring Water Systems/i.test(candidate.text)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /Redacted Recipient/i.test(candidate.text)) &&
            result.receipt.parsingDetails.contextCandidates.some(
              (candidate) => candidate.kind === "delivery" && candidate.source === "adjacent line",
            ),
          "Warning",
        ),
        detail: `Accepted: ${result.receipt.parsingDetails.lineItemCandidates.join(" | ") || "none"}; rejected: ${
          result.receipt.parsingDetails.rejectedLineItemCandidates.map((candidate) => `${candidate.reason}: ${candidate.text}`).join(" | ") ||
          "none"
        }.`,
        note:
          "Seller names, private recipient/address rows, delivery dates, and payment values should support receipt context without counting as product detail.",
      },
      {
        label: "Amazon split context keeps proof cues",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasSoldByCue &&
              result.receipt.structure.amazonSignals.hasBillingCue &&
              result.receipt.structure.amazonSignals.hasShipToOrDeliveryCue &&
              result.receipt.structure.amazonSignals.hasArrivalOrShipmentCue &&
              result.receipt.structure.amazonSignals.hasPaymentCue &&
              result.receipt.structure.amazonOrderFormat === "valid",
          ),
          "Warning",
        ),
        detail: JSON.stringify(result.receipt.structure.amazonSignals ?? {}),
        note:
          "Context rows should improve Amazon structure explainability while retaining date, payment, total, item, and valid order-number cues.",
      },
      {
        label: "Amazon split context stays low concern",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Private and split-section context is not creating unnecessary high-risk treatment."
            : "Inspect whether context-row rejection or OCR limits are over-penalizing a readable Amazon baseline.",
      },
    ],
  },
  {
    id: "amazon-invoice-detail",
    label: "Amazon invoice detail",
    fileName: "amazon-invoice-detail.jpg",
    type: "image",
    description: "Amazon invoice/order-detail style receipt with invoice, sold-by, billing, payment, promotion, and order total cues.",
    expectedRisk: "Low",
    expectedOutcome: "Invoice and promotion wording should appear as order-matching context, not standalone suspicious signals.",
    tuningNotes:
      "Use this to tune Amazon printable invoices and order-detail receipts. Review whether invoice, sold-by, billing, promotion, payment, and total cues are visible without over-penalizing the receipt.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "Amazon.com",
          "Invoice # INV-2026-0420",
          "Invoice date: April 20, 2026",
          "Order ID: 333-9876543-2109876",
          "Print this page for your records",
          "iSpring RCC7 replacement cartridge",
          "Sold by: iSpring Water Systems",
          "Billing address: Redacted Recipient",
          "Payment Method: Amazon Store Card ending in 4242",
          "Item subtotal: $54.99",
          "Subscribe & Save promotion: $5.50",
          "Estimated tax: $3.71",
          "Total paid: $53.20",
        ]),
        "amazon-invoice-detail.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Amazon invoice detail cues are detected",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasInvoiceCue &&
              result.receipt.structure.amazonSignals.hasSoldByCue &&
              result.receipt.structure.amazonSignals.hasBillingCue &&
              result.receipt.structure.amazonSignals.hasPromotionCue,
          ),
          "Warning",
        ),
        detail: JSON.stringify(result.receipt.structure.amazonSignals ?? {}),
        note:
          "Invoice, sold-by, billing, and promotion cues should be visible as order-matching context for printable Amazon invoices.",
      },
      {
        label: "Amazon invoice filters printable footer text",
        status: expectationStatus(
          !result.receipt.parsingDetails.lineItemCandidates.some((candidate) => /print this page/i.test(candidate)) &&
            result.receipt.parsingDetails.rejectedLineItemCandidates.some((candidate) => /print this page/i.test(candidate.text)),
          "Warning",
        ),
        detail: `Accepted: ${result.receipt.parsingDetails.lineItemCandidates.join(" | ") || "none"}; rejected: ${
          result.receipt.parsingDetails.rejectedLineItemCandidates.map((candidate) => `${candidate.reason}: ${candidate.text}`).join(" | ") || "none"
        }.`,
        note:
          "Printable invoice footer text should be visible as rejected context instead of being counted as purchased-item evidence.",
      },
      {
        label: "Amazon invoice detail keeps proof cues",
        status: expectationStatus(
          Boolean(
            result.receipt.structure.amazonSignals?.hasPaymentCue &&
              result.receipt.structure.amazonSignals.hasOrderTotalCue &&
              result.receipt.structure.amazonOrderFormat === "valid",
          ),
          "Warning",
        ),
        detail: `Order format ${result.receipt.structure.amazonOrderFormat}; missing fields: ${result.receipt.missingFields.join(", ") || "none"}.`,
        note:
          "Readable invoice/order-detail evidence should still expose payment, final total, and a valid Amazon order-number format.",
      },
      {
        label: "Amazon invoice detail does not become automatic high risk",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Invoice and promotion wording is being treated as matching context rather than standalone high-risk evidence."
            : "Inspect whether invoice or promotion context is over-penalizing a readable Amazon baseline.",
      },
    ],
  },
  {
    id: "adjusted-receipt",
    label: "Adjusted receipt",
    fileName: "adjusted-receipt.jpg",
    type: "image",
    description: "Readable receipt with discount, return-credit, gift-card, and split-payment style amount lines.",
    expectedRisk: "Low",
    expectedOutcome: "Reconciliation notes should explain payment adjustments without treating them as suspicious by themselves.",
    tuningNotes:
      "Use this to tune discount/refund/split-payment layouts. Amount notes should prompt order-record matching, while the receipt can still remain low concern when core fields are readable.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas([
          "TARGET RECEIPT",
          "Order #: TGT-739201",
          "Purchased on: 04/22/2026",
          "iSpring replacement cartridge",
          "Subtotal: $94.99",
          "Discount applied: $10.00",
          "Return credit applied: $5.00",
          "Tax: $6.80",
          "Total paid: $86.79",
          "Gift card: $25.00",
          "Visa ending 4242: $61.79",
          "Thank you for your purchase",
        ]),
        "adjusted-receipt.jpg",
      ),
    evaluate: (result) => [
      {
        label: "Adjusted receipt shows reconciliation notes",
        status: expectationStatus(result.receipt.parsingDetails.amountReviewNotes.length >= 2, "Warning"),
        detail: `${result.receipt.parsingDetails.amountReviewNotes.length} amount note(s): ${result.receipt.parsingDetails.amountReviewNotes.join(" | ") || "none"}.`,
        note:
          result.receipt.parsingDetails.amountReviewNotes.length > 0
            ? "Payment-adjustment cues are visible for manual order-record matching."
            : "Needs tuning if OCR captured adjustment lines but no reconciliation notes were generated.",
      },
      {
        label: "Adjusted receipt shows payment candidates",
        status: expectationStatus(result.receipt.parsingDetails.paymentCandidates.length >= 2, "Warning"),
        detail: `${result.receipt.parsingDetails.paymentCandidates.length} payment candidate(s): ${
          result.receipt.parsingDetails.paymentCandidates.map((candidate) => `${candidate.kind}:${candidate.value}`).join(" | ") || "none"
        }.`,
        note:
          result.receipt.parsingDetails.paymentCandidates.length >= 2
            ? "Split-tender payment cues are visible for manual order-record matching."
            : "Needs tuning if OCR captured gift-card and card lines but payment candidates were not generated.",
      },
      {
        label: "Adjusted receipt does not become automatic high risk",
        status: expectationStatus(result.riskLevel !== "High", "Warning"),
        detail: `Received ${result.riskLevel} at ${result.score}.`,
        note:
          result.riskLevel !== "High"
            ? "Adjustment lines are being treated as reconciliation context rather than standalone high-risk evidence."
            : "Inspect whether amount notes or OCR limits are over-penalizing a readable adjusted receipt.",
      },
    ],
  },
  {
    id: "poor-quality-receipt",
    label: "Poor-quality inconclusive receipt",
    fileName: "poor-quality-inconclusive-receipt.jpg",
    type: "image",
    description: "Low-resolution compressed receipt image intended to make OCR and field parsing unreliable.",
    expectedRisk: "Medium",
    expectedOutcome: "Inconclusive or manual review language because key fields cannot be trusted.",
    tuningNotes:
      "Use this to tune inconclusive/manual-review wording. The exact OCR confidence can swing, so the key question is whether support-safe uncertainty is visible without making poor OCR sound like confirmed high risk.",
    loadFile: () =>
      canvasToFile(
        drawReceiptCanvas(
          [
            "RECEIPT",
            "Order: unclear",
            "Date: 04/??/26",
            "Total: maybe 91.79",
            "card unreadable",
          ],
          { poorQuality: true },
        ),
        "poor-quality-inconclusive-receipt.jpg",
        0.22,
      ),
    evaluate: (result) => [
      {
        label: "Poor-quality receipt uses manual-review language",
        status: expectationStatus(
          /manual review|additional proof|clearer proof|could not confidently|unable to assess|findings are inconclusive|needs attention/i.test(
            `${result.reviewLabel} ${result.recommendedSupportAction} ${result.customerSafeWording} ${result.evidenceSummary}`,
          ) &&
            (result.ocr.averageConfidence >= 60 ||
              result.riskLevel !== "High"),
        ),
        detail: `Received ${result.riskLevel} / ${result.reviewLabel} at ${result.score}; OCR confidence ${result.ocr.averageConfidence}%.`,
        note:
          "When OCR is actually weak, low-quality evidence should ask for clearer proof without implying intentional misconduct. If this synthetic image OCRs clearly, tune against real low-OCR observations instead.",
      },
      {
        label: "Poor-quality receipt is not treated as clean",
        status: expectationStatus(
          result.riskLevel !== "Low" || result.ocr.averageConfidence < 60 || result.receipt.missingFields.length >= 3,
        ),
        detail: `${result.receipt.missingFields.length} missing parsed field(s).`,
        note:
          "If this clears as clean with high OCR confidence, strengthen image-quality or missing-field penalties.",
      },
    ],
  },
  {
    id: "sparse-high-confidence-pdf",
    label: "Sparse high-confidence PDF",
    fileName: "sparse-high-confidence-receipt.pdf",
    type: "pdf",
    description: "Synthetic text-layer PDF with high OCR confidence but too little extracted receipt text for clear coverage.",
    expectedRisk: "Medium",
    expectedOutcome: "Sparse high-confidence OCR should be evidence-limited, not Clear.",
    tuningNotes:
      "Use this to guard real cases where OCR confidence is high over only a few extracted words. Coverage, not confidence alone, should decide whether OCR is Clear.",
    loadFile: async () =>
      createPdfFile(
        [
          "AMAZON ORDER SUMMARY",
          "TOTAL PAID $53.49",
          "PAYMENT VISA ENDING 1111",
        ],
        "sparse-high-confidence-receipt.pdf",
      ),
    evaluate: (result) => [
      {
        label: "Sparse high-confidence OCR is not Clear",
        status: expectationStatus(
          result.ocr.engine === "pdfjs-text" &&
            result.ocr.averageConfidence >= 90 &&
            result.ocr.quality.wordCount < 12 &&
            result.ocr.quality.label !== "Clear",
        ),
        detail: `${result.ocr.engine}; ${result.ocr.averageConfidence}% OCR; ${result.ocr.quality.wordCount} words; quality ${result.ocr.quality.label}.`,
        note:
          "A high confidence score across sparse text should not imply the receipt evidence is clearly readable.",
      },
      {
        label: "Sparse OCR produces evidence-limit review status",
        status: expectationStatus(
          result.riskLevel === "Medium" &&
            /unable to assess|manual review|could not be fully verified|inconclusive/i.test(
              `${result.reviewLabel} ${result.recommendedSupportAction} ${result.customerSafeWording} ${result.evidenceSummary}`,
            ),
        ),
        detail: `Received ${result.riskLevel} / ${result.reviewLabel} at ${result.score}.`,
        note:
          "Sparse receipt text should ask for manual review or clearer proof without implying external verification or intentional alteration.",
      },
    ],
  },
  {
    id: "pdf-receipt",
    label: "PDF receipt sample",
    fileName: "pdf-receipt-sample.pdf",
    type: "pdf",
    description: "Synthetic PDF receipt with an embedded text layer for local PDF extraction.",
    expectedRisk: "Low",
    expectedOutcome: "Readable PDF receipt with low risk and extracted fields.",
    tuningNotes:
      "Use this to verify PDF text-layer extraction remains distinct from OCR fallback. Real scanned PDFs still need separate tuning.",
    loadFile: async () =>
      createPdfFile(
        [
          "COSTCO RECEIPT",
          "Order #: PDF-582914",
          "Date: 03/28/2026",
          "iSpring RO filter bundle",
          "Subtotal: $199.00",
          "Tax: $15.60",
          "Total: $214.60",
          "Visa ending 7742",
        ],
        "pdf-receipt-sample.pdf",
      ),
    evaluate: (result) => [
      {
        label: "PDF fixture extracts as low risk",
        status: expectationStatus(result.evidenceType === "pdf" && result.riskLevel === "Low" && result.score >= 80, "Warning"),
        detail: `Detected ${result.evidenceType}, ${result.riskLevel} risk at ${result.score}.`,
        note:
          result.ocr.engine === "pdfjs-text"
            ? "PDF text layer extraction is active."
            : "If this falls back to rendered OCR, inspect PDF generation or pdfjs behavior.",
      },
    ],
  },
];

export async function loadSampleEvidenceFixture(id: SampleEvidenceFixtureId): Promise<LoadedEvidenceFixture> {
  const fixture = sampleEvidenceFixtures.find((item) => item.id === id);

  if (!fixture) {
    throw new Error(`Unknown sample evidence fixture: ${id}`);
  }

  const file = await fixture.loadFile();
  const previewUrl = fixture.type === "image" ? URL.createObjectURL(file) : undefined;

  return { fixture, file, previewUrl };
}
