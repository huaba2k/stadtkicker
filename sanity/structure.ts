import { defineType, defineField, defineArrayMember } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Artikel / News',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Überschrift',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Link-Name (Slug)',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Veröffentlicht am',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'isInternal',
      title: 'Nur intern sichtbar?',
      description: 'Wenn aktiviert, erscheint der Artikel nur im Mitgliederbereich.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'string',
      options: {
        list: [
          { title: 'Allgemein', value: 'allgemein' },
          { title: 'Freundschaftsspiel', value: 'freundschaftsspiel' },
          { title: 'Hallenturnier', value: 'hallenturnier' },
          { title: 'Kleinfeldturnier', value: 'kleinfeldturnier' },
          { title: 'Schafkopf', value: 'schafkopf' },
          { title: 'Stockschützen', value: 'stockschuetzen' },
        ],
        layout: 'radio',
      },
      initialValue: 'allgemein',
    }),
    defineField({
      name: 'mainImage',
      title: 'Hauptbild',
      type: 'image',
      options: { hotspot: true },
    }),
    
    // --- DER ERWEITERTE INHALTS-EDITOR ---
    defineField({
      name: 'body',
      title: 'Inhalt',
      type: 'array', 
      of: [
        // 1. Standard Text
        defineArrayMember({ 
          type: 'block' 
        }),
        
        // 2. Datei Download (PDF etc.)
        defineArrayMember({
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
              return { title: title, subtitle: filename || 'Keine Datei' }
            }
          }
        }),

        // 3. YouTube Video
        defineArrayMember({
          type: 'object',
          name: 'sectionVideo',
          title: 'YouTube Video',
          icon: () => '▶️',
          fields: [
            { name: 'url', title: 'YouTube URL', type: 'url', validation: (Rule) => Rule.required() },
            { name: 'caption', title: 'Untertitel', type: 'string' }
          ]
        }),

        // 4. Info Box
        defineArrayMember({
            type: 'object',
            name: 'sectionInfo',
            title: 'Info-Box / Hinweis',
            icon: () => 'ℹ️',
            fields: [
              { name: 'title', title: 'Titel', type: 'string' },
              { name: 'text', title: 'Text', type: 'text', rows: 3 },
              { 
                  name: 'type', 
                  title: 'Art', 
                  type: 'string', 
                  options: { 
                      list: [
                          {title: 'Info (Blau)', value: 'info'},
                          {title: 'Warnung (Gelb)', value: 'warning'},
                          {title: 'Erfolg (Grün)', value: 'success'}
                      ],
                      layout: 'radio' 
                  },
                  initialValue: 'info'
              }
            ],
            preview: {
                select: { title: 'title', subtitle: 'text' },
                prepare({ title, subtitle }) {
                    return { title: title || 'Info Box', subtitle: subtitle }
                }
            }
        }),

        // 5. Hero Bild (Mitten im Text)
        defineArrayMember({
          type: 'object',
          name: 'sectionHero',
          title: 'Großes Bild (Hero)',
          icon: () => '🖼️',
          fields: [
            { name: 'image', title: 'Bild', type: 'image', options: { hotspot: true } },
            { name: 'caption', title: 'Untertitel / Bildquelle', type: 'string' },
          ],
          preview: {
            select: { title: 'caption', media: 'image' },
            prepare({ title, media }) {
              return { title: title || 'Großes Bild', media: media }
            }
          }
        }),

        // 6. Galerie Referenz (Mitten im Text)
        defineArrayMember({
          type: 'reference',
          name: 'galleryRef',
          title: 'Galerie einfügen',
          icon: () => '📷',
          to: [{type: 'gallery'}]
        }),
      ],
    }),

    // --- ZUSATZ FELDER (Legacy & Spezial) ---
    defineField({
      name: 'tournamentTables',
      title: 'Turniergruppen & Ergebnisse (Legacy)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'groupTable',
          title: 'Gruppe / Phase',
          fields: [
            { name: 'title', title: 'Titel', type: 'string' },
            { name: 'table', title: 'Wertetabelle', type: 'table' }
          ]
        })
      ]
    }),

    defineField({
      name: 'gallery',
      title: 'Bildergalerie (am Ende des Artikels)',
      type: 'array',
      options: {
        layout: 'grid', 
      },
      of: [
        defineArrayMember({ 
          type: 'image',
          options: { 
             hotspot: true,
             storeOriginalFilename: false 
          }
        })
      ]
    }),
  ],
});