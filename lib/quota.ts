// lib/quota.ts
import connectDB from './db';
import User from '@/models/User';

export type QuotaType = 'resumeOptimizations' | 'mockInterviews' | 'groqApiCalls';

export interface QuotaStatus {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  /** 'day' for daily buckets, 'month' for the monthly mock-interview bucket. */
  period: 'day' | 'month';
}

const DAILY_QUOTAS: QuotaType[] = ['resumeOptimizations', 'groqApiCalls'];

/** Same calendar day, comparing year+month+day (not just day-of-month). */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Same calendar month, comparing year+month (not just month index). */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Reads the quota bucket for a user, rolling it over first if the period has
 * changed. Rollover is lazy (on read) rather than scheduled: there is no cron in
 * a serverless deployment, and a user who never returns never needs a reset.
 */
export async function checkQuota(userId: string, quotaType: QuotaType): Promise<QuotaStatus> {
  await connectDB();
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const bucket = user.quota?.[quotaType];

  if (!bucket) {
    // Documents created before the quota field existed: treat as a fresh bucket.
    return { allowed: true, used: 0, limit: 0, remaining: Number.MAX_SAFE_INTEGER, period: 'day' };
  }

  const lastReset = new Date(bucket.lastResetDate);

  if (DAILY_QUOTAS.includes(quotaType)) {
    const daily = bucket as { dailyLimit: number; usedToday: number; lastResetDate: Date };

    if (!isSameDay(now, lastReset)) {
      daily.usedToday = 0;
      daily.lastResetDate = now;
      await user.save();
    }

    const remaining = Math.max(0, daily.dailyLimit - daily.usedToday);
    return {
      allowed: remaining > 0,
      used: daily.usedToday,
      limit: daily.dailyLimit,
      remaining,
      period: 'day',
    };
  }

  const monthly = bucket as { monthlyLimit: number; usedThisMonth: number; lastResetDate: Date };

  if (!isSameMonth(now, lastReset)) {
    monthly.usedThisMonth = 0;
    monthly.lastResetDate = now;
    await user.save();
  }

  const remaining = Math.max(0, monthly.monthlyLimit - monthly.usedThisMonth);
  return {
    allowed: remaining > 0,
    used: monthly.usedThisMonth,
    limit: monthly.monthlyLimit,
    remaining,
    period: 'month',
  };
}

/**
 * Increments usage with a single atomic `$inc`. Using an update operator instead
 * of read-modify-write means two concurrent requests from the same user cannot
 * both read `usedToday = 4` and both write `5`.
 */
export async function incrementQuota(userId: string, quotaType: QuotaType): Promise<void> {
  await connectDB();

  const field =
    quotaType === 'mockInterviews'
      ? `quota.${quotaType}.usedThisMonth`
      : `quota.${quotaType}.usedToday`;

  await User.updateOne({ _id: userId }, { $inc: { [field]: 1 } });
}

/** Standard 429 body so every quota-limited route answers the same way. */
export function quotaExceededResponse(quotaType: QuotaType, status: QuotaStatus) {
  const window = status.period === 'day' ? 'daily' : 'monthly';
  return {
    error: `You have used all ${status.limit} of your ${window} ${
      quotaType === 'resumeOptimizations'
        ? 'resume analyses'
        : quotaType === 'mockInterviews'
          ? 'mock interviews'
          : 'AI requests'
    }. The quota resets at the start of the next ${status.period}.`,
    quota: status,
  };
}
