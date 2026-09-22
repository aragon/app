---
"@aragon/app": minor
---

Report SPP stage status from effective proposal progression, warn that advancing forfeits a queued Safe report, and narrow what the signing surface trusts: hash under the Safe's onchain version and threshold, decode governance calldata locally, refuse payloads whose operation, value or numeric envelope fields the label cannot cover, and link queued transactions to associated Aragon proposals without treating those links as execution authority. Disclose nonce order, same-nonce rivals, queue staleness, and unavailable hash comparisons.

Open Safe proposal transactions with the complete pre-action review in the shared transaction dialog. The same primary action accepts that review and starts Sign and submit or Execute; keep transaction details expandable while signing and retain submitted execution identity for read-only recovery without another send. The review starts with a compact action, Safe, network and cost summary; optional verification details are collapsed by default behind “Verify transaction details,” while security warnings remain visible and full hashes/calldata stay expandable before and during signing.

Wait for wallet reconnection before preparing or continuing a Safe transaction, and keep review retryable when a persisted connector has not yet restored its provider.
