import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCheckoutUrl } from "./checkout";
import { _setFlags } from "./featureFlags";

/**
 * APPROACH 2: Testable escape hook (preferred when you own the code)
 *
 * The featureFlags module exposes _setFlags for testing.
 * This is a middle ground — no vi.mock, but also no function parameter.
 *
 * Use this pattern when:
 * - The dependency is a singleton / global config
 * - Adding a parameter would thread through many call sites
 * - You own the code and can add a test hook
 */
describe("getCheckoutUrl (test hook approach)", () => {
  beforeEach(() => {
    _setFlags({});
  });

  it("returns v2 when new-checkout-flow is enabled", () => {
    _setFlags({ "new-checkout-flow": true });

    expect(getCheckoutUrl()).toBe("/checkout/v2");
  });

  it("returns v1 when new-checkout-flow is disabled", () => {
    _setFlags({ "new-checkout-flow": false });

    expect(getCheckoutUrl()).toBe("/checkout/v1");
  });
});
