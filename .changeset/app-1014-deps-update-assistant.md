---
"@aragon/assistant": patch
---

Update dependencies (ai 7.0.79, Sentry 10.71, hono 4.13.4) and move the failed-turn refund into the model-stream error handler: the AI SDK now converts merged-stream errors into error parts before they reach the outer stream callback, which silently skipped the refund.
