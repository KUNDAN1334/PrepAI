// app/dashboard/company-research/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

/** Keys returned by the Python research service, in display order. */
const SOURCE_LABELS: Array<[string, string]> = [
  ['gfg_articles', 'GFG articles'],
  ['leetcode_topics', 'LeetCode topics'],
  ['medium_articles', 'Medium articles'],
  ['reddit_posts', 'Reddit posts'],
];

export default function CompanyResearchPage() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  interface ResearchResult {
    company?: string;
    cached?: boolean;
    degraded?: boolean;
    ai_insights?: {
      summary?: string;
      error?: string;
      sources_analyzed?: Record<string, number | undefined>;
    };
  }

  const [research, setResearch] = useState<ResearchResult | null>(null);

  const handleResearch = async () => {
    if (!companyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a company name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResearch(null);

    try {
      const response = await fetch(
        `/api/research/company?company=${encodeURIComponent(companyName)}&query=${encodeURIComponent(userQuery)}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch research');
      }

      setResearch(result);

      toast({
        title: result.cached ? 'Loaded from cache' : 'Research complete',
        description: result.degraded
          ? 'The research service is offline — showing direct sources instead.'
          : `Analysed ${result.ai_insights?.sources_analyzed?.total || 0} sources`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-4xl font-normal tracking-[-0.01em] flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-azure" />
          AI Company Research
        </h1>
        <p className="text-ink-muted mt-2">
          Get AI-powered insights about company interviews and culture
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Research Company</CardTitle>
          <CardDescription>
            Enter a company name and optionally ask a specific question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name *</label>
            <Input
              placeholder="e.g., Google, Amazon, Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Question (Optional)</label>
            <Textarea
              placeholder="e.g., What is the interview process like? What skills should I focus on? What is the company culture?"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
            <p className="text-xs text-ink-soft">
              Leave empty for a comprehensive interview preparation guide
            </p>
          </div>

          <Button
            onClick={handleResearch}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Researching... This may take 30-60 seconds
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Start AI Research
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {research && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              AI Insights for {research.company}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <span>
                Analysed {research.ai_insights?.sources_analyzed?.total ?? 0} sources
                {research.cached ? ' (cached)' : ''}:
              </span>
              {SOURCE_LABELS.map(([key, label]) => {
                const count = research.ai_insights?.sources_analyzed?.[key] ?? 0;
                return count > 0 ? (
                  <Badge key={key} variant="outline">
                    {count} {label}
                  </Badge>
                ) : null;
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {research.ai_insights?.error ? (
              <div className="status-negative rounded-lg border p-4">
                <p className="font-semibold">Error:</p>
                <p>{research.ai_insights.error}</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h2: ({ ...props }) => (
                      <h2 className="mt-6 mb-3 text-xl font-bold border-b pb-2 text-ink" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="mt-4 mb-2 text-lg font-semibold text-ink" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-6 space-y-1" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal pl-6 space-y-1" {...props} />
                    ),
                    p: ({ ...props }) => (
                      <p className="mb-3 leading-relaxed" {...props} />
                    ),
                    strong: ({ ...props }) => (
                      <strong className="font-bold text-ink" {...props} />
                    ),
                    a: ({ ...props }) => (
                      <a className="font-bold text-ink underline" {...props} />
                    ),
                  }}
                >
                  {research.ai_insights?.summary || 'No insights available'}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
