// app/api/questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { FilterQuery } from 'mongoose';
import connectDB from '@/lib/db';
import Question, { type IQuestion } from '@/models/Question';
import User from '@/models/User';
import { generateQuestionTags } from '@/lib/groq';
import { escapeRegex, parseBody, requireUserId, withErrorHandling } from '@/lib/api';
import { questionCreateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

/** Public read: the question bank is browsable without an account. */
export const GET = withErrorHandling('questions:GET', async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim();
  const difficulty = searchParams.get('difficulty');
  const company = searchParams.get('company')?.trim();
  const role = searchParams.get('role')?.trim();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  await connectDB();

  const query: FilterQuery<IQuestion> = {};

  // $text uses the compound text index declared on the schema, so full-text search
  // stays on the database instead of pulling every question into Node.
  if (search) query.$text = { $search: search };
  if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
  // escapeRegex: without it, a user typing "c++" produces an invalid regex and a
  // crafted input like "(a+)+$" becomes a ReDoS against the database.
  if (company) query.companyName = new RegExp(escapeRegex(company), 'i');
  if (role) query.jobRole = new RegExp(escapeRegex(role), 'i');

  const [questions, total] = await Promise.all([
    Question.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('contributorId', 'name image')
      .lean(),
    Question.countDocuments(query),
  ]);

  return NextResponse.json({
    questions: questions.map((question) => ({
      ...question,
      // Anonymous contributions must not leak the contributor through populate().
      contributorId: question.isAnonymous ? null : question.contributorId,
    })),
    page,
    pageSize: PAGE_SIZE,
    total,
    hasMore: page * PAGE_SIZE < total,
  });
});

export const POST = withErrorHandling('questions:POST', async (req: NextRequest) => {
  const userId = await requireUserId();
  const data = await parseBody(req, questionCreateSchema);

  await connectDB();

  // Only fall back to the LLM when the contributor left tags empty — this keeps the
  // common path free of a network call to Groq.
  const tags = data.tags.length > 0 ? data.tags : await generateQuestionTags(data.questionText);

  const question = await Question.create({
    ...data,
    tags,
    contributorId: userId,
  });

  // $inc is atomic, so two contributions submitted at once both count.
  await User.updateOne(
    { _id: userId },
    { $inc: { 'reputation.totalPoints': 5, 'reputation.questionContributions': 1 } }
  );

  return NextResponse.json(question, { status: 201 });
});
