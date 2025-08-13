'use client';

import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { type ITokenProposalVotingSummaryProps, TokenProposalVotingSummary } from './tokenProposalVotingSummary';

export interface ITokenProposalVotingSummaryNoEarlyExecutionProps extends ITokenProposalVotingSummaryProps {}

export const TokenProposalVotingSummaryNoEarlyExecution: React.FC<ITokenProposalVotingSummaryNoEarlyExecutionProps> = (
    props,
) => {
    const { proposal, name } = props;

    if (!proposal) {
        return <p className="text-base leading-tight font-normal text-neutral-800 md:text-lg">{name}</p>;
    }

    const status = tokenProposalUtils.getProposalStatusNoEarlyExecution(proposal);

    return <TokenProposalVotingSummary {...props} proposalStatus={status} />;
};
