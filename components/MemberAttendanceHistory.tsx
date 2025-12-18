"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaCheck, FaTimes, FaClock, FaQuestion } from "react-icons/fa";

type AttendanceRecord = {
  id: string;
  status: 'present' | 'absent' | 'excused' | 'late' | 'unknown';
  date: string; // Das Datum des spezifischen Termins
  events: {
    title: string;
    category: string;
  } | null; // Join auf Events
};

export default function MemberAttendanceHistory({ memberId }: { memberId: string }) {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, excused: 0, absent: 0, total: 0 });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      
      // Wir holen die Anwesenheit und joinen das Event dazu, um den Titel zu haben
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          status,
          date,
          events (
            title,
            category
          )
        `)
        .eq("member_id", memberId)
        .order("date", { ascending: false }); // Neueste zuerst

      if (error) {
        console.error("Fehler beim Laden der Historie:", error);
      } else {
        // Typisierung sicherstellen und Daten setzen
        const records = data as unknown as AttendanceRecord[];
        setHistory(records);

        // Statistik berechnen
        const s = { present: 0, excused: 0, absent: 0, total: records.length };
        records.forEach(r => {
          if (r.status === 'present' || r.status === 'late') s.present++;
          else if (r.status === 'excused') s.excused++;
          else if (r.status === 'absent') s.absent++;
        });
        setStats(s);
      }
      setLoading(false);
    };

    if (memberId) fetchHistory();
  }, [memberId]);

  // Helper für Status-Icons
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold"><FaCheck /> Anwesend</span>;
      case 'late': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold"><FaClock /> Verspätet</span>;
      case 'excused': return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-bold"><FaCheck /> Entschuldigt</span>;
      case 'absent': return <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold"><FaTimes /> Unentschuldigt</span>;
      default: return <span className="text-gray-400"><FaQuestion /></span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loading) return <div className="p-4 text-center text-slate-500">Lade Anwesenheiten...</div>;

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-bold text-lg">Anwesenheitshistorie</h3>
        
        {/* Mini Statistik */}
        <div className="flex gap-3 text-xs sm:text-sm">
          <span className="text-green-600 font-medium">✅ {stats.present}</span>
          <span className="text-blue-600 font-medium">📩 {stats.excused}</span>
          <span className="text-red-500 font-medium">❌ {stats.absent}</span>
          <span className="text-slate-500 font-medium">Σ {stats.total}</span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Noch keine Einträge vorhanden.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400 border-b dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Termin</th>
                <th className="px-4 py-3">Kategorie</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {record.events?.title || "Gelöschter Termin"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                     {/* Hier könnte man noch eine Badge-Logik einbauen wie im Kalender */}
                     <span className="capitalize">{record.events?.category || "-"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusIcon(record.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}