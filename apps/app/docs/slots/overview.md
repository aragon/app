# Slot Integration Guide

The Aragon App uses a **slot-based plugin architecture** to make its UI extensible. Modules define named extension
points (slots), plugins register components or functions to those slots, and the app renders the right implementation
based on which plugin a DAO uses.

This guide is for the Solutions Team and developers integrating with the slot system. For background on plugin
encapsulation and the registry, see [Plugin Encapsulation](../projectDocs/pluginEncapsulation.md).

## How It Works

```
Modules define slots          Plugins register to slots         App consumes slots
─────────────────────         ─────────────────────────         ──────────────────
GovernanceSlotId              tokenPlugin.index.ts              <PluginSingleComponent />
SettingsSlotId         →      multisigPlugin.index.ts     →    useSlotSingleFunction()
CreateDaoSlotId               lockToVotePlugin.index.ts        <PluginFilterComponent />
ApplicationSlotId             ...
```

1. **Slot IDs** are string enums defined per module in `src/modules/{module}/constants/moduleSlots.ts`
2. **Plugins** register components and functions to those slot IDs at startup via `pluginRegistryUtils`
3. **Consumers** (pages, components) look up the registered implementation by slot ID + plugin ID

## Quick Start

| I want to... | Go to |
|---|---|
| Use an existing slot in a page or component | [Consuming Slots](./consuming-slots.md) |
| Create a new slot or register a new plugin | [Creating Slots](./creating-slots.md) |
| See all governance slots | [Governance Slots Reference](./governance-slots.md) |
| See all settings slots | [Settings Slots Reference](./settings-slots.md) |
| See all create DAO slots | [Create DAO Slots Reference](./create-dao-slots.md) |
| See application & DAO-level slots | [Application Slots Reference](./application-slots.md) |

## Slot Inventory

| Module | Enum | Slots | Reference |
|---|---|---|---|
| Governance | `GovernanceSlotId` | 20 | [governance-slots.md](./governance-slots.md) |
| Settings | `SettingsSlotId` | 4 | [settings-slots.md](./settings-slots.md) |
| Create DAO | `CreateDaoSlotId` | 5 | [create-dao-slots.md](./create-dao-slots.md) |
| Application | `ApplicationSlotId` | 1 | [application-slots.md](./application-slots.md) |
| Dashboard (DAO-level) | `DashboardDaoSlotId` | 1 | [application-slots.md](./application-slots.md#dao-level-slots) |
| Capital Flow (DAO-level) | `CapitalFlowDaoSlotId` | 2 | [application-slots.md](./application-slots.md#dao-level-slots) |

**Total: 33 slots** across 6 enums. See [metrics](./_metrics.md) for the full coverage matrix.

## Registered Plugins

Each plugin is identified by a `PluginInterfaceType` value from
`src/shared/api/daoService/domain/enum/pluginInterfaceType.ts`.

| Plugin | ID (`PluginInterfaceType`) | Governance | Settings | Create DAO | Application |
|---|---|---|---|---|---|
| Token Voting | `tokenVoting` | 17 | 4 | 5 | - |
| Multisig | `multisig` | 14 | 3 | 5 | - |
| Lock To Vote | `lockToVote` | 16 | 4 | 5 | - |
| Admin | `admin` | 5 | 1 | - | - |
| Staged Proposal Processor | `spp` | 7 | 2 | - | - |
| Capital Distributor | `capitalDistributor` | - | - | - | 1 |
| Gauge Voter | `gauge` | - | - | - | 1 |

## Key Source Files

| File | Purpose |
|---|---|
| `src/shared/utils/pluginRegistryUtils/pluginRegistryUtils.ts` | Core registry singleton |
| `src/shared/utils/pluginRegistryUtils/pluginRegistryUtils.api.ts` | Registry type definitions |
| `src/shared/components/pluginSingleComponent/` | Renders a single slot component |
| `src/shared/components/pluginFilterComponent/` | Multi-plugin slot component with toggle UI |
| `src/shared/hooks/useSlotSingleFunction/` | Invokes a single slot function |
| `src/plugins/index.ts` | Plugin initialization entry point |
| `src/initPluginRegistry.ts` | Top-level registry init (plugins + policies + DAOs) |
