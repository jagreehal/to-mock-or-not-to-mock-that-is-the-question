import { describe, it, expect, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";
import { loadUserName } from "./bad";

/**
 * This test works, but it couples THREE responsibilities together:
 * 1. Path construction
 * 2. File IO
 * 3. Name formatting
 *
 * If you only want to test "name formatting," you shouldn't need
 * to mock the filesystem at all.
 */
describe("loadUserName (bad — mixed responsibilities)", () => {
  it("returns full name", async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ firstName: "Ada", lastName: "Lovelace" }),
    );

    await expect(loadUserName("123")).resolves.toBe("Ada Lovelace");
  });
});
