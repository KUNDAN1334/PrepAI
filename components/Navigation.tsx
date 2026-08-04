// components/Navigation.tsx
'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import MagneticLink from '@/components/landing/MagneticLink';

const links = [
  { label: 'Why PrepAI', href: '#why' },
  { label: 'Platform', href: '#features' },
  { label: 'Process', href: '#process' },
  { label: 'Stories', href: '#stories' },
  { label: 'FAQ', href: '#faq' },
];

/** The PrepAI wordmark — a stylised lightbulb/idea glyph in a rounded square. */
export function BrandMark({ className = 'h-[34px] w-[34px]' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border-[1.5px] border-ink ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[19px] w-[19px]"
        aria-hidden="true"
      >
        <path d="M16 4.5c-2.2-.2-3.4 1.1-3.5 3.1-.1 2.2-.2 4.6 0 6.6.2 2.3 1.6 3.3 3.6 3.2 2-.1 3.2-1.2 3.3-3.3.1-2.1.1-4.5 0-6.6-.1-2-1.3-3.2-3.4-3z" />
        <path d="M9.2 13.4c-.3 2.6.6 5.2 3 6.6 2.5 1.5 5.7 1.3 7.9-.5 1.9-1.5 2.6-3.9 2.4-6.1" />
        <path d="M16 20.6c.1 1.9.1 3.6 0 5.6" />
        <path d="M12.4 26.4c2.6-.4 4.9-.3 7.3 0" />
      </svg>
    </div>
  );
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('');
  const reduce = useReducedMotion();

  // Condense the bar once the hero starts scrolling away.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive('#' + visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Lock scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <motion.nav
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-50 border-b-[1.5px] border-ink transition-all duration-300',
        scrolled ? 'bg-white/85 backdrop-blur-md' : 'bg-white/55 backdrop-blur-sm'
      )}
    >
      <div
        className={cn(
          'gutter flex items-center justify-between transition-all duration-300',
          scrolled ? 'py-3' : 'py-4 lg:py-5'
        )}
      >
        {/* Brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-3 text-ink">
          <span className="transition-transform duration-300 group-hover:-rotate-6">
            <BrandMark />
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.01em]">PrepAI</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const isActive = active === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-bold transition-colors',
                  isActive ? 'text-crimson' : 'text-ink-muted hover:text-ink'
                )}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-[2.5px] rounded-full bg-crimson"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm font-bold text-ink transition-colors hover:text-crimson"
          >
            Log in
          </Link>
          <MagneticLink
            href="/register"
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-bold text-white hover:shadow-[0_12px_24px_-8px_rgba(20,18,14,0.5)]"
          >
            Get started
          </MagneticLink>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg border-[1.5px] border-ink text-ink md:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t-[1.5px] border-ink bg-white md:hidden"
          >
            <div className="gutter py-4">
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg px-2 py-2.5 text-sm font-bold text-ink-muted hover:bg-paper hover:text-crimson"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 border-t-[1.5px] border-dashed border-ink pt-3">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg border-[1.5px] border-ink px-4 py-2.5 text-center text-sm font-bold text-ink"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg bg-ink px-4 py-2.5 text-center text-sm font-bold text-white"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
