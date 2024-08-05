import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { type IProposalActionChangeSettingsSetting } from '@aragon/ods';

const tokenGovernanceTermsMapping: { [key: string]: string } = {
    supportThreshold: 'Approval Threshold',
    minParticipation: 'Minimum Participation',
    minDuration: 'Minimum Duration',
    minProposerVotingPower: 'Proposal Threshold',
    votingMode: 'Voting Mode',
};

const votingModeMapping: { [key: number]: string } = {
    [DaoTokenVotingMode.STANDARD]: 'Standard',
    [DaoTokenVotingMode.EARLY_EXECUTION]: 'Early Execution',
    [DaoTokenVotingMode.VOTE_REPLACEMENT]: 'Vote Replacement',
};

export const transformTokenGovernanceSettings = (
    settings: IProposalActionChangeSettingsSetting[],
): IDaoSettingTermAndDefinition[] => {
    return settings.map(({ term, definition }) => {
        const mappedTerm = tokenGovernanceTermsMapping[term] || term;
        let mappedDefinition = definition;

        if (term === 'votingMode' && typeof definition === 'number') {
            mappedDefinition = votingModeMapping[definition];
        }

        return {
            term: mappedTerm,
            definition: `${mappedDefinition}`,
        };
    });
};
