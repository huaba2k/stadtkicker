"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../../lib/supabase";
import { Member } from "../../../../types/supabase";
import { client } from "../../../../sanity/client";
import { urlFor } from "../../../../sanity/image";
import { FaTrophy, FaCrown, FaNewspaper, FaArrowRight } from "react-icons/fa";

type SchafkopfStat = {
  member: Member;
  count: number;
};

export default function SchafkopfPage() {
  const [ranking, setRanking] = useState<SchafkopfStat[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // 1. Schafkopf-Events holen (Alle Zeiten)
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('category', 'schafkopf');

      const eventIds = events?.map(e => e.id) || [];

      // 2. Anwesenheiten dazu laden (Wer war da?)
      // Wir zählen 'active', 'passive' und 'helper' als Teilnahme
      const { data: attendance } = await supabase
        .from('attendance')
        .select('member_id')
        .in('event_id', eventIds)
        .in('status', ['active', 'passive', 'helper']); 

      // 3. Mitglieder laden (Nur sichtbare)
      const { data: members } = await supabase
        .from('members')
        .select('*')
        .eq('is_hidden', false);

      // 4. Ranking berechnen
      const counts: Record<string, number> = {};
      attendance?.forEach((a: any) => {
        counts[a.member_id] = (counts[a.member_id] || 0) + 1;
      });

      const rankedList = (members || [])
        .map(m => ({ member: m, count: counts[m.id] || 0 }))
        .filter(item => item.count > 0) // Nur wer schon mal da war anzeigen
        .sort((a, b) => b.count - a.count); // Meiste Einsätze oben

      setRanking(rankedList as SchafkopfStat[]);

      // 5. News laden (Sanity - Kategorie: schafkopf)
      try {
        const newsQuery = `*[_type == "post" && category == "schafkopf" && isInternal == true] | order(publishedAt desc) {
          _id, title, slug, publishedAt, mainImage,
          "excerpt": body[0].children[0].text
        }`;
        const newsData = await client.fetch(newsQuery);
        setNews(newsData);
      } catch (e) {
        console.error("Sanity Fehler:", e);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
       Lade Schafkopf-Daten...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center gap-3">
          <span className="text-emerald-600"><FaTrophy /></span> Schafkopf Runde
        </h1>
        <p className="text-slate-500 mt-2 dark:text-slate-400">Rangliste, Ergebnisse und Berichte unserer Kartler.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LINKE SPALTE: RANGLISTE */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800 flex justify-between items-center">
               <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Ewige Teilnehmer-Liste</h3>
               <FaCrown className="text-emerald-500" />
            </div>
            
            {ranking.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Noch keine Turniere gespielt.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-right">Teiln.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {ranking.map((item, index) => (
                    <tr key={item.member.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-mono text-slate-400 w-10">{index + 1}.</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {item.member.first_name} {item.member.last_name}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RECHTE SPALTE: NEWS & BERICHTE */}
        <div className="lg:col-span-2">
           <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
             <FaNewspaper className="text-slate-400"/> Berichte & Ergebnisse
           </h3>
           
           {news.length === 0 ? (
             <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-500">
               Keine Berichte vorhanden.
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {news.map((post) => (
                 <Link 
                   key={post._id} 
                   href={`/intern/news/${post.slug.current}`}
                   className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all"
                 >
                   <div className="relative h-40 bg-slate-200 dark:bg-slate-700">
                      {post.mainImage ? (
                        <Image 
                          src={urlFor(post.mainImage).width(400).height(250).url()} 
                          alt={post.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100 dark:bg-slate-800">Kein Bild</div>
                      )}
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                         <span className="text-white text-xs font-bold bg-emerald-600 px-2 py-1 rounded-md shadow-sm">
                           {new Date(post.publishedAt).toLocaleDateString('de-DE')}
                         </span>
                      </div>
                   </div>
                   <div className="p-5">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      {post.excerpt && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">{post.excerpt}...</p>
                      )}
                      <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                        Bericht lesen <FaArrowRight className="text-xs"/>
                      </span>
                   </div>
                 </Link>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
}