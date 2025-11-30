import Link from "next/link";
import WeatherWidget from "./WeatherWidget";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // DESIGN UPDATE: Dunkler Hintergrund (primary-950) und heller Text
    <footer className="bg-primary-950 text-slate-300 mt-auto border-t border-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Spalte 1: Verein */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-500 rounded-full"></div> {/* Kleines Logo Icon */}
              Garchinger Stadtkicker
            </h3>
            <p className="text-primary-200/80 text-sm leading-relaxed">
              Leidenschaft, Tradition und Gemeinschaft in Garching.<br />
              Fußball und Stockschützen unter einem Dach.
            </p>
          </div>

          {/* Spalte 2: Links */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Rechtliches</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/impressum" className="text-sm hover:text-white hover:underline transition-all decoration-primary-500 underline-offset-4">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-sm hover:text-white hover:underline transition-all decoration-primary-500 underline-offset-4">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-sm hover:text-white hover:underline transition-all decoration-primary-500 underline-offset-4">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Spalte 3: Kontakt */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Kontakt</h3>
            <div className="flex flex-col space-y-3 text-sm">
              <a href="mailto:info@garchinger-stadtkicker.de" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                kontakt@garchinger-stadtkicker.de
              </a>
              {/* Wetter Widget kommt hier später rein, passt super auf den dunklen Hintergrund */}

                <WeatherWidget />
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-primary-900 pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-400">
            &copy; {currentYear} Garchinger Stadtkicker e.V.
          </p>
          <p className="text-xs text-primary-500 flex items-center gap-1">
            Made with <span className="text-red-500">♥</span> for Football
          </p>
        </div>
      </div>
    </footer>
  );
}