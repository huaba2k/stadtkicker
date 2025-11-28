"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
// Plugins
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Wir definieren, wie die Daten aussehen müssen, die wir hier reinwerfen
interface GalleryProps {
  images: {
    src: string;
    width: number;
    height: number;
    alt?: string;
  }[];
}

export default function Gallery({ images }: GalleryProps) {
  const [index, setIndex] = useState(-1);

  // Falls keine Bilder da sind, nichts oder Hinweis anzeigen
  if (!images || images.length === 0) {
    return <div className="text-slate-500 italic p-4">Keine Bilder vorhanden.</div>;
  }

  return (
    <>
      {/* Das Bilder-Raster (Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((photo, i) => (
          <div 
            key={i} 
            className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square bg-slate-100 dark:bg-slate-800"
            onClick={() => setIndex(i)}
          >
            <Image
              src={photo.src}
              alt={photo.alt || "Galeriebild"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            
            {/* Overlay Effekt */}
            <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/20 transition-colors duration-300" />
            
            {/* Lupe Icon beim Hover */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary-600 dark:text-primary-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Die Lightbox (Vollbild) */}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={images} // Hier übergeben wir die echten Bilder
        plugins={[Zoom, Thumbnails]}
        animation={{ fade: 300, swipe: 250 }}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .95)" } }}
      />
    </>
  );
}