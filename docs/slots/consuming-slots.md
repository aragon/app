# Consuming Existing Slots

This page covers how to use already-defined slots in your pages and components. If you need to create a new slot or
register a new plugin, see [Creating Slots](./creating-slots.md).

## PluginSingleComponent

The primary way to render a slot component. It looks up the registered component by slot ID and plugin ID, then renders
it with any additional props you pass through.

**Location:** `src/shared/components/pluginSingleComponent/pluginSingleComponent.tsx`

```typescript
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';

<PluginSingleComponent
    slotId={GovernanceSlotId.GOVERNANCE_VOTE_LIST}
    pluginId={proposal.pluginInterfaceType}
    proposal={proposal}
/>
```

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `slotId` | `SlotId` (string) | Yes | The slot to render |
| `pluginId` | `PluginId` (string) | Yes | The plugin to load the component from |
| `Fallback` | `React.FC` | No | Component rendered when no plugin is registered for this slot + plugin combination |
| `...otherProps` | `unknown` | No | Forwarded to the loaded component |

### Behavior

- If no component is registered and no `Fallback` is provided, renders `null`
- If no component is registered but a `Fallback` is provided, renders the `Fallback` with the forwarded props
- Supports a **debug highlight mode** that outlines slot boundaries and labels them with the slot ID and plugin ID

## useSlotSingleFunction

Invokes a single slot function registered by a plugin. Used for logic that varies per plugin: status calculations,
transaction data building, permission checks, etc.

**Location:** `src/shared/hooks/useSlotSingleFunction/useSlotSingleFunction.ts`

```typescript
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';

const status = useSlotSingleFunction<IStatusParams, ProposalStatus>({
    slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
    pluginId: proposal.pluginInterfaceType,
    params: { proposal, settings },
});
```

### Params

| Param | Type | Required | Description |
|---|---|---|---|
| `slotId` | `SlotId` | Yes | The slot to look up |
| `pluginId` | `PluginId` | Yes | The plugin to load the function from |
| `params` | `TParams` | Yes | Parameters passed to the slot function |
| `fallback` | `(params: TParams) => TResult` | No | Fallback function when no slot function is registered |

### Return Value

Returns the result of the slot function call, or `undefined` if no function is registered and no fallback is provided.

## PluginFilterComponent

When multiple plugins register for the same slot, this component renders a toggle group that lets users switch between
plugin views.

**Location:** `src/shared/components/pluginFilterComponent/pluginFilterComponent.tsx`

```typescript
import { PluginFilterComponent } from '@/shared/components/pluginFilterComponent';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';

<PluginFilterComponent
    slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST}
    plugins={pluginDefinitions}
    Fallback={DefaultMemberList}
/>
```

### Plugin Definitions

Each plugin in the `plugins` array requires:

```typescript
interface IFilterComponentPlugin<TMeta, TProps> {
    id: string;        // PluginInterfaceType value
    uniqueId: string;  // Unique identifier for the toggle
    label: string;     // Display label in the toggle group
    meta: TMeta;       // Metadata about the plugin
    props: TProps;     // Props forwarded to the slot component
}
```

### Behavior

- **No supported plugins and no Fallback:** renders `null`
- **Single supported plugin:** renders `PluginSingleComponent` directly (no toggle)
- **Multiple supported plugins:** renders a `ToggleGroup` with each plugin as a toggle, plus the active plugin's
  component below it
- Syncs the active selection to a URL search parameter (default: `plugin`) for shareable state

## DaoFilterComponent

A wrapper around `PluginFilterComponent` that maps DAO filter options into the plugin filter format. Used when filtering
by DAO instance rather than by plugin type.

**Location:** `src/shared/components/daoFilterComponent/daoFilterComponent.tsx`

## Direct Registry Access

For cases where the helper components and hooks don't fit, you can access the registry directly:

```typescript
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';

// Get a single slot component
const Component = pluginRegistryUtils.getSlotComponent({ slotId, pluginId });

// Get a single slot function
const fn = pluginRegistryUtils.getSlotFunction<TParams, TResult>({ slotId, pluginId });

// Get all slot functions registered for a slot (across all plugins)
const fns = pluginRegistryUtils.getSlotFunctions<TParams, TResult>(slotId);
```

## Dynamic Page Slots

Plugin pages use a dynamic slot ID constructed from `APPLICATION_PLUGIN_PAGE` and URL segments:

```typescript
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ApplicationSlotId } from '@/modules/application/constants/moduleSlots';

const slotId = pluginRegistryUtils.getPageSlotId(
    ApplicationSlotId.APPLICATION_PLUGIN_PAGE,
    ['rewards'],
);
// Result: "APPLICATION_PLUGIN_PAGE-rewards"
```

This allows plugins to register entire pages at custom URL paths. See
[Application Slots](./application-slots.md) for details.
