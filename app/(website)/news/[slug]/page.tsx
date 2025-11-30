import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/client"; 
import { urlFor } from "@/sanity/image";
import Gallery from "@/components/Gallery"; 
import FileDownload from "@/components/FileDownload"; 

export async function generateStaticParams() {
  const query = `*[_type == "post"]{ "slug": slug.current }`;
  const posts = await client.fetch(query);
  return posts.map((post: any) => ({ slug: post.slug }));
}

async function getPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title, mainImage, publishedAt, body, gallery, category, isInternal,
    tournamentTables[] { title, table },
    body[] {
      ...,
      _type == 'sectionFile' => {
        title, description,
        file { asset-> { url, size, extension } }
      }
    }
  }`;
  
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

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return notFound();

  const dateString = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'Datum unbekannt';

  const galleryImages = post.gallery?.map((img: any) => ({
    src: urlFor(img).width(1200).url(), 
    width: 1200, 
    height: 800, 
    alt: post.title,
  })) || [];

  return (
    <article className="min-h-screen bg-white dark:bg-slate-950 pb-20 pt-20">
      
      {/* Header */}
      <div className="relative h-[400px] w-full bg-slate-200 dark:bg-slate-800">
        {post.mainImage ? (
          <Image src={urlFor(post.mainImage).url()} alt={post.title} fill className="object-cover" priority />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">Kein Titelbild</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-4xl mx-auto">
             <div className="flex gap-2 mb-4">
               <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase">
                 {post.category || "News"}
               </span>
               {post.isInternal && <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">INTERN</span>}
             </div>
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">{post.title}</h1>
             <p className="text-slate-300">{dateString}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <Link href="/news" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-8 transition-colors">
          ← Zurück zur Übersicht
        </Link>

        {/* Inhalt mit Downloads */}
        <div className="prose prose-lg dark:prose-invert prose-blue mx-auto mb-12">
          {post.body && <PortableText value={post.body} components={ptComponents} />}
        </div>

        {/* Tabellen - FIX: Responsiv gemacht */}
        {post.tournamentTables && post.tournamentTables.length > 0 && (
          <div className="mb-16 not-prose space-y-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
              Turnierverlauf & Ergebnisse
            </h3>
            {post.tournamentTables.map((item: any, index: number) => (
              <div key={index}>
                <h4 className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span>{item.title}
                </h4>
                 
                 {/* CONTAINER FÜR SCROLLEN */}
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

      {/* Galerie */}
      {galleryImages.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-16 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center md:text-left">
            Bilderstrecke
          </h2>
          <Gallery images={galleryImages} />
        </div>
      )}
    </article>
  );
}