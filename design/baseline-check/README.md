# Baseline check

Runs the real Aragon App (`apps/app`) on mock data, takes reference screenshots of it, and compares the design-canvas
screens in `design/canvas/` with those screenshots. It is how the baseline canvas is kept honest: when the app
changes, the screenshots change, and the comparison shows which screens have drifted.

Nothing here is part of the app. The scripts are plain Node (`.cjs`) and shell, declare no dependencies, and borrow
Playwright, viem and sharp from `apps/app`.

## Prerequisites

- Node: the repo asks for >= 24.22.3 (`.nvmrc`). The numbers in this file were measured on Node 22.23.4, which also works.
- `pnpm install` at the repo root.
- The workspace libraries the app imports from `dist/` must be built: `pnpm --filter "@aragon/app^..." build`
  (`@aragon/aragon-domain`, `@aragon/assistant-contracts`, `@aragon/gov-ui-kit`).
- Chromium for Playwright: `pnpm --filter @aragon/app e2e:install`. Where that build cannot be installed, point
  `CHROMIUM_PATH` at a Chromium binary, or at a folder that contains one, and every script uses it instead.
- `bash` and `curl` for the three shell scripts.

## Use

All commands work from any directory; these are written from the repo root.

```sh
design/baseline-check/start.sh      # mock backend on :4100 and `next dev` on :3000; returns when both answer
design/baseline-check/capture.sh    # every screenshot -> design/baseline-check/out/shots/
node design/baseline-check/compare.cjs   # canvas screens against design/reference/
design/baseline-check/stop.sh       # stops both servers, checks the ports are free
```

Ports: `MOCK_PORT` and `APP_PORT` (defaults 4100 and 3000), honoured by every script; set them the same way for
`start.sh`, the capture scripts and `stop.sh`.

### Output

Everything the scripts write goes to `design/baseline-check/out/` (gitignored):

| Path | What |
|---|---|
| `out/shots/*.webp` | Screenshots of the app (lossless WebP) |
| `out/failures/*.png` | The screen at the moment a capture failed |
| `out/compare/*.png` | reference, canvas and difference side by side, one image per comparison |
| `out/canvas/*.png` | Artboards rendered by `render-canvas.cjs` |
| `out/runtime/` | The canvas runtime and design-system copy (see Canvas runtime) |
| `out/*.log`, `out/*.pid` | Server logs (`next-dev.log`, `mock-server.log`, `mock-requests.log`) and pidfiles |

### Updating the reference screenshots

`design/reference/` is written only when asked, and only as part of a baseline update, never in a feature change:

```sh
design/baseline-check/capture.sh --update
```

This captures everything and, only if no capture failed, makes `design/reference/` exactly the set of this run:
new screenshots are copied in and screenshots the run no longer produces are removed.

### Parts

```sh
node design/baseline-check/capture-pages.cjs [--update] [part of a shot name]   # e.g. "ms-", "mobile", "dao-dashboard"
node design/baseline-check/capture-wizards.cjs [--update] [createDao|createWorkspace|createProposal|execute|createProcess]
node design/baseline-check/capture-dialogs.cjs [--update] [connectDialog|connected|vote|mobileNav]
node design/baseline-check/render-canvas.cjs [--mobile] [Main.dc.html ...]      # artboards only, no comparison
node design/baseline-check/compare.cjs [--threshold <percent>]                  # default 1
```

With `--update` a single script copies the screenshots it produced into `design/reference/` (when none failed); it
does not remove anything. A name that matches nothing, an unknown argument, a server that does not answer, or any
failed capture ends the script with exit code 1 and a summary.

A capture fails when the page does not load, answers another HTTP status than expected (200; 404 for the two
not-found shots), shows the app's error screen ("Something went wrong"), throws a script error, renders HTML on the
server that React cannot hydrate, never stops loading or never holds still, when an interaction step does not find
what it expects, or when the mock backend received a request it has no route for.

### Comparison

`compare.cjs` reads `design/screens.json`. For each screen it renders the artboard at 1440 px wide (and at 390 px
when the screen has a `mobileReference`), and prints the reference height, the canvas height and the share of pixels
that differ by more than 25/255 in a channel. It exits 1 when a height differs, when more than the threshold of
pixels differ, when a render reports a page error or a missing file, or when a screen uses a class that neither the
kit stylesheet nor `design/canvas/app.css` defines.

### Canvas runtime

Rendering an artboard needs two things the claude.ai canvas serves and the repo does not hold:

