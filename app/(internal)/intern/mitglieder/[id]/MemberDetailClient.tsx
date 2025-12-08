"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake } from 'react-icons/fa';

export default function MemberDetailClient({ id }: { id: string }) {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMember() {
      // Daten für dieses spezielle Mitglied laden
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setMember(data);
      } else {
        console.error('Fehler beim Laden:', error);
      }
      setLoading(false);
    }

    if (id) fetchMember();
  }, [id]);

  if (loading) return <div className="p-10 text-center dark:text-white">Lade Details...</div>;
  if (!member) return <div className="p-10 text-center dark:text-white">Mitglied nicht gefunden.</div>;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link href="/intern/mitglieder" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-6 transition-colors">
        <FaArrowLeft /> Zurück zur Übersicht
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {member.first_name} {member.last_name}
                </h1>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    member.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                    member.status === 'passive' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                {member.role === 'member' ? 'Mitglied' : member.role} • {member.status}
                </span>
            </div>
            {/* Hier könnte ein Profilbild hin, falls vorhanden */}
        </div>

        {/* Inhalt */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-3">Kontakt</h3>
                
                {member.email && (
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <FaEnvelope className="text-slate-400"/> 
                        <a href={`mailto:${member.email}`} className="hover:text-primary-600 hover:underline">{member.email}</a>
                    </div>
                )}
                
                {member.phone && (
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <FaPhone className="text-slate-400"/> 
                        <a href={`tel:${member.phone}`} className="hover:text-primary-600 hover:underline">{member.phone}</a>
                    </div>
                )}

                {member.city_of_residence && (
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <FaMapMarkerAlt className="text-slate-400"/> 
                        <span>{member.city_of_residence}</span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-3">Daten</h3>
                
                {member.birth_date && (
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <FaBirthdayCake className="text-slate-400"/> 
                        <span>{new Date(member.birth_date).toLocaleDateString('de-DE')}</span>
                    </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500">
                        Dabei seit: {member.joined_at ? new Date(member.joined_at).toLocaleDateString('de-DE') : '-'}
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}