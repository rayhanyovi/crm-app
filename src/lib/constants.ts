import type {
  ActivityResult,
  ActivityType,
  DealStage,
  LeadSource,
  LeadStatus,
  UserRole,
} from "@/types/enums";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "UnifiedCRM";
export const DEMO_USER_COOKIE = "demo_user_id";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  SALES: "Sales Rep",
  VIEWER: "Viewer",
};

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  LEAD: "Lead",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

export const DEAL_STAGE_ORDER: DealStage[] = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  COLD_CALL: "Cold call",
  SOCIAL_MEDIA: "Social media",
  EVENT: "Event",
  ADVERTISEMENT: "Advertisement",
  OTHER: "Other",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  TASK: "Task",
  NOTE: "Note",
  DEMO: "Demo",
  FOLLOW_UP: "Follow-up",
};

export const ACTIVITY_RESULT_LABELS: Record<ActivityResult, string> = {
  COMPLETED: "Completed",
  NO_ANSWER: "No answer",
  FOLLOW_UP_NEEDED: "Follow-up needed",
  MEETING_SCHEDULED: "Meeting scheduled",
  DEAL_ADVANCED: "Deal advanced",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
