INSERT INTO users (id, email, first_name, last_name, role, is_active) VALUES
  ('00000000-0000-4000-8000-000000000001', 'admin@unifiedcrm.demo', 'Admin', 'User', 'ADMIN', true),
  ('00000000-0000-4000-8000-000000000002', 'manager@unifiedcrm.demo', 'Manager', 'User', 'MANAGER', true),
  ('00000000-0000-4000-8000-000000000003', 'sales@unifiedcrm.demo', 'Sales', 'Rep', 'SALES', true),
  ('00000000-0000-4000-8000-000000000004', 'viewer@unifiedcrm.demo', 'Viewer', 'User', 'VIEWER', true)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

INSERT INTO companies (id, name, industry, website, phone, email, address, notes, created_by_id) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Acme Analytics', 'Technology', 'https://acme.example', '+1 415 555 0101', 'hello@acme.example', 'San Francisco, CA', 'High-intent inbound account.', '00000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000002', 'Northstar Health', 'Healthcare', 'https://northstar.example', '+1 212 555 0102', 'ops@northstar.example', 'New York, NY', 'Manager requested a Q2 follow-up.', '00000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000003', 'Ledgerline Finance', 'Finance', 'https://ledgerline.example', '+1 312 555 0103', 'info@ledgerline.example', 'Chicago, IL', 'Comparing CRM vendors.', '00000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000004', 'Brightpath Logistics', 'Logistics', 'https://brightpath.example', '+1 206 555 0104', 'contact@brightpath.example', 'Seattle, WA', 'Needs pipeline reporting.', '00000000-0000-4000-8000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO contacts (id, first_name, last_name, email, phone, title, company_id, source, created_by_id) VALUES
  ('20000000-0000-4000-8000-000000000001', 'Maya', 'Patel', 'maya@acme.example', '+1 415 555 0111', 'VP Sales', '10000000-0000-4000-8000-000000000001', 'WEBSITE', '00000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000002', 'Julian', 'Reed', 'julian@northstar.example', '+1 212 555 0112', 'Operations Director', '10000000-0000-4000-8000-000000000002', 'REFERRAL', '00000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003', 'Nora', 'Chen', 'nora@ledgerline.example', '+1 312 555 0113', 'Revenue Lead', '10000000-0000-4000-8000-000000000003', 'EVENT', '00000000-0000-4000-8000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO leads (id, first_name, last_name, email, phone, source, status, company_id, assigned_to_id, notes, created_by_id) VALUES
  ('30000000-0000-4000-8000-000000000001', 'Owen', 'Miller', 'owen@brightpath.example', '+1 206 555 0121', 'COLD_CALL', 'NEW', '10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003', 'Asked for a short product overview.', '00000000-0000-4000-8000-000000000003'),
  ('30000000-0000-4000-8000-000000000002', 'Priya', 'Shah', 'priya@northstar.example', '+1 212 555 0122', 'REFERRAL', 'CONTACTED', '10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'Follow up after stakeholder sync.', '00000000-0000-4000-8000-000000000003'),
  ('30000000-0000-4000-8000-000000000003', 'Marcus', 'Lee', 'marcus@acme.example', '+1 415 555 0123', 'WEBSITE', 'QUALIFIED', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Budget confirmed, demo next week.', '00000000-0000-4000-8000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO deals (id, title, value, stage, contact_id, company_id, assigned_to_id, expected_close_date, created_by_id) VALUES
  ('40000000-0000-4000-8000-000000000001', 'Acme CRM rollout', 45000, 'PROPOSAL', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', CURRENT_DATE + INTERVAL '21 days', '00000000-0000-4000-8000-000000000003'),
  ('40000000-0000-4000-8000-000000000002', 'Northstar team dashboard', 32000, 'NEGOTIATION', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', CURRENT_DATE + INTERVAL '14 days', '00000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000003', 'Ledgerline pilot', 18000, 'QUALIFIED', '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', CURRENT_DATE + INTERVAL '35 days', '00000000-0000-4000-8000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO deal_stage_history (deal_id, from_stage, to_stage, changed_by_id, note) VALUES
  ('40000000-0000-4000-8000-000000000001', NULL, 'LEAD', '00000000-0000-4000-8000-000000000003', 'Created from inbound interest.'),
  ('40000000-0000-4000-8000-000000000001', 'LEAD', 'QUALIFIED', '00000000-0000-4000-8000-000000000003', 'Discovery completed.'),
  ('40000000-0000-4000-8000-000000000001', 'QUALIFIED', 'PROPOSAL', '00000000-0000-4000-8000-000000000003', 'Proposal sent.'),
  ('40000000-0000-4000-8000-000000000002', 'PROPOSAL', 'NEGOTIATION', '00000000-0000-4000-8000-000000000002', 'Pricing review in progress.');

INSERT INTO activities (id, type, subject, description, result, completed_at, deal_id, lead_id, assigned_to_id, created_by_id) VALUES
  ('50000000-0000-4000-8000-000000000001', 'CALL', 'Acme discovery call', 'Confirmed CRM migration goals and reporting needs.', 'COMPLETED', now() - INTERVAL '2 days', '40000000-0000-4000-8000-000000000001', NULL, '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003'),
  ('50000000-0000-4000-8000-000000000002', 'EMAIL', 'Northstar pricing follow-up', 'Sent revised seat estimate.', 'FOLLOW_UP_NEEDED', now() - INTERVAL '1 day', '40000000-0000-4000-8000-000000000002', NULL, '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000003', 'TASK', 'Qualify Brightpath lead', 'Prepare a short demo agenda.', NULL, NULL, NULL, '30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activity_comments (activity_id, content, created_by_id) VALUES
  ('50000000-0000-4000-8000-000000000001', 'Maya asked for pipeline velocity examples.', '00000000-0000-4000-8000-000000000003'),
  ('50000000-0000-4000-8000-000000000002', 'Manager will review terms before Friday.', '00000000-0000-4000-8000-000000000002');

INSERT INTO notifications (recipient_id, type, title, message, entity_type, entity_id, is_read) VALUES
  ('00000000-0000-4000-8000-000000000003', 'LEAD_ASSIGNED', 'New lead assigned', 'Brightpath Logistics lead is ready for follow-up.', 'LEAD', '30000000-0000-4000-8000-000000000001', false),
  ('00000000-0000-4000-8000-000000000002', 'DEAL_STAGE_CHANGED', 'Deal moved forward', 'Acme CRM rollout moved to proposal.', 'DEAL', '40000000-0000-4000-8000-000000000001', false);

INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES
  ('00000000-0000-4000-8000-000000000003', 'CREATE', 'COMPANY', '10000000-0000-4000-8000-000000000001', '{"source":"seed"}'),
  ('00000000-0000-4000-8000-000000000003', 'CREATE', 'DEAL', '40000000-0000-4000-8000-000000000001', '{"source":"seed"}'),
  ('00000000-0000-4000-8000-000000000002', 'STAGE_CHANGE', 'DEAL', '40000000-0000-4000-8000-000000000002', '{"from":"PROPOSAL","to":"NEGOTIATION"}');
