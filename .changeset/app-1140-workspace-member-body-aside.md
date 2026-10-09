---
"@aragon/app": patch
---

Describe the selected body on the aside of the workspace members page, which until now kept showing the aggregated member stats whatever the tab: picking a body swaps the card for that body's information, the swap the DAO members page makes, so the aside describes whatever the list is filtered to. The tabs moved into a `useWorkspaceMemberTabs` hook that the list and the page share, deriving the selection from the URL alone, so the card cannot describe a different tab than the one being shown — the shape the proposals page already had. A single body covering the whole list has no tab strip to select from, and the aside describes that body all the same, as the DAO members page does. The body tabs also drop the name of the DAO they belong to when a single account contributes them, where it only repeated the tab beside it; a Safe contributing members without a tab of its own does not count as a second one.
