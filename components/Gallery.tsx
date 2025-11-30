"use client";

import { useState } from "react";
import Image from "next/image";
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from "react-icons/fa";

type GalleryImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
};

interface Props {
  images: GalleryImage[];
}

const BATCH_SIZE = 12; // Nur 12 Bilder auf einmal laden

export default function Gallery({ images }: Props) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Nur die sichtbaren Bilder rendern
  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  // --- LIGHTBOX STEUERUNG ---
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  // Tastatur-Steuerung für Lightbox
  if (typeof window !== 'undefined') {
    window.onkeydown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && lightboxIndex < images.length - 1) setLightboxIndex(lightboxIndex + 1);
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
    };
  }

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-8">
      
      {/* Raster-Ansicht */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleImages.map((img, idx) => (
          <div 
            key={idx} 
            className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
            onClick={() => openLightbox(idx)}
          >
            <Image
              src={img.src}
              alt={img.alt || `Foto ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy" // Wichtig für Performance
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
               <FaExpand className="text-white text-2xl drop-shadow-md" />
            </div>
          </div>
        ))}
      </div>

      {/* "Mehr laden" Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button 
            onClick={loadMore}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-full font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Noch {images.length - visibleCount} Fotos laden...
          </button>
        </div>
      )}

      {/* LIGHTBOX (Vollbild) */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-[110]">
            <FaTimes size={32} />
          </button>

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
             <Image
               src={images[lightboxIndex].src}
               alt="Vollbild"
               fill
               className="object-contain"
               quality={90}
               priority
             />
          </div>

          {/* Navigation */}
          {lightboxIndex > 0 && (
            <button onClick={prevImage} className="absolute left-4 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full transition-all">
              <FaChevronLeft size={24} />
            </button>
          )}
          {lightboxIndex < images.length - 1 && (
            <button onClick={nextImage} className="absolute right-4 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full transition-all">
              <FaChevronRight size={24} />
            </button>
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-mono bg-black/40 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

    </div>
  );
}