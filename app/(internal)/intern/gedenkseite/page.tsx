import { client } from "@/lib/client"
import { urlForImage } from "@/lib/image"
import Image from "next/image"

// WICHTIG: Damit wir neue Einträge sofort sehen (kein Caching)
export const dynamic = 'force-dynamic';

async function getObituaries() {
  const query = `*[_type == "obituary"] | order(deathDate desc) {
    _id,
    name,
    image,
    birthDate,
    entryDate,
    deathDate,
    description,
    "downloadUrl": download.asset->url
  }`
  const data = await client.fetch(query);
  return data;
}

export default async function InternalGedenkseite() {
  const obituaries = await getObituaries();

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    })
  }
 
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gedenkseite (Intern)</h1>
        <p className="text-slate-500">Wir gedenken unseren verstorbenen Mitgliedern.</p>
      </div>

      {obituaries.length === 0 ? (
         <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-slate-500">
            <p>Aktuell keine Einträge gefunden.</p>
            <p className="text-xs mt-2 opacity-70">
              Tipp: Hast du im Sanity Studio beim Eintrag auf den grünen "Publish"-Knopf gedrückt?
            </p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obituaries.map((person: any) => (
            <div key={person._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm flex flex-col">
              
              {/* Bildbereich (Schwarz/Weiß) */}
              <div className="relative h-64 w-full bg-slate-100 filter grayscale">
                {person.image ? (
                  <Image
                    src={urlForImage(person.image).url()}
                    alt={person.name}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Kein Foto</div>
                )}
              </div>

              <div className="p-6 text-center flex-grow flex flex-col">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-1">
                  {person.name}
                </h2>
                
                <div className="text-sm text-slate-500 mb-4 flex justify-center items-center gap-2">
                  <span>* {formatDate(person.birthDate)}</span>
                  <span>† <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(person.deathDate)}</span></span>
                </div>

                {person.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm italic mb-4 line-clamp-4 leading-relaxed">
                    "{person.description}"
                  </p>
                )}

                {person.downloadUrl && (
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                    <a href={`${person.downloadUrl}?dl=`} className="text-xs font-bold text-primary-600 hover:text-primary-800 uppercase tracking-wider">
                      Parte herunterladen
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}