| Canvas path | Goes to |
|---|---|
| `artifact-type/dc-runtime.js` (the artboards load it as `./support.js`) | `out/runtime/artifact-type/dc-runtime.js` |
| `project/ds/aragon-gov-ui-kit/**` (the canvas's copy of the design system) | `out/runtime/project/ds/aragon-gov-ui-kit/` |

A Claude session fetches them from the live canvas (link in `design/README.md`) with the Artifact tool (`read` with
`paths`). Without them `render-canvas.cjs` and `compare.cjs` stop and say so. When `design/canvases/baseline.json`
lists `kit.files`, the copy is verified against those checksums first, so a comparison never runs on another kit
version than the pinned one.

Two requests answer 404 in every render and are not counted: `components/src/theme/fonts/Manrope-Regular.ttf` and
`Manrope-SemiBold.ttf`. The design system's `components/bundle.css` declares the fonts a second time with a path it
does not ship; the fonts load through `tokens.css`.

## What is mocked

| | |
|---|---|
| Backend | `mock-server.cjs` answers the Aragon backend routes the app uses from `data.cjs`. `start.sh` points `ARAGON_BACKEND_URL` at it. |
| Ethereum RPC | The same server answers JSON-RPC on `/rpc` (`NEXT_SECRET_RPC_OVERRIDE_1`): ENS forward and reverse lookups (Multicall3 + Universal Resolver), block timestamps, MRD balances and voting power, `canVote`, and `hasPermission` (true only for the demo wallet `nadia.eth`). |
| IPFS | Pinning through Pinata is faked on the server (`server-preload.cjs`) and in the browser (`lib.cjs`); nothing is uploaded. |
| CMS | The five `aragon/app-cms` files the app fetches are served from the snapshot in `cms/`, on the server and in the browser. To refresh the snapshot, download the files from `https://raw.githubusercontent.com/aragon/app-cms/main/` again. |
| Wallet | `wallet-inject.cjs` injects an EIP-1193 / EIP-6963 wallet (shown as MetaMask) with one account. Reads go to the mock RPC; signing and sending never complete, so transaction dialogs stop at "Sign transaction". |
| Images | DAO avatars and token logos of the mock data point at `mock-assets.aragon.test`; the browser gets `design/canvas/assets/mock/{avatar,token}/<key>.svg`, the same files the canvas screens use. |
| Clock | One reference time, `referenceTime` in `design/screens.json` (override: `MOCK_NOW`, for the servers and the scripts alike). The mock data is computed from it, the Next.js server's `Date` is frozen at it, and so is the browser's (timers keep running). |
| Everything else | Refused. The server may only fetch from this machine; the browser gets the app, the items above, and nothing else (wallet SDK configuration, analytics, WalletConnect sockets, remote images). |

Not mocked: the app itself. `start.sh` runs `next dev` on the app's own code with the variables of
`apps/app/config/.env.local` plus the overrides above, passed as process environment. It writes nothing into
`apps/app` except Next.js's own `.next/` cache, of which it deletes `dev/cache/fetch-cache` so the server reads the
CMS snapshot instead of a copy fetched earlier.

Consequences that are visible in the screenshots:

- The logos of the "Featured" DAOs on Explore are remote images, so the app shows initials.
- The wallet-connect dialog of the wallet SDK (`dialog-connect-wallet-appkit`) shows what the SDK shows offline.
- The version tag in the footer reads `(LOC)`: this is the local development build.

## Mock data (`data.cjs`)

- **Meridian DAO** (`meridian.dao.eth`, token voting, MRD token). Treasury of about $4.8M in USDC, ETH, MRD, WETH and
  DAI; 8 proposals MGP-1..8 (rejected, executed, executed, rejected, accepted, executable, pending, active);
  12 members, 8 of them with ENS names; 11 transactions; permissions.
- **Atlas Grants Council** (`atlas-grants.dao.eth`, 3-of-5 multisig). Treasury in USDC, DAI and ETH; 6 proposals
  AGC-1..6 (executed, expired, rejected, executable, active, pending); 5 members, all with ENS names; 4 transactions.
- 7 more DAOs, which only appear in the Explore list (9 DAOs in total).
- A workspace "Meridian Ecosystem" holding both DAOs. Workspaces live in the browser's localStorage, so the capture
  scripts seed it there.

## Determinism

Two captures of the same code give byte-identical files. What makes that so:

- **Clock**: see above. Dates and relative labels ("3 days left") do not depend on when the capture runs.
- **Motion**: the browser asks for reduced motion, CSS animations and transitions are cut to zero length, and
  screenshots are taken with animations disabled, so spinners and the pulsing status dot hold their first frame.
- **Explore carousel**: the "Featured" row is moved by framer-motion on every animation frame, which CSS settings do
  not reach. `lib.cjs` pins its track with one CSS rule (`translateX(-160px)`), the frame the canvas reproduces.
- **Readiness**: a screenshot is taken only when React has hydrated the page, no request has been in flight for
  half a second, fonts and all images (lazy ones included) have loaded, no loading skeleton is left, and two
  consecutive frames are identical.
- **Permissions graph**: React Flow measures its edges while the graph is still zooming to fit, which leaves
  rounding noise. `capture-pages.cjs` makes it measure again once the graph is at rest.
- **Wallet pages**: the server renders every page as "not connected". The scripts let the wallet connect on Explore
  first and then navigate inside the app, so the page under capture is rendered once, in its connected state.
- **Isolation**: every page, wizard and dialog runs in a fresh browser context.

## Known limitations

- The first start is slow: `next dev` compiles the app and each route on first use. See Run times.
- Byte-identical output is a property of one machine and browser build. Another Chromium version or another set of
  system fonts can change antialiasing; compare such runs by pixels, not by bytes.
- The mock backend only knows the routes the captured pages use. A page that asks for something else fails the
  capture ("no route"), and the route has to be added to `mock-server.cjs`.
- Signing is not simulated, so no screen after "Sign transaction" can be captured.
- The mobile top-bar menu button has no accessible name; `capture-dialogs.cjs` finds it by position in the bar.

## Run times

Measured on a 4-core Linux container with a slow filesystem, Chromium 153, Node 22.23.4:

RUNTIMES
