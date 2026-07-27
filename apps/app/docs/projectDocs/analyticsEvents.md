# Analytics Events

The app tracks product events with [Plausible Analytics](https://plausible.io) (Business plan) through
[`analyticsUtils`](https://github.com/aragon/app/blob/main/apps/app/src/shared/utils/analyticsUtils/analyticsUtils.ts).
Events are sent via the official
[`@plausible-analytics/tracker`](https://www.npmjs.com/package/@plausible-analytics/tracker) npm package (no
third-party script tag is loaded) and proxied through our own `/api/analytics` route (see `next.config.mjs`
`rewrites()`) so ad blockers that filter requests to `plausible.io` don't drop the events.

Tracking only runs where `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set for the environment (currently `development` and
`production` — see `config/.env.*`). Everywhere else `trackEvent` silently no-ops, so it's always safe to call.

The wrapper itself:

```ts
// apps/app/src/shared/utils/analyticsUtils/analyticsUtils.ts

export type AnalyticsEventProps = Record<string, string>;

type PlausibleTrack = typeof import('@plausible-analytics/tracker')['track'];

class AnalyticsUtils {
    // The package reads `location.href` at module top-level, which crashes during
    // Next.js server rendering — imported dynamically so it only ever loads client-side.
    private track: PlausibleTrack | null = null;

    /**
     * Bootstraps the Plausible tracker. Called once, client-side only, from
     * `instrumentation-client.ts`. No-ops when no site domain is configured
     * for the current environment (see `config/.env.*`).
     */
    init = async () => {
        const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

        if (domain == null) {
            return;
        }

        const { init: initPlausibleTracker, track } = await import(
            '@plausible-analytics/tracker'
        );

        // Proxied through our own domain (see `next.config.mjs`) so ad blockers that
        // filter requests to plausible.io don't drop the events.
        initPlausibleTracker({ domain, endpoint: '/api/analytics' });
        this.track = track;
    };

    trackEvent = (event: string, props?: AnalyticsEventProps) => {
        this.track?.(event, { props });
    };
}

export const analyticsUtils = new AnalyticsUtils();
```

## Adding a new event

1. **Pick an event name.** Use Title Case with spaces (matches Plausible's own convention, e.g. `Signup`,
   `Download`), and keep the name specific to the action, e.g. `Publish DAO Click`. This exact string is what you'll
   later register as a Goal in Plausible, so decide on it before shipping.

2. **Call `analyticsUtils.trackEvent` at the interaction point.** Import it from `@/shared/utils/analyticsUtils` and
   call it directly in the click handler (or wherever the action happens) — no wiring, no registration step in code.

    Simple event, no props —
    [`exploreDaosPageClient.tsx`](https://github.com/aragon/app/blob/main/apps/app/src/modules/explore/pages/exploreDaosPage/exploreDaosPageClient.tsx#L132-L139):

    ```tsx
    primaryAction={{
        label: t('app.explore.exploreDaosPage.noCodeSetup.actionLabel'),
        onClick: () => {
            analyticsUtils.trackEvent('Create DAO Click');
            open(CreateDaoDialogId.CREATE_DAO_DETAILS);
        },
    }}
    ```

    Event with a custom prop —
    [`createDaoPageClient.tsx`](https://github.com/aragon/app/blob/main/apps/app/src/modules/createDao/pages/createDaoPage/createDaoPageClient.tsx#L29-L38):

    ```tsx
    const handleFormSubmit = (values: ICreateDaoFormData) => {
        analyticsUtils.trackEvent('Publish DAO Click', {
            network: values.network,
        });

        const params: IPublishDaoDialogParams = { values };
        checkWalletConnection({
            onSuccess: () => open(CreateDaoDialogId.PUBLISH_DAO, { params }),
        });
    };
    ```

3. **Add custom properties if useful (Business plan).** `trackEvent`'s second argument is
   `Record<string, string>` — pass whatever context helps you segment the event later, as in the
   `network` prop above.

    Plausible's limits apply:
    - Up to 30 properties per event.
    - Property name ≤ 300 characters, value ≤ 2000 characters.
    - Values must be strings (the type enforces this) — stringify anything else yourself.
    - **Never send PII** (names, emails, addresses, wallet-owner identity, etc.) as a prop value.

4. **Register a Goal in Plausible** for every site you want the event to show up as a tracked conversion in
   (Site Settings → Goals → Add goal → Custom event). The name must match the event string **exactly**,
   character-for-character. Do this for each environment's site that's relevant:
   - `dev.app.aragon.org` — verify the event works here first.
   - `app.aragon.org` — production.

   Without a Goal the event still gets recorded, it just won't appear as a highlighted conversion — only in the raw
   custom-events list.

5. **Verify it fires before shipping.** Two things can make an event silently not show up in the Network tab, and
   neither is a bug:
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` isn't set for the environment you're testing in (e.g. plain `local`/`preview`
     don't track by design — see `config/.env.*`).
   - The Plausible tracker itself skips sending events on `localhost` and in automation-controlled browsers
     (`navigator.webdriver`) unless explicitly overridden. To smoke-test locally: temporarily add
     `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=<anything>` to your local `.env.local` (never commit this), trigger the action,
     and check the Network tab for a `POST /api/analytics` request with the right `n` (event name) and `p` (props)
     fields in the body.

## Notes

- No CSP changes are ever needed for this — analytics calls go to our own `/api/analytics` path, never directly to
  `plausible.io` from the browser. `connect-src` in
  [`proxyUtils.ts`](https://github.com/aragon/app/blob/main/apps/app/src/modules/application/utils/proxyUtils/proxyUtils.ts#L60)
  is a wildcard anyway:

    ```ts
    'connect-src *',
    ```

- To track a new environment (e.g. `staging`), add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to that environment's
  `config/.env.*` file and register a matching site + Goals in Plausible. No code changes required.
