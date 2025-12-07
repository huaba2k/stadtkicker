import Link from "next/link";
import Image from "next/image";
import { client } from "../../sanity/client"; 
import { urlFor } from "../../sanity/image";
import WeatherWidget from "../../components/WeatherWidget";
import { FaImages, FaArrowRight } from "react-icons/fa";

// Daten laden (ISR: Cache für 60 Sekunden)
async function getData() {
  const postsQuery = `*[_type == "post" && isInternal != true] | order(publishedAt desc)[0...3] {
    _id, title, slug, publishedAt, mainImage, "excerpt": body[0].children[0].text
  }`;
  const albumQuery = `*[_type == "gallery" && isInternal != true] | order(date desc)[0] {
    title, slug, coverImage, date, "imageCount": count(images)
  }`;
  
  const [posts, album] = await Promise.all([
    client.fetch(postsQuery, {}, { next: { revalidate: 60 } }),
    client.fetch(albumQuery, {}, { next: { revalidate: 60 } })
  ]);
  
  return { posts, album };
}

export default async function HomePage() {
  const { posts, album } = await getData();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/hero.jpg"
            alt="Stadion Atmosphäre"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-50 dark:to-slate-950" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
            GARCHINGER <span className="text-primary-400">STADTKICKER</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8 font-medium drop-shadow-md max-w-2xl mx-auto">
            Leidenschaft, Gemeinschaft und Fußball im Herzen von Garching.
            Wir sind mehr als nur ein Verein.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/verein/mitgliedschaft" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-primary-500/25"
            >
              Mitglied werden
            </Link>
            <Link 
              href="/kontakt" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-full font-bold transition-all"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </section>

      {/* Content Bereich */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Linke Spalte: Aktuelle News */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-primary-600 rounded-full"></span>
                Aktuelles
              </h2>
              <Link href="/news" className="text-primary-600 font-semibold hover:underline text-sm">
                Alle News ansehen →
              </Link>
            </div>

            <div className="grid gap-6">
              {posts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm text-center text-slate-500 border border-slate-200 dark:border-slate-800">
                  Aktuell gibt es keine Neuigkeiten.
                </div>
              ) : (
                posts.map((post: any) => (
                  <Link 
                    key={post._id} 
                    href={`/news/${post.slug.current}`}
                    className="group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Bild */}
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                        {post.mainImage ? (
                          <Image
                            src={urlFor(post.mainImage).width(400).height(400).url()}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                            Kein Bild
                          </div>
                        )}
                      </div>
                      
                      {/* Text */}
                      <div className="p-6 flex flex-col justify-center flex-grow">
                        <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">
                          {new Date(post.publishedAt).toLocaleDateString('de-DE')}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Rechte Spalte: Sidebar */}
          <div className="space-y-6">
            
            {/* Wetter Widget */}
            <WeatherWidget />

            {/* GALERIE TEASER (Ersetzt Kalender) */}
            {album ? (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 group relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaImages className="text-purple-500" /> Neuestes Album
                  </h3>
                </div>
                
                <Link href={`/galerie/${album.slug.current}`} className="block relative aspect-video rounded-lg overflow-hidden mb-4">
                    {album.coverImage ? (
                        <Image 
                          src={urlFor(album.coverImage).width(600).height(400).url()} 
                          alt={album.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">Kein Bild</div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-bold">
                        {album.imageCount || 0} Fotos
                    </div>
                </Link>

                <Link href={`/galerie/${album.slug.current}`} className="block">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors truncate">
                        {album.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 mb-3">
                        {album.date ? new Date(album.date).toLocaleDateString('de-DE') : 'Datum unbekannt'}
                    </p>
                    <span className="text-sm font-semibold text-primary-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ansehen <FaArrowRight className="text-xs" />
                    </span>
                </Link>
              </div>
            ) : (
               // Fallback, falls keine Alben da sind
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                  <FaImages className="text-slate-300 text-4xl mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Schau dir unsere Bildergalerie an.</p>
                  <Link href="/galerie" className="text-primary-600 text-sm font-bold hover:underline mt-2 block">Zur Galerie</Link>
               </div>
            )}

            {/* Mach Mit Box */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              
              <h3 className="font-bold text-lg mb-2 relative z-10">Mach mit!</h3>
              <p className="text-primary-100 text-sm mb-6 relative z-10 leading-relaxed">
                Wir suchen immer Verstärkung für unsere Teams und das Vereinsleben.
              </p>
              <Link 
                href="/mitgliedschaft" 
                className="inline-block bg-white text-primary-700 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-50 transition-colors shadow-sm relative z-10"
              >
                Mitglied werden
              </Link>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}