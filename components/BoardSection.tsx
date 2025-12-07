// Datei: components/BoardSection.tsx

import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'

// 1. Sanity Client konfigurieren
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)
function urlFor(source: any) { return builder.image(source) }

// 2. Daten laden (Die echten Personen aus der Datenbank holen)
async function getBoardMembers() {
  return await client.fetch(`
    *[_type == "board"] | order(order asc) {
      _id, name, role, photo
    }
  `)
}

// 3. Die Komponente, die im PageBuilder angezeigt wird
export default async function BoardSection({ headline }: { headline: string }) {
  // Hier holen wir die Daten live
  const members = await getBoardMembers()

  return (
    <section className="py-12 container mx-auto px-4">
      {headline && <h2 className="text-3xl font-bold text-center mb-10">{headline}</h2>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member: any) => (
          <div key={member._id} className="flex flex-col items-center text-center">
            
            {/* Bild */}
            <div className="w-32 h-32 mb-4 relative rounded-full overflow-hidden bg-gray-200">
              {member.photo ? (
                <Image 
                  src={urlFor(member.photo).width(300).height(300).url()} 
                  alt={member.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                // Platzhalter
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
              )}
            </div>

            {/* Name & Rolle */}
            <h3 className="text-xl font-bold">{member.name}</h3>
            <p className="text-gray-600">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}