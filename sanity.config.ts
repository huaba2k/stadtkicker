import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { table } from '@sanity/table';
import { media } from 'sanity-plugin-media'; 
import { board } from './sanity/board';
import { boardSection } from './sanity/boardSection'

// Hier importieren wir deine Daten-Schemata (Baupläne)
import { post } from './sanity/structure';
import { gallery } from './sanity/gallery';
import { download } from './sanity/download';
import { page } from './sanity/page'; 

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  title: "Garchinger Stadtkicker Admin",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  basePath: "/studio",
  
  plugins: [
    structureTool(),
    visionTool(),
    table(),
    media(),
  ],
  
  schema: {
    types: [post, gallery, download, page, board, boardSection], 
  },
});

export default config;