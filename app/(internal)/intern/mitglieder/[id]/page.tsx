"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase"; 
import { 
  FaArrowLeft, 
  FaFutbol, 
  FaUserClock, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone, 
  FaGlassCheers, 
  FaRunning, 
  FaChartLine,
  FaHandsHelping,
  FaIdCard,
  FaTrophy
} from "react-icons/fa";

// Typen definieren
type MemberData = {
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  jersey_number: number | null;
  email: string | null;
  phone: string | null;
  city_of_residence: string | null;
  birth_date: string | null;
};

type HistoryItem = {
  date: Date;
  title: string;
  category: string;
  status: string;
  goals: number;
};

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [member, setMember] = useState<MemberData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // 1. Mitglied laden
      const { data: memberData, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !memberData) {
        console.error("Fehler oder kein Mitglied:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setMember(memberData);

      // 2. Anwesenheit laden
      const { data: attendance } = await supabase
        .from("attendance")
        .select(`
          status,
          events (
            id,
            title,
            start_time,
            category
          )
        `)
        .eq("member_id", id);

      // 3. Tore laden
      const { data: matches } = await supabase.from("match_results").select("*");

      // 4. Historie berechnen
      const historyData = (attendance || []).map((entry: any) => {
        const event = entry.events;
        
        if (!event) return null;

        let goals = 0;
        if (matches) {
           const eventMatches = matches.filter((m: any) => m.event_id === event.id);
           
           eventMatches.forEach((match: any) => {
               if (match.goal_scorers && Array.isArray(match.goal_scorers)) {
                  const scorerEntry = match.goal_scorers.find((s: any) => s.member_id === id);
                  if (scorerEntry) goals += scorerEntry.goals;
               }
           });
        }
        
        return {
          date: new Date(event.start_time),
          title: event.title,
          category: event.category || "general",
          status: entry.status,
          goals: goals
        };
      })
      .filter((item: any) => item !== null)
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

      setHistory(historyData as HistoryItem[]);
      setLoading(false);
    };

    loadData();
  }, [id]);

  // --- STATISTIK LOGIK ---
  const stats = {
    matches: history.filter(h => h.category === 'match' && (h.status === 'active' || h.status === 'helper')).length,
    trainings: history.filter(h => h.category === 'training' && h.status === 'active').length,
    schafkopf: history.filter(h => h.category === 'schafkopf').length,
    events: history.filter(h => 
        ['party', 'general', 'jhv', 'trip'].includes(h.category) && 
        ['active', 'passive', 'helper'].includes(h.status)
    ).length,
    helper: history.filter(h => h.status === 'helper').length,
    totalGoals: history.reduce((sum, h) => sum + h.goals, 0),
  };
  
  const goalsPerMatch = stats.matches > 0 ? (stats.totalGoals / stats.matches).toFixed(2) : "0.00";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
  
  if (notFound || !member) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
      <h2 className="text-2xl font-bold mb-2">Mitglied nicht gefunden</h2>
      <Link href="/intern/mitglieder" className="text-primary-600 hover:underline font-medium">Zurück zur Übersicht</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <Link href="/intern/mitglieder" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
          <FaArrowLeft className="mr-2" /> Zurück zur Liste
        </Link>

        {/* --- HEADER KARTE --- */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-8 items-start">
           
           <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-3xl font-bold border-4 border-white dark:border-slate-700 shadow-lg flex-shrink-0">
              {member.first_name[0]}{member.last_name[0]}
           </div>

           <div className="flex-grow w-full">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {member.first_name} {member.last_name}
                    </h1>
                    <div className="flex items-center gap-2 mb-4 mt-2">
                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${member.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'}`}>
                          {member.status === 'active' ? 'Aktiv' : 'Passiv'}
                       </span>
                       <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 uppercase">
                          {member.role === 'board' ? 'Vorstand' : member.role === 'admin' ? 'Admin' : 'Mitglied'}
                       </span>
                    </div>
                </div>
                
                {member.jersey_number && (
                  <div className="text-center self-start md:self-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                     <span className="block text-3xl font-black text-slate-300 dark:text-slate-500 leading-none">
                       {member.jersey_number}
                     </span>
                     <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
                        <FaIdCard/> Nr.
                     </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-600 dark:text-slate-300 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                 {member.city_of_residence && <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-slate-400"/> {member.city_of_residence}</div>}
                 {member.email && <div className="flex items-center gap-2"><FaEnvelope className="text-slate-400"/> {member.email}</div>}
                 {member.phone && <div className="flex items-center gap-2"><FaPhone className="text-slate-400"/> {member.phone}</div>}
                 {member.birth_date && <div className="flex items-center gap-2">🎂 {new Date(member.birth_date).toLocaleDateString('de-DE')}</div>}
              </div>
           </div>
        </div>

        {/* --- STATISTIKEN GRID --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white flex justify-center items-center gap-2">
                   <FaFutbol className="text-slate-400 text-lg" /> {stats.matches}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Spiele (+ Helfer)</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex justify-center items-center gap-2">
                   {stats.totalGoals}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Tore</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex justify-center items-center gap-2">
                   <FaChartLine className="text-blue-300 text-lg" /> {goalsPerMatch}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Ø Tore/Spiel</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white flex justify-center items-center gap-2">
                   <FaRunning className="text-orange-500 text-lg" /> {stats.trainings}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Trainings</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex justify-center items-center gap-2">
                   <FaTrophy className="text-emerald-300 text-lg" /> {stats.schafkopf}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Schafkopf</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex justify-center items-center gap-2">
                   <FaGlassCheers className="text-purple-300 text-lg" /> {stats.events}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Events</div>
            </div>
        </div>

        {/* --- HISTORIE (TIMELINE) --- */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
           <FaUserClock className="text-primary-600" /> Verlauf
        </h2>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
           {/* FIX: Overflow Container für horizontales Scrollen */}
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left min-w-[600px]">
               <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                 <tr>
                   <th className="px-6 py-3">Datum</th>
                   <th className="px-6 py-3">Event</th>
                   <th className="px-6 py-3">Art</th>
                   <th className="px-6 py-3 text-center">Status</th>
                   <th className="px-6 py-3 text-right">Tore</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                 {history.map((item, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                     <td className="px-6 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono">
                       {item.date.toLocaleDateString('de-DE')}
                     </td>
                     <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                       {item.title} 
                     </td>
                     <td className="px-6 py-3 capitalize text-slate-500">
                        {item.category === 'general' ? 'Sonstiges' : item.category === 'jhv' ? 'JHV' : item.category}
                     </td>
                     <td className="px-6 py-3 text-center">
                        {item.status === 'active' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Aktiv</span>}
                        {item.status === 'passive' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Passiv</span>}
                        {item.status === 'helper' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Helfer</span>}
                        {item.status === 'absent' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Abwesend</span>}
                        {item.status === 'excused' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Entsch.</span>}
                     </td>
                     <td className="px-6 py-3 text-right font-bold text-slate-900 dark:text-white">
                       {item.goals > 0 ? (
                         <span className="flex items-center justify-end gap-1 text-green-600 dark:text-green-400">
                           <FaFutbol className="text-xs" /> {item.goals}
                         </span>
                       ) : <span className="text-slate-300 dark:text-slate-600">-</span>}
                     </td>
                   </tr>
                 ))}
                 {history.length === 0 && (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Noch keine Einträge vorhanden.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}