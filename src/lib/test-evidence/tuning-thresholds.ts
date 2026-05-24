export const analyzerTuningSummary = {
  ocrConfidence: [
    {
      label: "Quality labels",
      value: "Clear / Usable / Inconclusive / Unreadable",
      detail: "Combines average confidence, extracted-text coverage, and low-confidence word rate.",
    },
    {
      label: "Review signal",
      value: "< 60%",
      detail: "Creates a low-confidence text-region signal.",
    },
    {
      label: "Inconclusive OCR status",
      value: "< 60%, unreadable, or very sparse",
      detail: "Keeps low-confidence or very sparse OCR in manual-review territory unless an independent suspicious indicator is present.",
    },
    {
      label: "Report check clear",
      value: ">= 70%",
      detail: "Maps OCR confidence to Clear in the final report checks.",
    },
    {
      label: "Report check inconclusive",
      value: "45-69%",
      detail: "Maps OCR confidence to Inconclusive in the final report checks.",
    },
    {
      label: "Report check review",
      value: "< 45%",
      detail: "Maps OCR confidence to Review in the final report checks.",
    },
    {
      label: "Low-confidence rate",
      value: ">= 20% usable, >= 45% inconclusive",
      detail: "Large clusters of uncertain words can constrain confidence even when average OCR is passable.",
    },
    {
      label: "OCR uncertainty notes",
      value: "<35% very low, 35-54% low",
      detail: "Groups low-confidence samples into reviewer notes and highlights possible field impact.",
    },
    {
      label: "Blocking OCR signal",
      value: "< 60% avg, unreadable, inconclusive below 75%, or < 12 words",
      detail: "High-average OCR with enough coverage and token-level uncertainty stays visible as checkpoints; very sparse OCR becomes evidence-limited.",
    },
    {
      label: "Field reliability adjustment",
      value: "Usable -8 / Inconclusive -22 / Unreadable -34",
      detail: "Parsed field reliability is reduced by OCR quality so extracted values still get manual-review notes when OCR is weak.",
    },
    {
      label: "Sparse OCR",
      value: "< 3 words unreadable; < 12 inconclusive; < 20 usable",
      detail: "Prevents high confidence over sparse extracted text from being labeled Clear; falls back to text-token count when OCR word metadata is unavailable.",
    },
  ],
  metadataRisk: [
    {
      label: "Image metadata unavailable",
      value: "Limited context",
      detail: "Adds a low-severity source-context signal; this is not a standalone alteration indicator.",
    },
    {
      label: "PDF metadata available",
      value: "page count present",
      detail: "Current PDF metadata availability is based on local PDF page parsing.",
    },
    {
      label: "PDF text layer limited",
      value: "text length <= 35",
      detail: "Adds a metadata note and falls back to rendered OCR when possible.",
    },
    {
      label: "Metadata decision rule",
      value: "context only",
      detail: "Missing or stripped metadata should prompt purchase matching, not rejection.",
    },
  ],
  imageQuality: [
    {
      label: "Quality labels",
      value: "Clear / Usable / Limited / Poor",
      detail: "Separates visual evidence limits from potential alteration indicators.",
    },
    {
      label: "Compression review",
      value: "bytes/pixel < 0.16",
      detail: "Flags compressed image quality for manual review.",
    },
    {
      label: "High compression review",
      value: "bytes/pixel < 0.08",
      detail: "Raises image compression signal severity from low to medium.",
    },
    {
      label: "Low resolution note",
      value: "< 0.35 MP",
      detail: "Adds an image-quality indicator that details may be hidden.",
    },
    {
      label: "Formatting inconclusive",
      value: "text < 30 chars or < 4 lines",
      detail: "Marks receipt formatting alignment as inconclusive.",
    },
    {
      label: "Formatting needs review",
      value: "2+ currency values and no parsed total",
      detail: "Adds a receipt-formatting review signal.",
    },
  ],
  receiptStructure: [
    {
      label: "Source classification",
      value: "Amazon/iSpring/Lowe's/Home Depot/Costco/Lazada/generic/unknown",
      detail: "Classifies receipt source before source-specific checks so non-Amazon receipts are not evaluated against Amazon-only structure; supported vendor confidence stays above generic fallback.",
    },
    {
      label: "Supported vendor diagnostics",
      value: "source marker + layout cue",
      detail: "Home Depot, Costco, Lazada, and iSpring direct orders require a visible source marker plus order/layout cues; summaries report presence/counts only and do not externally verify the merchant.",
    },
    {
      label: "Home Depot field extraction",
      value: "online order + long total + tender",
      detail: "Home Depot source-scoped parsing pairs online order labels with adjacent order-token rows, treats pickup/delivery/refund/order total labels as selectable totals across short label gaps, recognizes tender/card payment rows, and keeps source summaries aligned to parsed cues without changing broad scoring thresholds.",
    },
    {
      label: "Generic source diagnostics",
      value: "2+ generic cues, no narrow source match",
      detail: "Generic merchant receipts remain the fallback after supported source checks and list which receipt/order cues were visible in a privacy-safe field-presence summary.",
    },
    {
      label: "Date labels",
      value: "order/purchase/transaction/invoice/date plus ISO",
      detail: "The parser records the source label used for extracted purchase dates, including month-day-year, day-month-year, numeric, and ISO-style dates.",
    },
    {
      label: "Split date labels",
      value: "date label + adjacent date value",
      detail: "Pairs labels such as Ordered or Order placed with the following date line for mobile OCR layouts.",
    },
    {
      label: "Line item required",
      value: "missing line item/product detail",
      detail: "Adds a missing-field cue and can generate a receipt-structure review signal when OCR quality is usable.",
    },
    {
      label: "Line item candidates",
      value: "first readable product-like lines",
      detail: "Shows the lines treated as item/product detail so reviewers can separate real product text from OCR noise.",
    },
    {
      label: "Rejected line item candidates",
      value: "labels/footer/address/payment/private/amount",
      detail: "Shows text rejected from item evidence so printable-page, address, footer, payment, private, and amount lines do not silently count as products.",
    },
    {
      label: "Receipt context rows",
      value: "seller/recipient/billing/delivery/payment/private",
      detail: "Surfaces adjacent Amazon section label/value rows as receipt context so reviewer matching improves without counting those rows as products.",
    },
    {
      label: "Item-price lines",
      value: "product text + price, non-summary only",
      detail: "Accepts item lines with trailing prices after stripping the amount, while subtotal/tax/total/payment lines stay rejected.",
    },
    {
      label: "Quantity/SKU item lines",
      value: "SKU/UPC/item code + qty prefixes",
      detail: "Strips common SKU, UPC, item-code, and quantity prefixes from accepted item candidates while keeping order IDs and summary totals excluded.",
    },
    {
      label: "Amount structure",
      value: "< 2 currency amounts",
      detail: "Suggests limited receipt structure for subtotal/tax/total verification.",
    },
    {
      label: "Amount categories",
      value: "subtotal/tax/shipping/discount/refund/total/payment/other",
      detail: "Categorizes visible amounts so multi-total receipts can be reviewed without treating every amount mismatch as suspicious.",
    },
    {
      label: "Amount review notes",
      value: "discount/refund/split/multiple-total cues",
      detail: "Explains payment-adjustment layouts as reconciliation context rather than automatic alteration signals.",
    },
    {
      label: "Payment candidates",
      value: "card/wallet/gift-card/store-credit/unknown",
      detail: "Shows payment cue lines and whether a visible last-four was detected, without treating missing last-four OCR as standalone suspicious evidence.",
    },
    {
      label: "Total selection",
      value: "labeled total first, last amount fallback",
      detail: "Prefers grand/order/total paid/amount paid labels before falling back to the last visible amount.",
    },
    {
      label: "Split label/value lines",
      value: "label line + adjacent date/amount/payment",
      detail: "Pairs common date, amount due/balance due, currency-prefixed amount, and payment/tender labels with the following value line so OCR line breaks keep useful source context.",
    },
    {
      label: "Amazon order format",
      value: "000-0000000-0000000",
      detail: "Amazon-like receipts with a different extracted pattern require proof-of-purchase verification; OCR dash confusions such as equals signs are normalized before validation.",
    },
    {
      label: "Amazon order OCR normalization",
      value: "3-7-7 groups, spaced, equals, or contiguous",
      detail: "Normalizes conservative Amazon order-number OCR variants before applying the valid/invalid format check.",
    },
    {
      label: "Amazon structure cues",
      value: "placed/items/summary/total/ship/payment",
      detail: "Readable Amazon-like receipts expose order-page and mobile cues for proof-of-purchase matching.",
    },
    {
      label: "Amazon shipment cues",
      value: "arriving/shipped/delivered/multi-shipment",
      detail: "Shipment wording is treated as order-matching context, especially on mobile order pages.",
    },
    {
      label: "Amazon mobile action rows",
      value: "buy again/track/view invoice/return window",
      detail: "Mobile navigation, delivery status, and action rows are rejected from item evidence while product detail remains available.",
    },
    {
      label: "Amazon invoice/detail cues",
      value: "invoice/date/payment/sold-by/billing/promotion",
      detail: "Printable invoice and order-detail wording is surfaced as purchase-matching context, including split invoice/order date labels with neutral metadata rows, masked payment summary cues, and Subscribe & Save or promo layouts.",
    },
    {
      label: "Inconclusive separation",
      value: "OCR < 60%",
      detail: "Missing fields under low OCR are worded as inconclusive evidence quality, not intentional alteration.",
    },
  ],
  scoringWeights: [
    {
      label: "Starting score",
      value: "96",
      detail: "Base Evidence Reliability Score before penalties and bonuses.",
    },
    {
      label: "Signal penalties",
      value: "High 18 / Medium 10 / Low 5",
      detail: "Each review signal subtracts points by severity.",
    },
    {
      label: "OCR penalty",
      value: "max(0, round((78 - confidence) / 2)) + quality penalty",
      detail: "Low OCR confidence and OCR quality labels reduce the score.",
    },
    {
      label: "OCR quality penalty",
      value: "Usable +2 / Inconclusive +6 / Unreadable +10",
      detail: "Separately explains when sparse or clustered low-confidence text constrained the score.",
    },
    {
      label: "Parsed-field bonus",
      value: "max(0, 10 - missingFields * 2)",
      detail: "More extracted receipt fields preserve more score.",
    },
    {
      label: "Breakdown details",
      value: "confidence penalty + quality penalty + credited fields",
      detail: "The harness shows the separate OCR penalty inputs and which parsed fields received bonus credit.",
    },
    {
      label: "Risk bands",
      value: "Low >= 80 / Medium >= 58 or OCR-only inconclusive / High < 58 with independent suspicious signals",
      detail: "Poor OCR can keep the score low while the visible status remains inconclusive/manual review instead of suspicion-like high risk.",
    },
    {
      label: "Score explanation",
      value: "formula + interpretation",
      detail: "Reports include the actual reliability-score formula, local-only interpretation, and external verification status.",
    },
  ],
};
