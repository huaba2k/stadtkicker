"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaCheck, FaTimes, FaClock, FaQuestion } from "react-icons/fa";

type AttendanceRecord = {
  id: string;
  event_id: string;
  member_id: string;
  status: string;
  date?: string; // Falls vorhanden
  created_at?: string;
  // Wir erweitern das Objekt manuell um den Event-Titel
  eventTitle?: string;
  eventCategory?: string;
};

export default function MemberAttendanceHistory({ memberId }: { memberId: string }) {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, excused: 0, absent: 0, total: 0 });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      
      console.log("🔍 Lade Anwesenheit für:", memberId);

      // 1. Hole NUR die Anwesenheiten (ohne Join, um Fehler zu vermeiden)
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("member_id", memberId);

      if (attendanceError) {
        console.error("❌ Fehler bei attendance:", attendanceError);
        setLoading(false);
        return;
      }

      if (!attendanceData || attendanceData.length === 0) {
        console.log("⚠️ Keine Anwesenheiten gefunden.");
        setHistory([]);
        setLoading(false);
        return;
      }

      console.log(`✅ ${attendanceData.length} Einträge gefunden. Hole Event-Details...`);

      // 2. Sammle alle Event-IDs
      const eventIds = attendanceData.map((a: any) => a.event_id).filter(Boolean);
      
      // 3. Hole die Event-Infos separat (funktioniert auch ohne Foreign Key)
      const { data: eventsData } = await supabase
        .from("events")
        .select("id, title, category")
        .in("id", eventIds);

      // 4. Daten zusammenfügen
      const mergedData = attendanceData.map((record: any) => {
        const matchingEvent = eventsData?.find(e => e.id === record.event_id);
        return {
          ...record,
          eventTitle: matchingEvent?.title || "Unbekannter Termin",
          eventCategory: matchingEvent?.category || "general"
        };
      });

      // Sortieren (Versuche 'date' zu nutzen, sonst 'created_at')
      mergedData.sort((a: any, b: any) => {
        const dateA = new Date(a.date || a.created_at || 0).getTime();
        const dateB = new Date(b.date || b.created_at || 0).getTime();
        return dateB - dateA; // Neueste zuerst
      });

      setHistory(mergedData);

      // Statistik berechnen
      const s = { present: 0, excused: 0, absent: 0, total: mergedData.length };
      mergedData.forEach((r: any) => {
        const st = r.status?.toLowerCase();
        if (st === 'present' || st === 'late' || st === 'anwesend') s.present++;
        else if (st === 'excused' || st === 'entschuldigt') s.excused++;
        else if (st === 'absent' || st === 'unentschuldigt') s.absent++;
      });
      setStats(s);
      
      setLoading(false);
    };

    if (memberId) fetchHistory();
  }, [memberId]);

  // Helper für Status-Icons
  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'present' || s === 'anwesend') return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold"><FaCheck /> Anwesend</span>;
    if (s === 'late' || s === 'verspätet') return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold"><FaClock /> Verspätet</span>;
    if (s === 'excused' || s === 'entschuldigt') return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-bold"><FaCheck /> Entschuldigt</span>;
    if (s === 'absent' || s === 'unentschuldigt') return <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold"><FaTimes /> Unentschuldigt</span>;
    return <span className="text-gray-400">{status}</span>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse">Lade Historie...</div>;

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Anwesenheitshistorie</h3>
        
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
                  <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {/* WICHTIG: Wenn 'date' in der DB fehlt, nutzen wir created_at als Fallback */}
                    {formatDate(record.date || record.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {record.eventTitle}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                     <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">{record.eventCategory}</span>
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