import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { table } from '@sanity/table'; // <--- 1. IMPORTIEREN
import { post } from './sanity/structure';
import { gallery } from './sanity/gallery';
import { download } from './sanity/download'; // <-- Importieren

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  title: "Garchinger Stadtkicker Admin",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  basePath: "/studio",
  plugins: [
    structureTool(),
    visionTool(),
    table(), // <--- 2. HIER AKTIVIEREN
  ],
  schema: {
    types: [post, gallery, download], // <-- 'download' hinzufügen
  },
});

export default config;