// app/dashboard/applications/new/page.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationForm, { emptyApplication } from '@/components/applications/ApplicationForm';

export default function NewApplicationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/applications">
          <Button variant="ghost" size="icon" aria-label="Back to applications">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Add application</h1>
          <p className="text-ink-muted mt-1">Track a new job application</p>
        </div>
      </div>

      <ApplicationForm mode="create" initialValues={emptyApplication()} />
    </div>
  );
}
