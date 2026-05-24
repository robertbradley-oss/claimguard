# ClaimGuard Test Evidence Harness

`/test-evidence` is a developer-only route for tuning the local analyzer before OCR moves server-side. It is separate from the main claim workflow and uses the same local `analyzeEvidenceFile` pipeline as uploads.

## How to Use

1. Start the app with `npm.cmd run dev`.
2. Open `http://localhost:3000/test-evidence`.
3. Click `Run all fixtures` to process the synthetic receipt set, or select one fixture card to run it.
4. Review the side-by-side comparison table for expected risk, actual risk, Evidence Reliability Score, OCR confidence, review signals, and support recommendation.
5. Open a fixture result and inspect grouped findings, OCR text, parsed fields, metadata findings, image-quality findings, score breakdown, review signals, and the final report.
6. Use `Copy fixture result summary` or `Export fixture result summary` on a completed fixture to capture a privacy-safe synthetic tuning summary without raw OCR text or complete analyzer JSON by default.

The synthetic set includes clean, item-price, quantity/SKU, generic order-confirmation, generic split-summary, Home Depot order, Home Depot split-label order, Costco.ca order, adjusted-payment, Lowe's email/order, iSpring direct invoice, iSpring direct order, Lazada order, Amazon print/order detail, readable Amazon order-page, Amazon multi-shipment/mobile, Amazon mobile actions, Amazon split labels, Amazon OCR order number, Amazon split date, Amazon split context, Amazon invoice/detail, suspicious Amazon-style, poor-quality, sparse high-confidence PDF, and PDF receipt samples. Clean synthetic fixtures are expected to score high when OCR and parsing succeed because they test parser recognition and internal structure consistency, not whether a receipt is real or externally verified. The item-price receipt checks product names and prices on the same lines while keeping subtotal/tax/total summary lines out of item evidence. The quantity/SKU receipt checks SKU, UPC, item-code, and quantity prefixes while keeping order IDs and totals out of item evidence. The generic order-confirmation fixture checks that fallback source classification stays generic while explaining visible receipt/order cues, extracting common date/payment labels, and avoiding Amazon-only validation. The generic split-summary fixture checks ISO-style split dates, split `Amount Due` totals with currency prefixes, and `Payment Type` labels without creating a source-specific merchant category. The Home Depot fixtures check narrow vendor/source layout detection before generic fallback, split online-order labels, pickup/refund total selection, tender/card payment cues, privacy-safe source summaries, and Amazon-validation bypass. The Costco.ca and Lazada fixtures check narrow vendor/source layout detection before generic fallback, privacy-safe source summaries, and Amazon-validation bypass. The adjusted receipt is specifically for checking discount, return-credit, gift-card, and split-payment reconciliation notes. The Lowe's email/order fixture checks that a long non-Amazon order number, email-card action rows, delivery/order date labels, and payment-section cues classify and parse as Lowe's without triggering Amazon order-format validation. The iSpring direct invoice fixture checks iSpringFilter/iSpring Water Systems branding, Order ID, Stripe payment, shipping/payment address sections, product table rows, order history, and footer/testimonial/newsletter text without applying Amazon order-format validation. The iSpring direct order fixture checks direct-site order confirmations that are not full invoices. A high iSpring direct invoice score means the synthetic PDF is readable and internally consistent for local parser QA; it does not mean the synthetic test invoice is externally verified or real. The Amazon print/order-detail fixture checks the print URL/title cue, order details heading, valid order number, date, total, payment, and printable context filtering. The Amazon order-page fixture is the readable baseline for Amazon order number, order placed/date, order total, payment, and ship/delivery cue detection. The Amazon multi-shipment fixture checks `Shipment 1 of 2`, `Arriving`, `Order Summary`, and partial shipment context as manual order-matching cues. The Amazon mobile-actions fixture checks that `Buy again`, `Track package`, `Return window`, `Delivered`, and `View invoice` rows are rejected as action/status context rather than item evidence. The Amazon split-labels fixture checks that `Order Total` plus a following amount line and `Payment Information` plus a following card line keep their label source. The Amazon OCR order-number fixture checks that spaced `3-7-7` digit groups normalize to the standard Amazon order format before validation. The Amazon split-date fixture checks that `Ordered` or `Order placed` plus a following date line keeps the date source. The Amazon split-context fixture checks that `Sold by`, `Ship to`, `Billing address`, `Arriving`, and payment labels can pair with adjacent values without those values becoming product evidence. The Amazon invoice/detail fixture checks printable invoice, split invoice date, sold-by, billing, split payment-instrument, promotion, and total cues. The sparse high-confidence PDF fixture checks that high confidence over very little extracted text is treated as an evidence-coverage limit rather than Clear OCR.

