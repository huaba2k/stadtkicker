import { client } from "@/lib/client";
import NewsList from "@/components/NewsList";
import { groq } from "next-sanity";

// --- TYPEN ---
interface SchafkopfEvent {
  // Wir brauchen nur die Teilnehmer-Liste der Events
  participants: string[] | null;
}

interface PlayerStat {
  name: string;
  count: number;
}

// --- QUERIES ---

// 1. Berichte holen (wie gehabt)
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
  return await client.fetch(query);
}

// 2. Teilnehmer aus vergangenen Turnieren holen
async function getParticipationStats() {
  // Wir holen alle Schafkopf-Termine, die in der Vergangenheit liegen (start < now())
  // Und wir ziehen uns nur das Feld "participants" (und davon den Namen)
  const query = groq`*[_type == "event" && title match "Schafkopf*" && start < now()] {
    "participants": participants[]->name
  }`;
  
  const events: SchafkopfEvent[] = await client.fetch(query);

  // --- DATEN AGGREGIEREN (Zählen) ---
  const statsMap = new Map<string, number>();

  events.forEach((event) => {
    if (event.participants && Array.isArray(event.participants)) {
      event.participants.forEach((name) => {
        if (name) {
          const currentCount = statsMap.get(name) || 0;
          statsMap.set(name, currentCount + 1);
        }
      });
    }
  });

  // Map in Array umwandeln und sortieren (Meiste Teilnahmen zuerst)
  const sortedStats: PlayerStat[] = Array.from(statsMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Absteigend sortieren

  return sortedStats;
}

export default async function InternalSchafkopfPage() {
  const [posts, playerStats] = await Promise.all([
    getSchafkopfPosts(),
    getParticipationStats()
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      
      {/* --- HEADER --- */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Schafkopf (Intern)</h1>
        <p className="text-slate-500 mt-2">
            Ergebnisse, Berichte und die ewige Teilnehmerliste unserer Runde.
        </p>
      </div>

      {/* --- TEIL 1: TEILNEHMER-LISTE (RANKING) --- */}
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
                  <tr key={player.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
            <p>Noch keine Teilnahmen erfasst.</p>
            <p className="text-xs mt-2">
                Hinweis: Stelle sicher, dass im Sanity Studio bei den <strong>vergangenen Events</strong> im Feld &quot;Participants&quot; Mitglieder ausgewählt sind.
            </p>
          </div>
        )}
      </section>

      {/* --- TEIL 2: DIE BERICHTE (News) --- */}
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
              (Bitte prüfe im Sanity Studio, ob die Berichte die Kategorie &quot;Schafkopf&quot; haben)
            </p>
          </div>
        )}
      </section>

    </div>
  );
}