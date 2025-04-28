import type { ComponentType } from 'react';

// Id of the slot (e.g. GOVERNANCE_DAO_MEMBER_LIST)
export type SlotId = string;

// Id of the plugin (e.g. multisig)
export type PluginId = string;

// Plugin component registered for a specific SlotId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PluginComponent<TComponentProps = any> = ComponentType<TComponentProps>;

// Record of slot components
export type SlotComponents = Record<SlotId, Record<PluginId, PluginComponent | undefined> | undefined>;

// Plugin function registered for a specific SlotId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PluginFunction<TParams = any, TResult = any> = (params: TParams) => TResult;

// Record of slot functions
export type SlotFunctions = Record<SlotId, Record<PluginId, PluginFunction | undefined> | undefined>;

/**
 * Plugin definitions.
 */
export interface IPlugin {
    /**
     * Id of the plugin.
     */
    id: PluginId;
    /**
     * Name of the plugin.
     */
    name: string;
    /**
     * Install version of the plugin
     */
    installVersion: {
        /**
         * Release version of the plugin.
         */
        release: number;
        /**
         * Build version of the plugin.
         */
        build: number;
    };
}

/**
 * Registry of all the plugin specific components and metadata
 */
export interface IPluginRegistry {
    /**
     * Registered plugins.
     */
    plugins: IPlugin[];
    /**
     * Registered slot components.
     */
    slotComponents: SlotComponents;
    /**
     * Registered slot functions.
     */
    slotFunctions: SlotFunctions;
}
