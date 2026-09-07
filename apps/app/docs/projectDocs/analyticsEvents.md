# Analytics events

The app uses [Plausible Analytics](https://plausible.io) through the shared `analyticsUtils` pipeline and the typed `plausibleAnalyticsUtils` product-event facade.

## Runtime pipeline

`apps/app/instrumentation-client.ts` calls `analyticsUtils.init()` once on the client. The utility dynamically imports `@plausible-analytics/tracker` because the package reads browser globals and must not load during server rendering.

The tracker is initialised only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is non-empty:

```ts
const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

if (!domain) {
    return;
}

initPlausibleTracker({ domain, endpoint: '/api/analytics' });
```

`apps/app/next.config.mjs` rewrites `/api/analytics` to `https://plausible.io/api/event`. This keeps browser requests on our own origin so filter lists that block direct requests to `plausible.io` are less likely to drop events.

The proxy is not an authentication boundary. Plausible event ingestion is a public analytics endpoint keyed by site domain and event URL; no API key is used in client analytics. Do not send secrets, PII, wallet addresses, transaction hashes, calldata, DAO IDs, proposal titles, or free-form user input as event props.

`@plausible-analytics/tracker` defaults `autoCapturePageviews` and `bindToWindow` to `true`, so enabling `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` also enables automatic pageview tracking and exposes `window.plausible` for Plausible's installation verifier. Custom APP-999 events are additional events on top of that pageview surface.

## Environment behavior

Tracking is controlled by committed env config plus deployment overrides:

| Environment config | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Behavior |
| --- | --- | --- |
| `config/.env.development` | `dev.app.aragon.org` | Development deploys emit to the dev Plausible site. |
| `config/.env.production` | `app.aragon.org` | Production emits to the production Plausible site. |
| `config/.env.preview` | unset | PR previews do not emit unless Vercel/1Password injects an override. |
| `config/.env.staging` | unset | Staging does not emit unless deployment secrets inject an override. |
| `.env.local` | IC-local | Never commit local analytics overrides. |

The wrapper treats `undefined` and `''` as disabled. This prevents an empty env var from reaching the tracker as a falsy domain.

## Local and preview verification

Preferred smoke-test target: an Aragon-owned deployment with a real Plausible site configured, currently `dev.app.aragon.org` for development.

Localhost is intentionally not a reliable Network-tab success path. The tracker defaults `captureOnLocalhost` to `false`, and the wrapper does not expose that option. If you run locally with `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` set, the expected local signal is the Plausible ignored-event log for localhost, not a successful `POST /api/analytics` request.

For PR previews, events emit only if the preview deployment receives `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` from deployment secrets or an explicit environment override. Otherwise the analytics utilities no-op.

## Event naming

APP-999 product events use snake_case identifiers, not Title Case dashboard labels.

Use grouped prefixes for lifecycle/funnel telemetry:

- `wizard_*`
- `transaction_*`
- `action_*`

Rationale:

- event names are stable code IDs;
- prefixes group related funnel events;
- TypeScript unions catch typos;
- dashboards can segment by event props such as `flow` and `transactionTypeEvent`;
- Title Case click-goal names are too easy to attach to the wrong lifecycle point.

Do not name a click after a later business outcome. For example, a submit-button click before wallet signing is not a DAO publish event. DAO creation success is represented by a transaction terminal event with DAO-specific props.

Plausible funnels are built from defined goals, not raw event rows. Event props can participate in a funnel only by creating property-filtered goals in Plausible (up to three property constraints per goal) and then using those goals as funnel steps. Keep top-level event names meaningful on their own; props are dimensions/constraints, not a replacement for registering goals.

## Event transport API

Application product code should use:

```ts
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';

plausibleAnalyticsUtils.track('wizard_submit', {
    flow: 'create_dao',
    network,
    hasEns: ens !== '',
    hasAvatar: avatar != null,
});
```

`plausibleAnalyticsUtils` is the app-owned taxonomy layer. It accepts `string | number | boolean | null | undefined` prop values, drops nullish entries, stringifies numbers and booleans, and delegates to `analyticsUtils.trackEvent` with Plausible-compatible string props.

Use `analyticsUtils.trackEvent` directly only for shared pipeline tests or future non-APP-999 events that intentionally bypass the typed catalog.

## Shared props

| Prop | Type before normalization | Meaning |
| --- | --- | --- |
| `flow` | string | Product flow that emitted the event. |
| `transactionTypeEvent` | string | Low-cardinality transaction purpose inside a product flow. This is the only transaction classification sent on analytics events. |
| `network` | string | DAO or transaction network. |
| `chainId` | number | Required EVM chain ID. |
| `pluginInterfaceType` | string | Governance plugin interface type when relevant. |

`transactionType` is a separate backend enum used by the pending-transaction manager for resume, duplicate detection, and indexing. It is intentionally not included in Plausible payloads; do not add it as a second analytics dimension.

Known `flow` values:

| Value | Meaning |
| --- | --- |
| `create_dao` | New DAO creation wizard and publish transaction. |
| `governance_designer` | Add/create governance process wizard. |
| `create_proposal` | Proposal creation wizard and publish transaction. |
| `direct_execute_actions` | Direct admin action execution flow. |
| `proposal_execution` | Execute existing proposal. |
| `proposal_vote` | Vote on existing proposal. |

Known `transactionTypeEvent` values:

| Value | Flow |
| --- | --- |
| `dao_create` | `create_dao` |
| `governance_proposal_create` | `create_proposal` |
| `admin_instant_execute` | `direct_execute_actions` |
| `governance_proposal_execute` | `proposal_execution` |
| `governance_proposal_vote` | `proposal_vote` |

## Event catalog

### `wizard_start`

Fires once when an analytics-enabled wizard mounts with an active step.

Required props:

| Prop | Notes |
| --- | --- |
| `flow` | Product flow. |

Optional props:

| Prop | Notes |
| --- | --- |
| `pluginInterfaceType` | Present on create-proposal wizards. |

### `wizard_step`

Fires when the active wizard step changes, including the initial active step with `direction: direct`. Duplicate same-step renders are suppressed.

Required props:

| Prop | Notes |
| --- | --- |
| `flow` | Product flow. |
| `stepKey` | Wizard step ID. |
| `stepIndex` | Zero-based step index. |
| `direction` | `direct`, `forward`, or `back`. |

Optional props:

| Prop | Notes |
| --- | --- |
| `pluginInterfaceType` | Present on create-proposal wizards. |

### `wizard_validation_blocked`

Fires when the user attempts to move forward or submit and validation blocks progress.

Required props:

| Prop | Notes |
| --- | --- |
| `flow` | Product flow. |
| `stepKey` | Active wizard step ID. |
| `stepIndex` | Zero-based active step index. |
| `attempt` | `next` or `submit`. |
| `errorCount` | Number of top-level validation error keys. |

Never send field names, invalid values, validation messages, proposal body text, addresses, ENS, or metadata.

### `wizard_submit`

Fires when a wizard reaches its final submit action and starts/opens the committed next step.

Flow-specific props:

| Flow | Additional props |
| --- | --- |
| `create_dao` | `network`, `hasEns`, `hasAvatar` |
| `governance_designer` | `setupMode`, conditional `stageCount` |
| `create_proposal` | `actionCount`, `hasActions`, `pluginInterfaceType` |
| `direct_execute_actions` | `actionCount` |

`create_dao` fires after the wallet guard succeeds and before opening the Publish DAO transaction dialog. DAO transaction submission/success is tracked by transaction events, not by this event.

### `action_added`

Fires when exactly one proposal/direct-execute action is added to the action form.

Required props:

| Prop | Notes |
| --- | --- |
| `source` | Currently `form`. |
| `actionCategory` | Low-cardinality action bucket. |
| `count` | Omitted for single-action adds. |

Known `actionCategory` values:

| Value | Rule |
| --- | --- |
| `native_withdraw` | Action type contains `withdraw`. |
| `native_metadata_update` | Action type contains `metadata`. |
| `external_contract_call` | Action type contains `external`. |
| `unknown_native` | Fallback for unrecognized single/native actions. |
| `mixed` | Batch-only category when added actions span categories. |

### `action_added_batch`

Fires when multiple proposal/direct-execute actions are added in one operation.

Required props:

| Prop | Notes |
| --- | --- |
| `source` | Currently `form`. |
| `actionCategory` | Shared category if all added actions match one; otherwise `mixed`. |
| `count` | Number of actions added. |

### `transaction_start`

Fires when a transaction send attempt starts.

Required props:

| Prop | Notes |
| --- | --- |
| `flow` | Product flow. |
| `transactionTypeEvent` | Low-cardinality transaction purpose. |
| `network` | Transaction network. |
| `chainId` | Required chain ID. |
| `attemptKind` | `new` or `resume`. |

Optional props:

| Prop | Notes |
| --- | --- |
| `actionCount` | Present for direct execute-actions. |

DAO publish/create attempt is `transaction_start` with `flow: 'create_dao'` and `transactionTypeEvent: 'dao_create'`.

### `transaction_stage`

Fires for intermediate transaction lifecycle milestones.

Required props:

| Prop | Notes |
| --- | --- |
| `flow` | Product flow. |
| `transactionTypeEvent` | Low-cardinality transaction purpose. |
| `network` | Transaction network. |
| `chainId` | Required chain ID. |
| `status` | Currently `submitted` or `confirmed`. |

### `transaction_end`

Fires when a transaction reaches a terminal success milestone.

Required props:

| Prop | Notes |
| --- | --- |
| `flow` | Product flow. |
| `transactionTypeEvent` | Low-cardinality transaction purpose. |
| `network` | Transaction network. |
| `chainId` | Required chain ID. |
| `status` | `confirmed` or `indexed`. |

DAO creation success is `transaction_end` with `flow: 'create_dao'`, `transactionTypeEvent: 'dao_create'`, and a success `status`.

### `transaction_failed`

Fires once per transaction dialog lifecycle when a transaction flow fails.

Required props:

| Prop | Notes |
| --- | --- |
| `flow` | Product flow. |
| `transactionTypeEvent` | Low-cardinality transaction purpose. |
| `network` | Transaction network. |
| `chainId` | Required chain ID. |
| `errorClass` | Error class name only, or `unknown`. |

Optional props:

| Prop | Notes |
| --- | --- |
| `step` | Step where failure happened, e.g. `PREPARE`, `APPROVE`, `CONFIRM`, `INDEXING`. |
| `status` | Present as `send_error` for direct execute-actions failures. |

Never send raw error messages, stacks, revert reasons, provider payloads, calldata, addresses, hashes, or proposal metadata.

## Where each event fires

Each event is fired by exactly one place in the app: a page, dialog, or hook. These are code paths, not the Plausible dashboard Goals covered in the next section. The wizard and transaction events are opt-in, so their component fires them only when it is given analytics metadata.

| Events | Fired by | Current application surfaces |
| --- | --- | --- |
| `wizard_start`, `wizard_step` | `WizardRoot` | `createDaoPageClient` (`create_dao`), `createProcessPageClient` (`governance_designer`), `createProposalPageClient` (`create_proposal`), and `createExecuteActionsPageClient` (`direct_execute_actions`) |
| `wizard_validation_blocked` | `WizardForm` | The same four analytics-enabled wizards |
| `wizard_submit` | Flow page client | `createDaoPageClient`, `createProcessPageClient`, `createProposalPageClient`, and `createExecuteActionsPageClient` |
| `transaction_start`, `transaction_stage`, `transaction_end`, `transaction_failed` | `TransactionDialog` | `publishDaoDialog`, `publishProposalDialog`, `executeDialog`, and `voteDialog`, when passed an `analytics` prop |
| `transaction_start`, `transaction_stage`, `transaction_failed` | `ExecuteActionsDialog` | Direct admin action execution (`direct_execute_actions`) |
| `action_added`, `action_added_batch` | `useProposalActionsField` | Proposal and direct-execute action forms |

## Plausible dashboard declarations

Plausible is a passive receiver. It has no registry of the app's event names; it only learns an event exists once the tracker sends it to `/api/event`. Both steps are required, in order: the app emits the event, and a matching Custom event Goal exists for the count to appear. A Goal with no matching event sits at zero forever, and an event with no Goal is received but never shown. Past events are not backfilled, so a Goal counts only from when you create it.

In the development site (`dev.app.aragon.org`) and production site (`app.aragon.org`), create one Custom event Goal for each exact event name the app emits:

- `wizard_start`
- `wizard_step`
- `wizard_submit`
- `wizard_validation_blocked`
- `action_added`
- `action_added_batch`
- `transaction_start`
- `transaction_stage`
- `transaction_end`
- `transaction_failed`

Create property-filtered Goals only when a funnel needs a specific segment, using `flow` and/or `transactionTypeEvent` (Plausible allows up to three property constraints per Goal). Do not register Goals for names the app does not emit, such as the backend `transactionType` or Title Case labels; a Goal for a non-emitted name is a permanent zero. When a new surface ships, add its name to `PlausibleAnalyticsEventName`, emit it from that UI, then register the Goal.

Renaming an emitted property key does not require rebuilding event Goals. The ten event names above are unchanged, so unfiltered Goals and their funnels keep working. Only update Goals, funnels, and saved filters that constrain on `transactionKind`: edit those in place to `transactionTypeEvent`. Historical events keep the old key, so segmented data splits at the rename boundary; do not dual-send both keys to paper over it.

## Adding a new event

1. Extend `PlausibleAnalyticsEventName` in `plausibleAnalyticsUtils.ts` when a new top-level event name is needed.
2. Emit from the lifecycle point that matches the event name. Do not emit a business-outcome event from an earlier click handler.
3. Keep props low-cardinality. Use booleans for presence/absence (`hasEns`, `hasAvatar`, `hasActions`) and buckets for broad categories.
4. Add tests at the owner component/hook boundary and at the utility boundary if the normalization contract changes.
5. Register the exact custom-event Goal in each Plausible site that should report it.

