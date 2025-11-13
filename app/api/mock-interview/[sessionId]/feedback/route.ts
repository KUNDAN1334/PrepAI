import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await context.params;

    console.log('[Feedback API] Session ID:', sessionId);

    await connectDB();

    await import('@/models/InterviewSession');
    await import('@/models/InterviewQuestion');

    const InterviewSession = mongoose.models.InterviewSession;
    const InterviewQuestion = mongoose.models.InterviewQuestion;

    const interviewSession = await InterviewSession.findOne({
      _id: sessionId,
      userId: session.user.id,
    });

    console.log('[Feedback API] Interview session found:', !!interviewSession);

    if (!interviewSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const questions = await InterviewQuestion.find({
      sessionId: sessionId,
    }).sort({ questionNumber: 1 });

    console.log('[Feedback API] Questions found:', questions.length);

    return NextResponse.json({
      companyName: interviewSession.companyName,
      jobRole: interviewSession.jobRole,
      interviewType: interviewSession.interviewType,
      difficulty: interviewSession.difficulty,
      status: interviewSession.status,
      totalQuestions: interviewSession.totalQuestions,
      questionsAnswered: interviewSession.questionsAnswered,
      averageScore: interviewSession.averageScore,
      questions: questions.map((q: any) => ({
        questionNumber: q.questionNumber,
        question: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
        userAnswer: q.userAnswer,
        evaluation: q.evaluation,
        timeSpent: q.timeSpent,
      })),
    });
  } catch (error: any) {
    console.error('[Feedback API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

