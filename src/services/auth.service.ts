import { cookies } from "next/headers";

import { DEMO_USER_COOKIE } from "@/lib/constants";
import {
  getServiceSupabaseClient,
  hasSupabaseConfig,
} from "@/lib/supabase/server";
import type { AppUser } from "@/types/enums";

export const DEMO_ACCOUNTS: AppUser[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "admin@unifiedcrm.demo",
    first_name: "Admin",
    last_name: "User",
    avatar_url: null,
    role: "ADMIN",
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "manager@unifiedcrm.demo",
    first_name: "Manager",
    last_name: "User",
    avatar_url: null,
    role: "MANAGER",
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    email: "sales@unifiedcrm.demo",
    first_name: "Sales",
    last_name: "Rep",
    avatar_url: null,
    role: "SALES",
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    email: "viewer@unifiedcrm.demo",
    first_name: "Viewer",
    last_name: "User",
    avatar_url: null,
    role: "VIEWER",
    is_active: true,
  },
];

function normalizeUser(user: AppUser): AppUser {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar_url: user.avatar_url,
    role: user.role,
    is_active: user.is_active ?? true,
  };
}

export async function getDemoAccounts(): Promise<AppUser[]> {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("id,email,first_name,last_name,avatar_url,role,is_active")
      .eq("is_active", true)
      .order("role", { ascending: true });

    if (!error && data?.length) {
      return data.map((user) => normalizeUser(user as AppUser));
    }
  }

  return DEMO_ACCOUNTS;
}

export async function getDemoAccount(userId: string) {
  const accounts = await getDemoAccounts();
  return accounts.find((account) => account.id === userId) ?? null;
}

export async function demoLogin(userId: string) {
  const user = await getDemoAccount(userId);
  if (!user) return null;

  const cookieStore = await cookies();
  cookieStore.set(DEMO_USER_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_USER_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(DEMO_USER_COOKIE)?.value;
  if (!userId) return null;

  return getDemoAccount(userId);
}
