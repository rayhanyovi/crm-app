import { getServiceSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

type AuditAction = Database["public"]["Enums"]["audit_action"];
type EntityType = Database["public"]["Enums"]["entity_type"];

export async function createAuditLog(input: {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  metadata?: Json;
}) {
  if (!hasSupabaseConfig()) return;

  const supabase = getServiceSupabaseClient();
  await supabase.from("audit_logs").insert({
    user_id: input.userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    metadata: input.metadata ?? null,
  });
}
