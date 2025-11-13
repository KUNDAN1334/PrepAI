// app/api/resume/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { optimizeResume } from '@/lib/groq';
import { parsePDF, parseDOCX } from '@/lib/pdf-parser';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;

    if (!file || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume file and job description are required' },
        { status: 400 }
      );
    }

    // Check file type
    if (file.type === 'application/pdf') {
      return NextResponse.json(
        { error: 'PDF files are not supported. Please convert your resume to DOCX format and try again.' },
        { status: 400 }
      );
    }

    if (!file.type.includes('wordprocessingml') && !file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only DOCX files are supported' },
        { status: 400 }
      );
    }

    // Parse resume
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let resumeText: string;
    try {
      resumeText = await parseDOCX(buffer);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to parse resume file' },
        { status: 400 }
      );
    }

    // Optimize resume
    const analysis = await optimizeResume(resumeText, jobDescription);

    // Save to database
    await connectDB();

    // Import model
    await import('@/models/Resume');
    const Resume = mongoose.models.Resume;

    const resume = await Resume.create({
      userId: session.user.id,
      originalFileName: file.name,
      originalText: resumeText,
      jobDescription,
      analysis,
    });

    return NextResponse.json({
      resumeId: resume._id,
      analysis,
    });
  } catch (error: any) {
    console.error('Error optimizing resume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to optimize resume' },
      { status: 500 }
    );
  }
}
