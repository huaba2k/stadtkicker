import { defineType, defineField } from 'sanity'

export const board = defineType({
  name: 'board',
  title: 'Vorstandschaft',
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
    }),
    defineField({
      name: 'photo',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alternativtext' }
      ]
    }),
    defineField({
      name: 'order',
      title: 'Sortierung',
      type: 'number',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})