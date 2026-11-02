---
"@aragon/app": patch
---

Register plain functions instead of hooks for the plugin actions slot so the action composer no longer risks a hook-count crash while the DAO loads
