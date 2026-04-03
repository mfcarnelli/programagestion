import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirigir si no está logueado a /login (esto lo hace next-auth por defecto, pero aquí podríamos agregar reglas de ROLES)
    if (!token && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Reglas de ejemplo para roles:
    if (path.startsWith("/admin") && token?.rol !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url)); // No tiene permisos
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page shouldn't redirect to itself)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
