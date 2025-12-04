import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PortableText } from "@portabletext/react";

// Wir nutzen relative Pfade für maximale Sicherheit beim Build
import { client } from "../../../../sanity/client"; 
import { urlFor } from "../../../../sanity/image";
import Gallery from "../../../../components/Gallery"; 
import FileDownload from "../../../../components/FileDownload"; 
import YouTubeEmbed from "../../../../components/YouTubeEmbed";
import InfoBox from "../../../../components/InfoBox";

// 1. Statische Pfade für öffentliche Posts
export async function generateStaticParams() {
  const query = `*[_type == "post" && isInternal != true]{ "slug": slug.current }`;
  const posts = await client.fetch(query);
  return posts.map((post: any) => ({ slug: post.slug }));
}

// 2. Daten laden
async function getPost(slug: string) {
  // Filter: isInternal != true (Sicherheit)
  const query = `*[_type == "post" && slug.current == $slug && isInternal != true][0] {
    title, 
    mainImage, 
    publishedAt, 
    category,
    
    // Legacy: Turnier-Tabellen
    tournamentTables[] { title, table },
    
    // Legacy: Galerie am Ende
    gallery,

    // Body mit allen neuen Komponenten
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

// 3. SEO Metadaten
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Artikel nicht gefunden" };

  const imageUrl = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : null;

  return {
    title: post.title,
    description: "Neuigkeiten der Garchinger Stadtkicker",
    openGraph: {
      title: post.title,
      type: "article",
      publishedTime: post.publishedAt,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

// 4. Komponenten für den Text-Editor (PortableText)
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
    // YouTube Video
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
          alt: "Galeriebild"
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

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return notFound();

  const dateString = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'Datum unbekannt';

  // Legacy Galerie (falls am Ende angefügt)
  const legacyGalleryImages = post.gallery?.map((img: any) => ({
    src: urlFor(img).width(1200).url(), 
    width: 1200, 
    height: 800, 
    alt: post.title,
  })) || [];

  return (
    <article className="min-h-screen bg-white dark:bg-slate-950 pb-20 pt-20">
      
      {/* --- HEADER BILD --- */}
      <div className="relative h-[400px] w-full bg-slate-200 dark:bg-slate-800">
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-4xl mx-auto">
             <div className="flex gap-2 mb-4">
               <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase">
                 {post.category || "News"}
               </span>
             </div>
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
               {post.title}
             </h1>
             <p className="text-slate-300 font-medium">{dateString}</p>
        </div>
      </div>

      {/* --- INHALT --- */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        
        <Link href="/news" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-8 transition-colors">
          ← Zurück zur Übersicht
        </Link>

        {/* Fließtext mit allen Komponenten */}
        <div className="prose prose-lg dark:prose-invert prose-blue mx-auto mb-12">
          {post.body && <PortableText value={post.body} components={ptComponents} />}
        </div>

        {/* Legacy: Turnier-Tabellen */}
        {post.tournamentTables && post.tournamentTables.length > 0 && (
          <div className="mb-16 not-prose space-y-12 border-t border-slate-200 dark:border-slate-800 pt-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2">
              Turnierverlauf
            </h3>
            {post.tournamentTables.map((item: any, index: number) => (
              <div key={index}>
                <h4 className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span>{item.title}
                </h4>
                 {item.table && (
                   <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                      <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-xs tracking-wider border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            {item.table.rows[0].cells.map((c: string, i: number) => (
                              <th key={i} className="px-4 py-3 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {item.table.rows.slice(1).map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              {row.cells.map((c: string, j: number) => (
                                <td key={j} className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap border-r last:border-r-0 border-slate-100 dark:border-slate-800">
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
      </div>

      {/* Legacy: Bildergalerie am Ende */}
      {legacyGalleryImages.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-16 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center md:text-left">
            Bilderstrecke
          </h2>
          <Gallery images={legacyGalleryImages} />
        </div>
      )}
    </article>
  );
}