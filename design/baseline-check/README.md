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
new screenshots are copied in and screenshots the run no longer produces are removed. It then runs the route
coverage check (below).

### Route coverage

```sh
node design/baseline-check/check-routes.cjs
```

Lists every page route of the app (each `page.tsx` under `apps/app/src/app`) with the reference that shows it, and
exits 1 when a route has no reference and no reason in its skip list, when a listed reference is not in
`design/reference/`, or when a listed route no longer exists. Both lists are at the top of `check-routes.cjs`. A new
page in the app makes the check fail until it gets a capture (`capture-pages.cjs` or `capture-wizards.cjs`) and a row
in `COVERED`, or a commented entry in `SKIP` (today: the automations pages, the plugin pages no mock DAO has, the
`/workspace` redirect and the two workspace catch-alls that only answer 404).

### Parts

```sh
node design/baseline-check/capture-pages.cjs [--update] [part of a shot name]   # e.g. "ms-", "mobile", "dao-dashboard"
node design/baseline-check/capture-wizards.cjs [--update] [createDao|createWorkspace|createProposal|msCreateProposal|execute|createProcess|sppCreateProposal|workspaceExecute]
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

### Canvas layout

```sh
node design/baseline-check/layout-canvas.cjs
```

Writes the canvas's pages, board positions and row titles into `design/canvas/canvas.json` from
`design/screens.json` → `pages`: each page is a list of rows, each row a title and its artboards left to right. Every
`.dc.html` file must be on exactly one row, so the script fails when a screen or part is missing, listed twice, or
listed without a file. A new screen therefore gets its name added to a row, then this script; positions are never
edited by hand. It keeps each board's other keys (size, title, flags); a board it has not seen before takes its size
from the file's `$preview`.

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
| Backend | `mock-server.cjs` answers the Aragon backend routes the app uses from `data.cjs` (Northstar: `data-spp.cjs`, `routes-spp.cjs`). `start.sh` points `ARAGON_BACKEND_URL` at it. |
| Safe transaction service | The app's `/api/safe` proxy has no URL override: `server-preload.cjs` forwards its upstream (`api.safe.global/tx-service`) to the mock, and `start.sh` sets a dummy `NEXT_SECRET_SAFE_API_KEY`, without which the proxy refuses to load. |
| Ethereum RPC | The same server answers JSON-RPC on `/rpc` (`NEXT_SECRET_RPC_OVERRIDE_1`): ENS forward and reverse lookups (Multicall3 + Universal Resolver), block timestamps, MRD balances and voting power, `canVote`, and `hasPermission` (true only for the demo wallet `nadia.eth`). |
| IPFS | Pinning through Pinata is faked on the server (`server-preload.cjs`) and in the browser (`lib.cjs`); nothing is uploaded. |
| CMS | The five `aragon/app-cms` files the app fetches are served from the snapshot in `cms/`, on the server and in the browser. To refresh the snapshot, download the files from `https://raw.githubusercontent.com/aragon/app-cms/main/` again. |
| Feature flags | Not overridden. The app runs as `NEXT_PUBLIC_ENV=local` (from `config/.env.local`), so the flags take their `local` value from the CMS snapshot's `feature-flags.json`; `workspaces` and `safeAccountPage` (the `/safe/...` page) are on there. A flag can also be forced per browser with the app's override cookie (`featureFlags.constants.ts`). |
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
- **Northstar Protocol** (`northstar.dao.eth`, staged governance: one Staged Proposal Processor process, NSP), in
  `data-spp.cjs` with its routes in `routes-spp.cjs`. Stage 1 "Council approval": the Northstar Council Safe (3-of-5)
  and the Core Team multisig (2-of-3) as approval bodies; stage 2 "Community veto": NSP token holders and the Security
  Guardian Safe (2-of-4) as veto bodies. 8 proposals NSP-1..8 (rejected, executed, expired, executable, vetoed, active
  in the veto stage, advanceable, active in the approval stage); 12 people across the bodies; treasury of about $8.3M.
  The Safes are drawn as external bodies on proposal pages (the app at HEAD throws on a Safe body described with
  `interfaceType: 'safe'`); their owners, queue and history come from the backend's `/v2/safe/*`, and the Safe
  account page reads its balances from the Safe transaction service, which `server-preload.cjs` forwards to the mock.
  Northstar is in no list (Explore, "your DAOs", workspace), so the pages of the other DAOs do not change; its pages
  are reached by URL (`spp-*` screenshots).
- 7 more DAOs, which only appear in the Explore list (9 DAOs in total).
- A workspace "Meridian Ecosystem" holding both DAOs. Workspaces live in the browser's localStorage, so the capture
  scripts seed it there.

## Determinism

Two captures of the same code give byte-identical files, for every reference: no screenshot needs a tolerance, so
`cmp` (or `git status` after `capture.sh --update`) is enough to tell whether the app changed. What makes that so:

- **Clock**: see above. Dates and relative labels ("3 days left") do not depend on when the capture runs.
- **Motion**: the browser asks for reduced motion, CSS animations and transitions are cut to zero length, and
  screenshots are taken with animations disabled, so spinners and the pulsing status dot hold their first frame. The
  same rule is adopted by every shadow root, which a document stylesheet does not reach: the wallet SDK's modal is
  made of web components that animate their own header and buttons. The text caret is not drawn.
- **Explore carousel**: the "Featured" row is moved by framer-motion on every animation frame, which CSS settings do
  not reach. `lib.cjs` pins its track with one CSS rule (`translateX(-160px)`), the frame the canvas reproduces.
- **Readiness**: a screenshot is taken only when React has hydrated the page, no request has been in flight for
  half a second, fonts and all images (lazy ones included) have loaded, no loading skeleton is left, and two
  consecutive frames are identical.
- **Raster**: Chromium runs with `--disable-partial-raster`. By default it re-rasters only the invalidated part of a
  tile, over the pixels already there, so an antialiased edge on a fractional position (the rounded wallet button in
  the top bar) came out a shade different after each repaint, and the file depended on how often the page had
  repainted.
- **Icons**: an inline SVG painted while a dialog was still scaling open (kit dialogs open from 88% with
  framer-motion) kept the antialiasing of that frame. Before each screenshot every SVG, in the document and in open
  shadow roots, is taken out of the layout and put back in the same task, so it is painted again at rest, and two
  animation frames pass before the first screenshot.
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

| Step | Time |
|---|---|
| `start.sh`, with the `.next/` cache of an earlier start | 20 s to 8 min |
| `capture.sh`, 121 screenshots, first run after a start or a later one | about 12 min |

Most of a run is waiting: every page opens in a fresh browser context, and each screenshot is taken at least twice,
until two frames match. A first start without the `.next/` cache compiles the app and takes much longer.
