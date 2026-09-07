---
name: test-scope-and-selectors
description: What a test may assert (its own subject, never its dependencies) and how it may select — roles and labels yes, custom handles and traversal no.
globs: apps/app/src/**/*.test.ts, apps/app/src/**/*.test.tsx
kind: rule
---

# test-scope-and-selectors

Spec: `docs/projectDocs/testing.md` ("What a test may assert", "How a test may select"). The composition rule behind the selector ban is in `docs/codingGuidelines/codingGuidelines.md` under React Components.

Canon: `src/shared/components/forms/advancedDateInput/advancedDateInputDuration.test.tsx` (drives the real UI, asserts at the form boundary), `src/shared/components/forms/autocompleteInput/autocompleteInput.test.tsx` (spies the callback, asserts `toHaveBeenCalledWith`).

In one line each: assert only the paired subject's states and input/output, never a dependency's behaviour; select by role, label or text, never by `data-testid`, CSS, or DOM traversal.

## Silent-failure modes

These cost real debugging and are invisible from any single file:

- **`formState` read off a captured form object is a subscription proxy.** It does not update when read outside render, so `form.formState.errors[field]` comes back empty and the assertion passes vacuously. Use `form.getFieldState(field)`.
- **A handler wired to react-hook-form's `trigger()` returns a promise.** Await it, or the validation assertion races the resolution and reads stale state.
- **Mocking a kit component to dodge a selector removes the wiring from the test.** If the pull is toward `jest.mock('@aragon/gov-ui-kit', …)` purely to avoid querying, keep the real render — the selector rules already allow role, label and text.

## Before calling a test done

Break the matching line in the subject, confirm exactly that test fails, revert. A green test that cannot fail is worthless, and copying a failure's `Received:` value into the expectation is the specific anti-pattern the assert-your-subject rule exists to prevent.
