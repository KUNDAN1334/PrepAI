// app/api/mock-interview/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateMockInterviewQuestions } from '@/lib/groq';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

// Import models directly
import InterviewSession from '@/models/InterviewSession';
import InterviewQuestion from '@/models/InterviewQuestion';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      jobRole,
      experienceLevel,
      interviewType,
      difficulty,
      numQuestions,
      jobDescription,
    } = body;

    if (!companyName || !jobRole || !experienceLevel || !interviewType || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate questions using Groq
    const questions = await generateMockInterviewQuestions({
      companyName,
      jobRole,
      experienceLevel,
      interviewType,
      difficulty,
      numQuestions: numQuestions || 10,
      jobDescription,
    });

    // Create interview session
    const interviewSession = new InterviewSession({
      userId: session.user.id,
      companyName,
      jobRole,
      experienceLevel,
      interviewType,
      difficulty,
      jobDescription,
      status: 'in-progress',
      totalQuestions: questions.length,
      questionsAnswered: 0,
    });
    
    await interviewSession.save();

    // Create questions using the model directly
    const savedQuestions = [];
    
    for (const q of questions) {
      const questionDoc = new InterviewQuestion({
        sessionId: interviewSession._id,
        questionNumber: q.questionNumber,
        questionText: q.question,
        category: q.category,
        difficulty: q.difficulty,
        expectedKeyPoints: q.expectedKeyPoints || [],
      });
      
      await questionDoc.save();
      savedQuestions.push(questionDoc);
    }

    return NextResponse.json({
      sessionId: interviewSession._id,
      totalQuestions: savedQuestions.length,
      message: 'Mock interview created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating mock interview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create mock interview' },
      { status: 500 }
    );
  }
}
