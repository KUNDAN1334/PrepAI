// app/api/mock-interview/[sessionId]/answer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { evaluateInterviewAnswer } from '@/lib/groq';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> } // Mark as Promise
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params first
    const { sessionId } = await params;

    const { questionNumber, answer, timeSpent } = await req.json();

    await connectDB();

    // Import models
    await import('@/models/InterviewSession');
    await import('@/models/InterviewQuestion');

    const InterviewSession = mongoose.models.InterviewSession;
    const InterviewQuestion = mongoose.models.InterviewQuestion;

    // Verify session ownership
    const interviewSession = await InterviewSession.findOne({
      _id: sessionId,
      userId: session.user.id
    });

    if (!interviewSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Find the question
    const question = await InterviewQuestion.findOne({
      sessionId: sessionId,
      questionNumber: questionNumber
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Evaluate answer using Groq AI
    const evaluation = await evaluateInterviewAnswer({
      question: question.questionText,
      answer,
      expectedKeyPoints: question.expectedKeyPoints || [],
      category: question.category,
      difficulty: question.difficulty
    });

    // Update question with answer and evaluation
    question.userAnswer = answer;
    question.evaluation = evaluation;
    question.timeSpent = timeSpent;
    question.answeredAt = new Date();
    await question.save();

    // Update session progress
    const questionsAnswered = await InterviewQuestion.countDocuments({
      sessionId: sessionId,
      userAnswer: { $exists: true, $ne: null }
    });

    interviewSession.questionsAnswered = questionsAnswered;

    // Check if interview is complete
    const sessionCompleted = questionsAnswered >= interviewSession.totalQuestions;
    
    if (sessionCompleted) {
      interviewSession.status = 'completed';
      interviewSession.completedAt = new Date();

      // Calculate average score
      const questions = await InterviewQuestion.find({ sessionId: sessionId });
      const scores = questions
        .map((q: any) => q.evaluation?.score)
        .filter((score: any) => score !== undefined);
      
      if (scores.length > 0) {
        interviewSession.averageScore = 
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      }
    }

    await interviewSession.save();

    return NextResponse.json({
      evaluation,
      sessionCompleted,
      questionsAnswered,
      totalQuestions: interviewSession.totalQuestions
    });
  } catch (error: any) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
