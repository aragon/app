'use client';

import { createCapitalDistributorVotingEscrowAddressResolver } from '@/modules/capitalFlow/hooks';
import { cryptexTokenVotingPluginAddressByDaoId } from '../constants';

export const useCryptexVotingEscrowAddress =
    createCapitalDistributorVotingEscrowAddressResolver({
        pluginAddressByDaoId: cryptexTokenVotingPluginAddressByDaoId,
    });
