import { describe, it, expect, vi } from "vitest";
import { readConfig, type FileReader } from "./good";

describe("readConfig (good — DI)", () => {
  it("parses JSON from disk", async () => {
    const fakeFs: FileReader = {
      readFile: vi.fn().mockResolvedValue('{"port": 3000}'),
    };

    const config = await readConfig("/tmp/config.json", fakeFs);

    expect(config).toEqual({ port: 3000 });
    expect(fakeFs.readFile).toHaveBeenCalledWith("/tmp/config.json", "utf8");
  });

  it("throws on invalid JSON", async () => {
    const fakeFs: FileReader = {
      readFile: vi.fn().mockResolvedValue("not json"),
    };

    await expect(readConfig("/tmp/config.json", fakeFs)).rejects.toThrow();
  });
});
