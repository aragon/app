import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { type IProposalActionChangeSettingsSetting } from '@aragon/ods';

const multisigGovernanceTermsMapping: { [key: string]: string } = {
    onlyListed: 'Proposal creation',
    minApprovals: 'Minimum approvals',
};

export const transformMultisigGovernanceSettings = (
    settings: IProposalActionChangeSettingsSetting[],
): IDaoSettingTermAndDefinition[] => {
    return settings.map(({ term, definition }) => {
        const mappedTerm = multisigGovernanceTermsMapping[term] || term;
        const mappedDefinition = term === 'onlyListed' ? (definition ? 'Members Only' : 'Any Wallet') : definition;
        return {
            term: mappedTerm,
            definition: `${mappedDefinition}`,
        };
    });
};
