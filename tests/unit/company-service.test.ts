import { describe, expect, it } from "vitest";

import { ConflictError } from "@/lib/api-helpers";
import { checkDuplicateCompany, createCompany } from "@/services/company.service";

describe("company service", () => {
  it("detects exact duplicate company names case-insensitively", async () => {
    const result = await checkDuplicateCompany("acme analytics");

    expect(result.exactMatch?.name).toBe("Acme Analytics");
  });

  it("returns similar company matches", async () => {
    const result = await checkDuplicateCompany("Acme");

    expect(result.similarMatches.some((company) => company.name === "Acme Analytics")).toBe(
      true,
    );
  });

  it("blocks creating an exact duplicate company", async () => {
    await expect(
      createCompany({ name: "Acme Analytics" }, "00000000-0000-4000-8000-000000000003"),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
