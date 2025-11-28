import Link from "next/link";
import Image from "next/image";
import { client } from "../../../sanity/client"; 
import { urlFor } from "../../../sanity/image";

async function getPosts() {
  const query = `*[_type == "post" && isInternal != true] | order(publishedAt desc) {
    _id, title, slug, publishedAt, mainImage,
    "excerpt": body[0].children[0].text
  }`;
  
  // KORRIGIERT: Kein revalidate: 0
  return client.fetch(query);
}

export default async function NewsPage() {
  const posts = await getPosts();

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Aktuelles vom Verein</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Spielberichte, Turnierergebnisse und Neuigkeiten.</p>
        </div>

        {posts.length === 0 && (
          <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">Aktuell liegen keine Berichte vor.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link key={post._id} href={`/news/${post.slug.current}`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800">
              <div className="relative h-56 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                {post.mainImage ? (
                  <Image src={urlFor(post.mainImage).width(600).height(400).url()} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100 dark:bg-slate-800">Kein Bild</div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                  {new Date(post.publishedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">{post.title}</h2>
                {post.excerpt && <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">{post.excerpt}...</p>}
                <div className="mt-auto pt-4 flex items-center text-primary-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">Weiterlesen →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}