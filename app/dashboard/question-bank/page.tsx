// app/dashboard/question-bank/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import QuestionCard, { type QuestionDTO } from '@/components/questions/QuestionCard';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounced inputs: typing "software engineer" fired one request per keystroke
  // before. These lag the raw input by 350 ms and are what the fetch depends on.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCompany, setDebouncedCompany] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedCompany(company);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, company]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (debouncedCompany) params.set('company', debouncedCompany);
    if (difficulty !== 'all') params.set('difficulty', difficulty);
    params.set('page', String(page));

    try {
      const response = await fetch(`/api/questions?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Could not load questions');

      setQuestions(Array.isArray(payload.questions) ? payload.questions : []);
      setHasMore(Boolean(payload.hasMore));
      setTotal(payload.total ?? 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load questions');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, debouncedCompany, difficulty, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Question bank</h1>
          <p className="mt-2 text-ink-muted">
            Real interview questions shared by the community
            {total > 0 ? ` · ${total} total` : ''}
          </p>
        </div>
        <Link href="/dashboard/question-bank/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add question
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>

          <Input
            placeholder="Filter by company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />

          <Select
            value={difficulty}
            onValueChange={(value) => {
              setDifficulty(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-ink-muted">{error}</p>
            <Button variant="outline" onClick={load}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-ink-muted">No questions match those filters</p>
            <Link href="/dashboard/question-bank/add">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Contribute the first one
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      )}

      {(page > 1 || hasMore) && !isLoading && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-ink-muted">Page {page}</span>
          <Button variant="outline" disabled={!hasMore} onClick={() => setPage((value) => value + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
