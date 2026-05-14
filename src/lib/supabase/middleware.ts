import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEMO_USER_COOKIE } from "@/lib/constants";
import type { Database } from "@/types/database";

const PUBLIC_PATHS = [
  "/login",
  "/manifest.json",
  "/sw.js",
  "/favicon.ico",
  "/icon.svg",
];

function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export async function updateSupabaseSession(request: NextRequest) {
  const { url, key } = getSupabaseEnv();

  if (!url || !key || key.startsWith("replace-with-")) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return supabaseResponse;
}

export function protectDemoSession(
  request: NextRequest,
  response: NextResponse = NextResponse.next(),
) {
  const { pathname } = request.nextUrl;
  const isPublicPath =
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith("/icons/")) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next");

  const hasDemoSession = Boolean(request.cookies.get(DEMO_USER_COOKIE)?.value);

  if (!hasDemoSession && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasDemoSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
