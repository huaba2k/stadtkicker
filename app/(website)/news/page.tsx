// Wir nutzen relative Pfade (3 Ebenen hoch), um sicherzustellen, dass die Module gefunden werden
import { client } from "../../../sanity/client"; 
import NewsList from "../../../components/NewsList";

async function getPosts() {
  // Filter: Nur öffentliche Posts (!isInternal)
  const query = `*[_type == "post" && isInternal != true] | order(publishedAt desc) {
    _id, title, slug, publishedAt, mainImage, isInternal, category,
    "excerpt": body[0].children[0].text
  }`;
  
  // ISR: Cache für 60 Sekunden
  return client.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function NewsPage() {
  const posts = await getPosts();

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Aktuelles vom Verein</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Spielberichte, Turnierergebnisse und Neuigkeiten.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            Aktuell gibt es keine Neuigkeiten.
          </div>
        ) : (
          // Hier nutzen wir die neue Komponente für die Jahres-Gruppierung
          <NewsList posts={posts} />
        )}
      </div>
    </div>
  );
}