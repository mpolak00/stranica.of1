import { NextRequest, NextResponse } from 'next/server';

const metaBotPatterns = [
  'facebookexternalhit',
  'facebookbot',
  'meta-externalagent',
  'meta-externalads',
  'meta-externalfetcher',
  'FacebookBot',
  'Meta-External'
];

export function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const isMetaCrawler = metaBotPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );

  // Samo za /access rutu radimo cloaking
  if (request.nextUrl.pathname === '/access') {
    if (isMetaCrawler) {
      // Meta botovi vide Instagram clean stranicu
      return NextResponse.rewrite(new URL('/clean.html', request.url));
    }
    // Normalni korisnici vide tvoju originalnu lijepu stranicu (access.html)
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/access',
};