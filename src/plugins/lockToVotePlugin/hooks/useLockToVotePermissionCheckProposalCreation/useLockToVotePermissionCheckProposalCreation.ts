'use client';

import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits, type Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { ILockToVotePlugin } from '../../types';
import { useLockToVoteData } from '../useLockToVoteData';

export interface ILockToVotePermissionCheckProposalCreationParams extends IPermissionCheckGuardParams<ILockToVotePlugin> {}

const proposalCreationConditionAbi = [
    {
        type: 'function',
        inputs: [{ name: '_who', type: 'address' }],
        name: 'getRequiredLockAmount',
        outputs: [{ name: '_result', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export const useLockToVotePermissionCheckProposalCreation = (
    params: ILockToVotePermissionCheckProposalCreationParams
): IPermissionCheckGuardResult => {
    const { plugin, daoId, useConnectedUserInfo = true } = params;
    const { address } = useAccount();
    const { t } = useTranslations();

    const { lockedAmount, isLoading: isLoadingLockToVoteData } = useLockToVoteData({ plugin, daoId });
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { id: chainId } = networkDefinitions[dao!.network];

    const pluginName = daoUtils.getPluginName(plugin);

    const { minProposerVotingPower, token } = plugin.settings;
    const { decimals: tokenDecimals, symbol: tokenSymbol } = token;

    const { data: requiredLockAmount = BigInt(0), isLoading: isLoadingRequiredLockAmount } = useReadContract({
        abi: proposalCreationConditionAbi,
        functionName: 'getRequiredLockAmount',
        address: plugin.proposalCreationConditionAddress as Hex,
        chainId,
        args: [address as Hex],
        query: { enabled: address != null },
    });

    const parsedRequiredLockAmount = formatUnits(requiredLockAmount, tokenDecimals);
    const formattedRequiredLockAMount = formatterUtils.formatNumber(parsedRequiredLockAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const minTokenRequired = `≥${formattedRequiredLockAMount ?? '0'} ${tokenSymbol}`;

    const defaultSettings = [
        {
            term: t('app.plugins.lockToVote.lockToVotePermissionCheckProposalCreation.pluginNameLabel'),
            definition: pluginName,
        },
        {
            term: t('app.plugins.lockToVote.lockToVotePermissionCheckProposalCreation.function'),
            definition: minTokenRequired,
        },
    ];

    const parsedLockedAmount = formatUnits(lockedAmount, tokenDecimals);
    const formattedLockedAmount = formatterUtils.formatNumber(parsedLockedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const connectedUserSettings = [
        {
            term: t('app.plugins.lockToVote.lockToVotePermissionCheckProposalCreation.userLockedBalance'),
            definition: `${formattedLockedAmount ?? '0'} ${tokenSymbol}`,
        },
    ];

    const processedSettings = useConnectedUserInfo ? defaultSettings.concat(connectedUserSettings) : defaultSettings;

    const hasPermission = !isLoadingRequiredLockAmount && lockedAmount >= requiredLockAmount;
    const isRestricted = BigInt(minProposerVotingPower) > 0;

    return {
        hasPermission,
        settings: [processedSettings],
        isLoading: isLoadingRequiredLockAmount || isLoadingLockToVoteData,
        isRestricted,
    };
};
