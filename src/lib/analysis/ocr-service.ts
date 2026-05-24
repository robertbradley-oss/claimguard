import type { OcrExtraction, OcrQuality, OcrRegion, OcrUncertaintyNote } from "@/lib/analysis/types";
import type { PDFPageProxy } from "pdfjs-dist/types/src/display/api";

type TesseractWord = {
  text?: string;
  confidence?: number;
};

type PdfTextItem = {
  str?: string;
  transform?: number[];
};

function getAverage(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function normalizeOcrText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildOcrQuality(params: {
  averageConfidence: number;
  wordCount: number;
  lowConfidenceWordCount: number;
  textLength: number;
  engine: OcrExtraction["engine"];
}): OcrQuality {
  const lowConfidenceRate =
    params.wordCount > 0 ? Number((params.lowConfidenceWordCount / params.wordCount).toFixed(2)) : 0;
  let label: OcrQuality["label"] = "Clear";

  if (params.averageConfidence === 0 || params.textLength < 12 || params.wordCount < 3) {
    label = "Unreadable";
  } else if (params.averageConfidence < 45 || lowConfidenceRate >= 0.45) {
    label = "Inconclusive";
  } else if (params.averageConfidence < 70 || lowConfidenceRate >= 0.2) {
    label = "Usable";
  }

  const summary =
    label === "Clear"
      ? "OCR text is clear enough for local field parsing."
      : label === "Usable"
        ? "OCR text is usable, but low-confidence words may affect one or more receipt fields."
        : label === "Inconclusive"
          ? "OCR text is incomplete or uncertain, so findings should be treated as manual-review guidance."
          : "OCR text is unreadable or too sparse for reliable local analysis.";

  return {
    label,
    wordCount: params.wordCount,
    lowConfidenceWordCount: params.lowConfidenceWordCount,
    lowConfidenceRate,
    summary: `${summary} Engine: ${params.engine}.`,
  };
}

function likelyFieldImpact(samples: OcrRegion[]) {
  const sampleText = samples.map((sample) => sample.text).join(" ");
  const impacts = [
    /[$]\s*\d|\d+[,.]\d{2}/.test(sampleText) ? "amounts" : undefined,
    /\d{1,2}[/-]\d{1,2}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(sampleText) ? "dates" : undefined,
    /\d{3}|\border\b|#|-/.test(sampleText) ? "order numbers" : undefined,
    /\b(?:visa|mastercard|amex|paypal|card|gift)\b/i.test(sampleText) ? "payment method" : undefined,
  ].filter((impact): impact is string => Boolean(impact));

  return [...new Set(impacts)];
}

function buildOcrUncertaintyNotes(params: {
  quality: OcrQuality;
  lowConfidenceRegions: OcrRegion[];
}): OcrUncertaintyNote[] {
  const veryLowConfidence = params.lowConfidenceRegions.filter((region) => region.confidence < 35);
  const moderateLowConfidence = params.lowConfidenceRegions.filter((region) => region.confidence >= 35);
  const impactedFields = likelyFieldImpact(params.lowConfidenceRegions);
  const notes: OcrUncertaintyNote[] = [];

  if (params.quality.label === "Unreadable" && params.lowConfidenceRegions.length === 0) {
    notes.push({
      label: "Sparse or unreadable OCR text",
      severity: "High",
      samples: [],
      note: "OCR returned too little readable text to support reliable local field parsing. Treat missing fields as evidence-quality limits.",
    });
  }

  if (veryLowConfidence.length > 0) {
    notes.push({
      label: "Very low-confidence OCR tokens",
      severity: "High",
      samples: veryLowConfidence.slice(0, 5),
      note: "These tokens were recognized with very low confidence and should not be relied on without visual review.",
    });
  }

  if (moderateLowConfidence.length > 0) {
    notes.push({
      label: "Low-confidence OCR tokens",
      severity: params.quality.label === "Clear" ? "Low" : "Medium",
      samples: moderateLowConfidence.slice(0, 5),
      note: "These tokens may be correct, but they are useful checkpoints when reviewing parsed receipt fields.",
    });
  }

  if (impactedFields.length > 0) {
    notes.push({
      label: "Possible parsed-field impact",
      severity: params.quality.label === "Clear" ? "Low" : "Medium",
      samples: params.lowConfidenceRegions.slice(0, 5),
      note: `Low-confidence OCR samples may affect ${impactedFields.join(", ")}. Verify those fields against the receipt image.`,
    });
  }

  return notes;
}

async function runTesseract(image: File | HTMLCanvasElement, engine: OcrExtraction["engine"]) {
  // Receipt bytes stay in the browser for Phase 1. Tesseract.js may still
  // download worker/core/language runtime assets unless self-hosted paths are
  // configured in a later bucket.
  const { recognize } = await import("tesseract.js");
  const result = await recognize(image, "eng", {
    logger: () => undefined,
  });
  const words = ((result.data as { words?: TesseractWord[] }).words ?? []).filter(
    (word) => word.text?.trim(),
  );
  const lowConfidenceWords = words.filter((word) => typeof word.confidence === "number" && word.confidence < 55);
  const normalizedText = normalizeOcrText(result.data.text ?? "");
  const textTokens = normalizedText.split(/\s+/).filter(Boolean);
  const averageConfidence = Math.round(result.data.confidence ?? getAverage(words.map((word) => word.confidence ?? 0)));
  const wordCount = words.length || textTokens.length;
  const lowConfidenceWordCount = words.length ? lowConfidenceWords.length : 0;
  const lowConfidenceRegions: OcrRegion[] = lowConfidenceWords
    .slice(0, 8)
    .map((word) => ({
      text: word.text?.trim() ?? "",
      confidence: Math.round(word.confidence ?? 0),
    }));
  const quality = buildOcrQuality({
    averageConfidence,
    wordCount,
    lowConfidenceWordCount,
    textLength: normalizedText.length,
    engine,
  });

  return {
    engine,
    text: normalizedText,
    averageConfidence,
    pages: 1,
    quality,
    lowConfidenceRegions,
    uncertaintyNotes: buildOcrUncertaintyNotes({ quality, lowConfidenceRegions }),
  } satisfies OcrExtraction;
}

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();

  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 3); pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = (content.items as PdfTextItem[])
      .map((item) => ({
        text: item.str?.trim() ?? "",
        x: item.transform?.[4] ?? 0,
        y: item.transform?.[5] ?? 0,
      }))
      .filter((item) => item.text)
      .sort((first, second) => {
        if (Math.abs(second.y - first.y) > 2) {
          return second.y - first.y;
        }

        return first.x - second.x;
      })
      .reduce<{ y: number; parts: { x: number; text: string }[] }[]>((groups, item) => {
        const currentGroup = groups.find((group) => Math.abs(group.y - item.y) <= 2);

        if (currentGroup) {
          currentGroup.parts.push({ x: item.x, text: item.text });
        } else {
          groups.push({ y: item.y, parts: [{ x: item.x, text: item.text }] });
        }

        return groups;
      }, [])
      .map((group) =>
        group.parts
          .sort((first, second) => first.x - second.x)
          .map((part) => part.text)
          .join(" ")
          .trim(),
      );
    const text = lines.join("\n");
    pageTexts.push(text);
  }

  return {
    text: normalizeOcrText(pageTexts.join("\n\n")),
    pages: document.numPages,
    firstPage: await document.getPage(1),
  };
}

