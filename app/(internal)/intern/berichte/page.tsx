"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Member } from "../../../../types/supabase";
import { FaPrint, FaTrophy, FaMedal, FaChartPie, FaUserPlus, FaCalendarCheck } from "react-icons/fa";

// Typen für die Statistik
type MatchStats = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};

type Jubilee = {
  member: Member;
  years: number;
};

type Scorer = {
  name: string;
  goals: number;
};

type Attendee = {
  name: string;
  count: number;
};

export default function BerichtePage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  
  // Daten States
  const [matchStats, setMatchStats] = useState<MatchStats>({ played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 });
  const [topScorers, setTopScorers] = useState<Scorer[]>([]);
  const [topAttendance, setTopAttendance] = useState<Attendee[]>([]);
  const [jubilees, setJubilees] = useState<Jubilee[]>([]);
  const [newMembers, setNewMembers] = useState<Member[]>([]);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      console.log(`Lade Bericht für Jahr ${selectedYear}...`);
      
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      // 1. Events & Matches im Jahr holen
      const { data: events } = await supabase
        .from('events')
        .select('id, start_time, category')
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      const eventIds = events?.map(e => e.id) || [];
      const matchEventIds = events?.filter(e => e.category === 'match').map(e => e.id) || [];

      // 2. Match Ergebnisse laden
      const { data: matches } = await supabase
        .from('match_results')
        .select('*')
        .in('event_id', matchEventIds);

      // 3. Mitglieder laden (Alle SICHTBAREN)
      const { data: allMembers } = await supabase
        .from('members')
        .select('*')
        .eq('is_hidden', false)
        .order('last_name', { ascending: true });
      
      const memberList = (allMembers as Member[]) || [];

      // 4. Anwesenheit laden
      const { data: attendance } = await supabase
        .from('attendance')
        .select('member_id, status')
        .in('event_id', eventIds)
        .in('status', ['active', 'passive', 'helper']);

      // --- BERECHNUNGEN ---

      // A. Sportliche Bilanz
      let stats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
      const scorerMap: Record<string, number> = {};

      if (matches) {
        stats.played = matches.length;
        matches.forEach((m: any) => {
          stats.goalsFor += m.home_score;
          stats.goalsAgainst += m.away_score;
          if (m.home_score > m.away_score) stats.won++;
          else if (m.home_score === m.away_score) stats.drawn++;
          else stats.lost++;

          if (m.goal_scorers && Array.isArray(m.goal_scorers)) {
            m.goal_scorers.forEach((s: any) => {
               scorerMap[s.member_id] = (scorerMap[s.member_id] || 0) + s.goals;
            });
          }
        });
      }
      setMatchStats(stats);

      // B. Top Torschützen
      const scorersList = Object.entries(scorerMap)
        .map(([id, goals]) => {
           const m = memberList.find(mem => mem.id === id);
           return { name: m ? `${m.last_name} ${m.first_name}` : 'Unbekannt', goals };
        })
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 5);
      setTopScorers(scorersList);

      // C. Trainingsweltmeister
      const attendanceMap: Record<string, number> = {};
      attendance?.forEach((a: any) => {
         attendanceMap[a.member_id] = (attendanceMap[a.member_id] || 0) + 1;
      });
      
      const attendanceList = Object.entries(attendanceMap)
        .map(([id, count]) => {
            const m = memberList.find(mem => mem.id === id);
            return { name: m ? `${m.last_name} ${m.first_name}` : 'Unbekannt', count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopAttendance(attendanceList);

      // D. Jubiläen & Neuzugänge (LOGIK UPDATE)
      const jubis: Jubilee[] = [];
      const newbies: Member[] = [];

      memberList.forEach((m) => {
         // Eintrittsdatum prüfen
         const entryDateString = m.joined_at || m.created_at;
         
         if (entryDateString) {
             const joinYear = new Date(entryDateString).getFullYear();
             const years = selectedYear - joinYear;

             // Debugging in der Konsole (F12)
             // console.log(`${m.last_name}: Eintritt ${joinYear} -> ${years} Jahre`);

             // Neuzugang?
             if (joinYear === selectedYear) {
                 newbies.push(m);
             }

             // Jubiläum? (10, 20, 25, 30, 40, 50...)
             if (years > 0 && (years % 10 === 0 || years === 25)) {
                jubis.push({ member: m, years });
             }
         }
      });

      setJubilees(jubis.sort((a, b) => b.years - a.years));
      setNewMembers(newbies);

      setLoading(false);
    };

    loadReportData();
  }, [selectedYear]);

  const handlePrint = () => window.print();

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      
      {/* Header & Steuerung */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Jahreschronik</h1>
        <div className="flex items-center gap-4">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-bold cursor-pointer"
          >
            {[selectedYear, selectedYear-1, selectedYear-2, selectedYear-3].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button 
            onClick={handlePrint} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm"
          >
            <FaPrint /> Als PDF drucken
          </button>
        </div>
      </div>

      {/* --- BERICHT (Sichtbar am Schirm & Druck) --- */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-xl shadow-xl print:shadow-none print:p-0 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 print:border-0 print:text-black print:bg-white">
        
        {/* Titelblatt */}
        <div className="text-center border-b-2 border-slate-900 dark:border-slate-200 pb-6 mb-8 print:border-black">
           <h2 className="text-4xl font-black uppercase tracking-widest mb-2">Saisonbericht {selectedYear}</h2>
           <p className="text-xl text-slate-500 dark:text-slate-400 print:text-slate-600">Garchinger Stadtkicker e.V.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:grid-cols-2 print:gap-8">
           
           {/* 1. Sportliche Bilanz */}
           <section className="break-inside-avoid">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 print:border-slate-300">
                 <FaChartPie className="text-blue-600"/> Sportliche Bilanz
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center print:border print:bg-transparent">
                    <span className="block text-3xl font-bold">{matchStats.played}</span>
                    <span className="text-xs uppercase text-slate-500">Spiele</span>
                 </div>
                 <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center print:border print:bg-transparent">
                    <span className="block text-3xl font-bold text-green-600 print:text-black">{matchStats.won}</span>
                    <span className="text-xs uppercase text-green-700 print:text-slate-600">Siege</span>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center print:border print:bg-transparent">
                    <span className="block text-3xl font-bold">{matchStats.drawn}</span>
                    <span className="text-xs uppercase text-slate-500">Remis</span>
                 </div>
                 <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center print:border print:bg-transparent">
                    <span className="block text-3xl font-bold text-red-600 print:text-black">{matchStats.lost}</span>
                    <span className="text-xs uppercase text-red-700 print:text-slate-600">Niederlagen</span>
                 </div>
              </div>
              <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg print:border print:bg-transparent">
                 <span className="font-bold">Torverhältnis:</span> {matchStats.goalsFor} : {matchStats.goalsAgainst}
              </div>
           </section>

           {/* 2. Ehrungen / Jubiläen */}
           <section className="break-inside-avoid">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 print:border-slate-300">
                 <FaMedal className="text-amber-500"/> Ehrungen & Jubiläen
              </h3>
              {jubilees.length === 0 ? <p className="text-slate-500 italic">Keine Jubiläen in diesem Jahr.</p> : (
                 <ul className="space-y-3">
                    {jubilees.map((j, i) => (
                       <li key={i} className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-900/10 rounded border border-amber-100 dark:border-amber-800 print:border-slate-300 print:bg-transparent">
                          <span className="font-bold">{j.member.first_name} {j.member.last_name}</span>
                          <span className="text-sm font-mono bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-1 rounded print:bg-slate-200 print:text-black">
                             {j.years} Jahre
                          </span>
                       </li>
                    ))}
                 </ul>
              )}
           </section>

           {/* 3. Top Torschützen */}
           <section className="break-inside-avoid">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 print:border-slate-300">
                 <FaTrophy className="text-yellow-500"/> Top Torschützen {selectedYear}
              </h3>
              <ol className="space-y-2">
                 {topScorers.map((s, i) => (
                    <li key={i} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1 last:border-0">
                       <span className="flex items-center gap-2">
                          <span className={`w-5 h-5 flex items-center justify-center text-xs rounded-full ${i===0?'bg-yellow-400 text-white print:text-black print:bg-slate-200':i===1?'bg-slate-300 text-white print:text-black print:bg-slate-200':'bg-orange-400 text-white print:text-black print:bg-slate-200'}`}>{i+1}</span>
                          {s.name}
                       </span>
                       <span className="font-bold">{s.goals}</span>
                    </li>
                 ))}
                 {topScorers.length === 0 && <p className="text-slate-500 italic">Keine Tore verzeichnet.</p>}
              </ol>
           </section>

           {/* 4. Trainingsfleißigste */}
           <section className="break-inside-avoid">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 print:border-slate-300">
                 <FaCalendarCheck className="text-green-600"/> Meiste Anwesenheit
              </h3>
              <ol className="space-y-2">
                 {topAttendance.map((s, i) => (
                    <li key={i} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1 last:border-0">
                       <span className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{i+1}.</span>
                          {s.name}
                       </span>
                       <span className="font-mono text-slate-600 dark:text-slate-400">{s.count}x</span>
                    </li>
                 ))}
                 {topAttendance.length === 0 && <p className="text-slate-500 italic">Keine Daten verfügbar.</p>}
              </ol>
           </section>

        </div>

        {/* 5. Neuzugänge Footer */}
        <div className="mt-12 pt-8 border-t-2 border-slate-100 dark:border-slate-800 print:border-slate-300 break-inside-avoid">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaUserPlus className="text-teal-500"/> Herzlich Willkommen (Neuzugänge {selectedYear})
           </h3>
           {newMembers.length === 0 ? <p className="text-slate-500 italic">Keine Neuzugänge in diesem Jahr.</p> : (
              <div className="flex flex-wrap gap-2">
                 {newMembers.map(m => (
                    <span key={m.id} className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-sm border border-teal-100 dark:border-teal-800 print:border-slate-400 print:text-black">
                       {m.first_name} {m.last_name}
                    </span>
                 ))}
              </div>
           )}
        </div>

        <div className="mt-12 text-center text-xs text-slate-400 print:block hidden">
            Automatisch generierter Bericht via Vereins-App
        </div>

      </div>
    </div>
  );
}