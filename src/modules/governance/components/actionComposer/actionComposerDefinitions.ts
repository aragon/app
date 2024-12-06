import { type IProposalActionUpdatePluginMetadata } from '@/modules/governance/api/governanceService/domain/proposalActionUpdatePluginMetadata';
import { type IDaoPluginMetadata } from '@/shared/api/daoService';
import { zeroAddress } from 'viem';
import {
    type IProposalAction,
    type IProposalActionUpdateMetadata,
    ProposalActionType,
} from '../../api/governanceService';

export enum ActionGroupId {
    OSX = 'OSX',
}

export const defaultTransferAction: IProposalAction = {
    type: ProposalActionType.TRANSFER,
    from: '',
    to: zeroAddress,
    data: '0x',
    value: '0',
    inputData: { function: 'transfer', contract: 'Ether', parameters: [] },
};

export const defaultUpdateMetadata = (metadata: IDaoPluginMetadata): IProposalActionUpdatePluginMetadata => ({
    type: ProposalActionType.METADATA_UPDATE,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    proposedMetadata: metadata,
    inputData: {
        function: 'setMetadata',
        contract: '',
        parameters: [
            {
                name: '_metadata',
                type: 'bytes',
                notice: 'The IPFS hash of the new metadata object',
                value: '',
            },
        ],
    },
});

export const defaultMetadataAction: Omit<
    IProposalActionUpdateMetadata,
    'to' | 'existingMetadata' | 'proposedMetadata'
> = {
    type: ProposalActionType.METADATA_UPDATE,
    from: '',
    data: '0x',
    value: '0',
    inputData: {
        function: 'setMetadata',
        contract: 'DAO',
        parameters: [
            {
                name: '_metadata',
                type: 'bytes',
                value: '',
                notice: 'The IPFS hash of the new metadata object',
            },
        ],
    },
};
