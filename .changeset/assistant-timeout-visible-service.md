---
"@aragon/assistant": patch
"@aragon/assistant-contracts": minor
---

Stop a stalled model from silently swallowing a turn. The AI Gateway only fails a call over to the next model when the upstream *errors*, and the failure actually seen in production is the opposite: the provider accepts the call and goes quiet, so nothing errors and nothing fails over — the same prompt on the same provider answered in 1.0s, 1.7s and 2.3s, then once in 47.8s, then once not at all. A turn now runs on the first model that actually starts answering: a model that produces nothing within its deadline is abandoned for the next one, which is invisible to the user (no content had arrived) and cannot duplicate a ticket (no tool had run).

If every model stays silent, the wall-clock cap ends the turn — and that no longer fails silently either. The AI SDK closes such a stream with an `abort` chunk, which the widget renders as nothing at all: an empty message, no error, nothing in Sentry. It is now rewritten into a `timeout` error the widget can show, reported, and the turn is refunded so a retry does not cost the user twice. A stop from the composer aborts the stream the same way and is still left alone.
