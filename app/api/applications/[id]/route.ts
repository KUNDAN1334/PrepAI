// app/api/applications/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Application from '@/models/Application';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const applications = await Application.find({
      userId: session.user.id,
    });

    const stats = {
      total: applications.length,
      byStatus: {
        applied: applications.filter(a => a.status === 'applied').length,
        screening: applications.filter(a => a.status === 'screening').length,
        interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
        interview_completed: applications.filter(a => a.status === 'interview_completed').length,
        offer: applications.filter(a => a.status === 'offer').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        withdrawn: applications.filter(a => a.status === 'withdrawn').length,
      },
      byPriority: {
        high: applications.filter(a => a.priority === 'high').length,
        medium: applications.filter(a => a.priority === 'medium').length,
        low: applications.filter(a => a.priority === 'low').length,
      },
      recentApplications: applications
        .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
        .slice(0, 5)
        .map(a => ({
          id: a._id,
          companyName: a.companyName,
          position: a.position,
          status: a.status,
          applicationDate: a.applicationDate,
        })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

