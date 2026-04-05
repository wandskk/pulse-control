import { type NextRequest, NextResponse } from "next/server";

/** Mesmo valor que `lib/constants/session.ts`. */
const SESSION_COOKIE_NAME = "pulse_session";

/**
 * Next.js 16+: `proxy.ts` corre em runtime **Node.js** (não Edge), evitando
 * `ReferenceError: __dirname is not defined` e outros limites do Edge na Vercel.
 * JWT continua validado nas rotas API (`getSessionFromRequest` / jose).
 */
function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim());
}

function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

export async function proxy(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/icon-192.png" ||
    pathname === "/icon-512.png"
  ) {
    return NextResponse.next();
  }

  const hasCookie = hasSessionCookie(request);

  if (pathname.startsWith("/api/")) {
    if (!hasCookie) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
