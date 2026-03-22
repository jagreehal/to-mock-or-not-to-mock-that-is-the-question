import { isEnabled } from "./featureFlags";

export function getCheckoutUrl() {
  if (isEnabled("new-checkout-flow")) {
    return "/checkout/v2";
  }
  return "/checkout/v1";
}
