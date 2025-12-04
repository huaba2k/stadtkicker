"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { FaChevronDown, FaChevronUp, FaCalendarAlt, FaNewspaper } from "react-icons/fa";

export default function NewsList({ posts }: { posts: any[] }) {
  // 1. Wir gruppieren die Posts nach Jahr
  const postsByYear = posts.reduce((acc: any, post: any) => {
    const year = new Date(post.publishedAt).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  // Sortierte Jahre (Neuestes zuerst)
  const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));
  const currentYear = new Date().getFullYear().toString();

  // State für aufgeklappte Jahre (Aktuelles Jahr immer offen)
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({ [currentYear]: true });

  const toggleYear = (year: string) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  return (
    <div className="space-y-12">
      {years.map((year) => (
        <div key={year} className="relative">
          
          {/* JAHRES-ÜBERSCHRIFT (Klickbar für ältere Jahre) */}
          <button 
            onClick={() => toggleYear(year)}
            className={`w-full flex items-center justify-between py-4 border-b-2 ${year === currentYear ? 'border-primary-600' : 'border-slate-200 dark:border-slate-700'} group transition-colors`}
          >
             <div className="flex items-center gap-3">
                <span className={`text-3xl font-black ${year === currentYear ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary-600'}`}>
                  {year}
                </span>
                <span className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500 font-medium">
                  {postsByYear[year].length} Artikel
                </span>
             </div>
             {year !== currentYear && (
               <div className="text-slate-400 group-hover:text-primary-600">
                  {openYears[year] ? <FaChevronUp/> : <FaChevronDown/>}
               </div>
             )}
          </button>

          {/* LISTE DER ARTIKEL */}
          <div className={`transition-all duration-500 overflow-hidden ${openYears[year] ? 'max-h-[5000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {postsByYear[year].map((post: any) => (
                <Link 
                  key={post._id} 
                  // Intelligenter Link: Wenn intern markiert, gehe zu /intern/news, sonst /news
                  href={post.isInternal ? `/intern/news/${post.slug.current}` : `/news/${post.slug.current}`}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
                >
                  {/* Bild */}
                  <div className="relative h-52 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    {post.mainImage ? (
                      <Image 
                        src={urlFor(post.mainImage).width(600).height(400).url()} 
                        alt={post.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                         <FaNewspaper size={40} className="opacity-20" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      {post.isInternal && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider">
                          Intern
                        </span>
                      )}
                      {post.category && post.category !== 'allgemein' && (
                        <span className="bg-slate-900/80 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider backdrop-blur-sm">
                          {post.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-xs text-slate-500 mb-2 font-mono flex items-center gap-2">
                       <FaCalendarAlt className="w-3 h-3"/>
                       {new Date(post.publishedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}
                    </div>
                    
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    {post.excerpt && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">
                        {post.excerpt}...
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 text-sm text-primary-600 font-bold group-hover:translate-x-1 transition-transform">
                      Artikel lesen →
                    </div>
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