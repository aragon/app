import type { IResource } from '@/shared/api/daoService';
import type { Hex } from 'viem';

export interface IGaugePluginToken {
    network: string;
    type: string;
    address: Hex;
    mintableByDao: boolean;
    logo: string;
    ignoreTransfer: boolean;
    isGovernance: boolean;
    name: string;
    symbol: string;
    decimals: number;
    underlying: string | null;
    totalSupply: string;
    hasDelegate: boolean;
}

export interface IGaugePluginSettings {
    stages: unknown[];
    token: IGaugePluginToken;
}

/**
 * Gauge plugin metadata from the API response.
 */
export interface IGaugePlugin {
    transactionHash: Hex;
    blockTimestamp: number;
    address: Hex;
    implementationAddress: Hex;
    interfaceType: 'gauge';
    isSupported: boolean;
    tokenAddress: Hex;
    release: string;
    build: string;
    subdomain: string;
    isProcess: boolean;
    isBody: boolean;
    isSubPlugin: boolean;
    metadataIpfs: string | null;
    name: string;
    description: string | null;
    processKey: string | null;
    votingEscrow: string | null;
    conditionAddress: Hex | null;
    lockManagerAddress: Hex | null;
    proposalCreationConditionAddress: Hex;
    enableOfacCheck: boolean | null;
    blockedCountries: string[];
    termsConditionsUrl: string | null;
    subPlugins: unknown[];
    links: IResource[];
    slug: string;
    settings: IGaugePluginSettings;
}
