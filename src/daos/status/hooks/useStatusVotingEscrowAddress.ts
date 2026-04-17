'use client';

import { createCapitalDistributorVotingEscrowAddressResolver } from '@/modules/capitalFlow/hooks';
import { statusGaugePluginAddressByDaoId } from '../constants';

export const useStatusVotingEscrowAddress =
    createCapitalDistributorVotingEscrowAddressResolver({
        pluginAddressByDaoId: statusGaugePluginAddressByDaoId,
    });
