import { describe, it, expect, vi } from "vitest";
import { saveReport, type ReportStore } from "./good";

describe("saveReport (good — DI)", () => {
  it("sends the report to the store", async () => {
    const store: ReportStore = {
      save: vi.fn().mockResolvedValue(undefined),
    };

    await saveReport("daily", "done", store);

    expect(store.save).toHaveBeenCalledWith("./reports/daily.txt", "done");
  });
});
