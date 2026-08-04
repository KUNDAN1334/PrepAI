// components/landing/MagneticLink.tsx
'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface MagneticLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A Next.js Link that leans toward the cursor on hover. Purely decorative —
 * navigation behaviour is unchanged, and the effect is skipped on touch/coarse
 * pointers and when the user prefers reduced motion.
 */
export default function MagneticLink({ href, children, className }: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const enabled = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2;
    const my = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${mx * 0.28}px, ${my * 0.4}px) scale(1.04)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0,0) scale(1)';
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn('transition-[transform,box-shadow] duration-200 will-change-transform', className)}
    >
      {children}
    </Link>
  );
}
