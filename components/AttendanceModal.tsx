"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Member } from "../types/supabase";
import { FaCheck, FaTimes, FaMedkit, FaClipboardList } from "react-icons/fa";

interface Props {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

type AttendanceStatus = 'active' | 'passive' | 'absent' | null;

export default function AttendanceModal({ eventId, eventTitle, onClose }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  const stats = {
    active: Object.values(attendanceMap).filter(s => s === 'active').length,
    passive: Object.values(attendanceMap).filter(s => s === 'passive').length,
    absent: Object.values(attendanceMap).filter(s => s === 'absent').length,
    unknown: members.length - Object.keys(attendanceMap).length,
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // WICHTIG: Filter .eq("status", "active") entfernt, damit alle geladen werden
      const { data: membersData } = await supabase
        .from("members")
        .select("*")
        .eq("is_hidden", false) // <--- AUCH HIER FILTERN
        .order("last_name", { ascending: true });

      if (membersData) setMembers(membersData as Member[]);

      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("member_id, status")
        .eq("event_id", eventId);

      const map: Record<string, AttendanceStatus> = {};
      if (attendanceData) {
        attendanceData.forEach((record: any) => {
          map[record.member_id] = record.status;
        });
      }
      setAttendanceMap(map);
      setLoading(false);
    };

    loadData();
  }, [eventId]);

  const handleSetStatus = async (memberId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({ ...prev, [memberId]: status }));

    const { data } = await supabase.from("attendance").select("id").match({ event_id: eventId, member_id: memberId }).single();
      
    if (data) {
        await supabase.from("attendance").update({ status }).eq("id", data.id);
    } else {
        await supabase.from("attendance").insert([{ event_id: eventId, member_id: memberId, status }]);
    }
  };

  const copySummary = () => {
    const text = `Anwesenheit: ${eventTitle}\n✅ Aktiv: ${stats.active}\n🤕 Passiv: ${stats.passive}\n❌ Abwesend: ${stats.absent}`;
    navigator.clipboard.writeText(text);
    alert("Kopiert!");
  };

  if (loading) return <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 text-white">Lade...</div>;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaClipboardList className="text-primary-600" /> Anwesenheit
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{eventTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><FaTimes /></button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50 dark:bg-slate-950 text-center text-xs font-bold border-b border-slate-200 dark:border-slate-800">
          <div className="text-green-600 bg-green-50 p-1 rounded">✅ {stats.active}</div>
          <div className="text-amber-600 bg-amber-50 p-1 rounded">🤕 {stats.passive}</div>
          <div className="text-red-600 bg-red-50 p-1 rounded">❌ {stats.absent}</div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {members.map(member => {
            const status = attendanceMap[member.id];
            return (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="font-medium text-slate-700 dark:text-slate-200">{member.first_name} {member.last_name}</div>
                <div className="flex gap-1">
                  <button onClick={() => handleSetStatus(member.id, 'active')} className={`p-2 rounded-md ${status === 'active' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}><FaCheck /></button>
                  <button onClick={() => handleSetStatus(member.id, 'passive')} className={`p-2 rounded-md ${status === 'passive' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}><FaMedkit /></button>
                  <button onClick={() => handleSetStatus(member.id, 'absent')} className={`p-2 rounded-md ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400'}`}><FaTimes /></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 dark:bg-slate-900 rounded-b-2xl flex justify-between items-center">
           <button onClick={copySummary} className="text-primary-600 text-sm font-semibold hover:underline">Text kopieren</button>
           <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-lg">Fertig</button>
        </div>
      </div>
    </div>
  );
}