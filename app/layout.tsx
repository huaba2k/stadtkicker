import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Garchinger Stadtkicker",
  description: "Die offizielle Seite der Garchinger Stadtkicker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // HIER IST DIE ÄNDERUNG: suppressHydrationWarning hinzufügen
    <html lang="de" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}