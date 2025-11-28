"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

const navigation = [
  { name: 'Start', href: '/' },
  { 
    name: 'Der Verein', 
    href: '#', 
    children: [
      { name: 'Vorstand', href: '/verein/vorstand' },
      { name: 'Mitgliedschaft', href: '/verein/mitgliedschaft' },
      { name: 'Satzung', href: '/verein/satzung' },
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
  { name: 'Kontakt', href: '/kontakt' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-primary-50/90 dark:bg-slate-900/90 border-b border-primary-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* LOGO BEREICH */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image 
                  src="/logo.png" 
                  alt="Garchinger Stadtkicker" 
                  fill
                  className="object-contain"
                  priority 
                />
              </div>
              <span className="font-bold text-xl text-primary-700 dark:text-primary-400 hidden sm:block">
                Garchinger Stadtkicker
              </span>
            </Link>
          </div>

          {/* DESKTOP MENÜ */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.children ? (
                  <>
                    <button className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 group-hover:text-primary-600">
                      {item.name}
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className="absolute left-0 mt-0 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                      <div className="py-1">
                        {item.children.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href 
                        ? "text-primary-600 bg-primary-100/50 dark:bg-primary-900/30 dark:text-primary-400" 
                        : "text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-primary-200 dark:border-slate-700">
              <ThemeToggle />
              <Link 
                href="/login" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Intern
              </Link>
            </div>
          </div>

          {/* MOBILE MENÜ BUTTON */}
          <div className="flex md:hidden items-center gap-4">
             <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-white p-2"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU PANEL */}
      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                      className="w-full flex justify-between items-center px-3 py-3 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {item.name}
                      <svg 
                        className={`w-4 h-4 transform transition-transform duration-200 ${openSubmenu === item.name ? 'rotate-180 text-primary-600' : 'text-slate-400'}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSubmenu === item.name ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-4 space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-md my-1 py-1">
                        {item.children.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 px-2">
               <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg text-base font-medium transition-colors shadow-sm"
              >
                Interner Bereich
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}