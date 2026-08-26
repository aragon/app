import {
    AlertInline,
    ProposalDataListItem,
    type ProposalStatus,
} from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';
import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { daoUtils } from '@/shared/utils/daoUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { useUserVote } from '../../hooks/useUserVote';
import {
    ProposalMetadataStatus,
    proposalUtils,
} from '../../utils/proposalUtils';

export interface IDaoProposalListDefaultItemProps<
    TProposal extends IProposal = IProposal,
> {
    /**
     * DAO related to the proposal
     */
    dao: IDao;
    /**
     * Proposal to display.
     */
    proposal: TProposal;
    /**
     * Slug of the proposal.
     */
    proposalSlug: string;
}

export const DaoProposalListDefaultItem: React.FC<
    IDaoProposalListDefaultItemProps
> = (props) => {
    const { proposal, dao, proposalSlug } = props;

    const { t } = useTranslations();

    const {
        id,
        title,
        summary,
        executed,
        endDate,
        creator,
        pluginInterfaceType: pluginId,
    } = proposal;

    const userVote = useUserVote({ proposal, network: dao.network });

    const slotId = GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS;
    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({
        params: proposal,
        slotId,
        pluginId,
    })!;

    const proposalDate = (executed.blockTimestamp ?? endDate) * 1000;
    const processedEndDate = proposalDate === 0 ? undefined : proposalDate;

    const proposalHref = proposalUtils.getProposalUrl(proposal, dao);

    const publisherHref = daoUtils.getDaoUrl(dao, `members/${creator.address}`);
    const { data: publisherEnsName } = useEnsName(creator.address);
    const publisherName = publisherEnsName ?? undefined;

    const metadataStatus = proposalUtils.getMetadataStatus(proposal);
    const hasStandardMetadata =
        metadataStatus === ProposalMetadataStatus.STANDARD;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            date={processedEndDate}
            href={proposalHref}
            id={proposalSlug}
            key={id}
            publisher={{
                address: creator.address,
                link: publisherHref,
                name: publisherName,
            }}
            status={proposalStatus}
            summary={summary}
            title={title}
            voted={userVote != null}
        >
            {!hasStandardMetadata && (
                <AlertInline
                    message={t(
                        `app.governance.daoProposalList.metadataAlert.${metadataStatus}`,
                    )}
                    variant="warning"
                />
            )}
        </ProposalDataListItem.Structure>
    );
};
