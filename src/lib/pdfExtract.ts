/**
 * pdfExtract.ts
 * Browser-side PDF text extraction using pdfjs-dist (Mozilla PDF.js).
 * Never logs sensitive medical content.
 */

import * as pdfjs from 'pdfjs-dist';

// Point the PDF.js worker to the CDN bundle so Vite doesn't need to bundle it.
// This is the standard approach for browser environments.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

/**
 * Extracts readable text from a PDF File object.
 *
 * @param file - A File of type application/pdf
 * @returns Extracted text string (pages separated by form-feed character)
 * @throws Error with a user-friendly message when extraction fails or yields no text
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  console.log('[PDF Extract] Starting extraction:', {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(1)} KB`,
    mimeType: file.type,
  });

  // Read the file as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  let pdf: pdfjs.PDFDocumentProxy;
  try {
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    pdf = await loadingTask.promise;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[PDF Extract] Failed to load PDF document:', msg);
    throw new Error(
      'Could not read the PDF file. The file may be corrupted or password-protected.'
    );
  }

  const numPages = pdf.numPages;
  console.log(`[PDF Extract] PDF loaded successfully. Pages: ${numPages}`);

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Concatenate text items, preserving line breaks where items have
      // significant vertical gaps.
      let lastY: number | null = null;
      const lines: string[] = [];
      let currentLine = '';

      for (const item of textContent.items) {
        // pdfjs text items have a `str` property
        if (!('str' in item)) continue;
        const textItem = item as pdfjs.TextItem;

        if (lastY !== null && Math.abs(textItem.transform[5] - lastY) > 5) {
          // New line detected
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = textItem.str;
        } else {
          currentLine += textItem.str;
        }
        lastY = textItem.transform[5];
      }
      if (currentLine.trim()) lines.push(currentLine.trim());

      const pageText = lines.join('\n');
      if (pageText.trim()) {
        pageTexts.push(`--- Page ${pageNum} ---\n${pageText}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[PDF Extract] Could not extract text from page ${pageNum}:`, msg);
      // Continue with remaining pages
    }
  }

  const fullText = pageTexts.join('\n\n');
  const charCount = fullText.trim().length;

  console.log('[PDF Extract] Extraction result:', {
    pagesWithText: pageTexts.length,
    totalPages: numPages,
    extractedCharCount: charCount,
    success: charCount > 50,
  });

  if (charCount < 50) {
    // Very little text extracted — likely a scanned (image-only) PDF
    throw new Error(
      'PDF text could not be extracted. This PDF appears to contain scanned images rather than selectable text. ' +
      'Please upload a clearer document, use a PDF with selectable text, or scan the document as an image (JPEG/PNG) instead.'
    );
  }

  return fullText;
}
