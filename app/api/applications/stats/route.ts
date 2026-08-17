// app/api/applications/stats/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import { requireUserId, withErrorHandling } from '@/lib/api';
import { APPLICATION_STATUSES, APPLICATION_PRIORITIES } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export interface ApplicationStats {
  total: number;
  /** Everything still live: applied → interview_completed. Drives the "In Progress" tile. */
  pending: number;
  offers: number;
  rejected: number;
  byStatus: Record<(typeof APPLICATION_STATUSES)[number], number>;
  byPriority: Record<(typeof APPLICATION_PRIORITIES)[number], number>;
  recentApplications: Array<{
    id: string;
    companyName: string;
    position: string;
    status: string;
    applicationDate: string;
  }>;
}

const IN_PROGRESS: string[] = [
  'applied',
  'screening',
  'interview_scheduled',
  'interview_completed',
];

export const GET = withErrorHandling('applications:stats', async () => {
  const userId = await requireUserId();
  await connectDB();

  const ownerId = new mongoose.Types.ObjectId(userId);

  /**
   * One round trip with $facet instead of loading every application into Node and
   * counting with Array.filter. The counting happens on the database, the payload
   * stays small, and it does not degrade as a user's history grows.
   */
  const [result] = await Application.aggregate([
    { $match: { userId: ownerId } },
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        total: [{ $count: 'value' }],
        recent: [
          { $sort: { applicationDate: -1 } },
          { $limit: 5 },
          { $project: { companyName: 1, position: 1, status: 1, applicationDate: 1 } },
        ],
      },
    },
  ]);

  const toMap = (rows: Array<{ _id: string; count: number }>, keys: readonly string[]) => {
    const map = Object.fromEntries(keys.map((key) => [key, 0])) as Record<string, number>;
    for (const row of rows ?? []) {
      if (row._id in map) map[row._id] = row.count;
    }
    return map;
  };

  const byStatus = toMap(result?.byStatus ?? [], APPLICATION_STATUSES);
  const byPriority = toMap(result?.byPriority ?? [], APPLICATION_PRIORITIES);

  const stats: ApplicationStats = {
    total: result?.total?.[0]?.value ?? 0,
    pending: IN_PROGRESS.reduce((sum, status) => sum + byStatus[status], 0),
    offers: byStatus.offer,
    rejected: byStatus.rejected,
    byStatus: byStatus as ApplicationStats['byStatus'],
    byPriority: byPriority as ApplicationStats['byPriority'],
    recentApplications: (result?.recent ?? []).map(
      (app: {
        _id: mongoose.Types.ObjectId;
        companyName: string;
        position: string;
        status: string;
        applicationDate: Date;
      }) => ({
        id: app._id.toString(),
        companyName: app.companyName,
        position: app.position,
        status: app.status,
        applicationDate: app.applicationDate?.toISOString?.() ?? '',
      })
    ),
  };

  return NextResponse.json(stats);
});
