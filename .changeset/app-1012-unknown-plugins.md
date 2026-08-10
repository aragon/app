---
"@aragon/app": patch
---

Handle plugins with an unresolved interface type consistently: they are now dropped from the plugin list everywhere instead of only from process lookups, so they no longer surface as unselectable entries. The permissions view and contract versions keep showing them, since those describe what is installed on-chain. Contract updates also no longer offer plugins whose interface type cannot be matched to a known repository, which previously crashed the update dialog