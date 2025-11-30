import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
// Wir nutzen hier explizite relative Pfade (5 Ebenen hoch), um Import-Fehler zu vermeiden
import { client } from "../../../../../sanity/client"; 
import { urlFor } from "../../../../../sanity/image";
import Gallery from "../../../../../components/Gallery"; 
import FileDownload from "../../../../../components/FileDownload"; 

export async function generateStaticParams() {
  const query = `*[_type == "post" && isInternal == true]{ "slug": slug.current }`;
  const posts = await client.fetch(query);
  return posts.map((post: any) => ({ slug: post.slug }));
}

async function getInternalPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title, mainImage, publishedAt, gallery, isInternal, category,
    tournamentTables[] { title, table },
    body[] {
      ...,
      _type == 'sectionFile' => {
        title, description,
        file { asset-> { url, size, extension } }
      }
    }
  }`;
  // ISR: Cache für 60 Sekunden
  return client.fetch(query, { slug }, { next: { revalidate: 60 } });
}

const ptComponents = {
  types: {
    sectionFile: ({ value }: any) => (
      <FileDownload 
        title={value.title} 
        description={value.description} 
        fileUrl={value.file?.asset?.url} 
        size={value.file?.asset?.size}
        extension={value.file?.asset?.extension}
      />
    )
  }
};

export default async function InternalNewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getInternalPost(slug);

  if (!post) return notFound();

  const galleryImages = post.gallery?.map((img: any) => ({
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
           <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">INTERN</div>
           {post.category && (
              <div className="bg-slate-800/80 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase backdrop-blur-sm">
                {post.category}
              </div>
           )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 shadow-sm">{post.title}</h1>
          <p className="text-slate-200 text-sm font-medium">{dateString}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            
            <Link href="/intern/news" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-8 font-medium">
              ← Zurück zur Übersicht
            </Link>
            
            <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
              {post.body && <PortableText value={post.body} components={ptComponents} />}
            </div>

            {/* Turnier-Tabellen */}
            {post.tournamentTables && post.tournamentTables.length > 0 && (
              <div className="mt-12 not-prose space-y-8">
                {post.tournamentTables.map((item: any, index: number) => (
                  <div key={index}>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 pl-1 border-l-4 border-primary-500">
                      {item.title}
                    </h4>
                    {item.table && (
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm text-left border-collapse min-w-[500px]">
                          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold">
                            <tr>
                              {item.table.rows[0].cells.map((c: string, i: number) => (
                                <th key={i} className="p-3 border-b border-slate-200 dark:border-slate-700">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {item.table.rows.slice(1).map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                {row.cells.map((c: string, j: number) => (
                                  <td key={j} className="p-3 text-slate-600 dark:text-slate-300">{c}</td>
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

            {/* Bildergalerie */}
            {galleryImages.length > 0 && (
              <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Bilderstrecke</h3>
                <Gallery images={galleryImages} />
              </div>
            )}
        </div>
      </div>
    </article>
  );
}