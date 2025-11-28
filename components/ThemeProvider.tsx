"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Anstatt den Typ kompliziert zu importieren, sagen wir einfach:
// "Nimm genau die Props, die NextThemesProvider sowieso erwartet"
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}