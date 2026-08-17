// app/dashboard/applications/[id]/edit/page.tsx
'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ApplicationForm, {
  emptyApplication,
  type ApplicationFormValues,
} from '@/components/applications/ApplicationForm';

/** Normalises an API document into the flat string-only shape the form works with. */
function toFormValues(application: Record<string, unknown>): ApplicationFormValues {
  const text = (value: unknown) => (typeof value === 'string' ? value : '');

  return {
    ...emptyApplication(),
    companyName: text(application.companyName),
    position: text(application.position),
    jobDescription: text(application.jobDescription),
    applicationDate: application.applicationDate
      ? new Date(application.applicationDate as string).toISOString().split('T')[0]
      : emptyApplication().applicationDate,
    status: text(application.status) || 'applied',
    priority: text(application.priority) || 'medium',
    salary: text(application.salary),
    location: text(application.location),
    jobUrl: text(application.jobUrl),
    contactPerson: text(application.contactPerson),
    notes: text(application.notes),
  };
}

export default function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [values, setValues] = useState<ApplicationFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/applications/${id}`);
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Could not load this application');

      setValues(toFormValues(payload));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load this application');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/applications">
          <Button variant="ghost" size="icon" aria-label="Back to applications">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Edit application</h1>
          <p className="text-ink-muted mt-1">Update the details or move it to a new stage</p>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-ink-muted">{error}</p>
            <Link href="/dashboard/applications">
              <Button variant="outline">Back to applications</Button>
            </Link>
          </CardContent>
        </Card>
      ) : !values ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ApplicationForm mode="edit" applicationId={id} initialValues={values} />
      )}
    </div>
  );
}
