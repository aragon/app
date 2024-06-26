import type { IPluginRegistry, PluginComponent, PluginId, SlotId } from './pluginRegistryUtils.api';

export interface IRegisterSlotComponentParams {
    /**
     * Id of the slot.
     */
    slotId: SlotId;
    /**
     * Id of the plugin.
     */
    pluginId: PluginId;
    /**
     * Component to register.
     */
    component: PluginComponent;
}

export interface IGetSlotComponentParams {
    /**
     * Id of the slot.
     */
    slotId: SlotId;
    /**
     * Id of the plugin.
     */
    pluginId: PluginId;
}

export class PluginRegistryUtils {
    private pluginRegistry: IPluginRegistry = {
        slotComponents: {},
    };

    registerSlotComponent = (params: IRegisterSlotComponentParams): PluginRegistryUtils => {
        const { slotId, pluginId, component } = params;
        this.pluginRegistry = {
            ...this.pluginRegistry,
            slotComponents: {
                ...this.pluginRegistry.slotComponents,
                [slotId]: {
                    ...this.pluginRegistry.slotComponents[slotId],
                    [pluginId]: component,
                },
            },
        };

        return this;
    };

    getSlotComponent = (params: IGetSlotComponentParams): PluginComponent | undefined => {
        const { slotId, pluginId } = params;
        const component = this.pluginRegistry.slotComponents[slotId]?.[pluginId];

        return component;
    };
}

export const pluginRegistryUtils = new PluginRegistryUtils();
