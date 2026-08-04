// components/landing/motion-primitives.tsx
'use client';

import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Reveal — fade + lift a block as it enters the viewport              */
/* ------------------------------------------------------------------ */

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 34, y: 0 },
  right: { x: -34, y: 0 },
  none: { x: 0, y: 0 },
};

export function Reveal({
  children,
  className,
  delay = 0,
  from = 'up',
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: Direction;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const { x, y } = offsets[from];

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 1 } : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger — parent/child pair for list and grid entrances             */
/* ------------------------------------------------------------------ */

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Stagger({
  children,
  className,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* WordReveal — headline that resolves one word at a time              */
/* ------------------------------------------------------------------ */

export function WordReveal({
  text,
  className,
  children,
  delay = 0,
}: {
  text: string;
  className?: string;
  children?: React.ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(' ').filter(Boolean);

  return (
    <motion.h1
      className={className}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block"
          variants={{
            hidden: { opacity: 0.12, y: '0.2em', filter: 'blur(4px)' },
            show: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {word}
          {' '}
        </motion.span>
      ))}
      {children}
    </motion.h1>
  );
}

/* ------------------------------------------------------------------ */
/* TiltCard — pointer-tracked 3D tilt with a moving specular sheen     */
/* ------------------------------------------------------------------ */

export function TiltCard({
  children,
  className,
  intensity = 8,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  intensity?: number;
  glare?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const springCfg = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), springCfg);
  const rotateY = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), springCfg);
  const glareX = useTransform(px, [0, 1], ['0%', '100%']);
  const glareY = useTransform(py, [0, 1], ['0%', '100%']);
  // Specular highlight that tracks the pointer across the card face.
  const sheen = useMotionTemplate`radial-gradient(320px circle at ${glareX} ${glareY}, rgba(255,255,255,0.5), transparent 62%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{ rest: { translateY: 0 }, hover: { translateY: -6 } }}
      transition={{ type: 'spring', ...springCfg }}
      className={cn('relative [transform-style:preserve-3d]', className)}
    >
      {children}
      {glare && (
        /* The sheen is pointer-events-none, so it can't detect hover itself —
           it inherits the parent's variant label instead. */
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: sheen }}
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — seamless infinite horizontal scroll                       */
/* ------------------------------------------------------------------ */

export function Marquee({
  children,
  speed = 34,
  reverse = false,
  className,
}: {
  children: React.ReactNode;
  /** Seconds for one full pass. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={cn('flex flex-wrap items-center justify-center gap-x-12 gap-y-4', className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn('group relative flex overflow-hidden', className)}
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
      }}
    >
      {/* Three identical tracks. Each translates by exactly its own width, so
          the loop is seamless; the extra copy guarantees the row still fills
          very wide viewports. Only the first is exposed to assistive tech. */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden={i !== 0}
          className="flex shrink-0 items-center gap-12 pr-12 will-change-transform group-hover:[animation-play-state:paused]"
          style={{
            animation: `marquee ${speed}s linear infinite`,
            animationDirection: reverse ? 'reverse' : 'normal',
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Counter — counts up to a value the first time it is seen            */
/* ------------------------------------------------------------------ */

export function Counter({
  to,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1600,
  className,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    // easeOutExpo — fast start, gentle settle
    const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(to * ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Parallax — translate a layer against scroll                         */
/* ------------------------------------------------------------------ */

export function Parallax({
  children,
  className,
  /** Positive drifts down, negative drifts up. Pixels across the viewport. */
  distance = 60,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  const smooth = useSpring(y, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y: smooth }}>{children}</motion.div>
    </div>
  );
}

/** Same idea but for absolutely-positioned decorative shapes. */
export function FloatLayer({
  className,
  distance = 40,
  children,
}: {
  className?: string;
  distance?: number;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1400], [0, distance]);
  const smooth = useSpring(y, { stiffness: 90, damping: 28, mass: 0.5 });

  return (
    <motion.div aria-hidden="true" className={className} style={reduce ? undefined : { y: smooth }}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* ScrollProgress — thin reading indicator pinned to the top           */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-crimson via-gold to-azure"
    />
  );
}

/* Re-exported so pages can build one-off animations without importing
   framer-motion directly. */
export { motion, useReducedMotion, useScroll, useTransform };
export type { MotionValue };
