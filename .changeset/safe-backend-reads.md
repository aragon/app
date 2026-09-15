---
"@aragon/app": minor
---

Read Safe governance body state from Aragon's backend instead of calling the Safe transaction service directly, so concurrent viewers of a Safe share one cached upstream read, owners and threshold cost no Safe API quota at all, and a payload served from the backend's stale window is shown as such
