import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import PageBuilder from "@/components/PageBuilder";


// 1. Nur ÖFFENTLICHE Slugs generieren
export async function generateStaticParams() {
  const query = `*[_type == "page" && isInternal != true]{ "slug": slug.current }`;
  const pages = await client.fetch(query);
  return pages.map((p: any) => ({ slug: p.slug }));
}

// 2. Nur ÖFFENTLICHE Seiten laden
async function getPage(slug: string) {
  const query = `*[_type == "page" && slug.current == $slug && isInternal != true][0] {
    title,
    content[] {
      ...,
      _type == 'galleryRef' => {
        "galleryData": @-> { title, images }
      },
      // NEU: Datei-Infos auflösen
      _type == 'sectionFile' => {
        title,
        description,
        file {
          asset-> {
            url,
            originalFilename,
            size,
            extension
          }
        }
      }
    }
  }`;
  
  return client.fetch(query, { slug }, { next: { revalidate: 60 } });
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) return notFound();

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-20 pt-20">
       <PageBuilder content={page.content} />
    </main>
  );
}