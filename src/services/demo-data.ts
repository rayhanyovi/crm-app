import { DEMO_ACCOUNTS } from "@/services/auth.service";
import type {
  Company,
  Contact,
  ContactDetail,
  ContactListItem,
  Deal,
  DealStageHistory,
} from "@/types/crm";

/** @deprecated Use Deal from @/types/crm directly */
export type DemoDeal = Deal;

export type DemoLead = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  company_id: string | null;
  assigned_to_id: string | null;
  deleted_at: string | null;
};

export type DemoActivity = ContactDetail["recent_activities"][number] & {
  contact_id: string | null;
};

const now = new Date("2026-05-14T02:00:00.000Z").toISOString();

const companies: Company[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Acme Analytics",
    industry: "Technology",
    website: "https://acme.example",
    phone: "+1 415 555 0101",
    email: "hello@acme.example",
    address: "San Francisco, CA",
    notes: "High-intent inbound account.",
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Northstar Health",
    industry: "Healthcare",
    website: "https://northstar.example",
    phone: "+1 212 555 0102",
    email: "ops@northstar.example",
    address: "New York, NY",
    notes: "Manager requested a Q2 follow-up.",
    created_by_id: DEMO_ACCOUNTS[1].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Ledgerline Finance",
    industry: "Finance",
    website: "https://ledgerline.example",
    phone: "+1 312 555 0103",
    email: "info@ledgerline.example",
    address: "Chicago, IL",
    notes: "Comparing CRM vendors.",
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Brightpath Logistics",
    industry: "Logistics",
    website: "https://brightpath.example",
    phone: "+1 206 555 0104",
    email: "contact@brightpath.example",
    address: "Seattle, WA",
    notes: "Needs pipeline reporting.",
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
];

const contacts: Contact[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    first_name: "Maya",
    last_name: "Patel",
    email: "maya@acme.example",
    phone: "+1 415 555 0111",
    title: "VP Sales",
    company_id: companies[0].id,
    source: "WEBSITE",
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    first_name: "Julian",
    last_name: "Reed",
    email: "julian@northstar.example",
    phone: "+1 212 555 0112",
    title: "Operations Director",
    company_id: companies[1].id,
    source: "REFERRAL",
    created_by_id: DEMO_ACCOUNTS[1].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    first_name: "Nora",
    last_name: "Chen",
    email: "nora@ledgerline.example",
    phone: "+1 312 555 0113",
    title: "Revenue Lead",
    company_id: companies[2].id,
    source: "EVENT",
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
];

const deals: Deal[] = [
  {
    id: "40000000-0000-4000-8000-000000000001",
    title: "Acme CRM rollout",
    value: 45000,
    stage: "PROPOSAL",
    contact_id: contacts[0].id,
    company_id: companies[0].id,
    lead_id: null,
    assigned_to_id: DEMO_ACCOUNTS[2].id,
    expected_close_date: "2026-06-30",
    lost_reason: null,
    closed_at: null,
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "40000000-0000-4000-8000-000000000002",
    title: "Northstar team dashboard",
    value: 32000,
    stage: "NEGOTIATION",
    contact_id: contacts[1].id,
    company_id: companies[1].id,
    lead_id: null,
    assigned_to_id: DEMO_ACCOUNTS[1].id,
    expected_close_date: "2026-05-31",
    lost_reason: null,
    closed_at: null,
    created_by_id: DEMO_ACCOUNTS[1].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "40000000-0000-4000-8000-000000000003",
    title: "Ledgerline pilot",
    value: 18000,
    stage: "QUALIFIED",
    contact_id: contacts[2].id,
    company_id: companies[2].id,
    lead_id: null,
    assigned_to_id: DEMO_ACCOUNTS[2].id,
    expected_close_date: "2026-07-15",
    lost_reason: null,
    closed_at: null,
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "40000000-0000-4000-8000-000000000004",
    title: "Brightpath dispatch upgrade",
    value: 27500,
    stage: "LEAD",
    contact_id: contacts[0].id,
    company_id: companies[3].id,
    lead_id: null,
    assigned_to_id: DEMO_ACCOUNTS[2].id,
    expected_close_date: "2026-08-01",
    lost_reason: null,
    closed_at: null,
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "40000000-0000-4000-8000-000000000005",
    title: "Acme expansion — Q3",
    value: 62000,
    stage: "CLOSED_WON",
    contact_id: contacts[0].id,
    company_id: companies[0].id,
    lead_id: null,
    assigned_to_id: DEMO_ACCOUNTS[2].id,
    expected_close_date: "2026-04-30",
    lost_reason: null,
    closed_at: "2026-04-28T10:00:00.000Z",
    created_by_id: DEMO_ACCOUNTS[2].id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
];

const dealStageHistory: DealStageHistory[] = [
  {
    id: "60000000-0000-4000-8000-000000000001",
    deal_id: "40000000-0000-4000-8000-000000000001",
    from_stage: null,
    to_stage: "LEAD",
    changed_by_id: DEMO_ACCOUNTS[2].id,
    note: null,
    created_at: now,
  },
  {
    id: "60000000-0000-4000-8000-000000000002",
    deal_id: "40000000-0000-4000-8000-000000000001",
    from_stage: "LEAD",
    to_stage: "QUALIFIED",
    changed_by_id: DEMO_ACCOUNTS[2].id,
    note: "Confirmed budget and timeline.",
    created_at: now,
  },
  {
    id: "60000000-0000-4000-8000-000000000003",
    deal_id: "40000000-0000-4000-8000-000000000001",
    from_stage: "QUALIFIED",
    to_stage: "PROPOSAL",
    changed_by_id: DEMO_ACCOUNTS[2].id,
    note: "Proposal sent.",
    created_at: now,
  },
];

const leads: DemoLead[] = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    first_name: "Owen",
    last_name: "Miller",
    status: "NEW",
    company_id: companies[3].id,
    assigned_to_id: DEMO_ACCOUNTS[2].id,
    deleted_at: null,
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    first_name: "Priya",
    last_name: "Shah",
    status: "CONTACTED",
    company_id: companies[1].id,
    assigned_to_id: DEMO_ACCOUNTS[2].id,
    deleted_at: null,
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    first_name: "Marcus",
    last_name: "Lee",
    status: "QUALIFIED",
    company_id: companies[0].id,
    assigned_to_id: DEMO_ACCOUNTS[1].id,
    deleted_at: null,
  },
];

const activities: DemoActivity[] = [
  {
    id: "50000000-0000-4000-8000-000000000001",
    type: "CALL",
    subject: "Acme discovery call",
    completed_at: "2026-05-12T02:00:00.000Z",
    created_at: "2026-05-12T02:00:00.000Z",
    contact_id: contacts[0].id,
  },
  {
    id: "50000000-0000-4000-8000-000000000002",
    type: "EMAIL",
    subject: "Northstar pricing follow-up",
    completed_at: "2026-05-13T02:00:00.000Z",
    created_at: "2026-05-13T02:00:00.000Z",
    contact_id: contacts[1].id,
  },
];

export const demoStore = {
  companies,
  contacts,
  deals,
  dealStageHistory,
  leads,
  activities,
};

export function cloneContactWithCompany(contact: Contact): ContactListItem {
  const company = companies.find((item) => item.id === contact.company_id) ?? null;
  const contactDeals = deals.filter(
    (deal) => deal.contact_id === contact.id && !deal.deleted_at,
  );

  return {
    ...contact,
    company: company
      ? { id: company.id, name: company.name, industry: company.industry }
      : null,
    company_name: company?.name ?? null,
    deal_count: contactDeals.length,
  };
}
