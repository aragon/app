import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { VoteOption, type ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, DateFormat, formatterUtils, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

export interface ITokenPermissionCheckVoteSubmissionParams extends IPermissionCheckGuardParams<ITokenPluginSettings> {
    /**
     * Plugin to check permissions for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

const tokenVotingAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', internalType: 'uint256', type: 'uint256' },
            { name: '_voter', internalType: 'address', type: 'address' },
            { name: '_voteOption', internalType: 'uint8', type: 'uint8' },
        ],
        name: 'canVote',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'view',
    },
] as const;

export const useTokenPermissionCheckVoteSubmission = (
    params: ITokenPermissionCheckVoteSubmissionParams,
): IPermissionCheckGuardResult => {
    const { plugin, proposal } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const tokenSymbol = plugin.settings.token.symbol;

    const { blockTimestamp, network, transactionHash, proposalIndex, pluginAddress } = proposal!;

    const { data: hasPermission, isLoading } = useReadContract({
        address: pluginAddress as Hex,
        chainId: networkDefinitions[network].id,
        abi: tokenVotingAbi,
        functionName: 'canVote',
        args: [BigInt(proposalIndex), address as Hex, VoteOption.YES], // Just passing YES as we are only checking permission to vote so option itself doesn't matter
        query: { enabled: address != null },
    });

    const formattedCreationDate = formatterUtils.formatDate(blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const { id: chainId } = networkDefinitions[network];

    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const proposalCreationUrl = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash });

    const settings = [
        {
            term: t('app.plugins.token.tokenPermissionCheckVoteSubmission.createdAt'),
            definition: formattedCreationDate!,
            link: { href: proposalCreationUrl, textClassName: 'first-letter:capitalize' },
        },
        {
            term: t('app.plugins.token.tokenPermissionCheckVoteSubmission.membership'),
            definition: `0 ${tokenSymbol}`,
        },
    ];

    return {
        hasPermission: !!hasPermission,
        settings: [settings],
        isLoading,
        isRestricted: true,
    };
};
