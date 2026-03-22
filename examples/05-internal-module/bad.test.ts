import { describe, it, expect, vi } from "vitest";

vi.mock("./db", () => ({
  saveUser: vi.fn(),
}));

import { saveUser } from "./db";
import { createUser } from "./bad";

/**
 * This test mocks an internal module by import path.
 *
 * Problems:
 * - Move saveUser to a different file → mock breaks silently
 * - Rename the export → mock breaks
 * - The test doesn't verify saveUser's actual contract
 */
describe("createUser (bad — vi.mock internal module)", () => {
  it("saves and returns the user", async () => {
    vi.mocked(saveUser).mockResolvedValue({ id: "abc123" });

    const result = await createUser("Ada", "ada@example.com");

    expect(result).toEqual({ id: "abc123" });
    expect(saveUser).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
    });
  });

  it("throws when name is missing", async () => {
    await expect(createUser("", "ada@example.com")).rejects.toThrow("Name and email are required");
  });
});
