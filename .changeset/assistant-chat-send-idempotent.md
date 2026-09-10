---
"@aragon/assistant-chat": patch
---

Keep an attachment sendable after another attachment of the same message failed. The composer restores and re-sends every attachment when one throws, and dropping the entry on the first send made the surviving file look like one that never uploaded: the message could no longer be sent, and removing the file skipped its server-side deletion so it still reached the ticket.
