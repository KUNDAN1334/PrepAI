// components/questions/QuestionCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface QuestionDTO {
  _id: string;
  companyName: string;
  jobRole: string;
  interviewRound?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  contributorAnswer?: string;
  tags?: string[];
  upvotes: number;
  downvotes: number;
  viewCount: number;
  isAnonymous?: boolean;
  contributorId?: { name?: string } | null;
  myVote?: 'up' | 'down' | null;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'status-positive',
  medium: 'status-warning',
  hard: 'status-negative',
};

export default function QuestionCard({
  question,
  showFullText = false,
}: {
  question: QuestionDTO;
  showFullText?: boolean;
}) {
  const { toast } = useToast();
  const [votes, setVotes] = useState({ up: question.upvotes ?? 0, down: question.downvotes ?? 0 });
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(question.myVote ?? null);
  const [isVoting, setIsVoting] = useState(false);

  const vote = async (voteType: 'up' | 'down') => {
    setIsVoting(true);

    try {
      const response = await fetch(`/api/questions/${question._id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 401) throw new Error('Sign in to vote');
        throw new Error(payload.error || 'Could not record your vote');
      }

      // Server-returned counts, not a local guess: the server owns the toggle rule
      // (voting the same way twice removes the vote) so it also owns the totals.
      setVotes({ up: payload.upvotes, down: payload.downvotes });
      setMyVote(payload.myVote);
    } catch (error) {
      toast({
        title: 'Vote failed',
        description: error instanceof Error ? error.message : 'Could not record your vote',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const preview =
    showFullText || question.questionText.length <= 180
      ? question.questionText
      : `${question.questionText.slice(0, 180)}...`;

  return (
    <Card className="transition-shadow hover:shadow-[6px_6px_0_var(--ink)]">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{question.companyName}</Badge>
          <Badge variant="outline">{question.jobRole}</Badge>
          {question.interviewRound && <Badge variant="secondary">{question.interviewRound}</Badge>}
          <Badge className={DIFFICULTY_STYLES[question.difficulty] ?? 'status-neutral'}>
            {question.difficulty}
          </Badge>
        </div>

        {showFullText ? (
          <h3 className="text-lg font-semibold whitespace-pre-wrap">{preview}</h3>
        ) : (
          <Link href={`/dashboard/question-bank/${question._id}`}>
            <h3 className="cursor-pointer text-lg font-semibold hover:underline">{preview}</h3>
          </Link>
        )}

        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {showFullText && question.contributorAnswer && (
          <div className="rounded-lg bg-paper p-4">
            <h4 className="mb-2 text-sm font-semibold">Contributor&apos;s approach</h4>
            <p className="text-sm whitespace-pre-wrap">{question.contributorAnswer}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isVoting}
              onClick={() => vote('up')}
              className={cn(myVote === 'up' && 'text-azure')}
              aria-pressed={myVote === 'up'}
            >
              <ThumbsUp className={cn('mr-1 h-4 w-4', myVote === 'up' && 'fill-current')} />
              {votes.up}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isVoting}
              onClick={() => vote('down')}
              className={cn(myVote === 'down' && 'text-crimson')}
              aria-pressed={myVote === 'down'}
            >
              <ThumbsDown className={cn('mr-1 h-4 w-4', myVote === 'down' && 'fill-current')} />
              {votes.down}
            </Button>
            <span className="flex items-center gap-1 text-sm text-ink-soft">
              <Eye className="h-4 w-4" />
              {question.viewCount ?? 0}
            </span>
          </div>

          <span className="text-xs text-ink-soft">
            {question.isAnonymous
              ? 'Shared anonymously'
              : `Shared by ${question.contributorId?.name ?? 'a member'}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
