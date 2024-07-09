# Plugin Encapsulation

In order to keep logic of Plugins isolated, every service, component, utility and type related to a specific Plugin is
implemented under the `/plugins` folder. This allows us to easily add, change and remove supported Plugins.

The Plugin Encapsulation logic is currently implemented through the `pluginRegistryUtils` utility file and
`PluginComponent` React component, both implemented under the `/shared` folder.

## Glossary

-   **Plugin**: Defines the governance, asset management and / or membership of a DAO. A DAO can have one or more
    plugins installed depending on their governance needs. (More info about the plugins implementation at smart-contract
    level [here](https://devs.aragon.org/osx/how-it-works/core/plugins/))

-   **Slot**: It is identified by an ID (e.g. `GOVERNANCE_DAO_MEMBER_LIST`) and defines a portion of the application
    that changes depending on the DAO Plugin.

-   **Plugin Registry**: A registry that collects the informations about the Plugins and how to display plugin-specific
    data on the UI.

-   **Slot Component**: A plugin-specific React component used by the application to render any kind of data on a
    specific Slot.

## Implementation Details

### Plugin

TODO

### Slot

TODO

### Plugin Registry

The Plugin Registry is a simple record containing informations about the available plugins and their Slot Components.
The Plugin Registry is currently populated on the client side at startup by the `<Providers />` component of the
Application module. The component imports and triggers the `initialisePlugins` function which initilises all the
supported plugins by registering the Plugin informations and their Slot Components.

### Slot Components

TODO

## How to Implement a New Plugin

TODO
