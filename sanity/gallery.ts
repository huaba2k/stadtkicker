export const gallery = {
  name: 'gallery',
  title: 'Foto-Album',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel des Albums (z.B. Turnier 2023)',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Link (Slug)',
      type: 'slug',
      options: { source: 'title' },
    },
    {
      name: 'date',
      title: 'Datum des Events',
      type: 'date', // Nur Datum reicht oft
      options: {
        dateFormat: 'DD.MM.YYYY',
      }
    },
    {
      name: 'isInternal',
      title: 'Nur intern sichtbar?',
      type: 'boolean',
      initialValue: false,
      description: 'Wenn aktiviert, erscheint das Album nur im Mitgliederbereich.',
    },
    {
      name: 'coverImage',
      title: 'Titelbild (Vorschau)',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'images',
      title: 'Fotos',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        layout: 'grid', // Schöne Raster-Ansicht im Editor
      },
    },
  ],
};