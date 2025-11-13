// app/dashboard/mock-interview/[sessionId]/page.tsx
'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';

interface Question {
  questionNumber: number;
  question: string;
  category: string;
  difficulty: string;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());

  // Wrap fetchSession in useCallback
  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/mock-interview/${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load interview session');
      }
      
      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions found for this session');
      }
      
      setQuestions(data.questions);
    } catch (error: any) {
      console.error('Error fetching session:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load interview session',
        variant: 'destructive',
      });
      
      setTimeout(() => {
        router.push('/dashboard/mock-interview/setup');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast, router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No questions available for this session</p>
          <Button onClick={() => router.push('/dashboard/mock-interview/setup')}>
            Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    if (!answer.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an answer',
        variant: 'destructive',
      });
      return;
    }

    if (answer.trim().length < 100) {
      toast({
        title: 'Answer too short',
        description: 'Please provide at least 100 characters',
        variant: 'destructive',
      });
      return;
    }

    // Save current answer
    setAnswers({ ...answers, [currentQuestionIndex]: answer });
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer(answers[currentQuestionIndex + 1] || '');
      setStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer before going back
      if (answer.trim()) {
        setAnswers({ ...answers, [currentQuestionIndex]: answer });
      }
      
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswer(answers[currentQuestionIndex - 1] || '');
    }
  };

  const handleSubmitFinal = async () => {
    if (!answer.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an answer',
        variant: 'destructive',
      });
      return;
    }

    if (answer.trim().length < 100) {
      toast({
        title: 'Answer too short',
        description: 'Please provide at least 100 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      console.log('Submitting final answer...');
      console.log('Question number:', currentQuestion.questionNumber);
      console.log('Session ID:', sessionId);
      
      const response = await fetch(
        `/api/mock-interview/${sessionId}/answer`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionNumber: currentQuestion.questionNumber,
            answer: answer.trim(),
            timeSpent,
          }),
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      const data = await response.json();
      console.log('Response data:', data);

      toast({
        title: 'Interview completed!',
        description: 'Redirecting to feedback page...',
      });

      // Redirect to feedback page
      console.log('Redirecting to feedback...');
      
      // Use window.location instead of router.push for more reliable redirect
      window.location.href = `/dashboard/mock-interview/feedback/${sessionId}`;
      
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit answer',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
    // Don't set isSubmitting to false here - we're redirecting
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge>{currentQuestion?.category || 'Question'}</Badge>
            <Badge variant="outline">{currentQuestion?.difficulty || 'Medium'}</Badge>
          </div>
          <CardTitle className="text-xl">{currentQuestion?.question || 'Question not available'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your answer here... (minimum 100 characters)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[300px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{answer.length} characters</span>
            {answer.length < 100 && (
              <span className="text-red-600">
                {100 - answer.length} more characters needed
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button 
            onClick={handleSubmitFinal} 
            disabled={isSubmitting || !answer.trim() || answer.length < 100}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Interview...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Interview
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={!answer.trim() || answer.length < 100}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 p-4 bg-gray-50 rounded">
          <div>Current Index: {currentQuestionIndex}</div>
          <div>Total Questions: {questions.length}</div>
          <div>Is Last: {isLastQuestion.toString()}</div>
          <div>Session ID: {sessionId}</div>
          <div>Submitting: {isSubmitting.toString()}</div>
        </div>
      )}
    </div>
  );
}
