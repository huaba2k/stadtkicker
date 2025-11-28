export const download = {
  name: 'download',
  title: 'Downloads / Dokumente',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel des Dokuments',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'file',
      title: 'Datei (PDF, Docx, etc.)',
      type: 'file',
      options: {
        accept: '.pdf,.doc,.docx,.xls,.xlsx'
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Kategorie',
      type: 'string',
      options: {
        list: [
          { title: 'Allgemein / Satzung', value: 'general' },
          { title: 'Formulare', value: 'forms' },
          { title: 'Chroniken / Archiv', value: 'archive' },
        ],
        layout: 'radio'
      },
      initialValue: 'general'
    },
    {
      name: 'description',
      title: 'Kurze Beschreibung (Optional)',
      type: 'text',
      rows: 2
    }
  ]
}