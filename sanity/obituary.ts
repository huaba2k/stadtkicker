// sanity/schemas/obituary.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'obituary',
  title: 'Gedenkseite (Verstorbene)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name des Verstorbenen',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: {
        hotspot: true, // Damit man den Ausschnitt wählen kann
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'birthDate',
      title: 'Geburtsdatum',
      type: 'date',
      options: { dateFormat: 'DD.MM.YYYY' }
    }),
    defineField({
      name: 'entryDate',
      title: 'Eintrittsdatum (Verein)',
      type: 'date',
      options: { dateFormat: 'DD.MM.YYYY' }
    }),
    defineField({
      name: 'deathDate',
      title: 'Sterbedatum',
      type: 'date',
      options: { dateFormat: 'DD.MM.YYYY' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Nachruf / Text',
      type: 'text', // Einfacher Text, oder 'array' für Rich Text
      rows: 4,
    }),
    defineField({
      name: 'download',
      title: 'Download (z.B. Traueranzeige PDF)',
      type: 'file',
    }),
  ],
  // Vorschau im Studio anpassen
  preview: {
    select: {
      title: 'name',
      date: 'deathDate',
      media: 'image',
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: `Verstorben am: ${selection.date}`,
        media: selection.media,
      }
    },
  },
})