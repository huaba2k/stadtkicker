import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WICHTIG: Die Zeile output: "export" MUSS hier fehlen oder auskommentiert sein!
  // Vercel betreibt die App dynamisch.
  images: {
    // Wenn du Bildoptimierung auf Vercel willst, kannst du 'unoptimized' entfernen
    // Für Sanity ist es aber oft sicherer, es auf true zu lassen, da die Bilder eh schon optimiert sind
    unoptimized: true, 
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'openweathermap.org' },
    ],
  },
};

export default nextConfig;