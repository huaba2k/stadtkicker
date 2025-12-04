import { FaNewspaper } from "react-icons/fa";
// Relative Pfade (4 Ebenen hoch zum Root)
import { client } from "../../../../sanity/client";
import NewsList from "../../../../components/NewsList";

async function getAllNews() {
  // Filter: KEINER (lädt interne UND externe News)
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, publishedAt, mainImage, isInternal, category,
    "excerpt": body[0].children[0].text
  }`;
  
  // ISR: Cache für 60 Sekunden
  return client.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function InternalNewsPage() {
  const posts = await getAllNews();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <FaNewspaper className="text-primary-600" /> News-Feed
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Alle Neuigkeiten (Intern & Öffentlich) nach Jahren sortiert.
        </p>
      </div>
      
      {posts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500">
          <p>Aktuell gibt es keine Neuigkeiten.</p>
        </div>
      ) : (
        // Hier nutzen wir die smarte Liste für die Jahres-Gruppierung
        <NewsList posts={posts} />
      )}
    </div>
  );
}