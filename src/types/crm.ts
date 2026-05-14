import type { LeadSource } from "@/types/enums";

export type Company = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CompanyListItem = Company & {
  contact_count: number;
  deal_count: number;
};

export type CompanyDetail = CompanyListItem & {
  contacts: Contact[];
  leads: Array<{
    id: string;
    first_name: string;
    last_name: string;
    status: string;
    assigned_to_id: string | null;
  }>;
  deals: Array<{
    id: string;
    title: string;
    value: number;
    stage: string;
    assigned_to_id: string | null;
  }>;
};

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  source: LeadSource | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  company?: Pick<Company, "id" | "name" | "industry"> | null;
};

export type ContactListItem = Contact & {
  company_name: string | null;
  deal_count: number;
};

export type ContactDetail = ContactListItem & {
  deals: Array<{
    id: string;
    title: string;
    value: number;
    stage: string;
  }>;
  recent_activities: Array<{
    id: string;
    type: string;
    subject: string;
    completed_at: string | null;
    created_at: string;
  }>;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type DuplicateCompanyResult = {
  exactMatch: Company | null;
  similarMatches: Array<Company & { similarity: number }>;
};
