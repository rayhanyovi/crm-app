import { ForbiddenError, NotFoundError } from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { can, type AuthUser } from "@/lib/permissions";
import { getServiceSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type {
  DealAssignInput,
  DealCreateInput,
  DealListQuery,
  DealPipelineQuery,
  DealStageInput,
  DealUpdateInput,
} from "@/lib/validators/deal";
import { DEMO_ACCOUNTS } from "@/services/auth.service";
import { demoStore } from "@/services/demo-data";
import type {
  Deal,
  DealDetail,
  DealListItem,
  DealStageHistory,
  PaginationMeta,
  PipelineStageData,
} from "@/types/crm";
import { DEAL_STAGE_ORDER } from "@/lib/constants";
import type { DealStage } from "@/types/enums";

function now() {
  return new Date().toISOString();
}

function paginate<T>(
  rows: T[],
  page: number,
  pageSize: number,
): { rows: T[]; meta: PaginationMeta } {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    rows: rows.slice(start, end),
    meta: { total: rows.length, page, pageSize, hasMore: end < rows.length },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isClosedStage(stage: DealStage) {
  return stage === "CLOSED_WON" || stage === "CLOSED_LOST";
}

function dealOwnerId(deal: Pick<Deal, "assigned_to_id" | "created_by_id">) {
  return deal.assigned_to_id ?? deal.created_by_id;
}

type ServiceSupabaseClient = ReturnType<typeof getServiceSupabaseClient>;

type DealStageHistoryInsert = {
  deal_id: string;
  from_stage: DealStage | null;
  to_stage: DealStage;
  changed_by_id: string;
  note: string | null;
};

type DealStageHistoryTable = {
  insert(row: DealStageHistoryInsert): Promise<{ error: Error | null }>;
  select(columns: string): {
    eq(column: "deal_id", value: string): {
      order(
        column: "created_at",
        options: { ascending: boolean },
      ): Promise<{ data: unknown[] | null; error: Error | null }>;
    };
  };
};

function dealStageHistoryTable(supabase: ServiceSupabaseClient) {
  return (supabase as unknown as {
    from(table: "deal_stage_history"): DealStageHistoryTable;
  }).from("deal_stage_history");
}

function decorateDemoDeals(deals: Deal[]): DealListItem[] {
  return deals.map((deal) => {
    const contact = demoStore.contacts.find((c) => c.id === deal.contact_id);
    const company = deal.company_id
      ? demoStore.companies.find((c) => c.id === deal.company_id)
      : null;
    const assignee = deal.assigned_to_id
      ? DEMO_ACCOUNTS.find((u) => u.id === deal.assigned_to_id)
      : null;
    return {
      ...deal,
      contact_name: contact
        ? `${contact.first_name} ${contact.last_name}`
        : "Unknown",
      company_name: company?.name ?? null,
      assignee_name: assignee
        ? `${assignee.first_name} ${assignee.last_name}`
        : null,
    };
  });
}

// ─── Supabase helpers ──────────────────────────────────────────────────────────

async function enrichSupabaseDeals(deals: Deal[]): Promise<DealListItem[]> {
  if (!deals.length) return [];
  const supabase = getServiceSupabaseClient();

  const contactIds = [...new Set(deals.map((d) => d.contact_id))];
  const companyIds = [
    ...new Set(deals.map((d) => d.company_id).filter(Boolean) as string[]),
  ];
  const assigneeIds = [
    ...new Set(deals.map((d) => d.assigned_to_id).filter(Boolean) as string[]),
  ];

  const [contacts, companies, assignees] = await Promise.all([
    supabase
      .from("contacts")
      .select("id,first_name,last_name")
      .in("id", contactIds),
    companyIds.length
      ? supabase.from("companies").select("id,name").in("id", companyIds)
      : Promise.resolve({ data: [] }),
    assigneeIds.length
      ? supabase
          .from("users")
          .select("id,first_name,last_name")
          .in("id", assigneeIds)
      : Promise.resolve({ data: [] }),
  ]);

  return deals.map((deal) => {
    const contact = contacts.data?.find((c) => c.id === deal.contact_id);
    const company = companies.data?.find((c) => c.id === deal.company_id);
    const assignee = assignees.data?.find((u) => u.id === deal.assigned_to_id);
    return {
      ...deal,
      contact_name: contact
        ? `${contact.first_name} ${contact.last_name}`
        : "Unknown",
      company_name: company?.name ?? null,
      assignee_name: assignee
        ? `${assignee.first_name} ${assignee.last_name}`
        : null,
    };
  });
}

// ─── list ─────────────────────────────────────────────────────────────────────

export async function listDeals(query: DealListQuery) {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    let req = supabase.from("deals").select("*", { count: "exact" }).is("deleted_at", null);

    if (query.stage) req = req.eq("stage", query.stage);
    if (query.assigned_to_id) req = req.eq("assigned_to_id", query.assigned_to_id);
    if (query.company_id) req = req.eq("company_id", query.company_id);
    if (query.value_min !== undefined) req = req.gte("value", query.value_min);
    if (query.value_max !== undefined) req = req.lte("value", query.value_max);
    if (query.search) req = req.ilike("title", `%${query.search}%`);

    const start = (query.page - 1) * query.pageSize;
    const { data, error, count } = await req
      .order(query.sortBy, { ascending: query.sortOrder === "asc" })
      .range(start, start + query.pageSize - 1);

    if (error) throw error;

    const rows = await enrichSupabaseDeals((data ?? []) as Deal[]);
    return {
      rows,
      meta: {
        total: count ?? rows.length,
        page: query.page,
        pageSize: query.pageSize,
        hasMore: query.page * query.pageSize < (count ?? rows.length),
      },
    };
  }

  const search = query.search?.toLowerCase();
  const filtered = demoStore.deals
    .filter((d) => !d.deleted_at)
    .filter((d) => !query.stage || d.stage === query.stage)
    .filter((d) => !query.assigned_to_id || d.assigned_to_id === query.assigned_to_id)
    .filter((d) => !query.company_id || d.company_id === query.company_id)
    .filter((d) => query.value_min === undefined || d.value >= query.value_min)
    .filter((d) => query.value_max === undefined || d.value <= query.value_max)
    .filter((d) => !search || d.title.toLowerCase().includes(search));

  const sorted = [...filtered].sort((a, b) => {
    const av = String(a[query.sortBy as keyof Deal] ?? "");
    const bv = String(b[query.sortBy as keyof Deal] ?? "");
    return query.sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const decorated = decorateDemoDeals(sorted);
  return paginate(decorated, query.page, query.pageSize);
}

// ─── pipeline ────────────────────────────────────────────────────────────────

export async function getPipeline(query: DealPipelineQuery): Promise<PipelineStageData[]> {
  let deals: DealListItem[];

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    let req = supabase.from("deals").select("*").is("deleted_at", null);
    if (query.assigned_to_id) req = req.eq("assigned_to_id", query.assigned_to_id);
    const { data, error } = await req.order("created_at", { ascending: true });
    if (error) throw error;
    deals = await enrichSupabaseDeals((data ?? []) as Deal[]);
  } else {
    const filtered = demoStore.deals
      .filter((d) => !d.deleted_at)
      .filter((d) => !query.assigned_to_id || d.assigned_to_id === query.assigned_to_id);
    deals = decorateDemoDeals(filtered);
  }

  return DEAL_STAGE_ORDER.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      totalValue: stageDeals.reduce((sum, d) => sum + d.value, 0),
      deals: stageDeals,
    };
  });
}

