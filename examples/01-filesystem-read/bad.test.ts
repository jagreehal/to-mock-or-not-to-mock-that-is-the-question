import { describe, it, expect, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";
import { readConfig } from "./bad";

describe("readConfig (bad — vi.mock)", () => {
  it("parses JSON from disk", async () => {
    vi.mocked(readFile).mockResolvedValue('{"port": 3000}');

    const config = await readConfig("/tmp/config.json");

    expect(config).toEqual({ port: 3000 });
    expect(readFile).toHaveBeenCalledWith("/tmp/config.json", "utf8");
  });

  it("throws on invalid JSON", async () => {
    vi.mocked(readFile).mockResolvedValue("not json");

    await expect(readConfig("/tmp/config.json")).rejects.toThrow();
  });
});
