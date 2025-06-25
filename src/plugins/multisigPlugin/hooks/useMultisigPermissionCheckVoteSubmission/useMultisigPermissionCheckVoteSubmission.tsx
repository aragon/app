import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, DateFormat, formatterUtils, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

export interface IUseMultisigPermissionCheckVoteSubmissionParams
    extends IPermissionCheckGuardParams<IMultisigPluginSettings> {}

const multisigAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', internalType: 'uint256', type: 'uint256' },
            { name: '_account', internalType: 'address', type: 'address' },
        ],
        name: 'canApprove',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'view',
    },
] as const;

export const useMultisigPermissionCheckVoteSubmission = (
    params: IUseMultisigPermissionCheckVoteSubmissionParams,
): IPermissionCheckGuardResult => {
    const { proposal } = params;

    const { address } = useAccount();
    const { t } = useTranslations();

    const { blockTimestamp, network, transactionHash, proposalIndex, pluginAddress } = proposal!;

    const { data: hasPermission, isLoading } = useReadContract({
        address: pluginAddress as Hex,
        chainId: networkDefinitions[network].id,
        abi: multisigAbi,
        functionName: 'canApprove',
        args: [BigInt(proposalIndex), address as Hex],
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
            term: t('app.plugins.multisig.multisigPermissionCheckVoteSubmission.createdAt'),
            definition: formattedCreationDate!,
            link: { href: proposalCreationUrl, textClassName: 'first-letter:capitalize' },
        },
        {
            term: t('app.plugins.multisig.multisigPermissionCheckVoteSubmission.membership'),
            definition: t('app.plugins.multisig.multisigPermissionCheckVoteSubmission.nonMember'),
        },
    ];

    return {
        hasPermission: !!hasPermission,
        settings: [settings],
        isLoading,
        isRestricted: true,
    };
};
