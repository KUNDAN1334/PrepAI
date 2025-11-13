// app/dashboard/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={userData.name || session?.user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={userData.email || session?.user?.email || ''} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reputation & Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-2xl font-bold">{userData.reputation?.totalPoints || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Questions Contributed</p>
              <p className="text-2xl font-bold">{userData.reputation?.questionContributions || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Helpful Votes</p>
              <p className="text-2xl font-bold">{userData.reputation?.helpfulVotes || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quota Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Resume Optimizations (Today)</span>
              <span>
                {userData.quota?.resumeOptimizations?.usedToday || 0} / {userData.quota?.resumeOptimizations?.dailyLimit || 5}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Mock Interviews (This Month)</span>
              <span>
                {userData.quota?.mockInterviews?.usedThisMonth || 0} / {userData.quota?.mockInterviews?.monthlyLimit || 10}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
