import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import type { IMultisigActionChangeMembers, IMultisigActionChangeSettings, IMultisigPluginSettings } from '../../types';
import { MultisigProposalActionType } from '../../types/enum';

export const defaultAddMembers: IMultisigActionChangeMembers = {
    type: MultisigProposalActionType.MULTISIG_ADD_MEMBERS,
    from: '',
    to: '',
    data: '',
    value: '0',
    members: [{ address: '' }],
    currentMembers: 0,
    inputData: {
        function: 'addAddresses',
        contract: PluginContractName.MULTISIG,
        parameters: [
            {
                name: '_members',
                type: 'address[]',
                value: undefined,
                notice: 'The addresses to be added',
            },
        ],
    },
};

export const defaultRemoveMembers: IMultisigActionChangeMembers = {
    type: MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS,
    from: '',
    to: '',
    data: '',
    value: '0',
    members: [],
    currentMembers: 0,
    inputData: {
        function: 'removeAddresses',
        contract: PluginContractName.MULTISIG,
        parameters: [
            {
                name: '_members',
                type: 'address[]',
                value: undefined,
                notice: 'The addresses to be removed',
            },
        ],
    },
};

export const defaultUpdateSettings = ({ address, settings }: IDaoPlugin<IMultisigPluginSettings>): IMultisigActionChangeSettings => ({
    type: MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS,
    from: '',
    to: address,
    data: '',
    value: '0',
    existingSettings: settings,
    proposedSettings: settings,
    inputData: {
        function: 'updateMultisigSettings',
        contract: PluginContractName.MULTISIG,
        parameters: [
            {
                name: '_multisigSettings',
                type: 'tuple',
                notice: 'The new voting settings',
                value: undefined,
                components: [
                    { name: 'onlyListed', type: 'bool' },
                    { name: 'minApprovals', type: 'uint16' },
                ],
            },
        ],
    },
});
