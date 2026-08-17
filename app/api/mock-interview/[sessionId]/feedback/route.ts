// app/api/mock-interview/[sessionId]/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import InterviewSession from '@/models/InterviewSession';
import InterviewQuestion from '@/models/InterviewQuestion';
import { ApiError, requireObjectId, requireUserId, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** Post-interview report: every question with its answer, score and rubric. */
export const GET = withErrorHandling(
  'mock-interview:feedback',
  async (_req: NextRequest, context: { params: Promise<{ sessionId: string }> }) => {
    const userId = await requireUserId();
    const { sessionId } = await context.params;
    requireObjectId(sessionId, 'session id');

    await connectDB();

    const interviewSession = await InterviewSession.findOne({ _id: sessionId, userId }).lean();

    if (!interviewSession) throw new ApiError(404, 'Session not found');

    const questions = await InterviewQuestion.find({ sessionId }).sort({ questionNumber: 1 }).lean();

    const scores = questions
      .map((question) => question.evaluation?.score)
      .filter((score): score is number => typeof score === 'number');

    return NextResponse.json({
      sessionId,
      companyName: interviewSession.companyName,
      jobRole: interviewSession.jobRole,
      interviewType: interviewSession.interviewType,
      difficulty: interviewSession.difficulty,
      status: interviewSession.status,
      totalQuestions: interviewSession.totalQuestions,
      questionsAnswered: interviewSession.questionsAnswered,
      // Recomputed rather than trusted: keeps the report correct even for sessions
      // written before the scoring logic was fixed.
      averageScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
      questions: questions.map((question) => ({
        questionNumber: question.questionNumber,
        question: question.questionText,
        category: question.category,
        difficulty: question.difficulty,
        // Safe to expose now: the interview is over, so the rubric is study material.
        expectedKeyPoints: question.expectedKeyPoints ?? [],
        userAnswer: question.userAnswer ?? null,
        evaluation: question.evaluation ?? null,
        timeSpent: question.timeSpent ?? null,
      })),
    });
  }
);
