# Creating New Slots

This page covers how to add new extension points to the app and how to register a new plugin. If you only need to use
existing slots, see [Consuming Slots](./consuming-slots.md).

## Adding a New Slot ID

Slot IDs are defined as string enums in each module's `moduleSlots.ts` file.

**Convention:** Prefix the slot ID with the module name in uppercase (e.g., `GOVERNANCE_`, `SETTINGS_`).

```typescript
// src/modules/governance/constants/moduleSlots.ts
export enum GovernanceSlotId {
    // ... existing slots
    GOVERNANCE_MY_NEW_FEATURE = 'GOVERNANCE_MY_NEW_FEATURE',
}
```

After defining the slot, you need to:

1. **Consume it** in the module's pages/components using `PluginSingleComponent` or `useSlotSingleFunction`
2. **Register implementations** in each plugin that should support it

## Creating a New Plugin

Follow this folder structure:

```
src/plugins/myPlugin/
├── index.ts                    # Plugin initialization and slot registration
├── constants/
│   ├── myPlugin.ts             # Plugin metadata (IPluginInfo)
│   └── myPluginDialogsDefinitions.ts
├── components/                 # Slot components
│   └── myFeatureComponent/
│       ├── index.ts
│       ├── myFeatureComponent.tsx
│       └── myFeatureComponent.api.ts
├── hooks/                      # Slot functions (hooks)
├── utils/                      # Transaction, proposal, settings utils
├── dialogs/                    # Plugin dialogs (use dynamic imports)
└── testUtils/generators/       # Test data generators
```

### Step 1: Define plugin metadata

```typescript
// src/plugins/myPlugin/constants/myPlugin.ts
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const myPlugin: IPluginInfo = {
    id: PluginInterfaceType.MY_PLUGIN,  // Add to PluginInterfaceType enum first
    subdomain: 'my-plugin',
    name: 'My Plugin',
    installVersion: { release: 1, build: 1, releaseNotes: '', description: '' },
    repositoryAddresses: {
        [Network.ETHEREUM_MAINNET]: '0x...',
        // ... other networks
    },
};
```

### Step 2: Register the plugin and its slots

```typescript
// src/plugins/myPlugin/index.ts
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MyFeatureComponent } from './components/myFeatureComponent';
import { myPlugin } from './constants/myPlugin';
import { myProposalUtils } from './utils/myProposalUtils';

export const initialiseMyPlugin = () => {
    pluginRegistryUtils
        .registerPlugin(myPlugin)

        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: myPlugin.id,
            component: MyFeatureComponent,
        })

        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: myPlugin.id,
            function: myProposalUtils.getProposalStatus,
        });
};
```

The registry API is chainable — each method returns `this`.

### Step 3: Wire into the initialization

```typescript
// src/plugins/index.ts
import { initialiseMyPlugin } from './myPlugin';

export const initialisePlugins = () => {
    // ... existing plugins
    initialiseMyPlugin();
};
```

### Step 4: Register dialogs (if any)

```typescript
// src/plugins/index.ts
import { myPluginDialogsDefinitions } from './myPlugin/constants/myPluginDialogsDefinitions';

export const pluginDialogsDefinitions = {
    // ... existing dialogs
    ...myPluginDialogsDefinitions,
};
```

## Adding Plugin Pages

Plugins can register entire pages at custom URL paths using `APPLICATION_PLUGIN_PAGE` and `getPageSlotId`:

```typescript
import { ApplicationSlotId } from '@/modules/application/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MyCustomPage } from './pages/myCustomPage';
import { myPlugin } from './constants/myPlugin';

export enum MyPluginPages {
    DASHBOARD = 'dashboard',
}

pluginRegistryUtils.registerSlotComponent({
    slotId: pluginRegistryUtils.getPageSlotId(
        ApplicationSlotId.APPLICATION_PLUGIN_PAGE,
        [MyPluginPages.DASHBOARD],
    ),
    pluginId: myPlugin.id,
    component: MyCustomPage,
});
```

Plugins can also add navigation links using `pageLinksLeft` and `pageLinksRight` on the `IPluginInfo` definition.

## DAO-Specific Slot Overrides

For customizations scoped to a specific DAO (not all DAOs using a plugin), use DAO-level slots:

### Step 1: Define DAO-level slot IDs

```typescript
// src/modules/{module}/constants/moduleDaoSlots.ts
export enum MyModuleDaoSlotId {
    MY_MODULE_DAO_CUSTOM_HEADER = 'MY_MODULE_DAO_CUSTOM_HEADER',
}
```

### Step 2: Register from the DAO folder

```typescript
// src/daos/myDao/index.ts
import { MyModuleDaoSlotId } from '@/modules/myModule/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MyDaoCustomHeader } from './components/myDaoCustomHeader';
import { myDao } from './constants';

export const initialiseMyDao = () => {
    pluginRegistryUtils
        .registerPlugin(myDao)
        .registerSlotComponent({
            slotId: MyModuleDaoSlotId.MY_MODULE_DAO_CUSTOM_HEADER,
            pluginId: myDao.id,
            component: MyDaoCustomHeader,
        });
};
```

### Step 3: Add to DAO initialization

```typescript
// src/daos/index.ts
import { initialiseMyDao } from './myDao';

export const initialiseDaos = () => {
    // ... existing DAOs
    initialiseMyDao();
};
```

Existing DAO customization examples: `src/daos/cryptex/`, `src/daos/katana/`, `src/daos/boundless/`.

## Checklist

Before shipping a new slot or plugin:

- [ ] Slot ID added to the appropriate `moduleSlots.ts` enum with the module prefix
- [ ] Plugin metadata defined with `IPluginInfo` interface
- [ ] Plugin registered via `pluginRegistryUtils.registerPlugin()`
- [ ] All required slots registered (check what other plugins register for the same module)
- [ ] Plugin initialization called from `src/plugins/index.ts`
- [ ] Dialog definitions exported from `src/plugins/index.ts` (if applicable)
- [ ] Slot consumed in the module's pages/components
- [ ] Tests written for slot components and functions
