"use client";

import { useState, useEffect, useRef } from "react";
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
  
  // --- SWIPE STATE ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  const loadMore = () => setVisibleCount((prev) => prev + BATCH_SIZE);
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => {
    setLightboxIndex(null);
    resetSwipe();
  };

  // --- NAVIGATION ---
  const showNext = () => {
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
    resetSwipe();
  };

  const showPrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
    resetSwipe();
  };

  const resetSwipe = () => {
    setTouchStart(null);
    setTouchCurrent(null);
    setIsDragging(false);
  };

  // --- TOUCH HANDLER ---
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchCurrent(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchCurrent(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart !== null && touchCurrent !== null) {
      const distance = touchStart - touchCurrent;
      const threshold = 50; // Mindestdistanz für Swipe

      if (distance > threshold) {
        // Nach LINKS gewischt -> Nächstes Bild
        if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
            showNext();
        } else {
            resetSwipe(); // Ende der Galerie erreicht, zurückspringen
        }
      } else if (distance < -threshold) {
        // Nach RECHTS gewischt -> Vorheriges Bild
        if (lightboxIndex !== null && lightboxIndex > 0) {
            showPrev();
        } else {
            resetSwipe(); // Anfang erreicht, zurückspringen
        }
      } else {
        // Nicht weit genug gewischt -> Reset
        resetSwipe();
      }
    } else {
        resetSwipe();
    }
  };

  // Berechne die aktuelle Verschiebung für die Animation
  const translateX = isDragging && touchStart !== null && touchCurrent !== null 
    ? touchCurrent - touchStart 
    : 0;

  // Tastatur-Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-8">
      
      {/* GRID ANSICHT (Vorschau) */}
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

      {hasMore && (
        <div className="text-center pt-4">
          <button onClick={loadMore} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-6 py-3 rounded-full font-bold shadow-sm hover:bg-slate-50 transition-all">
            Mehr laden...
          </button>
        </div>
      )}

      {/* LIGHTBOX (Vollbild) */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center touch-none">
          
          {/* Close Button */}
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white p-3 z-[120] bg-black/20 rounded-full">
            <FaTimes size={28} />
          </button>

          {/* SWIPE CONTAINER */}
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
             {/* Das Bild selbst */}
             <div 
                className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center p-2 transition-transform duration-75 ease-out"
                style={{ transform: `translateX(${translateX}px)` }} // Live-Bewegung
             >
                <Image
                  src={images[lightboxIndex].src}
                  alt="Vollbild"
                  fill
                  className="object-contain select-none pointer-events-none" // Wichtig für Swipe
                  quality={90}
                  priority
                />
             </div>
          </div>

          {/* Navigation Pfeile (Desktop) */}
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); showPrev(); }} className="hidden md:block absolute left-4 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full transition-all z-[110]">
              <FaChevronLeft size={32} />
            </button>
          )}
          {lightboxIndex < images.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); showNext(); }} className="hidden md:block absolute right-4 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full transition-all z-[110]">
              <FaChevronRight size={32} />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-sm font-bold bg-black/50 px-4 py-1.5 rounded-full pointer-events-none">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

    </div>
  );
}