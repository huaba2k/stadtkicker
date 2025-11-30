import { defineType, defineField } from 'sanity';

export const gallery = defineType({
  name: 'gallery',
  title: 'Galerie / Album',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel des Albums',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Datum',
      type: 'date',
      initialValue: () => new Date().toISOString().split('T')[0],
    }),
    defineField({
      name: 'isInternal',
      title: 'Nur intern?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'coverImage',
      title: 'Titelbild (Cover)',
      type: 'image',
      options: { hotspot: true },
    }),
    
    // --- OPTIMIERUNG HIER ---
    defineField({
      name: 'images',
      title: 'Fotos',
      type: 'array',
      options: {
        layout: 'grid', // Das Raster ist effizienter als eine Liste
      },
      of: [
        {
          type: 'image',
          options: { 
            hotspot: true,
            storeOriginalFilename: false, // Spart Speicher in Metadaten
          },
          // Wir verzichten auf komplexe Felder pro Bild, um den Editor schnell zu halten
        },
      ],
    }),
  ],
});