The Home Depot long order detail fixture checks separated `Online Order #` values, standalone parsed purchase dates, multi-line `Order Total` values with currency labels, two-line payment/tender details, and privacy-safe source summary consistency.

## Main Analyzer Upload QA

The main analyzer screen at `/` must be checked manually whenever the upload layout or evidence viewer changes. Use synthetic or anonymized local files only.

Manual upload checks:

- Click the empty upload zone and confirm the file picker opens.
- Click `Choose evidence file` and confirm selecting a valid image or PDF loads the evidence preview.
- Drag a valid image or PDF over the upload zone and confirm the active drop state appears.
- Drop a valid image or PDF and confirm it loads into the evidence viewer without refreshing the page.
- Drop or select an invalid file type and confirm a clean error message appears.
- After one file is loaded, use `Replace file` and confirm a second valid file replaces the first.
- After one file is loaded, drag/drop a second valid file onto the evidence panel and confirm it replaces the first.
- Confirm `Run local analysis` remains enabled after a successful upload and still produces analyzer output.

## Manual QA Expectations

Fixture expectation labels are manual review prompts:

- `Pass`: current analyzer behavior matches the fixture intent.
- `Warning`: behavior may be acceptable, but the result deserves review.
- `Needs Tuning`: inspect OCR text, parsed fields, metadata, image quality, and scoring before trusting this behavior.

These labels do not block `npm run lint`, `npm run build`, or CI. OCR results can vary across browser, canvas, PDF, and Tesseract behavior, and ClaimGuard does not yet have enough real-world receipt samples to set reliable blocking thresholds.

## Current Threshold Reference

The route displays the current tuning reference for:

- OCR confidence thresholds
- metadata-risk thresholds
- image-quality thresholds
- receipt-structure thresholds
- scoring weights and risk bands

Treat those values as a live review aid. If analyzer code changes, update the threshold summary so the harness stays honest.

The visible score is an Evidence Reliability Score in Phase 1. It measures local evidence quality and internal consistency from browser-side OCR, receipt structure, metadata context, and image-quality signals. It is not external verification and does not prove a receipt is real. Reports and tuning exports should include `Verification Status: Not externally verified`, `External Verification: Not performed`, and internal structure confidence when local analysis is the only source.

High score means the receipt is readable and structurally consistent in local analysis. High score does not prove the receipt is real. Low or medium score means local review signals or evidence-quality limits may require manual review. Very low OCR confidence, sparse text, and unknown source classification should be treated as unable to assess from the current image unless independent suspicious indicators are present. Manual review may still be required depending on support policy.

The score breakdown separates OCR confidence penalty, OCR quality-label penalty, credited parsed fields, missing fields, signal penalties, and final risk bands. Use these details when deciding whether a real receipt result was too harsh, too lenient, or about right.

Analyzer output includes grouped findings for `OCR/Text`, `Receipt Structure`, `Metadata`, `Image Quality`, and `Recommendation`. Use these groups before reading individual signals so inconclusive evidence-quality issues are not confused with potential alteration indicators.

Receipt source classification now separates Amazon app screenshots, Amazon print order details/PDFs, Amazon invoice/detail pages, iSpring direct invoices/orders, Lowe's email/order screenshots, Home Depot / Home Depot Canada orders, Costco / Costco Canada orders, Lazada orders, generic merchant receipts, and unknown/inconclusive evidence. Source classification appears in parsed fields, receipt structure, real receipt session comparisons, and tuning observations. Amazon-specific order-format and cue checks should only guide scoring when the classifier identifies an Amazon source; iSpring direct, Lowe's, Home Depot, Costco, Lazada, generic merchant, and unknown receipts should not be penalized for missing Amazon-only fields. Generic merchant classification remains the fallback when receipt/order structure is visible but no supported narrow source marker matches.

Unknown or weak source classification should be treated as inconclusive/manual review context. Use available merchant, order, total, payment, OCR quality, and receipt-structure details for manual proof-of-purchase matching rather than treating the unknown source as a potential alteration indicator. Generic merchant results should show aggregate cues such as receipt/invoice heading, order or transaction identifier cue, date cue, amount structure, payment/tender cue, shipping/delivery cue, product/price line cue, and whether a known generic merchant marker was present.

