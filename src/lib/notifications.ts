import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

type NotificationInsert = {
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
};

type NotificationClient = {
  from(table: "notifications"): {
    insert(values: NotificationInsert): Promise<{ error: Error | null }>;
  };
};

export async function createNotification({
  userId,
  type,
  title,
  message,
  entityType,
  entityId,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}) {
  if (!hasSupabaseConfig()) return;

  const supabase = (await createServerSupabaseClient()) as unknown as NotificationClient;
  const { error } = await supabase.from("notifications").insert({
    recipient_id: userId,
    type,
    title,
    message,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
  });

  if (error) throw error;
}
