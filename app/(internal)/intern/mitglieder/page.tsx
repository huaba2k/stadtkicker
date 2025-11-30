"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import { Member } from "../../../../types/supabase";
import { FaUserPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUsers, FaChartBar, FaFilePdf, FaFilter, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

type MemberFormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  joined_at: string;
  left_at: string;
  role: "member" | "coach" | "board" | "admin";
  // FIX: Hier 'left' hinzufügen, damit TS nicht meckert
  status: "active" | "passive" | "left"; 
  city_of_residence: string;
  isEditing: boolean;
  editId: string | null;
};

const initialNewMember: MemberFormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  birth_date: "",
  joined_at: "",
  left_at: "",
  role: "member",
  status: "active",
  city_of_residence: "", 
  isEditing: false,
  editId: null,
};

type AttendanceStats = {
  total: number;
  active: number;
  passive: number;
  absent: number;
  helper: number;
};

export default function MitgliederPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [canEdit, setCanEdit] = useState(false);
  const [hasReadAccess, setHasReadAccess] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState<MemberFormState>(initialNewMember);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'last_name', direction: 'asc' });

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearlyAttendance, setYearlyAttendance] = useState<Record<string, AttendanceStats>>({});

  // --- STARTUP ---
  useEffect(() => {
    const checkRights = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { data: member } = await supabase.from("members").select("role").eq("email", user.email).maybeSingle();
        if (member && ['admin', 'board', 'coach'].includes(member.role)) {
          setHasReadAccess(true);
          if (member.role === 'admin' || member.role === 'board') setCanEdit(true);
          fetchMembers();
        }
      }
      setAuthChecking(false);
    };
    checkRights();
  }, []);

  useEffect(() => {
    if (hasReadAccess) fetchYearlyStats(selectedYear);
  }, [selectedYear, hasReadAccess]);

  // --- DATEN LADEN ---
  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("members").select("*").eq("is_hidden", false).order("last_name", { ascending: true });
    if (error) showNotification("Fehler: " + error.message, 'error');
    else setMembers(data as Member[]);
    setLoading(false);
  };

  const fetchYearlyStats = async (year: number) => {
    const { data, error } = await supabase.rpc('get_yearly_stats_v2', { year_input: year });
    if (error) { console.error(error); return; }

    const statsMap: Record<string, AttendanceStats> = {};
    if (data) {
        data.forEach((row: any) => {
            statsMap[row.member_id] = {
                active: Number(row.active_count),
                passive: Number(row.passive_count),
                helper: Number(row.helper_count),
                absent: Number(row.absent_count),
                total: Number(row.total_count)
            };
        });
    }
    setYearlyAttendance(statsMap);
  };

  // --- SORT & FILTER ---
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Sortierung und Aufteilung in Aktiv/Inaktiv
  const { activeMembers, inactiveMembers } = useMemo(() => {
    let filtered = members.filter(member =>
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.city_of_residence || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let valA: any = '', valB: any = '';
      if (sortConfig.key.startsWith('attendance_')) {
        const type = sortConfig.key.split('_')[1] as 'total' | 'active' | 'passive' | 'absent' | 'helper';
        valA = yearlyAttendance[a.id]?.[type] || 0;
        valB = yearlyAttendance[b.id]?.[type] || 0;
      } else {
        valA = (a as any)[sortConfig.key] || "";
        valB = (b as any)[sortConfig.key] || "";
      }
      let result = 0;
      if (typeof valA === 'string') result = valA.localeCompare(valB, 'de', { sensitivity: 'base' });
      else result = valA - valB;
      if (sortConfig.direction === 'desc') result *= -1;
      if (result === 0) return a.last_name.localeCompare(b.last_name);
      return result;
    });

    // Trennen: "Echte" Mitglieder vs. Ausgetretene/Passive
    // Wir zeigen "left" und "passive" standardmäßig unten im Archiv an, "active" oben.
    const active = filtered.filter(m => m.status === 'active');
    const inactive = filtered.filter(m => m.status !== 'active');

    return { activeMembers: active, inactiveMembers: inactive };
  }, [members, searchTerm, sortConfig, yearlyAttendance]);

  // --- HELPER ---
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const handleExportPDF = () => window.print();
  
  const statsHeader = useMemo(() => {
    const totalMembers = members.length;
    const garchingMembers = members.filter(m => m.city_of_residence?.toLowerCase().includes('garching')).length;
    const garchingPercentage = totalMembers > 0 ? ((garchingMembers / totalMembers) * 100).toFixed(1).replace('.', ',') : '0';
    return { totalMembers, garchingMembers, garchingPercentage };
  }, [members]);

  // --- CRUD ---
  const startAdd = () => { setShowForm(true); setNewMember(initialNewMember); };

  const startEdit = (member: Member) => {
    setShowForm(true);
    setNewMember({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email || "",
      phone: member.phone || "",
      birth_date: member.birth_date ? new Date(member.birth_date).toISOString().split('T')[0] : "",
      joined_at: member.joined_at ? new Date(member.joined_at).toISOString().split('T')[0] : "",
      left_at: member.left_at ? new Date(member.left_at).toISOString().split('T')[0] : "",
      role: member.role,
      // FIX: Type Cast auf den neuen Typ
      status: (member.status as "active" | "passive" | "left") || "active",
      city_of_residence: member.city_of_residence || "",
      isEditing: true,
      editId: member.id,
    });
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = {
      first_name: newMember.first_name,
      last_name: newMember.last_name,
      email: newMember.email || null,
      phone: newMember.phone || null,
      birth_date: newMember.birth_date || null,
      joined_at: newMember.joined_at || null,
      left_at: newMember.left_at || null,
      role: newMember.role,
      status: newMember.status,
      city_of_residence: newMember.city_of_residence || null, 
    };

    let error = null;
    if (newMember.isEditing && newMember.editId) {
      const result = await supabase.from("members").update(dataToSave).eq("id", newMember.editId);
      error = result.error;
    } else {
      const result = await supabase.from("members").insert([dataToSave]);
      error = result.error;
    }

    if (error) showNotification(`Fehler: ${error.message}`, 'error');
    else { showNotification(`Gespeichert.`, 'success'); setShowForm(false); setNewMember(initialNewMember); fetchMembers(); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Wirklich löschen?")) {
      setLoading(true);
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) showNotification("Fehler beim Löschen.", 'error');
      else { showNotification("Gelöscht.", 'success'); fetchMembers(); }
      setLoading(false);
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <FaSort className="inline ml-1 text-slate-300" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="inline ml-1 text-primary-500" /> : <FaSortDown className="inline ml-1 text-primary-500" />;
  };

  // State für das Einklappen der inaktiven Liste
  const [showInactive, setShowInactive] = useState(false);

  // --- RENDER HELPER ---
  const renderTable = (data: Member[], title: string) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2">
                {title === 'Inaktiv' ? <FaUserPlus className="rotate-45"/> : <FaUsers/>} {title} ({data.length})
            </h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th onClick={() => requestSort('last_name')} className="px-6 py-3 text-left font-bold cursor-pointer hover:text-primary-600">Name <SortIcon columnKey="last_name"/></th>
                  <th onClick={() => requestSort('status')} className="px-6 py-3 text-left font-bold cursor-pointer hover:text-primary-600">Status <SortIcon columnKey="status"/></th>
                  <th onClick={() => requestSort('role')} className="px-6 py-3 text-left font-bold cursor-pointer hover:text-primary-600">Rolle <SortIcon columnKey="role"/></th>
                  <th onClick={() => requestSort('city_of_residence')} className="px-6 py-3 text-left font-bold cursor-pointer hover:text-primary-600">Ort <SortIcon columnKey="city_of_residence"/></th>
                  <th onClick={() => requestSort('attendance_active')} className="px-6 py-3 text-center font-bold cursor-pointer bg-green-50 dark:bg-green-900/10 hover:text-green-600">Akt. <SortIcon columnKey="attendance_active"/></th>
                  <th onClick={() => requestSort('attendance_passive')} className="px-6 py-3 text-center font-bold cursor-pointer text-slate-400 hover:text-amber-600">Pass. <SortIcon columnKey="attendance_passive"/></th>
                  <th onClick={() => requestSort('attendance_helper')} className="px-6 py-3 text-center font-bold cursor-pointer text-purple-600 hover:text-purple-800">Helf. <SortIcon columnKey="attendance_helper"/></th>
                  <th onClick={() => requestSort('attendance_absent')} className="px-6 py-3 text-center font-bold cursor-pointer text-red-400 hover:text-red-600">Abw. <SortIcon columnKey="attendance_absent"/></th>
                  <th onClick={() => requestSort('attendance_total')} className="px-6 py-3 text-center font-bold cursor-pointer bg-slate-100 dark:bg-slate-800 hover:text-primary-600">Ges. <SortIcon columnKey="attendance_total"/></th>
                  <th className="px-6 py-3 text-right font-bold print:hidden">Aktion</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {data.map(m => {
                    const stats = yearlyAttendance[m.id] || { active: 0, passive: 0, absent: 0, helper: 0, total: 0 };
                    return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        <Link href={`/intern/mitglieder/${m.id}`} className="hover:text-primary-600 hover:underline transition-colors">
                          {m.last_name}, {m.first_name}
                        </Link>
                        {m.left_at && <div className="text-[10px] text-red-400 mt-0.5">Austritt: {new Date(m.left_at).getFullYear()}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            m.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                            m.status === 'left' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {m.status === 'active' ? 'Aktiv' : m.status === 'left' ? 'Ausgetreten' : 'Passiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                         {m.role === 'board' ? 'Vorstand' : m.role === 'admin' ? 'Admin' : m.role === 'coach' ? 'Trainer' : 'Mitglied'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{m.city_of_residence}</td>
                      
                      <td className="px-6 py-4 text-center font-medium text-green-600 bg-green-50/50 dark:bg-green-900/10">{stats.active}</td>
                      <td className="px-6 py-4 text-center text-amber-600">{stats.passive}</td>
                      <td className="px-6 py-4 text-center text-purple-600">{stats.helper}</td>
                      <td className="px-6 py-4 text-center text-red-500">{stats.absent}</td>
                      <td className="px-6 py-4 text-center font-bold bg-slate-100/50 dark:bg-slate-800/50">{stats.total}</td>
                      
                      <td className="px-6 py-4 text-right space-x-2 print:hidden">
                        {canEdit && (
                            <>
                                <button onClick={() => startEdit(m)} className="text-primary-600 hover:text-primary-900 p-1"><FaEdit /></button>
                                <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-900 p-1"><FaTrash /></button>
                            </>
                        )}
                      </td>
                    </tr>
                )})}
              </tbody>
            </table>
        </div>
    </div>
  );


  if (authChecking) return <div className="min-h-screen flex items-center justify-center dark:text-white">Prüfe Berechtigungen...</div>;
  if (!hasReadAccess) return <div className="p-10 text-center">Zugriff verweigert.</div>;

  return (
    <div className="max-w-full mx-auto p-4 sm:p-8 print:p-0">
      
      {/* --- DRUCK ANSICHT (Alle in einer Liste) --- */}
      <section id="statistics-report" className="hidden print:block bg-white p-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Jahresbericht {selectedYear}</h1>
          <p className="text-slate-600 mb-6">Garchinger Stadtkicker e.V. - Anwesenheitsliste</p>
          
          <table className="w-full text-sm border-collapse border border-slate-300">
              <thead>
                  <tr className="bg-slate-100">
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-center">Gesamt</th>
                      <th className="border p-2 text-center">Aktiv</th>
                      <th className="border p-2 text-center">Passiv</th>
                      <th className="border p-2 text-center">Helfer</th>
                      <th className="border p-2 text-center">Abwesend</th>
                  </tr>
              </thead>
              <tbody>
                  {[...activeMembers, ...inactiveMembers].sort((a,b) => (yearlyAttendance[b.id]?.total||0) - (yearlyAttendance[a.id]?.total||0)).map((m) => (
                      <tr key={m.id} className="break-inside-avoid">
                          <td className="border p-2">{m.last_name}, {m.first_name}</td>
                          <td className="border p-2 text-center font-bold">{yearlyAttendance[m.id]?.total || 0}</td>
                          <td className="border p-2 text-center">{yearlyAttendance[m.id]?.active || 0}</td>
                          <td className="border p-2 text-center text-slate-500">{yearlyAttendance[m.id]?.passive || 0}</td>
                          <td className="border p-2 text-center text-purple-600">{yearlyAttendance[m.id]?.helper || 0}</td>
                          <td className="border p-2 text-center text-red-500">{yearlyAttendance[m.id]?.absent || 0}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </section>
      
      {/* --- SCREEN UI --- */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mitgliederverwaltung</h1>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
               <span className="text-xs font-bold text-slate-500 px-2 uppercase">Statistik-Jahr:</span>
               <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded px-2 py-1 focus:outline-none">
                 {[currentYear, currentYear-1, currentYear-2].map(y => <option key={y} value={y}>{y}</option>)}
               </select>
            </div>
        </div>
        
        {notification && <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{notification.message}</div>}
        
        {/* Statistik Header */}
        <div className="mb-8 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center"><p className="text-2xl font-bold text-primary-600">{statsHeader.totalMembers}</p><p className="text-xs text-slate-500 uppercase">Mitglieder</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-green-600">{statsHeader.garchingMembers}</p><p className="text-xs text-slate-500 uppercase">aus Garching <span className="normal-case text-slate-400 font-normal">(= {statsHeader.garchingPercentage}%)</span></p></div>
             <div className="text-center flex flex-col items-center justify-center"><button onClick={handleExportPDF} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"><FaFilePdf /> PDF Export</button></div>
        </div>

        {/* Sticky Formular */}
        {showForm && canEdit && (
          <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg sticky top-20 z-40 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">{newMember.isEditing ? "Bearbeiten" : "Neu"}</h3>
                 <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><FaTimes/></button>
            </div>
            <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input required placeholder="Vorname" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.first_name} onChange={e => setNewMember({...newMember, first_name: e.target.value})} />
              <input required placeholder="Nachname" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.last_name} onChange={e => setNewMember({...newMember, last_name: e.target.value})} />
              
              <div className="relative">
                 <input type="date" className="p-2 w-full rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.birth_date} onChange={e => setNewMember({...newMember, birth_date: e.target.value})} />
                 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">Geb.</span>
              </div>
              <div className="relative">
                 <input type="date" className="p-2 w-full rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.joined_at} onChange={e => setNewMember({...newMember, joined_at: e.target.value})} />
                 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">Eintritt</span>
              </div>
              <div className="relative">
                 <input type="date" className="p-2 w-full rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.left_at} onChange={e => setNewMember({...newMember, left_at: e.target.value})} />
                 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">Austritt</span>
              </div>

              <input placeholder="E-Mail" type="email" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
              <input placeholder="Telefon" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
              <input required placeholder="Wohnort" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.city_of_residence} onChange={e => setNewMember({...newMember, city_of_residence: e.target.value})} />
              
              <select className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value as any})}>
                <option value="member">Mitglied</option>
                <option value="board">Vorstand</option>
                <option value="coach">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              <select className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={newMember.status} onChange={e => setNewMember({...newMember, status: e.target.value as any})}>
                <option value="active">Aktiv</option>
                <option value="passive">Passiv</option>
                <option value="left">Ausgetreten</option>
              </select>

              <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded flex items-center gap-1"><FaTimes /> Abbrechen</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center gap-1" disabled={loading}><FaSave /> Speichern</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-sm">
            <input type="text" placeholder="Suchen..." className="w-full p-2 pl-10 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          </div>
          {canEdit && <button onClick={startAdd} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><FaUserPlus /> Neu</button>}
        </div>

        {/* TABELLE 1: AKTIVE */}
        {loading ? <p className="text-center p-12">Lade...</p> : renderTable(activeMembers, "Aktive Mitglieder")}

        {/* TABELLE 2: INAKTIVE */}
        {!loading && inactiveMembers.length > 0 && (
            <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
                <button onClick={() => setShowInactive(!showInactive)} className="flex items-center gap-2 mx-auto text-slate-500 hover:text-primary-600 font-medium transition-colors mb-6 px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    {showInactive ? <FaSortUp/> : <FaSortDown/>}
                    {showInactive ? "Inaktive & Ehemalige ausblenden" : `Inaktive & Ehemalige anzeigen (${inactiveMembers.length})`}
                </button>
                {showInactive && <div className="animate-in fade-in slide-in-from-top-4 duration-300">{renderTable(inactiveMembers, "Inaktiv / Ehemalig")}</div>}
            </div>
        )}

      </div>
    </div>
  );
}