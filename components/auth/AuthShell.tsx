// components/auth/AuthShell.tsx
import Link from 'next/link';
import Logo from '@/components/brand/Logo';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Shared paper-and-ink frame for the login and register screens. Presentation
 * only — the forms it wraps keep all of their own state and handlers.
 */
export default function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper p-4 sm:p-8">
      {/* Decorative torn bands, hidden from assistive tech */}
      <div
        aria-hidden="true"
        className="torn-band pointer-events-none absolute inset-x-[-6%] top-[12%] h-[180px] bg-crimson opacity-[0.92]"
      />
      <div
        aria-hidden="true"
        className="torn-band-alt pointer-events-none absolute inset-x-[-6%] bottom-[10%] hidden h-[150px] bg-azure opacity-90 sm:block"
      />
      <div
        aria-hidden="true"
        className="plus-mark pointer-events-none absolute left-[8%] top-[8%] hidden h-8 w-8 text-gold lg:block"
      />
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute bottom-[8%] right-[8%] hidden h-[60px] w-[120px] text-ink opacity-40 lg:block"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" aria-label="PrepAI — home" className="text-ink">
            <Logo size="lg" />
          </Link>
          <div className="eyebrow-hand mt-4 text-[26px] text-crimson">{eyebrow}</div>
          <h1 className="font-display text-[34px] font-normal leading-[1.05] text-ink sm:text-[40px]">
            {title}
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-muted">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
