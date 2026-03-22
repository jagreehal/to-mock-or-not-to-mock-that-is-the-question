# Act VI: The Necessary Evil

_Wherein we acknowledge that not all mocks are villains._

## When vi.mock Is Acceptable

`vi.mock` isn't always wrong. Here are cases where it's the pragmatic choice.

### 1. Legacy code you can't refactor

If you're testing a module you don't own or can't change right now, `vi.mock` is a reasonable seam.

### 2. Third-party SDKs with global configuration

Some SDKs (analytics, error tracking, feature flags) configure themselves at import time and have side effects. Mocking the module can be simpler than wrapping every call.

### 3. Feature flags during migration

When migrating from one feature flag system to another, a module mock can serve as a temporary bridge.

### 4. Coarse app-boundary tests

Integration/smoke tests that verify "the app starts" may need to mock heavy dependencies (database, cloud services) to run in CI.

## The Moral

These are **exceptions**, not defaults. If every test file starts with `vi.mock(...)`, your code has a design problem.

The goal is:

- **Default:** DI + explicit seams
- **Exception:** `vi.mock` when DI adds ceremony without benefit

## Files

- `checkout-vi-mock.test.ts` — uses `vi.doMock` for the feature flags module (acceptable for third-party SDKs)
- `checkout-test-hook.test.ts` — uses `_setFlags` exported from the module itself (preferred when you own the code)
