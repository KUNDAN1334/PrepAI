// app/api/questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import User from '@/models/User'; // FIXED: Add this import
import { generateQuestionTags } from '@/lib/groq';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');
    const company = searchParams.get('company');
    const role = searchParams.get('role');

    await connectDB();

    const query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (company) {
      query.companyName = new RegExp(company, 'i');
    }

    if (role) {
      query.jobRole = new RegExp(role, 'i');
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('contributorId', 'name image');

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    // Auto-generate tags if none provided
    let tags = body.tags || [];
    if (tags.length === 0) {
      tags = await generateQuestionTags(body.questionText);
    }

    const question = await Question.create({
      contributorId: session.user.id,
      ...body,
      tags,
    });

    // Update user reputation
    await User.findByIdAndUpdate(session.user.id, {
      $inc: {
        'reputation.totalPoints': 5,
        'reputation.questionContributions': 1,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
