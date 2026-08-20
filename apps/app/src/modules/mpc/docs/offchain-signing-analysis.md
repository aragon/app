# Off-chain transaction signing: options for the project workspace

State of the landscape as of August 2026 and how each path maps onto our product. Written alongside the MPC
POC (`poc/mpc-system` branch, module README one level up). "Workspace" below means the product direction
where a project gets all its accounts in one place: DAO, Safe treasuries, MPC accounts, plain wallets.

## Why off-chain signing matters for the workspace

Everything a project does on-chain starts as a signature. Today the app only ever asks a connected wallet for
`eth_sendTransaction` — no typed-data flows, no message signing, no signature aggregation. That means every
governance or treasury action is one wallet, one prompt, one on-chain transaction. Off-chain signing is the
umbrella for everything that happens between "a member wants this" and "the chain sees a signature": policy
checks, multi-party approval, second factors, signature collection, delegation. Whoever owns that layer owns
the workspace's daily UX.

Four families of technology compete for it. They are not mutually exclusive; the interesting product
decisions are about which layer we own and which we rent.

## 1. MPC / TSS (what the POC explores)

A threshold signature scheme splits one private key into shares; T-of-N parties run an interactive protocol
and produce a single ordinary signature. The key never exists in one place. On-chain the account is a plain
EOA: no contract, no gas overhead, chain-agnostic, invisible policies.

**What the POC proves.** The product layer works: 2-of-3 key ceremony in the browser, a co-signer that
enforces a policy before releasing its share (recipient allowlist, per-transfer and per-token limits, decoded
ERC-20 transfers, approval thresholds), member approvals, TOTP as a second factor with replay protection, an
activity log, and a one-screen demo where a transfer either passes policy and gets signed with an
authenticator code or is refused with a readable reason.

**What the POC deliberately fakes.** Signing reconstructs the full key in the browser. A real TSS protocol
(GG20, CMP, FROST class) signs without ever assembling the key, needs multi-round interactive rounds, audited
implementations, proactive share refresh and enclave/HSM-backed co-signer infrastructure. Fireblocks' MPC-CMP
and the years of audits behind it are the reference point for what "real" costs.

**Custody is the real price.** If our co-signer holds a share whose loss or misuse costs users money, we are
operationally a co-custodian: SLAs, incident response, recovery support, potentially licensing depending on
jurisdiction. This is the main argument for integrating instead of building.

**Integration options, cheapest first:**
- *WalletConnect (works today, zero code).* Fireblocks, Fordefi and friends connect to the app as ordinary
  wallets; their policy engines and approval apps run on their side. The workspace only needs to treat the
  address as a first-class account.
- *Embedded provider (weeks).* Dfns, Turnkey, Privy, Web3Auth create MPC keys via SDK/API. The POC's
  `IMpcProviderAdapter` (createKey / sign / reshare / recover) is exactly the seam: swap the mock for a
  provider, keep our policy and approval UX. Watch for: per-wallet pricing, org-level (shared) wallets vs
  per-user wallets, and whether the provider's policy engine fights or complements ours.
- *Build (years).* Only justified if custody economics become core to the business.

## 2. EIP-7702 — smart code on an EOA (live since Pectra, May 2025)

