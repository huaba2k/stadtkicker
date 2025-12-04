import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";

// FIX: Relative Pfade 5 Ebenen hoch zum Root-Verzeichnis
// (page -> [slug] -> news -> intern -> (internal) -> app -> ROOT)
import { client } from "../../../../../sanity/client"; 
import { urlFor } from "../../../../../sanity/image";
import Gallery from "../../../../../components/Gallery"; 
import FileDownload from "../../../../../components/FileDownload"; 
import YouTubeEmbed from "../../../../../components/YouTubeEmbed";
import InfoBox from "../../../../../components/InfoBox";

// 1. Statische Pfade für ALLE Posts (damit auch öffentliche im internen Bereich schnell laden)
export async function generateStaticParams() {
  const query = `*[_type == "post"]{ "slug": slug.current }`;
  const posts = await client.fetch(query);
  return posts.map((post: any) => ({ slug: post.slug }));
}

// 2. Daten laden (Kein Filter auf isInternal -> Zeigt alles)
async function getInternalPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title, 
    mainImage, 
    publishedAt, 
    gallery, 
    isInternal, 
    category,
    
    // Legacy Tabellen
    tournamentTables[] { title, table },
    
    // Body mit allen Komponenten
    body[] {
      ...,
      _type == 'sectionFile' => { 
        title, description, 
        file { asset-> { url, size, extension } } 
      },
      _type == 'sectionVideo' => { 
        url, caption 
      },
      _type == 'sectionInfo' => { 
        title, text, type 
      },
      _type == 'sectionHero' => {
        caption, image
      },
      _type == 'galleryRef' => {
        "galleryData": @-> { title, images }
      }
    }
  }`;
  
  // ISR: Cache für 60 Sekunden
  return client.fetch(query, { slug }, { next: { revalidate: 60 } });
}

// 3. Komponenten für den Text-Editor (PortableText)
const ptComponents = {
  types: {
    // Datei-Download
    sectionFile: ({ value }: any) => (
      <FileDownload 
        title={value.title} 
        description={value.description} 
        fileUrl={value.file?.asset?.url} 
        size={value.file?.asset?.size}
        extension={value.file?.asset?.extension}
      />
    ),
    // YouTube
    sectionVideo: ({ value }: any) => (
      <YouTubeEmbed 
        url={value.url} 
        caption={value.caption} 
      />
    ),
    // Info-Box
    sectionInfo: ({ value }: any) => (
      <InfoBox 
        title={value.title} 
        text={value.text} 
        type={value.type} 
      />
    ),
    // Hero Bild im Text
    sectionHero: ({ value }: any) => (
      <div className="my-10 not-prose">
        <div className="relative w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden shadow-md">
          {value.image && (
            <Image 
              src={urlFor(value.image).url()} 
              alt={value.caption || 'Bild'} 
              fill 
              className="object-cover"
            />
          )}
        </div>
        {value.caption && <p className="text-center text-sm text-slate-500 mt-2 italic">{value.caption}</p>}
      </div>
    ),
    // Galerie im Text
    galleryRef: ({ value }: any) => {
      if (!value.galleryData?.images) return null;
      const images = value.galleryData.images.map((img: any) => ({
          src: urlFor(img).url(), 
          width: 1200, 
          height: 800, 
          alt: "Galerie"
      }));
      
      return (
        <div className="my-12 not-prose p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {value.galleryData.title && (
              <h4 className="text-xl font-bold mb-6 text-center text-slate-900 dark:text-white">
                {value.galleryData.title}
              </h4>
            )}
            <Gallery images={images} />
        </div>
      );
    }
  }
};

export default async function InternalNewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getInternalPost(slug);

  if (!post) return notFound();

  // Legacy Galerie (am Ende)
  const legacyGalleryImages = post.gallery?.map((img: any) => ({
    src: urlFor(img).width(1200).url(), 
    width: 1200, 
    height: 800, 
    alt: post.title,
  })) || [];

  const dateString = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : '';

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      
      {/* Header Bild */}
      <div className="relative h-[350px] w-full bg-slate-200 dark:bg-slate-800">
        {post.mainImage ? (
          <Image 
            src={urlFor(post.mainImage).url()} 
            alt={post.title} 
            fill 
            className="object-cover" 
            priority 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">Kein Bild</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
           {post.isInternal && (
             <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider shadow-red-900/20">
               INTERN
             </div>
           )}
           {post.category && (
              <div className="bg-slate-800/80 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase backdrop-blur-sm border border-white/10">
                {post.category}
              </div>
           )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 shadow-sm leading-tight">
            {post.title}
          </h1>
          <p className="text-slate-200 text-sm font-medium">{dateString}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            
            <Link href="/intern/news" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-8 font-medium">
              ← Zurück zur Übersicht
            </Link>
            
            {/* Fließtext */}
            <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
              {post.body && <PortableText value={post.body} components={ptComponents} />}
            </div>

            {/* Legacy Tabellen */}
            {post.tournamentTables && post.tournamentTables.length > 0 && (
              <div className="mt-12 not-prose space-y-8 border-t border-slate-100 dark:border-slate-700 pt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ergebnisse</h3>
                {post.tournamentTables.map((item: any, index: number) => (
                  <div key={index}>
                    <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-3 pl-3 border-l-4 border-primary-500">
                      {item.title}
                    </h4>
                    
                    {item.table && (
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-xs tracking-wider">
                            <tr>
                              {item.table.rows[0].cells.map((c: string, i: number) => (
                                <th key={i} className="p-3 border-b border-slate-200 dark:border-slate-700">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {item.table.rows.slice(1).map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                {row.cells.map((c: string, j: number) => (
                                  <td key={j} className="p-3 text-slate-600 dark:text-slate-300 border-r border-transparent last:border-r-0">
                                    {c}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Legacy Galerie */}
            {legacyGalleryImages.length > 0 && (
              <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Bilderstrecke</h3>
                <Gallery images={legacyGalleryImages} />
              </div>
            )}
        </div>
      </div>
    </article>
  );
}