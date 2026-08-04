// components/landing/SketchBox.tsx

/**
 * Hand-drawn double-stroke rectangle used as the outline behind the numbered
 * "why Prep AI" cards. Purely decorative.
 */
export default function SketchBox({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 250"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <path
        d="M14 23c-1.6 13.2-2.2 85.4-1.4 169 .2 21.6 3 30.2 15 30.8 33.8 1.4 121 1.6 157.2-.5 11.6-.7 14.4-8.8 14.8-30 .6-83.8-.2-155.8-1.4-168.6-.4-4.2-3.6-8-13.6-8.6C152 9.4 60 9.8 28 11.6c-9 .6-12.6 4.4-14 11.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M18 25c-1.8 13-2.4 85.2-1.6 168.8.2 21.2 2.6 29.2 14.4 30 32.8 1.4 120.2 1.6 156.2-.3 11.6-.6 13.8-8.2 14.2-29.4.6-84-.4-156.6-1.6-169.2-.4-4-3.8-7.4-13.2-8C150 12 62 12.4 30 14.2c-9.2.6-11.4 4.4-12 10.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
        opacity={0.55}
      />
    </svg>
  );
}
