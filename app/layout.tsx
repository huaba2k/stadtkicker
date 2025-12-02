import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ThemeProvider } from "../components/ThemeProvider";

// --- SEO KONFIGURATION ---
export const metadata: Metadata = {
  // 1. Basis-Domain für Social Media Bilder
  metadataBase: new URL("https://stadtkicker.vercel.app"), 
  
  // 2. Titel-Template
  title: {
    default: "Garchinger Stadtkicker e.V. | Fußball & Gemeinschaft",
    template: "%s | Garchinger Stadtkicker",
  },
  
  // 3. Beschreibung & Keywords
  description: "Der Fußballverein für Hobbykicker, Freizeitmannschaften und Gemeinschaft in Garching bei München. News, Turniere, Ergebnisse und Bildergalerien.",
  keywords: [
    "Garchinger Stadtkicker", "Fußball Garching", "Hobbyfußball München", 
    "Freizeitmannschaft", "Kleinfeldturnier", "Verein Garching", "Sportverein",
    "Hallenturnier", "Stockschützen Garching"
  ],
  
  // 4. Autoren & Geo-Location (Wichtig für lokale Suche!)
  authors: [{ name: "Garchinger Stadtkicker e.V." }],
  creator: "Garchinger Stadtkicker e.V.",
  publisher: "Garchinger Stadtkicker e.V.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // 5. Open Graph (Wie es auf Facebook/WhatsApp aussieht)
  openGraph: {
    title: "Garchinger Stadtkicker e.V.",
    description: "Leidenschaft, Gemeinschaft und Fußball im Herzen von Garching.",
    url: "https://garchinger-stadtkicker.de",
    siteName: "Garchinger Stadtkicker",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/hero.jpg", // Standardbild
        width: 1200,
        height: 630,
        alt: "Garchinger Stadtkicker Mannschaftsfoto",
      },
    ],
  },
  
  // 6. Robots (Basis)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // 7. Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png', // Oder spezielles Apple-Icon
  },
};

// Strukturierte Daten für Google (Vereins-Infos)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  "name": "Garchinger Stadtkicker e.V.",
  "sport": "Soccer",
  "url": "https://garchinger-stadtkicker.de",
  "location": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Schleißheimer Str. 40",
      "addressLocality": "Garching bei München",
      "postalCode": "85748",
      "addressCountry": "DE"
    }
  },
  "description": "Hobby- und Freizeitfußballverein in Garching."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* JSON-LD Schema einfügen */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}