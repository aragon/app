'use client';

import type { Hex } from 'viem';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { ICapitalDistributorVotingEscrowAddressParams } from '../constants/moduleDaoSlots';

interface IPluginWithVotingEscrow {
    address: string;
    interfaceType: PluginInterfaceType;
    votingEscrow?: {
        escrowAddress: string;
    };
}

export interface ICreateCapitalDistributorVotingEscrowAddressResolverParams {
    pluginAddressByDaoId?: Record<string, `0x${string}`>;
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
