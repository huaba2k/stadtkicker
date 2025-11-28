import Link from "next/link";
import Image from "next/image";
import { client } from "../../../../sanity/client";
import { urlFor } from "../../../../sanity/image";

async function getInternalAlbums() {
  const query = `*[_type == "gallery" && isInternal == true] | order(date desc) {
    _id, title, slug, date, coverImage, "imageCount": count(images)
  }`;
return client.fetch(query);
}

export default async function InternalGalleryPage() {
  const albums = await getInternalAlbums();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Interne Fotos (Nur für Mitglieder)</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {albums.map((album: any) => (
          <Link 
            key={album._id} 
            // KORREKTUR: Link zeigt auf INTERNEN Bereich
            href={`/intern/galerie/${album.slug.current}`} 
            className="group block bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800"
          >
            <div className="relative h-64 bg-slate-200 dark:bg-slate-800">
              {album.coverImage ? (
                <Image
                  src={urlFor(album.coverImage).width(600).url()}
                  alt={album.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                 <div className="flex items-center justify-center h-full text-slate-400">Kein Bild</div>
              )}
               <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                  INTERN
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                  {album.imageCount || 0} Fotos
                </div>
            </div>
            <div className="p-6">
              <div className="text-xs font-semibold text-primary-600 mb-2 uppercase tracking-wide">
                  {album.date ? new Date(album.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' }) : 'Datum unbekannt'}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 text-slate-900 dark:text-white">{album.title}</h3>
            </div>
          </Link>
        ))}
        {albums.length === 0 && <p className="text-slate-500 col-span-full text-center py-12">Keine internen Fotoalben gefunden.</p>}
      </div>
    </div>
  );
}