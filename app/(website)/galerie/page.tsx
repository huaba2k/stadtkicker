import Link from "next/link";
import Image from "next/image";
import { client } from "../../../sanity/client"; 
import { urlFor } from "../../../sanity/image";

async function getPublicAlbums() {
  const query = `*[_type == "gallery" && isInternal != true] | order(date desc) {
    _id, title, slug, date, coverImage, "imageCount": count(images)
  }`;
  // KORRIGIERT:
  return client.fetch(query);
}

export default async function GaleriePage() {
  const albums = await getPublicAlbums();

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Bildergalerie</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Unsere Events und Turniere in der Übersicht.</p>
        </div>
        {albums.length === 0 && <div className="text-center p-12 text-slate-500">Noch keine Fotoalben veröffentlicht.</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album: any) => (
            <Link key={album._id} href={`/galerie/${album.slug.current}`} className="group block bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800">
              <div className="relative h-64 bg-slate-200 dark:bg-slate-800">
                {album.coverImage ? (
                  <Image src={urlFor(album.coverImage).width(600).height(400).url()} alt={album.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : <div className="flex items-center justify-center h-full text-slate-400">Kein Bild</div>}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">{album.imageCount || 0} Fotos</div>
              </div>
              <div className="p-6">
                <div className="text-xs font-semibold text-primary-600 mb-2 uppercase tracking-wide">{album.date ? new Date(album.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' }) : 'Datum unbekannt'}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">{album.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}