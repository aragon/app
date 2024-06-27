import type { IDaoSettings } from '@/shared/api/daoService';

export interface IDaoTokenSettings extends IDaoSettings {
    settings: {
        /**
         * Amount of tokens that need to vote "Yes" for a proposal to pass.
         */
        supportThreshold: number;
        /**
         * Amount of tokens that need to participate in a vote for it to be valid.
         */
        minParticipation: number;
        /**
         * Minimum amount of time a proposal can be live.
         */
        minDuration: number;
        /**
         * Amount of tokens a member needs to hold in order to create a proposal.
         */
        minProposerVotingPower: string;
    };
}
