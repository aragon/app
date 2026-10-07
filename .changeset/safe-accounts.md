---
'@aragon/app': minor
---

Add Safe multisig bodies to SPP proposal stages with live approval and veto status, confirmation lists, result reporting, execution, and settled-result attribution. Add a read-only Safe account view for balances and nonce-ordered queued transactions, with proposal links, independent payload review, and hardware-wallet hash comparison. Keep signing, confirmation, and execution in proposal context.

List a DAO's Safes as ordinary governance bodies: one Safe appears once on Members with its own tab, owner list and aside, whether it is referenced by a process, carried as a body, or both. Name each Safe by its address so a DAO holding several of them stays readable, and offer no plugin update for a Safe, which is not installed from a repository. Members tabs keep their place in the URL across reload and shared links. Keep a Safe used by several linked DAOs scoped to the DAO being viewed, and keep stage permissions decided by the process's own stage conditions.
