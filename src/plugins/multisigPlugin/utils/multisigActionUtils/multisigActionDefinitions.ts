import type { IDaoPluginMetadata } from '@/shared/api/daoService';
import type {
    IMultisigActionChangeMembers,
    IMultisigActionChangeSettings,
    IMultisigActionUpdateMetadata,
    IMultisigPluginSettings,
} from '../../types';
import { MultisigProposalActionType } from '../../types/enum';

export const defaultAddMembers: IMultisigActionChangeMembers = {
    type: MultisigProposalActionType.MULTISIG_ADD_MEMBERS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    members: [{ address: '' }],
    currentMembers: 0,
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

export const defaultRemoveMembers: IMultisigActionChangeMembers = {
    type: MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    members: [],
    currentMembers: 0,
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

export const defaultUpdateSettings = (settings: IMultisigPluginSettings): IMultisigActionChangeSettings => ({
    type: MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS,
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

export const defaultUpdateMetadata = (metadata: IDaoPluginMetadata): IMultisigActionUpdateMetadata => ({
    type: MultisigProposalActionType.UPDATE_PLUGIN_METADATA,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    existingMetadata: metadata,
    inputData: {
        function: 'updateMetadata',
        contract: 'Multisig',
        parameters: [
            {
                name: '_metadata',
                type: 'tuple',
                notice: 'The new metadata',
                value: '',
            },
        ],
    },
});
