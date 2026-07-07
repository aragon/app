---
"@aragon/app": patch
---

Fix an executed SPP proposal showing its final stage as "expired" / "Proposal not executed in time". The per-stage status was derived from the clock alone (`now > maxAdvanceDate`) without checking whether the proposal had already been executed, so a proposal executed on time would flip to expired once viewed after its max-advance date. Executed proposals are now treated as accepted regardless of the max-advance date.
