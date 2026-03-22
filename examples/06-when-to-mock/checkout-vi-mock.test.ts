import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * APPROACH 1: vi.mock (acceptable for third-party SDKs)
 *
 * This is reasonable when the SDK configures itself at import time
 * and you have no control over its initialization.
 */
describe("getCheckoutUrl (vi.mock approach)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns v2 when new-checkout-flow is enabled", async () => {
    vi.doMock("./featureFlags", () => ({
      isEnabled: (flag: string) => flag === "new-checkout-flow",
    }));

    const { getCheckoutUrl } = await import("./checkout");
    expect(getCheckoutUrl()).toBe("/checkout/v2");
  });

  it("returns v1 when new-checkout-flow is disabled", async () => {
    vi.doMock("./featureFlags", () => ({
      isEnabled: () => false,
    }));

    const { getCheckoutUrl } = await import("./checkout");
    expect(getCheckoutUrl()).toBe("/checkout/v1");
  });
});
