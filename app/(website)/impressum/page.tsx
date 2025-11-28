export default function ImpressumPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Impressum</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <h3>Angaben gemäß § 5 TMG</h3>
        <p>
          <strong>Garchinger Stadtkicker e.V.</strong><br />
          [Musterstraße 1]<br />
          [85748 Garching bei München]
        </p>

        <p>
          <strong>Vereinsregister:</strong><br />
          Eingetragen im Vereinsregister.<br />
          Registergericht: [Amtsgericht München]<br />
          Registernummer: [VR 12345]
        </p>

        <p>
          <strong>Vertreten durch den Vorstand:</strong><br />
          1. Vorsitzender: [Max Mustermann]<br />
          2. Vorsitzender: [Erika Musterfrau]
        </p>

        <h3>Kontakt</h3>
        <p>
          Telefon: [089 12345678]<br />
          E-Mail: info@garchinger-stadtkicker.de
        </p>

        <hr className="my-8 border-slate-200 dark:border-slate-700" />

        <h3>Bankverbindung</h3>
        <p>
          Für Mitgliedsbeiträge und Spenden nutzen Sie bitte folgende Bankverbindung:
        </p>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 not-prose">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <dt className="font-semibold text-slate-700 dark:text-slate-300">Empfänger:</dt>
            <dd className="sm:col-span-2 text-slate-900 dark:text-white">Garchinger Stadtkicker e.V.</dd>
            
            <dt className="font-semibold text-slate-700 dark:text-slate-300">Bank:</dt>
            <dd className="sm:col-span-2 text-slate-900 dark:text-white">[Name der Bank, z.B. Kreissparkasse München]</dd>
            
            <dt className="font-semibold text-slate-700 dark:text-slate-300">IBAN:</dt>
            <dd className="sm:col-span-2 font-mono text-slate-900 dark:text-white">[DE12 3456 7890 1234 5678 90]</dd>
            
            <dt className="font-semibold text-slate-700 dark:text-slate-300">BIC:</dt>
            <dd className="sm:col-span-2 font-mono text-slate-900 dark:text-white">[BICCODE]</dd>
          </dl>
        </div>

        <hr className="my-8 border-slate-200 dark:border-slate-700" />

        <h3>Redaktionell verantwortlich</h3>
        <p>
          [Name des Verantwortlichen für die Website]<br />
          [Anschrift wie oben]
        </p>

        <h3>Verbraucherstreitbeilegung/Universalschlichtungsstelle</h3>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>
    </div>
  );
}