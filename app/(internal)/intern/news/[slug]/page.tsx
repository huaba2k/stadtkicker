import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "../../../../../sanity/client"; 
import { urlFor } from "../../../../../sanity/image";
import Gallery from "../../../../../components/Gallery"; 

// 1. WICHTIG: Diese Funktion hat gefehlt!
// Sie sagt Next.js: "Baue bitte für jeden internen Artikel eine HTML-Seite."
export async function generateStaticParams() {
  const query = `*[_type == "post" && isInternal == true]{ "slug": slug.current }`;
  const posts = await client.fetch(query);
  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

// 2. Den Artikel laden
async function getInternalPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title,
    mainImage,
    publishedAt,
    body,
    gallery,
    isInternal
  }`;
  
  // Kein revalidate: 0 für den Export!
  return client.fetch(query, { slug });
}

export default async function InternalNewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getInternalPost(slug);

  if (!post) {
    return notFound();
  }

  const galleryImages = post.gallery?.map((img: any) => ({
    src: urlFor(img).width(1200).url(),
    width: 1200, 
    height: 800, 
    alt: post.title,
  })) || [];

  const dateString = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'Datum unbekannt';

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      
      {/* Header Bild */}
      <div className="relative h-[300px] w-full bg-slate-200 dark:bg-slate-800">
        {post.mainImage ? (
          <Image
            src={urlFor(post.mainImage).url()}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">Kein Titelbild</div>
        )}
        {/* Badge */}
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm z-10">
          INTERN
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 shadow-sm">
            {post.title}
          </h1>
          <p className="text-slate-200 text-sm">
             {dateString}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            
            {/* Zurück Button */}
            <Link href="/intern/news" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-6">
              ← Zurück zur Übersicht
            </Link>

            {/* Text Inhalt */}
            <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
              {post.body ? (
                <PortableText value={post.body} />
              ) : (
                <p className="italic text-slate-500">Kein Textinhalt vorhanden.</p>
              )}
            </div>

            {/* Galerie */}
            {galleryImages.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Bilderstrecke</h3>
                <Gallery images={galleryImages} />
              </div>
            )}
        </div>
      </div>

    </article>
  );
}