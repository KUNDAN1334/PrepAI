// app/dashboard/question-bank/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';

export default function AddQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    interviewRound: '',
    difficulty: '',
    questionType: '',
    questionText: '',
    contributorAnswer: '',
    additionalContext: '',
    isAnonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.questionText.length < 50) {
      toast({
        title: 'Question too short',
        description: 'Question must be at least 50 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags }),
      });

      if (!response.ok) throw new Error('Failed to add question');

      toast({
        title: 'Success!',
        description: 'Question added successfully',
      });

      router.push('/dashboard/question-bank');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Interview Question</h1>
        <p className="text-gray-600 mt-2">
          Share your interview experience with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>Basic information about the question</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole">Job Role *</Label>
                <Input
                  id="jobRole"
                  placeholder="e.g., Software Engineer"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interviewRound">Interview Round *</Label>
                <Select
                  value={formData.interviewRound}
                  onValueChange={(value) => setFormData({ ...formData, interviewRound: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phone Screening">Phone Screening</SelectItem>
                    <SelectItem value="Online Assessment">Online Assessment</SelectItem>
                    <SelectItem value="Technical Round 1">Technical Round 1</SelectItem>
                    <SelectItem value="Technical Round 2">Technical Round 2</SelectItem>
                    <SelectItem value="Technical Round 3">Technical Round 3</SelectItem>
                    <SelectItem value="System Design">System Design</SelectItem>
                    <SelectItem value="Behavioral">Behavioral</SelectItem>
                    <SelectItem value="HR Round">HR Round</SelectItem>
                    <SelectItem value="Final Round">Final Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type *</Label>
                <Select
                  value={formData.questionType}
                  onValueChange={(value) => setFormData({ ...formData, questionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coding Problem">Coding Problem</SelectItem>
                    <SelectItem value="System Design">System Design</SelectItem>
                    <SelectItem value="Behavioral">Behavioral</SelectItem>
                    <SelectItem value="Puzzle">Puzzle</SelectItem>
                    <SelectItem value="Domain-Specific">Domain-Specific</SelectItem>
                    <SelectItem value="Aptitude">Aptitude</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level *</Label>
              <RadioGroup
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy" className="font-normal cursor-pointer">
                    Easy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal cursor-pointer">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard" className="font-normal cursor-pointer">
                    Hard
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                placeholder="Describe the question in detail... (minimum 50 characters)"
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                rows={6}
                required
              />
              <p className="text-xs text-gray-500">
                {formData.questionText.length}/50 characters minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contributorAnswer">Your Answer/Approach (Optional)</Label>
              <Textarea
                id="contributorAnswer"
                placeholder="How did you answer this question? Share your approach..."
                value={formData.contributorAnswer}
                onChange={(e) => setFormData({ ...formData, contributorAnswer: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Max 5)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="e.g., arrays, dynamic-programming"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} disabled={tags.length >= 5}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
              <Textarea
                id="additionalContext"
                placeholder="Any special circumstances, hints, or follow-up questions..."
                value={formData.additionalContext}
                onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAnonymous: checked as boolean })
                }
              />
              <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                Post anonymously (your name won't be shown)
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Question'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
