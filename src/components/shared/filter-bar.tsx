"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useTransition } from "react";

import { Input } from "@/components/ui/input";

export function FilterBar({
  searchPlaceholder = "Search...",
  filters,
}: {
  searchPlaceholder?: string;
  filters?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={searchPlaceholder}
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(event) => updateSearch(event.target.value)}
          aria-busy={isPending}
        />
      </div>
      {filters ? <div className="flex items-center gap-2">{filters}</div> : null}
    </div>
  );
}
