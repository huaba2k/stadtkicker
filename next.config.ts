import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wichtig für Manitu (erzeugt den 'out' Ordner)
  output: "export",

  images: {
    // Wichtig für Manitu (da kein Server für Bild-Optimierung da ist)
    unoptimized: true,

    // Erlaubt das Laden von Bildern von Sanity
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;