// lib/quota.ts
import connectDB from './db';
import User from '@/models/User';

export async function checkQuota(
  userId: string,
  quotaType: 'resumeOptimizations' | 'mockInterviews' | 'groqApiCalls'
): Promise<{ allowed: boolean; remaining: number }> {
  await connectDB();
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const quota = user.quota[quotaType];
  const now = new Date();
  
  // Reset daily quotas
  if (quotaType === 'resumeOptimizations' || quotaType === 'groqApiCalls') {
    const lastReset = new Date(quota.lastResetDate);
    if (now.getDate() !== lastReset.getDate()) {
      quota.usedToday = 0;
      quota.lastResetDate = now;
      await user.save();
    }
    
    const remaining = quota.dailyLimit - quota.usedToday;
    return { allowed: remaining > 0, remaining };
  }
  
  // Reset monthly quotas
  if (quotaType === 'mockInterviews') {
    const lastReset = new Date(quota.lastResetDate);
    if (now.getMonth() !== lastReset.getMonth()) {
      quota.usedThisMonth = 0;
      quota.lastResetDate = now;
      await user.save();
    }
    
    const remaining = quota.monthlyLimit - quota.usedThisMonth;
    return { allowed: remaining > 0, remaining };
  }

  return { allowed: false, remaining: 0 };
}

export async function incrementQuota(
  userId: string,
  quotaType: 'resumeOptimizations' | 'mockInterviews' | 'groqApiCalls'
): Promise<void> {
  await connectDB();
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (quotaType === 'resumeOptimizations' || quotaType === 'groqApiCalls') {
    user.quota[quotaType].usedToday += 1;
  } else if (quotaType === 'mockInterviews') {
    user.quota[quotaType].usedThisMonth += 1;
  }

  await user.save();
}
