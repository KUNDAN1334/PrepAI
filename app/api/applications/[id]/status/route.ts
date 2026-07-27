// app/api/applications/[id]/status/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { status } = await req.json();
    
    await connectDB();
    await import('@/models/Application');
    const Application = mongoose.models.Application;

    const application = await Application.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    application.status = status;
    application.lastUpdated = new Date();
    // statusHistory is automatically updated via pre-save hook

    await application.save();

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
