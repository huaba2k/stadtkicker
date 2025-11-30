import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import PageBuilder from "@/components/PageBuilder";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

// 1. Nur INTERNE Slugs generieren
export async function generateStaticParams() {
  const query = `*[_type == "page" && isInternal == true]{ "slug": slug.current }`;
  const pages = await client.fetch(query);
  return pages.map((p: any) => ({ slug: p.slug }));
}

// 2. Nur INTERNE Seiten laden
async function getInternalPage(slug: string) {
  const query = `*[_type == "page" && slug.current == $slug && isInternal == true][0] {
    title,
    content[] {
      ...,
      _type == 'galleryRef' => {
        "galleryData": @-> { title, images }
      }
    }
  }`;
  
  return client.fetch(query, { slug }, { next: { revalidate: 60 } });
}

export default async function DynamicInternalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getInternalPage(slug);

  if (!page) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Zurück Button für bessere Navigation im internen Bereich */}
        <Link href="/intern" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-8 transition-colors">
          <FaArrowLeft className="mr-2" /> Zurück zum Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
           <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-800">
             {page.title}
           </h1>
           
           {/* Hier wird der gleiche PageBuilder benutzt wie öffentlich! */}
           <PageBuilder content={page.content} />
        </div>
      </div>
    </div>
  );
}