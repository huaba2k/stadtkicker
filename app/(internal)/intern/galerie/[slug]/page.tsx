import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client"; 
import { urlFor } from "@/sanity/image";
import Gallery from "@/components/Gallery"; 
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

// 1. Pfade generieren (Auch für interne Alben)
export async function generateStaticParams() {
  // Wir holen ALLE Slugs, auch die internen
  const query = `*[_type == "gallery"]{ "slug": slug.current }`;
  const galleries = await client.fetch(query);
  return galleries.map((gallery: any) => ({ slug: gallery.slug }));
}

// 2. Daten laden (OHNE den isInternal Filter)
async function getInternalGallery(slug: string) {
  const query = `*[_type == "gallery" && slug.current == $slug][0] {
    title,
    date,
    coverImage,
    isInternal,
    images
  }`;
  
  return client.fetch(query, { slug }, { next: { revalidate: 60 } });
}

export default async function InternalGalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gallery = await getInternalGallery(slug);

  if (!gallery) return notFound();

  // Bilder für die Gallery-Komponente vorbereiten
  const galleryImages = gallery.images?.map((img: any) => ({
    src: urlFor(img).width(1200).url(), 
    width: 1200, 
    height: 800, 
    alt: gallery.title,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/intern/galerie" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-8 transition-colors">
          <FaArrowLeft className="mr-2" /> Zurück zur Übersicht
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {gallery.title}
                        </h1>
                        {gallery.isInternal && (
                            <span className="bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-2 py-1 rounded uppercase">
                            Intern
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 flex items-center gap-2">
                        <FaCalendarAlt /> 
                        {gallery.date ? new Date(gallery.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Datum unbekannt'}
                    </p>
                </div>
            </div>

            {galleryImages.length > 0 ? (
                <Gallery images={galleryImages} />
            ) : (
                <div className="text-center py-12 text-slate-400">
                    Keine Bilder in diesem Album.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}