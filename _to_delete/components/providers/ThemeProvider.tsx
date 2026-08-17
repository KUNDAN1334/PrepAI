// components/providers/ThemeProvider.tsx
'use client';

import * as React from 'react';

/**
 * Prep AI is light-only ("paper & ink"), so this provider is a pass-through.
 * It is kept as a named export purely for import compatibility — it is not
 * mounted anywhere. To reintroduce theming, wrap `children` in next-themes'
 * ThemeProvider here and mount it from components/Providers.tsx.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
