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
      validation: (Rule) => Rule.required(),
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
      description: 'Wenn aktiviert, ist die Seite nur im Mitgliederbereich sichtbar.',
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
          icon: () => '📝',
          fields: [
            { name: 'heading', title: 'Überschrift', type: 'string' },
            { name: 'text', title: 'Inhalt', type: 'array', of: [{ type: 'block' }] },
          ],
          preview: {
            select: { title: 'heading', subtitle: 'text.0.children.0.text' },
            prepare({ title, subtitle }) {
              return { title: title || 'Text-Block', subtitle: subtitle || '' }
            }
          }
        },
        // 2. Hero Bild
        {
          type: 'object',
          name: 'sectionHero',
          title: 'Hero / Banner Bild',
          icon: () => '🖼️',
          fields: [
            { name: 'image', title: 'Bild', type: 'image', options: { hotspot: true } },
            { name: 'caption', title: 'Text auf dem Bild', type: 'string' },
          ],
          preview: {
            select: { title: 'caption', media: 'image' },
            prepare({ title, media }) {
              return { title: title || 'Hero-Bild', media: media }
            }
          }
        },
        // 3. Galerie
        {
          type: 'reference',
          name: 'galleryRef',
          title: 'Galerie einfügen',
          icon: () => '📷',
          to: [{type: 'gallery'}]
        },
        // 4. Datei-Download
        {
          type: 'object',
          name: 'sectionFile',
          title: 'Datei-Download',
          icon: () => '📎',
          fields: [
            { name: 'title', title: 'Titel', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'description', title: 'Beschreibung', type: 'string' },
            { name: 'file', title: 'Datei', type: 'file', options: { storeOriginalFilename: true } }
          ],
          preview: {
            select: { title: 'title', filename: 'file.asset.originalFilename' },
            prepare({ title, filename }) {
              return { title: title, subtitle: filename }
            }
          }
        },
        // 5. YouTube Video
        {
          type: 'object',
          name: 'sectionVideo',
          title: 'YouTube Video',
          icon: () => '▶️',
          fields: [
            { name: 'url', title: 'YouTube URL', type: 'url', validation: (Rule) => Rule.required() },
            { name: 'caption', title: 'Untertitel (Optional)', type: 'string' }
          ]
        },
        // 6. Info Box
        {
          type: 'object',
          name: 'sectionInfo',
          title: 'Info-Box / Hinweis',
          icon: () => 'ℹ️',
          fields: [
            { name: 'title', title: 'Titel (z.B. WICHTIG)', type: 'string' },
            { name: 'text', title: 'Text', type: 'text', rows: 3 },
            { 
                name: 'type', 
                title: 'Art', 
                type: 'string', 
                options: { 
                    list: [
                        {title: 'Info (Blau)', value: 'info'},
                        {title: 'Warnung/Wichtig (Gelb)', value: 'warning'},
                        {title: 'Erfolg/Grün (Grün)', value: 'success'}
                    ],
                    layout: 'radio' 
                },
                initialValue: 'info'
            }
          ]
        },
        { type: 'boardSection' } 
      ]
    }),
  ],
});