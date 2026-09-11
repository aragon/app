---
'@aragon/app': minor
---

Resolve permission IDs on decoded grant and revoke actions. The composer gets a searchable permission picker, and the proposal details view tags the raw `bytes32` with the permission name it resolves to. Both read from the same keccak hash dictionary as the permissions viewer.
