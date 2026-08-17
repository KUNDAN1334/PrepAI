// app/dashboard/resume-optimizer/page.tsx
'use client';

import { useState } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/resume/FileUpload';

interface Analysis {
  matchScore: number;
  atsScore: number;
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

const MAX_SIZE = 5 * 1024 * 1024;
const MIN_JD_LENGTH = 50;

export default function ResumeOptimizerPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [quota, setQuota] = useState<{ remaining: number; limit: number } | null>(null);

  const handleAnalyze = async () => {
    if (!file || jobDescription.trim().length < MIN_JD_LENGTH) {
      toast({
        title: 'Missing information',
        description: `Upload a resume and paste at least ${MIN_JD_LENGTH} characters of the job description`,
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      // No Content-Type header: the browser must set the multipart boundary itself.
      const response = await fetch('/api/resume/optimize', { method: 'POST', body: formData });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Failed to analyse resume');

      setAnalysis(payload.analysis);
      setQuota(payload.quota ?? null);

      toast({
        title: 'Analysis complete',
        description: payload.quota
          ? `${payload.quota.remaining} of ${payload.quota.limit} analyses left today`
          : 'Your resume has been analysed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyse resume',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Builds the report in the browser and hands it to the user as a Markdown file.
   * No server round trip is needed — the analysis is already on this page, and a
   * blob download keeps the feature working offline after the analysis returns.
   */
  const downloadReport = () => {
    if (!analysis) return;

    const section = (title: string, items: string[]) =>
      items.length ? `## ${title}\n\n${items.map((item) => `- ${item}`).join('\n')}\n` : '';

    const report = [
      `# Resume analysis — ${file?.name ?? 'resume'}`,
      `Generated ${new Date().toLocaleString()}`,
      '',
      `**Match score:** ${analysis.matchScore}%  `,
      `**ATS score:** ${analysis.atsScore}%`,
      '',
      section('Missing keywords', analysis.missingKeywords),
      section('Suggestions', analysis.suggestions),
      section('Strengths', analysis.strengths),
      section('Areas to improve', analysis.weaknesses),
      '## Job description',
      '',
      jobDescription,
    ].join('\n');

    const url = URL.createObjectURL(new Blob([report], { type: 'text/markdown' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    // Revoking releases the blob; without it the file stays in memory for the tab's life.
    URL.revokeObjectURL(url);
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-azure' : score >= 60 ? 'text-gold-ink' : 'text-crimson';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Resume optimizer</h1>
        <p className="mt-2 text-ink-muted">
          Upload a resume and a job description to get a match score and concrete fixes
          {quota ? ` · ${quota.remaining}/${quota.limit} analyses left today` : ''}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload resume</CardTitle>
              <CardDescription>PDF or DOCX, max 5 MB</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".pdf,.docx"
                maxSize={MAX_SIZE}
                onFileSelect={setFile}
                selectedFile={file}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job description</CardTitle>
              <CardDescription>Paste the full posting for the best match</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                className="min-h-[300px]"
              />
              <p className="text-xs text-ink-soft">{jobDescription.trim().length} characters</p>
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !file || jobDescription.trim().length < MIN_JD_LENGTH}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyse resume
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {analysis ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${scoreColor(analysis.matchScore)}`}>
                      {analysis.matchScore}%
                    </div>
                    <p className="mt-2 text-sm text-ink-muted">Resume ↔ job description match</p>
                  </div>
                  <Progress value={analysis.matchScore} className="h-2" />

                  <div className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ATS readability</span>
                      <span className={`text-2xl font-bold ${scoreColor(analysis.atsScore)}`}>
                        {analysis.atsScore}%
                      </span>
                    </div>
                    <Progress value={analysis.atsScore} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>

              {analysis.missingKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Missing keywords</CardTitle>
                    <CardDescription>Work these in where they are true</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-crimson">
                        {keyword}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}

              {[
                { title: 'Suggestions', items: analysis.suggestions, marker: '•', tone: '' },
                { title: 'Strengths', items: analysis.strengths, marker: '✓', tone: 'text-azure' },
                {
                  title: 'Areas to improve',
                  items: analysis.weaknesses,
                  marker: '→',
                  tone: 'text-gold-ink',
                },
              ]
                .filter((block) => block.items.length > 0)
                .map((block) => (
                  <Card key={block.title}>
                    <CardHeader>
                      <CardTitle className={block.tone}>{block.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {block.items.map((item, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className={`mr-2 ${block.tone}`}>{block.marker}</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}

              <Button variant="outline" className="w-full" onClick={downloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download report (.md)
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="flex h-[600px] flex-col items-center justify-center text-center">
                <FileText className="mb-4 h-16 w-16 text-ink/25" />
                <h3 className="mb-2 text-lg font-semibold">No analysis yet</h3>
                <p className="text-sm text-ink-muted">
                  Upload a PDF or DOCX resume and paste a job description to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
