# ADR 0001 — Permissions page condition-slot architecture (APP-954)

- **Status:** Accepted
- **Date:** 2026-06-30
- **Ticket:** APP-954 (Build UI for permission page), child of APP-321
- **Scope boundary:** APP-954 is the UI, preview-mocked ahead of the backend ticket APP-953.

## Context

The DAO Settings → Permissions subpage lists each permission as a row (WHO / WHERE / PERMISSION / CONDITION). The CONDITION column must render a per-condition UI that varies by condition type (e.g. a voting-power condition vs an execute-selector condition vs no condition at all). We need an extensible way to route a permission's condition to the right UI component without coupling the permissions page to specific condition contract addresses, and without prematurely building generic on-chain condition resolution that is the backend ticket's job (APP-953).

A permission is `IDaoPermission = { permissionId, whoAddress, whereAddress, conditionAddress }`. `conditionAddress === ALLOW_FLAG` is the sentinel meaning "no condition" (the granted address may call unconditionally).

## Decision

### Decision 1 — Condition components register through a STANDALONE registry, not plugin index files

Condition components are registered from a dedicated initialiser at `src/modules/settings/initConditionRegistry.ts`, which calls `pluginRegistryUtils.registerSlotComponent` for each `(SettingsSlotId.PERMISSION_CONDITION, conditionType)` pair and is invoked from the registry init path (`initPluginRegistry.ts` or equivalent) alongside the plugin initialisers.

**`src/plugins/tokenPlugin/index.ts` and `src/plugins/sppPlugin/index.ts` MUST NOT be edited for condition registration.** A reviewer finding such edits should block the PR.

**Rationale:** conditions are on-chain *contracts*, not plugin features. Routing condition UI through a plugin's index file conflates plugin ownership with condition ownership and rests on an unverified guess about which plugin "owns" a given condition type. A standalone registry keeps that ownership boundary clean.

### Decision 2 — No address→conditionType routing table in APP-954

APP-954 trusts `conditionType` as supplied directly on the condition payload (`IConditionData.conditionType`) and read straight off `IPermissionRow`. There is **no** hardcoded map of known condition contract addresses → condition types.

Condition-type resolution has exactly two rules:

1. `conditionAddress === ALLOW_FLAG` → `conditionType = 'none'`
2. absent or unrecognised `conditionType` → `conditionType = 'unknown'`

**Generic address→type resolution is explicitly APP-953's responsibility** and must not be pre-implemented here. Hardcoding condition addresses is fragile and is exactly the "support conditions generically" work the backend ticket owns.

### Preserved decisions

- **`IConditionData` shape:** `{ conditionType: string; [key: string]: unknown }`.
- **`conditionType` is the synthetic `pluginId`** passed to `PluginSingleComponent` (slotId `SettingsSlotId.PERMISSION_CONDITION`) for routing — it is not a real plugin id.
- **`IPermissionRow = IDaoPermission & { condition?: IConditionData }`** is a UI-only type (it does not change the domain `IDaoPermission`).
- **Fallback = a 'No condition' card.** `PluginSingleComponent` renders this Fallback when `conditionType` is `'none'`, or `'unknown'`, or when no component is registered for the conditionType.
- **Graph view is OUT OF SCOPE** for APP-954 (list view only; the Graph toggle is visible but disabled).
- **`permissionsDefinitionList` must NOT be reused.** It is a different concept (a proposal-creation permission guard); reusing it is a name-collision trap.

## Consequences

- Adding a new condition UI later = add a component + one `registerSlotComponent` line in `initConditionRegistry.ts`; no plugin edits, no page edits.
- The permissions page is decoupled from condition contract addresses; APP-953 can layer generic resolution by supplying `conditionType` on the payload (and/or registering more components) without touching the page.
- Until APP-953 lands, condition data is mock-supplied via the `useMocks` fetch-interceptor seam; if a condition's payload fields are unavailable (see the T02 spike), its component ships as a stub rendering the `conditionType` label + a "data pending" notice.
- Unknown/unregistered condition types degrade gracefully to the 'No condition' Fallback rather than erroring.

## Downstream tracks gated by this ADR

- **T04** — `SettingsSlotId.PERMISSION_CONDITION` + the 'No condition' Fallback component.
- **T07** — `initConditionRegistry.ts` + condition components (no plugin-index edits).
- **T08** — `IPermissionRow` / `IConditionData` types + `resolveConditionType` (the two rules above).
