import { ForbiddenError, NotFoundError } from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { can, type AuthUser } from "@/lib/permissions";
import { getServiceSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type {
  ContactCreateInput,
  ContactListQuery,
  ContactUpdateInput,
} from "@/lib/validators/contact";
import { cloneContactWithCompany, demoStore } from "@/services/demo-data";
import type {
  Contact,
  ContactDetail,
  ContactListItem,
  PaginationMeta,
} from "@/types/crm";

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
    meta: {
      total: rows.length,
      page,
      pageSize,
      hasMore: end < rows.length,
    },
  };
}

function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  sortBy: string,
  sortOrder: "asc" | "desc",
) {
  return [...rows].sort((left, right) => {
    const leftValue = left[sortBy];
    const rightValue = right[sortBy];
    const comparison = String(leftValue ?? "").localeCompare(String(rightValue ?? ""));
    return sortOrder === "asc" ? comparison : -comparison;
  });
}

async function listContactsFromSupabase(query: ContactListQuery) {
  const supabase = getServiceSupabaseClient();
  let request = supabase.from("contacts").select("*", { count: "exact" }).is("deleted_at", null);

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

  const contacts = (data ?? []) as Contact[];
  const companyIds = contacts
    .map((contact) => contact.company_id)
    .filter((id): id is string => Boolean(id));
  const contactIds = contacts.map((contact) => contact.id);
  const [companies, deals] = await Promise.all([
    companyIds.length
      ? supabase.from("companies").select("id,name,industry").in("id", companyIds)
      : Promise.resolve({ data: [] }),
    contactIds.length
      ? supabase.from("deals").select("contact_id").in("contact_id", contactIds)
      : Promise.resolve({ data: [] }),
  ]);

  const rows = contacts
    .map((contact) => {
      const company =
        companies.data?.find((item) => item.id === contact.company_id) ?? null;
      return {
        ...contact,
        company,
        company_name: company?.name ?? null,
        deal_count:
          deals.data?.filter((deal) => deal.contact_id === contact.id).length ?? 0,
      };
    })
    .filter((contact) =>
      query.has_deals === undefined
        ? true
        : query.has_deals
          ? contact.deal_count > 0
          : contact.deal_count === 0,
    );

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

export async function listContacts(query: ContactListQuery) {
  if (hasSupabaseConfig()) return listContactsFromSupabase(query);

  const search = query.search?.toLowerCase();
  const rows = demoStore.contacts
    .filter((contact) => !contact.deleted_at)
    .filter((contact) => !query.company_id || contact.company_id === query.company_id)
    .map(cloneContactWithCompany)
    .filter((contact) =>
      query.has_deals === undefined
        ? true
        : query.has_deals
          ? contact.deal_count > 0
          : contact.deal_count === 0,
    )
    .filter((contact) => {
      if (!search) return true;
      return [
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone,
        contact.company_name,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search));
    });

  return paginate(sortRows(rows, query.sortBy, query.sortOrder), query.page, query.pageSize);
}

export async function createContact(input: ContactCreateInput, userId: string) {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("contacts")
      .insert({ ...input, created_by_id: userId })
      .select("*")
      .single();

    if (error) throw error;
    await createAuditLog({
      userId,
      action: "CREATE",
      entityType: "CONTACT",
      entityId: data.id,
      metadata: { email: data.email },
    });
    return enrichSupabaseContact(data as Contact);
  }

  const timestamp = now();
  const contact: Contact = {
    id: crypto.randomUUID(),
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    title: input.title ?? null,
    company_id: input.company_id ?? null,
    source: input.source ?? null,
    created_by_id: userId,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };

  demoStore.contacts.unshift(contact);
  return cloneContactWithCompany(contact);
}

async function enrichSupabaseContact(contact: Contact): Promise<ContactListItem> {
  const supabase = getServiceSupabaseClient();
  const [company, deals] = await Promise.all([
    contact.company_id
      ? supabase
          .from("companies")
          .select("id,name,industry")
          .eq("id", contact.company_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("deals").select("id").eq("contact_id", contact.id),
  ]);

  return {
    ...contact,
    company: company.data,
    company_name: company.data?.name ?? null,
    deal_count: deals.data?.length ?? 0,
  };
}

export async function getContactDetail(id: string): Promise<ContactDetail> {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) throw new NotFoundError("Contact not found.");

    const contact = await enrichSupabaseContact(data as Contact);
    const [deals, activities] = await Promise.all([
      supabase
        .from("deals")
        .select("id,title,value,stage")
        .eq("contact_id", id)
        .is("deleted_at", null),
      supabase
        .from("activities")
        .select("id,type,subject,completed_at,created_at")
        .eq("contact_id", id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      ...contact,
      deals: (deals.data ?? []) as ContactDetail["deals"],
      recent_activities: (activities.data ?? []) as ContactDetail["recent_activities"],
    };
  }

  const contact = demoStore.contacts.find((item) => item.id === id && !item.deleted_at);
  if (!contact) throw new NotFoundError("Contact not found.");

  const enriched = cloneContactWithCompany(contact);
  return {
    ...enriched,
    deals: demoStore.deals
      .filter((deal) => deal.contact_id === id && !deal.deleted_at)
      .map(({ id, title, value, stage }) => ({ id, title, value, stage })),
    recent_activities: demoStore.activities
      .filter((activity) => activity.contact_id === id)
      .map((activity) => ({
        id: activity.id,
        type: activity.type,
        subject: activity.subject,
        completed_at: activity.completed_at,
        created_at: activity.created_at,
      }))
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 5),
  };
}

export async function updateContact(
  id: string,
  input: ContactUpdateInput,
  user: AuthUser,
) {
  const existing = await getContactDetail(id);
  if (!can(user, "update", "contact", { ownerId: existing.created_by_id })) {
    throw new ForbiddenError("You cannot update this contact.");
  }

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("contacts")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) throw new NotFoundError("Contact not found.");
    await createAuditLog({ userId: user.id, action: "UPDATE", entityType: "CONTACT", entityId: id });
    return enrichSupabaseContact(data as Contact);
  }

  const index = demoStore.contacts.findIndex((contact) => contact.id === id);
  if (index === -1) throw new NotFoundError("Contact not found.");

  demoStore.contacts[index] = {
    ...demoStore.contacts[index],
    ...input,
    updated_at: now(),
  };
  return cloneContactWithCompany(demoStore.contacts[index]);
}

export async function archiveContact(id: string, userId: string) {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { error } = await supabase
      .from("contacts")
      .update({ deleted_at: now() })
      .eq("id", id);
    if (error) throw error;
    await createAuditLog({ userId, action: "ARCHIVE", entityType: "CONTACT", entityId: id });
    return;
  }

  const contact = demoStore.contacts.find((item) => item.id === id);
  if (!contact) throw new NotFoundError("Contact not found.");
  contact.deleted_at = now();
  contact.updated_at = now();
}
