---
"@aragon/app": patch
---

Fix crash when rendering proposal actions that target governance plugins hidden via CMS. Plugin visibility is now presentation-only: lookups always see the full plugin list, and hiding is applied only at listings via the new `visibleOnly` option
