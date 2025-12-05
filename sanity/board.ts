import { defineType, defineField } from 'sanity'

export const board = defineType({
  name: 'board',
  title: 'Vorstandschaft', // So heißt es im Menü
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Funktion',
      type: 'string',
      description: 'z.B. 1. Vorstand, Kassier, etc.',
    }),
    defineField({
      name: 'photo',
      title: 'Foto',
      type: 'image',
      options: {
        hotspot: true, // Ermöglicht das Zuschneiden
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternativtext',
          description: 'Beschreibung für Screenreader (wichtig)',
        }
      ]
    }),
    defineField({
      name: 'order',
      title: 'Sortierung',
      type: 'number',
      description: 'Niedrige Zahl = erscheint zuerst (z.B. 1, 2, 3)',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'photo',
    }, 
  },
})