// app/dashboard/company-research/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

export default function CompanyResearchPage() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [research, setResearch] = useState<any>(null);

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

      if (!response.ok) {
        throw new Error('Failed to fetch research');
      }

      const result = await response.json();
      setResearch(result);

      toast({
        title: 'Research Complete!',
        description: `Analyzed ${result.ai_insights?.sources_analyzed?.total || 0} sources`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          AI Company Research
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
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
            <p className="text-xs text-gray-500">
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
              <span>Analyzed {research.ai_insights?.sources_analyzed?.total || 0} sources:</span>
              {research.ai_insights?.sources_analyzed && (
                <>
                  {research.ai_insights.sources_analyzed.gfg_articles > 0 && (
                    <Badge variant="outline">
                      {research.ai_insights.sources_analyzed.gfg_articles} GFG articles
                    </Badge>
                  )}
                  {research.ai_insights.sources_analyzed.leetcode_topics > 0 && (
                    <Badge variant="outline">
                      {research.ai_insights.sources_analyzed.leetcode_topics} LeetCode topics
                    </Badge>
                  )}
                  {research.ai_insights.sources_analyzed.medium_articles > 0 && (
                    <Badge variant="outline">
                      {research.ai_insights.sources_analyzed.medium_articles} Medium articles
                    </Badge>
                  )}
                  {research.ai_insights.sources_analyzed.reddit_posts > 0 && (
                    <Badge variant="outline">
                      {research.ai_insights.sources_analyzed.reddit_posts} Reddit posts
                    </Badge>
                  )}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {research.ai_insights?.error ? (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg text-red-800 dark:text-red-200">
                <p className="font-semibold">Error:</p>
                <p>{research.ai_insights.error}</p>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h2: ({node, ...props}) => (
                      <h2 className="mt-6 mb-3 text-xl font-bold border-b pb-2 text-gray-900 dark:text-gray-100" {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 className="mt-4 mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100" {...props} />
                    ),
                    ul: ({node, ...props}) => (
                      <ul className="list-disc pl-6 space-y-1" {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol className="list-decimal pl-6 space-y-1" {...props} />
                    ),
                    p: ({node, ...props}) => (
                      <p className="mb-3 leading-relaxed" {...props} />
                    ),
                    strong: ({node, ...props}) => (
                      <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />
                    ),
                    a: ({node, ...props}) => (
                      <a className="font-bold text-gray-900 dark:text-gray-100 underline" {...props} />
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
