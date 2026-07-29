import type { Address } from 'viem';
import type { IPluginSettings } from '@/shared/api/daoService';

export interface IChainConfig {
    chainId: number;
    localAdapter: Address;
    remoteAdapter: Address;
}

export interface ICrossChainControllerPluginSettings extends IPluginSettings {
    controllerConfig: IChainConfig[];
}
