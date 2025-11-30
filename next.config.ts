import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wichtig für Vercel: output: "export" muss fehlen, damit die App dynamisch läuft
  images: {
    // unoptimized: true, // Kann für Vercel entfernt werden, aber lassen wir zur Sicherheit für Sanity
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'openweathermap.org' },
    ],
  },
};

export default nextConfig;