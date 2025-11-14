// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { DottedGlowBackground } from '@/components/ui/dotted-glow-background';
import { GridBackground } from '@/components/ui/grid-background';
import { 
  FileText, 
  Mic, 
  Briefcase, 
  BookOpen, 
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section with Dotted Glow Background */}
      <section className="relative overflow-hidden bg-black pt-32 pb-20 sm:pt-40 sm:pb-32">
        <DottedGlowBackground 
          className="opacity-40"
          color="rgba(255,255,255,0.3)"
          glowColor="rgba(255, 255, 255, 0.5)"
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4 bg-white text-black hover:bg-gray-100">
              <Sparkles className="mr-2 h-3 w-3" />
              AI-Powered Interview Preparation
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Ace Your Dream Job Interview
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Prep AI helps you prepare for technical interviews with AI-powered mock interviews,
              resume optimization, and a community-driven question bank.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="text-base bg-white text-black hover:bg-gray-200">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base border-gray-700 text-black hover:bg-gray-900">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Grid Background */}
      <section id="features" className="py-20 bg-black border-t border-gray-900 relative">
        <GridBackground type="grid" color="rgba(255,255,255,0.05)" opacity={0.3} />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Comprehensive tools to prepare for your next job interview
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature Card 1 */}
            <div className="bg-black border border-gray-800 rounded-lg p-6 text-center hover:border-gray-700 transition-all hover:scale-105">
              <div className="mx-auto h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Resume Optimizer</h3>
              <p className="text-gray-400 text-sm">
                AI-powered resume analysis and ATS optimization to match job descriptions
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-black border border-gray-800 rounded-lg p-6 text-center hover:border-gray-700 transition-all hover:scale-105">
              <div className="mx-auto h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mock Interviews</h3>
              <p className="text-gray-400 text-sm">
                Practice with AI-generated questions and get detailed feedback on your answers
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-black border border-gray-800 rounded-lg p-6 text-center hover:border-gray-700 transition-all hover:scale-105">
              <div className="mx-auto h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Application Tracker</h3>
              <p className="text-gray-400 text-sm">
                Track all your job applications in one place with Kanban board and timeline views
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-black border border-gray-800 rounded-lg p-6 text-center hover:border-gray-700 transition-all hover:scale-105">
              <div className="mx-auto h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Question Bank</h3>
              <p className="text-gray-400 text-sm">
                Access thousands of real interview questions shared by the community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Dot Background */}
      <section className="bg-black py-20 border-y border-gray-900 relative">
        <GridBackground type="dot" color="rgba(255,255,255,0.1)" opacity={0.2} />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-bold text-white">10,000+</div>
              <div className="mt-2 text-gray-500">Interview Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">50,000+</div>
              <div className="mt-2 text-gray-500">Mock Interviews Taken</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">95%</div>
              <div className="mt-2 text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-black relative">
        <GridBackground type="grid" color="rgba(255,255,255,0.04)" opacity={0.4} />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Get interview-ready in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-black text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Create Your Profile</h3>
              <p className="text-gray-400">
                Sign up and tell us about your target roles and companies
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-black text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Practice & Prepare</h3>
              <p className="text-gray-400">
                Take mock interviews, optimize your resume, and browse questions
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-black text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Ace Your Interviews</h3>
              <p className="text-gray-400">
                Get detailed feedback and track your applications to success
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Start Your Journey Today
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get personalized interview prep powered by AI
          </p>
          <div className="mt-10">
            <Link href="/register">
              <Button size="lg" className="bg-black text-white hover:bg-gray-900">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#features" className="text-sm text-gray-500 hover:text-white">Features</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">About</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">Blog</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">Documentation</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">Guides</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-900 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 Prep AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
