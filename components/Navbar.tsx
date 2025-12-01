"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
// NEU: FaShoppingCart hinzugefügt
import { FaBars, FaTimes, FaChevronDown, FaShoppingCart } from 'react-icons/fa';

// Wir erweitern die Struktur um 'target' (optional)
const navigation = [
  { name: 'Start', href: '/' },
  { 
    name: 'Der Verein', 
    href: '#', 
    children: [
      { name: 'Vorstand', href: '/vorstand' },
      { name: 'Mitgliedschaft', href: '/mitgliedschaft' },
      //{ name: 'Satzung', href: '/satzung' },  
   ]
  },
  {
    name: 'Sport',
    href: '#',
    children: [
      { name: 'Alle News', href: '/news' },
      { name: 'Hallenturniere', href: '/sport/hallenturniere' },
      { name: 'Freundschaftsspiele', href: '/sport/freundschaftsspiele' },
      { name: 'Kleinfeld', href: '/sport/kleinfeldturniere' },
      { name: 'Stockschützen', href: '/stockschuetzen' },
    ]
  },
  { name: 'Galerie', href: '/galerie' },
  
  // --- NEU: SHOP LINK (Extern) ---
  { 
    name: 'Shop', 
    href: 'https://shop-primosport.de/garchinger-stadtkicker', // <-- Hier deine URL eintragen
    target: '_blank' // Öffnet im neuen Tab
  },
  
  { name: 'Kontakt', href: '/kontakt' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  const [forceMobile, setForceMobile] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (navContainerRef.current && linksRef.current) {
        const containerWidth = navContainerRef.current.offsetWidth;
        const linksWidth = linksRef.current.scrollWidth;
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
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-primary-50/90 dark:bg-slate-900/90 border-b border-primary-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-3 mr-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image src="/logo.png" alt="Garchinger Stadtkicker" fill className="object-contain" priority />
              </div>
              <span className="font-bold text-xl text-primary-700 dark:text-primary-400 hidden sm:block">
                Garchinger Stadtkicker
              </span>
            </Link>
          </div>

          {/* LINK CONTAINER */}
          <div className="flex-grow h-full flex items-center justify-center relative" ref={navContainerRef}>
            <div 
                ref={linksRef}
                className={`flex items-center space-x-1 whitespace-nowrap transition-opacity ${forceMobile ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
            >
                {navigation.map((item) => (
                <div key={item.name} className="relative group">
                    {item.children ? (
                    <>
                        <button className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 group-hover:text-primary-600">
                        {item.name}
                        <FaChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                        </button>
                        <div className="absolute left-0 mt-0 w-56 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-[60]">
                        <div className="py-1">
                            {item.children.map((subItem) => (
                            <Link key={subItem.name} href={subItem.href} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors">
                                {subItem.name}
                            </Link>
                            ))}
                        </div>
                        </div>
                    </>
                    ) : (
                    <Link 
                        href={item.href} 
                        target={(item as any).target} // Target setzen (_blank)
                        rel={(item as any).target === '_blank' ? 'noopener noreferrer' : undefined}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                             pathname === item.href 
                             ? "text-primary-600 bg-primary-100/50 dark:bg-primary-900/30 dark:text-primary-400" 
                             : "text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-slate-800/50"
                        }`}
                    >
                        {/* Icon nur beim Shop anzeigen */}
                        {item.name === 'Shop' && <FaShoppingCart className="w-4 h-4" />}
                        {item.name}
                    </Link>
                    )}
                </div>
                ))}
            </div>
          </div>

          {/* RECHTS */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-4">
              <ThemeToggle />
              <Link href="/login" className="hidden md:inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
                Intern
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`${forceMobile ? 'block' : 'md:hidden'} text-slate-600 dark:text-slate-300 hover:text-primary-600 p-2`}>
                {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-lg overflow-y-auto max-h-[80vh]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)} className="w-full flex justify-between items-center px-3 py-3 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors">
                      {item.name}
                      <FaChevronDown className={`w-4 h-4 transform transition-transform ${openSubmenu === item.name ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openSubmenu === item.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-4 space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-md my-1 py-1">
                        {item.children.map((subItem) => (
                          <Link key={subItem.name} href={subItem.href} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link 
                    href={item.href} 
                    target={(item as any).target}
                    rel={(item as any).target === '_blank' ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-colors"
                  >
                    {item.name === 'Shop' && <FaShoppingCart className="w-4 h-4" />}
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 px-2 pb-4">
               <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg text-base font-medium shadow-sm">Interner Bereich</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}