Home Depot, Costco, and Lazada source summaries are privacy-safe by design. They report vendor/source marker presence, order/receipt ID cue presence, date cue presence, item/product candidate count, amount-structure presence, payment/tender cue count, and fulfillment cue presence. They must not expose raw order IDs, customer/member data, payment values, store/location details, seller names, addresses, phone numbers, emails, or tracking numbers.

Home Depot field extraction is source-scoped. Home Depot / Home Depot Canada layouts can pair `Online Order`, `Order #`, or `Order Number` labels with adjacent order-token rows, select `Order Total`, `Pickup Order Total`, `Delivery Total`, or `Refund Total` rows as the local total when visible, and pair `Payment`, `Payment Method`, `Payment Details`, or `Tender` labels with adjacent card/tender wording. Long order-detail layouts may have a currency label between a total label and value; the selected total source should still stay tied to the total label. A blank order label should not cause pickup, delivery, payment, subtotal, tax, item, quantity, or total text to be treated as an order number.

iSpring direct invoice QA should verify that `iSpringFilter.com`, `iSpring Water Systems`, `Order ID`, `Payment Method Credit Card / Debit Card Via Stripe`, shipping/payment address sections, and order history classify as iSpring direct website invoice context. Product table rows with product name, model, quantity, unit price, and total should remain item evidence. Account navigation, footer copy, testimonials, newsletter signup, contact information, addresses, emails, phone numbers, tracking numbers, and order-history status rows should stay out of item evidence.

The iSpring direct parsed-field summary is privacy-safe by design. It reports field presence, counts, and structure confidence for order ID, status, email field, telephone field, shipping method, payment method, shipping address block, payment address block, order history, product table row count, subtotal, discount, shipping cost, and total. It must not expose raw customer names, addresses, emails, phone numbers, full order IDs, payment details, or tracking numbers. Use this summary in `/test-evidence` and tuning observations to judge receipt completeness and parser coverage; product table row count supports completeness review but does not verify authenticity by itself.

The analyzer now separates low-quality OCR from receipt-structure concerns. Missing fields under weak OCR should be treated as inconclusive evidence quality, while missing line items, limited amount structure, or Amazon order-format mismatches under readable OCR should guide manual proof-of-purchase verification. Missing payment text by itself should not over-penalize an otherwise readable Amazon receipt with a valid order number, purchase date, product detail, and total.

Parsed field details include purchase-date source, selected-total source, amount candidates, and amount categories. Use these details to tune real receipts that label totals as `Amount paid`, `Total paid`, `Payment total`, `Charged`, or similar merchant-specific wording. Amount categories separate subtotal, tax, shipping, discount, refund, total, payment, and other visible amounts so multi-total receipts can be reviewed without treating every amount difference as a suspicious finding.

For mobile screenshots where OCR splits labels from values, the parser pairs common amount labels with the following amount-only line and payment labels with the following payment-detail line. This keeps `Order Total` plus `$89.99` from looking like an unlabeled fallback amount, and keeps `Payment Information` tied to the card detail below it.

Amazon section context rows now include seller, recipient/ship-to, billing, delivery/shipment, payment, invoice, and redacted/private rows. Adjacent values after labels such as `Sold by`, `Ship to`, `Billing address`, and `Arriving` should support receipt matching but stay out of line-item evidence, especially when those values are names, addresses, emails, phone numbers, masked payment details, or redacted placeholders.

The parser also pairs common date labels with the following date line. For example, `Ordered` followed by `04/15/2026` should become an adjacent order-date source instead of a missing purchase date or item candidate.

Amount review notes call out discounts, refunds, split payments, store credit, gift-card wording, and multiple total-like lines as reconciliation context. Treat these as prompts to match the receipt against order records, not as standalone alteration signals.

Payment details include the selected payment source, payment candidate lines, payment type, and whether the OCR found a visible last-four. Missing last-four digits should be treated as a privacy/OCR checkpoint for manual matching, not as standalone suspicious evidence. Real receipt QA should redact sensitive payment details before upload and before sharing copied JSON.

Lowe's email/order screenshots can use delivery-style dates such as `Delivered Thursday, Apr 9, 2026` or split payment sections where `Payment` is followed by a card detail line. These cues should populate date/payment fields when visible, but they remain local parser evidence only; they do not externally verify the order.

