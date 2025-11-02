import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');

    // Allow access to auth pages when not authenticated
    if (isAuthPage && !isAuth) {
      return NextResponse.next();
    }

    // Redirect to signin if not authenticated and trying to access protected routes
    if (!isAuth && !isAuthPage && !isApiAuthRoute) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Role-based access control
    if (isAuth && token.role) {
      const userRole = token.role as string;
      const pathname = req.nextUrl.pathname;

      // Collection routes - only for COLLECTION and ADMIN roles
      if (pathname.startsWith('/collections') && !['COLLECTION', 'ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      // Production routes - only for PRODUCTION and ADMIN roles
      if (pathname.startsWith('/production') && !['PRODUCTION', 'ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      // Dashboard routes - all authenticated users can access
      // Public routes are accessible without authentication
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public/).*)',
  ],
};