import { AppError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { can, type AuthUser } from "@/lib/permissions";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import {
  canMoveLeadStatus,
  type LeadAssignInput,
  type LeadConvertInput,
  type LeadCreateInput,
  type LeadListQuery,
  type LeadUpdateInput,
} from "@/lib/validators/lead";
import type { Database, Json } from "@/types/database";
import type { AppUser, DealStage, LeadSource } from "@/types/enums";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type ContactRow = Database["public"]["Tables"]["contacts"]["Row"];
type DealRow = Database["public"]["Tables"]["deals"]["Row"];

type LeadOwner = Pick<AppUser, "id" | "email" | "first_name" | "last_name" | "role" | "avatar_url">;

export type LeadListItem = LeadRow & {
  company: Pick<CompanyRow, "id" | "name" | "industry"> | null;
  company_name: string | null;
  assignee: LeadOwner | null;
  assignee_name: string | null;
  converted_contact: Pick<ContactRow, "id" | "first_name" | "last_name" | "email"> | null;
};

export type LeadDetail = LeadListItem & {
  recent_activities: Array<{
    id: string;
    type: string;
    subject: string;
    completed_at: string | null;
    created_at: string;
  }>;
};

export type LeadConversionResult = {
  contact: ContactRow;
  deal?: DealRow;
};

type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

type DealStageHistoryInsert = {
  deal_id: string;
  from_stage: DealStage | null;
  to_stage: DealStage;
  changed_by_id: string;
  note: string | null;
};

type DealStageHistoryClient = {
  from(table: "deal_stage_history"): {
    insert(values: DealStageHistoryInsert): Promise<{ error: Error | null }>;
  };
};

function ownerIdFor(lead: LeadRow) {
  return lead.assigned_to_id ?? lead.created_by_id;
}

function assertLeadMutable(lead: LeadRow) {
  if (lead.status === "CONVERTED" || lead.converted_contact_id) {
    throw new ConflictError("This lead has already been converted.");
  }
}

async function enrichLeads(leads: LeadRow[]): Promise<LeadListItem[]> {
  if (!leads.length) return [];

  const supabase = getServiceSupabaseClient();
  const companyIds = leads
    .map((lead) => lead.company_id)
    .filter((id): id is string => Boolean(id));
  const userIds = leads
    .map((lead) => lead.assigned_to_id)
    .filter((id): id is string => Boolean(id));
  const contactIds = leads
    .map((lead) => lead.converted_contact_id)
    .filter((id): id is string => Boolean(id));

  const [companies, users, contacts] = await Promise.all([
    companyIds.length
      ? supabase.from("companies").select("id,name,industry").in("id", companyIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase
          .from("users")
          .select("id,email,first_name,last_name,role,avatar_url")
          .in("id", userIds)
      : Promise.resolve({ data: [] }),
    contactIds.length
      ? supabase
          .from("contacts")
          .select("id,first_name,last_name,email")
          .in("id", contactIds)
      : Promise.resolve({ data: [] }),
  ]);

  return leads.map((lead) => {
    const company = companies.data?.find((item) => item.id === lead.company_id) ?? null;
    const assignee = users.data?.find((item) => item.id === lead.assigned_to_id) ?? null;
    const convertedContact =
      contacts.data?.find((item) => item.id === lead.converted_contact_id) ?? null;

    return {
      ...lead,
      company,
      company_name: company?.name ?? null,
      assignee: assignee as LeadOwner | null,
      assignee_name: assignee ? `${assignee.first_name} ${assignee.last_name}` : null,
      converted_contact: convertedContact as LeadListItem["converted_contact"],
    };
  });
}

export async function listLeads(
  query: LeadListQuery,
): Promise<{ rows: LeadListItem[]; meta: PaginationMeta }> {
  const supabase = getServiceSupabaseClient();
  let request = supabase.from("leads").select("*", { count: "exact" }).is("deleted_at", null);

  if (query.status) request = request.eq("status", query.status);
  if (query.source) request = request.eq("source", query.source);
  if (query.assigned_to_id) request = request.eq("assigned_to_id", query.assigned_to_id);
  if (query.company_id) request = request.eq("company_id", query.company_id);
  if (query.search) {
    request = request.or(
      `first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%`,
    );
  }

  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize - 1;
  const { data, error, count } = await request
    .order(query.sortBy, { ascending: query.sortOrder === "asc" })
    .range(start, end);

  if (error) throw error;

  const leads = (data ?? []) as LeadRow[];
  return {
    rows: await enrichLeads(leads),
    meta: {
      total: count ?? leads.length,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < (count ?? leads.length),
    },
  };
}

export async function getLeadById(id: string): Promise<LeadDetail> {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !data) throw new NotFoundError("Lead not found.");

  const [lead] = await enrichLeads([data as LeadRow]);
  const activities = await supabase
    .from("activities")
    .select("id,type,subject,completed_at,created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    ...lead,
    recent_activities: (activities.data ?? []) as LeadDetail["recent_activities"],
  };
}

export async function createLead(input: LeadCreateInput, createdById: string) {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      source: input.source,
      company_id: input.company_id ?? null,
      assigned_to_id: createdById,
      notes: input.notes ?? null,
      created_by_id: createdById,
    })
    .select("*")
    .single();

  if (error) throw error;

  await createAuditLog({
    userId: createdById,
    action: "CREATE",
    entityType: "LEAD",
    entityId: data.id,
    metadata: { source: input.source } satisfies Json,
  });

  const [lead] = await enrichLeads([data as LeadRow]);
  return lead;
}

