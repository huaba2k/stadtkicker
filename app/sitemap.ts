import { MetadataRoute } from 'next';
import { client } from '@/sanity/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://garchinger-stadtkicker.de';

  // 1. Statische Hauptseiten
  const staticRoutes = [
    '',
    '/news',
    '/galerie',
    '/kontakt',
    '/sport/hallenturniere',
    '/sport/freundschaftsspiele',
    '/sport/kleinfeldturniere',
    '/stockschuetzen',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamische Seiten aus Sanity (Page Builder)
  // (z.B. Impressum, Satzung, Vorstand)
  const pageQuery = `*[_type == "page" && isInternal != true] { "slug": slug.current, _updatedAt }`;
  const pages = await client.fetch(pageQuery);
  
  const pageRoutes = pages.map((page: any) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page._updatedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  // 3. Dynamische News aus Sanity
  const postQuery = `*[_type == "post" && isInternal != true] { "slug": slug.current, _updatedAt }`;
  const posts = await client.fetch(postQuery);

  const postRoutes = posts.map((post: any) => ({
    url: `${baseUrl}/news/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 4. Dynamische Alben aus Sanity
  const galleryQuery = `*[_type == "gallery" && isInternal != true] { "slug": slug.current, _updatedAt }`;
  const galleries = await client.fetch(galleryQuery);

  const galleryRoutes = galleries.map((gallery: any) => ({
    url: `${baseUrl}/galerie/${gallery.slug}`,
    lastModified: new Date(gallery._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...pageRoutes, ...postRoutes, ...galleryRoutes];
}