'use client';

import { GovernanceDaoSlotId } from '@/modules/governance/constants/moduleDaoSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import type { ITokenProposal } from '../../types';
import { TokenSubmitVoteDefault } from './components/tokenSubmitVoteDefault';

export interface ITokenSubmitVoteProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: ITokenProposal;
    /**
     * Defines if the vote is to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const TokenSubmitVote: React.FC<ITokenSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;

    return (
        <PluginSingleComponent
            daoId={daoId}
            Fallback={TokenSubmitVoteDefault}
            isVeto={isVeto}
            pluginId={daoId}
            proposal={proposal}
            slotId={GovernanceDaoSlotId.GOVERNANCE_DAO_SUBMIT_VOTE}
        />
    );
};
