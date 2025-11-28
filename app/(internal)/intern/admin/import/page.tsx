"use client";

import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "../../../../../lib/supabase"; 
import { FaFileCsv, FaUpload, FaCheckCircle, FaExclamationTriangle, FaDownload, FaTable } from "react-icons/fa";

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<{ msg: string, type: 'success' | 'error' | 'warning' }[]>([]);

  // --- HELPER: DATUM PARSEN ---
  const parseGermanDate = (dateStr: string) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim();
    const parts = cleanStr.split(/[.,-\/]/); 
    if (parts.length !== 3) return null;
    
    let day, month, year;
    // Fall 1: YYYY-MM-DD
    if (parts[0].length === 4) { year = parts[0]; month = parts[1]; day = parts[2]; } 
    // Fall 2: DD.MM.YYYY
    else { day = parts[0]; month = parts[1]; year = parts[2]; }

    if (year.length === 2) year = "20" + year;
    
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? null : isoDate;
  };

  // Helper: Case-insensitive Key suche
  const getValue = (row: any, key: string) => {
      const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
      return foundKey ? row[foundKey] : undefined;
  }

  // Helper: String Normalisierung für Namensvergleich
  const normalize = (str: string) => {
      if (!str) return "";
      return str.toLowerCase()
          .trim()
          .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
          .replace(/[^a-z0-9]/g, "");
  };

  const downloadTemplate = (type: 'members' | 'events' | 'matrix') => {
    let csvContent = "";
    let filename = "";
    if (type === 'members') {
      csvContent = "Vorname;Nachname;Geburtsdatum;Wohnort;Status;Mitgliedsnummer\nMax;Mustermann;01.01.1990;Garching;Aktiv;10";
      filename = "vorlage_mitglieder.csv";
    } else if (type === 'events') {
      csvContent = "Titel;Datum;Uhrzeit;Art;Ort\nTraining;01.05.2024;19:00;Training;Vereinsheim";
      filename = "vorlage_termine.csv";
    } else {
      csvContent = "Nachname;Vorname;01.02.2025;08.02.2025\nMustermann;Max;MT;Spieler\nHuber;Tobias;-;Helfer";
      filename = "vorlage_anwesenheit_matrix.csv";
    }
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 1. MITGLIEDER IMPORT ---
  const handleMemberUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setLog([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      transformHeader: (h) => h.trim(),
      complete: async (results) => {
        const rows = results.data as any[];
        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
          try {
              const firstName = getValue(row, 'vorname');
              const lastName = getValue(row, 'nachname');

              if (!firstName || !lastName) {
                if (Object.keys(row).length > 1) errorCount++;
                continue;
              }

              const payload = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                birth_date: parseGermanDate(getValue(row, 'geburtsdatum')),
                city_of_residence: getValue(row, 'wohnort')?.trim(),
                jersey_number: getValue(row, 'mitgliedsnummer') ? parseInt(getValue(row, 'mitgliedsnummer')) : null,
                status: getValue(row, 'status')?.toLowerCase().includes('passiv') ? 'passive' : 'active', 
                role: 'member',
                is_hidden: false
              };

              const { error } = await supabase.from('members').insert([payload]);
              if (error) throw error;
              successCount++;
          } catch (err) {
              errorCount++;
          }
        }
        setLog([{ msg: `Mitglieder: ${successCount} importiert, ${errorCount} Fehler.`, type: successCount > 0 ? 'success' : 'error' }]);
        setLoading(false);
        e.target.value = "";
      }
    });
  };

  // --- 2. TERMINE IMPORT ---
  const handleEventUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setLog([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      transformHeader: (h) => h.trim(),
      complete: async (results) => {
        const rows = results.data as any[];
        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
          try {
              const rawTitle = getValue(row, 'titel');
              const rawDate = getValue(row, 'datum');
              const rawTime = getValue(row, 'uhrzeit') || "19:00";
              const rawArt = getValue(row, 'art');
              const rawOrt = getValue(row, 'ort');

              if (!rawTitle) continue;

              const datePart = parseGermanDate(rawDate); 
              if (!datePart) { errorCount++; continue; }

              const cleanTime = rawTime.replace('.', ':').trim();
              const dateObj = new Date(`${datePart}T${cleanTime}:00`);

              let cat = 'general';
              const artLower = rawArt?.toLowerCase() || "";
              if (artLower.includes('training')) cat = 'training';
              else if (artLower.includes('spiel') || artLower.includes('match') || artLower.includes('turnier')) cat = 'match';
              else if (artLower.includes('feier') || artLower.includes('fest') || artLower.includes('versammlung')) cat = 'party';
              else if (artLower.includes('jhv') || artLower.includes('hauptversammlung')) cat = 'jhv';
              else if (artLower.includes('schafkopf')) cat = 'schafkopf';
              else if (artLower.includes('ausflug')) cat = 'trip';

              const payload = {
                title: rawTitle.trim(),
                start_time: dateObj.toISOString(),
                category: cat,
                location: rawOrt?.trim(),
                recurrence_type: 'once',
                is_recurring: false
              };

              const { error } = await supabase.from('events').insert([payload]);
              if (error) throw error;
              successCount++;
          } catch (err) {
              errorCount++;
          }
        }
        setLog([{ msg: `Termine: ${successCount} importiert, ${errorCount} Fehler.`, type: successCount > 0 ? 'success' : 'error' }]);
        setLoading(false);
        e.target.value = "";
      }
    });
  };

  // --- 3. MATRIX IMPORT (Der Wichtige) ---
  const handleMatrixUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setLog([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      transformHeader: (h) => h.trim(),
      complete: async (results) => {
        const rows = results.data as any[];
        const headers = results.meta.fields || [];
        const newLogs: any[] = [];
        
        const dateHeaders = headers.filter(h => parseGermanDate(h) !== null);
        if (dateHeaders.length === 0) {
            setLog([{ msg: "Keine Datums-Spalten (TT.MM.JJJJ) gefunden!", type: 'error' }]);
            setLoading(false);
            return;
        }
        newLogs.push({ msg: `Zeitraum: ${dateHeaders.length} Tage gefunden`, type: 'success' });

        // Mitglieder vorladen
        const { data: allMembers } = await supabase.from('members').select('id, first_name, last_name').eq('is_hidden', false);
        if (!allMembers) { setLoading(false); return; }

        // Event Cache
        const eventCache: Record<string, string> = {}; 

        for (const dateHeader of dateHeaders) {
            const isoDate = parseGermanDate(dateHeader);
            if (!isoDate) continue;

            // Typ-Erkennung
            let isMatch = false, isTournament = false, hasHelpers = false;
            rows.forEach(row => {
                const val = (row[dateHeader] || "").toLowerCase();
                if (val.includes('spieler') || val.includes('kader') || val.includes('aufstellung')) isMatch = true;
                if (val.includes('helfer') || val.includes('turnier')) { isTournament = true; hasHelpers = true; }
            });

            let title = `Training`;
            let category = 'training';

            if (isTournament) { title = `Turnier`; category = 'match'; }
            else if (isMatch) { title = `Spiel`; category = 'match'; }
            else if (hasHelpers && !isMatch) { title = `Event`; category = 'party'; }

            if (title === 'Training') title += ` ${new Date(isoDate).toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit'})}`;

            // Zeitzonen-Fix: Wir nehmen 19:00 Uhr lokal an -> ISO String
            const dateObj = new Date(`${isoDate}T19:00:00`); // Browser locale assumed
            
            // Check ob existiert (ganzer Tag)
            const startOfDay = `${isoDate}T00:00:00`;
            const endOfDay = `${isoDate}T23:59:59`;
            
            const { data: existing } = await supabase.from('events').select('id').gte('start_time', startOfDay).lte('start_time', endOfDay).limit(1).maybeSingle();

            if (existing) {
                eventCache[isoDate] = existing.id;
            } else {
                const { data: newEvent } = await supabase.from('events').insert([{
                    title, 
                    start_time: dateObj.toISOString(), 
                    category, 
                    location: 'Vereinsheim', 
                    is_recurring: false
                }]).select('id').single();
                if (newEvent) eventCache[isoDate] = newEvent.id;
            }
        }

        let recordsCount = 0;
        let missingMembers = 0;

        for (const row of rows) {
            const firstNameRaw = getValue(row, 'vorname');
            const lastNameRaw = getValue(row, 'nachname');
            if (!firstNameRaw || !lastNameRaw) continue;

            const nFirst = normalize(firstNameRaw);
            const nLast = normalize(lastNameRaw);

            let member = allMembers.find(m => normalize(m.last_name) === nLast && normalize(m.first_name) === nFirst);
            if (!member) member = allMembers.find(m => normalize(m.last_name) === nFirst && normalize(m.first_name) === nLast);

            if (!member) {
                if (missingMembers < 5) newLogs.push({ msg: `Nicht gefunden: "${firstNameRaw} ${lastNameRaw}"`, type: 'warning' });
                missingMembers++;
                continue;
            }

            for (const dateHeader of dateHeaders) {
                const rawVal = row[dateHeader];
                const val = rawVal ? rawVal.trim().toLowerCase() : "";
                
                // Leere Felder oder Punkte überspringen
                if (val === '' || val === '.') continue; 

                const isoDate = parseGermanDate(dateHeader);
                const eventId = eventCache[isoDate || ''];
                if (!eventId) continue;

                let status = null;
                
                // MAPPING LOGIK (inkl. "-" für Abwesend)
                if (['-', 'nein', 'abwesend', 'x-', 'x -', 'na'].some(v => val === v)) status = 'absent';
                else if (['mt', 'spieler', 'active', 'anwesend', 'ja', 'x', 'tw', 'torwart'].some(v => val.includes(v))) status = 'active';
                else if (['ot', 'zuschauer', 'passive', 'passiv', 'krank', 'verletzt'].some(v => val.includes(v))) status = 'passive';
                else if (['helfer', 'helper', 'dienst'].some(v => val.includes(v))) status = 'helper';
                else if (['e', 'entschuldigt', 'urlaub'].some(v => val.includes(v))) status = 'excused';
                
                if (status) {
                    const { error } = await supabase.from('attendance').upsert({
                        event_id: eventId, member_id: member.id, status: status
                    }, { onConflict: 'event_id, member_id' });

                    if (!error) recordsCount++;
                }
            }
        }

        if (missingMembers > 0) newLogs.push({ msg: `Gesamt ${missingMembers} Mitglieder nicht gefunden.`, type: 'warning' });
        newLogs.push({ msg: `Fertig! ${recordsCount} Einträge verarbeitet.`, type: 'success' });
        setLog(newLogs);
        setLoading(false);
        e.target.value = "";
      }
    });
  };

  // Dummy Handler für die anderen Buttons (damit TS nicht meckert)
  const handleDummy = () => {};

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Daten Import</h1>
      <p className="text-slate-500 mb-10">Massendaten aus CSV-Dateien (Excel) importieren.</p>

      {log.length > 0 && (
        <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
           {log.map((entry, i) => (
             <div key={i} className={`flex items-start gap-2 mb-1 text-sm ${entry.type === 'success' ? 'text-green-600' : entry.type === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>
               <span className="mt-0.5 flex-shrink-0">
                 {entry.type === 'success' ? <FaCheckCircle/> : <FaExclamationTriangle/>}
               </span>
               <span>{entry.msg}</span>
             </div>
           ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* MITGLIEDER */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl"><FaFileCsv /></div><h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Mitglieder</h2></div>
          <div className="space-y-4">
             <button onClick={() => downloadTemplate('members')} className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors"><FaDownload /> Vorlage</button>
             <div className="relative"><input type="file" accept=".csv" onChange={handleMemberUpload} disabled={loading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><div className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">{loading ? '...' : <><FaUpload /> CSV Upload</>}</div></div>
          </div>
        </div>

        {/* TERMINE */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xl"><FaFileCsv /></div><h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Termine</h2></div>
          <div className="space-y-4">
             <button onClick={() => downloadTemplate('events')} className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors"><FaDownload /> Vorlage</button>
             <div className="relative"><input type="file" accept=".csv" onChange={handleEventUpload} disabled={loading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><div className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">{loading ? '...' : <><FaUpload /> CSV Upload</>}</div></div>
          </div>
        </div>

        {/* MATRIX */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-2 border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl"><FaTable /></div><h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Matrix</h2></div>
          <div className="space-y-4">
             <button onClick={() => downloadTemplate('matrix')} className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors"><FaDownload /> Vorlage</button>
             <div className="relative"><input type="file" accept=".csv" onChange={handleMatrixUpload} disabled={loading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><div className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">{loading ? '...' : <><FaUpload /> Upload Matrix</>}</div></div>
          </div>
        </div>

      </div>
    </div>
  );
}