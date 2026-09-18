---
'@aragon/app': minor
---

Add a Basic view for the DAO permission actions: `grant`, `revoke`, `grantWithCondition`, `applySingleTargetPermissions` and `applyMultiTargetPermissions`. The proposal view shows who gets which permission on which contract. The permission name comes from the same keccak dictionary as the permissions page and the hash stays as the copyable value, an unknown hash is marked instead of hidden. The bulk actions render one card per change in calldata order, a revoke followed by a re-grant stays two changes. In the composer the same actions get a permission picker that also takes a pasted ID or a typed name (hashed for you), address inputs with ENS, and a high risk warning. The decoded view is left exactly as the kit renders it, so a reviewer can always check the raw parameters.
