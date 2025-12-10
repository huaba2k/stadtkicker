import Image from "next/image"
import Link from "next/link"
import { client } from "../../../../lib/client"
import { urlForImage } from "../../../../lib/image"

// Typ-Definition für TypeScript
interface Obituary {
  _id: string
  name: string
  image: any
  birthDate?: string
  entryDate?: string
  deathDate: string
  description?: string
  downloadUrl?: string
}

// Daten holen (Neueste zuerst)
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
  return await client.fetch(query)
}

export default async function Gedenkseite() {
  const obituaries = await getObituaries()

  // Helper zum Formatieren des Datums (Deutsch)
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">
          Wir gedenken
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto italic">
          "Das Schönste, was ein Mensch hinterlassen kann, ist ein Lächeln im Gesicht derjenigen, die an ihn denken."
        </p>
        <div className="w-24 h-1 bg-gray-300 mx-auto mt-6"></div>
      </div>

      {/* Grid Layout für die Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {obituaries.map((person: Obituary) => (
          <div 
            key={person._id} 
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
          >
            {/* Bildbereich - Schwarz/Weiß Filter */}
            <div className="relative h-80 w-full bg-gray-100 filter grayscale hover:grayscale-0 transition-all duration-700">
              {person.image && (
                <Image
                  src={urlForImage(person.image).url()}
                  alt={person.name}
                  fill
                  className="object-cover object-top"
                />
              )}
            </div>

            {/* Inhalt */}
            <div className="p-6 text-center flex-grow flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-1 font-serif">
                {person.name}
              </h2>
              
              {/* Lebensdaten Zeile */}
              <div className="text-sm text-gray-500 mb-4 flex justify-center items-center gap-2">
                <span>* {formatDate(person.birthDate)}</span>
                <span className="text-xs">†</span>
                <span className="font-semibold text-gray-700">{formatDate(person.deathDate)}</span>
              </div>

              {/* Zusatzinfos */}
              <div className="mb-4 text-xs text-gray-400 uppercase tracking-wider">
                Mitglied seit {formatDate(person.entryDate)}
              </div>

              {/* Nachruf Text */}
              {person.description && (
                <p className="text-gray-600 text-sm italic mb-6 line-clamp-4 flex-grow">
                  "{person.description}"
                </p>
              )}

              {/* Download Button (nur wenn Datei vorhanden) */}
              {person.downloadUrl && (
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <a 
                    href={`${person.downloadUrl}?dl=`} 
                    className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5l5 5v2m0 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
                    </svg>
                    Parte herunterladen
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}