# Aragon App against a mock backend

Runs `apps/app` locally with a fake Aragon backend and a fake Ethereum JSON-RPC endpoint, then screenshots the pages.
No tracked repo file is modified: the only file written inside the repo is `apps/app/.env.local` (gitignored).

## Start

```sh
./start-mock.sh   # mock backend + JSON-RPC on http://localhost:4100 (log: mock-requests.log, gitignored)
./start-app.sh    # writes apps/app/.env.local and runs `next dev` on http://localhost:3000 (log: next-dev.log, gitignored)
```

`start-app.sh` points `ARAGON_BACKEND_URL` at the mock, sets `NEXT_SECRET_RPC_OVERRIDE_1=http://localhost:4100/rpc`
(server and client RPC both go through it), fills placeholder RPC keys, and preloads `server-fetch-patch.cjs`
(`NODE_OPTIONS=--require`) so the server-side Pinata IPFS pin succeeds offline.

Prerequisites (one-off): `pnpm install`, then build the workspace libraries the app imports from
`dist/`: `pnpm run build` in `packages/aragon-domain`, `packages/assistant-contracts`, `packages/gov-ui-kit`
(if `turbo` fails in your environment, build them directly).

The first visit of each route compiles it (30-60 s); the shooting scripts wait accordingly.

## Mock data (`data.cjs`)

- **Meridian DAO** (`meridian.dao.eth`, token voting, MRD token, ~$4.8M treasury: USDC, ETH, MRD, WETH, DAI),
  8 proposals MGP-1..8 (rejected, executed x2, rejected, accepted, executable, pending, active), 12 members with ENS names,
  votes, 11 transactions, permissions.
- **Atlas Grants Council** (`atlas-grants.dao.eth`, 3-of-5 multisig), 6 proposals AGC-1..6 (executed, expired,
  rejected, executable, active, pending).
- 7 more DAOs for the explore list. Timestamps are relative to the moment the mock starts.
- RPC mock answers ENS reverse/forward lookups (via Multicall3 + Universal Resolver), block timestamps, MRD balances,
  voting power, `canVote`, and `hasPermission` (true only for the demo wallet `nadia.eth`).

## Screenshots

```sh
./run-all.sh                     # everything -> ../reference (lossless WebP)
node shoot-pages.cjs [filter]     # static pages (+ two 390px mobile shots)
node shoot-wizards.cjs [name]     # createDao | createWorkspace | createProposal | createProposalMs | execute | createProcess
node shoot-dialogs.cjs [name]     # connectDialog | connected | vote | mobileNav
node shoot-one.cjs <name> <url> [mobile]
```

`shoot-lib.cjs` serves generated SVG logos for the fake `mock-assets.aragon.test` image host, fakes Pinata in the browser,
aborts other external requests, hides the Next/React Query/React Hook Form dev overlays and turns off the debug panel.
Workspaces live in localStorage: the scripts seed a "Meridian Ecosystem" workspace with both DAOs.
`wallet-inject.cjs` injects a mock EIP-1193/EIP-6963 wallet (shown as MetaMask) so wallet-connected screens render;
signing never completes.

Note: `next dev` writes an untracked `apps/app/AGENTS.md` on start (Next 16 agent rules); delete it if unwanted.
