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

export const defaultMintAction: IProposalAction = {
    type: ProposalActionType.TOKEN_MINT,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    inputData: {
        function: 'mint',
        contract: 'GovernanceERC20',
        parameters: [
            { name: 'address', type: 'string', value: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE' },
            { name: 'tokenAmount', type: 'string', value: '2000000000000000000' },
        ],
    },
};
