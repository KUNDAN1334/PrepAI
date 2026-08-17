// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { ApiError, parseBody, requireUserId, withErrorHandling } from '@/lib/api';
import { profileUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling('user:profile:GET', async () => {
  const userId = await requireUserId();
  await connectDB();

  // Explicit projection: the password hash must never leave the database layer,
  // even by accident when new fields are added to the schema later.
  const user = await User.findById(userId).select('-password').lean();

  if (!user) throw new ApiError(404, 'User not found');

  return NextResponse.json(user);
});

export const PUT = withErrorHandling('user:profile:PUT', async (req: NextRequest) => {
  const userId = await requireUserId();
  const updates = await parseBody(req, profileUpdateSchema);

  await connectDB();

  // $set with a validated, whitelisted object: `email`, `password`, `quota` and
  // `reputation` are not in the schema, so they cannot be written from the client.
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .select('-password')
    .lean();

  if (!user) throw new ApiError(404, 'User not found');

  return NextResponse.json(user);
});
