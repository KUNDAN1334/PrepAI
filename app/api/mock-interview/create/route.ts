// app/api/mock-interview/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import InterviewSession from '@/models/InterviewSession';
import InterviewQuestion from '@/models/InterviewQuestion';
import { generateMockInterviewQuestions } from '@/lib/groq';
import { ApiError, parseBody, requireUserId, withErrorHandling } from '@/lib/api';
import { mockInterviewCreateSchema } from '@/lib/validation';
import { checkQuota, incrementQuota, quotaExceededResponse } from '@/lib/quota';

export const dynamic = 'force-dynamic';
// Generating 10-20 questions with an LLM can take longer than the default limit.
export const maxDuration = 60;

export const POST = withErrorHandling('mock-interview:create', async (req: NextRequest) => {
  const userId = await requireUserId();
  const input = await parseBody(req, mockInterviewCreateSchema);

  await connectDB();

  const quota = await checkQuota(userId, 'mockInterviews');

  if (!quota.allowed) {
    return NextResponse.json(quotaExceededResponse('mockInterviews', quota), { status: 429 });
  }

  const questions = await generateMockInterviewQuestions(input);

  if (questions.length === 0) {
    throw new ApiError(502, 'The question generator returned nothing. Please try again.');
  }

  const interviewSession = await InterviewSession.create({
    userId,
    companyName: input.companyName,
    jobRole: input.jobRole,
    experienceLevel: input.experienceLevel,
    interviewType: input.interviewType,
    difficulty: input.difficulty,
    jobDescription: input.jobDescription,
    status: 'in-progress',
    // Trust the generated count, not the requested count: the model occasionally
    // returns fewer questions, and totalQuestions drives the "completed" check.
    totalQuestions: questions.length,
    questionsAnswered: 0,
  });

  try {
    // insertMany is one round trip instead of N sequential saves.
    await InterviewQuestion.insertMany(
      questions.map((question, index) => ({
        sessionId: interviewSession._id,
        questionNumber: index + 1,
        questionText: question.question,
        category: question.category,
        difficulty: question.difficulty,
        expectedKeyPoints: question.expectedKeyPoints,
      }))
    );
  } catch (error) {
    // Without this, a partial failure leaves an un-startable session behind.
    await InterviewSession.deleteOne({ _id: interviewSession._id });
    throw error;
  }

  await incrementQuota(userId, 'mockInterviews');

  return NextResponse.json(
    {
      sessionId: interviewSession._id.toString(),
      totalQuestions: questions.length,
      remaining: Math.max(0, quota.remaining - 1),
      message: 'Mock interview created successfully',
    },
    { status: 201 }
  );
});
