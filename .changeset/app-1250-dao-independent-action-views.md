---
"@aragon/app": patch
---

Fix cross-chain forwarded actions crashing the proposal page when they match a view that needs the DAO (e.g. `activateGauge`): only the views flagged as `isDaoIndependent` (transfers, metadata updates and permission changes) are now resolved for them, and every other forwarded action renders with the generic decoded view.
