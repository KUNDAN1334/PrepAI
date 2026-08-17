// components/ui/ThemeToggle.tsx
'use client';

/**
 * Prep AI ships a single light "paper & ink" theme, so there is nothing to
 * toggle. This component is intentionally a no-op: the export is kept so that
 * any existing or future import continues to compile, but it renders nothing.
 *
 * If a dark theme is reintroduced later, restore the next-themes
 * implementation here and re-add a ThemeProvider in components/Providers.tsx.
 */
export function ThemeToggle() {
  return null;
}

export default ThemeToggle;
