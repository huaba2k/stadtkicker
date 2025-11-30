"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes, FaChevronDown, FaCog } from 'react-icons/fa';

const baseNavigation = [
  { name: 'Dashboard', href: '/intern' },
  { name: 'News', href: '/intern/news' },
  { name: 'Kalender', href: '/intern/kalender' }, 
  { name: 'Galerie', href: '/intern/galerie' },
  { name: 'Schafkopf', href: '/intern/schafkopf' },
];

const adminNavigation = [
  { name: 'Mitglieder', href: '/intern/mitglieder' }, 
  { name: 'Statistik', href: '/intern/torschuetzen' },
  { name: 'Berichte', href: '/intern/berichte' },
  { name: 'Downloads', href: '/intern/downloads' },
  { name: 'Import', href: '/intern/admin/import' },
];

export default function NavbarInternal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  
  const [forceMobile, setForceMobile] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkRights = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { data: member } = await supabase.from("members").select("role").eq("email", user.email).maybeSingle();
        if (member && (member.role === 'admin' || member.role === 'board')) {
          setCanEdit(true);
        }
      }
    };
    checkRights();
  }, []);

  // --- OVERFLOW CHECK ---
  useEffect(() => {
    const checkOverflow = () => {
      if (navContainerRef.current && linksRef.current) {
        const containerWidth = navContainerRef.current.offsetWidth;
        const linksWidth = linksRef.current.scrollWidth;
        
        // Wenn Links breiter sind als der Container, auf Mobile umschalten
        if (linksWidth > containerWidth - 20) {
          setForceMobile(true);
        } else {
          setForceMobile(false);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [canEdit]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    // Z-Index hoch gesetzt, damit das Menü über anderen Sticky-Elementen liegt
    <nav className="sticky top-0 z-[100] bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-3 mr-4">
            <Link href="/intern" className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                 <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="hidden sm:block font-bold text-xl text-slate-100">Mitgliederbereich</span>
            </Link>
          </div>

          {/* MITTLERER BEREICH */}
          {/* WICHTIG: 'overflow-hidden' ENTFERNT und durch 'relative' ersetzt */}
          <div className="flex-grow h-full flex items-center justify-center relative" ref={navContainerRef}>
             <div 
                ref={linksRef} 
                className={`flex items-center space-x-1 whitespace-nowrap transition-opacity duration-200 ${forceMobile ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
             >
                {baseNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name}
                      href={item.href} 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive ? "bg-slate-800 text-primary-400 shadow-sm border border-slate-700" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                {/* ADMIN DROPDOWN */}
                {canEdit && (
                  <div className="relative group ml-2">
                    <button 
                      onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                      className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-1 border border-transparent hover:border-slate-700"
                    >
                      <FaCog className="w-4 h-4" />
                      Verwaltung
                      <FaChevronDown className={`w-3 h-3 transition-transform ${showAdminDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* DROPDOWN MENÜ: Hoher Z-Index und absolute Positionierung */}
                    <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl bg-slate-800 border border-slate-700 z-[200] overflow-hidden transition-all origin-top-right ${showAdminDropdown ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-y-0'}`}>
                      {adminNavigation.map((item) => (
                        <Link 
                          key={item.name}
                          href={item.href} 
                          onClick={() => setShowAdminDropdown(false)}
                          className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-primary-400 border-b border-slate-700/50 last:border-0"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* RECHTER BEREICH */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-4">
            <ThemeToggle />
            
            <button onClick={handleLogout} className="hidden md:block bg-red-600/10 hover:bg-red-600 text-red-200 hover:text-white px-3 py-2 rounded-lg text-sm transition-all border border-red-900/30 hover:border-red-500">
              Abmelden
            </button>

            {/* HAMBURGER */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${forceMobile ? 'block' : 'md:hidden'} p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg`}
            >
              {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* MOBILE MENÜ */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-700 bg-slate-900 shadow-xl absolute w-full left-0 z-[90]">
           <div className="px-4 pt-4 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
             <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menü</p>
             {baseNavigation.map((item) => (
               <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
                   {item.name}
               </Link>
             ))}
             
             {canEdit && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                   <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Verwaltung</p>
                   {adminNavigation.map((item) => (
                      <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
                           {item.name}
                       </Link>
                   ))}
                </div>
             )}
             
             <div className="mt-6 pt-4 border-t border-slate-800">
                <button onClick={handleLogout} className="w-full text-left px-3 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-900/20">
                    Abmelden
                </button>
             </div>
           </div>
        </div>
      )}
    </nav>
  );
}