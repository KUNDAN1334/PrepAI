'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function QuestionBankAddPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: '',
    jobRole: '',
    difficulty: 'medium',
    interviewRound: '',
    questionType: '',
    questionText: '',
    contributorAnswer: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/dashboard/question-bank');
    } else {
      setError('Failed to add question. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-black mb-6">Add Interview Question</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white border border-gray-200 rounded-lg p-8 shadow-lg"
      >
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Company</label>
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="e.g., Google"
            className="w-full p-2 rounded bg-gray-100 text-black border border-gray-300 outline-none"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Role / Position</label>
          <input
            name="jobRole"
            value={form.jobRole}
            onChange={handleChange}
            placeholder="e.g., Software Engineer"
            className="w-full p-2 rounded bg-gray-100 text-black border border-gray-300 outline-none"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Difficulty</label>
          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-100 text-black border border-gray-300 outline-none"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Interview Round</label>
          <input
            name="interviewRound"
            value={form.interviewRound}
            onChange={handleChange}
            placeholder="e.g., Technical Round 1"
            className="w-full p-2 rounded bg-gray-100 text-black border border-gray-300 outline-none"
          />
        </div>
        {/* Question Type field */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Question Type</label>
          <select
            name="questionType"
            value={form.questionType}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-100 text-black border border-gray-300 outline-none"
            required
          >
            <option value="">Select Type</option>
            <option value="technical">Technical</option>
            <option value="coding">Coding</option>
            <option value="hr">HR</option>
            <option value="behavioral">Behavioral</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Question</label>
          <textarea
            name="questionText"
            value={form.questionText}
            onChange={handleChange}
            rows={4}
            placeholder="Enter the exact interview question..."
            className="w-full p-2 rounded bg-gray-100 text-black border border-gray-300 outline-none resize-vertical"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">
            Your Answer / Approach <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            name="contributorAnswer"
            value={form.contributorAnswer}
            onChange={handleChange}
            rows={3}
            placeholder="How did you answer, or your suggested approach"
            className="w-full p-2 rounded bg-gray-100 text-black border border-gray-300 outline-none resize-vertical"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting...' : 'Submit Question'}
        </Button>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </form>
    </div>
  );
}
