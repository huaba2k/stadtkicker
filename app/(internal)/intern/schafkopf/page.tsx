import { client } from "@/lib/client";
import NewsList from "@/components/NewsList";
import { groq } from "next-sanity";

// --- TYPEN ---
interface SchafkopfEvent {
  _id: string;
  title: string;
  start: string;
  // participants kann Referenz-Array ODER String-Array sein
  participants: string[] | null;
}

interface PlayerStat {
  name: string;
  count: number;
}

// --- QUERIES ---

// 1. Schafkopf-Berichte aus Sanity holen
async function getSchafkopfPosts() {
  const query = groq`*[_type == "post" && count((categories[]->title)[@ match "Schafkopf*"]) > 0] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    overview,
    excerpt,
    "categories": categories[]->title,
    "isInternal": true
  }`;
  try {
    return await client.fetch(query);
  } catch (e) {
    console.error("Fehler beim Laden der Schafkopf-Posts:", e);
    return [];
  }
}

// 2. Teilnehmer-Statistiken aus Sanity holen
//    FLEXIBEL: Probiert zuerst Referenzen (->name), dann direkte Strings
async function getParticipationStats(): Promise<PlayerStat[]> {
  // Variante A: participants sind Referenzen auf member/person-Dokumente
  const queryRef = groq`*[_type == "event" && (title match "Schafkopf*") && dateTime(start) < dateTime(now())] {
    _id,
    title,
    start,
    "participants": participants[]->name
  }`;

  // Variante B: participants sind direkte Strings (kein ->)
  const queryStr = groq`*[_type == "event" && (title match "Schafkopf*") && dateTime(start) < dateTime(now())] {
    _id,
    title,
    start,
    participants
  }`;

  let events: SchafkopfEvent[] = [];

  try {
    // Erst Referenz-Variante versuchen
    const refResult: SchafkopfEvent[] = await client.fetch(queryRef);

    // Prüfen ob irgendetwas zurückkam UND ob participants gefüllt sind
    const hasData = refResult.some(
      (e) => e.participants && e.participants.length > 0
    );

    if (hasData) {
      events = refResult;
    } else {
      // Fallback: Strings direkt
      events = await client.fetch(queryStr);
    }
  } catch (e) {
    console.error("Fehler beim Laden der Events:", e);
    // Fallback versuchen
    try {
      events = await client.fetch(queryStr);
    } catch (e2) {
      console.error("Auch Fallback fehlgeschlagen:", e2);
      return [];
    }
  }

  // --- DEBUG: Im Build-Log sichtbar ---
  console.log(
    `[Schafkopf] ${events.length} Events gefunden:`,
    events.map((e) => ({
      title: e.title,
      start: e.start,
      participantCount: e.participants?.length ?? 0,
    }))
  );

  // Teilnahmen aggregieren
  const statsMap = new Map<string, number>();
  events.forEach((event) => {
    if (event.participants && Array.isArray(event.participants)) {
      event.participants.forEach((name) => {
        if (name && typeof name === "string") {
          statsMap.set(name, (statsMap.get(name) || 0) + 1);
        }
      });
    }
  });

  return Array.from(statsMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// --- PAGE ---
export default async function InternalSchafkopfPage() {
  const [posts, playerStats] = await Promise.all([
    getSchafkopfPosts(),
    getParticipationStats(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-12">

      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Schafkopf (Intern)
        </h1>
        <p className="text-slate-500 mt-2">
          Ergebnisse, Berichte und die ewige Teilnehmerliste unserer Runde.
        </p>
      </div>

      {/* TEIL 1: TEILNEHMER-RANKING */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          🏆 Ewige Teilnehmerliste
        </h2>

        {playerStats.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden max-w-2xl">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Teilnahmen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {playerStats.map((player, index) => (
                  <tr
                    key={player.name}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {index + 1}.
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 text-right font-bold">
                      {player.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 space-y-2">
            <p className="font-medium">Noch keine Teilnahmen gefunden.</p>
            <p className="text-xs">
              Mögliche Ursachen:
            </p>
            <ul className="text-xs list-disc list-inside space-y-1 text-slate-400">
              <li>
                Im Sanity Studio: Haben die Events einen Titel, der mit
                &quot;Schafkopf&quot; beginnt?
              </li>
              <li>
                Sind die Events als vergangen eingetragen (Datum in der
                Vergangenheit)?
              </li>
              <li>
                Sind im Feld &quot;participants&quot; Mitglieder ausgewählt?
              </li>
              <li>
                Nach Änderungen im Studio: Neu bauen (git push) nicht
                vergessen!
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* TEIL 2: SPIELBERICHTE */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          📝 Spielberichte
        </h2>

        {posts.length > 0 ? (
          <NewsList posts={posts} />
        ) : (
          <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500">Noch keine Schafkopf-Berichte vorhanden.</p>
            <p className="text-xs text-slate-400 mt-2">
              Bitte prüfe im Sanity Studio, ob die Berichte die Kategorie
              &quot;Schafkopf&quot; haben.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}