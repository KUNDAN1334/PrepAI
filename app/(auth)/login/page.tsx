// app/(auth)/login/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import AuthShell from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Middleware appends ?callbackUrl=... when it bounces someone off a dashboard
  // page, so signing in returns them to where they were headed.
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Sign in failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
      } else {
        router.push(callbackUrl);
        // Refresh so server components re-render with the new session cookie.
        router.refresh();
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    await signIn(provider, { callbackUrl });
  };

  return (
    <AuthShell
      eyebrow="welcome back"
      title="Sign in to PrepAI"
      subtitle="Pick up right where you left off."
    >
      <Card className="w-full shadow-[8px_8px_0_var(--ink)]">
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-[1.5px] border-dashed border-ink" />
            </div>
            <div className="kicker relative flex justify-center">
              <span className="bg-white px-2 text-ink-muted">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="brutal"
              onClick={() => handleOAuthSignIn('google')}
            >
              Google
            </Button>
            <Button
              type="button"
              variant="brutal"
              onClick={() => handleOAuthSignIn('github')}
            >
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm font-medium text-ink-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-crimson hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

/**
 * `useSearchParams()` opts a route into client-side rendering, so Next requires a
 * Suspense boundary above it. Without this the whole /login page would fail the
 * build with "useSearchParams should be wrapped in a suspense boundary".
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
