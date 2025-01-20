import { useCanVote } from '@/modules/governance/api/governanceService/queries/useCanVote';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, DateFormat, formatterUtils, invariant, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface IUseMultisigPermissionCheckVoteSubmissionParams
    extends IPermissionCheckGuardParams<IMultisigPluginSettings> {}

export const useMultisigPermissionCheckVoteSubmission = (
    params: IUseMultisigPermissionCheckVoteSubmissionParams,
): IPermissionCheckGuardResult => {
    const { proposal } = params;

    invariant(proposal != null, 'useMultisigPermissionCheckVoteSubmission: proposal is required');

    const { address } = useAccount();
    const { t } = useTranslations();

    const { id, blockTimestamp, network, transactionHash } = proposal;
    const { data: hasPermission, isLoading } = useCanVote(
        { urlParams: { id }, queryParams: { userAddress: address as string } },
        { enabled: address != null },
    );

    const formattedCreationDate = formatterUtils.formatDate(blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const { chainId } = networkDefinitions[network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const proposalCreationUrl = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash });

    const settings = [
        {
            term: t('app.plugins.multisig.multisigPermissionCheckVoteSubmission.createdAt'),
            definition: formattedCreationDate!,
            href: proposalCreationUrl,
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
