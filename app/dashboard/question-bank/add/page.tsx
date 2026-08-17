// app/dashboard/question-bank/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { QUESTION_DIFFICULTIES, QUESTION_TYPES } from '@/lib/validation';

const TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  coding: 'Coding',
  hr: 'HR',
  behavioral: 'Behavioral',
  'system-design': 'System design',
};

export default function AddQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    jobRole: '',
    interviewRound: '',
    difficulty: 'medium',
    questionType: 'technical',
    questionText: '',
    contributorAnswer: '',
    tags: '',
    isAnonymous: false,
  });

  const setField = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // Empty tags are intentional: the API asks the model for tags only when
          // the contributor leaves this blank.
          tags: form.tags
            .split(',')
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const detail = payload.details ? Object.values(payload.details)[0] : null;
        throw new Error((detail as string) || payload.error || 'Failed to add question');
      }

      toast({ title: 'Question added', description: '+5 reputation points' });
      router.push('/dashboard/question-bank');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add question',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/question-bank">
          <Button variant="ghost" size="icon" aria-label="Back to question bank">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Add a question</h1>
          <p className="mt-1 text-ink-muted">Share a question you were actually asked</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Question details</CardTitle>
            <CardDescription>Fields marked * are required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={form.companyName}
                  onChange={(event) => setField('companyName', event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobRole">Role *</Label>
                <Input
                  id="jobRole"
                  placeholder="e.g., Software Engineer"
                  value={form.jobRole}
                  onChange={(event) => setField('jobRole', event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="interviewRound">Round *</Label>
                <Input
                  id="interviewRound"
                  placeholder="e.g., Technical 1"
                  value={form.interviewRound}
                  onChange={(event) => setField('interviewRound', event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionType">Type *</Label>
                <Select
                  value={form.questionType}
                  onValueChange={(value) => setField('questionType', value)}
                >
                  <SelectTrigger id="questionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(value) => setField('difficulty', value)}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_DIFFICULTIES.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level[0].toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionText">Question *</Label>
              <Textarea
                id="questionText"
                placeholder="Write the question exactly as it was asked..."
                value={form.questionText}
                onChange={(event) => setField('questionText', event.target.value)}
                className="min-h-[120px]"
                required
                minLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contributorAnswer">Your answer or approach</Label>
              <Textarea
                id="contributorAnswer"
                placeholder="How you answered, or how you would answer now"
                value={form.contributorAnswer}
                onChange={(event) => setField('contributorAnswer', event.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="arrays, dynamic-programming (comma separated)"
                value={form.tags}
                onChange={(event) => setField('tags', event.target.value)}
              />
              <p className="text-xs text-ink-soft">Leave blank and AI will suggest tags for you.</p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isAnonymous"
                checked={form.isAnonymous}
                onCheckedChange={(checked) => setField('isAnonymous', checked === true)}
              />
              <Label htmlFor="isAnonymous" className="font-normal">
                Post anonymously (your name stays hidden)
              </Label>
            </div>

            <div className="flex gap-4 pt-2">
              <Link href="/dashboard/question-bank" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isSaving}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit question'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
