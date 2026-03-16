import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin-login/',
          '/admin-login',
          '/api/',
          '/api',
          '/_next/',
          '/customer/register',
          '/customer/login',
          '/customer/forget-password',
          '/checkout/',
          '/checkout',
          '/success',
          '/search',
          '/search/',
        ],
      },
    ],
    sitemap: 'https://www.lalafashion.store/sitemap.xml',
    host:    'https://www.lalafashion.store',
  };
}
