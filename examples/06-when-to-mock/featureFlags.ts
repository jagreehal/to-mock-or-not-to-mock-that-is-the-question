/**
 * Example: feature flags that configure themselves at import time.
 *
 * In a real app, this might import a third-party SDK that initializes
 * with an API key and exposes isEnabled(flagName).
 */
let _flags: Record<string, boolean> = {
  "new-checkout-flow": false,
  "dark-mode": false,
};

export function isEnabled(flagName: string): boolean {
  return _flags[flagName] ?? false;
}

/** For testing — allows overriding flags without vi.mock */
export function _setFlags(flags: Record<string, boolean>) {
  _flags = flags;
}
