'use client';

import type { Hex } from 'viem';
import type { ICapitalDistributorVotingEscrowAddressParams } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import type { ITokenPlugin } from '@/plugins/tokenPlugin/types';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { cryptexTokenVotingPluginAddressByDaoId } from '../constants';

export const useCryptexVotingEscrowAddress = (
    params: ICapitalDistributorVotingEscrowAddressParams,
) => {
    const { daoId } = params;
    const pluginAddress = cryptexTokenVotingPluginAddressByDaoId[daoId];

    const plugin = useDaoPlugins({
        daoId,
        pluginAddress,
        includeSubPlugins: true,
    })?.[0]?.meta as ITokenPlugin | undefined;

    return plugin?.votingEscrow?.escrowAddress as Hex | undefined;
};
