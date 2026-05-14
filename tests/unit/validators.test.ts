import { describe, expect, it } from "vitest";

import { companyCreateSchema } from "@/lib/validators/company";
import { contactCreateSchema } from "@/lib/validators/contact";

describe("company validators", () => {
  it("normalizes optional blank fields to null", () => {
    const result = companyCreateSchema.parse({
      name: "  Example Co  ",
      industry: "",
      website: "https://example.com",
    });

    expect(result.name).toBe("Example Co");
    expect(result.industry).toBeNull();
    expect(result.website).toBe("https://example.com");
  });

  it("requires a company name", () => {
    expect(() => companyCreateSchema.parse({ name: "" })).toThrow();
  });
});

describe("contact validators", () => {
  it("requires email or phone when creating a contact", () => {
    expect(() =>
      contactCreateSchema.parse({
        first_name: "Ari",
        last_name: "Jones",
      }),
    ).toThrow("Email or phone is required.");
  });

  it("accepts a contact with phone only", () => {
    const result = contactCreateSchema.parse({
      first_name: "Ari",
      last_name: "Jones",
      phone: "+1 555 0100",
    });

    expect(result.email).toBeUndefined();
    expect(result.phone).toBe("+1 555 0100");
  });
});
