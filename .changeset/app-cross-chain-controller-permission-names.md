---
'@aragon/app': patch
---

Add the Cross-chain Controller plugin and Chain ID Registry permissions to the keccak dictionary, so they read as names instead of truncated hashes wherever the app resolves a permission id: the permissions list and graph, the permission-management action cards, and the permission picker in the composer. Covers `CANCEL_MESSAGE`, `FORWARD_MESSAGE`, `RETRY_MESSAGE`, `MANAGE_CHAIN_ID_REGISTRY`, `MANAGE_CONTROLLER_CONFIG`, `UNPAUSE`, and `SWEEP`.
