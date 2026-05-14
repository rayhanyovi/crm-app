"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/constants";
import type { AppUser } from "@/types/enums";

const roleDescriptions = {
  ADMIN: "Full access, audit logs, and team controls.",
  MANAGER: "Team oversight, assignment, and shared pipeline work.",
  SALES: "Front-line CRM workflow for owned records.",
  VIEWER: "Read-only access for browsing demo data.",
} as const;

export function DemoLoginCards({ accounts }: { accounts: AppUser[] }) {
  const router = useRouter();

  const login = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error("Login failed.");
    },
    onSuccess: () => {
      router.replace("/dashboard");
      router.refresh();
    },
    onError: () => toast.error("Unable to switch demo account."),
  });

  return (
    <Card className="w-full max-w-3xl border bg-background shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-2xl tracking-normal">
            UnifiedCRM Demo
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Select an account to continue.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              className="group rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => login.mutate(account.id)}
              disabled={login.isPending}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                    <UserRound className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {account.first_name} {account.last_name}
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {ROLE_LABELS[account.role]}
                    </Badge>
                  </div>
                </div>
                <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-4 min-h-10 text-sm text-muted-foreground">
                {roleDescriptions[account.role]}
              </p>
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Built with Next.js + Supabase</span>
        </div>
      </CardContent>
    </Card>
  );
}
