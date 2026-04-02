'use client';

import type { Hex } from 'viem';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { ICapitalDistributorVotingEscrowAddressParams } from '../constants/moduleDaoSlots';

/**
 * Internal plugin meta shape used by the voting-escrow resolver.
 */
interface IPluginWithVotingEscrow {
    /**
     * Plugin instance address returned by the DAO plugins query.
     */
    address: string;
    /**
     * Interface discriminator used to prioritize matching plugins.
     */
    interfaceType: PluginInterfaceType;
    /**
     * Optional voting-escrow configuration exposed on plugin metadata.
     */
    votingEscrow?: {
        /**
         * Voting escrow contract address associated with the plugin.
         */
        escrowAddress: string;
    };
}

/**
 * Internal configuration for building the capital distributor voting-escrow
 * address resolver.
 */
export interface ICreateCapitalDistributorVotingEscrowAddressResolverParams {
    /**
     * Optional DAO-to-plugin address overrides used to resolve a specific
     * plugin before falling back to interface-type matching.
     */
    pluginAddressByDaoId?: Record<string, `0x${string}`>;
    /**
     * Preferred plugin interface order used when multiple plugins expose a
     * voting escrow address.
     */
    preferredInterfaceTypes?: PluginInterfaceType[];
}

const defaultPreferredInterfaceTypes = [
    PluginInterfaceType.GAUGE_VOTER,
    PluginInterfaceType.TOKEN_VOTING,
];

export const createCapitalDistributorVotingEscrowAddressResolver = (
    config: ICreateCapitalDistributorVotingEscrowAddressResolverParams = {},
) => {
    const {
        pluginAddressByDaoId,
        preferredInterfaceTypes = defaultPreferredInterfaceTypes,
    } = config;

    return (params: ICapitalDistributorVotingEscrowAddressParams) => {
        const { daoId } = params;
        const preferredPluginAddress = pluginAddressByDaoId?.[daoId];

        const plugins = useDaoPlugins({
            daoId,
            pluginAddress: preferredPluginAddress,
            includeSubPlugins: true,
        });

        const pluginMetas =
            plugins?.map((plugin) => plugin.meta as IPluginWithVotingEscrow) ??
            [];

        const pluginWithEscrowAddress = pluginMetas.find(
            (plugin) => plugin.votingEscrow?.escrowAddress != null,
        );

        if (preferredPluginAddress != null) {
            return pluginWithEscrowAddress?.votingEscrow?.escrowAddress as
                | Hex
                | undefined;
        }

        for (const interfaceType of preferredInterfaceTypes) {
            const matchingPlugin = pluginMetas.find(
                (plugin) =>
                    plugin.interfaceType === interfaceType &&
                    plugin.votingEscrow?.escrowAddress != null,
            );

            if (matchingPlugin?.votingEscrow?.escrowAddress != null) {
                return matchingPlugin.votingEscrow.escrowAddress as
                    | Hex
                    | undefined;
            }
        }

        return pluginWithEscrowAddress?.votingEscrow?.escrowAddress as
            | Hex
            | undefined;
    };
};
