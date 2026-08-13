import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// Next.js 16 renombró `middleware` a `proxy` (nodejs runtime, ya no
// edge). Mantenemos a propósito el nombre/convención clásica
// `middleware.ts` en edge runtime porque @opennextjs/cloudflare (nuestro
// target de deploy) todavía no soporta "Node.js middleware" — ver
// https://opennext.js.org. Nuestra lógica solo usa `jose` y
// `next/server`, 100% compatible con edge, así que no perdemos nada.
//
// Protege las rutas de panel según el rol de la sesión (JWT en cookie
// httpOnly) y evita que alguien ya logueado vuelva a /login o /registro.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAuthRoute = pathname === "/login" || pathname === "/registro";
  const isTrainerRoute = pathname.startsWith("/trainer");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!session) {
    if (isTrainerRoute || isDashboardRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = session.role === "TRAINER" ? "/trainer" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isTrainerRoute && session.role !== "TRAINER") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isDashboardRoute && session.role !== "USER") {
    const url = request.nextUrl.clone();
    url.pathname = "/trainer";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/trainer/:path*", "/dashboard/:path*", "/login", "/registro"],
};
