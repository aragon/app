---
"@aragon/app": patch
"@aragon/assistant-chat": patch
---

Move the remaining spacing classes of the app and the support chat onto GovKit spacing roles (navigation chrome, page and dialog insets, section gaps, the stepped section gap of wizard steps and settings forms) and lint raw spacing classes with the kit's Biome plugin; geometry, the debug panel and a few places no role fits within the change budget are allowlisted. Nothing renders differently.
