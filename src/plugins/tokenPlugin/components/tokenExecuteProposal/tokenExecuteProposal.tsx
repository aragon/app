import type { ProposalStatus } from '@aragon/ods';

export interface ITokenExecuteProposalProps {
    /**
     * status of the proposal
     */
    status: ProposalStatus;
}

export const TokenExecuteProposal: React.FC<ITokenExecuteProposalProps> = (props) => {
    const { status } = props;

    return (
        <div>
            <h2>Execute Token Proposal</h2>
        </div>
    );
};
