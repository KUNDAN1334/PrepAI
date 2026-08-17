// components/applications/ApplicationForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { APPLICATION_PRIORITIES, APPLICATION_STATUSES } from '@/lib/validation';

export interface ApplicationFormValues {
  companyName: string;
  position: string;
  jobDescription: string;
  applicationDate: string;
  status: string;
  priority: string;
  salary: string;
  location: string;
  jobUrl: string;
  contactPerson: string;
  notes: string;
}

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview_scheduled: 'Interview scheduled',
  interview_completed: 'Interview completed',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const emptyApplication = (): ApplicationFormValues => ({
  companyName: '',
  position: '',
  jobDescription: '',
  applicationDate: new Date().toISOString().split('T')[0],
  status: 'applied',
  priority: 'medium',
  salary: '',
  location: '',
  jobUrl: '',
  contactPerson: '',
  notes: '',
});

/**
 * One form component serves both "new" and "edit". The create and update pages
 * differ only in the initial values and the HTTP verb, so sharing the form keeps
 * the two screens from drifting apart field by field.
 */
export default function ApplicationForm({
  initialValues,
  mode,
  applicationId,
}: {
  initialValues: ApplicationFormValues;
  mode: 'create' | 'edit';
  applicationId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ApplicationFormValues>(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  const setField = <K extends keyof ApplicationFormValues>(
    key: K,
    value: ApplicationFormValues[K]
  ) => setFormData((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.companyName.trim() || !formData.position.trim()) {
      toast({
        title: 'Missing information',
        description: 'Company name and position are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        mode === 'create' ? '/api/applications' : `/api/applications/${applicationId}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        // The API returns field-level details from Zod; surface the first one.
        const detail = payload.details ? Object.values(payload.details)[0] : null;
        throw new Error((detail as string) || payload.error || 'Failed to save application');
      }

      toast({
        title: mode === 'create' ? 'Application added' : 'Application updated',
        description: `${formData.companyName} — ${formData.position}`,
      });

      router.push('/dashboard/applications');
      // Server components on the list page cache their data; refresh forces a refetch.
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
            <CardDescription>Where you applied and for what</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={formData.companyName}
                  onChange={(e) => setField('companyName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  placeholder="e.g., Software Engineer"
                  value={formData.position}
                  onChange={(e) => setField('position', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Bangalore, India"
                  value={formData.location}
                  onChange={(e) => setField('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  placeholder="e.g., 15-20 LPA"
                  value={formData.salary}
                  onChange={(e) => setField('salary', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobUrl">Job URL</Label>
              <Input
                id="jobUrl"
                type="url"
                placeholder="https://..."
                value={formData.jobUrl}
                onChange={(e) => setField('jobUrl', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                value={formData.jobDescription}
                onChange={(e) => setField('jobDescription', e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Where this application stands today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="applicationDate">Application date</Label>
                <Input
                  id="applicationDate"
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) => setField('applicationDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setField('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setField('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority[0].toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact person</Label>
              <Input
                id="contactPerson"
                placeholder="e.g., John Doe (HR Manager)"
                value={formData.contactPerson}
                onChange={(e) => setField('contactPerson', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Anything worth remembering..."
                value={formData.notes}
                onChange={(e) => setField('notes', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/dashboard/applications" className="flex-1">
            <Button type="button" variant="outline" className="w-full" disabled={isSaving}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === 'create' ? (
              'Save application'
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
