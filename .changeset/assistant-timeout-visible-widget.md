---
"@aragon/assistant-chat": patch
---

Give the assistant's new `timeout` error code its own wording, so a model call that stalled past the service's cap reads as "the assistant took too long — send your message again" instead of the generic failure text.