For Amazon-like receipts, the harness also shows Amazon-specific structure cues: order placed/date, items ordered, order summary, order total, ship/delivery context, arrival/shipment wording, payment cue, multi-shipment wording, invoice/order-detail wording, sold-by cue, billing cue, promotion cue, context rows, and order-number issue. Missing cues under readable OCR should be treated as a purchase-record matching prompt, not a customer accusation.

Amazon mobile action rows such as `Buy again`, `Track package`, `Return window`, `Delivered`, and `View invoice` are context rows, not purchased-item evidence. Use rejected line-item candidates to confirm these rows are not silently treated as product details.

Amazon invoice/detail cues are purchase-matching context only. `Invoice #`, split `Invoice Date` / `Order Date` labels, `Payment Instrument` or `ending with` payment rows, `Print this page for your records`, `Sold by`, `Billing address`, and `Subscribe & Save` or promotion lines can make a receipt easier to match, but they should not become standalone review signals without conflicting order data.

Amazon order-number validation normalizes common OCR dash confusions, including equals signs, spaced `3-7-7` digit groups, and fully contiguous 17-digit order numbers. Review the raw OCR text before treating an invalid or missing Amazon order number as meaningful.

Metadata and image-quality findings are also separated:

- Missing EXIF or stripped metadata is source-context only. It should prompt order matching, not rejection.
- Compression, low resolution, and sparse OCR are evidence-quality limits. They may justify asking for a clearer copy.
- Potential alteration indicators should remain narrower than general quality limits.

OCR output includes a quality label:

- `Clear`: enough extracted text coverage and confidence for normal local parsing.
- `Usable`: readable, but limited coverage or low-confidence words may affect one or more fields.
- `Inconclusive`: OCR is sparse, incomplete, or uncertain enough that findings should be treated as manual-review guidance.
- `Unreadable`: text is too sparse or absent for reliable local analysis.

When the OCR engine returns text but does not provide word-level metadata, the analyzer falls back to counting text tokens for the OCR quality label. This prevents readable extracted text from being mislabeled as unreadable only because the browser OCR runtime omitted word objects.

When reviewing poor-quality receipts, tune against the OCR quality label, OCR uncertainty notes, low-confidence word samples, and customer-safe wording before changing fraud or structure thresholds. OCR uncertainty notes group very low-confidence tokens, lower-confidence checkpoints, sparse/unreadable text, and possible parsed-field impact.

High-average OCR with clustered low-confidence tokens is treated as a manual checkpoint instead of automatically becoming a blocking OCR signal when there is enough extracted text coverage. Very sparse OCR is evidence-limited even when confidence is high, so `Receipt text is inconclusive` can appear for unreadable OCR, average confidence below 60%, inconclusive OCR below 75% average confidence, or fewer than 12 extracted words.

Parsed fields include field-level OCR reliability notes for merchant, order number, purchase date, line item/product detail, total, and payment method. These notes combine parser confidence with the OCR quality label so a value can be extracted while still requiring manual review when OCR is weak.

The parsed-field panel also shows line-item candidates: the first readable product-like lines the parser treated as item or product detail. During real receipt QA, compare those candidates with the redacted receipt image to decide whether the parser found genuine purchased-item text or only OCR noise from headings, addresses, shipment labels, or legal/footer copy.

Rejected line-item candidates are also shown with reasons. Use them to confirm that printable invoice text, merchant headings, address/recipient lines, payment lines, amount lines, Amazon mobile action rows, and footer/policy copy were not silently counted as purchased-item evidence.

Item-price lines are supported when the line looks like product text followed by a price. The analyzer strips the trailing amount from the item candidate, while subtotal, tax, total, shipping, discount, refund, and payment amount lines remain rejected as structure or reconciliation context.

Quantity and item-code lines are supported for common retail formats such as `SKU 7742 FILTER PACK $29.99`, `UPC 019876 WRENCH TOOL $5.25`, and `2 X REPLACEMENT KIT $15.00`. The analyzer strips the SKU/UPC/code or quantity prefix from accepted item candidates, while order IDs, subtotal/tax/total lines, and payment lines remain rejected as non-item structure.

## Real Anonymized Receipt QA

The `Real Receipt QA` section lets a local reviewer temporarily upload one or more anonymized receipt images or PDFs and run them through the same local `analyzeEvidenceFile` pipeline. Uploaded files are held in browser memory for the current session only. Do not add real receipt files to the repo, fixtures, commits, issues, or docs.

