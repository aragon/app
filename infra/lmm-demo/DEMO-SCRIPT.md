# Flow Workbench — demo script ("what to show, where")

A presenter's walkthrough for the **Lido Money Machine** flow on the Anvil
fork. This is the *narrative* layer; for environment setup (Anvil + Envio +
app, manifest symlink, env flags) see [`README.md`](./README.md).

> All interactive controls live in the **Demo ▾** dropdown in the canvas
> header (visible only when `NEXT_PUBLIC_LMM_DEMO_MODE=1`). The dropdown is
> grouped in the exact order you click through below.

---

## 0 · Pre-flight (once)

1. Stack up: `just anvil` → `just demo-up` → indexer `pnpm dev` (:8080) → app
   `pnpm dev`. Manifest is auto-symlinked.
2. Open `‹app›/dao/ethereum-mainnet/‹manifest.lmm.dao›/flow/workbench`.
3. The topbar (next to **Connect**) has two icon switches:
   - **Dashboard ⇄ Canvas** — the two product visions.
   - **Workbench ⇄ Focus** — two canvas layouts (same data, different display).
   Both are URL-driven (`?view=`), so any state you reach is shareable.

The page reads **indexed provenance** (Envio `FlowStep`/`FlowEdge`/`SwapFill`)
for amounts and the **live RPC snapshot** for current budget/gate/epoch
readings + the "next dispatch" simulation. Numbers on the canvas are real
on-chain values, never fabricated.

---

## 1 · The flow, in one breath

Point at the **"What this flow does"** card (top-left on the canvas):

> The Lido Money Machine automates the DAO treasury through three chained
> strategies — it **wraps stETH → wstETH**, **provides Uniswap V2 liquidity**,
> then runs a **price-gated CoW buyback** of LDO — with all proceeds returning
> to the vault.

Then trace it left→right on the canvas: **Vault → Wrap → {UniV2 Liquidity,
Gated CoW swap} → Treasury**. Each strategy node hangs its **budget / gate /
epoch** sub-nodes beneath it (the "parts" of the primitive).

---

## 2 · Choreography — state ⇄ action ⇄ what to point at

Run these top-to-bottom; each row maps a **Demo** action to the visual it
produces.

| # | Demo action | What changes on the canvas | Talking point |
|---|-------------|----------------------------|----------------|
| **Fund** | `Top up 100 stETH`, `Top up 1000 LDO` | The **Vault** node's balances update live (stETH/LDO rise). | "The treasury is the source; everything the machine moves comes from here." |
| **Open gate** | `Open gate` ($3,200 > $3,000 floor) | The **Price-Floor Gate** sub-node turns **green / open**. | "The buyback only runs when ETH is above the floor — no selling into weakness." |
| **Dispatch** | `Dispatch now` | Wrap node goes **firing**, edges animate with real amounts (stETH→wstETH), UniV2 + CoW fire; the **CoW buy edge shows `~estimated` / pending** (order posted, not yet filled). | "One call fans out to every fireable leg. Wrap output is on-chain-real; the CoW buy is an oracle estimate until it settles." |
| **Settle buyback** | `Settle CoW order` | The CoW node's output edge **solidifies to real** (`100 LDO`, provenance ONCHAIN_EVENT); pending badge clears. | "Now the fill is on-chain — the estimate is replaced by the settled amount." |
| **Close gate** | `Close gate` ($2,800 < floor) | The Gate sub-node turns **red / closed**; open **Simulate** → CoW leg reads **skipped · gate closed**; the CoW node renders **blocked**. | "Drop the price below the floor and the buyback refuses to fire — the gate protects the treasury." |
| **Advance time** | `Skip an epoch` / `Warp +1 day` | The **epoch** counter on the Epoch-Provider sub-node increments; **Next run** in the header updates. | "Budgets stream per epoch; warping the clock shows the next window opening." |

> **Inspector**: click any node to open the right-rail Inspector — it shows the
> per-node budget / gate / epoch readings and the output destination. Click the
> **Treasury** terminal to show proceeds loop back to the vault.

---

## 3 · The two views worth showing

- **Workbench** (default): structured — header KPIs, hero canvas, right rail
  (This flow stats + **Token throughput** + Inspector + Legend), bottom
  dispatch-history strip. Best for a "control room" read.
- **Focus**: full-bleed canvas with floating glass panels. Same data, more
  cinematic. Toggle live with the topbar **Workbench ⇄ Focus** switch — the
  graph state is preserved across the switch.

Both surface the **Token throughput** panel — the cumulative per-token tally
(e.g. *stETH out 100 · LDO back 200 · wstETH back 80.9 · UNI-V2 LP*) answering
"how much did we spend, how much did we buy back".

---

## 4 · Replay (history)

Open the **Dispatch history** strip (bottom in Workbench, bottom-left tab in
Focus). Click any past run → the canvas **re-graphs to that run** with its real
settled amounts and a "Replaying dispatch #N" banner; **Back to live** returns
to the overview. This proves the canvas projects indexed provenance, not a
mock.

> Note: budget/gate/epoch *readings* are live-only, so in a replay the
> sub-nodes show the run's static config (floor, epoch length) rather than a
> historical reading — the **edge amounts** are the settled, real values.

---

## 5 · Gotchas (so the demo doesn't lie)

- **Wrap shows `0 stETH`?** The vault was drained by a previous dispatch. Click
  `Top up 100 stETH` *before* `Dispatch now` to show a non-zero wrap. (This is
  honest accounting — the machine wrapped what was there.)
- **"Dispatch now" is disabled.** The button is gated on the live simulation:
  if every leg would be skipped (e.g. same epoch already burned, or gate
  closed with nothing else to do), it disables. `Warp +1 day` or `Top up` to
  re-arm it.
- **UNI-V2 LP shows `pending` / ghost.** LP minted amount is opaque until the
  pair `Mint` event is indexed (a known deferred indexer item) — the dotted
  edge + "pending" is the correct, honest rendering, not a bug.
- **Nothing updates after an action.** The live snapshot polls every few
  seconds; give it a beat. Confirm Anvil (:8545) and Hasura (:8080) are up.

---

## 6 · CLI equivalents (no UI)

Every Demo action has a `just` recipe in `dao-launchpad/lido/script/demo/`
(run from `dao-launchpad/lido/`): `just demo-topup`, `just demo-eth-price`,
`just demo-dispatch`, `just demo-settle-cowswap`, `just demo-set-target-epoch`,
`just demo-warp`, `just demo-status`. Useful for scripting a clean state before
a presentation, or driving the fork while the UI is on a projector.
