export default function DatenschutzPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Datenschutzerklärung</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <h3>1. Datenschutz auf einen Blick</h3>
        <p>
          <strong>Allgemeine Hinweise</strong><br />
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
        </p>
        <p>
          <strong>Verantwortliche Stelle:</strong><br />
          Garchinger Stadtkicker e.V.<br />
          (Kontakt siehe Impressum)
        </p>

        <h3>2. Hosting</h3>
        <p>
          Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
        </p>
        <p>
          <strong>Manitu</strong><br />
          Anbieter ist die manitu GmbH, Welvertstraße 2, 66606 St. Wendel.
          Wenn Sie unsere Website besuchen, erfasst Manitu verschiedene Logfiles inklusive Ihrer IP-Adressen.
          Details entnehmen Sie der Datenschutzerklärung von Manitu: <a href="https://www.manitu.de/datenschutz/" target="_blank" rel="noopener">https://www.manitu.de/datenschutz/</a>.
        </p>
        <p>
          Die Verwendung von Manitu erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website.
        </p>

        <h3>3. Datenerfassung auf dieser Website</h3>

        <h4>Interner Bereich (Registrierung & Login)</h4>
        <p>
          Wenn Sie sich für den internen Bereich anmelden, nutzen wir den Dienst <strong>Supabase</strong>. 
          Anbieter ist Supabase Inc., 970 Toa Payoh North #07-04, Singapur 319000.
        </p>
        <p>
          <strong>Welche Daten werden gespeichert?</strong><br />
          Für die Registrierung und Anmeldung speichern wir Ihre E-Mail-Adresse und ein verschlüsseltes Passwort. 
          Zusätzlich speichert Supabase technische Daten (z.B. Zeitstempel des letzten Logins), um die Sicherheit Ihres Accounts zu gewährleisten.
        </p>
        <p>
          <strong>Zweck der Verarbeitung:</strong><br />
          Die Verarbeitung erfolgt zum Zweck der Bereitstellung eines geschützten Bereichs für Vereinsmitglieder (Art. 6 Abs. 1 lit. b DSGVO - Vertragserfüllung/Mitgliedschaft).
        </p>
        <p>
          Supabase hostet die Daten in Rechenzentren in Frankfurt (Deutschland) (AWS eu-central-1), womit ein hohes Datenschutzniveau gewährleistet wird.
        </p>

        <h4>Content Management (Sanity)</h4>
        <p>
          Die Inhalte (Texte, Bilder) dieser Website werden über das Content Management System <strong>Sanity.io</strong> geladen. 
          Beim Laden der Bilder kann Ihre IP-Adresse technisch bedingt an die Server von Sanity übertragen werden, um die Inhalte auszuliefern. 
          Sanity agiert hierbei als reiner technischer Dienstleister zur Auslieferung der Inhalte (CDN).
        </p>

        <h4>Kontaktformular</h4>
        <p>
          Wenn Sie uns per E-Mail oder Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
        </p>

        <h3>4. Ihre Rechte</h3>
        <p>
          Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.
        </p>
      </div>
    </div>
  );
}