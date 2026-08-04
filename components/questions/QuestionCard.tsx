// components/questions/QuestionCard.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare, Bookmark, Share2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface QuestionCardProps {
  question: {
    _id: string;
    companyName: string;
    jobRole: string;
    difficulty: string;
    questionText: string;
    tags: string[];
    upvotes: number;
    downvotes: number;
    answerCount: number;
    viewCount: number;
  };
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const difficultyColors = {
    easy: 'status-info',
    medium: 'status-warning',
    hard: 'status-negative',
  };

  return (
    <Card className="transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_var(--ink)]">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{question.companyName}</Badge>
                <Badge variant="outline">{question.jobRole}</Badge>
                <Badge className={difficultyColors[question.difficulty as keyof typeof difficultyColors]}>
                  {question.difficulty}
                </Badge>
              </div>
              <Link href={`/dashboard/question-bank/${question._id}`}>
                <h3 className="font-semibold text-lg hover:underline cursor-pointer">
                  {question.questionText.substring(0, 150)}
                  {question.questionText.length > 150 ? '...' : ''}
                </h3>
              </Link>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="h-4 w-4 mr-1" />
                {question.upvotes}
              </Button>
              <Button variant="ghost" size="sm">
                <ThumbsDown className="h-4 w-4 mr-1" />
                {question.downvotes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                {question.answerCount}
              </Button>
              <div className="flex items-center gap-1 text-sm text-ink-soft">
                <Eye className="h-4 w-4" />
                {question.viewCount}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark
                  className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
