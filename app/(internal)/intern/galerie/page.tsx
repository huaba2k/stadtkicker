import Link from "next/link";
import Image from "next/image";
// Sichere Imports via Alias
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { FaImages } from "react-icons/fa";

// Daten laden (ISR: Cache für 60 Sekunden)
// KEIN Filter auf isInternal, damit Mitglieder ALLES sehen (auch öffentliche Alben)
async function getInternalGalleries() {
  const query = `*[_type == "gallery"] | order(date desc) {
    _id,
    title,
    slug,
    date,
    isInternal,
    coverImage,
    "imageCount": count(images)
  }`;
  
  return client.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function InternalGaleriePage() {
  const galleries = await getInternalGalleries();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <FaImages className="text-purple-600" /> Fotoalben
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Alle Galerien (öffentlich und intern) im Überblick.
        </p>
      </div>
      
      {galleries.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-500">Noch keine Alben vorhanden.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((album: any) => (
          <Link 
            key={album._id} 
            // WICHTIG: Link führt zur INTERNEN Detailansicht!
            // Damit werden auch interne Alben korrekt angezeigt ohne 404.
            href={`/intern/galerie/${album.slug.current}`}
            className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
          >
            <div className="relative h-56 bg-slate-200 dark:bg-slate-700 overflow-hidden">
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
              
              {/* INTERN BADGE */}
              {album.isInternal && (
                 <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider z-10">
                   INTERN
                 </div>
              )}
              
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                 <span className="text-white text-xs font-bold bg-purple-600 px-2 py-1 rounded shadow-sm">
                   {album.imageCount || 0} Fotos
                 </span>
              </div>
            </div>

            <div className="p-6">
              <div className="text-xs text-slate-500 mb-2 font-mono">
                 {new Date(album.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                {album.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}