import { ConflictError, NotFoundError } from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { getServiceSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type {
  CompanyCreateInput,
  CompanyListQuery,
  CompanyUpdateInput,
} from "@/lib/validators/company";
import { demoStore } from "@/services/demo-data";
import type {
  Company,
  CompanyDetail,
  CompanyListItem,
  DuplicateCompanyResult,
  PaginationMeta,
} from "@/types/crm";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

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

function similarity(left: string, right: string) {
  const a = new Set(normalizeText(left).split(/\s+/));
  const b = new Set(normalizeText(right).split(/\s+/));
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  const tokenScore = union ? intersection / union : 0;
  const includesScore =
    normalizeText(left).includes(normalizeText(right)) ||
    normalizeText(right).includes(normalizeText(left))
      ? 0.65
      : 0;
  return Math.max(tokenScore, includesScore);
}

function decorateCompany(company: Company): CompanyListItem {
  return {
    ...company,
    contact_count: demoStore.contacts.filter(
      (contact) => contact.company_id === company.id && !contact.deleted_at,
    ).length,
    deal_count: demoStore.deals.filter(
      (deal) => deal.company_id === company.id && !deal.deleted_at,
    ).length,
  };
}

async function listCompaniesFromSupabase(query: CompanyListQuery) {
  const supabase = getServiceSupabaseClient();
  let request = supabase.from("companies").select("*", { count: "exact" });

  if (!query.includeArchived) request = request.is("deleted_at", null);
  if (query.industry) request = request.eq("industry", query.industry);
  if (query.search) {
    request = request.or(
      `name.ilike.%${query.search}%,industry.ilike.%${query.search}%,email.ilike.%${query.search}%`,
    );
  }

  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize - 1;
  const { data, error, count } = await request
    .order(query.sortBy, { ascending: query.sortOrder === "asc" })
    .range(start, end);

  if (error) throw error;

  const companies = (data ?? []) as Company[];
  const companyIds = companies.map((company) => company.id);
  const [contacts, deals] = await Promise.all([
    supabase.from("contacts").select("company_id").in("company_id", companyIds),
    supabase.from("deals").select("company_id").in("company_id", companyIds),
  ]);

  return {
    rows: companies.map((company) => ({
      ...company,
      contact_count:
        contacts.data?.filter((contact) => contact.company_id === company.id).length ?? 0,
      deal_count:
        deals.data?.filter((deal) => deal.company_id === company.id).length ?? 0,
    })),
    meta: {
      total: count ?? companies.length,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < (count ?? companies.length),
    },
  };
}

export async function listCompanies(query: CompanyListQuery) {
  if (hasSupabaseConfig()) return listCompaniesFromSupabase(query);

  const search = query.search?.toLowerCase();
  const rows = demoStore.companies
    .filter((company) => query.includeArchived || !company.deleted_at)
    .filter((company) => !query.industry || company.industry === query.industry)
    .filter((company) => {
      if (!search) return true;
      return [company.name, company.industry, company.email, company.phone]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search));
    })
    .map(decorateCompany);

  return paginate(sortRows(rows, query.sortBy, query.sortOrder), query.page, query.pageSize);
}

export async function checkDuplicateCompany(
  name: string,
): Promise<DuplicateCompanyResult> {
  const normalizedName = normalizeText(name);

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .is("deleted_at", null);

    if (error) throw error;

    const companies = (data ?? []) as Company[];
    return {
      exactMatch:
        companies.find((company) => normalizeText(company.name) === normalizedName) ??
        null,
      similarMatches: companies
        .filter((company) => normalizeText(company.name) !== normalizedName)
        .map((company) => ({ ...company, similarity: similarity(company.name, name) }))
        .filter((company) => company.similarity >= 0.3)
        .sort((left, right) => right.similarity - left.similarity)
        .slice(0, 5),
    };
  }

  return {
    exactMatch:
      demoStore.companies.find(
        (company) => !company.deleted_at && normalizeText(company.name) === normalizedName,
      ) ?? null,
    similarMatches: demoStore.companies
      .filter(
        (company) =>
          !company.deleted_at && normalizeText(company.name) !== normalizedName,
      )
      .map((company) => ({ ...company, similarity: similarity(company.name, name) }))
      .filter((company) => company.similarity >= 0.3)
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, 5),
  };
}

