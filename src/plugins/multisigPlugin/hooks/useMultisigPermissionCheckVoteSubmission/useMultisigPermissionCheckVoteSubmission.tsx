import { useProposal } from '@/modules/governance/api/governanceService';
import { useProposalCanVote } from '@/modules/governance/api/governanceService/queries/useProposalCanVote';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, DateFormat, formatterUtils, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';

export interface IUseMultisigPermissionCheckVoteSubmissionParams
    extends IPermissionCheckGuardParams<IMultisigPluginSettings> {}

export const useMultisigPermissionCheckVoteSubmission = (): IPermissionCheckGuardResult => {
    const urlParams = useParams<{ proposalId: string }>();

    const { address } = useAccount();

    const { t } = useTranslations();

    const { data: proposal } = useProposal({ urlParams: { id: urlParams.proposalId } });

    const { data: hasPermission, isLoading } = useProposalCanVote(
        { urlParams: { id: urlParams.proposalId }, queryParams: { userAddress: address as string } },
        { enabled: address != null && proposal != null },
    );
    console.log('can 2', hasPermission);
    const formattedCreationDate = formatterUtils.formatDate(proposal!.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const { chainId } = networkDefinitions[proposal!.network];

    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const proposalCreationUrl = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: proposal!.transactionHash });

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
                term: t('app.plugins.multisig.multisigPermissionCheckVoteSubmission.createdAt'),
                definition: proposalCreationLink(),
            },
            {
                term: t('app.plugins.multisig.multisigPermissionCheckVoteSubmission.membership'),
                definition: t('app.plugins.multisig.multisigPermissionCheckVoteSubmission.nonMember'),
            },
        ],
        isLoading,
    };
};
