CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(industry, '') || ' ' || coalesce(notes, ''))
  ) STORED;

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, ''))
  ) STORED;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, ''))
  ) STORED;

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(lost_reason, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_companies_search ON companies USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_leads_search ON leads USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_deals_search ON deals USING GIN(search_vector);
