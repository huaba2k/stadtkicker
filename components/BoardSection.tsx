// Datei: components/BoardSection.tsx

import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'

// --- Sanity Client Konfiguration ---
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  // useCdn: true, // Im Zweifel 'false' für sofortige Updates beim Testen
  useCdn: false, 
})

const builder = imageUrlBuilder(client)
function urlFor(source: any) { return builder.image(source) }

// --- Daten abrufen ---
async function getBoardMembers() {
  // Wir holen die Daten und sortieren sie nach dem 'order' Feld
  return await client.fetch(`
    *[_type == "board"] | order(order asc) {
      _id, 
      name, 
      role, 
      photo
    }
  `)
}

// --- Die Komponente für die Webseite ---
export default async function BoardSection({ headline }: { headline: string }) {
  const members = await getBoardMembers()

  // Falls keine Mitglieder angelegt sind, zeigen wir nichts an
  if (!members || members.length === 0) {
    return null;
  }

  return (
    <section className="py-16 container mx-auto px-4">
      {headline && (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {headline}
        </h2>
      )}
      
      {/* Grid Layout für die Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 l">
        
        {members.map((member: any) => (
          // --- DIE KARTE (Hover-Effekt Start) ---
          // 'group': Ermöglicht es, Kind-Elemente beim Hover des Elternteils zu ändern
          // 'hover:-translate-y-2': Bewegt die Karte nach oben
          // 'hover:shadow-xl': Macht den Schatten größer
          <div 
            key={member._id} 
            className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
          >
            
            {/* --- BILD CONTAINER --- */}
            {/* 'overflow-hidden' ist wichtig für den Zoom-Effekt */}
            <div className="w-40 h-40 mb-6 relative rounded-full overflow-hidden bg-gray-100 shadow-inner border-4 border-white">
              {member.photo ? (
                // --- DAS FOTO (Zoom) ---
                // 'group-hover:scale-110': Zoomt das Bild, wenn die Karte gehovert wird
                <Image 
                  src={urlFor(member.photo).width(400).height(400).url()} 
                  alt={member.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                // --- DER PLATZHALTER (Zoom & Farbe) ---
                <div className="w-full h-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0NM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* --- TEXT --- */}
            <h3 className="text-xl font-bold text-gray-900 mb-1">
                {member.name}
            </h3>
            <div className="h-1 w-12 bg-primary-500 rounded mb-3 group-hover:w-20 transition-all duration-300"></div>
            <p className="text-gray-600 font-medium uppercase tracking-wider text-sm">
                {member.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}