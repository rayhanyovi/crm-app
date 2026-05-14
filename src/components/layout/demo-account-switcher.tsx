"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/lib/constants";
import type { ApiSuccess } from "@/types/api";
import type { AppUser } from "@/types/enums";

async function fetchDemoAccounts() {
  const response = await fetch("/api/auth/demo-accounts");
  if (!response.ok) throw new Error("Unable to load demo accounts.");
  const payload = (await response.json()) as ApiSuccess<AppUser[]>;
  return payload.data;
}

export function DemoAccountSwitcher({ currentUser }: { currentUser: AppUser }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useQuery({
    queryKey: ["auth", "demo-accounts"],
    queryFn: fetchDemoAccounts,
  });

  const login = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error("Account switch failed.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.refresh();
      toast.success("Demo account switched.");
    },
    onError: () => toast.error("Unable to switch account."),
  });

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Switch account</DropdownMenuLabel>
      {accounts.map((account) => (
        <DropdownMenuItem
          key={account.id}
          className="flex items-center justify-between gap-3"
          onClick={() => login.mutate(account.id)}
          disabled={login.isPending}
        >
          <span>
            {account.first_name} {account.last_name}
            <span className="ml-2 text-xs text-muted-foreground">
              {ROLE_LABELS[account.role]}
            </span>
          </span>
          {account.id === currentUser.id ? <Check className="h-4 w-4" /> : null}
        </DropdownMenuItem>
      ))}
    </>
  );
}
