import type { ComponentType } from 'react';
import type { Hex } from 'viem';
import type { IDaoPolicy, Network } from '@/shared/api/daoService';
import type { IDaoPlugin } from '@/shared/api/daoService/domain/daoPlugin';

// Id of the slot (e.g. GOVERNANCE_DAO_MEMBER_LIST)
export type SlotId = string;

// Id of the plugin (e.g. multisig)
export type PluginId = string;

// Plugin component registered for a specific SlotId
// biome-ignore lint/suspicious/noExplicitAny: any exception
export type PluginComponent<TComponentProps = any> =
    ComponentType<TComponentProps>;

// Record of slot components
export type SlotComponents = Record<
    SlotId,
    Record<PluginId, PluginComponent | undefined> | undefined
>;

// Plugin function registered for a specific SlotId
// biome-ignore lint/suspicious/noExplicitAny: any exception
export type PluginFunction<TParams = any, TResult = any> = (
    params: TParams,
) => TResult;

// Record of slot functions
export type SlotFunctions = Record<
    SlotId,
    Record<PluginId, PluginFunction | undefined> | undefined
>;

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

export interface IPluginRepositoryAddressResolverParams {
    /**
     * Id of the plugin.
     */
    pluginId: PluginId;
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * Plugin instance.
     */
    plugin: IDaoPlugin | IDaoPolicy;
}

export type PluginRepositoryAddressResolver = (
    params: IPluginRepositoryAddressResolverParams,
) => Hex | undefined;
