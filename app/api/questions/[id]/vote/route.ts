// app/api/questions/[id]/vote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import User from '@/models/User';
import { ApiError, parseBody, requireObjectId, requireUserId, withErrorHandling } from '@/lib/api';
import { voteSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * One vote per user per question, toggleable.
 *
 * The vote is stored in a `votes` sub-array AND denormalised into `upvotes` /
 * `downvotes` counters. The array is the source of truth (it is what makes
 * "one vote per user" enforceable); the counters exist so a list of 20 questions
 * can be rendered without loading thousands of vote records.
 */
export const POST = withErrorHandling(
  'question:vote',
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const userId = await requireUserId();
    const { id } = await context.params;
    requireObjectId(id, 'question id');

    const { voteType } = await parseBody(req, voteSchema);

    await connectDB();

    const question = await Question.findById(id);

    if (!question) throw new ApiError(404, 'Question not found');

    if (question.contributorId?.toString() === userId) {
      throw new ApiError(400, 'You cannot vote on your own question');
    }

    const existing = question.votes.find((vote) => vote.userId?.toString() === userId);
    let myVote: 'up' | 'down' | null = voteType;

    if (!existing) {
      question.votes.push({
        userId: new mongoose.Types.ObjectId(userId),
        voteType,
        votedAt: new Date(),
      });
    } else if (existing.voteType === voteType) {
      // Clicking the same arrow twice removes the vote.
      question.votes = question.votes.filter((vote) => vote.userId?.toString() !== userId);
      myVote = null;
    } else {
      existing.voteType = voteType;
      existing.votedAt = new Date();
    }

    // Recomputed from the array so the counters can never drift out of sync.
    question.upvotes = question.votes.filter((vote) => vote.voteType === 'up').length;
    question.downvotes = question.votes.filter((vote) => vote.voteType === 'down').length;
    question.lastUpdated = new Date();

    await question.save();

    // Reputation follows the net score of the contributor's question.
    if (question.contributorId) {
      const delta = myVote === 'up' ? 2 : myVote === 'down' ? -1 : 0;
      if (delta !== 0) {
        await User.updateOne(
          { _id: question.contributorId },
          { $inc: { 'reputation.totalPoints': delta } }
        );
      }
    }

    return NextResponse.json({
      upvotes: question.upvotes,
      downvotes: question.downvotes,
      myVote,
    });
  }
);
