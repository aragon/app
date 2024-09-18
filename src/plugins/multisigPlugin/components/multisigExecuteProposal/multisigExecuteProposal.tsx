import type { ProposalStatus } from '@aragon/ods';

export interface IMultisigExecuteProposalProps {
    /**
     * status of the proposal
     */
    status: ProposalStatus;
}

export const MultisigExecuteProposal: React.FC<IMultisigExecuteProposalProps> = (props) => {
    const { status } = props;

    return (
        <div>
            <h2>Execute Multisig Proposal</h2>
        </div>
    );
};
