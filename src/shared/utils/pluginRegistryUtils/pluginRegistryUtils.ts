import type {
    IPlugin,
    IPluginRegistry,
    PluginComponent,
    PluginFunction,
    PluginId,
    SlotId,
} from './pluginRegistryUtils.api';

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

export interface IRegisterSlotFunctionParams {
    /**
     * Id of the slot.
     */
    slotId: SlotId;
    /**
     * Id of the plugin.
     */
    pluginId: PluginId;
    /**
     * Function to register.
     */
    function: PluginFunction;
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

export interface IGetSlotFunctionParams {
    /**
     * Id of the slot.
     */
    slotId: SlotId;
    /**
     * Id of the plugin.
     */
    pluginId: PluginId;
}

export interface IGetSupportedSlotFunctionParams {
    /**
     * Id of the slot.
     */
    slotId: SlotId;
    /**
     * List of plugin Ids to get the slot function from.
     */
    pluginIds: PluginId[];
}

export class PluginRegistryUtils {
    private pluginRegistry: IPluginRegistry = {
        plugins: [],
        slotComponents: {},
        slotFunctions: {},
    };
    registerPlugin = (plugin: IPlugin): this => {
        this.pluginRegistry.plugins.push(plugin);

        return this;
    };

    getPlugin = (pluginId: PluginId): IPlugin | undefined =>
        this.pluginRegistry.plugins.find((plugin) => plugin.id === pluginId);

    registerSlotFunction = (params: IRegisterSlotFunctionParams): this => {
        const { slotId, pluginId, function: func } = params;
        this.pluginRegistry = {
            ...this.pluginRegistry,
            slotFunctions: {
                ...this.pluginRegistry.slotFunctions,
                [slotId]: {
                    ...this.pluginRegistry.slotFunctions[slotId],
                    [pluginId]: func,
                },
            },
        };

        return this;
    };

    getSlotFunctions = <TParams = unknown, TResult = unknown>(
        slotId: SlotId,
    ): Array<PluginFunction<TParams, TResult>> => {
        const functions = this.pluginRegistry.slotFunctions[slotId] ?? {};

        return Object.values(functions) as Array<PluginFunction<TParams, TResult>>;
    };

    getSlotFunction = <TParams = unknown, TResult = unknown>(
        params: IGetSlotFunctionParams,
    ): PluginFunction<TParams, TResult> | undefined => {
        const { slotId, pluginId } = params;
        const func = this.pluginRegistry.slotFunctions[slotId]?.[pluginId];

        return func;
    };

    registerSlotComponent = (params: IRegisterSlotComponentParams): this => {
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

    listContainsRegisteredPlugins = (pluginIds: string[] = []) => {
        const registeredPluginIds = this.pluginRegistry.plugins.map((plugin) => plugin.id);

        return pluginIds.some((pluginId) => registeredPluginIds.includes(pluginId));
    };
}

export const pluginRegistryUtils = new PluginRegistryUtils();
