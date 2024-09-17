import { VoteOption } from '@/plugins/tokenPlugin/types';

export interface IBuildVoteDataParams {
    proposalId: string;
    vote: VoteOption;
}
