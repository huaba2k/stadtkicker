export const post = {
  name: 'post',
  title: 'Artikel / News',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Überschrift',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Link-Name (Slug)',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Veröffentlicht am',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'isInternal',
      title: 'Nur intern sichtbar?',
      description: 'Wenn aktiviert, erscheint der Artikel nur im Mitgliederbereich.',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'category',
      title: 'Kategorie / Art des Events',
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
    },
    {
      name: 'mainImage',
      title: 'Hauptbild',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'body',
      title: 'Inhalt',
      type: 'array', 
      of: [{ type: 'block' }],
    },
    
    // --- NEU: DYNAMISCHE GRUPPEN (Das war die Fehlerquelle) ---
    {
      name: 'tournamentTables',
      title: 'Turniergruppen & Ergebnisse',
      type: 'array',
      description: 'Füge hier Tabellen für verschiedene Gruppen oder Phasen hinzu.',
      of: [
        {
          type: 'object',
          name: 'groupTable', // Eindeutiger Name für das Objekt
          title: 'Gruppe / Phase',
          fields: [
            {
              name: 'title',
              title: 'Titel (z.B. "Gruppe A", "Endstand")',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'table',
              title: 'Wertetabelle (Ergebnisse)',
              type: 'table', 
            }
          ],
          // VORSCHAU: Das verhindert Abstürze beim Anzeigen der Liste im Studio
          preview: {
            select: {
              title: 'title',
            },
            prepare(selection: any) {
                return {
                    title: selection.title || 'Neue Ergebnistabelle',
                    subtitle: 'Tabellenphase'
                }
            }
          }
        }
      ]
    },
    // --- ENDE NEU ---

    {
      name: 'gallery',
      title: 'Bildergalerie zum Artikel',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        layout: 'grid',
      },
    },
  ],
};