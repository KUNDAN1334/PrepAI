// app/api/resume/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import { optimizeResume } from '@/lib/groq';
import { MAX_RESUME_BYTES, parseResume } from '@/lib/resume-parser';
import { ApiError, requireUserId, withErrorHandling } from '@/lib/api';
import { checkQuota, incrementQuota, quotaExceededResponse } from '@/lib/quota';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MIN_JD_LENGTH = 50;

export const POST = withErrorHandling('resume:optimize', async (req: NextRequest) => {
  const userId = await requireUserId();

  // multipart/form-data, not JSON: the resume is a binary upload, so this route
  // reads the body with formData() instead of going through parseBody().
  const formData = await req.formData();
  const file = formData.get('resume');
  const jobDescription = String(formData.get('jobDescription') ?? '').trim();

  if (!(file instanceof File)) {
    throw new ApiError(400, 'Please attach a resume file');
  }

  if (jobDescription.length < MIN_JD_LENGTH) {
    throw new ApiError(400, `Please paste a job description (at least ${MIN_JD_LENGTH} characters)`);
  }

  if (file.size === 0) throw new ApiError(400, 'The uploaded file is empty');

  // Size is re-checked server-side; the client limit is a convenience, not a control.
  if (file.size > MAX_RESUME_BYTES) {
    throw new ApiError(413, 'Resume is larger than 5 MB');
  }

  await connectDB();

  // Quota is checked before the expensive work (parse + LLM call), not after.
  const quota = await checkQuota(userId, 'resumeOptimizations');

  if (!quota.allowed) {
    return NextResponse.json(quotaExceededResponse('resumeOptimizations', quota), { status: 429 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let resumeText: string;
  try {
    ({ text: resumeText } = await parseResume(buffer, file.name, file.type));
  } catch (error) {
    // Parse failures are the user's file, not a server fault -> 400, not 500.
    throw new ApiError(400, error instanceof Error ? error.message : 'Could not read that file');
  }

  const analysis = await optimizeResume(resumeText, jobDescription);

  const resume = await Resume.create({
    userId,
    originalFileName: file.name,
    originalText: resumeText,
    jobDescription,
    analysis,
  });

  await incrementQuota(userId, 'resumeOptimizations');

  return NextResponse.json({
    resumeId: resume._id.toString(),
    fileName: file.name,
    analysis,
    quota: { remaining: Math.max(0, quota.remaining - 1), limit: quota.limit },
  });
});
