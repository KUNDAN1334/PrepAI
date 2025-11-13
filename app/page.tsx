// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { 
  FileText, 
  Mic, 
  Briefcase, 
  BookOpen, 
  TrendingUp, 
  CheckCircle,
  Sparkles,
  Users
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4 bg-black text-white">
              <Sparkles className="mr-2 h-3 w-3" />
              AI-Powered Interview Preparation
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Ace Your Dream Job Interview
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Prep AI helps you prepare for technical interviews with AI-powered mock interviews,
              resume optimization, and a community-driven question bank.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="text-base">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools to prepare for your next job interview
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-black flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Resume Optimizer</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered resume analysis and ATS optimization to match job descriptions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-black flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Mock Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Practice with AI-generated questions and get detailed feedback on your answers
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-black flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Application Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track all your job applications in one place with Kanban board and timeline views
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-black flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Question Bank</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access thousands of real interview questions shared by the community
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-bold text-black">10,000+</div>
              <div className="mt-2 text-gray-600">Interview Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black">50,000+</div>
              <div className="mt-2 text-gray-600">Mock Interviews Taken</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black">95%</div>
              <div className="mt-2 text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get interview-ready in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and tell us about your target roles and companies
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Practice & Prepare</h3>
              <p className="text-gray-600">
                Take mock interviews, optimize your resume, and browse questions
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Ace Your Interviews</h3>
              <p className="text-gray-600">
                Get detailed feedback and track your applications to success
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Join thousands of successful candidates who used Prep AI
          </p>
          <div className="mt-10">
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-white text-black hover:bg-gray-100">
                Start Preparing Now - It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link></li>
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">About</Link></li>
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Blog</Link></li>
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Documentation</Link></li>
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Guides</Link></li>
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</Link></li>
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-gray-600">
              © 2025 Prep AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
