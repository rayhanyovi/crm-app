import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  Technology: "border-blue-200 bg-blue-50 text-blue-700",
  Healthcare: "border-green-200 bg-green-50 text-green-700",
  Finance: "border-purple-200 bg-purple-50 text-purple-700",
  Logistics: "border-amber-200 bg-amber-50 text-amber-700",
  WEBSITE: "border-blue-200 bg-blue-50 text-blue-700",
  REFERRAL: "border-green-200 bg-green-50 text-green-700",
  EVENT: "border-amber-200 bg-amber-50 text-amber-700",
  COLD_CALL: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

export function StatusBadge({
  value,
  fallback = "Unassigned",
}: {
  value: string | null | undefined;
  fallback?: string;
}) {
  const label = value ?? fallback;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", value ? variants[value] : "bg-muted text-muted-foreground")}
    >
      {label.replaceAll("_", " ")}
    </Badge>
  );
}
