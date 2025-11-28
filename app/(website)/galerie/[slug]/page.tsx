import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "../../../../sanity/client"; 
import { urlFor } from "../../../../sanity/image";
import Gallery from "../../../../components/Gallery"; 

// 1. WICHTIG: Diese Funktion sagt Next.js, welche öffentlichen Alben es gibt.
export async function generateStaticParams() {
  // Wir holen nur öffentliche Alben (!= true deckt false und null ab)
  const query = `*[_type == "gallery" && isInternal != true]{ "slug": slug.current }`;
  const albums = await client.fetch(query);
  
  return albums.map((album: any) => ({
    slug: album.slug,
  }));
}

// 2. Das Album laden
async function getAlbum(slug: string) {
  const query = `*[_type == "gallery" && slug.current == $slug && isInternal != true][0] {
    title,
    date,
    images
  }`;
  
  // WICHTIG: Kein revalidate: 0 für den Export!
  return client.fetch(query, { slug });
}

// 3. Die Seite anzeigen
export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbum(slug);

  if (!album) {
    return notFound();
  }

  const formattedImages = album.images?.map((img: any) => ({
    src: urlFor(img).width(1200).url(),
    width: 1200, 
    height: 800, 
    alt: album.title,
  })) || [];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Zurück-Button */}
        <Link 
          href="/galerie" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zurück zur Übersicht
        </Link>

        {/* Header des Albums */}
        <div className="mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-primary-600 font-bold tracking-wider text-xs uppercase mb-2 block">
                Fotoalbum
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {album.title}
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 {album.date ? new Date(album.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Datum unbekannt'}
              </p>
            </div>
            
            {/* Info Badge */}
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-medium text-sm">
              {formattedImages.length} Fotos
            </div>
          </div>
        </div>

        {/* Galerie Komponente */}
        <Gallery images={formattedImages} />
        
      </div>
    </div>
  );
}