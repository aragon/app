'use client';

import { createCapitalDistributorVotingEscrowAddressResolver } from '@/modules/capitalFlow/hooks';
import { gaugeDistributionsPluginAddressByDaoId } from '../constants';

export const useGaugeDistributionsVotingEscrowAddress =
    createCapitalDistributorVotingEscrowAddressResolver({
        pluginAddressByDaoId: gaugeDistributionsPluginAddressByDaoId,
    });
