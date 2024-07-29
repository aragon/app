import { generateProposalActionChangeMembers } from '@/modules/governance/testUtils/generators/proposalActionChangeMembers';
import { generateProposalActionChangeSettings } from '@/modules/governance/testUtils/generators/proposalActionChangeSettings';

export const proposalActionsMock = [
    generateProposalActionChangeMembers({
        members: [
            { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
            { address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE' },
        ],
        currentMembers: 10,
    }),
    generateProposalActionChangeSettings({
        existingSettings: [
            { term: 'Token Symbol', definition: 'ABC' },
            { term: 'Support Threshold', definition: '50%' },
            { term: 'Proposal Threshold', definition: '1%' },
            { term: 'Minimum Duration', definition: '7 days' },
            { term: 'Early Execution', definition: 'No' },
            { term: 'Vote Changes', definition: 'Yes' },
        ],
        proposedSettings: [
            { term: 'Token Symbol', definition: 'XYZ' },
            { term: 'Support Threshold', definition: '60%' },
            { term: 'Proposal Threshold', definition: '2%' },
            { term: 'Minimum Duration', definition: '5 days' },
            { term: 'Early Execution', definition: 'Yes' },
            { term: 'Vote Changes', definition: 'No' },
        ],
    }),
];
