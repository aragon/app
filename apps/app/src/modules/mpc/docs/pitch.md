# Off-chain transaction signing — 2-minute pitch notes

Talking points for the MPC demo. Deep version with sources: [offchain-signing-analysis.md](./offchain-signing-analysis.md).

## What you just saw

- One address, normal EOA on Sepolia. Behind it: a 2-of-3 threshold key (browser + co-signer + recovery), a
  policy ("up to 0.5 WETH, only to this wallet, above 0.1 a second member approves") and a Google
  Authenticator code before any key material moves.
- Policy check, approval by a second member with their own authenticator, 2FA, rate limiting, replay
  protection — all off-chain, before the chain sees anything. On-chain result: one ordinary signature. Zero
  gas overhead, works on any chain.
- The cryptography is honest Shamir 2-of-3, but the threshold *signing* is mocked: the key briefly exists in
  the browser. A real TSS protocol never assembles it anywhere. That gap is the difference between a demo and
  a product.

## What it costs to build this for real

- Replace the mock with a real TSS protocol (GG20 / CMP / FROST class): interactive multi-round signing,
  audited implementations, key refresh, HSM- or enclave-backed co-signer infrastructure with uptime
  guarantees. Companies whose entire product is this (Fireblocks, Dfns, Turnkey) took years and audits to get
  there.
- The moment our co-signer holds a share of user funds, we are operationally a co-custodian: incident
  response, recovery support, possibly licensing. That is a business decision, not an engineering ticket.
- What we keep from the POC either way: the policy model, the approval flows, the 2FA UX. Those sit above the
  signing layer and survive a provider swap — the code already isolates the provider behind one interface
  (`IMpcProviderAdapter`).

## What it costs to integrate instead

- Fireblocks/Fordefi wallets already connect to our app through WalletConnect today, zero code. Their
  policies and approvals run on their side; we see a normal wallet.
- Embedded MPC (Dfns, Turnkey, Privy, Web3Auth): weeks of integration, not years. We keep the UX, they keep
  the keys and the audits. Costs: per-wallet/per-signature pricing, vendor lock-in, their uptime is our
  uptime.

## What the protocol gives us for free

- EIP-7702 (live since Pectra, May 2025): an EOA can carry smart-account code — batching, gas sponsorship,
  session keys, spending limits — without changing address. Works *on top of* an MPC key: Fireblocks itself
  pitches MPC + 7702 as the target architecture.
- ERC-4337: mature bundler/paymaster infrastructure, Safe has a native module. On-chain policies (session
  keys, limits) overlap with what our co-signer enforces off-chain — for a workspace we likely want both:
  off-chain checks for speed and privacy, on-chain limits as the hard backstop.
- Cheapest wins available now, no MPC required: off-chain Safe signature collection (EIP-712 + EIP-1271) and
  gasless voting by signature for proposals.

## Where to start

1. Ship the cheap off-chain signing wins in the workspace: Safe transaction signing, vote-by-signature.
2. Treat MPC accounts as an integration first (WalletConnect now, embedded provider when demand shows up).
3. Keep the POC's policy/approval/2FA layer as our own product surface — it is provider-agnostic and it is
   what users actually see.
4. Revisit "build our own TSS" only if the workspace needs custody economics that providers can't offer.
