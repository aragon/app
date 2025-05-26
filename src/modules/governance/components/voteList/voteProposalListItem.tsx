import { type IVote } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { VoteProposalDataListItem, type VoteIndicator } from '@aragon/gov-ui-kit';
import { proposalUtils } from '../../utils/proposalUtils';

export interface IVoteProposalListItemProps {
    /**
     * Relevant vote data.
     */
    vote: IVote;
    /**
     * Vote option.
     */
    voteIndicator: VoteIndicator;
    /**
     * Description for the vote indicator.
     */
    voteIndicatorDescription?: string;
    /**
     * ID of the DAO related to the votes.
     */
    daoId: string;
}

export const VoteProposalListItem: React.FC<IVoteProposalListItemProps> = (props) => {
    const { vote, daoId, voteIndicator, voteIndicatorDescription } = props;

    const proposal = vote.parentProposal ?? vote.proposal!;

    const plugin = useDaoPlugins({ daoId, pluginAddress: proposal.pluginAddress, includeSubPlugins: true })?.[0];
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, plugin?.meta);

    return (
        <VoteProposalDataListItem.Structure
            key={vote.transactionHash}
            href={daoUtils.getDaoUrl(dao, `proposals/${slug}`)}
            voteIndicator={voteIndicator}
            voteIndicatorDescription={voteIndicatorDescription}
            proposalId={slug}
            proposalTitle={proposal.title}
            date={vote.blockTimestamp * 1000}
        />
    );
};
