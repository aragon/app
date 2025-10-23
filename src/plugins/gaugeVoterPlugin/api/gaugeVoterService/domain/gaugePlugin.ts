import type { Network } from '@/shared/api/daoService';
import type { Hex } from 'viem';

/**
 * Gauge plugin response from /v2/plugins/by-dao/:network/:daoAddress?interfaceType=gauge endpoint.
 */
export interface IGaugePlugin {
    _id: string;
    id: string;
    transactionHash: Hex;
    blockNumber: number;
    blockTimestamp: number;
    network: Network;
    address: Hex;
    implementationAddress: Hex;
    interfaceType: 'gauge';
    status: 'installed' | 'uninstalled';
    isSupported: boolean;
    daoAddress: Hex;
    tokenAddress: Hex;
    pluginSetupRepoAddress: Hex;
    sender: Hex;
    release: string;
    build: string;
    subdomain: string;
    permissions: Array<{
        operation: number;
        where: Hex;
        who: Hex;
        condition: Hex;
        permissionId: Hex;
    }>;
    uninstalled: {
        status: boolean;
        transactionHash: Hex | null;
        blockNumber: number | null;
        blockTimestamp: number | null;
    };
    hasTarget: boolean;
    isProcess: boolean;
    isBody: boolean;
    isSubPlugin: boolean;
    metadataIpfs: string | null;
    name: string | null;
    description: string | null;
    processKey: string | null;
    votingEscrow: string | null;
    conditionAddress: Hex | null;
    lockManagerAddress: Hex | null;
    proposalCreationConditionAddress: Hex;
    enableOfacCheck: boolean | null;
    blockedCountries: string[];
    termsConditionsUrl: string | null;
    subPlugins: string[];
    links: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}
