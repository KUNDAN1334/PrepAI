// app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Mic, Briefcase, BookOpen, TrendingUp, Target } from 'lucide-react';
import connectDB from '@/lib/db';
import User from '@/models/User';
import InterviewSession from '@/models/InterviewSession';
import Application from '@/models/Application';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return null;
  }

  await connectDB();

  // Fetch user data and stats
  const user = await User.findOne({ email: session.user.email });
  
  // Use try-catch for database queries
  let interviewCount = 0;
  let applicationCount = 0;

  try {
    if (user?._id) {
      interviewCount = await InterviewSession.countDocuments({ 
        userId: user._id,
        status: 'completed'
      });
      
      applicationCount = await Application.countDocuments({ 
        userId: user._id 
      });
    }
  } catch (error) {
    console.error('Error fetching counts:', error);
  }

  const quota = user?.quota || {
    resumeOptimizations: { usedToday: 0, dailyLimit: 5 },
    mockInterviews: { usedThisMonth: 0, monthlyLimit: 10 }
  };

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-ink-muted mt-2">
          Here's your placement preparation progress
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resume Scans</CardTitle>
            <FileText className="h-4 w-4 text-ink-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quota.resumeOptimizations?.usedToday || 0}/{quota.resumeOptimizations?.dailyLimit || 5}
            </div>
            <p className="text-xs text-ink-muted mt-1">Daily limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mock Interviews</CardTitle>
            <Mic className="h-4 w-4 text-ink-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewCount}</div>
            <p className="text-xs text-ink-muted mt-1">Completed this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-ink-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationCount}</div>
            <p className="text-xs text-ink-muted mt-1">Total tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <TrendingUp className="h-4 w-4 text-ink-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.reputation?.totalPoints || 0}
            </div>
            <p className="text-xs text-ink-muted mt-1">Total points</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your preparation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/resume-optimizer">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Optimize Resume
              </Button>
            </Link>
            <Link href="/dashboard/mock-interview/setup">
              <Button variant="outline" className="w-full justify-start">
                <Mic className="mr-2 h-4 w-4" />
                Start Interview
              </Button>
            </Link>
            <Link href="/dashboard/applications/new">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                Track Application
              </Button>
            </Link>
            <Link href="/dashboard/question-bank">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Questions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Target companies */}
      {user?.targetRoles && user.targetRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Target Roles</CardTitle>
            <CardDescription>Roles you're preparing for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.targetRoles.map((role: string, index: number) => (
                <div
                  key={index}
                  className="inline-flex items-center rounded-full border px-3 py-1 text-sm"
                >
                  <Target className="mr-2 h-3 w-3" />
                  {role}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
