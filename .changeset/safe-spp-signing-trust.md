---
"@aragon/app": minor
---

Report SPP stage status from effective proposal progression, warn that advancing forfeits a queued Safe report, and narrow what the signing surface trusts: hash under the Safe's onchain version and threshold, decode governance calldata locally, refuse payloads whose operation, value or numeric envelope fields the label cannot cover, and link queued transactions to associated Aragon proposals without treating those links as execution authority. Disclose nonce order, same-nonce rivals, queue staleness, and unavailable hash comparisons.

Open Safe proposal transactions with the complete pre-action review in the shared transaction dialog. The same primary action accepts that review and starts Sign and submit or Execute; keep transaction details expandable while signing and retain submitted execution identity for read-only recovery without another send. The review starts with a compact action, Safe, network and cost summary; optional verification details are collapsed by default behind “Verify transaction details,” while security warnings remain visible and full hashes/calldata stay expandable before and during signing.

Wait for wallet reconnection before preparing or continuing a Safe transaction, and keep review retryable when a persisted connector has not yet restored its provider.

Keep live Safe confirmation progress neutral until execution, show recovered decisions with their signers and execution link, and use the external-body fallback for unsupported Safe versions or missing confirmation history. Consolidate read warnings, prioritize stage advancement, and keep execution recovery and indexing inside the transaction dialog.

Restore Safe approval and execution in one wallet transaction. Keep gasless approve-only and veto-only available to unsigned owners after quorum and while queued, with a direct execution action and a separate options dropdown.

Open “View in Safe” in the Safe web app and show queued-nonce warnings before quorum. Refresh Safe state again when a completed transaction dialog is closed, so Done can pick up confirmations that were not yet visible on the first read.

Use the Safe voting dropdown to select the primary button's mode. Selecting approve-only or veto-only changes the button without starting a transaction; the primary button starts the selected action.

Name the proposal occupying the Safe's current nonce in the queued-behind warning, linking to it wherever it lives. A Safe can be shared by anything, so a transaction with no Aragon correlation keeps the plain nonce warning.
