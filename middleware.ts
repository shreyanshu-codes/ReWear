import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/suggestions', '/calendar'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.has('firebase-authtoken');

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)'],
};
