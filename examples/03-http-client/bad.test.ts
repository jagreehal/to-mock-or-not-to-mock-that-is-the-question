import { describe, it, expect, vi } from "vitest";
import { getWeather, _setClient, type AxiosLike } from "./bad";

/**
 * This simulates the vi.mock approach.
 *
 * In a real codebase you'd do:
 *   vi.mock("axios", () => ({ default: { get: vi.fn() } }));
 *
 * The problem: this test is coupled to the HTTP library choice.
 * If someone refactors from axios to fetch, this test breaks
 * even though the behavior is identical.
 */
describe("getWeather (bad — coupled to implementation)", () => {
  it("returns temperature", async () => {
    const mockClient: AxiosLike = {
      get: vi.fn().mockResolvedValue({
        data: { temperature: 22 },
      }),
    };

    _setClient(mockClient);

    const temp = await getWeather("London");

    expect(temp).toBe(22);

    // Reset for other tests
    _setClient(null as unknown as AxiosLike);
  });
});
