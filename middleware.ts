import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/', '/suggestions', '/calendar'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.has('firebase-authtoken');

  if (authRoutes.includes(pathname) && authed) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (protectedRoutes.includes(pathname) && !authed) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
