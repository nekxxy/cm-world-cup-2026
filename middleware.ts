import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

/** Routes that require a valid session. */
export const config = {
  matcher: ["/settings/:path*", "/onboarding/:path*"],
};

export async function middleware(req: NextRequest) {
  const secret = process.env.JWT_SECRET;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  let valid = false;
  if (secret && token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
