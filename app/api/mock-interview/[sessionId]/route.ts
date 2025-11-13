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

    await connectDB();

    await import('@/models/InterviewSession');
    await import('@/models/InterviewQuestion');

    const InterviewSession = mongoose.models.InterviewSession;
    const InterviewQuestion = mongoose.models.InterviewQuestion;

    const interviewSession = await InterviewSession.findOne({
      _id: sessionId,
      userId: session.user.id,
    });

    if (!interviewSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const questions = await InterviewQuestion.find({
      sessionId: sessionId,
    }).sort({ questionNumber: 1 });

    return NextResponse.json({
      session: interviewSession,
      questions: questions.map((q: any) => ({
        questionNumber: q.questionNumber,
        question: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
      })),
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
