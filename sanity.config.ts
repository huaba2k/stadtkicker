import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { table } from '@sanity/table';
import { media } from 'sanity-plugin-media'; 
import { board } from './sanity/board';
import { boardSection } from './sanity/boardSection';
import { post } from './sanity/structure';
import { gallery } from './sanity/gallery';
import { page } from './sanity/page';
import { download } from './sanity/download';
import { member } from './sanity/member';
import  obituary  from './sanity/obituary';


const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  title: "Garchinger Stadtkicker Admin",
  apiVersion: '2024-01-01',
  basePath: "/studio",
  
  plugins: [
    structureTool(),
    visionTool(),
    table(),
    media(),
  ],
  
  schema: {
    types: [post, gallery, download, page, board, boardSection, member, obituary],
  },
});

export default config; 