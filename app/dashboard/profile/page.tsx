// app/dashboard/profile/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PROFILE_EXPERIENCE_LEVELS } from '@/lib/validation';

interface ProfileResponse {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  experienceLevel?: string;
  targetRoles?: string[];
  socialLinks?: { linkedin?: string; github?: string; twitter?: string };
  reputation?: {
    totalPoints?: number;
    questionContributions?: number;
    answerContributions?: number;
    bestAnswers?: number;
  };
  quota?: {
    resumeOptimizations?: { usedToday?: number; dailyLimit?: number };
    mockInterviews?: { usedThisMonth?: number; monthlyLimit?: number };
  };
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    experienceLevel: '',
    targetRoles: '',
    linkedin: '',
    github: '',
    twitter: '',
  });

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Could not load your profile');

      setProfile(payload);
      setForm({
        name: payload.name ?? '',
        phone: payload.phone ?? '',
        location: payload.location ?? '',
        bio: payload.bio ?? '',
        experienceLevel: payload.experienceLevel ?? '',
        targetRoles: (payload.targetRoles ?? []).join(', '),
        linkedin: payload.socialLinks?.linkedin ?? '',
        github: payload.socialLinks?.github ?? '',
        twitter: payload.socialLinks?.twitter ?? '',
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your profile');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          location: form.location,
          bio: form.bio,
          experienceLevel: form.experienceLevel || undefined,
          targetRoles: form.targetRoles
            .split(',')
            .map((role) => role.trim())
            .filter(Boolean),
          socialLinks: {
            linkedin: form.linkedin,
            github: form.github,
            twitter: form.twitter,
          },
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const detail = payload.details ? Object.values(payload.details)[0] : null;
        throw new Error((detail as string) || payload.error || 'Could not save your profile');
      }

      setProfile(payload);
      toast({ title: 'Profile saved', description: 'Your details have been updated.' });
    } catch (saveError) {
      toast({
        title: 'Error',
        description: saveError instanceof Error ? saveError.message : 'Could not save your profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-4 py-12 text-center">
          <p className="text-ink-muted">{error}</p>
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const resumeQuota = profile.quota?.resumeOptimizations;
  const interviewQuota = profile.quota?.mockInterviews;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Email is fixed — it identifies your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email ?? ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Pune, India"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="A short summary interviewers would read"
                value={form.bio}
                onChange={(event) => setForm({ ...form, bio: event.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preparation</CardTitle>
            <CardDescription>Used to tailor mock interviews and research</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience level</Label>
                <Select
                  value={form.experienceLevel}
                  onValueChange={(value) => setForm({ ...form, experienceLevel: value })}
                >
                  <SelectTrigger id="experienceLevel">
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILE_EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRoles">Target roles</Label>
                <Input
                  id="targetRoles"
                  placeholder="SDE-1, Backend Engineer (comma separated)"
                  value={form.targetRoles}
                  onChange={(event) => setForm({ ...form, targetRoles: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedin}
                  onChange={(event) => setForm({ ...form, linkedin: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/..."
                  value={form.github}
                  onChange={(event) => setForm({ ...form, github: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">X / Twitter</Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://x.com/..."
                  value={form.twitter}
                  onChange={(event) => setForm({ ...form, twitter: event.target.value })}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Reputation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-ink-muted">Total points</p>
            <p className="text-2xl font-bold">{profile.reputation?.totalPoints ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-ink-muted">Questions contributed</p>
            <p className="text-2xl font-bold">{profile.reputation?.questionContributions ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-ink-muted">Best answers</p>
            <p className="text-2xl font-bold">{profile.reputation?.bestAnswers ?? 0}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage this period</CardTitle>
          <CardDescription>Limits keep AI costs predictable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Resume analyses (today)</span>
              <span>
                {resumeQuota?.usedToday ?? 0} / {resumeQuota?.dailyLimit ?? 5}
              </span>
            </div>
            <Progress
              value={((resumeQuota?.usedToday ?? 0) / (resumeQuota?.dailyLimit || 5)) * 100}
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mock interviews (this month)</span>
              <span>
                {interviewQuota?.usedThisMonth ?? 0} / {interviewQuota?.monthlyLimit ?? 10}
              </span>
            </div>
            <Progress
              value={
                ((interviewQuota?.usedThisMonth ?? 0) / (interviewQuota?.monthlyLimit || 10)) * 100
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
