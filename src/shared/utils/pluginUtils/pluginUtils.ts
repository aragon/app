import type { ComponentType } from 'react';

// Id of the slot.
export type SlotId = string;

// Id of the plugin.
export type PluginId = string;

// Component registered.
export type Component = ComponentType;

export interface IPlugin {
    /**
     * Id of the plugin.
     */
    id: PluginId;
    /**
     * Name of the plugin.
     */
    name: string;
}

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
    component: Component;
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

class PluginUtils {
    private slotComponents: Record<SlotId, Record<PluginId, Component>> = {};

    registerSlotComponent = (params: IRegisterSlotComponentParams) => {
        const { slotId, pluginId, component } = params;
        this.slotComponents = {
            ...this.slotComponents,
            [slotId]: {
                ...this.slotComponents[slotId],
                [pluginId]: component,
            },
        };
    };

    getSlotComponent = (params: IGetSlotComponentParams): Component | undefined => {
        const { slotId, pluginId } = params;
        const component = this.slotComponents[slotId]?.[pluginId];

        return component;
    };
}

export const pluginUtils = new PluginUtils();
