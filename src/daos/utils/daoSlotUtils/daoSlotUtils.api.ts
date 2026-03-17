import type {
    IDaoDomainDefinition,
    IDaoDomainSlotComponentDefinition,
    IDaoDomainSlotFunctionDefinition,
} from '@/daos/daoDomains';
import type { IPlugin } from '@/shared/utils/pluginRegistryUtils';

export interface IGenerateDomainParams<TConfig, TMeta extends object = object> {
    /**
     * Source configs for a DAO family.
     */
    configs: TConfig[];
    /**
     * Returns the plugin identity for a single config.
     */
    getPlugin: (config: TConfig) => IPlugin;
    /**
     * Returns metadata to attach to the generated domain.
     */
    getMeta?: (config: TConfig) => TMeta | undefined;
    /**
     * Returns slot components to register for the config.
     */
    getSlotComponents?: (
        config: TConfig,
    ) => IDaoDomainSlotComponentDefinition[] | undefined;
    /**
     * Returns slot functions to register for the config.
     */
    getSlotFunctions?: (
        config: TConfig,
    ) => IDaoDomainSlotFunctionDefinition[] | undefined;
}

export type GenerateDomain = <TConfig, TMeta extends object = object>(
    params: IGenerateDomainParams<TConfig, TMeta>,
) => IDaoDomainDefinition<TMeta>[];
