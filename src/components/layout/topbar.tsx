"use client";

import { Bell, LogOut, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { DemoAccountSwitcher } from "@/components/layout/demo-account-switcher";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/lib/constants";
import type { AppUser } from "@/types/enums";

function breadcrumbFromPath(pathname: string) {
  const [first] = pathname.split("/").filter(Boolean);
  if (!first) return "Dashboard";
  return first
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Topbar({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      toast.error("Unable to log out.");
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div>
        <div className="text-sm font-medium">{breadcrumbFromPath(pathname)}</div>
        <div className="hidden text-xs text-muted-foreground sm:block">
          UnifiedCRM demo
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden gap-2 md:flex">
          <Search className="h-4 w-4" />
          <span className="text-muted-foreground">Search</span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Ctrl K
          </kbd>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <UserAvatar user={user} className="h-7 w-7" />
              <span className="hidden text-sm font-medium sm:inline">
                {user.first_name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <UserAvatar user={user} className="h-9 w-9" />
                <div className="min-w-0">
                  <div className="truncate text-sm">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="mt-3">
                {ROLE_LABELS[user.role]}
              </Badge>
            </DropdownMenuLabel>
            <DemoAccountSwitcher currentUser={user} />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
