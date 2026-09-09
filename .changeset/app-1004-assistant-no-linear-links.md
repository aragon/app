---
"@aragon/assistant": patch
"@aragon/assistant-contracts": minor
---

Drop the Linear URL from the createLinearTicket tool output: users have no access to the Linear workspace, and anything in the output also reaches the model, which would narrate the link into the chat. The tool now returns only the ticket identifier — stored tickets and history entries from before the change still parse, the stale field is stripped.
