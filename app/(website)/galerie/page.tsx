import { client } from "@/sanity/client"; 
import { FaImages } from "react-icons/fa";
import GalleryList from "@/components/GalleryList"; 

// Daten laden (ISR: Cache für 60 Sekunden)
// Filter: Nur öffentliche Alben (!isInternal)
async function getGalleries() {
  const query = `*[_type == "gallery" && isInternal != true] | order(date desc) {
    _id,
    title,
    slug,
    date,
    coverImage,
    isInternal,
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

        {galleries.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <FaImages className="mx-auto text-4xl text-slate-300 mb-3"/>
            <p className="text-slate-500">Noch keine öffentlichen Alben vorhanden.</p>
          </div>
        ) : (
          // Hier nutzen wir die neue Komponente für die Jahres-Gruppierung
          <GalleryList galleries={galleries} />
        )}
      </div>
    </div>
  );
}