---
"@aragon/app": patch
---

Move Permissions below Transactions and above Settings in the DAO navigation. The link was added next to Dashboard in the source list, which reads correctly for the desktop nav — but Dashboard, Permissions and Settings are all hidden in the page context, so desktop never renders them and the position was only ever visible in the mobile/dialog nav, which sorts purely by the `order` field. Its `order` of 150 put it directly after Dashboard there.
