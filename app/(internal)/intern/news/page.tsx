import Link from "next/link";
import Image from "next/image";
import { client } from "../../../../sanity/client";
import { urlFor } from "../../../../sanity/image";

async function getInternalNews() {
  const query = `*[_type == "post" && isInternal == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    "excerpt": body[0].children[0].text
  }`;
  
  return client.fetch(query);
}

export default async function InternalNewsPage() {
  const posts = await getInternalNews();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interne Neuigkeiten</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Infos nur für Mitglieder.</p>
      </div>
      
      {posts.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500">Keine internen Nachrichten vorhanden.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <Link 
            key={post._id} 
            href={`/intern/news/${post.slug.current}`}
            className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
          >
            {/* Bild Bereich */}
            <div className="relative h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
              {post.mainImage ? (
                <Image 
                  src={urlFor(post.mainImage).width(600).height(400).url()} 
                  alt={post.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100 dark:bg-slate-700">
                   Kein Bild
                </div>
              )}
              <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                  INTERN
              </div>
            </div>

            {/* Text Bereich */}
            <div className="p-6 flex flex-col flex-grow">
              <div className="text-xs text-slate-500 mb-2">
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
              <div className="mt-auto pt-4 flex items-center text-primary-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Artikel lesen →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}