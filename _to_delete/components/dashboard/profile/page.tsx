// app/dashboard/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Award, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    experienceLevel: '',
    targetRoles: [] as string[],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
    },
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      setUserData(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        experienceLevel: data.experienceLevel || '',
        targetRoles: data.targetRoles || [],
        socialLinks: data.socialLinks || { linkedin: '', github: '', twitter: '' },
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast({
        title: 'Success!',
        description: 'Profile updated successfully',
      });

      fetchUserData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTargetRole = (role: string) => {
    if (role && !formData.targetRoles.includes(role)) {
      setFormData({
        ...formData,
        targetRoles: [...formData.targetRoles, role],
      });
    }
  };

  const removeTargetRole = (role: string) => {
    setFormData({
      ...formData,
      targetRoles: formData.targetRoles.filter((r) => r !== role),
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-ink-muted mt-2">Manage your account information and preferences</p>
      </div>

      {/* Profile Picture & Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData?.image || ''} />
                <AvatarFallback className="bg-ink text-white text-2xl">
                  {userData?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="mt-3">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            <div className="flex-1 grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{userData?.reputation?.totalPoints || 0}</div>
                <p className="text-sm text-ink-muted">Reputation Points</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {userData?.reputation?.questionContributions || 0}
                </div>
                <p className="text-sm text-ink-muted">Questions Contributed</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {userData?.reputation?.badges?.length || 0}
                </div>
                <p className="text-sm text-ink-muted">Badges Earned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formData.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fresher">Fresher</SelectItem>
                <SelectItem value="1-3 years">1-3 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Target Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Target Roles</CardTitle>
          <CardDescription>Roles you're preparing for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              id="roleInput"
              placeholder="e.g., Software Engineer"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTargetRole((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                const input = document.getElementById('roleInput') as HTMLInputElement;
                addTargetRole(input.value);
                input.value = '';
              }}
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.targetRoles.map((role, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {role}
                <button
                  onClick={() => removeTargetRole(role)}
                  className="ml-2 hover:text-crimson"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Connect your professional profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/..."
              value={formData.socialLinks.linkedin}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              placeholder="https://github.com/..."
              value={formData.socialLinks.github}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, github: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/..."
              value={formData.socialLinks.twitter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Your current usage and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-ink-muted mb-1">Resume Optimizations</p>
              <p className="text-2xl font-bold">
                {userData?.quota?.resumeOptimizations?.usedToday || 0}/
                {userData?.quota?.resumeOptimizations?.dailyLimit || 5}
              </p>
              <p className="text-xs text-ink-soft mt-1">Daily limit</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-ink-muted mb-1">Mock Interviews</p>
              <p className="text-2xl font-bold">
                {userData?.quota?.mockInterviews?.usedThisMonth || 0}/
                {userData?.quota?.mockInterviews?.monthlyLimit || 10}
              </p>
              <p className="text-xs text-ink-soft mt-1">Monthly limit</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-ink-muted mb-1">API Calls</p>
              <p className="text-2xl font-bold">
                {userData?.quota?.groqApiCalls?.usedToday || 0}/
                {userData?.quota?.groqApiCalls?.dailyLimit || 50}
              </p>
              <p className="text-xs text-ink-soft mt-1">Daily limit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      {userData?.reputation?.badges && userData.reputation.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Badges & Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {userData.reputation.badges.map((badge: any, index: number) => (
                <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 text-gold-ink mb-2" />
                  <p className="font-medium text-sm text-center">{badge.badgeName}</p>
                  <p className="text-xs text-ink-soft mt-1">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button onClick={handleSave} size="lg" className="w-full" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}
