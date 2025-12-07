import { defineType, defineField } from 'sanity'

export const boardSection = defineType({
  name: 'boardSection',
  title: 'Vorstandschaft (Sektion)',
  type: 'object',
  fields: [
    defineField({
      name: 'headline',
      title: 'Überschrift',
      type: 'string',
      initialValue: 'Unsere Vorstandschaft',
    }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare({ title }) {
      return { title: title || 'Vorstandschaft', subtitle: 'Zeigt alle Mitglieder an' }
    },
  },
})