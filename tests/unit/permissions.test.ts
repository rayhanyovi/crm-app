import { describe, expect, it } from "vitest";

import { can, type AuthUser } from "@/lib/permissions";
import type { UserRole } from "@/types/enums";

const users: Record<UserRole, AuthUser> = {
  ADMIN: { id: "admin", role: "ADMIN" },
  MANAGER: { id: "manager", role: "MANAGER" },
  SALES: { id: "sales", role: "SALES" },
  VIEWER: { id: "viewer", role: "VIEWER" },
};

describe("can", () => {
  it("allows all roles to read core CRM resources", () => {
    for (const user of Object.values(users)) {
      expect(can(user, "read", "company")).toBe(true);
      expect(can(user, "read", "contact")).toBe(true);
      expect(can(user, "read", "lead")).toBe(true);
      expect(can(user, "read", "deal")).toBe(true);
      expect(can(user, "read", "activity")).toBe(true);
    }
  });

  it("blocks viewers from mutations", () => {
    expect(can(users.VIEWER, "create", "company")).toBe(false);
    expect(can(users.VIEWER, "update", "lead", { ownerId: "viewer" })).toBe(
      false,
    );
    expect(can(users.VIEWER, "change_stage", "deal", { ownerId: "viewer" })).toBe(
      false,
    );
    expect(can(users.VIEWER, "add_comment", "comment")).toBe(false);
  });

  it("enforces sales ownership on own-only resources", () => {
    expect(can(users.SALES, "update", "lead", { ownerId: "sales" })).toBe(true);
    expect(can(users.SALES, "update", "lead", { ownerId: "manager" })).toBe(
      false,
    );
    expect(can(users.SALES, "convert", "lead", { ownerId: "sales" })).toBe(true);
    expect(can(users.SALES, "change_stage", "deal", { ownerId: "sales" })).toBe(
      true,
    );
    expect(can(users.SALES, "change_stage", "deal", { ownerId: "admin" })).toBe(
      false,
    );
  });

  it("lets manager and admin bypass owner-only sales restrictions", () => {
    expect(can(users.MANAGER, "update", "contact", { ownerId: "sales" })).toBe(
      true,
    );
    expect(can(users.ADMIN, "update", "deal", { ownerId: "sales" })).toBe(true);
  });

  it("limits assignment, reopen, and backward lead movement to manager plus", () => {
    expect(can(users.SALES, "assign", "lead")).toBe(false);
    expect(can(users.MANAGER, "assign", "lead")).toBe(true);
    expect(can(users.SALES, "reopen", "deal")).toBe(false);
    expect(can(users.ADMIN, "reopen", "deal")).toBe(true);
    expect(can(users.MANAGER, "move_status_backward", "lead")).toBe(true);
  });

  it("limits archive, audit logs, and user management to admins", () => {
    expect(can(users.MANAGER, "archive", "company")).toBe(false);
    expect(can(users.ADMIN, "archive", "company")).toBe(true);
    expect(can(users.MANAGER, "view_audit_logs", "audit_log")).toBe(false);
    expect(can(users.ADMIN, "view_audit_logs", "audit_log")).toBe(true);
    expect(can(users.ADMIN, "manage_users", "user")).toBe(true);
  });

  it("allows attachment deletion for admins and uploaders only", () => {
    expect(can(users.SALES, "delete_attachment", "attachment", { uploaderId: "sales" })).toBe(true);
    expect(can(users.SALES, "delete_attachment", "attachment", { uploaderId: "manager" })).toBe(false);
    expect(can(users.ADMIN, "delete_attachment", "attachment", { uploaderId: "sales" })).toBe(true);
  });
});
