import { describe, it, expect, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(),
}));

import { writeFile } from "node:fs/promises";
import { saveReport } from "./bad";

describe("saveReport (bad — vi.mock)", () => {
  it("writes the report to disk", async () => {
    await saveReport("daily", "done");

    expect(writeFile).toHaveBeenCalledWith("./reports/daily.txt", "done", "utf8");
  });
});