// ─── getById ──────────────────────────────────────────────────────────────────

export async function getDealDetail(id: string): Promise<DealDetail> {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) throw new NotFoundError("Deal not found.");

    const [enriched] = await enrichSupabaseDeals([data as Deal]);
    const [contact, company, stageHistory, activities] = await Promise.all([
      supabase
        .from("contacts")
        .select("id,first_name,last_name,email,phone")
        .eq("id", data.contact_id)
        .maybeSingle(),
      data.company_id
        ? supabase
            .from("companies")
            .select("id,name,industry")
            .eq("id", data.company_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("deal_stage_history")
        .select("*, changed_by:users(first_name,last_name)")
        .eq("deal_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activities")
        .select("id,type,subject,completed_at,created_at")
        .eq("deal_id", id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      ...enriched,
      contact: contact.data ?? null,
      company: company.data ?? null,
      stage_history: (stageHistory.data ?? []) as DealStageHistory[],
      recent_activities: (activities.data ?? []) as DealDetail["recent_activities"],
    };
  }

  const deal = demoStore.deals.find((d) => d.id === id && !d.deleted_at);
  if (!deal) throw new NotFoundError("Deal not found.");

  const [enriched] = decorateDemoDeals([deal]);
  const contact = demoStore.contacts.find((c) => c.id === deal.contact_id) ?? null;
  const company = deal.company_id
    ? demoStore.companies.find((c) => c.id === deal.company_id) ?? null
    : null;
  const history = demoStore.dealStageHistory
    .filter((h) => h.deal_id === id)
    .map((h) => {
      const changer = DEMO_ACCOUNTS.find((u) => u.id === h.changed_by_id);
      return {
        ...h,
        changed_by: changer
          ? { first_name: changer.first_name, last_name: changer.last_name }
          : undefined,
      };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return {
    ...enriched,
    contact: contact
      ? {
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
        }
      : null,
    company: company
      ? { id: company.id, name: company.name, industry: company.industry }
      : null,
    stage_history: history,
    recent_activities: demoStore.activities
      .filter((a) => {
        const activity = a as typeof a & { deal_id?: string | null };
        return activity.deal_id === id;
      })
      .map((a) => ({
        id: a.id,
        type: a.type,
        subject: a.subject,
        completed_at: a.completed_at,
        created_at: a.created_at,
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5),
  };
}

// ─── create ──────────────────────────────────────────────────────────────────

export async function createDeal(input: DealCreateInput, userId: string) {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("deals")
      .insert({ ...input, assigned_to_id: userId, created_by_id: userId })
      .select("*")
      .single();

    if (error) throw error;

    // Initial stage history entry
    const historyInsert = await dealStageHistoryTable(supabase).insert({
      deal_id: data.id,
      from_stage: null,
      to_stage: data.stage,
      changed_by_id: userId,
      note: null,
    });
    if (historyInsert.error) throw historyInsert.error;

    await createAuditLog({
      userId,
      action: "CREATE",
      entityType: "DEAL",
      entityId: data.id,
      metadata: { title: data.title, stage: data.stage },
    });

    const [enriched] = await enrichSupabaseDeals([data as Deal]);
    return enriched;
  }

  const timestamp = now();
  const deal: Deal = {
    id: crypto.randomUUID(),
    title: input.title,
    value: input.value ?? 0,
    stage: input.stage ?? "LEAD",
    contact_id: input.contact_id,
    company_id: input.company_id ?? null,
    lead_id: input.lead_id ?? null,
    assigned_to_id: userId,
    expected_close_date: input.expected_close_date ?? null,
    lost_reason: null,
    closed_at: null,
    created_by_id: userId,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };
  demoStore.deals.unshift(deal);

  const historyEntry: DealStageHistory = {
    id: crypto.randomUUID(),
    deal_id: deal.id,
    from_stage: null,
    to_stage: deal.stage,
    changed_by_id: userId,
    note: null,
    created_at: timestamp,
  };
  demoStore.dealStageHistory.unshift(historyEntry);

  const [enriched] = decorateDemoDeals([deal]);
  return enriched;
}

// ─── update ───────────────────────────────────────────────────────────────────

export async function updateDeal(
  id: string,
  input: DealUpdateInput,
  user: AuthUser,
) {
  const deal = hasSupabaseConfig()
    ? await getDealDetail(id)
    : demoStore.deals.find((d) => d.id === id && !d.deleted_at);
  if (!deal) throw new NotFoundError("Deal not found.");

  if (!can(user, "update", "deal", { ownerId: dealOwnerId(deal) })) {
    throw new ForbiddenError("You cannot update this deal.");
  }

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("deals")
      .update({ ...input, updated_at: now() })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) throw new NotFoundError("Deal not found.");
    await createAuditLog({ userId: user.id, action: "UPDATE", entityType: "DEAL", entityId: id });
    const [enriched] = await enrichSupabaseDeals([data as Deal]);
    return enriched;
  }

  const index = demoStore.deals.findIndex((d) => d.id === id);
  if (index === -1) throw new NotFoundError("Deal not found.");
  demoStore.deals[index] = { ...demoStore.deals[index], ...input, updated_at: now() };
  const [enriched] = decorateDemoDeals([demoStore.deals[index]]);
  return enriched;
}

// ─── changeStage ──────────────────────────────────────────────────────────────

export async function changeDealStage(
  id: string,
  input: DealStageInput,
  user: AuthUser,
) {
  const deal = hasSupabaseConfig()
    ? await getDealDetail(id)
    : demoStore.deals.find((d) => d.id === id && !d.deleted_at);
  if (!deal) throw new NotFoundError("Deal not found.");

  // Reopening a closed deal requires MANAGER+
  if (isClosedStage(deal.stage as DealStage) && !isClosedStage(input.stage)) {
    if (!can(user, "reopen", "deal")) {
      throw new ForbiddenError("Only managers can reopen a closed deal.");
    }
  } else if (!can(user, "change_stage", "deal", { ownerId: dealOwnerId(deal) })) {
    throw new ForbiddenError("You cannot change the stage of this deal.");
  }

  const fromStage = deal.stage as DealStage;
  const closedAt =
    input.stage === "CLOSED_WON" || input.stage === "CLOSED_LOST" ? now() : null;

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("deals")
      .update({
        stage: input.stage,
        lost_reason: input.stage === "CLOSED_LOST" ? (input.lost_reason ?? null) : null,
        closed_at: closedAt,
        updated_at: now(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) throw new NotFoundError("Deal not found.");

    const historyInsert = await dealStageHistoryTable(supabase).insert({
      deal_id: id,
      from_stage: fromStage,
      to_stage: input.stage,
      changed_by_id: user.id,
      note: input.note ?? null,
    });
    if (historyInsert.error) throw historyInsert.error;

    await createAuditLog({
      userId: user.id,
      action: "STAGE_CHANGE",
      entityType: "DEAL",
      entityId: id,
      metadata: { from: fromStage, to: input.stage },
    });

    // Notify assignee and managers on stage change
    await notifyStageChange(data as Deal, fromStage, input.stage, user);

    const [enriched] = await enrichSupabaseDeals([data as Deal]);
    return enriched;
  }

  const index = demoStore.deals.findIndex((d) => d.id === id);
  if (index === -1) throw new NotFoundError("Deal not found.");

  demoStore.deals[index] = {
    ...demoStore.deals[index],
    stage: input.stage,
    lost_reason: input.stage === "CLOSED_LOST" ? (input.lost_reason ?? null) : null,
    closed_at: closedAt,
    updated_at: now(),
  };

  const historyEntry: DealStageHistory = {
    id: crypto.randomUUID(),
    deal_id: id,
    from_stage: fromStage,
    to_stage: input.stage,
    changed_by_id: user.id,
    note: input.note ?? null,
    created_at: now(),
  };
  demoStore.dealStageHistory.unshift(historyEntry);

  const [enriched] = decorateDemoDeals([demoStore.deals[index]]);
  return enriched;
}

// ─── assign ──────────────────────────────────────────────────────────────────

export async function assignDeal(
  id: string,
  input: DealAssignInput,
  user: AuthUser,
) {
  if (!can(user, "assign", "deal")) throw new ForbiddenError();

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("deals")
      .update({ assigned_to_id: input.assigned_to_id, updated_at: now() })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) throw new NotFoundError("Deal not found.");
    await createAuditLog({
      userId: user.id,
      action: "ASSIGNMENT_CHANGE",
      entityType: "DEAL",
      entityId: id,
      metadata: { assigned_to_id: input.assigned_to_id },
    });
    await createNotification({
      userId: input.assigned_to_id,
      type: "DEAL_ASSIGNED",
      title: "Deal assigned to you",
      message: `${data.title} was assigned to you.`,
      entityType: "DEAL",
      entityId: id,
    });
    const [enriched] = await enrichSupabaseDeals([data as Deal]);
    return enriched;
  }

  const index = demoStore.deals.findIndex((d) => d.id === id && !d.deleted_at);
  if (index === -1) throw new NotFoundError("Deal not found.");
  demoStore.deals[index] = {
    ...demoStore.deals[index],
    assigned_to_id: input.assigned_to_id,
    updated_at: now(),
  };
  const [enriched] = decorateDemoDeals([demoStore.deals[index]]);
  return enriched;
}

// ─── archive ──────────────────────────────────────────────────────────────────

export async function archiveDeal(id: string, user: AuthUser) {
  if (!can(user, "archive", "deal")) throw new ForbiddenError();

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("deals")
      .update({ deleted_at: now() })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundError("Deal not found.");
    await createAuditLog({ userId: user.id, action: "ARCHIVE", entityType: "DEAL", entityId: id });
    return;
  }

  const deal = demoStore.deals.find((d) => d.id === id);
  if (!deal) throw new NotFoundError("Deal not found.");
  deal.deleted_at = now();
  deal.updated_at = now();
}

