// lib/resume-parser.ts
import { createRequire } from 'module';
import mammoth from 'mammoth';

export type SupportedResumeType = 'pdf' | 'docx';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Detects the resume type from the browser-supplied MIME type, falling back to
 * the file extension. Browsers are inconsistent about DOCX (`application/
 * vnd.openxmlformats-officedocument.wordprocessingml.document`, sometimes
 * `application/octet-stream`), so the extension is the more reliable signal.
 */
export function detectResumeType(fileName: string, mimeType: string): SupportedResumeType | null {
  const name = fileName.toLowerCase();

  if (name.endsWith('.pdf') || mimeType === 'application/pdf') return 'pdf';
  if (name.endsWith('.docx') || mimeType.includes('wordprocessingml')) return 'docx';

  return null;
}

/**
 * Extracts text from a PDF with pdf.js.
 *
 * The `legacy` build is used deliberately: the modern build ships browser-only
 * APIs (DOMMatrix, canvas) that are absent in the Node runtime a Next.js route
 * handler runs in. The import is dynamic so the ~2 MB worker bundle is only
 * pulled in when someone actually uploads a PDF, and never during `next build`
 * page-data collection.
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // pdf.js insists on a workerSrc even in Node. Resolving the worker through
  // `createRequire` points it at the real file inside node_modules, which is why
  // `pdfjs-dist` is listed in `serverExternalPackages` in next.config.ts — the
  // package must stay unbundled for this resolution to succeed at runtime.
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    // The specifier is assembled at runtime on purpose: written as a literal,
    // webpack tries to statically bundle the worker (`.mjs`) and the build fails
    // with "ESM packages need to be imported". Assembling it keeps the resolution
    // in Node, where `pdfjs-dist` sits unbundled thanks to serverExternalPackages.
    const workerSpecifier = ['pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'].join('/');
    pdfjs.GlobalWorkerOptions.workerSrc = createRequire(import.meta.url).resolve(workerSpecifier);
  }

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    // pdf.js returns positioned text runs, not lines. Joining with spaces and
    // collapsing whitespace is enough for keyword/ATS analysis, which does not
    // depend on the original layout.
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text) pages.push(text);
  }

  await pdf.destroy();

  const fullText = pages.join('\n\n');

  if (!fullText.trim()) {
    throw new Error(
      'No text found in this PDF. It looks like a scanned image — export a text-based PDF or upload a DOCX instead.'
    );
  }

  return fullText;
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value.replace(/\n{3,}/g, '\n\n').trim();

  if (!text) {
    throw new Error('No text found in this DOCX file.');
  }

  return text;
}

/** Single entry point used by the resume route: type detection + extraction. */
export async function parseResume(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ text: string; type: SupportedResumeType }> {
  const type = detectResumeType(fileName, mimeType);

  if (!type) {
    throw new Error('Unsupported file type. Upload a PDF or DOCX resume.');
  }

  const text = type === 'pdf' ? await parsePDF(buffer) : await parseDOCX(buffer);

  return { text, type };
}
