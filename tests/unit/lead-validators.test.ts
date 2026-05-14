import { describe, expect, it } from "vitest";

import { canMoveLeadStatus, createLeadSchema } from "@/lib/validators/lead";

describe("lead validators", () => {
  it("requires email or phone when creating a lead", () => {
    expect(() =>
      createLeadSchema.parse({
        first_name: "Riley",
        last_name: "Stone",
        source: "WEBSITE",
      }),
    ).toThrow("Email or phone is required.");
  });

  it("accepts phone-only leads", () => {
    const result = createLeadSchema.parse({
      first_name: "Riley",
      last_name: "Stone",
      phone: "+1 555 0199",
      source: "REFERRAL",
    });

    expect(result.phone).toBe("+1 555 0199");
  });

  it("allows sales users to move lead status forward only", () => {
    expect(canMoveLeadStatus({ from: "NEW", to: "QUALIFIED", role: "SALES" })).toBe(true);
    expect(canMoveLeadStatus({ from: "QUALIFIED", to: "CONTACTED", role: "SALES" })).toBe(false);
  });

  it("allows manager users to move lead status backward", () => {
    expect(canMoveLeadStatus({ from: "QUALIFIED", to: "CONTACTED", role: "MANAGER" })).toBe(true);
  });
});