export async function updateLead(id: string, input: LeadUpdateInput, user: AuthUser) {
  const existing = await getLeadById(id);
  assertLeadMutable(existing);

  if (!can(user, "update", "lead", { ownerId: ownerIdFor(existing) })) {
    throw new ForbiddenError("You cannot update this lead.");
  }

  if (
    input.status &&
    !canMoveLeadStatus({ from: existing.status, to: input.status, role: user.role })
  ) {
    throw new ForbiddenError("Sales users can only move lead status forward.");
  }

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .update({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      source: input.source,
      status: input.status,
      company_id: input.company_id,
      assigned_to_id: input.assigned_to_id,
      notes: input.notes,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new NotFoundError("Lead not found.");

  await createAuditLog({
    userId: user.id,
    action: input.status && input.status !== existing.status ? "STATUS_CHANGE" : "UPDATE",
    entityType: "LEAD",
    entityId: id,
    metadata: {
      status:
        input.status && input.status !== existing.status
          ? { from: existing.status, to: input.status }
          : undefined,
    } satisfies Json,
  });

  const [lead] = await enrichLeads([data as LeadRow]);
  return lead;
}

export async function assignLead(
  id: string,
  input: LeadAssignInput,
  actingUser: AuthUser,
) {
  if (!can(actingUser, "assign", "lead")) throw new ForbiddenError();

  const existing = await getLeadById(id);
  assertLeadMutable(existing);

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ assigned_to_id: input.assigned_to_id })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new NotFoundError("Lead not found.");

  await createAuditLog({
    userId: actingUser.id,
    action: "UPDATE",
    entityType: "LEAD",
    entityId: id,
    metadata: {
      changes: {
        assigned_to_id: { from: existing.assigned_to_id, to: input.assigned_to_id },
      },
    } satisfies Json,
  });

  await createNotification({
    userId: input.assigned_to_id,
    type: "LEAD_ASSIGNED",
    title: "Lead assigned",
    message: `${existing.first_name} ${existing.last_name} assigned to you`,
    entityType: "LEAD",
    entityId: id,
  });

  const [lead] = await enrichLeads([data as LeadRow]);
  return lead;
}

async function notifyManagersOfConversion(lead: LeadRow) {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .in("role", ["MANAGER", "ADMIN"])
    .eq("is_active", true);

  if (error) throw error;

  await Promise.all(
    (data ?? []).map((manager) =>
      createNotification({
        userId: manager.id,
        type: "LEAD_CONVERTED",
        title: "Lead converted",
        message: `${lead.first_name} ${lead.last_name} was converted to a contact`,
        entityType: "LEAD",
        entityId: lead.id,
      }),
    ),
  );
}

export async function convertLead(
  id: string,
  input: LeadConvertInput,
  actingUser: AuthUser,
): Promise<LeadConversionResult> {
  const existing = await getLeadById(id);
  assertLeadMutable(existing);

  if (!can(actingUser, "convert", "lead", { ownerId: ownerIdFor(existing) })) {
    throw new ForbiddenError("You cannot convert this lead.");
  }

  if (existing.status !== "QUALIFIED") {
    throw new AppError("UNPROCESSABLE", "Only qualified leads can be converted.", 422);
  }

  const supabase = getServiceSupabaseClient();
  const contactResult = await supabase
    .from("contacts")
    .insert({
      first_name: existing.first_name,
      last_name: existing.last_name,
      email: existing.email,
      phone: existing.phone,
      company_id: existing.company_id,
      source: existing.source as LeadSource,
      created_by_id: actingUser.id,
    })
    .select("*")
    .single();

  if (contactResult.error) throw contactResult.error;

  let deal: DealRow | undefined;
  if (input.createDeal) {
    const dealResult = await supabase
      .from("deals")
      .insert({
        title: input.dealTitle ?? `${existing.first_name} ${existing.last_name} opportunity`,
        value: input.dealValue ?? 0,
        stage: "LEAD",
        contact_id: contactResult.data.id,
        company_id: existing.company_id,
        lead_id: existing.id,
        assigned_to_id: existing.assigned_to_id ?? actingUser.id,
        expected_close_date: input.dealCloseDate ?? null,
        created_by_id: actingUser.id,
      })
      .select("*")
      .single();

    if (dealResult.error) throw dealResult.error;
    deal = dealResult.data as DealRow;

    const historyClient = supabase as unknown as DealStageHistoryClient;
    const { error } = await historyClient.from("deal_stage_history").insert({
      deal_id: deal.id,
      from_stage: null,
      to_stage: "LEAD",
      changed_by_id: actingUser.id,
      note: "Created during lead conversion.",
    });
    if (error) throw error;
  }

  const convertedAt = new Date().toISOString();
  const leadUpdate = await supabase
    .from("leads")
    .update({
      status: "CONVERTED",
      converted_contact_id: contactResult.data.id,
      converted_at: convertedAt,
    })
    .eq("id", id);

  if (leadUpdate.error) throw leadUpdate.error;

  await createAuditLog({
    userId: actingUser.id,
    action: "CONVERSION",
    entityType: "LEAD",
    entityId: id,
    metadata: {
      contact_id: contactResult.data.id,
      deal_id: deal?.id,
    } satisfies Json,
  });

  await notifyManagersOfConversion(existing);

  return {
    contact: contactResult.data as ContactRow,
    deal,
  };
}

export const leadService = {
  list: listLeads,
  getById: getLeadById,
  create: createLead,
  update: updateLead,
  assign: assignLead,
  convert: convertLead,
};
