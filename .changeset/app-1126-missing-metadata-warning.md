---
"@aragon/app": patch
---

Show the missing proposal metadata warning only when both title and description are missing. Before, the warning was shown whenever the title was not set, even when the description resolved fine and was rendered right below it.
