// app/api/mock-interview/[sessionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import InterviewSession from '@/models/InterviewSession';
import InterviewQuestion from '@/models/InterviewQuestion';
import { ApiError, requireObjectId, requireUserId, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** Returns the session plus its questions — deliberately WITHOUT expectedKeyPoints. */
export const GET = withErrorHandling(
  'mock-interview:get',
  async (_req: NextRequest, context: { params: Promise<{ sessionId: string }> }) => {
    const userId = await requireUserId();
    const { sessionId } = await context.params;
    requireObjectId(sessionId, 'session id');

    await connectDB();

    const interviewSession = await InterviewSession.findOne({ _id: sessionId, userId }).lean();

    if (!interviewSession) throw new ApiError(404, 'Session not found');

    // `expectedKeyPoints` is the grading rubric. Selecting only the display fields
    // keeps it out of the JSON the browser can read while the interview is live.
    const questions = await InterviewQuestion.find({ sessionId })
      .select('questionNumber questionText category difficulty userAnswer')
      .sort({ questionNumber: 1 })
      .lean();

    return NextResponse.json({
      session: {
        id: interviewSession._id.toString(),
        companyName: interviewSession.companyName,
        jobRole: interviewSession.jobRole,
        interviewType: interviewSession.interviewType,
        difficulty: interviewSession.difficulty,
        status: interviewSession.status,
        totalQuestions: interviewSession.totalQuestions,
        questionsAnswered: interviewSession.questionsAnswered,
      },
      questions: questions.map((question) => ({
        questionNumber: question.questionNumber,
        question: question.questionText,
        category: question.category,
        difficulty: question.difficulty,
        // Lets the client resume a half-finished interview instead of restarting.
        answered: Boolean(question.userAnswer),
        userAnswer: question.userAnswer ?? '',
      })),
    });
  }
);
