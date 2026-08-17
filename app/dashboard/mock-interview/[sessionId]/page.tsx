// app/dashboard/mock-interview/[sessionId]/page.tsx
'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const MIN_ANSWER_LENGTH = 100;

interface Question {
  questionNumber: number;
  question: string;
  category: string;
  difficulty: string;
  answered: boolean;
  userAnswer: string;
}

export default function MockInterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A ref, not state: the timer must not re-render the textarea on every keystroke.
  const questionStartedAt = useRef<number>(Date.now());

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/mock-interview/${sessionId}`);
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Could not load this interview');
      if (!payload.questions?.length) throw new Error('This interview has no questions');

      setQuestions(payload.questions);
      // Restore work already saved on the server so a refresh (or a closed laptop)
      // does not lose answers — the API returns what was previously submitted.
      setAnswers(
        Object.fromEntries(
          payload.questions.map((q: Question) => [q.questionNumber, q.userAnswer ?? ''])
        )
      );
      setSubmitted(
        new Set(
          payload.questions
            .filter((q: Question) => q.answered)
            .map((q: Question) => q.questionNumber)
        )
      );

      // Resume at the first unanswered question.
      const firstUnanswered = payload.questions.findIndex((q: Question) => !q.answered);
      setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load this interview');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    questionStartedAt.current = Date.now();
  }, [index]);

  const current = questions[index];
  const answer = current ? (answers[current.questionNumber] ?? '') : '';
  const answeredCount = submitted.size;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;
  const isLast = index === questions.length - 1;

  const allSubmitted = useMemo(
    () => questions.length > 0 && questions.every((q) => submitted.has(q.questionNumber)),
    [questions, submitted]
  );

  /**
   * Every answer is graded the moment the candidate moves on.
   *
   * The original build kept all answers in React state and only ever POSTed the
   * final one, so questions 1..n-1 were never stored or scored and the session
   * never reached "completed". Submitting per question also means an interrupted
   * interview keeps the feedback for everything answered so far.
   */
  const submitCurrent = useCallback(async (): Promise<boolean> => {
    if (!current) return false;

    const text = (answers[current.questionNumber] ?? '').trim();

    if (text.length < MIN_ANSWER_LENGTH) {
      toast({
        title: 'Answer too short',
        description: `Write at least ${MIN_ANSWER_LENGTH} characters (${text.length} so far).`,
        variant: 'destructive',
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/mock-interview/${sessionId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionNumber: current.questionNumber,
          answer: text,
          timeSpent: Math.floor((Date.now() - questionStartedAt.current) / 1000),
        }),
      });

      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Failed to submit answer');

      setSubmitted((previous) => new Set(previous).add(current.questionNumber));

      if (payload.evaluationError) {
        toast({ title: 'Answer saved', description: payload.evaluationError });
      }

      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit answer',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, current, sessionId, toast]);

  const handleNext = async () => {
    const ok = await submitCurrent();
    if (ok && !isLast) setIndex((value) => value + 1);
  };

  const handleFinish = async () => {
    const ok = await submitCurrent();
    if (!ok) return;

    const unanswered = questions.filter(
      (q) => q.questionNumber !== current?.questionNumber && !submitted.has(q.questionNumber)
    );

    if (unanswered.length > 0) {
      toast({
        title: 'Some questions are unanswered',
        description: `Question ${unanswered[0].questionNumber} still needs an answer.`,
        variant: 'destructive',
      });
      setIndex(questions.findIndex((q) => q.questionNumber === unanswered[0].questionNumber));
      return;
    }

    router.push(`/dashboard/mock-interview/feedback/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-ink-muted">Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (loadError || !current) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-ink-muted">{loadError ?? 'This interview is unavailable.'}</p>
          <Button onClick={() => router.push('/dashboard/mock-interview')}>
            Start a new interview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>
            {answeredCount} answered ({Math.round(progress)}%)
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>{current.category}</Badge>
            <Badge variant="outline">{current.difficulty}</Badge>
            {submitted.has(current.questionNumber) && (
              <Badge className="status-positive">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Submitted
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">{current.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={`Type your answer here... (minimum ${MIN_ANSWER_LENGTH} characters)`}
            value={answer}
            onChange={(event) =>
              setAnswers((previous) => ({
                ...previous,
                [current.questionNumber]: event.target.value,
              }))
            }
            className="min-h-[300px]"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between text-sm text-ink-soft">
            <span>{answer.length} characters</span>
            {answer.trim().length < MIN_ANSWER_LENGTH && (
              <span className="text-crimson">
                {MIN_ANSWER_LENGTH - answer.trim().length} more needed
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0 || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-3">
          {allSubmitted && (
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/mock-interview/feedback/${sessionId}`)}
            >
              View feedback
            </Button>
          )}

          {isLast ? (
            <Button onClick={handleFinish} disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Grading...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit interview
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Grading...
                </>
              ) : (
                <>
                  Submit &amp; next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
