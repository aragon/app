import {
    type IProposalActionChangeMembers,
    type IProposalActionChangeSettings,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import type { IMultisigPluginSettings } from '../../types';

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

export const defaultUpdateSettings = (settings: IMultisigPluginSettings): IProposalActionChangeSettings => ({
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    proposedSettings: settings,
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
});
