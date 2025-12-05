// sanity/boardSection.ts
import { defineType, defineField } from 'sanity'

export const boardSection = defineType({
  name: 'boardSection',
  title: 'Vorstandschaft (Sektion)',
  type: 'object', // Wichtig: Es ist ein Objekt, kein Dokument
  fields: [
    defineField({
      name: 'headline',
      title: 'Überschrift',
      type: 'string',
      initialValue: 'Unsere Vorstandschaft',
      description: 'Die Überschrift über den Personen (optional)'
    }),
    defineField({
      name: 'showPhotos',
      title: 'Fotos anzeigen?',
      type: 'boolean',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'headline',
    },
    prepare({ title }) {
      return {
        title: title || 'Vorstandschaft',
        subtitle: 'Zeigt automatisch alle angelegten Vorstandsmitglieder',
      }
    },
  },
})