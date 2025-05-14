import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { ProposalDataListItem } from '@aragon/gov-ui-kit';
import { daoUtils } from '../../../../shared/utils/daoUtils';
import { type IMultisigProposal } from '../../types';
import { multisigProposalUtils } from '../../utils/multisigProposalUtils';

export interface IMultisigProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: IMultisigProposal;
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
    /**
     * Plugin of the proposal.
     */
    plugin: IDaoPlugin;
}

export const MultisigProposalListItem: React.FC<IMultisigProposalListItemProps> = (props) => {
    const { proposal, daoId, plugin } = props;

    const vote = useUserVote({ proposal });
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const proposalDate = (proposal.executed.blockTimestamp ?? proposal.endDate) * 1000;

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, plugin);

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposalDate}
            href={daoUtils.getDaoUrl(dao, `proposals/${slug}`)}
            status={multisigProposalUtils.getProposalStatus(proposal)}
            voted={vote != null}
            publisher={{
                address: proposal.creator.address,
                name: proposal.creator.ens ?? undefined,
                link: `members/${proposal.creator.address}`,
            }}
            id={slug}
        />
    );
};
