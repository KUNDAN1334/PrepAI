// app/dashboard/applications/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NewApplicationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    jobDescription: '',
    jobDescriptionUrl: '', 
    applicationDate: new Date(),
    status: 'applied',
    priority: 'medium',
    salary: '',
    location: '',
    jobUrl: '',
    contactPerson: '',
    notes: '',
    source: 'Manual',
    referralName: '', 
    salaryRange: {     
      min: '',
      max: '',
      currency: 'INR',
    },
  });
  

  const [interviewRounds, setInterviewRounds] = useState<Array<{
    roundName: string;
    date: Date | undefined;
    interviewerName: string;
    status: string;
    notes: string;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        salaryRange: {
          ...formData.salaryRange,
          min: formData.salaryRange.min ? Number(formData.salaryRange.min) : undefined,
          max: formData.salaryRange.max ? Number(formData.salaryRange.max) : undefined,
        },
        interviewRounds: interviewRounds.filter(round => round.roundName && round.date),
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      toast({
        title: 'Success!',
        description: 'Application added successfully',
      });

      router.push('/dashboard/applications');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addInterviewRound = () => {
    setInterviewRounds([
      ...interviewRounds,
      {
        roundName: '',
        date: undefined,
        interviewerName: '',
        status: 'scheduled',
        notes: '',
      },
    ]);
  };

  const removeInterviewRound = (index: number) => {
    setInterviewRounds(interviewRounds.filter((_, i) => i !== index));
  };

  const updateInterviewRound = (index: number, field: string, value: any) => {
    const updated = [...interviewRounds];
    updated[index] = { ...updated[index], [field]: value };
    setInterviewRounds(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Application</h1>
        <p className="text-ink-muted mt-2">
          Track a new job application
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Company and position details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position/Role *</Label>
                <Input
                  id="position"
                  placeholder="e.g., Software Engineer"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescriptionUrl">Job Description URL</Label>
              <Input
                id="jobDescriptionUrl"
                type="url"
                placeholder="https://..."
                value={formData.jobDescriptionUrl}
                onChange={(e) => setFormData({ ...formData, jobDescriptionUrl: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="interview_completed">Interview Completed</SelectItem>
                    <SelectItem value="offer">Offer Received</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority *</Label>
                <RadioGroup
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="font-normal cursor-pointer">High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="font-normal cursor-pointer">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="font-normal cursor-pointer">Low</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Application Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.applicationDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.applicationDate ? (
                        format(formData.applicationDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.applicationDate}
                      onSelect={(date) => date && setFormData({ ...formData, applicationDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source">Source *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Company Website">Company Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Indeed">Indeed</SelectItem>
                    <SelectItem value="Naukri">Naukri</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.source === 'Referral' && (
                <div className="space-y-2">
                  <Label htmlFor="referralName">Referral Name</Label>
                  <Input
                    id="referralName"
                    placeholder="Name of person who referred you"
                    value={formData.referralName}
                    onChange={(e) => setFormData({ ...formData, referralName: e.target.value })}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Salary Range */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Salary Range</CardTitle>
            <CardDescription>Optional - helps track compensation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="minSalary">Minimum</Label>
                <Input
                  id="minSalary"
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.salaryRange.min}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salaryRange: { ...formData.salaryRange, min: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSalary">Maximum</Label>
                <Input
                  id="maxSalary"
                  type="number"
                  placeholder="e.g., 15"
                  value={formData.salaryRange.max}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salaryRange: { ...formData.salaryRange, max: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.salaryRange.currency}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      salaryRange: { ...formData.salaryRange, currency: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (Lakhs)</SelectItem>
                    <SelectItem value="USD">USD (Thousands)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Rounds */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Interview Rounds</CardTitle>
                <CardDescription>Add scheduled or completed interview rounds</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addInterviewRound}>
                <Plus className="mr-2 h-4 w-4" />
                Add Round
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {interviewRounds.length === 0 ? (
              <p className="text-sm text-ink-soft text-center py-4">
                No interview rounds added yet
              </p>
            ) : (
              interviewRounds.map((round, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Round {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInterviewRound(index)}
                    >
                      <Trash2 className="h-4 w-4 text-crimson" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Round Name</Label>
                      <Input
                        placeholder="e.g., Technical Round 1"
                        value={round.roundName}
                        onChange={(e) => updateInterviewRound(index, 'roundName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date & Time</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {round.date ? format(round.date, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={round.date}
                            onSelect={(date) => updateInterviewRound(index, 'date', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Interviewer Name</Label>
                      <Input
                        placeholder="Name (optional)"
                        value={round.interviewerName}
                        onChange={(e) => updateInterviewRound(index, 'interviewerName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={round.status}
                        onValueChange={(value) => updateInterviewRound(index, 'status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Any notes about this round..."
                      value={round.notes}
                      onChange={(e) => updateInterviewRound(index, 'notes', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional notes about this application..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Application'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
