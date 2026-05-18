---
"@aragon/app": patch
---

Fix "Something went wrong" on the DAO member page for valid but non-checksummed addresses by normalizing to EIP-55 and redirecting to the canonical URL.
