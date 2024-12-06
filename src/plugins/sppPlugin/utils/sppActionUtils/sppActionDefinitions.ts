import { type IDaoPluginMetadata } from '@/shared/api/daoService';
import { SppProposalActionType } from '../../types';
import { type ISppActionUpdateMetadata } from '../../types/sppActionUpdateMetadata';

export const defaultUpdateMetadata = (metadata: IDaoPluginMetadata): ISppActionUpdateMetadata => ({
    type: SppProposalActionType.UPDATE_PLUGIN_METADATA,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    proposedMetadata: metadata,
    inputData: {
        function: 'updateMetadata',
        contract: '',
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
