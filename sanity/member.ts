import { defineType, defineField } from 'sanity'

export const member = defineType({
  name: 'member', // <--- Darauf greift dein Frontend zu!
  title: 'Mitglieder (Intern)',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'role', title: 'Rolle / Funktion', type: 'string' }),
    defineField({ name: 'photo', title: 'Foto', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'email', title: 'E-Mail', type: 'string' }),
    defineField({ name: 'phone', title: 'Telefon', type: 'string' }),
    defineField({ name: 'bio', title: 'Über mich', type: 'text' }),
  ],
})