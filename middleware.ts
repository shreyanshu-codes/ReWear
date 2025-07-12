import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/', '/suggestions', '/calendar'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.has('firebase-authtoken');

  if (protectedRoutes.includes(pathname) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)'],
};
