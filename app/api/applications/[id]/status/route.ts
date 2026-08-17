// app/api/applications/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import { ApiError, parseBody, requireObjectId, requireUserId, withErrorHandling } from '@/lib/api';
import { applicationStatusSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * Dedicated endpoint for the Kanban board's drag-and-drop: a status change is a
 * single-field, high-frequency write, so it gets its own PATCH rather than
 * round-tripping the whole application through PUT.
 */
export const PATCH = withErrorHandling(
  'application:status',
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await context.params;
    requireObjectId(id, 'application id');

    const { status } = await parseBody(req, applicationStatusSchema);

    await connectDB();

    const application = await Application.findOne({ _id: id, userId });

    if (!application) throw new ApiError(404, 'Application not found');

    if (application.status === status) {
      // No-op: avoid writing a duplicate statusHistory entry when a card is
      // dropped back into the column it came from.
      return NextResponse.json(application);
    }

    application.status = status;
    application.lastUpdated = new Date();
    // statusHistory is appended by the pre('save') hook on the schema.
    await application.save();

    return NextResponse.json(application);
  }
);
