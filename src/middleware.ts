import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── LEGACY URL MAP (old path → new path, permanent 308) ────────────────────
// Add any routes that ever changed here to preserve SEO equity forever.
// "/" is the only home address — never redirect anything else to it accidentally.
const LEGACY_REDIRECTS: Record<string, string> = {
  '/home':                  '/',
  '/index':                 '/',
  '/index.html':            '/',
  '/shop':                  '/category/all',
  '/faq':                   '/faqs',
  '/faq/':                  '/faqs',
  '/policy':                '/privacy-policy',
  '/data-privacy':          '/data-policy',
  '/shipping':              '/shipment-policy',
  '/returns':               '/return-policy',
  '/refund-policy':         '/return-policy',
  '/tnc':                   '/terms',
  '/terms-and-conditions':  '/terms',
  '/disclaimer.html':       '/disclaimer',
  '/contact-us':            '/contact',
  '/about-us':              '/about',
  '/track':                 '/track-order',
};

// ─── PATHS THAT MUST NEVER BE INDEXED ───────────────────────────────────────
const NOINDEX_PREFIXES = [
  '/admin-login',
  '/api',
  '/_next',
  '/search',
  '/checkout',
  '/success',
];

export function middleware(request: NextRequest) {
  const url      = request.nextUrl.clone();
  const pathname = url.pathname;

  // ── 1. Remove trailing slash (except root "/") ────────────────────────────
  if (pathname !== '/' && pathname.endsWith('/')) {
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url.toString(), { status: 308 });
  }

  // ── 2. Lowercase URL enforcement (skip assets) ────────────────────────────
  const isAsset =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    /\.(ico|png|jpg|jpeg|webp|svg|gif|css|js|woff|woff2|ttf|eot|map)$/i.test(pathname);

  if (!isAsset && pathname !== pathname.toLowerCase()) {
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url.toString(), { status: 308 });
  }

  // ── 3. Legacy URL redirects ───────────────────────────────────────────────
  if (LEGACY_REDIRECTS[pathname]) {
    url.pathname = LEGACY_REDIRECTS[pathname];
    return NextResponse.redirect(url.toString(), { status: 308 });
  }

  // ── 4. Admin: block indexing + no caching ────────────────────────────────
  if (pathname.startsWith('/admin-login')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  // ── 5. API + _next: noindex header ───────────────────────────────────────
  const isNoindex = NOINDEX_PREFIXES.some((p) => pathname.startsWith(p));
  if (isNoindex) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT static assets:
     * - _next/static, _next/image
     * - favicon, logo, image files
     */
    '/((?!_next/static|_next/image|favicon|Favicon|Logo|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)).*)',
  ],
};
