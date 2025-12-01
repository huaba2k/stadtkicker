"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Member, AppEvent } from "@/types/supabase";
import { FaPlus, FaCopy, FaCalendarTimes, FaTimes, FaClipboardList, FaTrash, FaHistory, FaChevronDown, FaChevronUp, FaFutbol, FaEdit } from "react-icons/fa";
import AttendanceModal from "@/components/AttendanceModal";
import MatchResultModal from "@/components/MatchResultModal";

type CalendarItem = {
  id: string;
  originalEventId: string;
  title: string;
  date: Date;
  type: 'birthday' | 'training' | 'match' | 'party' | 'general' | 'jhv' | 'schafkopf' | 'trip';
  subtitle?: string;
  isRecurring: boolean;
};

const calculateRecurrences = (event: AppEvent, items: CalendarItem[]) => {
  if (event.recurrence_type !== 'weekly' || !event.is_recurring) return;
  const startDate = new Date(event.start_time);
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  let date = new Date(startDate);
  date.setDate(date.getDate() + 7);
  const exceptions = event.recurrence_exceptions || [];
  while (date.getFullYear() <= nextYear) {
    const dateString = date.toISOString().split('T')[0];
    if (!exceptions.includes(dateString)) {
      items.push({
        id: event.id + date.getTime(),
        originalEventId: event.id,
        title: event.title,
        date: new Date(date),
        type: event.category,
        subtitle: event.location ? `@ ${event.location}` : undefined,
        isRecurring: true,
      });
    }
    date.setDate(date.getDate() + 7);
  }
};

