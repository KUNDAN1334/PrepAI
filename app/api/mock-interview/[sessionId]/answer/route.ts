// app/api/mock-interview/[sessionId]/answer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import InterviewSession from '@/models/InterviewSession';
import InterviewQuestion from '@/models/InterviewQuestion';
import { evaluateInterviewAnswer } from '@/lib/groq';
import { ApiError, parseBody, requireObjectId, requireUserId, withErrorHandling } from '@/lib/api';
import { answerSubmitSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Grades one answer. The client calls this once per question as the candidate
 * moves through the interview, so an abandoned session still keeps the feedback
 * for everything answered so far.
 */
export const PUT = withErrorHandling(
  'mock-interview:answer',
  async (req: NextRequest, context: { params: Promise<{ sessionId: string }> }) => {
    const userId = await requireUserId();
    const { sessionId } = await context.params;
    requireObjectId(sessionId, 'session id');

    const { questionNumber, answer, timeSpent } = await parseBody(req, answerSubmitSchema);

    await connectDB();

    const interviewSession = await InterviewSession.findOne({ _id: sessionId, userId });

    if (!interviewSession) throw new ApiError(404, 'Session not found');

    const question = await InterviewQuestion.findOne({ sessionId, questionNumber });

    if (!question) throw new ApiError(404, 'Question not found');

    /**
     * The answer is saved even when grading fails. Losing a candidate's 400-word
     * answer because the model hiccuped is worse than showing "not graded" on one
     * card, and the feedback page renders ungraded answers gracefully.
     */
    let evaluation: Awaited<ReturnType<typeof evaluateInterviewAnswer>> | null = null;
    let evaluationError: string | null = null;

    try {
      evaluation = await evaluateInterviewAnswer({
        question: question.questionText,
        answer,
        expectedKeyPoints: question.expectedKeyPoints ?? [],
        category: question.category,
        difficulty: question.difficulty,
      });
    } catch (error) {
      console.error('[mock-interview:answer] evaluation failed:', error);
      evaluationError = 'Your answer was saved, but AI grading is unavailable right now.';
    }

    question.userAnswer = answer;
    if (evaluation) question.evaluation = evaluation;
    question.timeSpent = timeSpent;
    question.answeredAt = new Date();
    await question.save();

    // Recount from the database rather than incrementing a counter: re-submitting
    // an answer to the same question must not inflate progress.
    const answered = await InterviewQuestion.find({
      sessionId,
      userAnswer: { $nin: [null, ''] },
    })
      .select('evaluation.score')
      .lean();

    const scores = answered
      .map((item) => item.evaluation?.score)
      .filter((score): score is number => typeof score === 'number');

    interviewSession.questionsAnswered = answered.length;
    interviewSession.averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined;

    const sessionCompleted = answered.length >= interviewSession.totalQuestions;

    if (sessionCompleted && interviewSession.status !== 'completed') {
      interviewSession.status = 'completed';
      interviewSession.completedAt = new Date();
    }

    await interviewSession.save();

    return NextResponse.json({
      evaluation,
      evaluationError,
      sessionCompleted,
      questionsAnswered: answered.length,
      totalQuestions: interviewSession.totalQuestions,
      averageScore: interviewSession.averageScore,
    });
  }
);
