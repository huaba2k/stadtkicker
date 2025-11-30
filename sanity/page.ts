import { defineType, defineField } from 'sanity';

export const page = defineType({
  name: 'page',
  title: 'Seiten (Page Builder)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Seitentitel',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Link / URL',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isInternal',
      title: 'Nur intern sichtbar?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'content',
      title: 'Seiten-Inhalt',
      type: 'array',
      of: [
        // 1. Text
        {
          type: 'object',
          name: 'sectionText',
          title: 'Text-Abschnitt',
          fields: [
            { name: 'heading', title: 'Überschrift', type: 'string' },
            { name: 'text', title: 'Inhalt', type: 'array', of: [{ type: 'block' }] },
          ]
        },
        // 2. Hero Bild
        {
          type: 'object',
          name: 'sectionHero',
          title: 'Hero / Banner Bild',
          fields: [
            { name: 'image', title: 'Bild', type: 'image', options: { hotspot: true } },
            { name: 'caption', title: 'Text auf dem Bild', type: 'string' },
          ]
        },
        // 3. Galerie
        {
          type: 'reference',
          name: 'galleryRef',
          title: 'Galerie einfügen',
          to: [{type: 'gallery'}]
        },
        // 4. NEU: DATEI / DOWNLOAD
        {
          type: 'object',
          name: 'sectionFile',
          title: 'Datei-Download (PDF etc.)',
          icon: () => '📎',
          fields: [
            { 
              name: 'title', 
              title: 'Titel der Datei (z.B. "Spielplan 2025")', 
              type: 'string',
              validation: (Rule) => Rule.required()
            },
            { 
              name: 'description', 
              title: 'Beschreibung (Optional)', 
              type: 'string' 
            },
            { 
              name: 'file', 
              title: 'Datei hochladen', 
              type: 'file',
              options: { storeOriginalFilename: true } 
            }
          ],
          preview: {
            select: { title: 'title', filename: 'file.asset.originalFilename' },
            prepare({ title, filename }) {
              return { title: title, subtitle: filename || 'Keine Datei' }
            }
          }
        }
      ]
    }),
  ],
});