---
"@aragon/aragon-domain": minor
---

Add the `getTokenVotingMembership` use case: a paginated, voting-power-ordered list of a TokenVoting plugin's ERC20Votes members, scoped by chain id and enriched with primary ENS names resolved through viem. `AragonDomain.load` now takes an `RpcUrls` map (RPC endpoints keyed by chain id) alongside the `EnvioClient`; the mainnet (chain id 1) entry is required and `load` throws without it instead of letting ENS lookups fall back to viem's public endpoint.
