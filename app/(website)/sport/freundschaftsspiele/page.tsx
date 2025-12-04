import { client } from "@/sanity/client";
import NewsList from "@/components/NewsList"; // Wir nutzen die gruppierte Liste
import { FaFutbol } from "react-icons/fa";

async function getPosts() {
  const query = `*[_type == "post" && category == "freundschaftsspiel" && isInternal != true] | order(publishedAt desc) {
    _id, title, slug, publishedAt, mainImage, isInternal, category,
    "excerpt": body[0].children[0].text
  }`;
  return client.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function FreundschaftsspielePage() {
  const posts = await getPosts();

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Sport & Spielbetrieb</span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mt-2 mb-4 flex items-center justify-center gap-3">
             Freundschaftsspiele
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Testspiele und freundschaftliche Vergleiche.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
            Zu dieser Kategorie gibt es aktuell noch keine Berichte.
          </div>
        ) : (
          <NewsList posts={posts} />
        )}
      </div>
    </div>
  );
}