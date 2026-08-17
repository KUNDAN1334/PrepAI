// app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import { parseBody, requireUserId, withErrorHandling } from '@/lib/api';
import { applicationCreateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling('applications:GET', async () => {
  const userId = await requireUserId();
  await connectDB();

  // `.lean()` returns plain objects instead of hydrated Mongoose documents:
  // this is a read-only list, so skipping document hydration is measurably cheaper.
  const applications = await Application.find({ userId }).sort({ applicationDate: -1 }).lean();

  return NextResponse.json(applications);
});

export const POST = withErrorHandling('applications:POST', async (req: NextRequest) => {
  const userId = await requireUserId();
  const data = await parseBody(req, applicationCreateSchema);

  await connectDB();

  // userId comes from the session and is written last, so a client cannot smuggle
  // `userId` in the body and create rows owned by another account.
  const application = await Application.create({
    ...data,
    applicationDate: data.applicationDate ?? new Date(),
    source: data.source ?? 'Manual',
    userId,
    statusHistory: [{ status: data.status, changedAt: new Date() }],
  });

  return NextResponse.json(application, { status: 201 });
});
