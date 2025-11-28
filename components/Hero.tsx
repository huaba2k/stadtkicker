import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative bg-primary-900 h-[600px] flex items-center">
      {/* Hintergrundbild */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/hero.jpg" // Das Bild aus dem public Ordner
          alt="Garchinger Stadtkicker Mannschaftsfoto"
          fill
          className="object-cover opacity-60" // opacity macht es etwas dunkler für besseren Textkontrast
          priority // Wichtig: Das Bild wird sofort geladen (gut für Google/LCP)
        />
        {/* Ein zusätzlicher Farbverlauf, damit der Text noch besser lesbar ist */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-900/40" />
      </div>

      {/* Text Inhalt */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-full">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
          Garchinger <span className="text-primary-300">Stadtkicker</span>
        </h1>
        <p className="text-xl text-slate-200 max-w-2xl mb-8">
          Mehr als nur Fußball. Gemeinschaft, Leidenschaft und Tradition in Garching.
          Wir sind der Treffpunkt für Hobby-Kicker und Stockschützen.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/kontakt" 
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Mitspielen
          </Link>
          <Link 
            href="/news" 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Aktuelle Berichte
          </Link>
        </div>
      </div>
    </div>
  );
}