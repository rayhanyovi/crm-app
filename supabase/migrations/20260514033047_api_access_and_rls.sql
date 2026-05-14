ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  users,
  companies,
  contacts,
  leads,
  deals,
  deal_stage_history,
  activities,
  activity_comments,
  attachments,
  notifications,
  audit_logs
FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  users,
  companies,
  contacts,
  leads,
  deals,
  deal_stage_history,
  activities,
  activity_comments,
  attachments,
  notifications,
  audit_logs
TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT USAGE ON TYPE
  user_role,
  lead_status,
  lead_source,
  deal_stage,
  activity_type,
  activity_result,
  notification_type,
  audit_action,
  entity_type
TO service_role;
