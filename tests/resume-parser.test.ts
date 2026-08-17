// tests/resume-parser.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parsePDF, parseDOCX, parseResume } from '../lib/resume-parser';

const fixture = (name: string) => readFileSync(join(import.meta.dirname, 'fixtures', name));

/**
 * These exercise the real extraction path. The previous implementation threw
 * "PDF files are not supported" for every PDF, which silently broke the most
 * common resume format on the platform.
 */
test('parsePDF extracts text from a real PDF', async () => {
  const text = await parsePDF(fixture('sample.pdf'));

  assert.match(text, /Software Engineer/);
  assert.match(text, /MongoDB/);
});

test('parseDOCX extracts text from a real DOCX', async () => {
  const text = await parseDOCX(fixture('sample.docx'));

  assert.match(text, /Kundan Solanki/);
  assert.match(text, /Next\.js/);
});

test('parseResume routes by file type and rejects unsupported ones', async () => {
  const pdf = await parseResume(fixture('sample.pdf'), 'resume.pdf', 'application/pdf');
  assert.equal(pdf.type, 'pdf');

  const docx = await parseResume(fixture('sample.docx'), 'resume.docx', 'application/octet-stream');
  assert.equal(docx.type, 'docx');

  await assert.rejects(() => parseResume(Buffer.from('hello'), 'resume.txt', 'text/plain'), {
    message: /Unsupported file type/,
  });
});
