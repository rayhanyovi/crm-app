"use client";

import {
  Activity,
  BarChart3,
  Building2,
  ContactRound,
  FileSearch,
  HandCoins,
  LayoutDashboard,
  ListChecks,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/enums";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: ListChecks },
  { href: "/contacts", label: "Contacts", icon: ContactRound },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/deals", label: "Deals", icon: HandCoins },
  { href: "/activities", label: "Activities", icon: Activity },
];

export function Sidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const adminNav = [
    can(user, "manage_users", "user")
      ? { href: "/team", label: "Team", icon: UsersRound }
      : null,
    can(user, "view_audit_logs", "audit_log")
      ? { href: "/audit-logs", label: "Audit Logs", icon: FileSearch }
      : null,
  ].filter(Boolean) as typeof primaryNav;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r bg-sidebar md:block">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-none">UnifiedCRM</div>
          <div className="mt-1 text-xs text-muted-foreground">Demo workspace</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        {primaryNav.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
          />
        ))}

        {adminNav.length ? (
          <>
            <Separator className="my-3" />
            {adminNav.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </>
        ) : null}
      </nav>
    </aside>
  );
}

function SidebarLink({
  item,
  active,
}: {
  item: (typeof primaryNav)[number];
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}
