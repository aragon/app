import type { IProposal } from '@/modules/governance/api/governanceService';
import { useProposalCanVote } from '@/modules/governance/api/governanceService/queries/useProposalCanVote';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';

import { useTranslations } from '@/shared/components/translationsProvider';
import { ChainEntityType, DateFormat, formatterUtils, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface IUseMultisigPermissionCheckVoteSubmissionParams
    extends IPermissionCheckGuardParams<IMultisigPluginSettings> {
    /**
     * Proposal to create the vote for.
     */
    proposal: IProposal;
    /**
     * ID of the chain the proposal is created on.
     */
    chainId: number;
}

export const useMultisigPermissionCheckVoteSubmission = (
    params: IUseMultisigPermissionCheckVoteSubmissionParams,
): IPermissionCheckGuardResult => {
    const { proposal, chainId } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const { data: hasPermission, isLoading } = useProposalCanVote(
        { urlParams: { id: proposal.id }, queryParams: { userAddress: address as string } },
        { enabled: address != null },
    );

    const formattedCreationDate = formatterUtils.formatDate(proposal.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const proposalCreationUrl = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: proposal.transactionHash });

    const proposalCreationLink = () => {
        return (
            <Link href={proposalCreationUrl} iconRight={IconType.LINK_EXTERNAL}>
                {formattedCreationDate}
            </Link>
        );
    };

    if (hasPermission) {
        return {
            hasPermission: true,
        };
    }

    return {
        hasPermission: false,
        settings: [
            {
                term: t('app.plugins.multisig.multisigVoteSubmissionRequirements.createdAt'),
                definition: proposalCreationLink(),
            },
            {
                term: t('app.plugins.multisig.multisigVoteSubmissionRequirements.membership'),
                definition: t('app.plugins.multisig.multisigVoteSubmissionRequirements.nonMember'),
            },
        ],
        isLoading,
    };
};
