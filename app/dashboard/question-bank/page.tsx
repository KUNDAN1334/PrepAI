// app/dashboard/question-bank/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, TrendingUp, Filter } from 'lucide-react';
import Link from 'next/link';
import QuestionCard from '@/components/questions/QuestionCard';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    company: '',
    role: '',
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters, searchQuery]);

  const fetchQuestions = async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.company) params.append('company', filters.company);
    if (filters.role) params.append('role', filters.role);

    const response = await fetch(`/api/questions?${params.toString()}`);
    const data = await response.json();
    setQuestions(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interview Question Bank</h1>
          <p className="text-gray-600 mt-2">
            Community-driven interview questions and answers
          </p>
        </div>
        <Link href="/dashboard/question-bank/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search questions, companies, roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filters.difficulty}
              onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600">No questions found</p>
              <Link href="/dashboard/question-bank/add">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Question
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          questions.map((question: any) => (
            <QuestionCard key={question._id} question={question} />
          ))
        )}
      </div>
    </div>
  );
}
