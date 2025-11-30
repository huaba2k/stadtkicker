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
    
    // --- DER PAGE BUILDER ---
    defineField({
      name: 'content',
      title: 'Seiten-Inhalt',
      type: 'array',
      of: [
        // 1. Text-Block
        {
          type: 'object',
          name: 'sectionText',
          title: 'Text-Abschnitt',
          icon: () => '📝',
          fields: [
            { name: 'heading', title: 'Überschrift (Optional)', type: 'string' },
            { name: 'text', title: 'Inhalt', type: 'array', of: [{ type: 'block' }] },
          ],
          preview: {
            select: { title: 'heading', subtitle: 'text.0.children.0.text' },
            prepare({ title, subtitle }) {
              return { title: title || 'Text-Block', subtitle: subtitle || '' }
            }
          }
        },
        // 2. Hero-Bild
        {
          type: 'object',
          name: 'sectionHero',
          title: 'Großes Bild (Hero)',
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
        }
      ]
    }),
  ],
});