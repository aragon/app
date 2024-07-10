# Plugin Encapsulation

In order to keep logic of Plugins isolated, every service, component, utility and type related to a specific Plugin is
implemented under the `/plugins` folder. This allows us to easily add, change and remove supported Plugins.

The Plugin Encapsulation logic is currently implemented through the `pluginRegistryUtils` utility file and
`PluginComponent` React component, both implemented under the `/shared` folder.

## Glossary

-   **Plugin**: Defines the governance, asset management and / or membership of a DAO. A DAO can have one or more
    plugins installed depending on their governance needs. (More info about the plugins implementation at smart-contract
    level [here](https://devs.aragon.org/osx/how-it-works/core/plugins/))

-   **Plugin Registry**: A registry that collects the informations about the Plugins and how to display plugin-specific
    data on the UI.

-   **Slot**: It is identified by an ID (e.g. `GOVERNANCE_DAO_MEMBER_LIST`) and defines a section of the Application
    that changes depending on the DAO Plugin.

-   **Slot Component**: A plugin-specific React component used by the Application to render any kind of data on a
    specific Slot.

## Implementation Details

### Plugin

A Plugin is identified by an ID and registered at startup through the `registerPlugin` function of the
`pluginRegistryUtils`. The Plugin Registry then uses the Plugin information to check if a specific Plugin of a DAO is
supported by the Application.

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

The Plugin Registry is a simple record containing informations about the available plugins and their Slot Components.
The Plugin Registry is currently implemented as a JavaScript class by the `pluginRegistryUtils` file and populated on
the client side at startup by the `<Providers />` component of the Application module. The `<Providers />` component
imports and triggers the `initialisePlugins` function which initilises all the supported plugins by registering the
Plugin informations and their Slot Components.

### Slot

A Slot is identified by an ID, every Plugin can register their own Slots to customise how the Application display or act
depending on the Plugin of the DAO. We can have different types of Slots depending on the customisation needs of the
Application. For instance, we can introduce a `SlotFunction` type that is used by the Application to prefetech data on
the server side or a `SlotMetadata` that only sets some strings needed by the Application to render some Plugin
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

A Slot Component is a type of Slot that specify a Component to be rendered on the Application. Slot Components are
implemented under the related Plugin folder and registered on the Plugin Registry through the `registerSlotComponent`
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

TODO
