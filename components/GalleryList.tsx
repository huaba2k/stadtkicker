"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { FaChevronDown, FaChevronUp, FaCalendarAlt, FaImages } from "react-icons/fa";

export default function GalleryList({ galleries }: { galleries: any[] }) {
  // 1. Nach Jahr gruppieren
  const galleriesByYear = galleries.reduce((acc: any, item: any) => {
    const year = new Date(item.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  // Jahre sortieren (Neuestes zuerst)
  const years = Object.keys(galleriesByYear).sort((a, b) => parseInt(b) - parseInt(a));
  const currentYear = new Date().getFullYear().toString();

  // State (Aktuelles Jahr offen)
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({ [currentYear]: true });

  const toggleYear = (year: string) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  return (
    <div className="space-y-12">
      {years.map((year) => (
        <div key={year} className="relative">
          
          {/* JAHRES-LEISTE */}
          <button 
            onClick={() => toggleYear(year)}
            className={`w-full flex items-center justify-between py-4 border-b-2 ${year === currentYear ? 'border-primary-600' : 'border-slate-200 dark:border-slate-700'} group transition-colors`}
          >
             <div className="flex items-center gap-3">
                <span className={`text-3xl font-black ${year === currentYear ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary-600'}`}>
                  {year}
                </span>
                <span className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500 font-medium">
                  {galleriesByYear[year].length} Alben
                </span>
             </div>
             <div className="text-slate-400 group-hover:text-primary-600">
                {openYears[year] ? <FaChevronUp/> : <FaChevronDown/>}
             </div>
          </button>

          {/* GRID */}
          <div className={`transition-all duration-500 overflow-hidden ${openYears[year] ? 'max-h-[5000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleriesByYear[year].map((album: any) => (
                <Link 
                  key={album._id} 
                  // Smart-Link: Wenn wir im internen Bereich sind (z.B. weil das Album intern ist), nutzen wir den internen Pfad?
                  // Wir verlinken hier standardmäßig auf /galerie (öffentlich) oder /intern/galerie (intern) je nach Kontext.
                  // Einfachheitshalber nutzen wir hier eine Logik-Weiche:
                  href={album.isInternal ? `/intern/galerie/${album.slug.current}` : `/galerie/${album.slug.current}`}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
                >
                  <div className="relative h-64 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    {album.coverImage ? (
                      <Image 
                        src={urlFor(album.coverImage).width(600).height(400).url()} 
                        alt={album.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">Kein Bild</div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {album.isInternal && (
                            <span className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider">Intern</span>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                       <span className="text-white text-xs font-bold bg-primary-600 px-2 py-1 rounded shadow-sm flex items-center gap-1 w-fit">
                         <FaImages /> {album.imageCount || 0} Fotos
                       </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wide flex items-center gap-2">
                       <FaCalendarAlt />
                       {new Date(album.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      {album.title}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}