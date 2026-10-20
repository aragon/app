import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { UpdateMetadataActionDetails } from './updateMetadataActionDetails';

export {
    type IUpdateMetadataActionDetailsProps,
    UpdateMetadataActionDetails,
} from './updateMetadataActionDetails';

export const initUpdateMetadataActionViews = () => {
    actionViewRegistry.register({
        actionType: ProposalActionType.METADATA_UPDATE,
        componentDetails: UpdateMetadataActionDetails,
    });
    actionViewRegistry.register({
        actionType: ProposalActionType.METADATA_PLUGIN_UPDATE,
        componentDetails: UpdateMetadataActionDetails,
    });
};
