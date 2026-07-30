---
"@aragon/app": minor
---

Add the DAO permissions graph view backed by real permissions data, including filter handling for enriched condition metadata, inactive plugin cleanup, DAO-connected plugin edges, restored DAO self-permission placement, the incoming-permission trident layout, and adaptive graph routing/fit behavior. Proposal-creation permissions on governing bodies render as per-target creator nodes (Anyone shown with the members icon, multisig as "Members of …", Safe and plugin creators keeping their body styling), stay visible under both permission filters, and surface their condition labels; the Safe logo now also renders in the list view. When a governing body has an open Anyone create-proposal grant, the graph subsumes the more-specific create-proposal creators on that body (the list view keeps every row as a raw audit).
