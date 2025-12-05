"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { FaSearchPlus } from "react-icons/fa"; // Lupe Icon

// WICHTIG: CSS Importieren
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Wir nutzen hier die Struktur, die wir schon im Projekt haben
type GalleryImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
};

interface Props {
  images: GalleryImage[];
}

export default function Gallery({ images }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  // Daten für die Lightbox aufbereiten
  const slides = images.map((img) => ({
    src: img.src,
    alt: img.alt || "Galeriebild",
    width: img.width,
    height: img.height,
  }));

  return (
    <>
      {/* 1. THUMBNAIL GRID (Vorschau auf der Seite) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative group aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            {/* Next.js Image für optimale Ladezeit der Vorschau */}
            <Image
              src={img.src}
              alt={img.alt || `Foto ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Overlay Effekt mit Lupe */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
               <FaSearchPlus className="text-white text-3xl drop-shadow-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. LIGHTBOX (Vollbild) */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Thumbnails, Zoom]}
        // Styling Anpassungen
        styles={{ 
            container: { backgroundColor: "rgba(0, 0, 0, .95)" },
            thumbnail: { border: "2px solid transparent" }
        }}
        // Animationen
        animation={{ fade: 300, swipe: 500 }}
        carousel={{ finite: false }} // Endloses Durchblättern
        controller={{ closeOnBackdropClick: true }} // Klick daneben schließt
      />
    </>
  );
}