// ─── stage history ────────────────────────────────────────────────────────────

export async function getDealStageHistory(id: string): Promise<DealStageHistory[]> {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await dealStageHistoryTable(supabase)
      .select("*, changed_by:users(first_name,last_name)")
      .eq("deal_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as DealStageHistory[];
  }

  return demoStore.dealStageHistory
    .filter((h) => h.deal_id === id)
    .map((h) => {
      const changer = DEMO_ACCOUNTS.find((u) => u.id === h.changed_by_id);
      return {
        ...h,
        changed_by: changer
          ? { first_name: changer.first_name, last_name: changer.last_name }
          : undefined,
      };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ─── notification helpers ─────────────────────────────────────────────────────

async function notifyStageChange(
  deal: Deal,
  fromStage: DealStage,
  toStage: DealStage,
  actor: AuthUser,
) {
  if (!hasSupabaseConfig()) return;

  const supabase = getServiceSupabaseClient();
  const { data: managers } = await supabase
    .from("users")
    .select("id")
    .in("role", ["MANAGER", "ADMIN"])
    .eq("is_active", true);

  const notifyIds = new Set<string>();
  if (deal.assigned_to_id && deal.assigned_to_id !== actor.id) {
    notifyIds.add(deal.assigned_to_id);
  }
  managers?.forEach((m) => {
    if (m.id !== actor.id) notifyIds.add(m.id);
  });

  const isClosed = isClosedStage(toStage);
  const type = isClosed ? "DEAL_CLOSED" : "DEAL_STAGE_CHANGED";
  const message = `${deal.title} moved from ${fromStage.replaceAll("_", " ")} to ${toStage.replaceAll("_", " ")}.`;

  await Promise.all(
    [...notifyIds].map((uid) =>
      createNotification({
        userId: uid,
        type,
        title: isClosed ? "Deal closed" : "Deal stage changed",
        message,
        entityType: "DEAL",
        entityId: deal.id,
      }),
    ),
  );
}

export async function notifyDealCreated(deal: Deal, creatorId: string) {
  if (!hasSupabaseConfig()) return;
  const supabase = getServiceSupabaseClient();
  const { data: managers } = await supabase
    .from("users")
    .select("id")
    .in("role", ["MANAGER", "ADMIN"])
    .eq("is_active", true);

  await Promise.all(
    (managers ?? [])
      .filter((m) => m.id !== creatorId)
      .map((m) =>
        createNotification({
          userId: m.id,
          type: "DEAL_STAGE_CHANGED",
          title: "New deal created",
          message: `${deal.title} was added to the pipeline.`,
          entityType: "DEAL",
          entityId: deal.id,
        }),
      ),
  );
}
