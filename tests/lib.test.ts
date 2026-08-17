// tests/lib.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { isSameDay, isSameMonth } from '../lib/quota';
import { escapeRegex, ApiError, parseBody } from '../lib/http';
import {
  applicationCreateSchema,
  answerSubmitSchema,
  mockInterviewCreateSchema,
  questionCreateSchema,
  profileUpdateSchema,
} from '../lib/validation';
import { detectResumeType } from '../lib/resume-parser';

test('quota rollover compares full dates, not just the day number', () => {
  // The original bug: `now.getDate() !== lastReset.getDate()` treats 15 Jan and
  // 15 Feb as the same day, so a monthly-idle user never got a daily reset.
  assert.equal(isSameDay(new Date('2026-01-15T10:00:00Z'), new Date('2026-02-15T10:00:00Z')), false);
  assert.equal(isSameDay(new Date('2026-01-15T01:00:00'), new Date('2026-01-15T23:00:00')), true);
  assert.equal(isSameDay(new Date('2026-01-15T10:00:00Z'), new Date('2026-01-16T10:00:00Z')), false);
});

test('monthly rollover compares year and month', () => {
  // `getMonth()` alone treats March 2025 and March 2026 as the same month.
  assert.equal(isSameMonth(new Date('2025-03-01'), new Date('2026-03-01')), false);
  assert.equal(isSameMonth(new Date('2026-03-01'), new Date('2026-03-28')), true);
});

test('escapeRegex neutralises user input used in a RegExp', () => {
  assert.equal(escapeRegex('c++'), 'c\\+\\+');
  assert.doesNotThrow(() => new RegExp(escapeRegex('(a+)+$')));
  assert.equal(new RegExp(escapeRegex('c++'), 'i').test('C++ Developer'), true);
});

test('application schema rejects an injected userId and unknown fields', () => {
  const parsed = applicationCreateSchema.parse({
    companyName: 'Acme',
    position: 'SDE-1',
    userId: '000000000000000000000000',
    upvotes: 9999,
  } as Record<string, unknown>);

  assert.equal('userId' in parsed, false);
  assert.equal('upvotes' in parsed, false);
  assert.equal(parsed.status, 'applied');
  assert.equal(parsed.priority, 'medium');
});

test('application schema rejects an invalid status', () => {
  assert.throws(() =>
    applicationCreateSchema.parse({ companyName: 'Acme', position: 'SDE', status: 'hired' })
  );
});

test('mock interview schema bounds the question count', () => {
  assert.throws(() =>
    mockInterviewCreateSchema.parse({
      companyName: 'Acme',
      jobRole: 'SDE',
      experienceLevel: 'entry',
      interviewType: 'Technical',
      difficulty: 'Easy',
      numQuestions: 500,
    })
  );

  const parsed = mockInterviewCreateSchema.parse({
    companyName: 'Acme',
    jobRole: 'SDE',
    experienceLevel: 'entry',
    interviewType: 'Technical',
    difficulty: 'Easy',
  });
  assert.equal(parsed.numQuestions, 10);
});

test('answer schema enforces a minimum answer length', () => {
  assert.throws(() => answerSubmitSchema.parse({ questionNumber: 1, answer: 'too short' }));
  assert.doesNotThrow(() =>
    answerSubmitSchema.parse({ questionNumber: 1, answer: 'x'.repeat(60), timeSpent: 30 })
  );
});

test('question schema requires a substantive question and a known type', () => {
  assert.throws(() =>
    questionCreateSchema.parse({
      companyName: 'Acme',
      jobRole: 'SDE',
      interviewRound: 'R1',
      difficulty: 'medium',
      questionType: 'trivia',
      questionText: 'What is a linked list, and when would you use one?',
    })
  );

  const parsed = questionCreateSchema.parse({
    companyName: 'Acme',
    jobRole: 'SDE',
    interviewRound: 'R1',
    difficulty: 'medium',
    questionType: 'technical',
    questionText: 'What is a linked list, and when would you use one?',
  });
  assert.deepEqual(parsed.tags, []);
  assert.equal(parsed.isAnonymous, false);
});

test('profile schema does not accept email, password or quota changes', () => {
  const parsed = profileUpdateSchema.parse({
    name: 'Kundan',
    email: 'attacker@example.com',
    password: 'hunter2',
    quota: { resumeOptimizations: { dailyLimit: 9999 } },
  } as Record<string, unknown>);

  assert.equal('email' in parsed, false);
  assert.equal('password' in parsed, false);
  assert.equal('quota' in parsed, false);
});

test('parseBody turns invalid JSON and schema failures into 400s', async () => {
  const badJson = new Request('http://localhost/api/x', { method: 'POST', body: 'not json' });
  await assert.rejects(
    () => parseBody(badJson, applicationCreateSchema),
    (error: unknown) => error instanceof ApiError && error.status === 400
  );

  const badShape = new Request('http://localhost/api/x', {
    method: 'POST',
    body: JSON.stringify({ position: 'SDE' }),
  });
  await assert.rejects(
    () => parseBody(badShape, applicationCreateSchema),
    (error: unknown) => error instanceof ApiError && error.status === 400
  );
});

test('resume type detection falls back to the file extension', () => {
  assert.equal(detectResumeType('resume.pdf', 'application/pdf'), 'pdf');
  // Some browsers send octet-stream for .docx uploads.
  assert.equal(detectResumeType('resume.docx', 'application/octet-stream'), 'docx');
  assert.equal(detectResumeType('resume.txt', 'text/plain'), null);
});
