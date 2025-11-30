import Hero from "../../components/Hero"; // Pfad ggf. anpassen
import Link from "next/link";
import Image from "next/image";
import { client } from "../../sanity/client";
import { urlFor } from "../../sanity/image";
import WeatherWidget from "../../components/WeatherWidget";

async function getData() {
  const postsQuery = `*[_type == "post" && isInternal != true] | order(publishedAt desc)[0...3] { ... }`;
  const albumQuery = `*[_type == "gallery" && isInternal != true] | order(date desc)[0] { ... }`;
  
  const [posts, album] = await Promise.all([
    // NEU: Beide mit 60s Cache
    client.fetch(postsQuery, {}, { next: { revalidate: 60 } }),
    client.fetch(albumQuery, {}, { next: { revalidate: 60 } })
  ]);
  
  return { posts, album };
}

// 1. Wir definieren, wie ein Artikel aussieht (TypeScript hilft uns hier)
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage: any;
}

// 2. Diese Funktion holt die Daten von Sanity
async function getPosts() {
  // Der Query in der Sprache "GROQ"
  // Wir holen Titel, Slug, Datum und Bild von allen 'post' Typen
  // Sortiert nach Datum (neueste zuerst), maximal 4 Stück
  // Nachher: Wir schließen interne aus (!= true deckt 'false' und 'null' ab)
const query = `*[_type == "post" && isInternal != true] | order(publishedAt desc)[0...4] { ... }`;
  
  return client.fetch(query);
}

export default async function Home() {
  // Hier rufen wir die Daten ab
  const posts: Post[] = await getPosts();

  return (
    <main>
      <Hero />

      {/* Intro Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Herzlich Willkommen
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Seit unserer Gründung stehen wir für Spaß am Sport und geselliges Beisammensein. 
            Ob auf dem Rasen beim Fußball oder auf der Bahn beim Stockschießen – 
            bei den Garchinger Stadtkickern ist jeder willkommen.
          </p>
        </div>
      </section>

      {/* News & Termine */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Linke Spalte: DYNAMISCHE Berichte aus Sanity */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Aktuelles</h3>
                <Link href="/news" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Alle News ansehen →
                </Link>
              </div>
              
              <div className="space-y-6">
                {/* Wir gehen durch die Liste der Posts und erstellen für jeden eine Karte */}
                {posts.map((post) => (
                  <Link 
                    key={post._id} 
                    href={`/news/${post.slug.current}`}
                    className="block group bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-32">
                      {/* Bild */}
                      <div className="w-1/3 relative bg-slate-200">
                        {post.mainImage && (
                          <Image
                            src={urlFor(post.mainImage).width(400).url()}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                      
                      {/* Text */}
                      <div className="w-2/3 p-4 flex flex-col justify-center">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {post.title}
                        </h4>
                        <span className="text-slate-400 text-xs">
                          {new Date(post.publishedAt).toLocaleDateString('de-DE', {
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Falls keine Posts da sind */}
                {posts.length === 0 && (
                  <p className="text-slate-500 italic">Noch keine Nachrichten vorhanden.</p>
                )}
              </div>
            </div>

            {/* Rechte Spalte: Termine & Wetter (Statisch vorerst) */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Nächste Termine</h3>
                <Link href="/termine" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Kalender →
                </Link>
              </div>

              <div className="space-y-4">
                <div className="flex items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex flex-col items-center justify-center w-16 h-16 rounded-lg mr-4 font-bold leading-none">
                    <span className="text-xl">12</span>
                    <span className="text-xs uppercase">Dez</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Weihnachtsfeier</h4>
                    <p className="text-sm text-slate-500">19:00 Uhr • Vereinsheim</p>
                  </div>
                </div>
              </div>

              {/* Wetter Widget Placeholder */}
              <WeatherWidget />
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}