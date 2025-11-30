import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlFor } from "../sanity/image";
import Gallery from "./Gallery";
import { FaFileAlt, FaDownload } from "react-icons/fa"; // FIX: React Icons nutzen

// Helper für Dateigröße
const formatSize = (bytes: number) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
};

export default function PageBuilder({ content }: { content: any[] }) {
  if (!content) return null;

  return (
    <div className="flex flex-col gap-12">
      {content.map((block) => {
        
        // 1. TEXT
        if (block._type === 'sectionText') {
          return (
            <section key={block._key} className="max-w-4xl mx-auto px-4 w-full">
              {block.heading && <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">{block.heading}</h2>}
              <div className="prose prose-lg dark:prose-invert">
                <PortableText value={block.text} />
              </div>
            </section>
          );
        }

        // 2. HERO BILD
        if (block._type === 'sectionHero') {
          return (
            <section key={block._key} className="relative w-full h-[300px] md:h-[500px]">
              {block.image && (
                <Image 
                   src={urlFor(block.image).url()} 
                   alt={block.caption || 'Banner'} 
                   fill 
                   className="object-cover"
                />
              )}
              {block.caption && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h1 className="text-3xl md:text-5xl font-bold text-white text-center px-4 drop-shadow-md">{block.caption}</h1>
                </div>
              )}
            </section>
          );
        }

        // 3. GALERIE
        if (block._type === 'galleryRef' && block.galleryData) {
           const images = block.galleryData.images?.map((img: any) => ({
               src: urlFor(img).url(), width: 800, height: 600, alt: "Galeriebild"
           })) || [];
           
           return (
             <section key={block._key} className="max-w-7xl mx-auto px-4 w-full">
                <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{block.galleryData.title}</h3>
                <Gallery images={images} />
             </section>
           );
        }

        // 4. DATEI DOWNLOAD
        if (block._type === 'sectionFile' && block.file?.asset) {
          return (
             <section key={block._key} className="max-w-4xl mx-auto px-4 w-full">
                <a 
                  href={`${block.file.asset.url}?dl=${block.title}.pdf`} 
                  className="group flex items-center p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-500 hover:shadow-md transition-all"
                >
                   <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <FaFileAlt size={24} />
                   </div>
                   <div className="flex-grow">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-primary-600 transition-colors">
                        {block.title}
                      </h4>
                      {block.description && <p className="text-slate-500 text-sm">{block.description}</p>}
                      <div className="text-xs text-slate-400 mt-1 font-mono uppercase flex gap-2">
                         <span>{block.file.asset.extension}</span>
                         <span>•</span>
                         <span>{formatSize(block.file.asset.size)}</span>
                      </div>
                   </div>
                   <div className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors">
                      <FaDownload size={20} />
                   </div>
                </a>
             </section>
          );
        }

        return null;
      })}
    </div>
  );
}