# E2E Tests

Playwright + TypeScript + Chromium. Smoke tests that verify the app is alive, pages render, and key flows work against real production DAOs. Build verification (BV) tests run with Synpress/MetaMask to validate on-chain governance flows.

## Quick start

```bash
pnpm e2e:install                                        # 1. install Chromium (one-time, ~250 MB)
E2E_BASE_URL=https://dev.app.aragon.org pnpm e2e:ui     # 2. open Playwright UI
```

This opens a visual test runner where you can pick tests, run them, see screenshots and traces in real time, and re-run on file changes. This is the primary way to write and debug tests locally.

Workflow:

1. **Write** a test in `e2e/tests/` (or scaffold one with `pnpm e2e:codegen`)
2. **Run** it in UI mode — you'll see the browser, step-by-step trace, and assertions live
3. **Iterate** — the UI auto-reloads when you save a file
4. **Commit** when the test passes

## Setup

```bash
pnpm e2e:install    # download Chromium (one-time, ~250 MB)
```

## Run

```bash
# all e2e tests against dev
E2E_BASE_URL=https://dev.app.aragon.org pnpm e2e

# smoke suite only
E2E_BASE_URL=https://dev.app.aragon.org pnpm e2e:smoke

# interactive UI mode (time-travel debugging, watch mode)
E2E_BASE_URL=https://dev.app.aragon.org pnpm e2e:ui

# against local dev server
pnpm dev &
pnpm e2e          # defaults to http://localhost:3000
```

## Build verification (BV)

BV tests use [Synpress](https://synpress.io/) to drive MetaMask inside Playwright. They validate an end-to-end governance flow (deposit → propose → approve → execute → verify).

### Prerequisites

```bash
# 1. Copy e2e/.env.example → e2e/.env and fill in wallet credentials
#    (from 1Password: kv_app_infra → E2E_FE_MM_WALLET)

# 2. Build the MetaMask wallet cache (one-time, or after wallet.setup.ts changes)
pnpm e2e:bv:wallet-cache
```

### Run locally

```bash
# Against staging
pnpm e2e:bv:stg

# Against a custom URL
E2E_BASE_URL=https://dev.app.aragon.org pnpm e2e:bv

# Debug: open browser with cached MetaMask profile
node e2e/scripts/openCachedBrowser.mjs
```

### CI

BV tests run automatically on **staging deploys** via `shared-bv.yml`. They:

1. Restore cached Synpress wallet (or build from scratch)
2. Patch MetaMask manifest (disable Side Panel for Playwright compatibility)
3. Warmup the deployment URL
4. Run BV tests under `xvfb-run` (headless Chrome with virtual display)
5. Upload HTML report + video/traces on failure

Results are reported in Slack alongside smoke results.

## Write tests

### Codegen — record actions in a browser

```bash
E2E_BASE_URL=https://dev.app.aragon.org pnpm e2e:codegen
```

Opens a browser where you perform actions manually. Playwright records every click and navigation and generates test code you can copy into a spec file. Useful for scaffolding a new test quickly — you'll usually clean up the generated code afterwards.

### Structure

```
e2e/
├── playwright.config.ts       # smoke config (baseURL, retries, reporters)
├── playwright.bv.config.ts    # BV config (serial, single worker, longer timeouts)
├── setup/                     # Synpress fixtures (wallet.setup + test/expect)
├── scripts/                   # wallet cache tooling
├── tests/
│   ├── smoke/                 # smoke test specs (read-only, no wallet)
│   │   ├── explore/
│   │   ├── walletConnect/
│   │   └── daoPage/
│   └── bv/                    # build verification specs (MetaMask, on-chain)
│       └── treasuryWithdrawal.spec.ts
├── helpers/
│   ├── bv/                    # BV-specific flow orchestrators
│   ├── pages/                 # page objects (one class per page)
│   ├── shared/                # base BasePage & DaoPage classes
│   ├── constants/             # curated DAO list, BV DAOs, timeout constants
│   ├── types/                 # shared interfaces
│   └── utils/                 # MetaMask interaction utilities
└── README.md
```

### DAO list

Tests run against real production DAOs selected by plugin category:

| DAO | Network | Features |
|-----|---------|----------|
| Cryptex | ethereum-mainnet | spp, tokenvoting |
| Aragon Automated Capital Flow | ethereum-sepolia | linkedaccounts |
| Swiss Shield DAO | ethereum-mainnet | multisig |
| Katana vKAT Management | katana-mainnet | gauges, multisig, rewards |

Base tests (dashboard, proposals, members, assets, transactions, settings, member detail, proposal detail) run for **all** DAOs. Category-specific tests (gauges, rewards) run only for DAOs with the matching feature tag.

### Conventions

- **Page Object Model** — one class per page/component in `helpers/pages/`, extend `BasePage` or `DaoPage`
- **User-facing locators** — prefer `getByRole`, `getByText`, `getByLabel` over CSS selectors
- **Web-first assertions** — use `await expect(locator).toBeVisible()` instead of manual waits
- **Soft assertions** — use `expect.soft()` for multi-block checks so all assertions run even if one fails
- **No hardcoded waits in smoke tests** — no `page.waitForTimeout()`; BV tests interacting with browser extensions may use minimal waits where no event-based alternative exists (always with a comment explaining why)
- **`data-testid`** — only when role/text locators are unstable
- **One test per page per DAO** — each test navigates once and checks everything with `expect.soft()`
- **Simple structure** — `for (dao) { test() }`, no abstractions or metaprogramming

### Example

```typescript
import { expect, test } from '@playwright/test';
import { ExplorePage } from '@e2e/helpers';

test('explore page renders DAO list', async ({ page }) => {
    const explore = await new ExplorePage(page).navigate();
    await expect(explore.heroHeading()).toBeVisible();
    await expect(explore.daoCards().first()).toBeVisible();
});
```

## CI

### Smoke tests

Runs automatically on every PR via `shared-e2e.yml`:

1. Vercel deploys → `E2E_BASE_URL`
2. Warmup request ensures the deployment is alive
3. Smoke tests run against the URL
4. HTML report (14 days) + traces on failure (7 days) uploaded as GitHub artifacts
5. Results posted as a PR comment (for preview)

E2E results are **non-blocking** for PR merge — failures are reported in comments and Slack but do not prevent merging.

### Build verification

Runs on staging deploys via `shared-bv.yml` (see [BV section](#build-verification-bv) above).

Runners are ephemeral (`ubuntu-latest`) — no state leaks between runs. Artifacts are stored in GitHub Actions storage and auto-deleted after the retention period.
