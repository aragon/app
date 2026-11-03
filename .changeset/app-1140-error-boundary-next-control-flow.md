---
"@aragon/app": patch
---

Let `notFound()` and `redirect()` pass through the app error boundary, so they render the not-found page or redirect instead of the generic error state.
