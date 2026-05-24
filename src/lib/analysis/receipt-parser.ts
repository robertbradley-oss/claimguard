import type {
  ExtractedReceiptInfo,
  ReceiptAmountCandidate,
  ReceiptAmountCategory,
  ReceiptContextCandidate,
  ReceiptSourceCategory,
  ReceiptSourceClassification,
  ReceiptSourceStructureField,
  ReceiptSourceStructureSummary,
  RejectedLineItemCandidate,
  ReceiptFieldReliability,
  ReceiptPaymentCandidate,
} from "@/lib/analysis/types";

const amazonOrderPattern = /^\d{3}-\d{7}-\d{7}$/;
const receiptDatePattern =
  /((?:(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)\s*,?\s+)?(?:[A-Za-z]{3,9}\s+\d{1,2}(?:,?\s+\d{4})|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}))/i;
const amazonInvoiceDatePattern =
  /((?:(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)\s*,?\s+)?(?:[A-Za-z]{3,9}\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}))/i;
const lowesDatePattern =
  /((?:(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)\s*,?\s+)?[A-Za-z]{3,9}\s+\d{1,2}(?:,\s+\d{4})?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i;
const fieldLabelPattern =
  /^(order|order id|invoice|invoice number|receipt|date|status|e-mail|email|telephone|phone|purchased|purchase date|purchased on|ordered|ordered on|placed|transaction date|invoice date|order placed|placed on|order date|items ordered|order summary|order history|date added|customer order comment|image|product|model|quantity|unit price|arriving|arrives|delivered|shipped|shipped to|sold by|seller|seller voucher|membership|member number|package|warehouse|shipping method|billing address|shipping address|payment address|bill to|billed to|subtotal|sub-total|item subtotal|estimated tax|tax|sales tax|vat|gst|hst|shipping|shipping fee|delivery|delivery option|ship to|deliver to|recipient|grand total|orders? total|invoice total|receipt total|final total|amount due|balance due|total paid|amount paid|payment total|total|payment|payments|payment type|payment method|method of payment|payment information|paid with|charged|tender|tender type|promotion|promo|subscribe & save|visa|mastercard|amex|paypal|gift card|store credit|thank you)\b/i;

function compact(text: string) {
  return text.replace(/[^\S\r\n]+/g, " ").trim();
}

function findFirstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function normalizeOrderNumber(orderNumber?: string, sourceCategory?: ReceiptSourceCategory) {
  const sourceCleaned = isHomeDepotSource(sourceCategory) ? orderNumber?.replace(/^\s*#+\s*/, "") : orderNumber;
  const cleaned = sourceCleaned
    ?.replace(/[=\u2013\u2014]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/[^\dA-Z\s-].*$/i, "")
    .trim();

  if (!cleaned) {
    return undefined;
  }

  const digitGroups = cleaned.match(/\d+/g) ?? [];
  const [firstGroup, secondGroup, thirdGroup] = digitGroups;

  if (firstGroup && secondGroup && thirdGroup && firstGroup.length === 3 && secondGroup.length === 7 && thirdGroup.length === 7) {
    return `${firstGroup}-${secondGroup}-${thirdGroup}`;
  }

  const digitsOnly = digitGroups.join("");

  if (digitsOnly.length === 17) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 10)}-${digitsOnly.slice(10)}`;
  }

  return cleaned.replace(/\s+/g, " ");
}

function orderIdentifierLooksUsable(value?: string, sourceCategory?: ReceiptSourceCategory) {
  const normalized = normalizeOrderNumber(value, sourceCategory);

  if (!normalized || !/\d/.test(normalized)) {
    return false;
  }

  if (
    /\b(order|online order|order confirmation|order details|store pickup|pickup|delivery|ship(?:ped)? to|payment|subtotal|tax|total|receipt|invoice)\b/i.test(
      normalized,
    )
  ) {
    return false;
  }

  if (
    isHomeDepotSource(sourceCategory) &&
    /\b(store|location|pickup|delivery|fulfillment|payment|subtotal|tax|total|refund|return|items?|qty|quantity|ready|scheduled|processing|complete|completed|cancelled|canceled|shipped|delivered|address)\b/i.test(
      normalized,
    )
  ) {
    return false;
  }

  return isHomeDepotSource(sourceCategory) ? normalized.length >= 5 : normalized.length >= 4;
}

function orderIdentifierFromValue(value?: string, sourceCategory?: ReceiptSourceCategory) {
  return orderIdentifierLooksUsable(value, sourceCategory) ? normalizeOrderNumber(value, sourceCategory) : undefined;
}

function getOrderNumber(lines: string[], text: string, sourceCategory?: ReceiptSourceCategory) {
  const inlinePatterns = isHomeDepotSource(sourceCategory)
    ? [
        /\b(?:online\s+order|order)\s*(?:number|no\.?|#|id)\s*[:#-]?\s*([A-Z0-9][A-Z0-9 -]{3,})\b/i,
        /\b(?:online\s+order|order)\s*#\s*([A-Z0-9][A-Z0-9-]{3,})\b/i,
      ]
    : [
        /\b(?:order|invoice|receipt)\s*(?:number|no\.?|#|id)\s*[:#-]?\s*([A-Z0-9][A-Z0-9 =-]{3,})\b/i,
      ];
  const adjacentLabelPattern = isHomeDepotSource(sourceCategory)
    ? /^\s*(?:online\s+order|order)\s*(?:number|no\.?|#|id)?\s*:?\s*$/i
    : /^\s*(?:order|invoice|receipt)\s*(?:number|no\.?|#|id)\s*:?\s*$/i;

  for (const line of lines) {
    for (const pattern of inlinePatterns) {
      const candidate = orderIdentifierFromValue(line.match(pattern)?.[1], sourceCategory);
      if (candidate) {
        return candidate;
      }
    }
  }

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!adjacentLabelPattern.test(lines[index])) {
      continue;
    }

    const candidate = orderIdentifierFromValue(lines[index + 1], sourceCategory);
    if (candidate) {
      return candidate;
    }
  }

  return orderIdentifierFromValue(
    findFirstMatch(text, [
      /\b(\d{17})\b/,
      /\b(\d{3}\s+\d{7}\s+\d{7})\b/,
      /\b(\d{3}\s*[=-]\s*\d{7}\s*[=-]\s*\d{7})\b/,
    ]),
    sourceCategory,
  );
}

function normalizePaymentMethod(paymentMethod?: string) {
  return paymentMethod
    ?.replace(/\s+/g, " ")
    .replace(/\bending\s+with\b/i, "ending in")
    .replace(/\bending\b(?!\s+in)/i, "ending in")
    .replace(/[:#-]+$/g, "")
    .trim();
}

function normalizeAmount(amount?: string) {
  return amount?.replace(/,/g, "").trim();
}

function isAmazonInvoiceOrDetailSource(sourceCategory?: ReceiptSourceCategory) {
  return sourceCategory === "amazon-invoice-detail" || sourceCategory === "amazon-print-order-details";
}

function isHomeDepotSource(sourceCategory?: ReceiptSourceCategory) {
  return sourceCategory === "home-depot-order";
}

function hasGenericMerchantMarker(text: string) {
  return /\b(walmart|target|best buy|costco|shopify|home\s*depot(?:\s+canada)?|homedepot(?:\.com|\.ca)?|lazada)\b/i.test(text);
}

function hasVisiblePaymentLastFour(line: string) {
  return /\b(?:ending(?:\s+(?:in|with))?|last\s*(?:four|4)|x{2,}|\*{2,}|\u2022{2,})\s*\d{4}\b/i.test(line);
}

function amazonInvoiceDateSourceFor(line: string) {
  return /\b(invoice\s*date|date\s*of\s*invoice|invoice\s*issued|date\s*issued|issued\s*on)\b/i.test(line)
    ? "Amazon invoice date label"
    : "Amazon order date label";
}

function isAmazonInvoiceDateLabel(line: string) {
  return /\b(invoice\s*date|date\s*of\s*invoice|invoice\s*issued|date\s*issued|issued\s*on|order\s*date|order\s*placed|placed\s*on|ordered\s*on|date\s*of\s*order)\b/i.test(
    line,
  );
}

function adjacentAmazonInvoiceDate(lines: string[], labelIndex: number, source: string) {
  for (let offset = 1; offset <= 3; offset += 1) {
    const candidateLine = lines[labelIndex + offset];

    if (!candidateLine) {
      return undefined;
    }

    const match = candidateLine.match(amazonInvoiceDatePattern);

    if (match?.[1]) {
      return {
        value: match[1].trim(),
        source: source === "Amazon invoice date label" ? "Adjacent Amazon invoice date label" : "Adjacent Amazon order date label",
      };
    }

    if (fieldLabelPattern.test(candidateLine) && !/\b(?:date|time\s*zone|utc|gmt)\b/i.test(candidateLine)) {
      return undefined;
    }
  }

  return undefined;
}

function getAmazonInvoiceDetailPurchaseDate(text: string, lines: string[]) {
  const labelJoiner = String.raw`(?:\s*\([^)]+\)|\s+(?:UTC|GMT|PST|PDT|EST|EDT|CST|CDT|MST|MDT))*\s*:?\s*`;
  const labeledDatePatterns = [
    {
      source: "Amazon invoice date label",
      pattern: new RegExp(
        String.raw`\b(?:invoice\s*date|date\s*of\s*invoice|invoice\s*issued|date\s*issued|issued\s*on)\b${labelJoiner}${amazonInvoiceDatePattern.source}`,
        "i",
      ),
    },
    {
      source: "Amazon order date label",
      pattern: new RegExp(
        String.raw`\b(?:order\s*date|order\s*placed|placed\s*on|ordered\s*on|date\s*of\s*order)\b${labelJoiner}${amazonInvoiceDatePattern.source}`,
        "i",
      ),
    },
  ];

  for (const item of labeledDatePatterns) {
    const match = text.match(item.pattern);
    if (match?.[1]) {
      return {
        value: match[1].trim(),
        source: item.source,
      };
    }
  }

  for (let index = 0; index < lines.length - 1; index += 1) {
    const line = lines[index];

    if (!line || amazonInvoiceDatePattern.test(line)) {
      continue;
    }

    if (isAmazonInvoiceDateLabel(line)) {
      const dateResult = adjacentAmazonInvoiceDate(lines, index, amazonInvoiceDateSourceFor(line));

      if (dateResult) {
        return dateResult;
      }
    }
  }

  return undefined;
}

function getPurchaseDate(text: string, lines: string[], sourceCategory?: ReceiptSourceCategory) {
  if (sourceCategory === "lowes-email-order") {
    const lowesInlineMatch = text.match(
      new RegExp(
        String.raw`(?:order\s*placed|placed|delivery\s*date|delivered)\s*:?\s*(?:on\s+)?${lowesDatePattern.source}`,
        "i",
      ),
    );

    if (lowesInlineMatch?.[1]) {
      return {
        value: lowesInlineMatch[1].trim(),
        source: /delivered|delivery/i.test(lowesInlineMatch[0]) ? "Lowe's delivery date label" : "Lowe's order date label",
      };
    }

    for (let index = 0; index < lines.length - 1; index += 1) {
      const line = lines[index];
      const nextLine = lines[index + 1];

      if (!line || !nextLine || lowesDatePattern.test(line) || !lowesDatePattern.test(nextLine)) {
        continue;
      }

      if (/\b(order\s*placed|placed|delivery\s*date|delivered)\b/i.test(line)) {
        const match = nextLine.match(lowesDatePattern);
        if (match?.[1]) {
          return {
            value: match[1].trim(),
            source: /delivered|delivery/i.test(line) ? "Adjacent Lowe's delivery date label" : "Adjacent Lowe's order date label",
          };
        }
      }
    }
  }

  if (isAmazonInvoiceOrDetailSource(sourceCategory)) {
    const amazonInvoiceDetailDate = getAmazonInvoiceDetailPurchaseDate(text, lines);

    if (amazonInvoiceDetailDate) {
      return amazonInvoiceDetailDate;
    }
  }

  const labeledDatePatterns = [
    {
      source: "Order placed/date label",
      pattern: new RegExp(
        String.raw`(?:order\s*placed|placed\s*on|placed|order\s*date|ordered\s*on|ordered|order\s*of)\s*:?\s*${receiptDatePattern.source}`,
        "i",
      ),
    },
    {
      source: "Purchase date label",
      pattern: new RegExp(String.raw`(?:purchased\s*on|purchase\s*date|purchased|sold\s*on)\s*:?\s*${receiptDatePattern.source}`, "i"),
    },
    {
      source: "Transaction/invoice date label",
      pattern: new RegExp(
        String.raw`(?:transaction\s*date|invoice\s*date|receipt\s*date|date)\s*:?\s*${receiptDatePattern.source}`,
        "i",
      ),
    },
  ];

  for (const item of labeledDatePatterns) {
    const match = text.match(item.pattern);
    if (match?.[1]) {
      return {
        value: match[1].trim(),
        source: item.source,
      };
    }
  }

  for (let index = 0; index < lines.length - 1; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1];

    if (!line || !nextLine || receiptDatePattern.test(line) || !receiptDatePattern.test(nextLine)) {
      continue;
    }

    if (/\b(order\s*placed|placed|ordered|order\s*date|purchased|purchase\s*date|invoice\s*date|transaction\s*date|date)\b/i.test(line)) {
      const match = nextLine.match(receiptDatePattern);
      if (match?.[1]) {
        return {
          value: match[1].trim(),
          source: /order|placed|ordered/i.test(line) ? "Adjacent order date label" : "Adjacent date label",
        };
      }
    }
  }

  const fallbackDate = findFirstMatch(text, [/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/]);

  return fallbackDate
    ? {
        value: fallbackDate,
        source: "First visible numeric date fallback",
      }
    : undefined;
}

function amountPriorityFor(line: string, sourceCategory?: ReceiptSourceCategory) {
  if (
    isHomeDepotSource(sourceCategory) &&
    /\b(order\s*total|pickup\s*(?:order\s*)?total|delivery\s*(?:order\s*)?total|refund\s*total|total\s*paid|amount\s*paid|payment\s*total|total\s*charged|amount\s*charged)\b/i.test(
      line,
    )
  ) {
    return 100;
  }

  if (
    /\b(grand\s*total|orders?\s*total|invoice\s*total|receipt\s*total|final\s*total|amount\s*due|balance\s*due|order\s*summary|total\s*paid|amount\s*paid|payment\s*total|total\s*charged|amount\s*charged|charged)\b/i.test(
      line,
    )
  ) {
    return 100;
  }

  if (/\btotal\b/i.test(line) && !/\b(subtotal|tax|shipping|delivery|discount|savings|refund)\b/i.test(line)) {
    return 88;
  }

  if (/\b(subtotal|tax|shipping|delivery|shipment|discount|savings|refund)\b/i.test(line)) {
    return 20;
  }

  return 35;
}

function amountCategoryFor(line: string): ReceiptAmountCategory {
  if (/\b(refund|refunded|return credit)\b/i.test(line)) {
    return "refund";
  }

  if (/\b(discount|savings|coupon|promo|promotion)\b/i.test(line)) {
    return "discount";
  }

  if (/\b(tax|vat|gst|hst)\b/i.test(line)) {
    return "tax";
  }

  if (/\b(shipping|shipment|delivery|freight|handling)\b/i.test(line)) {
    return "shipping";
  }

  if (/\b(subtotal|sub total|item subtotal|items total|merchandise total)\b/i.test(line)) {
    return "subtotal";
  }

  if (
    /\b(grand\s*total|orders?\s*total|invoice\s*total|receipt\s*total|final\s*total|amount\s*due|balance\s*due|order\s*summary|total\s*paid|amount\s*paid|payment\s*total|total\s*charged|amount\s*charged|charged|total)\b/i.test(
      line,
    )
  ) {
    return "total";
  }

  if (/\b(payment|paid|visa|mastercard|amex|paypal|apple pay|google pay|shop pay|gift card|store credit)\b/i.test(line)) {
    return "payment";
  }

  return "other";
}

function amountMatchesFor(line: string) {
  return [...line.matchAll(/(?:\b(?:USD|CAD)\s*)?\$?\s*(\d[\d,]*[.]\d{2})/gi)];
}

function standaloneAmountLineMatch(line?: string) {
  return line?.match(/^\s*(?:USD|CAD)?\s*\$?\s*(\d[\d,]*[.]\d{2})\s*$/i);
}

function hasAmount(line: string) {
  return amountMatchesFor(line).length > 0;
}

function cleanAmountLabel(line: string) {
  return line
    .replace(/\$?\s*\d[\d,]*[.]\d{2}.*/, "")
    .replace(/[:#-]+$/g, "")
    .trim();
}

function normalizeLineItemText(text: string) {
  return text
    .replace(/^\s*(?:sku|item|upc)\s*[:#-]?\s*[A-Z0-9-]{3,}\s+/i, "")
    .replace(/^\s*(?:qty|quantity)\s*[:#-]?\s*\d+\s+/i, "")
    .replace(/^\s*\d+\s*(?:x|@)\s+/i, "")
    .replace(/^\s*(?=[A-Z0-9-]*\d[A-Z0-9-]*\s)[A-Z0-9-]{4,}\s+(?=[A-Za-z])/i, "")
    .replace(/^\s*\d{4,}\s+(?=[A-Za-z])/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function hasProductLikeText(text: string) {
  return /[a-z]{3,}/i.test(text) && text.length >= 6;
}

function getHomeDepotAdjacentTotalAmount(lines: string[], lineIndex: number, sourceCategory?: ReceiptSourceCategory) {
  const line = lines[lineIndex];

  if (
    !isHomeDepotSource(sourceCategory) ||
    amountPriorityFor(line, sourceCategory) < 88 ||
    !/\b(order\s*total|pickup\s*(?:order\s*)?total|delivery\s*(?:order\s*)?total|refund\s*total|total\s*paid|amount\s*paid|payment\s*total|total\s*charged|amount\s*charged|total)\b/i.test(
      line,
    )
  ) {
    return undefined;
  }

  for (let offset = 1; offset <= 4; offset += 1) {
    const candidateLine = lines[lineIndex + offset];

    if (!candidateLine) {
      return undefined;
    }

    const amountMatch = standaloneAmountLineMatch(candidateLine);

    if (amountMatch?.[1]) {
      return amountMatch[1];
    }

    if (/^\s*(?:USD|CAD)\s*$/i.test(candidateLine)) {
      continue;
    }

    if (hasAmount(candidateLine) || fieldLabelPattern.test(candidateLine)) {
      return undefined;
    }
  }

  return undefined;
}

function getAmountCandidates(lines: string[], sourceCategory?: ReceiptSourceCategory) {
  return lines.flatMap((line, lineIndex) => {
    const matches = amountMatchesFor(line);
    const priority = amountPriorityFor(line, sourceCategory);
    const category = amountCategoryFor(line);
    const label = cleanAmountLabel(line) || (priority >= 88 ? "Total-like amount" : "Visible amount");
    const lineCandidates = matches.map((match, matchIndex) => ({
      label,
      value: normalizeAmount(match[1]) ?? match[1],
      priority,
      category,
      lineIndex,
      matchIndex,
    }));
    const nextLine = lines[lineIndex + 1];
    const nextLineAmount = standaloneAmountLineMatch(nextLine);
    const homeDepotTotalAmount = nextLineAmount?.[1] ? undefined : getHomeDepotAdjacentTotalAmount(lines, lineIndex, sourceCategory);
    const shouldPairNextLine =
      !matches.length &&
      nextLineAmount?.[1] &&
      amountCategoryFor(line) !== "other" &&
      /\b(subtotal|sub total|item subtotal|items total|merchandise total|tax|vat|gst|hst|shipping|delivery|grand\s*total|orders?\s*total|invoice\s*total|receipt\s*total|final\s*total|amount\s*due|balance\s*due|total\s*paid|amount\s*paid|payment\s*total|total|charged)\b/i.test(
        line,
      );

    const shouldPairHomeDepotTotal = !matches.length && Boolean(homeDepotTotalAmount);

    if (!shouldPairNextLine && !shouldPairHomeDepotTotal) {
      return lineCandidates;
    }

    return [
      ...lineCandidates,
      {
        label: cleanAmountLabel(line) || "Adjacent amount label",
        value: normalizeAmount(nextLineAmount?.[1] ?? homeDepotTotalAmount) ?? nextLineAmount?.[1] ?? homeDepotTotalAmount ?? "",
        priority,
        category,
        lineIndex,
        matchIndex: -1,
      },
    ];
  });
}

function groupAmountCategories(candidates: ReceiptAmountCandidate[]) {
  return candidates.reduce<Partial<Record<ReceiptAmountCategory, string[]>>>((groups, candidate) => {
    groups[candidate.category] = [...(groups[candidate.category] ?? []), candidate.value];
    return groups;
  }, {});
}

function buildAmountReviewNotes(params: {
  amountCategories: Partial<Record<ReceiptAmountCategory, string[]>>;
  text: string;
}) {
  const notes = [
    params.amountCategories.discount?.length
      ? "Discount, coupon, or savings amount detected; reconcile the final paid amount against the order record."
      : undefined,
    params.amountCategories.refund?.length
      ? "Refund or return-credit amount detected; verify whether the receipt represents a purchase, adjustment, or post-purchase credit."
      : undefined,
    params.amountCategories.payment && params.amountCategories.payment.length > 1
      ? "Multiple payment amount lines detected; verify the sum against the final paid amount before relying on one line."
      : undefined,
    /\b(gift card|store credit|credit balance|split payment|multiple payments|paid partly|partial payment)\b/i.test(params.text)
      ? "Gift-card, store-credit, split-payment, or partial-payment wording detected; match the final paid amount against order records."
      : undefined,
    params.amountCategories.total && params.amountCategories.total.length > 1
      ? "Multiple total-like amounts detected; confirm which total reflects the proof-of-purchase amount."
      : undefined,
  ].filter((note): note is string => Boolean(note));

  return [...new Set(notes)];
}

function paymentKindFor(line: string, sourceCategory?: ReceiptSourceCategory): ReceiptPaymentCandidate["kind"] {
  if (/\bgift card\b/i.test(line)) {
    return "gift-card";
  }

  if (/\bstore credit\b/i.test(line)) {
    return "store-credit";
  }

  if (/\b(?:visa|mastercard|amex|american express|discover|credit card|debit card|card)\b/i.test(line)) {
    return "card";
  }

  if ((sourceCategory === "lowes-email-order" || isAmazonInvoiceOrDetailSource(sourceCategory)) && hasVisiblePaymentLastFour(line)) {
    return "card";
  }

  if (
    isHomeDepotSource(sourceCategory) &&
    (/\b(?:card|credit|debit|visa|mastercard|amex|american express|discover)\b/i.test(line) || hasVisiblePaymentLastFour(line))
  ) {
    return "card";
  }

  if (/\b(paypal|apple pay|google pay|shop pay)\b/i.test(line)) {
    return "wallet";
  }

  return "unknown";
}

function hasPaymentCue(line: string, sourceCategory?: ReceiptSourceCategory) {
  if (
    isHomeDepotSource(sourceCategory) &&
    /\b(payment|payments|payment type|payment method|method of payment|payment information|payment details|paid with|paid by|charged to|charged|tender|tender type|tendered|visa|mastercard|amex|american express|discover|credit|debit|card|paypal|gift card|store credit|commercial card|pro\s*xtra|ending(?:\s+(?:in|with))?|last\s*(?:four|4)|x{2,}|\*{2,})\b/i.test(
      line,
    )
  ) {
    return true;
  }

  if (sourceCategory === "lowes-email-order" && /\b(?:visa|mastercard|amex|paypal|gift card|store credit|ending(?:\s+in)?|x{2,}|\*{2,})\s*\d{0,4}\b/i.test(line)) {
    return true;
  }

  if (
    isAmazonInvoiceOrDetailSource(sourceCategory) &&
    /\b(payment method|payment information|payment details|payment instrument|paid with|paid by|charged to|visa|mastercard|amex|american express|discover|paypal|amazon pay|wallet|gift card|store credit|amazon(?:\.com)? store card|amazon visa|prime visa|payment card|credit card|debit card|\bcard\b|card ending|ending(?:\s+(?:in|with))?|last\s*(?:four|4)|x{2,}|\*{2,}|\u2022{2,}|masked|redacted)\b/i.test(
      line,
    )
  ) {
    return true;
  }

  return /\b(payment|payment type|payment method|method of payment|payment information|payment details|payment summary|paid with|paid by|charged to|charged|tender|tender type|visa|mastercard|amex|american express|discover|credit card|debit card|paypal|apple pay|google pay|shop pay|gift card|store credit|amazon(?:\.com)? store card|card ending|ending(?:\s+(?:in|with))?|last\s*(?:four|4))\b/i.test(
    line,
  );
}

function hasPaymentLabel(line: string, sourceCategory?: ReceiptSourceCategory) {
  if (isHomeDepotSource(sourceCategory) && /^\s*(payment|payments|payment type|payment method|method of payment|payment information|payment details|paid with|paid by|charged to|tender|tender type|tendered)\s*:?\s*$/i.test(line)) {
    return true;
  }

  if (sourceCategory === "lowes-email-order" && /^\s*(payment|payments|payment details|payment summary)\s*:?\s*$/i.test(line)) {
    return true;
  }

  if (isAmazonInvoiceOrDetailSource(sourceCategory)) {
    return /\b(payment method|payment information|payment details|payment instrument|payment summary|paid with|paid by|charged to)\b/i.test(line);
  }

  return /^\s*(payment|payments|payment type|payment method|method of payment|payment information|payment details|payment summary|paid with|paid by|charged to|tender|tender type)\s*:?\s*$/i.test(
    line,
  );
}

function getPaymentCandidates(lines: string[], sourceCategory?: ReceiptSourceCategory) {
  return lines.flatMap((line, lineIndex) => {
    const candidates: ReceiptPaymentCandidate[] = [];
    const previousLine = lines[lineIndex - 1];
    const previousPreviousLine = lines[lineIndex - 2];
    const nextLine = lines[lineIndex + 1];
    const nextNextLine = lines[lineIndex + 2];
    const amazonInvoiceOrDetail = isAmazonInvoiceOrDetailSource(sourceCategory);
    const supportsTwoLinePaymentDetail = amazonInvoiceOrDetail || isHomeDepotSource(sourceCategory);

    if (hasPaymentLabel(line, sourceCategory) && nextLine && !hasPaymentLabel(nextLine, sourceCategory) && hasPaymentCue(nextLine, sourceCategory)) {
      const paymentDetailLines =
        supportsTwoLinePaymentDetail && nextNextLine && !fieldLabelPattern.test(nextNextLine) && hasPaymentCue(nextNextLine, sourceCategory)
          ? [nextLine, nextNextLine]
          : [nextLine];
      const value = normalizePaymentMethod(`${line} ${paymentDetailLines.join(" ")}`) ?? `${line} ${paymentDetailLines.join(" ")}`;
      return [
        {
          label: "Payment detail after label",
          value,
          kind: paymentKindFor(value, sourceCategory),
          hasVisibleLastFour: hasVisiblePaymentLastFour(value),
        },
      ];
    }

    if (previousLine && hasPaymentLabel(previousLine, sourceCategory) && !hasPaymentLabel(line, sourceCategory) && hasPaymentCue(line, sourceCategory)) {
      return [];
    }

    if (
      supportsTwoLinePaymentDetail &&
      previousPreviousLine &&
      previousLine &&
      hasPaymentLabel(previousPreviousLine, sourceCategory) &&
      hasPaymentCue(previousLine, sourceCategory) &&
      hasPaymentCue(line, sourceCategory)
    ) {
      return [];
    }

    if (hasPaymentCue(line, sourceCategory)) {
      const value = normalizePaymentMethod(line.replace(/\s*\$?\d[\d,]*[.]\d{2}\s*$/, "")) ?? line;

      candidates.push({
        label: hasPaymentLabel(line, sourceCategory) ? "Payment method line" : "Payment cue line",
        value,
        kind: paymentKindFor(line, sourceCategory),
        hasVisibleLastFour: hasVisiblePaymentLastFour(line),
      });
    }

    return candidates;
  });
}

function selectPaymentMethod(candidates: ReceiptPaymentCandidate[]) {
  const selected =
    candidates.find((candidate) => candidate.kind === "card" && candidate.hasVisibleLastFour) ??
    candidates.find((candidate) => candidate.kind !== "unknown");

  return selected
    ? {
        value: selected.value,
        source: selected.label,
      }
    : undefined;
}

function buildPaymentReviewNotes(candidates: ReceiptPaymentCandidate[]) {
  const notes = [
    candidates.some((candidate) => candidate.kind === "card" && !candidate.hasVisibleLastFour)
      ? "Payment card wording was detected without a visible last-four; verify the payment method against the receipt image or order record."
      : undefined,
    candidates.length > 1
      ? "Multiple payment cues were detected; verify split tender, gift card, or store-credit lines against the final paid amount."
      : undefined,
    candidates.some((candidate) => candidate.kind === "gift-card" || candidate.kind === "store-credit")
      ? "Gift-card or store-credit payment wording detected; reconcile payment lines against the order record."
      : undefined,
  ].filter((note): note is string => Boolean(note));

  return [...new Set(notes)];
}

function contextKindForLine(line: string): ReceiptContextCandidate["kind"] | undefined {
  if (/\b(redacted|masked|private|hidden|x{2,}|\*{2,})\b/i.test(line)) {
    return "redacted-private";
  }

  if (/\b(sold by|seller)\b/i.test(line)) {
    return "seller";
  }

  if (/\b(billing address|bill to|billed to)\b/i.test(line)) {
    return "billing";
  }

  if (/\b(ship to|shipped to|ships to|deliver to|recipient|shipping address)\b/i.test(line)) {
    return "recipient";
  }

  if (/\b(payment address)\b/i.test(line)) {
    return "billing";
  }

  if (/\b(shipping|freight|handling)\b/i.test(line)) {
    return "shipping";
  }

  if (/\b(arriving|arrives|delivered|delivery|shipment|shipped)\b/i.test(line)) {
    return "delivery";
  }

  if (hasPaymentCue(line)) {
    return "payment";
  }

  if (/\b(invoice|tax invoice|print this page for your records)\b/i.test(line)) {
    return "invoice";
  }

  return undefined;
}

function contextKindForAdjacentLabel(line: string): ReceiptContextCandidate["kind"] | undefined {
  if (/^\s*(sold by|seller)\s*:?\s*$/i.test(line)) {
    return "seller";
  }

  if (/^\s*(billing address|payment address|bill to|billed to)\s*:?\s*$/i.test(line)) {
    return "billing";
  }

  if (/^\s*(ship to|shipped to|ships to|deliver to|recipient|shipping address)\s*:?\s*$/i.test(line)) {
    return "recipient";
  }

  if (/^\s*(shipping|freight|handling)\s*:?\s*$/i.test(line)) {
    return "shipping";
  }

  if (/^\s*(arriving|arrives|delivered|delivery|shipment|shipped)\s*:?\s*$/i.test(line)) {
    return "delivery";
  }

  if (/^\s*(payment|payments|payment type|payment method|method of payment|payment information|paid with|tender|tender type)\s*:?\s*$/i.test(line)) {
    return "payment";
  }

  if (/^\s*(invoice|invoice number|invoice #|tax invoice)\s*:?\s*$/i.test(line)) {
    return "invoice";
  }

  return undefined;
}

function contextLabelFor(kind: ReceiptContextCandidate["kind"]) {
  const labels: Record<ReceiptContextCandidate["kind"], string> = {
    seller: "Seller context",
    recipient: "Ship-to or recipient context",
    shipping: "Shipping context",
    billing: "Billing context",
    delivery: "Delivery or shipment context",
    payment: "Payment context",
    invoice: "Invoice context",
    "redacted-private": "Private or redacted context",
  };

  return labels[kind];
}

function privateOrRedactedValue(line: string) {
  return (
    /\b(redacted|masked|private|hidden)\b/i.test(line) ||
    /\b(?:x{2,}|\*{2,})\s*\d{2,4}\b/i.test(line) ||
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(line) ||
    /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/.test(line) ||
    /\b\d{1,6}\s+[A-Za-z0-9 .'-]+(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|way|boulevard|blvd\.?|court|ct\.?|circle|cir\.?)\b/i.test(
      line,
    ) ||
    /\b[A-Z][A-Za-z .'-]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/.test(line) ||
    /^(?:United States|USA|Canada)$/i.test(line)
  );
}

function standaloneDateValue(line: string) {
  return new RegExp(String.raw`^${amazonInvoiceDatePattern.source}$`, "i").test(line.trim());
}

function adjacentContextRejectionReason(line: string, previousLine?: string) {
  if (standaloneDateValue(line)) {
    return "Receipt date or delivery date value";
  }

  if (privateOrRedactedValue(line)) {
    return "Private or redacted context";
  }

  const previousKind = previousLine ? contextKindForAdjacentLabel(previousLine) : undefined;

  if (previousKind && previousKind !== "invoice") {
    return `${contextLabelFor(previousKind)} value`;
  }

  return undefined;
}

function getContextCandidates(lines: string[]) {
  return lines.flatMap((line, lineIndex) => {
    const candidates: ReceiptContextCandidate[] = [];
    const kind = contextKindForLine(line);
    const nextLine = lines[lineIndex + 1];

    if (kind) {
      candidates.push({
        kind,
        label: contextLabelFor(kind),
        value: line,
        source: "line",
      });
    }

    const adjacentKind = contextKindForAdjacentLabel(line);
    const nextKind = nextLine ? contextKindForLine(nextLine) : undefined;

    if (
      adjacentKind &&
      nextLine &&
      (!nextKind || nextKind === "redacted-private") &&
      !fieldLabelPattern.test(nextLine) &&
      (adjacentKind !== "invoice" || privateOrRedactedValue(nextLine) || standaloneDateValue(nextLine))
    ) {
      candidates.push({
        kind: adjacentKind,
        label: contextLabelFor(adjacentKind),
        value: `${line} -> ${nextLine}`,
        source: "adjacent line",
      });
    }

    return candidates;
  });
}

function getSelectedTotal(lines: string[], sourceCategory?: ReceiptSourceCategory) {
  const candidates = getAmountCandidates(lines, sourceCategory);
  const selected = [...candidates].sort((first, second) => {
    if (second.priority !== first.priority) {
      return second.priority - first.priority;
    }

    if (second.lineIndex !== first.lineIndex) {
      return second.lineIndex - first.lineIndex;
    }

    return second.matchIndex - first.matchIndex;
  })[0];

  return {
    total: selected?.value,
    source: selected
      ? selected.priority >= 88
        ? `${selected.label} label`
        : "Last visible amount fallback"
      : undefined,
    candidates: candidates.map((candidate) => ({
      label: candidate.label,
      value: candidate.value,
      priority: candidate.priority,
      category: candidate.category,
    })),
  };
}

function getMerchantName(lines: string[]) {
  const merchantLine = lines.find((line) =>
    /amazon|walmart|target|best buy|costco|shopify|home\s*depot|homedepot|lazada|lowe'?s|ispring|ispringfilter|invoice|receipt/i.test(line),
  );

  if (merchantLine) {
    return merchantLine.replace(/order|invoice|receipt/gi, "").trim() || merchantLine.trim();
  }

  return lines.find((line) => /[a-z]/i.test(line) && line.length > 3)?.trim();
}

function sourceLabelFor(category: ReceiptSourceCategory) {
  const labels: Record<ReceiptSourceCategory, string> = {
    "amazon-app-screenshot": "Amazon app screenshot",
    "amazon-print-order-details": "Amazon print order details / PDF",
    "amazon-invoice-detail": "Amazon invoice/detail page",
    "ispring-direct-invoice": "iSpring direct website invoice/order",
    "lowes-email-order": "Lowe's email/order screenshot",
    "home-depot-order": "Home Depot / Home Depot Canada order",
    "costco-order": "Costco / Costco Canada order",
    "lazada-order": "Lazada order",
    "generic-merchant-receipt": "Generic merchant receipt",
    "unknown-inconclusive": "Unknown / inconclusive",
  };

  return labels[category];
}

function genericReceiptCueLabels(text: string, lines: string[]) {
  const hasLineWithAmountAndProduct = lines.some((line) => hasAmount(line) && amountCategoryFor(line) === "other" && hasProductLikeText(cleanAmountLabel(line)));
  const cueTests: [string, boolean][] = [
    ["Known generic merchant marker", hasGenericMerchantMarker(text)],
    ["Receipt or invoice heading", /\b(receipt|invoice|order confirmation|sales order)\b/i.test(text)],
    ["Order or transaction identifier cue", /\b(order\s*(?:#|id|number|no\.?)|invoice\s*(?:#|id|number|no\.?)|transaction\s*(?:#|id|number|no\.?))\b/i.test(text)],
    ["Purchase/date label cue", /\b(date|order date|purchase date|purchased|ordered|placed|transaction date|invoice date)\b/i.test(text)],
    ["Amount structure cue", /\b(subtotal|sub total|tax|sales tax|vat|gst|hst|shipping|delivery|grand total|invoice total|receipt total|final total|amount due|balance due|total paid|amount paid|payment total|total charged|amount charged|total)\b/i.test(text)],
    ["Payment or tender cue", /\b(payment|payment type|method of payment|paid with|paid by|charged to|tender|tender type|visa|mastercard|amex|american express|discover|paypal|apple pay|google pay|shop pay|gift card|store credit|credit card|debit card|ending(?:\s+(?:in|with))?|last\s*(?:four|4))\b/i.test(text)],
    ["Shipping or delivery cue", /\b(shipping|delivery|delivered|ship to|shipped to|pickup|store pickup)\b/i.test(text)],
    ["Product/price line cue", hasLineWithAmountAndProduct],
  ];

  return cueTests.filter(([, matched]) => matched).map(([label]) => label);
}

function classifyGenericReceiptSource(text: string, lines: string[]): ReceiptSourceClassification | undefined {
  const cues = genericReceiptCueLabels(text, lines);

  if (lines.length < 4 || cues.length < 2) {
    return undefined;
  }

  const category: ReceiptSourceCategory = "generic-merchant-receipt";
  const hasKnownGenericMerchant = cues.includes("Known generic merchant marker");
  const confidence = Math.min(68, 38 + cues.length * 4 + (hasKnownGenericMerchant ? 8 : 0));

  return {
    category,
    label: sourceLabelFor(category),
    confidence,
    cues: [...cues, "No supported narrow source marker matched"],
  };
}

function classifyReceiptSource(text: string, lines: string[]): ReceiptSourceClassification {
  const cueTests: { category: ReceiptSourceCategory; confidence: number; cues: [string, RegExp][] }[] = [
    {
      category: "amazon-print-order-details",
      confidence: 93,
      cues: [
        ["Amazon print URL/title", /amazon\.com\/gp\/css\/summary\/print|print order details/i],
        ["Amazon order details", /\border details\b|\border summary\b/i],
      ],
    },
    {
      category: "amazon-app-screenshot",
      confidence: 88,
      cues: [
        ["Amazon merchant", /\bamazon(?:\.com)?\b/i],
        ["Amazon app action rows", /\b(buy it again|buy again|track package|return or replace items|view your item|get product support|order summary|ship to)\b/i],
      ],
    },
    {
      category: "amazon-invoice-detail",
      confidence: 90,
      cues: [
        ["Amazon merchant", /\bamazon(?:\.com)?\b/i],
        ["Invoice/detail cue", /\b(invoice|view invoice|tax invoice|print this page for your records|sold by|items ordered|order total)\b/i],
      ],
    },
    {
      category: "ispring-direct-invoice",
      confidence: 88,
      cues: [
        ["iSpring direct marker", /\bispringfilter\.com\b|\babantecart\b|\bispring water systems\b|\bispringfilter\b/i],
        ["Direct order/invoice cue", /\border\s*(?:id|number|no\.?|details|history|confirmation)\b|credit card\s*\/\s*debit card.*stripe|payment method|invoice|order total/i],
      ],
    },
    {
      category: "lowes-email-order",
      confidence: 86,
      cues: [
        ["Lowe's marker", /\blowe'?s\b|\blowes\b/i],
        ["Email/order-card cue", /\b(view order|review store|delivered|thanks,|we'?ve received your order|order number)\b/i],
      ],
    },
    {
      category: "home-depot-order",
      confidence: 87,
      cues: [
        ["Home Depot marker", /\bthe\s+home\s+depot\b|\bhome\s*depot(?:\s+canada)?\b|\bhomedepot\.(?:com|ca)\b/i],
        ["Home Depot order/receipt cue", /\b(online\s+order|order\s*(?:#|number|no\.?|id|confirmation|details)|date\s*ordered|store\s*pickup|pickup|delivery|ship(?:ped)?\s*to|item\s*subtotal|sales\s*tax|order\s*total|total\s*paid)\b/i],
      ],
    },
    {
      category: "costco-order",
      confidence: 86,
      cues: [
        ["Costco marker", /\bcostco(?:\.(?:ca|com))?\b|\bcostco\s+wholesale\b/i],
        ["Costco order/receipt cue", /\b(order\s*(?:#|number|no\.?|id|confirmation|details)|membership|member\s*(?:number|#)|ship(?:ping)?|delivery|item\s*subtotal|order\s*total|total\s*paid)\b/i],
      ],
    },
    {
      category: "lazada-order",
      confidence: 84,
      cues: [
        ["Lazada marker", /\blazada\b/i],
        ["Lazada marketplace order cue", /\b(order\s*(?:#|number|no\.?|id|details)|seller|package|delivery\s*option|paid\s*by|payment\s*method|subtotal|shipping\s*fee|order\s*total|total\s*paid)\b/i],
      ],
    },
  ];

  for (const item of cueTests) {
    const matchedCues = item.cues.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
    if (matchedCues.length === item.cues.length) {
      return {
        category: item.category,
        label: sourceLabelFor(item.category),
        confidence: item.confidence,
        cues: matchedCues,
      };
    }
  }

  if (/\bamazon(?:\.com)?\b/i.test(text)) {
    const category: ReceiptSourceCategory = /\binvoice|sold by|items ordered|order total/i.test(text)
      ? "amazon-invoice-detail"
      : "amazon-app-screenshot";
    return {
      category,
      label: sourceLabelFor(category),
      confidence: 76,
      cues: ["Amazon merchant marker"],
    };
  }

  const genericClassification = classifyGenericReceiptSource(text, lines);

  if (genericClassification) {
    return genericClassification;
  }

  const category: ReceiptSourceCategory = "unknown-inconclusive";
  return {
    category,
    label: sourceLabelFor(category),
    confidence: Math.min(45, Math.max(15, lines.length * 8)),
    cues: lines.length > 0 ? ["Insufficient known merchant/platform indicators"] : ["No readable receipt text"],
  };
}

function legacySourceFor(classification: ReceiptSourceClassification): ExtractedReceiptInfo["source"] {
  if (classification.category.startsWith("amazon-")) {
    return "amazon";
  }

  if (classification.category === "unknown-inconclusive") {
    return "unknown";
  }

  return "merchant-receipt";
}

function lineItemRejectionReason(line: string, previousLine?: string) {
  const contextReason = adjacentContextRejectionReason(line, previousLine);

  if (contextReason) {
    return contextReason;
  }

  if (privateOrRedactedValue(line)) {
    return "Private or redacted context";
  }

  if (/^#?[A-Z]{2,}[-A-Z0-9]*\d{4,}\b/i.test(line)) {
    return "Order identifier or account code";
  }

  if (fieldLabelPattern.test(line)) {
    return "Receipt field label or summary line";
  }

  if (/amazon|walmart|target|best buy|costco|shopify|home\s*depot|homedepot|lazada|ispring water systems/i.test(line)) {
    return "Merchant/platform heading";
  }

  if (hasAmount(line)) {
    const itemText = normalizeLineItemText(cleanAmountLabel(line));
    const hasModelCue = /\b[A-Z]{1,}[0-9][A-Z0-9-]*\b/i.test(itemText);
    if (amountCategoryFor(line) === "other" && hasProductLikeText(itemText) && hasModelCue) {
      return undefined;
    }
  }

  if (
    /\b(buy again|return or replace|return window|track package|view invoice|archive order|write a product review|share gift receipt|problem with order|get product support|contact seller|seller feedback)\b/i.test(
      line,
    )
  ) {
    return "Navigation, action, or status text";
  }

  if (
    /^(pending|processing|complete|completed|cancelled|canceled|shipped|delivered)$/i.test(line) ||
    /^\d{4}-\d{2}-\d{2}\s+(pending|processing|complete|completed|cancelled|canceled|shipped|delivered)\b/i.test(line)
  ) {
    return "Order history or shipping status text";
  }

  if (
    /\b(print this page|for your records|thank you|return policy|returns?|privacy|terms|customer service|customer support center|visit\s+www|www\.|\.com|referral|warranty|dealer|faq|account|home\s*>|about us|contact us|testimonials?|newsletter|sign up|what'?s new|reverse osmosis systems|whole house systems|replacement cartridges|blog|verified purchase|footer text|synthetic fixture|not valid for purchase)\b/i.test(
      line,
    )
  ) {
    return "Footer, policy, or printable-page text";
  }

  if (/\b(redacted recipient|billing address|shipping address|payment address|ship to|shipped to|deliver to|bill to|address|recipient)\b/i.test(line)) {
    return "Address, recipient, or delivery text";
  }

  if (/^free shipping$/i.test(line)) {
    return "Shipping or delivery text";
  }

  if (/\b(tracking|carrier|fedex|ups|usps|service:|customer order comment|date added)\b/i.test(line)) {
    return "Order history or shipping status text";
  }

  if (
    /\b(payment|visa|mastercard|amex|american express|discover|paypal|apple pay|google pay|shop pay|gift card|store credit|ending(?:\s+(?:in|with))?|last\s*(?:four|4)|card)\b/i.test(
      line,
    )
  ) {
    return "Payment text";
  }

  if (/^[^\da-z]*[\[\]{}|]/i.test(line)) {
    return "Malformed OCR fragment";
  }

  if (hasAmount(line)) {
    const itemText = normalizeLineItemText(cleanAmountLabel(line));
    if (amountCategoryFor(line) === "other" && hasProductLikeText(itemText)) {
      return undefined;
    }

    return "Amount or price line";
  }

  if (!hasProductLikeText(normalizeLineItemText(line))) {
    return "Too short or not text-like";
  }

  return undefined;
}

function lineItemCandidateText(line: string) {
  const withoutAmount = hasAmount(line) ? cleanAmountLabel(line) : line;
  return normalizeLineItemText(withoutAmount);
}

function getLineItemReview(lines: string[]) {
  return lines.reduce<{ accepted: string[]; rejected: RejectedLineItemCandidate[] }>(
    (review, line, index) => {
      const reason = lineItemRejectionReason(line, lines[index - 1]);

      if (reason) {
        review.rejected.push({ text: line, reason });
      } else {
        review.accepted.push(lineItemCandidateText(line));
      }

      return review;
    },
    { accepted: [], rejected: [] },
  );
}

function fieldSummary(params: Omit<ReceiptSourceStructureField, "note"> & { presentNote: string; missingNote: string }) {
  return {
    key: params.key,
    label: params.label,
    present: params.present,
    count: params.count,
    note: params.present ? params.presentNote : params.missingNote,
  } satisfies ReceiptSourceStructureField;
}

function sourceStructureConfidence(fields: ReceiptSourceStructureField[]) {
  const present = fields.filter((field) => field.present).length;
  return {
    present,
    expected: fields.length,
    confidence: fields.length > 0 ? Math.round((present / fields.length) * 100) : 0,
  };
}

function buildISpringDirectSummary(params: {
  text: string;
  lineItems: string[];
  amountCategories: Partial<Record<ReceiptAmountCategory, string[]>>;
}): ReceiptSourceStructureSummary {
  const productTableRowCount = params.lineItems.filter((item) => /\b[A-Z]{1,}[0-9][A-Z0-9-]*\b/i.test(item)).length;
  const fields = [
    fieldSummary({
      key: "orderId",
      label: "Order ID or number present",
      present: /\border\s*(?:id|number|no\.?)\b/i.test(params.text),
      presentNote: "Order ID/number label detected; raw identifier is not included in this summary.",
      missingNote: "Order ID/number label was not detected.",
    }),
    fieldSummary({
      key: "status",
      label: "Status present",
      present: /\bstatus\b/i.test(params.text),
      presentNote: "Order status label detected; raw status value is not required for sharing.",
      missingNote: "Order status label was not detected.",
    }),
    fieldSummary({
      key: "email",
      label: "Email field present",
      present: /\be-?mail\b/i.test(params.text),
      presentNote: "Email field detected without exposing the email value.",
      missingNote: "Email field label was not detected.",
    }),
    fieldSummary({
      key: "telephone",
      label: "Telephone field present",
      present: /\btelephone\b|\bphone\b/i.test(params.text),
      presentNote: "Telephone field detected without exposing the phone value.",
      missingNote: "Telephone field label was not detected.",
    }),
    fieldSummary({
      key: "shippingMethod",
      label: "Shipping method present",
      present: /\bshipping method\b/i.test(params.text),
      presentNote: "Shipping method label detected.",
      missingNote: "Shipping method label was not detected.",
    }),
    fieldSummary({
      key: "paymentMethod",
      label: "Payment method present",
      present: /\bpayment method\b|credit card\s*\/\s*debit card.*stripe/i.test(params.text),
      presentNote: "Payment method/Stripe wording detected without exposing payment details.",
      missingNote: "Payment method/Stripe wording was not detected.",
    }),
    fieldSummary({
      key: "shippingAddressBlock",
      label: "Shipping address block present",
      present: /\bshipping address\b/i.test(params.text),
      presentNote: "Shipping address section detected without exposing address values.",
      missingNote: "Shipping address section was not detected.",
    }),
    fieldSummary({
      key: "paymentAddressBlock",
      label: "Payment address block present",
      present: /\bpayment address\b/i.test(params.text),
      presentNote: "Payment address section detected without exposing address values.",
      missingNote: "Payment address section was not detected.",
    }),
    fieldSummary({
      key: "orderHistory",
      label: "Order history present",
      present: /\border history\b|\bdate added status\b/i.test(params.text),
      presentNote: "Order-history section detected; tracking/status details are not included.",
      missingNote: "Order-history section was not detected.",
    }),
    fieldSummary({
      key: "productTableRows",
      label: "Product table rows",
      present: productTableRowCount > 0,
      count: productTableRowCount,
      presentNote: `${productTableRowCount} product table row(s) detected as item evidence.`,
      missingNote: "No product table rows were detected as item evidence.",
    }),
    fieldSummary({
      key: "subtotal",
      label: "Subtotal present",
      present: Boolean(params.amountCategories.subtotal?.length) || /\bsub-?total\b/i.test(params.text),
      presentNote: "Subtotal cue detected.",
      missingNote: "Subtotal cue was not detected.",
    }),
    fieldSummary({
      key: "discount",
      label: "Discount present",
      present: Boolean(params.amountCategories.discount?.length) || /\b(discount|coupon|promo|promotion|off)\b/i.test(params.text),
      presentNote: "Discount/coupon cue detected.",
      missingNote: "Discount/coupon cue was not detected.",
    }),
    fieldSummary({
      key: "shippingCost",
      label: "Shipping cost present",
      present: Boolean(params.amountCategories.shipping?.length) || /\bfree shipping\b|\bshipping\b.*\$?\d/i.test(params.text),
      presentNote: "Shipping cost cue detected.",
      missingNote: "Shipping cost cue was not detected.",
    }),
    fieldSummary({
      key: "total",
      label: "Total present",
      present: Boolean(params.amountCategories.total?.length) || /\btotal\b/i.test(params.text),
      presentNote: "Total cue detected.",
      missingNote: "Total cue was not detected.",
    }),
  ];
  const coverage = sourceStructureConfidence(fields);

  return {
    category: "ispring-direct-invoice",
    label: "iSpring direct parsed-field summary",
    confidence: coverage.confidence,
    fieldsPresent: coverage.present,
    fieldsExpected: coverage.expected,
    productTableRowCount,
    fields,
    notes: [
      "Privacy-safe source summary: reports field presence and counts only, not raw names, addresses, emails, phone numbers, order IDs, payment details, or tracking numbers.",
      "Product table row count supports receipt completeness review but does not verify authenticity by itself.",
      coverage.confidence >= 80
        ? "iSpring direct invoice structure is well represented in the local OCR text."
        : "iSpring direct invoice structure is incomplete; manual review recommended before tuning thresholds.",
    ],
  };
}

function vendorMarkerPatternFor(category: ReceiptSourceCategory) {
  if (category === "home-depot-order") {
    return /\bthe\s+home\s+depot\b|\bhome\s*depot(?:\s+canada)?\b|\bhomedepot\.(?:com|ca)\b/i;
  }

  if (category === "costco-order") {
    return /\bcostco(?:\.(?:ca|com))?\b|\bcostco\s+wholesale\b/i;
  }

  if (category === "lazada-order") {
    return /\blazada\b/i;
  }

  return /$a/;
}

function buildVendorOrderSummary(params: {
  text: string;
  lineItems: string[];
  amountCategories: Partial<Record<ReceiptAmountCategory, string[]>>;
  paymentCandidates: ReceiptPaymentCandidate[];
  parsedFields?: {
    orderNumber?: string;
    purchaseDate?: string;
    total?: string;
    paymentMethod?: string;
  };
  classification: ReceiptSourceClassification;
}): ReceiptSourceStructureSummary {
  const alignWithParsedFields = params.classification.category === "home-depot-order";
  const fields = [
    fieldSummary({
      key: "vendorMarker",
      label: "Vendor/source marker present",
      present: vendorMarkerPatternFor(params.classification.category).test(params.text),
      presentNote: "Supported vendor/source marker detected without treating it as external verification.",
      missingNote: "Supported vendor/source marker was not detected.",
    }),
    fieldSummary({
      key: "orderOrReceiptId",
      label: "Order or receipt ID cue present",
      present:
        /\b(online\s+order|order\s*(?:#|id|number|no\.?|confirmation|details)|receipt\s*(?:#|id|number|no\.?)|transaction\s*(?:#|id|number|no\.?))\b/i.test(
          params.text,
        ) ||
        (alignWithParsedFields && Boolean(params.parsedFields?.orderNumber)),
      presentNote: "Order, receipt, or transaction identifier label detected without exposing the identifier.",
      missingNote: "Order, receipt, or transaction identifier label was not detected.",
    }),
    fieldSummary({
      key: "dateCue",
      label: "Date cue present",
      present:
        /\b(date|date ordered|order date|purchase date|purchased|ordered|placed|transaction date|invoice date)\b/i.test(params.text) ||
        (alignWithParsedFields && Boolean(params.parsedFields?.purchaseDate)),
      presentNote: "A purchase/order/date cue or parsed purchase date was detected.",
      missingNote: "Purchase/order/date cue was not detected.",
    }),
    fieldSummary({
      key: "itemEvidence",
      label: "Item or product detail present",
      present: params.lineItems.length > 0,
      count: params.lineItems.length,
      presentNote: `${params.lineItems.length} item/product candidate(s) detected.`,
      missingNote: "No item/product candidate was detected.",
    }),
    fieldSummary({
      key: "amountStructure",
      label: "Amount structure present",
      present: Boolean(
        params.amountCategories.subtotal?.length ||
          params.amountCategories.tax?.length ||
          params.amountCategories.total?.length ||
          (alignWithParsedFields && params.parsedFields?.total),
      ),
      presentNote: "Subtotal, tax, total amount structure, or parsed total detected.",
      missingNote: "Subtotal, tax, or total amount structure was not detected.",
    }),
    fieldSummary({
      key: "paymentCue",
      label: "Payment or tender cue present",
      present: params.paymentCandidates.length > 0 || (alignWithParsedFields && Boolean(params.parsedFields?.paymentMethod)),
      count: params.paymentCandidates.length,
      presentNote: `${params.paymentCandidates.length} payment/tender cue(s) detected without exposing payment values.`,
      missingNote: "Payment/tender cue was not detected.",
    }),
    fieldSummary({
      key: "fulfillmentCue",
      label: "Fulfillment cue present",
      present: /\b(shipping|delivery|delivered|ship to|shipped to|pickup|store pickup|warehouse|package|delivery option)\b/i.test(params.text),
      presentNote: "Shipping, delivery, pickup, warehouse, or package context detected.",
      missingNote: "Shipping, delivery, pickup, warehouse, or package context was not detected.",
    }),
  ];
  const coverage = sourceStructureConfidence(fields);

  return {
    category: params.classification.category,
    label: `${params.classification.label} parsed-field summary`,
    confidence: coverage.confidence,
    fieldsPresent: coverage.present,
    fieldsExpected: coverage.expected,
    fields,
    notes: [
      "Privacy-safe source summary: reports field presence and counts only, not raw merchant, order, customer, address, payment, membership, or tracking values.",
      "Source detection is based on visible vendor/layout markers only and is not external verification.",
      coverage.confidence >= 70
        ? "Supported vendor/order layout is well represented in local OCR text."
        : "Supported vendor/order layout is incomplete; use parsed fields for manual matching.",
    ],
  };
}

function buildGenericMerchantSummary(params: {
  text: string;
  lineItems: string[];
  amountCategories: Partial<Record<ReceiptAmountCategory, string[]>>;
  paymentCandidates: ReceiptPaymentCandidate[];
  classification: ReceiptSourceClassification;
}): ReceiptSourceStructureSummary {
  const fields = [
    fieldSummary({
      key: "merchantMarker",
      label: "Known merchant marker present",
      present: hasGenericMerchantMarker(params.text),
      presentNote: "A known generic merchant marker was detected, but no supported narrow source category matched.",
      missingNote: "No supported merchant-specific marker was detected.",
    }),
    fieldSummary({
      key: "orderOrTransactionId",
      label: "Order or transaction ID cue present",
      present: /\b(order\s*(?:#|id|number|no\.?)|invoice\s*(?:#|id|number|no\.?)|transaction\s*(?:#|id|number|no\.?))\b/i.test(params.text),
      presentNote: "Order, invoice, or transaction identifier label detected without exposing the identifier.",
      missingNote: "Order, invoice, or transaction identifier label was not detected.",
    }),
    fieldSummary({
      key: "dateLabel",
      label: "Date cue present",
      present: /\b(date|order date|purchase date|purchased|ordered|placed|transaction date|invoice date)\b/i.test(params.text),
      presentNote: "A purchase/order/date cue was detected.",
      missingNote: "Purchase/order/date cue was not detected.",
    }),
    fieldSummary({
      key: "itemEvidence",
      label: "Item or product detail present",
      present: params.lineItems.length > 0,
      count: params.lineItems.length,
      presentNote: `${params.lineItems.length} item/product candidate(s) detected.`,
      missingNote: "No item/product candidate was detected.",
    }),
    fieldSummary({
      key: "amountStructure",
      label: "Amount structure present",
      present: Boolean(params.amountCategories.subtotal?.length || params.amountCategories.tax?.length || params.amountCategories.total?.length),
      presentNote: "Subtotal, tax, or total amount structure detected.",
      missingNote: "Subtotal, tax, or total amount structure was not detected.",
    }),
    fieldSummary({
      key: "paymentCue",
      label: "Payment or tender cue present",
      present: params.paymentCandidates.length > 0,
      count: params.paymentCandidates.length,
      presentNote: `${params.paymentCandidates.length} payment/tender cue(s) detected without exposing payment values.`,
      missingNote: "Payment/tender cue was not detected.",
    }),
    fieldSummary({
      key: "shippingOrDelivery",
      label: "Shipping or delivery cue present",
      present: /\b(shipping|delivery|delivered|ship to|shipped to|pickup|store pickup)\b/i.test(params.text),
      presentNote: "Shipping, delivery, or pickup context detected.",
      missingNote: "Shipping, delivery, or pickup context was not detected.",
    }),
  ];
  const coverage = sourceStructureConfidence(fields);

  return {
    category: "generic-merchant-receipt",
    label: "Generic merchant parsed-field summary",
    confidence: coverage.confidence,
    fieldsPresent: coverage.present,
    fieldsExpected: coverage.expected,
    fields,
    notes: [
      "Privacy-safe generic summary: reports field presence and counts only, not raw merchant, order, payment, address, or customer values.",
      "Generic merchant classification means receipt/order structure was visible, but no supported narrow source marker matched.",
      params.classification.confidence < 60
        ? "Generic source confidence is limited; use parsed fields for manual matching rather than applying merchant-specific expectations."
        : "Generic source confidence is based on structural cues only and does not externally verify the receipt.",
    ],
  };
}

function buildSourceSpecificSummary(params: {
  classification: ReceiptSourceClassification;
  text: string;
  lineItems: string[];
  amountCategories: Partial<Record<ReceiptAmountCategory, string[]>>;
  paymentCandidates: ReceiptPaymentCandidate[];
  parsedFields: {
    orderNumber?: string;
    purchaseDate?: string;
    total?: string;
    paymentMethod?: string;
  };
}) {
  if (params.classification.category === "ispring-direct-invoice") {
    return buildISpringDirectSummary({
      text: params.text,
      lineItems: params.lineItems,
      amountCategories: params.amountCategories,
    });
  }

  if (params.classification.category === "generic-merchant-receipt") {
    return buildGenericMerchantSummary({
      text: params.text,
      lineItems: params.lineItems,
      amountCategories: params.amountCategories,
      paymentCandidates: params.paymentCandidates,
      classification: params.classification,
    });
  }

  if (
    params.classification.category === "home-depot-order" ||
    params.classification.category === "costco-order" ||
    params.classification.category === "lazada-order"
  ) {
    return buildVendorOrderSummary({
      text: params.text,
      lineItems: params.lineItems,
      amountCategories: params.amountCategories,
      paymentCandidates: params.paymentCandidates,
      parsedFields: params.parsedFields,
      classification: params.classification,
    });
  }

  return undefined;
}

function amazonOrderFormatFor(source: ExtractedReceiptInfo["source"], orderNumber?: string) {
  if (source !== "amazon") {
    return "not-applicable" as const;
  }

  if (!orderNumber) {
    return "missing" as const;
  }

  return amazonOrderPattern.test(orderNumber) ? ("valid" as const) : ("invalid" as const);
}

function amazonOrderIssueFor(source: ExtractedReceiptInfo["source"], orderNumber?: string) {
  const format = amazonOrderFormatFor(source, orderNumber);

  if (format === "missing") {
    return "Amazon-style order number was not extracted.";
  }

  if (format === "invalid") {
    return "Extracted order number does not match the expected Amazon pattern.";
  }

  return undefined;
}

function fieldReliabilityFromConfidence(params: {
  field: ReceiptFieldReliability["field"];
  value?: string;
  confidence: number;
  missingFields: string[];
}) {
  const isMissing = params.missingFields.includes(params.field);
  const status: ReceiptFieldReliability["status"] = isMissing
    ? "Not extracted"
    : params.confidence >= 75
      ? "Likely reliable"
      : "Needs review";
  const note =
    status === "Likely reliable"
      ? "Parser found this field with enough local structure for baseline review."
      : status === "Needs review"
        ? "Parser found this field, but format or structure should be checked against the receipt image."
        : "Parser did not extract this field from the local OCR text.";

  return {
    field: params.field,
    value: params.value,
    confidence: params.confidence,
    status,
    note,
  } satisfies ReceiptFieldReliability;
}

export function parseReceiptText(rawText: string): ExtractedReceiptInfo {
  const text = compact(rawText);
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const merchantName = getMerchantName(lines);
  const sourceClassification = classifyReceiptSource(text, lines);
  const source = legacySourceFor(sourceClassification);
  const orderNumber = getOrderNumber(lines, text, sourceClassification.category);
  const purchaseDateResult = getPurchaseDate(text, lines, sourceClassification.category);
  const purchaseDate = purchaseDateResult?.value;
  const selectedTotal = getSelectedTotal(lines, sourceClassification.category);
  const total = selectedTotal.total;
  const paymentCandidates = getPaymentCandidates(lines, sourceClassification.category);
  const selectedPayment = selectPaymentMethod(paymentCandidates);
  const paymentMethod = selectedPayment?.value;
  const currencyAmountCount = text.match(/\$?\d+[,.]\d{2}/g)?.length ?? 0;
  const contextCandidates = getContextCandidates(lines);
  const lineItemReview = getLineItemReview(lines);
  const lineItems = lineItemReview.accepted;
  const amountCategories = groupAmountCategories(selectedTotal.candidates);
  const sourceSpecificSummary = buildSourceSpecificSummary({
    classification: sourceClassification,
    text,
    lineItems,
    amountCategories,
    paymentCandidates,
    parsedFields: {
      orderNumber,
      purchaseDate,
      total,
      paymentMethod,
    },
  });
  const amountReviewNotes = buildAmountReviewNotes({ amountCategories, text });
  const paymentReviewNotes = buildPaymentReviewNotes(paymentCandidates);
  const hasSubtotal = Boolean(amountCategories.subtotal?.length) || /\bsubtotal\b/i.test(text);
  const hasTax = Boolean(amountCategories.tax?.length) || /\btax\b/i.test(text);
  const hasShippingIndicator =
    Boolean(amountCategories.shipping?.length) ||
    /\b(shipping|shipment|delivery|ship to|shipped to|ships to|deliver to|delivered|arriving|arrives|shipping address)\b/i.test(text);
  const amazonSignals =
    source === "amazon"
      ? {
          hasOrderPlacedCue: /\b(order placed|placed on|ordered(?:\s+on)?|order date|date of order|invoice date|date of invoice)\b/i.test(text),
          hasItemsOrderedCue: /\b(items ordered|item ordered|ordered items|items in this order)\b/i.test(text),
          hasOrderSummaryCue: /\border summary\b/i.test(text),
          hasOrderTotalCue: /\b(orders? total|grand total|total paid|amount paid)\b/i.test(text),
          hasShipToOrDeliveryCue:
            /\b(ship to|shipped to|ships to|deliver to|delivered|delivery|shipping address|arriving|arrives)\b/i.test(text) ||
            contextCandidates.some((candidate) => candidate.kind === "recipient" || candidate.kind === "shipping" || candidate.kind === "delivery"),
          hasArrivalOrShipmentCue:
            /\b(arriving|arrives|shipped|shipment|delivered|delivery)\b/i.test(text) ||
            contextCandidates.some((candidate) => candidate.kind === "delivery"),
          hasPaymentCue: hasPaymentCue(text, sourceClassification.category),
          hasMultiShipmentCue: /\b(shipment\s+\d+|multiple shipments|part of your order|this shipment)\b/i.test(text),
          hasInvoiceCue: /\b(invoice\s*(?:number|no\.?|#|date)?|tax invoice|print this page for your records)\b/i.test(text),
          hasSoldByCue: /\b(sold by|seller)\b/i.test(text) || contextCandidates.some((candidate) => candidate.kind === "seller"),
          hasBillingCue: /\b(billing address|bill to|billed to)\b/i.test(text) || contextCandidates.some((candidate) => candidate.kind === "billing"),
          hasPromotionCue: /\b(promotion|promo|coupon|subscribe\s*&\s*save|subscribe and save)\b/i.test(text),
          orderNumberIssue: amazonOrderIssueFor(source, orderNumber),
        }
      : undefined;
  const orderNumberValid =
    source === "amazon" && orderNumber ? amazonOrderPattern.test(orderNumber) : orderNumber ? true : undefined;
  const amazonOrderFormat = amazonOrderFormatFor(source, orderNumber);
  const structureNotes = [
    lineItems.length > 0 ? undefined : "No clear line item or product detail was detected.",
    hasSubtotal ? undefined : "Subtotal was not detected.",
    hasTax ? undefined : "Tax line was not detected.",
    hasShippingIndicator ? undefined : "Shipping or delivery context was not detected.",
    amazonOrderFormat === "invalid" ? "Amazon-like receipt has an order number that does not match the expected pattern." : undefined,
    amazonOrderFormat === "missing" ? "Amazon-like receipt is missing an Amazon-style order number." : undefined,
    source === "amazon" && amazonSignals && !amazonSignals.hasOrderPlacedCue ? "Amazon order placed/date cue was not detected." : undefined,
    source === "amazon" && amazonSignals && !amazonSignals.hasOrderTotalCue ? "Amazon order total cue was not detected." : undefined,
    source === "amazon" && amazonSignals && !amazonSignals.hasPaymentCue ? "Amazon payment cue was not detected." : undefined,
    source === "amazon" && amazonSignals && !amazonSignals.hasItemsOrderedCue && !lineItems.length
      ? "Amazon items ordered cue or product detail was not detected."
      : undefined,
    source === "amazon" && amazonSignals?.hasMultiShipmentCue
      ? "Amazon multi-shipment wording detected; match the item and total against the relevant shipment or order section."
      : undefined,
    source === "amazon" && amazonSignals?.hasInvoiceCue
      ? "Amazon invoice/order-detail wording detected; match invoice, order, and item details against the purchase record."
      : undefined,
    source === "amazon" && amazonSignals?.hasPromotionCue
      ? "Amazon promotion or Subscribe & Save wording detected; reconcile discounts against the order record."
      : undefined,
    source === "amazon" && contextCandidates.some((candidate) => candidate.source === "adjacent line")
      ? "Adjacent Amazon section label/value context detected; keep seller, recipient, billing, delivery, and private rows out of item evidence."
      : undefined,
    sourceSpecificSummary
      ? `${sourceSpecificSummary.label}: ${sourceSpecificSummary.fieldsPresent}/${sourceSpecificSummary.fieldsExpected} expected structure fields detected (${sourceSpecificSummary.confidence}% confidence).`
      : undefined,
    sourceClassification.category === "generic-merchant-receipt"
      ? "Generic merchant classification is based on receipt/order structure only; no supported narrow source marker matched."
      : undefined,
    sourceClassification.category === "generic-merchant-receipt" && sourceClassification.confidence < 60
      ? "Generic source confidence is limited; verify merchant, date, total, and payment details manually before applying source-specific expectations."
      : undefined,
    sourceClassification.category === "unknown-inconclusive"
      ? "Receipt source classification is inconclusive; match available details manually before relying on source-specific rules."
      : undefined,
    contextCandidates.some((candidate) => candidate.kind === "redacted-private")
      ? "Private or redacted receipt rows detected; use them as matching context only, not purchased-item evidence."
      : undefined,
    ...amountReviewNotes,
    ...paymentReviewNotes,
  ].filter((note): note is string => Boolean(note));
  const missingFields = [
    { field: "merchant", value: merchantName },
    { field: "order number", value: orderNumber },
    { field: "purchase date", value: purchaseDate },
    { field: "line item or product detail", value: lineItems.length > 0 },
    { field: "total", value: total },
    { field: "payment method", value: paymentMethod },
  ]
    .filter((item) => !item.value)
    .map((item) => item.field);
  const fieldConfidence = {
    merchant: merchantName ? 88 : 20,
    orderNumber: orderNumber ? (orderNumberValid === false ? 45 : 82) : 18,
    purchaseDate: purchaseDate ? 82 : 18,
    lineItems: lineItems.length > 0 ? 76 : 24,
    total: total ? 86 : 22,
    paymentMethod: paymentMethod ? 74 : 25,
  };
  const fieldReliability = [
    fieldReliabilityFromConfidence({ field: "merchant", value: merchantName, confidence: fieldConfidence.merchant, missingFields }),
    fieldReliabilityFromConfidence({ field: "order number", value: orderNumber, confidence: fieldConfidence.orderNumber, missingFields }),
    fieldReliabilityFromConfidence({ field: "purchase date", value: purchaseDate, confidence: fieldConfidence.purchaseDate, missingFields }),
    fieldReliabilityFromConfidence({
      field: "line item or product detail",
      value: lineItems[0],
      confidence: fieldConfidence.lineItems,
      missingFields,
    }),
    fieldReliabilityFromConfidence({ field: "total", value: total, confidence: fieldConfidence.total, missingFields }),
    fieldReliabilityFromConfidence({ field: "payment method", value: paymentMethod, confidence: fieldConfidence.paymentMethod, missingFields }),
  ];

  return {
    merchantName,
    orderNumber,
    orderNumberValid,
    purchaseDate,
    total,
    paymentMethod,
    parsingDetails: {
      purchaseDateSource: purchaseDateResult?.source,
      selectedTotalSource: selectedTotal.source,
      paymentSource: selectedPayment?.source,
      lineItemCandidates: lineItems.slice(0, 8),
      rejectedLineItemCandidates: lineItemReview.rejected.slice(0, 60),
      amountCandidates: selectedTotal.candidates,
      amountCategories,
      amountReviewNotes,
      paymentCandidates,
      paymentReviewNotes,
      contextCandidates,
    },
    source,
    sourceClassification,
    sourceSpecificSummary,
    missingFields,
    structure: {
      hasMerchantPlatform: Boolean(merchantName),
      hasOrderNumber: Boolean(orderNumber),
      hasPurchaseDate: Boolean(purchaseDate),
      hasTotal: Boolean(total),
      hasPaymentMethod: Boolean(paymentMethod),
      hasLineItems: lineItems.length > 0,
      hasSubtotal,
      hasTax,
      hasShippingIndicator,
      currencyAmountCount,
      amazonOrderFormat,
      amazonSignals,
      notes: structureNotes,
    },
    fieldConfidence,
    fieldReliability,
    rawText,
    lineCount: lines.length,
  };
}
