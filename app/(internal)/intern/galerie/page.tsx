import { client } from "@/sanity/client";
import { FaImages } from "react-icons/fa";
import GalleryList from "@/components/GalleryList";

// Daten laden (ISR: Cache für 60 Sekunden)
// KEIN Filter auf isInternal, damit Mitglieder ALLES sehen
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
      
      {galleries.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-500">Noch keine Alben vorhanden.</p>
        </div>
      ) : (
        // Nutzung der neuen Jahres-Liste
        <GalleryList galleries={galleries} />
      )}
    </div>
  );
}