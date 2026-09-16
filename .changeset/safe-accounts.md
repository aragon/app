---
'@aragon/app': minor
---

Add Safe multisig bodies to SPP proposal stages with live approval and veto status, confirmation lists, result reporting, execution, and settled-result attribution. Add a Safe account view for balances and queued transactions, including transaction review, hardware-wallet hash verification, a route from a proposal to the queued transaction it reported, and two named routes out of a blocked nonce slot: removing the offchain queue record, which revokes no signature, and proposing an onchain replacement at the same nonce.
