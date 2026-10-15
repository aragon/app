import { ProposalVotingProgressContainer } from './proposalVotingProgressContainer';
import { ProposalVotingProgressItem } from './proposalVotingProgressItem';

/**
 * Voting progress bars: `ProposalVotingProgress.Container` stacks `ProposalVotingProgress.Item`s, each a labelled
 * `Progress` bar.
 */
export const ProposalVotingProgress = {
    Item: ProposalVotingProgressItem,
    Container: ProposalVotingProgressContainer,
};

export * from './proposalVotingProgressContainer';
export * from './proposalVotingProgressItem';
