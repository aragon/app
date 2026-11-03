import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { ChangeSettingsActionDetails } from './changeSettingsActionDetails';

export {
    ChangeSettingsActionDetails,
    type IChangeSettingsActionDetailsProps,
} from './changeSettingsActionDetails';

export const initChangeSettingsActionViews = () => {
    actionViewRegistry.register({
        actionType: ProposalActionType.CHANGE_SETTINGS,
        componentDetails: ChangeSettingsActionDetails,
    });
};
