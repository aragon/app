---
"@aragon/app": minor
---

Add the aragon-domain (Envio) source for mainnet ERC-20 token-voting member lists behind the `domainMemberList` feature flag (off by default): a chain-scoped BFF route, per-plugin source routing that falls back to the legacy backend, the library DTO as the member list contract, and SSR hydration of the members page
