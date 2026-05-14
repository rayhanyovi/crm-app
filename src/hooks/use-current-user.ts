"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiSuccess } from "@/types/api";
import type { AppUser } from "@/types/enums";

async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me");

  if (!response.ok) {
    throw new Error("Unable to load current user.");
  }

  const payload = (await response.json()) as ApiSuccess<AppUser>;
  return payload.data;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
  });
}
