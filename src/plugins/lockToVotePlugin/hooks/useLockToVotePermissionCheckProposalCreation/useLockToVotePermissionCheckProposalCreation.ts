'use client';

import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits, Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import type { ILockToVotePlugin } from '../../types';
import { useLockToVoteData } from '../useLockToVoteData';

export interface ILockToVotePermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams<ILockToVotePlugin> {}

const lockManagerAbi = [
    {
        type: 'function',
        inputs: [{ name: '_creator', type: 'address' }],
        name: 'activeProposalsCreatedBy',
        outputs: [{ name: '_result', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export const useLockToVotePermissionCheckProposalCreation = (
    params: ILockToVotePermissionCheckProposalCreationParams,
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

    // TODO: use getRequiredLockAmount view function on condition smart contract when available from the backend
    const { data: activeProposalsCount = BigInt(0), isLoading: isLoadingActiveProposals } = useReadContract({
        abi: lockManagerAbi,
        functionName: 'activeProposalsCreatedBy',
        address: plugin.lockManagerAddress as Hex,
        chainId,
        args: [address as Hex],
        query: { enabled: address != null },
    });

    const requiredLockAmount = BigInt(minProposerVotingPower) * (activeProposalsCount + BigInt(1));
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

    const hasPermission = lockedAmount >= requiredLockAmount;
    const isRestricted = BigInt(minProposerVotingPower) > 0;

    return {
        hasPermission,
        settings: [processedSettings],
        isLoading: isLoadingActiveProposals || isLoadingLockToVoteData,
        isRestricted,
    };
};
