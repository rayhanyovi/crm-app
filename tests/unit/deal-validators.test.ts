import { describe, expect, it } from "vitest";

import { dealCreateSchema, dealStageSchema, dealUpdateSchema } from "@/lib/validators/deal";

describe("deal validators", () => {
  it("coerces deal value and defaults stage", () => {
    const result = dealCreateSchema.parse({
      title: "Acme rollout",
      value: "25000",
      contact_id: "20000000-0000-4000-8000-000000000001",
    });

    expect(result.value).toBe(25000);
    expect(result.stage).toBe("LEAD");
  });

  it("requires lost reason when closing lost", () => {
    const result = dealStageSchema.safeParse({ stage: "CLOSED_LOST" });

    expect(result.success).toBe(false);
  });

  it("allows closed lost when a reason is provided", () => {
    const result = dealStageSchema.parse({
      stage: "CLOSED_LOST",
      lost_reason: "Budget moved to next fiscal year.",
    });

    expect(result.lost_reason).toBe("Budget moved to next fiscal year.");
  });

  it("rejects empty deal updates", () => {
    expect(dealUpdateSchema.safeParse({}).success).toBe(false);
  });
});
