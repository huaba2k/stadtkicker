import NavbarInternal from "../../components/NavbarInternal";
import Footer from "../../components/Footer"; // <-- Importieren
import "../globals.css"; 
import type { Metadata } from "next";

// WICHTIG: Verhindert, dass Google interne Seiten indexiert,
// falls doch mal ein Link nach draußen rutscht.
export const metadata: Metadata = {
  title: "Interner Bereich | Garchinger Stadtkicker",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Navbar oben */}
      <NavbarInternal />
      
      {/* Hauptinhalt (wächst, damit Footer unten bleibt) */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer unten */}
      <Footer />
    </div>
  );
}