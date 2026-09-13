---
'@aragon/app': minor
---

Resolve permission IDs on the four DAO permission actions: `grant`, `revoke`, `applySingleTargetPermissions` and `applyMultiTargetPermissions`. The proposal view shows the permission name with the hash kept as copyable evidence, and the bulk actions render one line per change instead of raw ABI fields. The composer gets a searchable permission picker, a row editor for the bulk actions, and a warning that modifying permissions is high risk. Names come from the same keccak dictionary as the permissions page, so the composer and the proposal view cannot drift apart.
