import { createClient } from 'next-sanity'

export const client = createClient({
  // Wir lesen die Werte direkt aus den Umgebungsvariablen
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  
  // WICHTIG: Das feste Datum löst den Build-Fehler
  apiVersion: '2024-01-01', 
  
  // false = immer frische Daten (wichtig für Static Builds)
  useCdn: false, 
  
  perspective: 'published',
})