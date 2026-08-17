// app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import { ApiError, parseBody, requireObjectId, requireUserId, withErrorHandling } from '@/lib/api';
import { applicationUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  'application:GET',
  async (_req: NextRequest, context: Context) => {
    const userId = await requireUserId();
    const { id } = await context.params;
    requireObjectId(id, 'application id');

    await connectDB();

    // The userId is part of the query, not checked afterwards: an application
    // belonging to someone else is simply "not found" and leaks nothing.
    const application = await Application.findOne({ _id: id, userId }).lean();

    if (!application) throw new ApiError(404, 'Application not found');

    return NextResponse.json(application);
  }
);

export const PUT = withErrorHandling('application:PUT', async (req: NextRequest, context: Context) => {
  const userId = await requireUserId();
  const { id } = await context.params;
  requireObjectId(id, 'application id');

  const updates = await parseBody(req, applicationUpdateSchema);

  await connectDB();

  const application = await Application.findOne({ _id: id, userId });

  if (!application) throw new ApiError(404, 'Application not found');

  application.set({ ...updates, lastUpdated: new Date() });

  // save() (not findOneAndUpdate) so the pre-save hook that appends to
  // statusHistory still runs when the status is part of the edit.
  await application.save();

  return NextResponse.json(application);
});

export const DELETE = withErrorHandling(
  'application:DELETE',
  async (_req: NextRequest, context: Context) => {
    const userId = await requireUserId();
    const { id } = await context.params;
    requireObjectId(id, 'application id');

    await connectDB();

    const deleted = await Application.findOneAndDelete({ _id: id, userId });

    if (!deleted) throw new ApiError(404, 'Application not found');

    return NextResponse.json({ success: true, id });
  }
);
