"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Member } from "../types/supabase";
import { FaTimes, FaFutbol, FaPlus, FaTrash, FaSave, FaListUl } from "react-icons/fa";

interface Props {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

type Scorer = {
  member_id: string;
  goals: number;
  name?: string;
};

type Match = {
  id: string;
  opponent_name: string;
  home_score: number;
  away_score: number;
  goal_scorers: Scorer[];
};

export default function MatchResultModal({ eventId, eventTitle, onClose }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [opponent, setOpponent] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [currentScorers, setCurrentScorers] = useState<Scorer[]>([]);
  
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [goalCount, setGoalCount] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // 1. Mitglieder laden (NUR SICHTBARE & AKTIVE)
      const { data: membersData } = await supabase
        .from("members")
        .select("*")
        .eq("is_hidden", false) // <--- WICHTIG: Versteckte ausblenden
        .eq("status", "active") // Nur Aktive können Tore schießen
        .order("last_name", { ascending: true });

      if (membersData) setMembers(membersData as Member[]);

      const { data: matchData } = await supabase
        .from("match_results")
        .select("*")
        .eq("event_id", eventId);

      if (matchData) {
        setMatches(matchData as Match[]);
      }

      setLoading(false);
    };

    loadData();
  }, [eventId]);

  const addScorerToCurrentMatch = () => {
    if (!selectedMemberId) return;
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    const existingIndex = currentScorers.findIndex(s => s.member_id === selectedMemberId);
    const newScorers = [...currentScorers];

    if (existingIndex >= 0) {
        newScorers[existingIndex].goals += goalCount;
    } else {
        newScorers.push({ 
            member_id: selectedMemberId, 
            goals: goalCount, 
            name: `${member.first_name} ${member.last_name}` 
        });
    }
    setCurrentScorers(newScorers);
    setGoalCount(1);
    setSelectedMemberId("");
  };

  const removeScorerFromCurrentMatch = (index: number) => {
    const newScorers = [...currentScorers];
    newScorers.splice(index, 1);
    setCurrentScorers(newScorers);
  };

  const handleSaveMatch = async () => {
    if (!opponent) {
        alert("Bitte Gegner eingeben.");
        return;
    }

    const payload = {
        event_id: eventId,
        opponent_name: opponent,
        home_score: homeScore,
        away_score: awayScore,
        goal_scorers: currentScorers.map(s => ({ member_id: s.member_id, goals: s.goals }))
    };

    const { data: savedMatch, error } = await supabase.from("match_results").insert([payload]).select().single();

    if (error) {
        alert("Fehler: " + error.message);
        return;
    }

    // Automatische Anwesenheit setzen
    const uniquePlayerIds = Array.from(new Set(currentScorers.map(s => s.member_id)));
    
    for (const playerId of uniquePlayerIds) {
        const { data: existingAtt } = await supabase
            .from("attendance")
            .select("id, status")
            .eq("event_id", eventId)
            .eq("member_id", playerId)
            .maybeSingle();

        if (!existingAtt) {
            await supabase.from("attendance").insert([{ 
                event_id: eventId, member_id: playerId, status: 'active' 
            }]);
        } else if (existingAtt.status !== 'active') {
            await supabase.from("attendance").update({ status: 'active' }).eq("id", existingAtt.id);
        }
    }

    setMatches([...matches, savedMatch as Match]);
    setOpponent("");
    setHomeScore(0);
    setAwayScore(0);
    setCurrentScorers([]);
  };

  const handleDeleteMatch = async (matchId: string) => {
      if(!confirm("Spiel wirklich löschen?")) return;
      await supabase.from("match_results").delete().eq("id", matchId);
      setMatches(matches.filter(m => m.id !== matchId));
  };

  if (loading) return <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 text-white">Lade...</div>;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaFutbol className="text-primary-600" /> Ergebnisse erfassen
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{eventTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><FaTimes /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
            {matches.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2"><FaListUl/> Gespeicherte Spiele</h3>
                    {matches.map(m => (
                        <div key={m.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                            <div>
                                <span className="font-bold text-slate-900 dark:text-white">{m.home_score} : {m.away_score}</span>
                                <span className="mx-2 text-slate-400">vs.</span>
                                <span className="font-medium">{m.opponent_name}</span>
                            </div>
                            <button onClick={() => handleDeleteMatch(m.id)} className="text-red-400 hover:text-red-600"><FaTrash/></button>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-primary-600 mb-4 uppercase tracking-wider">Neues Spiel hinzufügen</h3>
                <div className="flex items-center gap-4 mb-4">
                    <input placeholder="Gegner (z.B. FC Bayern)" className="flex-grow p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white font-bold" 
                       value={opponent} onChange={e => setOpponent(e.target.value)} />
                </div>
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-center">
                        <label className="block text-[10px] uppercase text-slate-400">Wir</label>
                        <input type="number" className="w-16 p-2 text-center text-xl font-black rounded border dark:bg-slate-900 dark:text-white" 
                           value={homeScore} onChange={e => setHomeScore(parseInt(e.target.value)||0)} />
                    </div>
                    <span className="text-xl font-bold text-slate-400">:</span>
                    <div className="text-center">
                        <label className="block text-[10px] uppercase text-slate-400">Gegner</label>
                        <input type="number" className="w-16 p-2 text-center text-xl font-black rounded border dark:bg-slate-900 dark:text-white" 
                           value={awayScore} onChange={e => setAwayScore(parseInt(e.target.value)||0)} />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Torschützen (Setzt Status auf Aktiv)</label>
                    <div className="flex gap-2 mb-2">
                        <select className="flex-grow p-2 rounded border dark:bg-slate-900 dark:border-slate-600 text-sm"
                            value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)}>
                            <option value="">Spieler wählen...</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.last_name}, {m.first_name}</option>
                            ))}
                        </select>
                        <input type="number" min="1" className="w-12 p-2 rounded border dark:bg-slate-900 dark:border-slate-600 text-center" 
                            value={goalCount} onChange={e => setGoalCount(parseInt(e.target.value))} />
                        <button onClick={addScorerToCurrentMatch} disabled={!selectedMemberId} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"><FaPlus /></button>
                    </div>
                    <div className="space-y-1">
                        {currentScorers.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-white dark:bg-slate-900 p-2 rounded border dark:border-slate-700">
                                <span>{s.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-green-600">{s.goals}x</span>
                                    <button onClick={() => removeScorerFromCurrentMatch(idx)} className="text-red-400"><FaTimes/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={handleSaveMatch} className="w-full py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 shadow-sm transition-colors flex justify-center items-center gap-2">
                    <FaSave /> Spiel speichern
                </button>
            </div>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-2xl flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium">Schließen</button>
        </div>
      </div>
    </div>
  );
}