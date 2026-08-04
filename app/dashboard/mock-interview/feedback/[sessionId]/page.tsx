// app/dashboard/mock-interview/feedback/[sessionId]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ sessionId: string }>; // Mark as Promise
}) {
  const { sessionId } = use(params); // Unwrap with React.use()
  const router = useRouter();
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedback = async () => {
    try {
      console.log('Fetching feedback for session:', sessionId);
      
      const response = await fetch(`/api/mock-interview/${sessionId}/feedback`);
      
      console.log('Feedback response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Feedback error:', errorData);
        throw new Error(errorData.error || 'Failed to load feedback');
      }
      
      const data = await response.json();
      console.log('Feedback data:', data);
      
      setFeedback(data);
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      // Don't show error toast, just show empty state
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-ink-muted">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Feedback not available</p>
          <Link href="/dashboard/mock-interview/setup">
            <Button>Start New Interview</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Interview Feedback</h1>
        <Link href="/dashboard">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl font-bold mb-2">
              {feedback.averageScore ? feedback.averageScore.toFixed(1) : 'N/A'}
              <span className="text-2xl text-ink-soft">/10</span>
            </div>
            <p className="text-ink-muted">
              Completed {feedback.questionsAnswered} of {feedback.totalQuestions} questions
            </p>
            <div className="mt-4 max-w-md mx-auto">
              <Progress 
                value={(feedback.questionsAnswered / feedback.totalQuestions) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-ink-muted">Company:</span>
            <span className="font-medium">{feedback.companyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Role:</span>
            <span className="font-medium">{feedback.jobRole}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Type:</span>
            <span className="font-medium">{feedback.interviewType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Difficulty:</span>
            <Badge>{feedback.difficulty}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Status:</span>
            <Badge variant={feedback.status === 'completed' ? 'default' : 'secondary'}>
              {feedback.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Individual Question Feedback */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Question by Question Feedback</h2>
        
        {feedback.questions && feedback.questions.length > 0 ? (
          feedback.questions.map((q: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Question {q.questionNumber}</Badge>
                      <Badge>{q.category}</Badge>
                      <Badge variant="secondary">{q.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-lg">{q.question}</CardTitle>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold">
                      {q.evaluation?.score || 'N/A'}
                      <span className="text-sm text-ink-soft">/10</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {q.evaluation ? (
                  <>
                    {q.evaluation.strengths && q.evaluation.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-azure mb-2">✓ Strengths</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {q.evaluation.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm">{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {q.evaluation.improvements && q.evaluation.improvements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gold-ink mb-2">→ Areas for Improvement</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {q.evaluation.improvements.map((i: string, idx: number) => (
                            <li key={idx} className="text-sm">{i}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {q.evaluation.missedKeyPoints && q.evaluation.missedKeyPoints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-crimson mb-2">✗ Missed Key Points</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {q.evaluation.missedKeyPoints.map((p: string, i: number) => (
                            <li key={i} className="text-sm">{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {q.evaluation.overallFeedback && (
                      <div className="bg-paper p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Overall Feedback</h4>
                        <p className="text-sm">{q.evaluation.overallFeedback}</p>
                      </div>
                    )}

                    {q.evaluation.exampleAnswer && (
                      <div className="status-info rounded-lg border p-4">
                        <h4 className="font-semibold mb-2 text-ink">Example Answer</h4>
                        <p className="text-sm">{q.evaluation.exampleAnswer}</p>
                      </div>
                    )}

                    {q.timeSpent && (
                      <div className="text-xs text-ink-soft">
                        Time spent: {Math.floor(q.timeSpent / 60)}m {q.timeSpent % 60}s
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-ink-soft text-sm">No evaluation available for this question</div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-ink-soft">No question feedback available</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/dashboard/mock-interview/setup" className="flex-1">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start New Interview
          </Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
