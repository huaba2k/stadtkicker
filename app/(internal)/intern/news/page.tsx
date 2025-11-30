import Link from "next/link";
import Image from "next/image";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { FaNewspaper } from "react-icons/fa";

async function getAllNews() {
  // UPDATE: Filter "&& isInternal == true" entfernt!
  // Wir laden jetzt ALLES (_type == "post"), sortiert nach Datum.
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    isInternal,
    category,
    "excerpt": body[0].children[0].text
  }`;
  
  // ISR Cache: Alle 60 Sekunden aktualisieren
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
          Alle Neuigkeiten, Spielberichte und interne Infos auf einen Blick.
        </p>
      </div>
      
      {posts.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-500">Aktuell gibt es keine Neuigkeiten.</p>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: any) => (
          <Link 
            key={post._id} 
            // WICHTIG: Link führt zur internen Detailansicht, damit man auch interne Inhalte sieht
            href={`/intern/news/${post.slug.current}`}
            className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
          >
            {/* Bild Bereich */}
            <div className="relative h-52 bg-slate-200 dark:bg-slate-700 overflow-hidden">
              {post.mainImage ? (
                <Image 
                  src={urlFor(post.mainImage).width(600).height(400).url()} 
                  alt={post.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100 dark:bg-slate-800">
                   <FaNewspaper size={40} className="opacity-20" />
                </div>
              )}
              
              {/* Badges oben rechts */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                {post.isInternal && (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider">
                    Intern
                  </span>
                )}
                {post.category && post.category !== 'allgemein' && (
                  <span className="bg-slate-900/80 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider backdrop-blur-sm">
                    {post.category}
                  </span>
                )}
              </div>
            </div>

            {/* Text Bereich */}
            <div className="p-6 flex flex-col flex-grow">
              <div className="text-xs text-slate-500 mb-2 font-mono">
                 {new Date(post.publishedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                {post.title}
              </h2>
              
              {post.excerpt && (
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">
                  {post.excerpt}...
                </p>
              )}
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
                <span className="text-primary-600 font-bold group-hover:translate-x-1 transition-transform">
                  Artikel lesen →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}