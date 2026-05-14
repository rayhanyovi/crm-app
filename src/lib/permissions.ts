import type { UserRole } from "@/types/enums";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "assign"
  | "convert"
  | "archive"
  | "change_stage"
  | "reopen"
  | "move_status_backward"
  | "view_team_dashboard"
  | "view_personal_dashboard"
  | "view_audit_logs"
  | "manage_users"
  | "global_search"
  | "view_notifications"
  | "add_comment"
  | "delete_comment"
  | "add_attachment"
  | "delete_attachment";

export type PermissionResource =
  | "company"
  | "contact"
  | "lead"
  | "deal"
  | "activity"
  | "comment"
  | "attachment"
  | "dashboard"
  | "audit_log"
  | "user"
  | "notification"
  | "search";

export type AuthUser = {
  id: string;
  role: UserRole;
};

export type ResourceContext = {
  ownerId?: string | null;
  uploaderId?: string | null;
};

type Rule = {
  minRole: UserRole;
  ownerOnlyForSales?: boolean;
  uploaderOrAdmin?: boolean;
};

const ROLE_LEVEL: Record<UserRole, number> = {
  VIEWER: 0,
  SALES: 1,
  MANAGER: 2,
  ADMIN: 3,
};

const RULES: Record<PermissionResource, Partial<Record<PermissionAction, Rule>>> = {
  company: {
    create: { minRole: "SALES" },
    read: { minRole: "VIEWER" },
    update: { minRole: "SALES" },
    archive: { minRole: "ADMIN" },
  },
  contact: {
    create: { minRole: "SALES" },
    read: { minRole: "VIEWER" },
    update: { minRole: "SALES", ownerOnlyForSales: true },
    archive: { minRole: "ADMIN" },
  },
  lead: {
    create: { minRole: "SALES" },
    read: { minRole: "VIEWER" },
    update: { minRole: "SALES", ownerOnlyForSales: true },
    assign: { minRole: "MANAGER" },
    convert: { minRole: "SALES", ownerOnlyForSales: true },
    move_status_backward: { minRole: "MANAGER" },
  },
  deal: {
    create: { minRole: "SALES" },
    read: { minRole: "VIEWER" },
    update: { minRole: "SALES", ownerOnlyForSales: true },
    change_stage: { minRole: "SALES", ownerOnlyForSales: true },
    reopen: { minRole: "MANAGER" },
    assign: { minRole: "MANAGER" },
    archive: { minRole: "ADMIN" },
  },
  activity: {
    create: { minRole: "SALES" },
    read: { minRole: "VIEWER" },
    update: { minRole: "SALES", ownerOnlyForSales: true },
  },
  comment: {
    add_comment: { minRole: "SALES" },
    read: { minRole: "VIEWER" },
    delete_comment: { minRole: "ADMIN" },
  },
  attachment: {
    add_attachment: { minRole: "SALES" },
    read: { minRole: "VIEWER" },
    delete_attachment: { minRole: "SALES", uploaderOrAdmin: true },
  },
  dashboard: {
    view_team_dashboard: { minRole: "MANAGER" },
    view_personal_dashboard: { minRole: "SALES" },
    read: { minRole: "VIEWER" },
  },
  audit_log: {
    read: { minRole: "ADMIN" },
    view_audit_logs: { minRole: "ADMIN" },
  },
  user: {
    read: { minRole: "ADMIN" },
    manage_users: { minRole: "ADMIN" },
  },
  notification: {
    read: { minRole: "VIEWER" },
    view_notifications: { minRole: "VIEWER" },
  },
  search: {
    read: { minRole: "VIEWER" },
    global_search: { minRole: "VIEWER" },
  },
};

export function hasRoleAtLeast(role: UserRole, minRole: UserRole) {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[minRole];
}

export function can(
  user: AuthUser | null | undefined,
  action: PermissionAction,
  resource: PermissionResource,
  ctx: ResourceContext = {},
) {
  if (!user) return false;

  const rule = RULES[resource]?.[action];
  if (!rule || !hasRoleAtLeast(user.role, rule.minRole)) return false;

  if (rule.uploaderOrAdmin) {
    return user.role === "ADMIN" || ctx.uploaderId === user.id;
  }

  if (
    rule.ownerOnlyForSales &&
    user.role === "SALES" &&
    ctx.ownerId !== user.id
  ) {
    return false;
  }

  return true;
}
