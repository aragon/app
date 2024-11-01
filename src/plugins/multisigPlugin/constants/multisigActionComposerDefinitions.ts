import { type IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';

export const defaultAddMembers: IProposalAction = {
    type: ProposalActionType.MULTISIG_ADD_MEMBERS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    inputData: {
        function: 'addAddresses',
        contract: '',
        parameters: [
            {
                name: '_members',
                type: 'address[]',
                value: '',
                notice: 'The addresses to be added',
            },
        ],
    },
};
