"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';

// BASIS-LINKS (Das sieht jeder, AUCH das normale Mitglied)
// WICHTIG: "Mitglieder" ist hier NICHT dabei!
const baseNavigation = [
  { name: 'Dashboard', href: '/intern' },
  { name: 'News', href: '/intern/news' },
  { name: 'Galerie', href: '/intern/galerie' },
  { name: 'Kalender', href: '/intern/kalender' }, 
  { name: 'Downloads', href: '/intern/downloads' },
  { name: 'Torschützen', href: '/intern/torschuetzen' },
  { name: 'Schafkopf', href: '/intern/schafkopf' },
];

export default function NavbarInternal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // State für das Menü
  const [menuItems, setMenuItems] = useState(baseNavigation);

  useEffect(() => {
    const checkRights = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email) {
        // Wir prüfen die Rolle in der members Tabelle
        const { data: member } = await supabase
          .from("members")
          .select("role")
          .eq("email", user.email)
          .maybeSingle();
        
        // Nur wenn Admin oder Vorstand -> Link "Mitglieder" hinzufügen
        if (member && (member.role === 'admin' || member.role === 'board')) {
          // Wir fügen "Mitglieder" an vorletzter Stelle ein (vor Statistik) oder am Ende
          const adminNav = [...baseNavigation];
          // Einfügen an Position 5 (nach Downloads)
          adminNav.splice(5, 0, { name: 'Mitglieder', href: '/intern/mitglieder' });
          setMenuItems(adminNav);
        }
      }
    };
    
    checkRights();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center">
            {/* INTERN LOGO */}
            <Link href="/intern" className="font-bold text-xl flex items-center gap-3 mr-8">
              <div className="relative w-8 h-8">
                 <Image 
                   src="/logo.png" 
                   alt="Logo" 
                   fill
                   className="object-contain"
                 />
              </div>
              <span className="hidden md:block text-slate-100">Mitgliederbereich</span>
            </Link>

            {/* Desktop Menü */}
            <div className="hidden md:flex space-x-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-800 text-primary-400 shadow-sm border border-slate-700"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <button
              onClick={handleLogout}
              className="hidden md:block bg-red-600/10 hover:bg-red-600 text-red-200 hover:text-white px-3 py-2 rounded-lg text-sm transition-all border border-red-900/30 hover:border-red-500"
            >
              Abmelden
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menü */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 shadow-xl">
           <div className="px-2 pt-2 pb-3 space-y-1">
             {menuItems.map((item) => {
               const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
               return (
                 <Link
                   key={item.name}
                   href={item.href}
                   onClick={() => setIsOpen(false)}
                   className={`block px-3 py-3 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-slate-900 text-primary-400" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                   }`}
                 >
                   {item.name}
                 </Link>
               )
             })}
             <button
              onClick={handleLogout}
              className="w-full text-left mt-4 block px-3 py-3 rounded-md text-base font-medium text-red-400 hover:bg-slate-900 hover:text-red-300"
            >
              Abmelden
            </button>
           </div>
        </div>
      )}
    </nav>
  );
}