Phase 1 OCR privacy/runtime note: receipt file bytes are processed in the browser by the local analyzer and are not sent to a ClaimGuard server or OCR provider API. Tesseract.js browser defaults may still load worker, core, and language runtime assets from package or CDN paths unless self-hosted assets are configured in a later bucket. Treat that as a runtime asset dependency, not evidence upload.

The real-receipt session table compares uploaded files side by side by receipt classification, risk, Evidence Reliability Score, verification status, internal structure confidence, OCR quality, score impact, manual notes, and obvious sensitive-pattern count. Use this table to compare Amazon and non-Amazon examples without turning customer evidence into fixtures.

Real receipt copy/export controls are privacy-safe by default:

- `Copy tuning summary` is the preferred active-run sharing format for threshold and reliability-score review. It includes file category, receipt class, manual QA notes, risk, Evidence Reliability Score, verification status, external verification status, internal structure confidence, OCR quality, parsed-field presence, score-rule impact, review signal titles/categories, and recommendation summary. It excludes raw OCR text, original file names, and parsed private values by default.
- `Copy redacted QA observation` is a diagnostic export with a structurally safe shape. It omits raw OCR text, low-confidence token text, raw receipt text, parsed candidate text values, context-row values, field values, raw final-report narrative fields, original file names, last-modified timestamps, and EXIF-like metadata by default. It keeps aggregate diagnostics such as receipt class, source category/confidence/cues, Evidence Reliability Score, verification status, external verification status, internal structure confidence, OCR quality/confidence/word counts, parsed-field presence booleans, candidate counts, missing field names, score breakdown categories, review signal title/category/severity/confidence, and presence/count-only source-specific summaries.
- `Copy session summary` and `Export session summary` use the same privacy-safe observation shape for all completed real receipt runs in the current browser-memory session.
- `Copy full JSON` is disabled until the privacy checklist confirms the source receipt was anonymized, OCR text was reviewed, and the full JSON payload was privacy-reviewed.

Use `Copy redacted QA observation` only when debugging parser internals requires more structure than a tuning summary provides. Use `Copy full JSON` only for local/private debugging after manual privacy review. The redacted diagnostic shape is safer than regex masking alone, but reviewers should still inspect copied payloads before sharing them outside the local QA session.

Before testing, redact or remove:

- customer name
- address
- email
- phone number
- payment details, including card brand plus last four digits when sensitive
- full order identifiers if sensitive
- any other account, shipping, loyalty, or internal support identifiers

Recommended workflow:

1. Run the synthetic fixtures first to confirm the harness is behaving normally.
2. Upload one or more anonymized real receipts in `Real Receipt QA`.
3. Review grouped findings, OCR text, parsed fields, metadata findings, image-quality findings, score breakdown, review signals, customer-safe recommendation, and final report.
4. Use the session comparison table to compare Amazon/non-Amazon classification, Evidence Reliability Score, verification status, internal structure confidence, OCR quality, missing fields, and signal penalties.
5. Review OCR/private fields locally and do not share raw OCR unless it has been privacy-reviewed.
6. Fill out the local QA notes for expected risk, OCR accuracy, parsed fields, reliability score fit, and suggested threshold change for each selected receipt.
7. Prefer `Copy tuning summary` for threshold/reliability-score review because it avoids raw OCR text by default.
8. Use `Copy redacted QA observation` only when deeper parser debugging is needed. Use `Copy full JSON` only after completing the privacy checklist and confirming the copied payload does not contain private customer data.
9. Paste copied tuning observations into review discussions so threshold changes can be grounded in real analyzer output without exposing customer details.

Real receipt QA is manual and should not block CI yet. The analyzer still runs local OCR in the browser, and outputs may vary across browser, PDF, canvas, and Tesseract behavior.

## When to Make This CI-Blocking

Only promote expectation checks to CI after all of these are true:

- ClaimGuard has a representative anonymized receipt corpus covering clean, suspicious, poor-quality, image, and PDF evidence.
- OCR execution is stable enough across environments or has moved to a controlled server-side runtime.
- Expected outcomes are reviewed against support policy and fraud-language safety requirements.
- Thresholds have been tuned on real samples, not just synthetic fixtures.
- CI failures produce clear debugging artifacts, such as OCR text, parsed fields, score breakdown, and result JSON.

Until then, `/test-evidence` should remain a manual QA and tuning harness.
