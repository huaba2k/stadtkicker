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
  
  // --- SWIPE & ANIMATION STATE ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // Für die CSS-Transition nach dem Loslassen

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  const loadMore = () => setVisibleCount((prev) => prev + BATCH_SIZE);
  
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setCurrentTranslate(0);
    setIsDragging(false);
    setIsAnimating(false);
  };
  
  const closeLightbox = () => {
    setLightboxIndex(null);
    setCurrentTranslate(0);
  };

  // --- NAVIGATION LOGIK ---
  
  // Wechselt das Bild (mit kurzer Wartezeit für die Animation)
  const changeImage = (direction: 'next' | 'prev') => {
    if (lightboxIndex === null) return;

    const newIndex = direction === 'next' ? lightboxIndex + 1 : lightboxIndex - 1;
    
    // Bounds check
    if (newIndex < 0 || newIndex >= images.length) {
      // Ende erreicht: Zurückfedern
      setIsAnimating(true);
      setCurrentTranslate(0);
      setTimeout(() => setIsAnimating(false), 300);
      return;
    }

    // 1. Bild rausfliegen lassen
    setIsAnimating(true);
    setCurrentTranslate(direction === 'next' ? -window.innerWidth : window.innerWidth);

    // 2. Nach Animation (300ms) Index tauschen und resetten
    setTimeout(() => {
      // Index wechseln
      setLightboxIndex(newIndex);
      // Position sofort (ohne Animation) auf die andere Seite setzen oder direkt in die Mitte?
      // Wir setzen es auf 0 zurück, aber müssen kurz die Animation ausschalten, damit es nicht "zurückfliegt" sichtbar
      setIsAnimating(false); 
      setCurrentTranslate(0);
    }, 300);
  };

  // --- TOUCH HANDLER ---

  const onTouchStart = (e: React.TouchEvent) => {
    setIsAnimating(false); // Animation stopppen, damit wir direkt Kontrolle haben
    setIsDragging(true);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStart === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStart;
    setCurrentTranslate(diff); // 1:1 Bewegung
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (touchStart === null) return;

    const threshold = 80; // Ab wie viel Pixel soll gewechselt werden?

    if (currentTranslate < -threshold) {
      // Nach Links gewischt -> Nächstes Bild
      changeImage('next');
    } else if (currentTranslate > threshold) {
      // Nach Rechts gewischt -> Vorheriges Bild
      changeImage('prev');
    } else {
      // Nicht weit genug -> Zurück zur Mitte federn
      setIsAnimating(true);
      setCurrentTranslate(0);
      setTimeout(() => setIsAnimating(false), 300);
    }
    
    setTouchStart(null);
  };

  // Tastatur-Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') changeImage('next');
      if (e.key === 'ArrowLeft') changeImage('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-8">
      
      {/* GRID ANSICHT */}
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
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center touch-none"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white p-3 z-[120] bg-black/20 rounded-full">
            <FaTimes size={28} />
          </button>

          {/* SWIPE CONTAINER */}
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={(e) => e.stopPropagation()} // Klick auf Bild soll Lightbox NICHT schließen
          >
             {/* Das Bild */}
             <div 
                className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center p-2"
                style={{ 
                    transform: `translateX(${currentTranslate}px)`,
                    // Wenn wir animieren (loslassen), dauert es 300ms. Wenn wir draggen, ist es sofort (0s).
                    transition: isAnimating ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
             >
                <Image
                  src={images[lightboxIndex].src}
                  alt="Vollbild"
                  fill
                  className="object-contain select-none pointer-events-none" // Verhindert Browser-Drag
                  quality={90}
                  priority
                  draggable={false}
                />
             </div>
          </div>

          {/* Navigation Pfeile (Desktop) */}
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); changeImage('prev'); }} className="hidden md:block absolute left-4 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full transition-all z-[110]">
              <FaChevronLeft size={32} />
            </button>
          )}
          {lightboxIndex < images.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); changeImage('next'); }} className="hidden md:block absolute right-4 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full transition-all z-[110]">
              <FaChevronRight size={32} />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-sm font-bold bg-black/50 px-4 py-1.5 rounded-full pointer-events-none z-[110]">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

    </div>
  );
}