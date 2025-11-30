"use client";

import { useState, useEffect } from "react";
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

const BATCH_SIZE = 12;

export default function Gallery({ images }: Props) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // State für Wischgesten
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Min. Distanz für einen Swipe (damit nicht jedes Tippen als Wischen zählt)
  const minSwipeDistance = 50; 

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  // --- TOUCH HANDLER ---
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Wisch nach Links -> Nächstes Bild
      if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
          setLightboxIndex(lightboxIndex + 1);
      }
    }
    
    if (isRightSwipe) {
      // Wisch nach Rechts -> Vorheriges Bild
      if (lightboxIndex !== null && lightboxIndex > 0) {
          setLightboxIndex(lightboxIndex - 1);
      }
    }
  };

  // Tastatur-Steuerung
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && lightboxIndex < images.length - 1) setLightboxIndex(prev => (prev as number) + 1);
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(prev => (prev as number) - 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-8">
      
      {/* Raster */}
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
              loading="lazy" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
               <FaExpand className="text-white text-2xl drop-shadow-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Mehr laden */}
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
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center touch-none" // touch-none verhindert Scrollen der Seite
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-[110]">
            <FaTimes size={32} />
          </button>

          {/* Wisch-Zone: Das Bild und der Container reagieren auf Touch */}
          <div 
            className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={(e) => e.stopPropagation()} // Klick auf Bild schließt Lightbox NICHT
          >
             <Image
               src={images[lightboxIndex].src}
               alt="Vollbild"
               fill
               className="object-contain pointer-events-none" // Wichtig für sauberes Wischen
               quality={90}
               priority
             />
          </div>

          {/* Navigation Pfeile (Desktop & Fallback) */}
          {lightboxIndex > 0 && (
            <button 
                onClick={prevImage} 
                className="absolute left-2 md:left-4 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full transition-all z-[110]"
            >
              <FaChevronLeft size={24} />
            </button>
          )}
          {lightboxIndex < images.length - 1 && (
            <button 
                onClick={nextImage} 
                className="absolute right-2 md:right-4 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full transition-all z-[110]"
            >
              <FaChevronRight size={24} />
            </button>
          )}
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm font-mono bg-black/40 px-3 py-1 rounded-full pointer-events-none">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

    </div>
  );
}