export async function createCompany(input: CompanyCreateInput, userId: string) {
  const duplicates = await checkDuplicateCompany(input.name);
  if (duplicates.exactMatch) {
    throw new ConflictError("A company with this name already exists.");
  }

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("companies")
      .insert({ ...input, created_by_id: userId })
      .select("*")
      .single();

    if (error) throw error;
    await createAuditLog({
      userId,
      action: "CREATE",
      entityType: "COMPANY",
      entityId: data.id,
      metadata: { name: data.name },
    });
    return { company: decorateCompany(data as Company), warnings: duplicates.similarMatches };
  }

  const timestamp = now();
  const company: Company = {
    id: crypto.randomUUID(),
    name: input.name,
    industry: input.industry ?? null,
    website: input.website ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
    notes: input.notes ?? null,
    created_by_id: userId,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };

  demoStore.companies.unshift(company);
  return { company: decorateCompany(company), warnings: duplicates.similarMatches };
}

export async function getCompanyDetail(id: string): Promise<CompanyDetail> {
  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) throw new NotFoundError("Company not found.");

    const [contacts, leads, deals] = await Promise.all([
      supabase.from("contacts").select("*").eq("company_id", id).is("deleted_at", null),
      supabase
        .from("leads")
        .select("id,first_name,last_name,status,assigned_to_id")
        .eq("company_id", id)
        .is("deleted_at", null),
      supabase
        .from("deals")
        .select("id,title,value,stage,assigned_to_id")
        .eq("company_id", id)
        .is("deleted_at", null),
    ]);

    const company = data as Company;
    return {
      ...company,
      contact_count: contacts.data?.length ?? 0,
      deal_count: deals.data?.length ?? 0,
      contacts: (contacts.data ?? []) as CompanyDetail["contacts"],
      leads: (leads.data ?? []) as CompanyDetail["leads"],
      deals: (deals.data ?? []) as CompanyDetail["deals"],
    };
  }

  const company = demoStore.companies.find((item) => item.id === id && !item.deleted_at);
  if (!company) throw new NotFoundError("Company not found.");

  const companyContacts = demoStore.contacts.filter(
    (contact) => contact.company_id === id && !contact.deleted_at,
  );
  const companyDeals = demoStore.deals.filter(
    (deal) => deal.company_id === id && !deal.deleted_at,
  );

  return {
    ...decorateCompany(company),
    contacts: companyContacts,
    leads: demoStore.leads.filter((lead) => lead.company_id === id && !lead.deleted_at),
    deals: companyDeals.map((deal) => ({
      id: deal.id,
      title: deal.title,
      value: deal.value,
      stage: deal.stage,
      assigned_to_id: deal.assigned_to_id,
    })),
  };
}

export async function updateCompany(
  id: string,
  input: CompanyUpdateInput,
  userId: string,
) {
  if (input.name) {
    const duplicates = await checkDuplicateCompany(input.name);
    if (duplicates.exactMatch && duplicates.exactMatch.id !== id) {
      throw new ConflictError("A company with this name already exists.");
    }
  }

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("companies")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) throw new NotFoundError("Company not found.");
    await createAuditLog({ userId, action: "UPDATE", entityType: "COMPANY", entityId: id });
    return decorateCompany(data as Company);
  }

  const index = demoStore.companies.findIndex((company) => company.id === id);
  if (index === -1) throw new NotFoundError("Company not found.");

  demoStore.companies[index] = {
    ...demoStore.companies[index],
    ...input,
    updated_at: now(),
  };
  return decorateCompany(demoStore.companies[index]);
}

export async function archiveCompany(id: string, userId: string) {
  const detail = await getCompanyDetail(id);
  if (detail.contact_count > 0 || detail.deal_count > 0) {
    throw new ConflictError("Archive linked contacts and deals before archiving this company.");
  }

  if (hasSupabaseConfig()) {
    const supabase = getServiceSupabaseClient();
    const { error } = await supabase
      .from("companies")
      .update({ deleted_at: now() })
      .eq("id", id);
    if (error) throw error;
    await createAuditLog({ userId, action: "ARCHIVE", entityType: "COMPANY", entityId: id });
    return;
  }

  const company = demoStore.companies.find((item) => item.id === id);
  if (!company) throw new NotFoundError("Company not found.");
  company.deleted_at = now();
  company.updated_at = now();
}
