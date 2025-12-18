import { client } from "@/lib/client";
import NewsList from "@/components/NewsList"; // Wir recyceln deine Komponente

// Cache deaktivieren für aktuelle Ergebnisse
export const dynamic = 'force-dynamic';

async function getSchafkopfPosts() {
  // Filtert alle Posts, die "Schafkopf" als Kategorie haben
  const query = `*[_type == "post" && "Schafkopf" in categories[]->title] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    overview,
    excerpt, 
    "categories": categories[]->title,
    // WICHTIG: Wir markieren diese Posts als intern, damit der Link im NewsList stimmt
    "isInternal": true 
  }`;
  return await client.fetch(query);
}

export default async function InternalSchafkopfPage() {
  const posts = await getSchafkopfPosts();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Schafkopf (Intern)</h1>
        <p className="text-slate-500">Interne Berichte und Ergebnisse der Schafkopf-Runden.</p>
      </div>

      {posts.length > 0 ? (
        <NewsList posts={posts} />
      ) : (
        <div className="p-12 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
          <p className="text-slate-500">Noch keine Schafkopf-Berichte vorhanden.</p>
          <p className="text-sm text-slate-400 mt-2">
            (Bitte prüfe im Sanity Studio, ob die Berichte die Kategorie "Schafkopf" haben)
          </p>
        </div>
      )}
    </div>
  );
}