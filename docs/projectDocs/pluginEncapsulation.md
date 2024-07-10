# Plugin Encapsulation

In order to keep logic of Plugins isolated, every service, component, utility and type related to a specific Plugin is
implemented under the `/plugins` folder. This allows us to easily add, change and remove supported Plugins.

The Plugin Encapsulation logic is currently implemented through the `pluginRegistryUtils` utility file and
`PluginComponent` React component, both located under the `/shared` folder.

## Glossary

-   **Plugin**: Defines the governance, asset management and/or membership of a DAO. A DAO can have one or more plugins
    installed depending on their governance needs. More info about the plugins' implementation at smart-contract level
    can be found [here](https://devs.aragon.org/osx/how-it-works/core/plugins/).

-   **Plugin Registry**: A registry that collects the information about the Plugins and how to display plugin-specific
    data on the UI.

-   **Slot**: Identified by an ID (e.g. `GOVERNANCE_DAO_MEMBER_LIST`), it defines a section of the Application that
    changes depending on the DAO Plugin.

-   **Slot Component**: A plugin-specific React component used by the Application to render any kind of data on a
    specific Slot.

## Implementation Details

### Plugin

A Plugin is identified by an ID and registered at startup through the `registerPlugin` function of the
`pluginRegistryUtils` utility. The Plugin Registry then uses the Plugin information to check if a specific Plugin of a
DAO is supported by the Application.

Example of Plugin definition:

```typescript
export const plugin: IPlugin = {
    id: 'multisig',
    name: 'Multisig',
};
```

Example of Plugin registration:

```typescript
import { plugin } from './constants/plugin';

export const initialiseMultisigPlugin = () => {
    pluginRegistryUtils.registerPlugin(plugin);
};
```

### Plugin Registry

The Plugin Registry is a record containing information about the available Plugins and their Slot Components. It is
implemented as a JavaScript class in the `pluginRegistryUtils` file and populated on the client side at startup by the
`<Providers />` component of the Application module. The `<Providers />` component imports and triggers the
`initialisePlugins` function which initilises all the supported plugins by registering the Plugin informations and their
Slot Components.

### Slot

A Slot is identified by an ID. Every Plugin can register its own Slots to customise how the Application display or act
depending on the Plugin of the DAO. Different types of Slots can be supported depending on the customisation needs of
the Application. For instance, a `SlotFunction` type can be used by the Application to prefetech data on the server
side, or a `SlotMetadata` can be used to only sets some strings needed by the Application to render some Plugin
information.

The Slot id is prefixed by the module name to easily identify the scope of the Slot.

Example of Slot definition:

```typescript
export enum GovernanceSlotId {
    GOVERNANCE_DAO_MEMBER_LIST = 'GOVERNANCE_DAO_MEMBER_LIST',
    GOVERNANCE_MEMBERS_PAGE_DETAILS = 'GOVERNANCE_MEMBERS_PAGE_DETAILS',
}
```

### Slot Components

A Slot Component is a type of Slot that specifies a Component to be rendered in the Application. Slot Components are
implemented under the related Plugin folder and registered in the Plugin Registry through the `registerSlotComponent`
function.

Example of Slot Component registration:

```typescript
export const initialiseMultisigPlugin = () => {
    pluginRegistryUtils.registerSlotComponent({
        slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
        pluginId: plugin.id,
        component: MultisigMemberList,
    });
};
```

## How to Support a New Plugin

To support a new Plugin in the Application, add the Plugin definitions and implement all the required Slot Components
under a new folder inside the `/src/plugins` folder (e.g. `/src/plugins/gaslessPlugin`). Inside this folder, create an
index file that exports a function to initialise the Plugin by registering the Plugin definitions and its slot
components, e.g.:

```typescript
export const initialiseGaslessPlugin = () => {
    pluginRegistryUtils
        .registerPlugin(plugin)
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
            pluginId: plugin.id,
            component: GaslessMemberList,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBERS_PAGE_DETAILS,
            pluginId: plugin.id,
            component: GaslessMembersPageDetails,
        });
};
```

Make sure to update the `initialisePlugins` function on the `/plugins/index.ts` file to initialise the new plugin as
well.

All the available Slot Components are defined under a `/constants/moduleSlots.ts` file inside each module.
