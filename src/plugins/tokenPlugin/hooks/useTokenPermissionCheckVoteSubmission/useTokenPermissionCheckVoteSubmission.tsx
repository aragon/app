import {
    ChainEntityType,
    DateFormat,
    formatterUtils,
} from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import {
    type ITokenPluginSettings,
    VoteOption,
} from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';

export interface ITokenPermissionCheckVoteSubmissionParams
    extends IPermissionCheckGuardParams<IDaoPlugin<ITokenPluginSettings>> {}

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

    const { symbol: tokenSymbol } = plugin.settings.token;
    const {
        blockTimestamp,
        network,
        transactionHash,
        proposalIndex,
        pluginAddress,
    } = proposal!;

    const { chainId, buildEntityUrl } = useDaoChain({ network });

    const { data: hasPermission, isLoading } = useReadContract({
        address: pluginAddress as Hex,
        chainId,
        abi: tokenVotingAbi,
        functionName: 'canVote',
        // Passing YES as vote option because we are only checking permission to vote and the option does not matter
        args: [BigInt(proposalIndex), address as Hex, VoteOption.YES],
        query: { enabled: address != null },
    });

    const creationDate = blockTimestamp * 1000;
    const formattedCreationDate = formatterUtils.formatDate(creationDate, {
        format: DateFormat.YEAR_MONTH_DAY,
    });
    const proposalCreationUrl = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: transactionHash,
    });

    const settings = [
        {
            term: t(
                'app.plugins.token.tokenPermissionCheckVoteSubmission.createdAt',
            ),
            definition: formattedCreationDate!,
            link: {
                href: proposalCreationUrl,
                textClassName: 'first-letter:capitalize',
            },
        },
        {
            term: t(
                'app.plugins.token.tokenPermissionCheckVoteSubmission.membership',
            ),
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
