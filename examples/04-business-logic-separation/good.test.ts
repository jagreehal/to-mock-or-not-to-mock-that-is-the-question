import { describe, it, expect, vi } from "vitest";
import { formatUserName, loadUserName, type UserRepo } from "./good";

/**
 * Pure domain logic — no mocks, no IO, no fuss.
 * This test is fast, reliable, and tells you exactly what breaks.
 */
describe("formatUserName (pure function)", () => {
  it("formats full name", () => {
    expect(formatUserName({ firstName: "Ada", lastName: "Lovelace" })).toBe("Ada Lovelace");
  });

  it("handles names with special characters", () => {
    expect(formatUserName({ firstName: "José", lastName: "García" })).toBe("José García");
  });
});

/**
 * Service test — fake the repo, test the orchestration.
 * Still no vi.mock needed.
 */
describe("loadUserName (service with DI)", () => {
  it("loads from repo and formats name", async () => {
    const repo: UserRepo = {
      getUser: vi.fn().mockResolvedValue({
        firstName: "Ada",
        lastName: "Lovelace",
      }),
    };

    await expect(loadUserName("123", repo)).resolves.toBe("Ada Lovelace");
    expect(repo.getUser).toHaveBeenCalledWith("123");
  });
});
