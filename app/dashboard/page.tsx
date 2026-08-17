// app/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileText, Mic, Briefcase, BookOpen, TrendingUp, Target, Search } from 'lucide-react';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import InterviewSession from '@/models/InterviewSession';
import Application from '@/models/Application';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Always rendered per-request: it shows the signed-in user's live counters.
export const dynamic = 'force-dynamic';

const QUICK_ACTIONS = [
  { href: '/dashboard/resume-optimizer', label: 'Optimize resume', icon: FileText },
  { href: '/dashboard/mock-interview', label: 'Start interview', icon: Mic },
  { href: '/dashboard/applications/new', label: 'Track application', icon: Briefcase },
  { href: '/dashboard/company-research', label: 'Research company', icon: Search },
];

export default async function DashboardPage() {
  const session = await auth();

  // Middleware already redirects anonymous visitors, but a page that renders user
  // data must never depend on that alone — this is the authoritative check.
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  await connectDB();

  const userId = session.user.id;

  // Three independent reads, issued together rather than awaited one after another.
  const [user, completedInterviews, applicationCount, recentSessions] = await Promise.all([
    User.findById(userId).select('name quota reputation targetRoles').lean(),
    InterviewSession.countDocuments({ userId, status: 'completed' }),
    Application.countDocuments({ userId }),
    InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('companyName jobRole status averageScore totalQuestions questionsAnswered')
      .lean(),
  ]);

  const resumeQuota = user?.quota?.resumeOptimizations;
  const interviewQuota = user?.quota?.mockInterviews;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-normal tracking-[-0.01em]">
          Welcome back, {user?.name ?? session.user.name ?? 'there'}
        </h1>
        <p className="mt-2 text-ink-muted">Here is where your preparation stands</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resume analyses</CardTitle>
            <FileText className="h-4 w-4 text-ink-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumeQuota?.usedToday ?? 0}/{resumeQuota?.dailyLimit ?? 5}
            </div>
            <p className="mt-1 text-xs text-ink-muted">Used today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mock interviews</CardTitle>
            <Mic className="h-4 w-4 text-ink-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedInterviews}</div>
            <p className="mt-1 text-xs text-ink-muted">
              Completed · {interviewQuota?.usedThisMonth ?? 0}/{interviewQuota?.monthlyLimit ?? 10}{' '}
              started this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-ink-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationCount}</div>
            <p className="mt-1 text-xs text-ink-muted">Tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <TrendingUp className="h-4 w-4 text-ink-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.reputation?.totalPoints ?? 0}</div>
            <p className="mt-1 text-xs text-ink-muted">
              {user?.reputation?.questionContributions ?? 0} questions shared
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Jump straight into the work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="outline" className="w-full justify-start">
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent mock interviews</CardTitle>
            <CardDescription>Pick up where you left off, or review the feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSessions.map((interview) => (
              <div
                key={String(interview._id)}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <p className="font-semibold">
                    {interview.companyName} — {interview.jobRole}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {interview.questionsAnswered}/{interview.totalQuestions} answered
                    {typeof interview.averageScore === 'number'
                      ? ` · avg ${interview.averageScore.toFixed(1)}/10`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      interview.status === 'completed' ? 'status-positive' : 'status-warning'
                    }
                  >
                    {interview.status}
                  </Badge>
                  <Link
                    href={
                      interview.status === 'completed'
                        ? `/dashboard/mock-interview/feedback/${interview._id}`
                        : `/dashboard/mock-interview/${interview._id}`
                    }
                  >
                    <Button variant="outline" size="sm">
                      {interview.status === 'completed' ? 'View feedback' : 'Resume'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {user?.targetRoles && user.targetRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Target roles</CardTitle>
            <CardDescription>Set these on your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {user.targetRoles.map((role: string) => (
              <span
                key={role}
                className="inline-flex items-center rounded-full border px-3 py-1 text-sm"
              >
                <Target className="mr-2 h-3 w-3" />
                {role}
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Question bank</CardTitle>
          <CardDescription>Contribute a question, earn reputation</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/question-bank">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse questions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
