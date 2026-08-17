// app/dashboard/mock-interview/feedback/[sessionId]/page.tsx
'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Home, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  missedKeyPoints: string[];
  overallFeedback: string;
  exampleAnswer: string;
}

interface FeedbackQuestion {
  questionNumber: number;
  question: string;
  category: string;
  difficulty: string;
  expectedKeyPoints: string[];
  userAnswer: string | null;
  evaluation: Evaluation | null;
  timeSpent: number | null;
}

interface Feedback {
  companyName: string;
  jobRole: string;
  interviewType: string;
  difficulty: string;
  status: string;
  totalQuestions: number;
  questionsAnswered: number;
  averageScore: number | null;
  questions: FeedbackQuestion[];
}

function List({ title, items, className }: { title: string; items: string[]; className: string }) {
  if (!items?.length) return null;

  return (
    <div>
      <h4 className={`mb-2 font-semibold ${className}`}>{title}</h4>
      <ul className="list-inside list-disc space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FeedbackPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/mock-interview/${sessionId}/feedback`);
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Could not load feedback');

      setFeedback(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load feedback');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-ink-muted">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-ink-muted">{error ?? 'Feedback is not available for this session.'}</p>
          <Link href="/dashboard/mock-interview">
            <Button>Start a new interview</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completion = feedback.totalQuestions
    ? (feedback.questionsAnswered / feedback.totalQuestions) * 100
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Interview feedback</h1>
        <Link href="/dashboard">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="mb-2 text-6xl font-bold">
              {typeof feedback.averageScore === 'number' ? feedback.averageScore.toFixed(1) : 'N/A'}
              <span className="text-2xl text-ink-soft">/10</span>
            </div>
            <p className="text-ink-muted">
              {feedback.questionsAnswered} of {feedback.totalQuestions} questions answered
            </p>
            <div className="mx-auto mt-4 max-w-md">
              <Progress value={completion} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-ink-muted">Company</span>
            <span className="font-medium">{feedback.companyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Role</span>
            <span className="font-medium">{feedback.jobRole}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Type</span>
            <span className="font-medium">{feedback.interviewType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Difficulty</span>
            <Badge>{feedback.difficulty}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Status</span>
            <Badge className={feedback.status === 'completed' ? 'status-positive' : 'status-warning'}>
              {feedback.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Question by question</h2>

        {feedback.questions.map((question) => (
          <Card key={question.questionNumber}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Q{question.questionNumber}</Badge>
                    <Badge>{question.category}</Badge>
                    <Badge variant="secondary">{question.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-3xl font-bold">
                    {question.evaluation?.score ?? '—'}
                    <span className="text-sm text-ink-soft">/10</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.userAnswer ? (
                <details className="rounded-lg bg-paper p-4">
                  <summary className="cursor-pointer text-sm font-semibold">Your answer</summary>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{question.userAnswer}</p>
                </details>
              ) : (
                <p className="text-sm text-ink-soft">You did not answer this question.</p>
              )}

              {question.evaluation ? (
                <>
                  <List
                    title="✓ Strengths"
                    items={question.evaluation.strengths}
                    className="text-azure"
                  />
                  <List
                    title="→ Areas to improve"
                    items={question.evaluation.improvements}
                    className="text-gold-ink"
                  />
                  <List
                    title="✗ Missed key points"
                    items={question.evaluation.missedKeyPoints}
                    className="text-crimson"
                  />

                  {question.evaluation.overallFeedback && (
                    <div className="rounded-lg bg-paper p-4">
                      <h4 className="mb-2 font-semibold">Overall feedback</h4>
                      <p className="text-sm">{question.evaluation.overallFeedback}</p>
                    </div>
                  )}

                  {question.evaluation.exampleAnswer && (
                    <div className="status-info rounded-lg border p-4">
                      <h4 className="mb-2 font-semibold text-ink">Example answer</h4>
                      <p className="text-sm">{question.evaluation.exampleAnswer}</p>
                    </div>
                  )}

                  {typeof question.timeSpent === 'number' && (
                    <p className="text-xs text-ink-soft">
                      Time spent: {Math.floor(question.timeSpent / 60)}m {question.timeSpent % 60}s
                    </p>
                  )}
                </>
              ) : (
                question.userAnswer && (
                  // Answers saved while grading was unavailable still show the rubric,
                  // so the session is never a dead end.
                  <div className="status-warning rounded-lg border p-4">
                    <h4 className="mb-2 font-semibold text-ink">Not graded</h4>
                    <p className="text-sm">
                      AI grading was unavailable for this answer. Compare it against the expected
                      points below.
                    </p>
                  </div>
                )
              )}

              {question.expectedKeyPoints.length > 0 && (
                <List
                  title="Expected key points"
                  items={question.expectedKeyPoints}
                  className="text-ink"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/mock-interview" className="flex-1">
          <Button variant="outline" className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            New interview
          </Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
