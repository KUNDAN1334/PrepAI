// app/dashboard/question-bank/[id]/page.tsx
'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QuestionCard, { type QuestionDTO } from '@/components/questions/QuestionCard';

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [question, setQuestion] = useState<QuestionDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      // GET also increments viewCount server-side, so a view is counted exactly
      // where the question is actually read.
      const response = await fetch(`/api/questions/${id}`);
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Question not found');

      setQuestion(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Question not found');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/question-bank">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to question bank
        </Button>
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error || !question ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-ink-muted">{error ?? 'Question not found'}</p>
            <Link href="/dashboard/question-bank">
              <Button variant="outline">Browse all questions</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <QuestionCard question={question} showFullText />
      )}
    </div>
  );
}
