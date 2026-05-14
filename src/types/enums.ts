export const USER_ROLES = ["ADMIN", "MANAGER", "SALES", "VIEWER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "WEBSITE",
  "REFERRAL",
  "COLD_CALL",
  "SOCIAL_MEDIA",
  "EVENT",
  "ADVERTISEMENT",
  "OTHER",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const DEAL_STAGES = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const ACTIVITY_TYPES = [
  "CALL",
  "EMAIL",
  "MEETING",
  "TASK",
  "NOTE",
  "DEMO",
  "FOLLOW_UP",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_RESULTS = [
  "COMPLETED",
  "NO_ANSWER",
  "FOLLOW_UP_NEEDED",
  "MEETING_SCHEDULED",
  "DEAL_ADVANCED",
  "CANCELLED",
  "FAILED",
] as const;
export type ActivityResult = (typeof ACTIVITY_RESULTS)[number];

export type AppUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active?: boolean;
};
