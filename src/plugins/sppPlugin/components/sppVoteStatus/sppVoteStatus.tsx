import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import type { ISppSubProposal } from '@/plugins/sppPlugin/types';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';

export interface ISppVoteStatusProps {
    /**
     * ID of the related DAO.
     */
    daoId: string;
    /**
     * Sub proposal to display the vote status for.
     */
    subProposal: ISppSubProposal;
    /**
     * Flag indicating if the vote is a veto.
     */
    isVeto: boolean;
    /**
     * Flag indicating if the user can vote.
     */
    canVote: boolean;
}

export const SppVoteStatus: React.FC<ISppVoteStatusProps> = (props) => {
    const { daoId, subProposal, isVeto, canVote } = props;

    const slotId = GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE;
    const { pluginSubdomain: pluginId } = subProposal;

    const userVote = useUserVote({ proposal: subProposal });

    if (!canVote || userVote != null) {
        return null;
    }

    return (
        <PluginSingleComponent
            slotId={slotId}
            pluginId={pluginId}
            proposal={subProposal}
            daoId={daoId}
            isVeto={isVeto}
        />
    );
};
