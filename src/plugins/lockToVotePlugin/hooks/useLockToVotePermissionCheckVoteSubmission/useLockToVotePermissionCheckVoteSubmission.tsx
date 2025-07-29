import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, DateFormat, formatterUtils, useBlockExplorer } from '@aragon/gov-ui-kit';
import { erc20Abi, type Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import type { ILockToVotePlugin } from '../../types';

export interface IUseLockToVotePermissionCheckVoteSubmissionParams extends IPermissionCheckGuardParams {
    /**
     * Lock to vote plugin to be processed.
     */
    plugin: ILockToVotePlugin;
}

const lockManagerAbi = [
    {
        type: 'function',
        inputs: [{ name: '_account', type: 'address' }],
        name: 'getLockedBalance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export const useLockToVotePermissionCheckVoteSubmission = (
    params: IUseLockToVotePermissionCheckVoteSubmissionParams,
): IPermissionCheckGuardResult => {
    const { plugin, proposal } = params;

    const { address } = useAccount();
    const { t } = useTranslations();

    const { token } = plugin.settings;
    const { blockTimestamp, network, transactionHash } = proposal!;
    const { id: chainId } = networkDefinitions[network];

    const { data: tokenBalance, isLoading: isTokenBalanceLoading } = useReadContract({
        abi: erc20Abi,
        address: token.address as Hex,
        chainId,
        functionName: 'balanceOf',
        args: [address as Hex],
        query: { enabled: address != null },
    });

    const { data: lockedBalance, isLoading: isLockedBalanceLoading } = useReadContract({
        abi: lockManagerAbi,
        address: plugin.lockManagerAddress as Hex,
        chainId,
        functionName: 'getLockedBalance',
        args: [address as Hex],
        query: { enabled: address != null },
    });

    const creationDate = blockTimestamp * 1000;
    const formattedCreationDate = formatterUtils.formatDate(creationDate, { format: DateFormat.YEAR_MONTH_DAY });

    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const proposalCreationUrl = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash });

    const settings = [
        {
            term: t('app.plugins.lockToVote.lockToVotePermissionCheckVoteSubmission.createdAt'),
            definition: formattedCreationDate!,
            link: { href: proposalCreationUrl, textClassName: 'first-letter:capitalize' },
        },
        {
            term: t('app.plugins.lockToVote.lockToVotePermissionCheckVoteSubmission.votingPower'),
            definition: `0 ${token.symbol}`,
        },
    ];

    // Return positive result for users having token balance greater than 0 to display lock dialog instead of the
    // default permission dialog
    const hasPermission = (tokenBalance ?? 0) > 0 || (lockedBalance ?? 0) > 0;

    const isLoading = isTokenBalanceLoading || isLockedBalanceLoading;

    return { hasPermission, settings: [settings], isLoading, isRestricted: true };
};
