// app/api/questions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import { auth } from '@/lib/auth';
import { ApiError, requireObjectId, requireUserId, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling('question:GET', async (_req: NextRequest, context: Context) => {
  const { id } = await context.params;
  requireObjectId(id, 'question id');

  await connectDB();

  // findOneAndUpdate with $inc counts the view in the same round trip as the read.
  const question = await Question.findOneAndUpdate(
    { _id: id },
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate('contributorId', 'name image')
    .lean();

  if (!question) throw new ApiError(404, 'Question not found');

  const session = await auth();
  const userId = session?.user?.id;

  // The raw votes array is other people's voting history: send back only whether
  // *this* viewer has voted, so the UI can show the active state.
  const myVote = userId
    ? (question.votes?.find((vote) => vote.userId?.toString() === userId)?.voteType ?? null)
    : null;

  return NextResponse.json({
    ...question,
    votes: undefined,
    contributorId: question.isAnonymous ? null : question.contributorId,
    myVote,
  });
});

export const DELETE = withErrorHandling(
  'question:DELETE',
  async (_req: NextRequest, context: Context) => {
    const userId = await requireUserId();
    const { id } = await context.params;
    requireObjectId(id, 'question id');

    await connectDB();

    // Only the contributor can delete their own question.
    const deleted = await Question.findOneAndDelete({ _id: id, contributorId: userId });

    if (!deleted) throw new ApiError(404, 'Question not found');

    return NextResponse.json({ success: true, id });
  }
);
