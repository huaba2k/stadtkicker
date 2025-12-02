import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/intern/', '/studio/', '/api/'],
    },
    sitemap: 'https://garchinger-stadtkicker.de/sitemap.xml',
  };
}