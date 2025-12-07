import Image from "next/image";
import { PortableText } from "@portabletext/react";
// Wir nutzen den sicheren Alias @ für Importe
import { urlFor } from "@/sanity/image";
import Gallery from "@/components/Gallery";
import FileDownload from "@/components/FileDownload";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import InfoBox from "@/components/InfoBox";
import BoardSection from '@/components/BoardSection';


// Typ-Definition für einen Block (damit TypeScript glücklich ist)
type Block = {
  _type: string;
  _key: string;
  [key: string]: any; // Erlaubt beliebige weitere Felder
};
const ptComponents = {
    types: {
      sectionFile: ({ value }: any) => (
        <FileDownload 
          title={value.title} 
          description={value.description} 
          fileUrl={value.file?.asset?.url} 
          size={value.file?.asset?.size} 
          extension={value.file?.asset?.extension}
        />
      ),
      sectionVideo: ({ value }: any) => (
        <YouTubeEmbed 
          url={value.url} 
          caption={value.caption} 
        />
      ),
      sectionInfo: ({ value }: any) => (
        <InfoBox 
          title={value.title} 
          text={value.text} 
          type={value.type} 
        />
      )
    }
};

export default function PageBuilder({ content }: { content: any[] }) {
  if (!content) return null;

  return (
    <div className="flex flex-col gap-12">
      {content.map((block) => {

        
        // 1. TEXT ABSCHNITT
        if (block._type === 'sectionText') {
          return (
            <section key={block._key} className="max-w-4xl mx-auto px-4 w-full">
              {block.heading && (
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                  {block.heading}
                </h2>
              )}
              <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
                {/* Hier übergeben wir die Komponenten-Konfiguration an den Text-Renderer */}
                <PortableText value={block.text} components={ptComponents} />
              </div>
            </section>
          );
        }

        // 2. HERO BILD (Großes Banner)
        if (block._type === 'sectionHero') {
          return (
            <section key={block._key} className="relative w-full h-[300px] md:h-[500px]">
              {block.image && (
                <Image 
                   src={urlFor(block.image).url()} 
                   alt={block.caption || 'Banner'} 
                   fill 
                   className="object-cover"
                   priority // Lädt dieses Bild bevorzugt (gut für LCP)
                />
              )}
              {block.caption && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h1 className="text-3xl md:text-5xl font-bold text-white text-center px-4 drop-shadow-md">
                    {block.caption}
                  </h1>
                </div>
              )}
            </section>
          );
        }

        // 3. GALERIE
        if (block._type === 'galleryRef' && block.galleryData) {
           const images = block.galleryData.images?.map((img: any) => ({
               src: urlFor(img).url(), 
               width: 1200, 
               height: 800, 
               alt: "Galeriebild"
           })) || [];
           
           return (
             <section key={block._key} className="max-w-7xl mx-auto px-4 w-full">
                {block.galleryData.title && (
                  <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white text-center md:text-left">
                    {block.galleryData.title}
                  </h3>
                )}
                <Gallery images={images} />
             </section>
           );
        }

        // 4. DATEI DOWNLOAD (Als eigenständiger Block)
        if (block._type === 'sectionFile' && block.file?.asset) {
          return (
             <section key={block._key} className="max-w-4xl mx-auto px-4 w-full">
                <FileDownload 
                  title={block.title} 
                  description={block.description} 
                  fileUrl={block.file.asset.url} 
                  size={block.file.asset.size} 
                  extension={block.file.asset.extension}
                />
             </section>
          );
        }

        // 5. YOUTUBE VIDEO (Als eigenständiger Block)
        if (block._type === 'sectionVideo') {
            return (
                <section key={block._key} className="max-w-4xl mx-auto px-4 w-full">
                    <YouTubeEmbed url={block.url} caption={block.caption} />
                </section>
            );
        }

        // 6. INFO BOX (Als eigenständiger Block)
        if (block._type === 'sectionInfo') {
            return (
                <section key={block._key} className="max-w-4xl mx-auto px-4 w-full">
                    <InfoBox title={block.title} text={block.text} type={block.type} />
                </section>
            );
        }

        if (block._type === 'boardSection') {
          return (
            <BoardSection 
              key={block._key} 
              headline={block.headline} 
            />
          );
        }

        return null;
      })}
    </div>
  );
}