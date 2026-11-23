"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps the app so `next-themes` can swap the `dark` class on <html>.
 * The chosen theme is persisted in localStorage by the library.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
