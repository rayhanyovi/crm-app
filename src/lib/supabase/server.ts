import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

type ServerClient = ReturnType<typeof createServerClient<Database>>;

let serviceClient: ServerClient | null = null;

function isConfigured(value: string | undefined) {
  return Boolean(value && !value.startsWith("replace-with-"));
}

function getPublicSupabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getServerSupabaseKey() {
  return isConfigured(process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : getPublicSupabaseKey();
}

export function hasSupabaseConfig() {
  const values = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ];

  return values.every(isConfigured);
}

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverKey = getServerSupabaseKey();

  if (!url || !serverKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, serverKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; Route Handlers can.
        }
      },
    },
  });
}

export function getServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverKey = getServerSupabaseKey();

  if (!url || !serverKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  serviceClient ??= createServerClient<Database>(url, serverKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });

  return serviceClient;
}
