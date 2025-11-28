import Link from "next/link";
import Image from "next/image";
import { client } from "../sanity/client";
import { urlFor } from "../sanity/image";

// Die Schablone erwartet einen Titel und den internen Wert der Kategorie
interface Props {
  title: string;
  description: string;
  category: string;
}

export default async function SportCategoryPage({ title, description, category }: Props) {
  // Wir laden nur Posts, die genau zu dieser Kategorie passen
  const query = `*[_type == "post" && category == $category && isInternal != true] | order(publishedAt desc) {
    _id, title, slug, publishedAt, mainImage, "excerpt": body[0].children[0].text
  }`;
  
  const posts = await client.fetch(query, { category },);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Sport & Spielbetrieb</span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
            {title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Liste der Berichte */}
        {posts.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">Zu dieser Kategorie gibt es noch keine Berichte.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link 
                key={post._id} 
                href={`/news/${post.slug.current}`}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800"
              >
                <div className="relative h-48 bg-slate-200">
                  {post.mainImage && (
                    <Image
                      src={urlFor(post.mainImage).width(600).url()}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-900">
                    {new Date(post.publishedAt).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600">
                    {post.title}
                  </h3>
                  {post.excerpt && <p className="text-slate-500 text-sm line-clamp-2">{post.excerpt}...</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}