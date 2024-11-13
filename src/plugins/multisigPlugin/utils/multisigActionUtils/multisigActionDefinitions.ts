import {
    type IProposalActionChangeMembers,
    type IProposalActionChangeSettings,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';

export const defaultAddMembers: IProposalActionChangeMembers = {
    type: ProposalActionType.MULTISIG_ADD_MEMBERS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    members: [{ address: '' }],
    currentMembers: [],
    inputData: {
        function: 'addAddresses',
        contract: 'Multisig',
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

export const defaultRemoveMembers: IProposalActionChangeMembers = {
    type: ProposalActionType.MULTISIG_REMOVE_MEMBERS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    members: [],
    currentMembers: [],
    inputData: {
        function: 'removeAddresses',
        contract: 'Multisig',
        parameters: [
            {
                name: '_members',
                type: 'address[]',
                value: '',
                notice: 'The addresses to be removed',
            },
        ],
    },
};

export const defaultUpdateSettings: Omit<IProposalActionChangeSettings, 'proposedSettings' | 'existingSettings'> = {
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    inputData: {
        function: 'updateMultisigSettings',
        contract: 'Multisig',
        parameters: [
            {
                name: '_multisigSettings',
                type: 'tuple',
                notice: 'The new settings',
                value: '',
            },
        ],
    },
};
