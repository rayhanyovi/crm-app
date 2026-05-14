import type { NextRequest } from "next/server";

import {
  protectDemoSession,
  updateSupabaseSession,
} from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSupabaseSession(request);
  return protectDemoSession(request, supabaseResponse);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)"],
};
