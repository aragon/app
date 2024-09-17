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
    to: '',
    data: '0x',
    value: '0',
    inputData: { function: 'transfer', contract: '', parameters: [] },
};

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
                value: 'The IPFS hash of the new metadata object',
            },
        ],
    },
};
