import Studio from "./Studio";

// WICHTIG FÜR EXPORT: Wir sagen Next.js, dass es für das Studio nur EINE Einstiegsseite bauen soll.
export function generateStaticParams() {
  return [
    { tool: [] } 
  ];
}

export const dynamicParams = false; // Verhindert Fehler beim Bauen

export default function StudioPage() {
  return <Studio />;
}