"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Member, AppEvent } from "@/types/supabase";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import Link from "next/link";
import { 
  FaFutbol, FaNewspaper, FaImages, FaCalendarAlt, FaUsers, FaFileDownload,
  FaBirthdayCake, FaRunning, FaGlassCheers, FaTrophy, FaMapMarkerAlt, FaArrowRight
} from "react-icons/fa";

type AgendaItem = {
  id: string;
  title: string;
  date: Date;
  type: 'birthday' | 'training' | 'match' | 'party' | 'general' | 'jhv' | 'schafkopf' | 'trip';
  subtitle?: string;
};

export default function InternPage() {
  const [user, setUser] = useState<any>(null);
  const [greetingName, setGreetingName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [latestAlbum, setLatestAlbum] = useState<any>(null); // NEU: Album
  
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      // 1. Auth Check
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // 1b. Name & Rolle
      if (session.user.email) {
        const { data: memberData } = await supabase
          .from('members')
          .select('first_name, role')
          .eq('email', session.user.email)
          .maybeSingle();
        
        if (memberData) {
          setGreetingName(memberData.first_name);
          setUserRole(memberData.role);
        } else {
          setGreetingName(session.user.email.split('@')[0]);
        }
      }

      // 2. Top Scorer (Live Berechnung) - ERWEITERT AUF TOP 5
      const { data: members } = await supabase.from('members').select('id, first_name, last_name').eq('is_hidden', false);
      const { data: matches } = await supabase.from('match_results').select('goal_scorers');
      const statsMap: Record<string, number> = {};
      if (matches) {
        matches.forEach((match: any) => {
           const scorersList = match.goal_scorers || [];
           scorersList.forEach((s: any) => {
              statsMap[s.member_id] = (statsMap[s.member_id] || 0) + s.goals;
           });
        });
      }
      const calculatedScorers = (members || []).map((m: any) => ({
         ...m,
         stats_goals: statsMap[m.id] || 0
      })).filter((m: any) => m.stats_goals > 0).sort((a: any, b: any) => b.stats_goals - a.stats_goals).slice(0, 5); // Jetzt Top 5
      setTopScorers(calculatedScorers);

      // 3. News (Sanity) - ERWEITERT AUF 4 ARTIKEL
      try {
        const newsQuery = `*[_type == "post"] | order(publishedAt desc)[0..3] { 
          _id, title, slug, publishedAt 
        }`;
        const newsData = await client.fetch(newsQuery);
        setLatestNews(newsData);
      } catch (e) { console.error("Fehler News:", e); }

      // 4. Galerie (Sanity) - NEU
      try {
        // Holt das neueste Album (egal ob intern oder öffentlich)
        const albumQuery = `*[_type == "gallery"] | order(date desc)[0] {
            title, slug, coverImage, date, "imageCount": count(images)
        }`;
        const albumData = await client.fetch(albumQuery);
        setLatestAlbum(albumData);
      } catch (e) { console.error("Fehler Galerie:", e); }

      // 5. Agenda laden
      await loadAgenda();
      setLoading(false);
    };
    
    loadData();
  }, [router]);

  const loadAgenda = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

    const { data: events } = await supabase.from('events').select('*').order('start_time', { ascending: true });
    const { data: members } = await supabase.from('members').select('id, first_name, last_name, birth_date, is_hidden').eq('is_hidden', false);

    let items: AgendaItem[] = [];

    if (events) {
      (events as AppEvent[]).forEach(e => {
        const startDate = new Date(e.start_time);
        const category = (['birthday', 'training', 'match', 'party', 'general', 'jhv', 'schafkopf', 'trip'].includes(e.category) ? e.category : 'general') as AgendaItem['type'];

        if (!e.is_recurring) {
          if (startDate >= today && startDate <= endDate) {
            items.push({ id: e.id, title: e.title, date: startDate, type: category, subtitle: e.location });
          }
        } else if (e.recurrence_type === 'weekly') {
          let date = new Date(startDate);
          if (date < today) {
             const diffDays = Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
             const weeksToAdd = Math.ceil(diffDays / 7);
             date.setDate(date.getDate() + (weeksToAdd * 7));
          }
          while (date <= endDate) {
            const dateStr = date.toISOString().split('T')[0];
            if (!e.recurrence_exceptions?.includes(dateStr)) {
               items.push({ id: e.id + date.getTime(), title: e.title, date: new Date(date), type: category, subtitle: e.location });
            }
            date.setDate(date.getDate() + 7);
          }
        }
      });
    }

    if (members) {
      members.forEach((m: any) => {
        if (!m.birth_date) return;
        const bday = new Date(m.birth_date);
        const currentYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        const nextYearBday = new Date(today.getFullYear() + 1, bday.getMonth(), bday.getDate());
        [currentYearBday, nextYearBday].forEach(d => {
          if (d >= today && d <= endDate) {
             const age = d.getFullYear() - bday.getFullYear();
             items.push({ id: `bday-${m.id}-${d.getTime()}`, title: `Geburtstag: ${m.first_name} ${m.last_name}`, date: d, type: 'birthday', subtitle: `wird ${age} Jahre` });
          }
        });
      });
    }

    items.sort((a, b) => a.date.getTime() - b.date.getTime());
    setAgendaItems(items.slice(0, 8));
  };
  
  const getFormattedTime = (date: Date) => date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }) + ' Uhr';

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birthday': return <FaBirthdayCake className="text-amber-500" />;
      case 'match': return <FaFutbol className="text-green-600" />;
      case 'training': return <FaRunning className="text-blue-500" />;
      case 'party': return <FaGlassCheers className="text-purple-500" />;
      case 'jhv': return <FaUsers className="text-red-600" />;
      case 'schafkopf': return <FaTrophy className="text-emerald-600" />;
      case 'trip': return <FaMapMarkerAlt className="text-indigo-600" />;
      default: return <FaCalendarAlt className="text-slate-400" />;
    }
  };
  
  const isAdminOrBoard = userRole === 'admin' || userRole === 'board';

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Servus, {greetingName}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Willkommen im internen Bereich.
            </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LINKER HAUPTBEREICH */}
          <div className="flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Torjäger Widget (GROSS) */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow min-h-[300px]">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaFutbol className="text-primary-600" /> Top Torjäger
                  </h3>
                  <Link href="/intern/torschuetzen" className="text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-1 rounded font-bold transition-colors">
                    Alle anzeigen →
                  </Link>
                </div>
                {topScorers.length === 0 ? (
                  <div className="flex-grow flex items-center justify-center text-slate-400 text-sm italic">
                    Noch keine Tore.
                  </div>
                ) : (
                  <ul className="space-y-3 flex-grow">
                    {topScorers.map((player, index) => (
                      <li key={player.id} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            {index + 1}
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {player.first_name} {player.last_name.charAt(0)}.
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{player.stats_goals}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* News Widget (GROSS) */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow min-h-[300px]">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaNewspaper className="text-blue-600" /> Aktuelles
                  </h3>
                  <Link href="/intern/news" className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded font-bold transition-colors">
                    Alle News →
                  </Link>
                </div>
                {latestNews.length === 0 ? (
                  <div className="flex-grow flex items-center justify-center text-slate-400 text-sm italic">
                    Keine neuen Infos.
                  </div>
                ) : (
                  <div className="space-y-3 flex-grow">
                    {latestNews.map((news) => (
                      <Link key={news._id} href={`/intern/news/${news.slug.current}`} className="block group p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="text-xs text-slate-500 mb-0.5">
                           {new Date(news.publishedAt).toLocaleDateString('de-DE')}
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {news.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* GALERIE-VORSCHAU (Ersetzt kleine Kachel) */}
              <div className="md:col-span-2">
                {latestAlbum ? (
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 group relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4 relative z-10">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FaImages className="text-purple-500" /> Neuestes Album
                        </h3>
                        <Link href="/intern/galerie" className="text-xs text-purple-600 hover:underline">Alle Alben →</Link>
                        </div>
                        
                        <Link href={`/intern/galerie/${latestAlbum.slug.current}`} className="block relative aspect-[21/9] md:aspect-[3/1] rounded-lg overflow-hidden mb-3">
                            {latestAlbum.coverImage ? (
                                <Image 
                                src={urlFor(latestAlbum.coverImage).width(800).height(300).url()} 
                                alt={latestAlbum.title} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">Kein Bild</div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-bold">
                                {latestAlbum.imageCount || 0} Fotos
                            </div>
                        </Link>

                        <Link href={`/intern/galerie/${latestAlbum.slug.current}`} className="block">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors truncate text-lg">
                                {latestAlbum.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {latestAlbum.date ? new Date(latestAlbum.date).toLocaleDateString('de-DE') : 'Datum unbekannt'}
                            </p>
                        </Link>
                    </div>
                ) : (
                    // Fallback, falls keine Galerie da ist
                    <Link href="/intern/galerie" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all group flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><FaImages size={24}/></div>
                        <div><h3 className="font-bold text-slate-900 dark:text-white">Fotos</h3><p className="text-sm text-slate-500">Bilder von Feiern & Spielen</p></div>
                    </Link>
                )}
              </div>

              {/* NAVIGATION (Kleiner) */}
              <Link href="/intern/kalender" className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all group flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><FaCalendarAlt size={20}/></div><div><h3 className="font-bold text-slate-900 dark:text-white">Kalender</h3><p className="text-xs text-slate-500">Termine verwalten</p></div>
              </Link>
              
              <Link href="/intern/schafkopf" className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border hover:border-primary-500 transition-all group flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><FaTrophy size={20}/></div><div><h3 className="font-bold text-slate-900 dark:text-white">Schafkopf</h3><p className="text-xs text-slate-500">Runden & Ergebnisse</p></div>
              </Link>

              {/* ADMIN-ONLY KACHELN */}
              {isAdminOrBoard && (
                <>
                    <Link href="/intern/mitglieder" className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border hover:border-primary-500 transition-all group flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><FaUsers size={20}/></div>
                        <div><h3 className="font-bold text-slate-900 dark:text-white">Mitglieder</h3><p className="text-xs text-slate-500">Adressen & Statistiken</p></div>
                    </Link>

                    <Link href="/intern/downloads" className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border hover:border-primary-500 transition-all group flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><FaFileDownload size={20}/></div>
                        <div><h3 className="font-bold text-slate-900 dark:text-white">Downloads</h3><p className="text-xs text-slate-500">Satzung & Formulare</p></div>
                    </Link>
                </>
              )}

            </div>
          </div>

          {/* RECHTE SEITE: SIDEBAR (AGENDA) */}
          <div className="w-full lg:w-80 flex-shrink-0">
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center"><h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Demnächst</h3><Link href="/intern/kalender" className="text-xs text-primary-600 hover:underline">Zum Kalender →</Link></div>
                <div className="max-h-[500px] overflow-y-auto">
                   {agendaItems.length === 0 ? <p className="p-6 text-center text-slate-500 text-sm">Keine Termine in den nächsten Wochen.</p> : (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                        {agendaItems.map((item) => (
                           <li key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                              <div className="flex items-start gap-3">
                                 <div className="flex flex-col items-center min-w-[3rem] bg-slate-100 dark:bg-slate-700 rounded p-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">{item.date.toLocaleDateString('de-DE', { month: 'short', timeZone: 'Europe/Berlin' })}</span>
                                    <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">{item.date.getDate()}</span>
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">{getEventIcon(item.type)} {item.title}</h4>
                                    <div className="text-xs text-slate-500 mt-1 flex flex-col">
                                       <span>{item.type === 'birthday' ? 'Ganztägig' : getFormattedTime(item.date)}</span>
                                       {item.subtitle && <span className="opacity-75">{item.subtitle}</span>}
                                    </div>
                                 </div>
                              </div>
                           </li>
                        ))}
                      </ul>
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}