export default function KalenderPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [eventsData, setEventsData] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPast, setShowPast] = useState(false); 
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [selectedRecurringEvent, setSelectedRecurringEvent] = useState<AppEvent | null>(null);
  const [attendanceEvent, setAttendanceEvent] = useState<{id: string, title: string} | null>(null);
  const [matchEvent, setMatchEvent] = useState<{id: string, title: string} | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "", date: "", time: "19:00", 
    category: "general" as AppEvent['category'], 
    location: "Vereinsheim",
    recurrence: "once" as "once" | "weekly", isEditing: false, editId: null as string | null,
  });

  const fetchData = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const { data: member } = await supabase.from("members").select("role").eq("email", user.email).single();
      if (member && (member.role === 'admin' || member.role === 'board')) setCanEdit(true);
    }
    const { data: events } = await supabase.from("events").select("*").order("start_time", { ascending: true });
    setEventsData(events as AppEvent[]);
    const { data: members } = await supabase.from("members").select("id, first_name, last_name, birth_date, is_hidden, status").eq('is_hidden', false).neq('status', 'left');
    let allItems: CalendarItem[] = [];
    if (events) {
      events.forEach((e: AppEvent) => {
        allItems.push({
          id: e.id, originalEventId: e.id, title: e.title, date: new Date(e.start_time),
          type: e.category, subtitle: e.location ? `@ ${e.location}` : undefined,
          isRecurring: !!e.is_recurring,
        });
        calculateRecurrences(e, allItems);
      });
    }
    const today = new Date();
    const currentYear = today.getFullYear();
    if (members) {
      members.forEach((m: any) => {
        if (!m.birth_date) return;
        const bday = new Date(m.birth_date);
        for (let y = currentYear; y <= currentYear + 1; y++) {
             let nextBday = new Date(y, bday.getMonth(), bday.getDate());
             const age = nextBday.getFullYear() - bday.getFullYear();
             if (nextBday >= new Date(today.setHours(0,0,0,0))) {
                 allItems.push({
                    id: `bday-${m.id}-${y}`, originalEventId: `bday-${m.id}-${y}`,
                    title: `Geburtstag: ${m.first_name} ${m.last_name}`, date: nextBday,
                    type: 'birthday', subtitle: `wird ${age} Jahre alt 🎉`, isRecurring: true,
                 });
             }
        }
      });
    }
    setItems(allItems.sort((a, b) => a.date.getTime() - b.date.getTime()));
    setLoading(false);
  };

  useEffect(() => { fetchData(false); }, []);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const upcomingItems = items.filter(i => i.date >= todayStart);
  const pastItems = items.filter(i => i.date < todayStart).sort((a, b) => b.date.getTime() - a.date.getTime());

  const startAdd = () => { setShowForm(true); setNewEvent({ title: "", date: "", time: "19:00", category: "general", location: "Vereinsheim", recurrence: "once", isEditing: false, editId: null }); };
  const startCopy = (item: CalendarItem) => { setShowForm(true); setNewEvent({ title: item.title, date: "", time: item.date.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Berlin'}), category: item.type as any, location: item.subtitle?.startsWith('@') ? item.subtitle.slice(2).trim() : "", recurrence: item.isRecurring ? 'weekly' : 'once', isEditing: false, editId: null }); };
  const startEdit = (eventId: string) => {
      const event = eventsData.find(e => e.id === eventId);
      if (!event) return;
      const d = new Date(event.start_time);
      setNewEvent({
          title: event.title, date: d.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' }),
          time: d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }),
          category: event.category || 'general', location: event.location || '',
          recurrence: event.recurrence_type === 'weekly' ? 'weekly' : 'once', isEditing: true, editId: event.id
      });
      setShowForm(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = newEvent.time.split(':').map(Number);
    const dateObj = new Date(newEvent.date); 
    dateObj.setHours(hours, minutes, 0, 0);
    const isWeekly = newEvent.recurrence === 'weekly';
    const payload = { title: newEvent.title, start_time: dateObj.toISOString(), category: newEvent.category, location: newEvent.location, recurrence_type: isWeekly ? 'weekly' : null, is_recurring: isWeekly };
    let error;
    if (newEvent.isEditing && newEvent.editId) { const res = await supabase.from("events").update(payload).eq("id", newEvent.editId); error = res.error; } 
    else { const res = await supabase.from("events").insert([payload]); error = res.error; }
    if (error) alert(error.message); else { setShowForm(false); setNewEvent({ title: "", date: "", time: "19:00", category: "general", location: "Vereinsheim", recurrence: "once", isEditing: false, editId: null }); fetchData(true); }
  };
  
  const handleDeleteEvent = async (eventId: string) => { if(!confirm("Termin wirklich löschen?")) return; setItems(prev => prev.filter(i => i.originalEventId !== eventId)); const { error } = await supabase.from("events").delete().eq("id", eventId); if(error) { alert(error.message); fetchData(true); } else { fetchData(true); } };
  const handleOpenExceptionModal = (eventId: string) => { const event = eventsData.find(e => e.id === eventId); if (event) { setSelectedRecurringEvent(event); setShowExceptionModal(true); } };
  const handleAddException = async (dateString: string) => { if (!selectedRecurringEvent) return; const newExceptions = [...(selectedRecurringEvent.recurrence_exceptions || []), dateString]; await supabase.from("events").update({ recurrence_exceptions: newExceptions }).eq("id", selectedRecurringEvent.id); setSelectedRecurringEvent({...selectedRecurringEvent, recurrence_exceptions: newExceptions}); fetchData(true); };
  const handleRemoveException = async (dateString: string) => { if (!selectedRecurringEvent) return; const newExceptions = (selectedRecurringEvent.recurrence_exceptions || []).filter(ex => ex !== dateString); await supabase.from("events").update({ recurrence_exceptions: newExceptions }).eq("id", selectedRecurringEvent.id); setSelectedRecurringEvent({...selectedRecurringEvent, recurrence_exceptions: newExceptions}); fetchData(true); };
  
  const formatDate = (date: Date) => date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' });
  const formatTime = (date: Date) => date.toLocaleTimeString('de-DE', { hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Berlin' });
  const getCategoryColor = (type: string) => { switch (type) { case 'birthday': return 'border-amber-500 bg-amber-100 text-amber-700'; case 'match': return 'border-green-500 bg-green-100 text-green-700'; case 'training': return 'border-blue-500 bg-blue-100 text-blue-700'; case 'jhv': return 'border-red-500 bg-red-100 text-red-700'; case 'schafkopf': return 'border-emerald-600 bg-emerald-100 text-emerald-800'; case 'trip': return 'border-indigo-500 bg-indigo-100 text-indigo-700'; case 'party': return 'border-purple-500 bg-purple-100 text-purple-700'; default: return 'border-slate-300 bg-slate-100 text-slate-600'; } };

  // --- OPTIMIERTER MOBILE RENDERER ---
  const renderItem = (item: CalendarItem, isPast: boolean = false) => (
    <div key={item.id} className={`flex flex-col p-3 sm:p-4 rounded-xl border bg-white dark:bg-slate-800 transition-all hover:shadow-md group gap-3 ${isPast ? 'opacity-60 grayscale-[50%]' : ''}`}>
      
      {/* OBERER TEIL: Datum & Inhalt */}
      <div className="flex items-start gap-3 sm:gap-4">
          {/* Datum: Kompakter auf Mobile */}
          <div className={`flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0 border-2 ${getCategoryColor(item.type)}`}>
            <span className="text-lg sm:text-xl font-bold leading-none">{item.date.getDate()}</span>
            <span className="text-[10px] sm:text-xs uppercase font-bold">{item.date.toLocaleDateString('de-DE', { month: 'short', timeZone: 'Europe/Berlin' })}</span>
          </div>

          <div className="flex-grow min-w-0 pt-0.5">
            {/* Titel: Truncate verhindert Overflow */}
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight mb-1 truncate pr-1">
              {item.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
               <span className="whitespace-nowrap">
                  {formatDate(item.date)}
                  {item.type !== 'birthday' && <span className="font-semibold ml-1">• {formatTime(item.date)} Uhr</span>}
               </span>
               
               {item.subtitle && (
                 <span className="truncate max-w-[200px] block opacity-80">
                    @ {item.subtitle}
                 </span>
               )}
               
               {item.isRecurring && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border dark:border-slate-600">Serie</span>}
            </div>
          </div>
      </div>

      {/* UNTERER TEIL: Buttons (Volle Breite auf Mobile) */}
      {canEdit && (
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-700 w-full">
          
          {/* Linke Gruppe: Bearbeiten & Ausnahmen */}
          <div className="flex gap-1">
             {item.type !== 'birthday' && item.id === item.originalEventId && <button onClick={() => startEdit(item.originalEventId)} className="p-2 bg-slate-50 dark:bg-slate-700 text-primary-600 rounded hover:bg-primary-50 transition-colors" title="Bearbeiten"><FaEdit size={16}/></button>}
             {!isPast && item.isRecurring && item.id === item.originalEventId && item.type !== 'birthday' && <button onClick={() => handleOpenExceptionModal(item.originalEventId)} className="p-2 bg-slate-50 dark:bg-slate-700 text-amber-500 hover:bg-amber-50 rounded" title="Ausnahmen"><FaCalendarTimes size={16}/></button>}
          </div>

          {/* Rechte Gruppe: Aktionen & Löschen */}
          <div className="flex gap-1">
             {item.type !== 'birthday' && item.id === item.originalEventId && <button onClick={() => startCopy(item)} className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 rounded" title="Kopieren"><FaCopy size={16}/></button>}
             
             {item.type !== 'birthday' && <button onClick={() => setAttendanceEvent({ id: item.originalEventId, title: item.title })} className="p-2 bg-slate-50 dark:bg-slate-700 text-green-600 hover:bg-green-50 rounded" title="Anwesenheit"><FaClipboardList size={16}/></button>}
             
             {(item.type === 'match' || item.type === 'schafkopf') && <button onClick={() => setMatchEvent({ id: item.originalEventId, title: item.title })} className="p-2 bg-slate-50 dark:bg-slate-700 text-blue-500 hover:bg-blue-50 rounded" title="Ergebnis"><FaFutbol size={16}/></button>}
             
             {item.type !== 'birthday' && item.id === item.originalEventId && <button onClick={() => handleDeleteEvent(item.originalEventId)} className="p-2 bg-slate-50 dark:bg-slate-700 text-red-400 hover:bg-red-50 rounded" title="Löschen"><FaTrash size={16}/></button>}
          </div>

        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Terminkalender</h1>
        {canEdit && (
          <button onClick={startAdd} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 sm:px-4 rounded-lg text-sm font-medium flex items-center gap-2">
            <FaPlus /> <span className="hidden sm:inline">Termin eintragen</span><span className="sm:hidden">Neu</span>
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="mb-8 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl sticky top-20 z-40">
          <div className="flex justify-between mb-4">
             <h3 className="font-bold text-slate-900 dark:text-white">{newEvent.isEditing ? "Bearbeiten" : "Neuer Termin"}</h3>
             <button onClick={() => { setShowForm(false); setNewEvent({ title: "", date: "", time: "19:00", category: "general", location: "Vereinsheim", recurrence: "once", isEditing: false, editId: null }); }}><FaTimes/></button>
          </div>
          <form onSubmit={handleSaveEvent} className="grid grid-cols-1 gap-3 sm:gap-4">
            <input required placeholder="Titel" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 w-full" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-3">
                <select className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 w-full" value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value as any})}>
                    <option value="training">Training</option><option value="match">Spiel/Turnier</option><option value="jhv">JHV</option><option value="schafkopf">Schafkopf</option><option value="trip">Ausflug</option><option value="party">Feier</option><option value="general">Sonstiges</option>
                </select>
                <select className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 w-full" value={newEvent.recurrence} onChange={e => setNewEvent({...newEvent, recurrence: e.target.value as any})}><option value="once">Einmalig</option><option value="weekly">Wöchentlich</option></select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <input required type="date" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 w-full" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                <input required type="time" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 w-full" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
            </div>

            <input placeholder="Ort" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 w-full" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
            <div className="flex justify-end gap-2 mt-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 text-sm">Abbrechen</button><button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Speichern</button></div>
          </form>
        </div>
      )}

      <div className="space-y-3 mb-12">
        <h2 className="text-sm sm:text-lg font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
           <FaPlus className="w-3 h-3"/> Aktuell & Demnächst
        </h2>
        {upcomingItems.length === 0 ? <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500">Keine Termine.</div> : upcomingItems.map(item => renderItem(item, false))}
      </div>

      {!loading && pastItems.length > 0 && (
          <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
              <button onClick={() => setShowPast(!showPast)} className="flex items-center gap-2 mx-auto text-slate-500 hover:text-primary-600 font-medium mb-6 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm">
                 <FaHistory /> {showPast ? "Archiv ausblenden" : `Vergangene (${pastItems.length})`} {showPast ? <FaChevronUp/> : <FaChevronDown/>}
              </button>
              {showPast && <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">{pastItems.map(item => renderItem(item, true))}</div>}
          </div>
      )}
      
      {showExceptionModal && selectedRecurringEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md">
               <h3 className="text-xl font-bold mb-4">Ausnahmen verwalten</h3>
               <p className="text-sm text-slate-500 mb-4">Termin fällt aus am:</p>
               <form onSubmit={(e) => {e.preventDefault(); const el = (e.target as any).elements.exception_date; if(el.value) handleAddException(el.value);}} className="flex gap-2 mb-4">
                  <input type="date" name="exception_date" required className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 flex-grow" />
                  <button className="bg-red-600 text-white px-4 rounded font-bold">Ausfallen lassen</button>
               </form>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(selectedRecurringEvent.recurrence_exceptions || []).map(d => (
                      <div key={d} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded text-sm"><span>{new Date(d).toLocaleDateString()}</span><button onClick={() => handleRemoveException(d)} className="text-red-500"><FaTimes/></button></div>
                  ))}
               </div>
               <button onClick={() => setShowExceptionModal(false)} className="mt-4 w-full p-2 border rounded text-sm">Schließen</button>
           </div>
        </div>
      )}
      {attendanceEvent && <AttendanceModal eventId={attendanceEvent.id} eventTitle={attendanceEvent.title} onClose={() => setAttendanceEvent(null)} />}
      {matchEvent && <MatchResultModal eventId={matchEvent.id} eventTitle={matchEvent.title} onClose={() => setMatchEvent(null)} />}
    </div>
  );
}