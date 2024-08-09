import { type IProposalActionChangeMembers } from '@/modules/governance/api/governanceService';

export const generateProposalActionChangeMembers = (
    action?: Partial<IProposalActionChangeMembers>,
): IProposalActionChangeMembers => ({
    members: [{ address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }],
    currentMembers: [{ address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }],
    type: 'MultisigAddMembers' as IProposalActionChangeMembers['type'],
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE',
    data: '',
    value: '1000000000000000000',
    inputData: {
        function: 'addMember',
        contract: 'Multisig_v1.2',
        parameters: [{ name: 'function', type: 'address[]', value: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }],
    },
    ...action,
});
