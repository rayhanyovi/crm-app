import { Badge } from "@/components/ui/badge";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DealStage } from "@/types/enums";

const stageVariants: Record<DealStage, string> = {
  LEAD: "border-gray-200 bg-gray-100 text-gray-700",
  QUALIFIED: "border-blue-200 bg-blue-100 text-blue-700",
  PROPOSAL: "border-purple-200 bg-purple-100 text-purple-700",
  NEGOTIATION: "border-amber-200 bg-amber-100 text-amber-700",
  CLOSED_WON: "border-green-200 bg-green-100 text-green-700",
  CLOSED_LOST: "border-red-200 bg-red-100 text-red-700",
};

export function StageBadge({
  stage,
}: {
  stage: DealStage | string;
}) {
  const s = stage as DealStage;
  const label = DEAL_STAGE_LABELS[s] ?? stage;
  const className = stageVariants[s] ?? "border-gray-200 bg-gray-100 text-gray-700";

  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      {label}
    </Badge>
  );
}
