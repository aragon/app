import { ProposalVotingBodyContent } from './proposalVotingBodyContent';
import { ProposalVotingBodySummary } from './proposalVotingBodySummary';
import { ProposalVotingBodySummaryList } from './proposalVotingBodySummaryList';
import { ProposalVotingBodySummaryListItem } from './proposalVotingBodySummaryListItem';
import { ProposalVotingBreakdownMultisig } from './proposalVotingBreakdownMultisig';
import { ProposalVotingBreakdownToken } from './proposalVotingBreakdownToken';
import { ProposalVotingContainer } from './proposalVotingContainer';
import { ProposalVotingDetails } from './proposalVotingDetails';
import { ProposalVotingProgress } from './proposalVotingProgress';
import { ProposalVotingStage } from './proposalVotingStage';
import { ProposalVotingStageContainer } from './proposalVotingStageContainer';
import { ProposalVotingVotes } from './proposalVotingVotes';

/**
 * Usage notes:
 *
 * - For multi-stage voting, `StageContainer.activeStage` is the single-open accordion value: each `Stage` receives
 *   a zero-based index and uses its string form (`'0'`, `'1'`, etc.), so leaving `activeStage` undefined leaves
 *   every stage collapsed.
 * - Place body members such as `BodyContent` and `BodySummary` inside `Container` or `Stage`; those wrappers
 *   provide the `ProposalVoting` context that the members consume.
 * - `BodyContent` initially selects Details for `PENDING`/`UNREACHED` statuses and Breakdown for other statuses.
 */
export const ProposalVoting = {
    BreakdownMultisig: ProposalVotingBreakdownMultisig,
    BreakdownToken: ProposalVotingBreakdownToken,
    Container: ProposalVotingContainer,
    Details: ProposalVotingDetails,
    StageContainer: ProposalVotingStageContainer,
    Stage: ProposalVotingStage,
    Votes: ProposalVotingVotes,
    BodySummary: ProposalVotingBodySummary,
    BodySummaryList: ProposalVotingBodySummaryList,
    BodySummaryListItem: ProposalVotingBodySummaryListItem,
    BodyContent: ProposalVotingBodyContent,
    Progress: ProposalVotingProgress,
};

export * from './proposalVotingBodyContent';
export * from './proposalVotingBodySummary';
export * from './proposalVotingBodySummaryList';
export * from './proposalVotingBodySummaryListItem';
export * from './proposalVotingBreakdownMultisig';
export * from './proposalVotingBreakdownToken';
export * from './proposalVotingContainer';
export * from './proposalVotingDefinitions';
export * from './proposalVotingDetails';
export * from './proposalVotingProgress';
export * from './proposalVotingStage';
export * from './proposalVotingStageContainer';
export * from './proposalVotingVotes';
