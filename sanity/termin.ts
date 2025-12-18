import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'termin', // WICHTIG: So heißt der Typ in der Datenbank
  title: 'Termine / Kalender',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Datum & Uhrzeit',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    
    // --- NEU: SICHTBARKEIT ---
    defineField({
      name: 'visibility',
      title: 'Sichtbarkeit',
      type: 'string',
      options: {
        list: [
          { title: 'Öffentlich (Website & Alle)', value: 'public' },
          { title: 'Nur Intern (Eingeloggte Mitglieder)', value: 'internal' },
          { title: 'Nur Vorstand', value: 'board' },
        ],
        layout: 'radio'
      },
      initialValue: 'public'
    }),

    // --- NEU: SCHAFKOPF LOGIK ---
    defineField({
      name: 'isSchafkopf',
      title: 'Ist ein Schafkopf-Turnier?',
      type: 'boolean',
      initialValue: false,
    }),
    // Beispiel: Ein Feld, das NUR bei Schafkopf Sinn macht (z.B. Startgebühr)
    // Wenn du sagst "blende Feld für Spiele aus", meinst du wahrscheinlich ein Feld "Spielart" o.ä.
    // Hier als Beispiel ein Feld, das VERSTECKT wird, wenn es Schafkopf ist:
    defineField({
      name: 'games',
      title: 'Gespielte Spiele (z.B. Fußball, Volleyball)',
      type: 'string',
      // Verstecke dieses Feld, WENN "isSchafkopf" wahr ist
      hidden: ({ document }) => document?.isSchafkopf === true,
    }),

    // --- NEU: SERIENTERMINE ---
    defineField({
      name: 'isRecurring',
      title: 'Ist ein Serientermin?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'recurrenceType',
      title: 'Wiederholung',
      type: 'string',
      hidden: ({ document }) => !document?.isRecurring,
      options: {
        list: [
          { title: 'Wöchentlich', value: 'weekly' },
          { title: 'Monatlich', value: 'monthly' },
          { title: 'Vierteljährlich (1. im Quartal)', value: 'quarterly' },
        ]
      }
    }),
    defineField({
      name: 'recurrenceExceptions',
      title: 'Ausnahmen (Termin fällt aus)',
      description: 'Wähle Datum aus, an denen dieser Serientermin NICHT stattfindet (z.B. Feiertage).',
      type: 'array',
      of: [{ type: 'date' }],
      hidden: ({ document }) => !document?.isRecurring,
    }),

    // --- NEU: EMAIL TRIGGER ---
    defineField({
      name: 'sendNotification',
      title: 'Email-Benachrichtigung senden?',
      description: 'Haken setzen, um Mitglieder über diesen NEUEN Termin zu informieren.',
      type: 'boolean',
      initialValue: false,
    }),
    
    // Standard-Felder (Beschreibung etc.)
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
    }),
    defineField({
      name: 'location',
      title: 'Ort',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      isSchafkopf: 'isSchafkopf',
    },
    prepare(selection) {
      const { title, date, isSchafkopf } = selection
      const dateFormatted = date ? new Date(date).toLocaleDateString('de-DE') : 'Kein Datum'
      const prefix = isSchafkopf ? '♠️ ' : '📅 '
      return {
        title: `${prefix}${title}`,
        subtitle: dateFormatted,
      }
    },
  },
})