// app/dashboard/resume-optimizer/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2, Download } from 'lucide-react';
import FileUpload from '@/components/resume/FileUpload';

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      toast({
        title: 'Missing information',
        description: 'Please upload a resume and paste a job description',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/resume/optimize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysis(data.analysis); // Use data.analysis instead of data

      toast({
        title: 'Analysis complete!',
        description: 'Your resume has been analyzed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resume Optimizer</h1>
        <p className="text-gray-600 mt-2">
          Upload your resume and paste a job description to get AI-powered suggestions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left panel - Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>DOCX format only, max 5MB</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".docx"
                maxSize={5 * 1024 * 1024}
                onFileSelect={setFile}
                selectedFile={file}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Paste the complete job description</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[300px]"
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !file || !jobDescription}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>

        {/* Right panel - Results */}
        <div className="space-y-6">
          {analysis ? (
            <>
              {/* Match Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Match Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(analysis.matchScore || 0)}`}>
                      {analysis.matchScore || 0}%
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Resume-JD Match</p>
                  </div>
                  <Progress value={analysis.matchScore || 0} className="h-2" />
                  
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ATS Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(analysis.atsScore || 0)}`}>
                        {analysis.atsScore || 0}%
                      </span>
                    </div>
                    <Progress value={analysis.atsScore || 0} className="h-2 mt-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Missing Keywords */}
              {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Missing Keywords</CardTitle>
                    <CardDescription>
                      Add these keywords to improve your match
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-red-600">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="mr-2">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength: string, index: number) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="mr-2 text-green-600">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-700">Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness: string, index: number) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="mr-2 text-orange-600">→</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[600px] text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                <p className="text-sm text-gray-600">
                  Upload your resume (DOCX format) and paste a job description to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
