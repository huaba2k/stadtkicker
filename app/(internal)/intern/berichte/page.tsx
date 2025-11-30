"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Member } from "../../../../types/supabase";
import { FaPrint, FaTrophy, FaMedal, FaChartPie, FaUserPlus, FaCalendarCheck, FaStickyNote, FaFutbol, FaBirthdayCake, FaUserMinus, FaUsers } from "react-icons/fa";

// Typen
type MatchStats = { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; };
type Jubilee = { member: Member; years: number; };
type Scorer = { name: string; goals: number; };
type Attendee = { name: string; count: number; };
type MatchDetail = { date: Date; opponent: string; result: string; scorers: string[]; };
type BirthdayKid = { member: Member; age: number; date: Date };

export default function BerichtePage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  
  // Daten States
  const [matchStats, setMatchStats] = useState<MatchStats>({ played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 });
  const [matchList, setMatchList] = useState<MatchDetail[]>([]);
  const [topScorers, setTopScorers] = useState<Scorer[]>([]);
  const [topAttendance, setTopAttendance] = useState<Attendee[]>([]);
  const [jubilees, setJubilees] = useState<Jubilee[]>([]);
  const [newMembers, setNewMembers] = useState<Member[]>([]);
  const [leftMembers, setLeftMembers] = useState<Member[]>([]);
  const [roundBirthdays, setRoundBirthdays] = useState<BirthdayKid[]>([]);
  const [notes, setNotes] = useState("");
  const [totalGatherings, setTotalGatherings] = useState(0); // NEU: Summe Zusammenkünfte

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      // 1. Events & Matches im Jahr holen
      const { data: events } = await supabase
        .from('events')
        .select('id, title, start_time, category')
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time');

      const eventIds = events?.map(e => e.id) || [];
      const matchEventIds = events?.filter(e => e.category === 'match').map(e => e.id) || [];

      // NEU: Zusammenkünfte zählen (Alles außer Schafkopf)
      const gatheringsCount = events?.filter(e => e.category !== 'schafkopf').length || 0;
      setTotalGatherings(gatheringsCount);

      // 2. Match Ergebnisse laden
      const { data: matches } = await supabase
        .from('match_results')
        .select('*')
        .in('event_id', matchEventIds);

      // 3. Mitglieder laden (Alle, auch inaktive für Historie, aber keine versteckten)
      const { data: allMembers } = await supabase
        .from('members')
        .select('*')
        .eq('is_hidden', false)
        .order('last_name', { ascending: true });
      
      const memberList = (allMembers as Member[]) || [];

      // 4. Anwesenheit laden (für Trainingsweltmeister)
      const { data: attendance } = await supabase
        .from('attendance')
        .select('member_id, status')
        .in('event_id', eventIds)
        .in('status', ['active', 'passive', 'helper']);

      // 5. Notizen laden
      const { data: noteData } = await supabase.from('report_notes').select('content').eq('year', selectedYear).maybeSingle();
      setNotes(noteData?.content || "");

      // --- BERECHNUNGEN ---
      
      // A. Sportliche Bilanz
      let stats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
      const scorerMap: Record<string, number> = {};
      const detailedMatches: MatchDetail[] = [];

      if (matches) {
        stats.played = matches.length;
        const sortedMatches = matches.map(m => {
            const evt = events?.find(e => e.id === m.event_id);
            return { ...m, date: evt ? new Date(evt.start_time) : new Date() };
        }).sort((a, b) => a.date.getTime() - b.date.getTime());

        sortedMatches.forEach((m: any) => {
          stats.goalsFor += m.home_score;
          stats.goalsAgainst += m.away_score;
          if (m.home_score > m.away_score) stats.won++;
          else if (m.home_score === m.away_score) stats.drawn++;
          else stats.lost++;

          const matchScorers: string[] = [];
          if (m.goal_scorers && Array.isArray(m.goal_scorers)) {
            m.goal_scorers.forEach((s: any) => {
               scorerMap[s.member_id] = (scorerMap[s.member_id] || 0) + s.goals;
               const mem = memberList.find(x => x.id === s.member_id);
               if(mem) matchScorers.push(`${mem.last_name} (${s.goals})`);
            });
          }
          detailedMatches.push({ date: m.date, opponent: m.opponent_name, result: `${m.home_score} : ${m.away_score}`, scorers: matchScorers });
        });
      }
      setMatchStats(stats);
      setMatchList(detailedMatches);

      // B. Top Scorer
      const scorersList = Object.entries(scorerMap).map(([id, goals]) => {
           const m = memberList.find(mem => mem.id === id);
           return { name: m ? `${m.last_name} ${m.first_name}` : 'Unbekannt', goals };
        }).sort((a, b) => b.goals - a.goals).slice(0, 10);
      setTopScorers(scorersList);

      // C. Anwesenheit
      const attendanceMap: Record<string, number> = {};
      attendance?.forEach((a: any) => { attendanceMap[a.member_id] = (attendanceMap[a.member_id] || 0) + 1; });
      const attendanceList = Object.entries(attendanceMap).map(([id, count]) => {
            const m = memberList.find(mem => mem.id === id);
            if (!m) return null;
            return { name: `${m.last_name} ${m.first_name}`, count };
        }).filter(x => x !== null).sort((a: any, b: any) => b.count - a.count).slice(0, 10);
      setTopAttendance(attendanceList as Attendee[]);

      // D. Personalien
      const jubis: Jubilee[] = [];
      const newbies: Member[] = [];
      const leavers: Member[] = [];
      const bdayKids: BirthdayKid[] = [];

      memberList.forEach((m) => {
         const joinDateStr = m.joined_at || m.created_at;
         if (joinDateStr) {
             const joinYear = new Date(joinDateStr).getFullYear();
             const years = selectedYear - joinYear;
             if (joinYear === selectedYear) newbies.push(m);
             if (years > 0 && (years % 10 === 0 || years === 25)) jubis.push({ member: m, years });
         }
         if (m.left_at) {
             const leftYear = new Date(m.left_at).getFullYear();
             if (leftYear === selectedYear) leavers.push(m);
         }
         if (m.birth_date) {
             const bday = new Date(m.birth_date);
             const ageThisYear = selectedYear - bday.getFullYear();
             const bdayDate = new Date(selectedYear, bday.getMonth(), bday.getDate());
             if (ageThisYear >= 50 && ageThisYear % 10 === 0) {
                 bdayKids.push({ member: m, age: ageThisYear, date: bdayDate });
             }
         }
      });

      setJubilees(jubis.sort((a, b) => b.years - a.years));
      setNewMembers(newbies);
      setLeftMembers(leavers);
      setRoundBirthdays(bdayKids.sort((a, b) => a.date.getTime() - b.date.getTime()));

      setLoading(false);
    };
    loadReportData();
  }, [selectedYear]);

  const saveNotes = async () => {
      const { error } = await supabase.from('report_notes').upsert({ year: selectedYear, content: notes }, { onConflict: 'year' });
      if (error) alert("Fehler: " + error.message); else alert("Gespeichert!");
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="p-12 text-center text-slate-500">Lade Chronik...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      
      {/* Header & Steuerung */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Jahreschronik</h1>
        <div className="flex items-center gap-4">
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="p-2 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-bold cursor-pointer">
            {[selectedYear, selectedYear-1, selectedYear-2, selectedYear-3].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm">
            <FaPrint /> Als PDF drucken
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-xl shadow-xl print:shadow-none print:p-0 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 print:border-0 print:text-black print:bg-white">
        
        {/* Titelblatt */}
        <div className="text-center border-b-4 border-slate-900 dark:border-slate-200 pb-6 mb-12 print:border-black">
           <h2 className="text-5xl font-black uppercase tracking-widest mb-2">Saison {selectedYear}</h2>
           <p className="text-2xl text-slate-500 dark:text-slate-400 print:text-slate-600">Garchinger Stadtkicker e.V.</p>
        </div>

        {/* NEU: Zusammenkünfte */}
        <section className="mb-8 text-center break-inside-avoid">
            <div className="inline-block p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 print:border-slate-400">
                 <span className="block text-5xl font-black text-slate-900 dark:text-white mb-2">{totalGatherings}</span>
                 <span className="text-sm uppercase font-bold text-slate-500 flex items-center justify-center gap-2">
                    <FaUsers /> Zusammenkünfte (Gesamt)
                 </span>
                 <span className="text-xs text-slate-400 mt-1 block">(Training, Spiele, Feiern)</span>
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:grid-cols-2 print:gap-8">
           
           {/* 1. Sportliche Bilanz */}
           <section className="break-inside-avoid">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 print:border-slate-300">
                 <FaChartPie className="text-blue-600"/> Sportliche Bilanz
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center print:border print:bg-transparent"><span className="block text-3xl font-bold">{matchStats.played}</span><span className="text-xs uppercase text-slate-500">Spiele</span></div>
                 <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center print:border print:bg-transparent"><span className="block text-3xl font-bold text-green-600 print:text-black">{matchStats.won}</span><span className="text-xs uppercase text-green-700 print:text-slate-600">Siege</span></div>
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center print:border print:bg-transparent"><span className="block text-3xl font-bold">{matchStats.drawn}</span><span className="text-xs uppercase text-slate-500">Remis</span></div>
                 <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center print:border print:bg-transparent"><span className="block text-3xl font-bold text-red-600 print:text-black">{matchStats.lost}</span><span className="text-xs uppercase text-red-700 print:text-slate-600">Niederlagen</span></div>
              </div>
              <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg print:border print:bg-transparent">
                 <span className="font-bold">Torverhältnis:</span> {matchStats.goalsFor} : {matchStats.goalsAgainst}
              </div>
           </section>

           {/* 2. Ehrungen / Jubiläen (Dark Mode Fix) */}
           <section className="break-inside-avoid">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 print:border-slate-300">
                 <FaMedal className="text-amber-500"/> Ehrungen & Jubiläen
              </h3>
              {jubilees.length === 0 ? <p className="text-slate-500 italic">Keine Jubiläen.</p> : (
                 <ul className="space-y-3">
                    {jubilees.map((j, i) => (
                       <li key={i} className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-100 dark:border-amber-900/50 print:border-slate-300 print:bg-transparent">
                          <span className="font-bold dark:text-amber-100">{j.member.first_name} {j.member.last_name}</span>
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
                 <FaTrophy className="text-yellow-500"/> Top Torschützen
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
                 {topScorers.length === 0 && <p className="text-slate-500 italic">Keine Tore.</p>}
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
                 {topAttendance.length === 0 && <p className="text-slate-500 italic">Keine Daten.</p>}
              </ol>
           </section>
        </div>

        {/* GEBURTSTAGE & PERSONAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:grid-cols-2 print:gap-8 mt-12">
             
             {/* 6. Runde Geburtstage (Dark Mode Fix) */}
             <section className="break-inside-avoid">
                <h3 className="text-xl font-bold mb-4 border-b pb-2 flex gap-2"><FaBirthdayCake className="text-pink-500"/> Runde Geburtstage</h3>
                {roundBirthdays.length === 0 ? <p className="text-sm text-slate-400">Keine runden Geburtstage.</p> : (
                    <ul className="space-y-3">{roundBirthdays.map((b, i) => (
                        <li key={i} className="flex justify-between items-center p-2 bg-pink-50 dark:bg-pink-900/20 rounded border border-pink-100 dark:border-pink-900/50 print:border-slate-300 print:bg-transparent">
                            <span className="dark:text-pink-100">{b.member.first_name} {b.member.last_name} ({b.date.toLocaleDateString('de-DE', {day: '2-digit', month:'2-digit'})})</span>
                            <span className="text-xs font-bold bg-pink-200 text-pink-800 px-2 py-1 rounded print:bg-slate-200 print:text-black">{b.age}.</span>
                        </li>
                    ))}</ul>
                )}
             </section>

             {/* 7. Personal (Mit Datum) */}
             <section className="break-inside-avoid">
                <h3 className="text-xl font-bold mb-4 border-b pb-2 flex gap-2"><FaUserPlus className="text-teal-500"/> Personal</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400 mb-2">Neuzugänge</h4>
                        {newMembers.length === 0 ? <span className="text-xs text-slate-400">-</span> : (
                            <ul className="space-y-2">
                                {newMembers.map(m => (
                                    <li key={m.id} className="flex justify-between text-sm border-b border-dotted border-slate-200 dark:border-slate-800 pb-1">
                                        <span>{m.first_name} {m.last_name}</span>
                                        <span className="text-slate-500 font-mono text-xs">
                                            {m.joined_at ? new Date(m.joined_at).toLocaleDateString('de-DE') : ''}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2 flex gap-2 items-center"><FaUserMinus/> Abgänge</h4>
                        {leftMembers.length === 0 ? <span className="text-xs text-slate-400">-</span> : (
                            <ul className="space-y-2">
                                {leftMembers.map(m => (
                                    <li key={m.id} className="flex justify-between text-sm border-b border-dotted border-slate-200 dark:border-slate-800 pb-1">
                                        <span>{m.first_name} {m.last_name}</span>
                                        <span className="text-slate-500 font-mono text-xs">
                                            {m.left_at ? new Date(m.left_at).toLocaleDateString('de-DE') : ''}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
             </section>
        </div>

        {/* 8. NOTIZEN */}
        <div className="mt-12 break-inside-avoid">
            <h3 className="text-xl font-bold mb-4 border-b pb-2 flex gap-2"><FaStickyNote className="text-slate-400"/> Anmerkungen & Highlight</h3>
            <textarea 
                className="w-full p-4 border rounded-xl bg-yellow-50 dark:bg-slate-800 dark:border-slate-700 min-h-[150px] print:border-0 print:resize-none print:p-0 print:bg-transparent"
                placeholder="Hier können Highlights des Jahres, Anekdoten oder Berichtstexte notiert werden..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-2 text-right print:hidden">
                <button onClick={saveNotes} className="text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1 rounded">Speichern</button>
            </div>
        </div>

        {/* 9. MATCH LISTE */}
        <section className="mt-12 break-inside-avoid">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2"><FaFutbol className="text-slate-600"/> Spiele im Detail</h3>
            {matchList.length === 0 ? <p className="italic text-slate-500">Keine Spiele erfasst.</p> : (
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 print:bg-slate-200">
                        <tr><th className="p-2">Datum</th><th className="p-2">Gegner</th><th className="p-2 text-center">Erg.</th><th className="p-2">Torschützen</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {matchList.map((m, i) => (
                            <tr key={i} className="break-inside-avoid">
                                <td className="p-2 whitespace-nowrap text-slate-500">{m.date.toLocaleDateString('de-DE')}</td>
                                <td className="p-2 font-bold">{m.opponent}</td>
                                <td className="p-2 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800/50">{m.result}</td>
                                <td className="p-2 text-xs text-slate-600 dark:text-slate-400">{m.scorers.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>

        <div className="mt-12 text-center text-xs text-slate-400 print:block hidden">
            Automatisch generierter Bericht via Vereins-App
        </div>

      </div>
    </div>
  );
}