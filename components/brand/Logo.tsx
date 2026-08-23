// components/brand/Logo.tsx
//
// The single source of truth for PrepAI's identity.
//
// The mark is a "P" whose stem doubles as a rising arrow — preparation turning
// into progress — set in a rounded ink badge, with the letter's counter picked
// out in crimson. It is drawn from three paths on a 40x40 grid so it stays
// crisp from a 16px favicon up to a hero lockup. Nothing else in the app should
// hand-roll a logo; import from here.
//
// Every static asset (favicons, PWA icons, social card) is generated from the
// same geometry by scripts/build-brand-assets.py — change one, change both.

import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Geometry — keep in sync with scripts/build-brand-assets.py           */
/* ------------------------------------------------------------------ */

/** Fits the raw glyph (bbox 6.8..29.2 x 2.8..34.4) into the 40x40 badge. */
const GLYPH_TRANSFORM = 'translate(5.1899 4.6962) scale(0.82278)';

/** P bowl — outer D. */
const BOWL_OUTER = 'M14 12.8H21.2A8 8 0 0 1 21.2 28.8H14Z';
/** P bowl — concentric counter. */
const BOWL_INNER = 'M14 17H21.2A3.8 3.8 0 0 1 21.2 24.6H14Z';
/** The rising arrow whose shaft is the P's stem. Painted last: it covers the
 *  seam where the bowl meets the stem, so no hairline shows at any size. */
const ARROW =
  'M14 2.8L21.2 12.8L16.8 12.8L16.8 34.4L11.2 34.4L11.2 12.8L6.8 12.8Z';

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */

export type LogoVariant = 'ink' | 'paper' | 'onDark' | 'mono';

type VariantSpec = {
  /** Badge fill, or null for no badge at all. */
  badge: string | null;
  /** Hard border on the badge, in the brutalist style. */
  border?: string;
  glyph: string;
  /** Counter colour; null means "punch a real hole" (single-colour mark). */
  accent: string | null;
};

const VARIANTS: Record<LogoVariant, VariantSpec> = {
  /** Default. Solid ink badge — for paper and white surfaces. */
  ink: { badge: 'var(--ink)', glyph: '#fff', accent: 'var(--crimson)' },
  /** White badge with the signature 2px ink rule — matches bordered chrome. */
  paper: {
    badge: '#fff',
    border: 'var(--ink)',
    glyph: 'var(--ink)',
    accent: 'var(--crimson)',
  },
  /** White badge, ink glyph — for the dark sidebar and ink-filled sections. */
  onDark: { badge: '#fff', glyph: 'var(--ink)', accent: 'var(--crimson)' },
  /** Badgeless, inherits `color`. For tight or single-colour contexts. */
  mono: { badge: null, glyph: 'currentColor', accent: null },
};

/* ------------------------------------------------------------------ */
/* Mark                                                                */
/* ------------------------------------------------------------------ */

export interface LogoMarkProps {
  variant?: LogoVariant;
  /** Sizing lives in the class name, e.g. `h-9 w-9`. */
  className?: string;
  /** Corner radius on the 40-unit grid. 10 tracks the app's `rounded-xl`. */
  radius?: number;
  /** Give the mark an accessible name when it stands alone as the logo. */
  title?: string;
}

export function LogoMark({
  variant = 'ink',
  className = 'h-[34px] w-[34px]',
  radius = 10,
  title,
}: LogoMarkProps) {
  const v = VARIANTS[variant];
  const inset = v.border ? 1 : 0;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      {v.badge && (
        <rect
          x={inset}
          y={inset}
          width={40 - 2 * inset}
          height={40 - 2 * inset}
          rx={radius}
          fill={v.badge}
          stroke={v.border}
          strokeWidth={v.border ? 2 : undefined}
        />
      )}

      <g transform={GLYPH_TRANSFORM}>
        {v.accent ? (
          <>
            <path d={BOWL_OUTER} fill={v.glyph} />
            <path d={BOWL_INNER} fill={v.accent} />
          </>
        ) : (
          <path d={`${BOWL_OUTER} ${BOWL_INNER}`} fill={v.glyph} fillRule="evenodd" />
        )}
        <path d={ARROW} fill={v.glyph} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Wordmark                                                            */
/* ------------------------------------------------------------------ */

export interface WordmarkProps {
  className?: string;
  /** Set "AI" in crimson. Turn off on busy or single-colour surfaces. */
  accent?: boolean;
}

export function Wordmark({ className, accent = true }: WordmarkProps) {
  return (
    <span className={cn('font-sans font-extrabold tracking-[-0.01em]', className)}>
      Prep
      <span className={accent ? 'text-crimson' : undefined}>AI</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Lockup                                                              */
/* ------------------------------------------------------------------ */

const SIZES = {
  sm: { mark: 'h-7 w-7', text: 'text-[15px]', gap: 'gap-2', radius: 8 },
  md: { mark: 'h-[34px] w-[34px]', text: 'text-[19px]', gap: 'gap-3', radius: 10 },
  lg: { mark: 'h-11 w-11', text: 'text-[24px]', gap: 'gap-3.5', radius: 12 },
  xl: { mark: 'h-14 w-14', text: 'text-[30px]', gap: 'gap-4', radius: 14 },
} as const;

export interface LogoProps {
  variant?: LogoVariant;
  size?: keyof typeof SIZES;
  /** Hide the wordmark and show the badge alone. */
  markOnly?: boolean;
  accent?: boolean;
  className?: string;
  /** Class applied to the wordmark, e.g. to override its colour. */
  wordmarkClassName?: string;
}

/** The horizontal lockup: mark + "PrepAI". Use this wherever the brand appears. */
export default function Logo({
  variant = 'ink',
  size = 'md',
  markOnly = false,
  accent = true,
  className,
  wordmarkClassName,
}: LogoProps) {
  const s = SIZES[size];

  if (markOnly) {
    return (
      <LogoMark
        variant={variant}
        className={cn(s.mark, className)}
        radius={s.radius}
        title="PrepAI"
      />
    );
  }

  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      <LogoMark variant={variant} className={s.mark} radius={s.radius} />
      <Wordmark accent={accent} className={cn(s.text, wordmarkClassName)} />
    </span>
  );
}
