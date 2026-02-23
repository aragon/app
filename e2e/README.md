# E2E Tests

Playwright + TypeScript + Chromium. Smoke tests that verify the app is alive, pages render, and key flows work.

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

## Write tests

### Codegen — record actions in a browser

```bash
E2E_BASE_URL=https://dev.app.aragon.org pnpm e2e:codegen
```

Opens a browser where you perform actions manually. Playwright records every click and navigation and generates test code you can copy into a spec file. Useful for scaffolding a new test quickly — you'll usually clean up the generated code afterwards.

### Structure

```
e2e/
├── playwright.config.ts       # config (baseURL, retries, reporters)
├── tests/smoke/               # smoke test specs
│   ├── explore/               # explore page
│   ├── daoPage/               # dashboard & tabs
│   ├── memberProfile/         # member details
│   └── walletConnect/         # connect dialog
├── helpers/
│   ├── pages/                 # page objects (ExplorePage, DaoDashboardPage, …)
│   ├── shared/                # base Page & DaoPage classes
│   ├── constants/             # curated DAO list for tests
│   └── types/                 # shared interfaces
└── README.md
```

### Conventions

- **Page Object Model** — one class per page/component in `helpers/pages/`, extend `Page` or `DaoPage`
- **User-facing locators** — prefer `getByRole`, `getByText`, `getByLabel` over CSS selectors
- **Web-first assertions** — use `await expect(locator).toBeVisible()` instead of manual waits
- **`data-testid`** — only when role/text locators are unstable
- **No hardcoded waits** — no `page.waitForTimeout()`

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

Runs automatically on every PR via `shared-e2e.yml`:

1. Vercel deploys → `E2E_BASE_URL`
2. Smoke tests run against the URL
3. HTML report (14 days) + traces on failure (7 days) uploaded as GitHub artifacts
4. Results posted as a PR comment (for preview)

Runners are ephemeral (`ubuntu-latest`) — no state leaks between runs. Artifacts are stored in GitHub Actions storage and auto-deleted after the retention period.
