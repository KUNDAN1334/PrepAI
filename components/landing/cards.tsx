// components/landing/cards.tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TiltCard } from './motion-primitives';

/* ------------------------------------------------------------------ */
/* MockCard — framed product screenshot stand-in                       */
/* ------------------------------------------------------------------ */

const shadowByAccent = {
  ink: 'shadow-[6px_6px_0_var(--ink)]',
  crimson: 'shadow-[6px_6px_0_var(--crimson)]',
  azure: 'shadow-[6px_6px_0_var(--azure)]',
  gold: 'shadow-[6px_6px_0_var(--gold)]',
} as const;

export type Accent = keyof typeof shadowByAccent;

/**
 * The card used to preview a product surface. Has app chrome, a titled
 * header strip and a tilting body — the visual anchor of each feature row.
 */
export function MockCard({
  label,
  meta,
  accent = 'ink',
  className,
  bodyClassName,
  children,
}: {
  label: string;
  meta?: React.ReactNode;
  accent?: Accent;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <TiltCard className={cn('group', className)} intensity={7}>
      <div
        className={cn(
          'overflow-hidden rounded-[18px] border-2 border-ink bg-white',
          shadowByAccent[accent]
        )}
      >
        {/* Chrome */}
        <div className="flex items-center gap-3 border-b-2 border-ink bg-paper px-4 py-3">
          <span className="chrome-dots" aria-hidden="true" />
          <span className="font-hand text-[19px] font-bold leading-none">{label}</span>
          {meta ? <span className="ml-auto text-[11px] font-bold">{meta}</span> : null}
        </div>
        <div className={cn('p-5 sm:p-6', bodyClassName)}>{children}</div>
      </div>
    </TiltCard>
  );
}

/* ------------------------------------------------------------------ */
/* BentoTile — grid cell for the "why" section                         */
/* ------------------------------------------------------------------ */

export function BentoTile({
  index,
  title,
  body,
  accent,
  tint,
  className,
  children,
}: {
  index: string;
  title: string;
  body: string;
  accent: string;
  tint?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('tile group flex flex-col p-6', tint, className)}>
      {/* Oversized ghost numeral that shifts on hover */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -right-2 -top-6 select-none font-display text-[110px] leading-none opacity-[0.10] transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1',
          accent
        )}
      >
        {index}
      </span>

      <div className={cn('font-display text-[38px] leading-none', accent)}>{index}</div>
      <h3 className="mt-3 text-[16px] font-bold leading-snug">{title}</h3>
      <p className="mt-1.5 text-[13.5px] font-medium leading-[1.55] text-ink-muted">{body}</p>
      {children ? <div className="mt-auto pt-5">{children}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatTile                                                            */
/* ------------------------------------------------------------------ */

export function StatTile({
  value,
  label,
  accent,
}: {
  value: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden px-4 py-6 text-center sm:px-6">
      <div className={cn('font-display text-[44px] leading-none sm:text-[56px]', accent)}>
        {value}
      </div>
      <div className="kicker mt-2 text-ink-muted">{label}</div>
      <span
        aria-hidden="true"
        className="absolute inset-x-6 bottom-3 h-[3px] origin-left scale-x-0 bg-ink transition-transform duration-500 group-hover:scale-x-100"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QuoteCard                                                           */
/* ------------------------------------------------------------------ */

export function QuoteCard({
  quote,
  name,
  role,
  initials,
  accentBorder,
  accentBg,
}: {
  quote: string;
  name: string;
  role: string;
  initials: string;
  accentBorder: string;
  accentBg: string;
}) {
  return (
    <figure
      className={cn(
        'group relative w-[330px] shrink-0 rounded-[16px] border-2 border-l-[7px] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 sm:w-[360px]',
        accentBorder
      )}
      style={{ boxShadow: '5px 5px 0 rgba(20,18,16,0.14)' }}
    >
      <div className="mb-3 tracking-[3px] text-gold" aria-label="5 out of 5">
        ★★★★★
      </div>
      <blockquote className="text-[14.5px] font-medium leading-[1.65] text-ink">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span
          className={cn(
            'flex h-9 w-9 flex-none items-center justify-center rounded-full border-[1.5px] border-ink text-[11px] font-bold',
            accentBg
          )}
        >
          {initials}
        </span>
        <span>
          <span className="block font-hand text-[19px] font-bold leading-tight">{name}</span>
          <span className="block text-[11.5px] font-semibold text-ink-soft">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Accordion — interactive FAQ                                         */
/* ------------------------------------------------------------------ */

export function FaqAccordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="border-t-[1.5px] border-ink">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b-[1.5px] border-ink">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span
                  className={cn(
                    'font-display text-[20px] font-normal transition-colors sm:text-[24px]',
                    isOpen ? 'text-crimson' : 'group-hover:text-crimson'
                  )}
                >
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-9 w-9 flex-none items-center justify-center rounded-full border-[1.5px] transition-all duration-300',
                    isOpen
                      ? 'rotate-180 border-crimson bg-crimson text-white'
                      : 'border-ink bg-white group-hover:bg-paper'
                  )}
                >
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[68ch] pb-6 pr-16 text-[15.5px] font-medium leading-[1.65] text-ink-muted">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StepCard — numbered process step with a connecting rule             */
/* ------------------------------------------------------------------ */

export function StepCard({
  n,
  title,
  body,
  accent,
  last = false,
}: {
  n: number;
  title: string;
  body: string;
  accent: string;
  last?: boolean;
}) {
  return (
    <div className="group relative flex-1">
      {!last && (
        <span
          aria-hidden="true"
          className="absolute left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] top-7 hidden h-[2px] bg-ink/25 sm:block"
        />
      )}
      <div className="relative flex flex-col items-center px-3 text-center">
        <span
          className={cn(
            'relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] border-ink bg-white font-display text-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0_var(--ink)]',
            accent
          )}
        >
          {n}
        </span>
        <h3 className="mt-5 font-display text-[25px] font-normal">{title}</h3>
        <p className="mt-1.5 max-w-[30ch] text-[14.5px] font-medium leading-[1.6] text-ink-muted">
          {body}
        </p>
      </div>
    </div>
  );
}