A type-4 transaction lets an EOA delegate execution to contract code while keeping its address, history and
assets. Wallet adoption is real: MetaMask ships EOA→smart-account upgrades on it, Rabby and Trust Wallet
followed, and type-4 transactions ramped to tens of thousands per day within the first 90 days
([Eco's 2026 deep dive](https://eco.com/support/en/articles/15254037-erc-7702-deep-dive-2026-eoa-becomes-smart-wallet),
[Openfort](https://www.openfort.io/blog/eip-7702)). What it buys: batching (approve+swap in one click), gas
sponsorship, session keys, passkey signers, on-chain spending limits.

**The combination that matters for us: MPC + 7702.** The MPC key authorizes a delegation once; afterwards the
account has smart-account UX while key security stays with the threshold scheme.
[Fireblocks pitches exactly this pairing](https://www.fireblocks.com/blog/eip-7702-mpc-wallets-smart-account-abstraction):
MPC solves 7702's key-security question (a stolen EOA key can re-delegate to malicious code — delegation is
[the most dangerous action an EOA can take](https://www.fireblocks.com/blog/security-first-approach-to-eip-7702)),
7702 solves MPC's on-chain expressiveness. For the workspace this means an "MPC account" can later gain
batching and sponsored gas without changing address — the POC's account model does not dead-end.

**Risks.** Delegation phishing is the new attack class; any workspace UI that triggers delegations must treat
the delegate contract as security-critical. Adoption is wallet-led, so we mostly consume it, not build it.

## 3. ERC-4337 — smart accounts proper

Mature by 2026: production bundlers across major L2s, paymasters sponsoring a large share of L2 transactions,
tens of millions of smart accounts
([thirdweb's 2026 guide](https://blog.thirdweb.com/account-abstraction-in-2026-how-eip-7702-and-erc-4337-are-transforming-ethereum-wallets-for-developers/),
[Eco](https://eco.com/support/en/articles/15254036-what-is-erc-4337-account-abstraction-explained-2026)).
Safe participates natively via
[Safe4337Module](https://docs.safe.global/advanced/erc-4337/4337-safe) — the treasuries we already integrate
can become 4337 accounts without leaving Safe. 7702 and 4337 converged rather than competed: the same wallet
stacks (Safe, ZeroDev, Alchemy, Biconomy) run both, with 7702 as the migration path for existing EOAs.

**Overlap warning for our roadmap.** Session keys and on-chain spending limits duplicate what our co-signer
policy does off-chain. The honest split: off-chain policy for speed, privacy and rich context (who approved,
2FA, business rules), on-chain limits as the trust-minimized backstop the user can verify. A workspace that
offers both tiers is a stronger story than either alone.

## 4. Off-chain signatures we can ship without any of the above

- **Safe transaction signing from the workspace.** Safe multisig collection is already off-chain: owners sign
  EIP-712 payloads one by one, the last one executes
  ([Safe docs on EIP-1271](https://docs.safe.global/safe-core-protocol/signatures/eip-1271)). Today our users
  leave for the Safe{Wallet} UI to do this. Bringing propose/confirm/execute into the workspace (via the Safe
  Transaction Service API) is pure integration work, no new cryptography, and it is the single most-used
  off-chain signing flow in the ecosystem.
- **Gasless voting by signature.** Vote off-chain with a typed-data signature, verify on-chain (EOA: ecrecover;
  Safe or other contract accounts: EIP-1271). Requires plugin support on the protocol side, but the app-side
  pattern is the same typed-data flow as above. This directly answers "подписывать пропоузалы" for members who
  should not pay gas to vote.
- **Permit / intents (ERC-2612 and friends).** Token approvals and orders as signatures. Relevant the moment
  the workspace touches swaps or payments.

These are the cheapest wins and they compound: once the workspace has a generic "collect signatures for this
typed-data payload" surface, Safe transactions, votes and permits are the same feature wearing three hats.

## Build vs integrate, in one table

| Path | Time to value | What we own | What we give up | Main risk |
| --- | --- | --- | --- | --- |
| POC → real TSS in-house | Years | Everything incl. custody economics | Focus; audits are expensive | We become a custodian |
| Embedded MPC provider (Dfns/Turnkey/Privy) | Weeks–months | Policy + approval + 2FA UX (the POC layer) | Key infrastructure, pricing control | Vendor lock, org-wallet support varies |
| WalletConnect to Fireblocks-class | Days | Nothing new — account = address | The whole policy UX stays on their side | None; it already works |
| EIP-7702 on top of MPC/EOA accounts | Months (wallet-led) | Batching/sponsorship UX per account | — | Delegation phishing surface |
| 4337 / Safe4337Module for treasuries | Months | On-chain policy backstop | Gas overhead per op | Duplicates off-chain policy if unfocused |
| Safe off-chain signing + vote-by-signature | Weeks | The daily governance/treasury UX | — | Protocol support needed for votes |

## Recommended sequence

1. **Now:** treat external MPC custody wallets as first-class workspace accounts (they are just addresses;
   WalletConnect signing already works). Ship Safe off-chain transaction signing inside the workspace.
2. **Next:** vote-by-signature for proposals where the protocol allows it; a generic typed-data
   signature-collection surface in the workspace.
3. **Then:** if users ask for workspace-native MPC accounts, integrate an embedded provider behind
   `IMpcProviderAdapter` and keep the POC's policy/approval/TOTP layer as our differentiator.
4. **Later:** 7702 delegation for workspace accounts (batching, sponsored gas) once wallet UX settles;
   on-chain limits via 4337/Safe modules as the verifiable backstop to off-chain policy.
5. **Only with a business case:** building our own TSS.

## Sources

- [Eco: ERC-7702 deep dive 2026](https://eco.com/support/en/articles/15254037-erc-7702-deep-dive-2026-eoa-becomes-smart-wallet)
- [Openfort: EIP-7702 in 2026](https://www.openfort.io/blog/eip-7702)
- [Fireblocks: MPC and EIP-7702](https://www.fireblocks.com/blog/eip-7702-mpc-wallets-smart-account-abstraction) · [Security-first approach to EIP-7702](https://www.fireblocks.com/blog/security-first-approach-to-eip-7702)
- [thirdweb: account abstraction in 2026](https://blog.thirdweb.com/account-abstraction-in-2026-how-eip-7702-and-erc-4337-are-transforming-ethereum-wallets-for-developers/)
- [Eco: ERC-4337 explained 2026](https://eco.com/support/en/articles/15254036-what-is-erc-4337-account-abstraction-explained-2026) · [EIP-7702 vs ERC-4337](https://eco.com/support/en/articles/14797813-eip-7702-vs-erc-4337-two-smart-wallet-paths)
- [Safe: ERC-4337 module](https://docs.safe.global/advanced/erc-4337/4337-safe) · [EIP-1271 off-chain signatures](https://docs.safe.global/safe-core-protocol/signatures/eip-1271)
- [Curvegrid: practical look at EIP-7702](https://www.curvegrid.com/blog/2026-02-13-a-practical-look-at-eip-7702-and-wallet-delegation)
- MPC provider landscape: see the pitch and the earlier comparison ([Eco: MPC providers](https://eco.com/support/en/articles/15862993-mpc-wallet-providers-how-to-choose), [Openfort: WaaS providers](https://www.openfort.io/blog/best-wallet-as-a-service))
