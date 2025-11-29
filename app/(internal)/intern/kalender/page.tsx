"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Member, AppEvent } from "../../../../types/supabase";
import { FaPlus, FaCopy, FaCalendarTimes, FaTimes, FaClipboardList, FaTrash, FaHistory, FaChevronDown, FaChevronUp, FaFutbol, FaEdit } from "react-icons/fa";
import AttendanceModal from "../../../../components/AttendanceModal";
import MatchResultModal from "../../../../components/MatchResultModal";

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
      if (member && (member.role === 'admin' || member.role === 'board')) {
        setCanEdit(true);
      }
    }

    const { data: events } = await supabase.from("events").select("*").order("start_time", { ascending: true });
    setEventsData(events as AppEvent[]);
    
    const { data: members } = await supabase.from("members").select("id, first_name, last_name, birth_date, is_hidden").eq('is_hidden', false);
    
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

  // Actions
  const startAdd = () => { setShowForm(true); setNewEvent({ title: "", date: "", time: "19:00", category: "general", location: "Vereinsheim", recurrence: "once", isEditing: false, editId: null }); };
  
  const startCopy = (item: CalendarItem) => { 
      setShowForm(true); 
      setNewEvent({ 
        title: item.title, 
        date: "", 
        time: item.date.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Berlin'}), 
        category: item.type as any, 
        location: item.subtitle?.startsWith('@') ? item.subtitle.slice(2).trim() : "", 
        recurrence: item.isRecurring ? 'weekly' : 'once', 
        isEditing: false, editId: null 
      }); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (eventId: string) => {
      const event = eventsData.find(e => e.id === eventId);
      if (!event) return;

      const d = new Date(event.start_time);
      const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
      const timeStr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });

      setNewEvent({
          title: event.title,
          date: dateStr,
          time: timeStr,
          category: event.category || 'general',
          location: event.location || '',
          recurrence: event.recurrence_type === 'weekly' ? 'weekly' : 'once',
          isEditing: true,
          editId: event.id
      });
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullDate = new Date(`${newEvent.date}T${newEvent.time}`);
    const isWeekly = newEvent.recurrence === 'weekly';
    
    const payload = { 
        title: newEvent.title, 
        start_time: fullDate.toISOString(), 
        category: newEvent.category, 
        location: newEvent.location, 
        recurrence_type: isWeekly ? 'weekly' : null, 
        is_recurring: isWeekly 
    };

    let error;
    
    if (newEvent.isEditing && newEvent.editId) {
        const res = await supabase.from("events").update(payload).eq("id", newEvent.editId);
        error = res.error;
    } else {
        const res = await supabase.from("events").insert([payload]);
        error = res.error;
    }

    if (error) alert(error.message); 
    else { 
        setShowForm(false); 
        setNewEvent({ title: "", date: "", time: "19:00", category: "general", location: "Vereinsheim", recurrence: "once", isEditing: false, editId: null });
        fetchData(true); 
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if(!confirm("Termin wirklich löschen?")) return;
    setItems(prev => prev.filter(i => i.originalEventId !== eventId)); 
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if(error) { alert(error.message); fetchData(true); } else { fetchData(true); }
  };

  const handleOpenExceptionModal = (eventId: string) => { const event = eventsData.find(e => e.id === eventId); if (event) { setSelectedRecurringEvent(event); setShowExceptionModal(true); } };
  const handleAddException = async (dateString: string) => { if (!selectedRecurringEvent) return; const newExceptions = [...(selectedRecurringEvent.recurrence_exceptions || []), dateString]; await supabase.from("events").update({ recurrence_exceptions: newExceptions }).eq("id", selectedRecurringEvent.id); setSelectedRecurringEvent({...selectedRecurringEvent, recurrence_exceptions: newExceptions}); fetchData(true); };
  const handleRemoveException = async (dateString: string) => { if (!selectedRecurringEvent) return; const newExceptions = (selectedRecurringEvent.recurrence_exceptions || []).filter(ex => ex !== dateString); await supabase.from("events").update({ recurrence_exceptions: newExceptions }).eq("id", selectedRecurringEvent.id); setSelectedRecurringEvent({...selectedRecurringEvent, recurrence_exceptions: newExceptions}); fetchData(true); };
  
  const formatDate = (date: Date) => date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' });
  const formatTime = (date: Date) => date.toLocaleTimeString('de-DE', { hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Berlin' });
  
  const getCategoryColor = (type: string) => {
    switch (type) {
        case 'birthday': return 'border-amber-500 bg-amber-100 text-amber-700';
        case 'match': return 'border-green-500 bg-green-100 text-green-700';
        case 'training': return 'border-blue-500 bg-blue-100 text-blue-700';
        case 'jhv': return 'border-red-500 bg-red-100 text-red-700';
        case 'schafkopf': return 'border-emerald-600 bg-emerald-100 text-emerald-800';
        case 'trip': return 'border-indigo-500 bg-indigo-100 text-indigo-700';
        case 'party': return 'border-purple-500 bg-purple-100 text-purple-700';
        default: return 'border-slate-300 bg-slate-100 text-slate-600';
    }
  };

  const renderItem = (item: CalendarItem, isPast: boolean = false) => (
    <div key={item.id} className={`flex items-center p-4 rounded-xl border bg-white dark:bg-slate-800 transition-all hover:shadow-md group ${isPast ? 'opacity-60 grayscale-[50%]' : ''}`}>
      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg mr-4 flex-shrink-0 border-2 ${getCategoryColor(item.type)}`}>
        <span className="text-xl font-bold leading-none">{item.date.getDate()}</span>
        <span className="text-xs uppercase font-bold">{item.date.toLocaleDateString('de-DE', { month: 'short', timeZone: 'Europe/Berlin' })}</span>
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate pr-2">{item.title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
          {/* FIX: Zeit wird als neue Zeile angezeigt, wenn der Platz eng wird */}
          <span className="capitalize">{formatDate(item.date)}</span>
          <span className="hidden md:inline">•</span>
          <span className={`font-semibold ${item.type === 'birthday' ? 'text-amber-700' : 'text-slate-600 dark:text-slate-300'}`}>
             {item.type === 'birthday' ? 'Ganztägig' : formatTime(item.date) + ' Uhr'}
          </span>

          {item.subtitle && (<><span className="hidden md:inline">•</span><span className="truncate max-w-[200px]">{item.subtitle}</span></>)}
          {item.isRecurring && <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">Serie</span>}
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.type !== 'birthday' && item.id === item.originalEventId && <button onClick={() => startEdit(item.originalEventId)} className="p-2 text-primary-600 hover:text-primary-800" title="Bearbeiten"><FaEdit /></button>}
          {!isPast && item.isRecurring && item.id === item.originalEventId && item.type !== 'birthday' && <button onClick={() => handleOpenExceptionModal(item.originalEventId)} className="p-2 text-amber-500 hover:text-amber-700" title="Ausnahmen"><FaCalendarTimes /></button>}
          {item.type !== 'birthday' && item.id === item.originalEventId && <button onClick={() => startCopy(item)} className="p-2 text-slate-500 hover:text-primary-600" title="Kopieren"><FaCopy /></button>}
          {item.type !== 'birthday' && <button onClick={() => setAttendanceEvent({ id: item.originalEventId, title: item.title })} className="p-2 text-slate-400 hover:text-green-600" title="Anwesenheit"><FaClipboardList /></button>}
          {(item.type === 'match' || item.type === 'schafkopf') && <button onClick={() => setMatchEvent({ id: item.originalEventId, title: item.title })} className="p-2 text-slate-400 hover:text-blue-600" title="Ergebnis"><FaFutbol /></button>}
          {item.type !== 'birthday' && item.id === item.originalEventId && <button onClick={() => handleDeleteEvent(item.originalEventId)} className="p-2 text-red-400 hover:text-red-600" title="Löschen"><FaTrash /></button>}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terminkalender</h1>
        {canEdit && (
          <button onClick={startAdd} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <FaPlus /> Termin eintragen
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl sticky top-24 z-40">
          <div className="flex justify-between mb-4">
             <h3 className="font-bold text-slate-900 dark:text-white">{newEvent.isEditing ? "Termin bearbeiten" : "Neuen Termin eintragen"}</h3>
             <button onClick={() => { setShowForm(false); setNewEvent({ title: "", date: "", time: "19:00", category: "general", location: "Vereinsheim", recurrence: "once", isEditing: false, editId: null }); }}><FaTimes/></button>
          </div>
          <form onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input required placeholder="Titel" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 md:col-span-2" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            
            <select className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600" value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value as any})}>
              <option value="training">Training</option>
              <option value="match">Spiel / Turnier</option>
              <option value="jhv">Jahreshauptversammlung</option>
              <option value="schafkopf">Schafkopfturnier</option>
              <option value="trip">Ausflug</option>
              <option value="party">Feier</option>
              <option value="general">Sonstiges</option>
            </select>
            
            <input required type="date" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
            <input required type="time" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
            <select className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600" value={newEvent.recurrence} onChange={e => setNewEvent({...newEvent, recurrence: e.target.value as any})}><option value="once">Einmalig</option><option value="weekly">Wöchentlich</option></select>
            <input placeholder="Ort" className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 md:col-span-3" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
            <div className="md:col-span-3 flex justify-end gap-2 mt-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 rounded">Abbrechen</button><button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded">Speichern</button></div>
          </form>
        </div>
      )}

      <div className="space-y-4 mb-12">
        <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
           <FaPlus /> Aktuell & Demnächst
        </h2>
        {upcomingItems.length === 0 ? <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500">Keine anstehenden Termine.</div> : upcomingItems.map(item => renderItem(item, false))}
      </div>

      {!loading && pastItems.length > 0 && (
          <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
              <button onClick={() => setShowPast(!showPast)} className="flex items-center gap-2 mx-auto text-slate-500 hover:text-primary-600 font-medium mb-6 px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
                 <FaHistory /> {showPast ? "Archiv ausblenden" : `Vergangene Termine anzeigen (${pastItems.length})`} {showPast ? <FaChevronUp/> : <FaChevronDown/>}
              </button>
              {showPast && <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">{pastItems.map(item => renderItem(item, true))}</div>}
          </div>
      )}
      
      {showExceptionModal && selectedRecurringEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md">
               <h3 className="text-xl font-bold mb-4">Ausnahmen</h3>
               <form onSubmit={(e) => {e.preventDefault(); const el = (e.target as any).elements.exception_date; if(el.value) handleAddException(el.value);}} className="flex gap-2 mb-4">
                  <input type="date" name="exception_date" required className="p-2 rounded border dark:bg-slate-900 dark:border-slate-600 flex-grow" />
                  <button className="bg-red-600 text-white px-4 rounded">Add</button>
               </form>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(selectedRecurringEvent.recurrence_exceptions || []).map(d => (
                      <div key={d} className="flex justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded"><span>{new Date(d).toLocaleDateString()}</span><button onClick={() => handleRemoveException(d)} className="text-red-500"><FaTimes/></button></div>
                  ))}
               </div>
               <button onClick={() => setShowExceptionModal(false)} className="mt-4 w-full p-2 border rounded">Schließen</button>
           </div>
        </div>
      )}
      {attendanceEvent && <AttendanceModal eventId={attendanceEvent.id} eventTitle={attendanceEvent.title} onClose={() => setAttendanceEvent(null)} />}
      {matchEvent && <MatchResultModal eventId={matchEvent.id} eventTitle={matchEvent.title} onClose={() => setMatchEvent(null)} />}
    </div>
  );
}