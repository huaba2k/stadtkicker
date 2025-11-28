"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";
import { FaFutbol, FaArrowLeft } from "react-icons/fa";

export default function TorschuetzenPage() {
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1. Mitglieder laden (NUR SICHTBARE, damit keine Admin-Accounts auftauchen)
      const { data: members } = await supabase
        .from('members')
        .select('id, first_name, last_name, jersey_number, stats_goals, stats_games')
        .eq('is_hidden', false); // WICHTIG: Filtert Geister-Accounts
      
      // 2. Match-Ergebnisse laden (Live-Tore)
      const { data: matches } = await supabase.from('match_results').select('goal_scorers');

      // 3. Spiele zählen (Nur echte Matches, kein Training!)
      const { data: matchAttendance } = await supabase
        .from('attendance')
        .select('member_id, events!inner(category)')
        .eq('status', 'active') // Nur wer gespielt hat
        .eq('events.category', 'match'); // Nur Spiele zählen!

      // --- LIVE BERECHNUNG ---
      const liveStats: Record<string, { goals: number, games: number }> = {};

      // A. Tore summieren
      if (matches) {
        matches.forEach((match: any) => {
           const scorersList = match.goal_scorers || [];
           scorersList.forEach((s: any) => {
              if (!liveStats[s.member_id]) liveStats[s.member_id] = { goals: 0, games: 0 };
              liveStats[s.member_id].goals += s.goals;
           });
        });
      }

      // B. Spiele summieren
      if (matchAttendance) {
          matchAttendance.forEach((att: any) => {
             const mId = att.member_id;
             if (!liveStats[mId]) liveStats[mId] = { goals: 0, games: 0 };
             liveStats[mId].games += 1;
          });
      }

      // C. Zusammenführen: Startwert (Excel/Profil) + Live-Wert
      const result = (members || []).map(m => {
         const manualGoals = m.stats_goals || 0;
         const manualGames = m.stats_games || 0;
         
         const liveGoals = liveStats[m.id]?.goals || 0;
         const liveGames = liveStats[m.id]?.games || 0;
         
         return {
            ...m,
            total_goals: manualGoals + liveGoals,
            total_games: manualGames + liveGames
         };
      })
      .filter(m => m.total_goals > 0) // Nur Spieler mit Toren anzeigen
      .sort((a, b) => {
          // 1. Priorität: Mehr Tore
          if (b.total_goals !== a.total_goals) return b.total_goals - a.total_goals;
          // 2. Priorität: Weniger Spiele (bessere Quote)
          return a.total_games - b.total_games;
      });

      setScorers(result);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const getRatio = (goals: number, games: number) => {
    if (!games || games === 0) return "0.00";
    return (goals / games).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <Link href="/intern" className="text-primary-600 hover:underline text-sm mb-2 inline-flex items-center gap-1">
          <FaArrowLeft /> Zurück zum Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <FaFutbol className="text-primary-600" /> Torschützenkönige
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Ewige Liste (Importierte Daten + Live-Spiele).
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">Lade Statistik...</div>
        ) : scorers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Noch keine Tore eingetragen. Zeit für ein Spiel!
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-xs border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 w-16 text-center">#</th>
                <th className="px-6 py-4">Spieler</th>
                <th className="px-6 py-4 text-center hidden sm:table-cell">Spiele</th>
                <th className="px-6 py-4 text-center hidden sm:table-cell">Quote</th>
                <th className="px-6 py-4 text-right">Tore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {scorers.map((player, index) => (
                <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                  
                  <td className="px-6 py-4 text-center">
                    <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full font-bold text-sm shadow-sm
                      ${index === 0 ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200' : 
                        index === 1 ? 'bg-slate-300 text-slate-800 ring-2 ring-slate-200' : 
                        index === 2 ? 'bg-orange-400 text-orange-900 ring-2 ring-orange-200' : 
                        'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
                    `}>
                      {index + 1}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {player.first_name} {player.last_name}
                    </div>
                    {player.jersey_number && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded border border-slate-200 dark:border-slate-600">
                          #{player.jersey_number}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300 hidden sm:table-cell font-mono">
                    {player.total_games}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-500 hidden sm:table-cell font-mono text-xs">
                    Ø {getRatio(player.total_goals, player.total_games)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="text-2xl font-black text-primary-600 dark:text-primary-400 tabular-nums tracking-tight group-hover:scale-110 inline-block transition-transform">
                      {player.total_goals}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}