async function renderPdfPageToCanvas(page: PDFPageProxy) {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = window.document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create a canvas context for PDF OCR.");
  }

  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas;
}

export async function extractOcr(file: File): Promise<OcrExtraction> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const pdf = await extractPdfText(file);

    if (pdf.text.length > 35) {
      const quality = buildOcrQuality({
        averageConfidence: 92,
        wordCount: pdf.text.split(/\s+/).filter(Boolean).length,
        lowConfidenceWordCount: 0,
        textLength: pdf.text.length,
        engine: "pdfjs-text",
      });

      return {
        engine: "pdfjs-text",
        text: pdf.text,
        averageConfidence: 92,
        pages: pdf.pages,
        quality,
        lowConfidenceRegions: [],
        uncertaintyNotes: buildOcrUncertaintyNotes({ quality, lowConfidenceRegions: [] }),
      };
    }

    const canvas = await renderPdfPageToCanvas(pdf.firstPage);
    const renderedOcr = await runTesseract(canvas, "pdfjs-rendered-ocr");

    return {
      ...renderedOcr,
      pages: pdf.pages,
    };
  }

  if (file.type.startsWith("image/")) {
    return runTesseract(file, "tesseract.js");
  }

  const quality = buildOcrQuality({
    averageConfidence: 0,
    wordCount: 0,
    lowConfidenceWordCount: 0,
    textLength: 0,
    engine: "unsupported",
  });

  return {
    engine: "unsupported",
    text: "",
    averageConfidence: 0,
    pages: 0,
    quality,
    lowConfidenceRegions: [],
    uncertaintyNotes: buildOcrUncertaintyNotes({ quality, lowConfidenceRegions: [] }),
  };
}
