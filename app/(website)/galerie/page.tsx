import Link from "next/link";
import Image from "next/image";
// Sichere Imports via Alias
import { client } from "@/sanity/client"; 
import { urlFor } from "@/sanity/image";
import { FaImages } from "react-icons/fa";

// Daten laden (ISR: Cache für 60 Sekunden)
// Filtert auf isInternal != true, zeigt also nur öffentliche Alben
async function getGalleries() {
  const query = `*[_type == "gallery" && isInternal != true] | order(date desc) {
    _id,
    title,
    slug,
    date,
    coverImage,
    "imageCount": count(images)
  }`;
  
  return client.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function GaleriePage() {
  const galleries = await getGalleries();

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Bildergalerie</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Eindrücke von unseren Spielen, Turnieren und Feiern.
          </p>
        </div>

        {galleries.length === 0 && (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <FaImages className="mx-auto text-4xl text-slate-300 mb-3"/>
            <p className="text-slate-500">Noch keine öffentlichen Alben vorhanden.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.map((album: any) => (
            <Link 
              key={album._id} 
              href={`/galerie/${album.slug.current}`}
              className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
            >
              <div className="relative h-64 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                {album.coverImage ? (
                  <Image 
                    src={urlFor(album.coverImage).width(600).height(400).url()} 
                    alt={album.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">Kein Bild</div>
                )}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                   <span className="text-white text-xs font-bold bg-primary-600 px-2 py-1 rounded shadow-sm">
                     {album.imageCount || 0} Fotos
                   </span>
                </div>
              </div>

              <div className="p-6">
                <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wide">
                   {new Date(album.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  {album.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}