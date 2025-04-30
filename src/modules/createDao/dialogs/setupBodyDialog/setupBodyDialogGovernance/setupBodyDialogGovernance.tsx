import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useWatch } from 'react-hook-form';
import type { ISetupBodyForm, ISetupBodyFormNew } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogGovernanceProps {
    /**
     * Renders the correct governance settings depending if the plugin is setup as a sub-plugin or not.
     */
    isSubPlugin?: boolean;
}

export const SetupBodyDialogGovernance: React.FC<ISetupBodyDialogGovernanceProps> = (props) => {
    const { isSubPlugin } = props;

    const selectedPlugin = useWatch<Record<string, ISetupBodyForm['plugin']>>({ name: 'plugin' });

    const membershipSettings = useWatch<Record<string, ISetupBodyFormNew['membership']>>({ name: 'membership' });

    return (
        <PluginSingleComponent
            slotId={CreateDaoSlotId.CREATE_DAO_SETUP_GOVERNANCE}
            pluginId={selectedPlugin}
            formPrefix="governance"
            isSubPlugin={isSubPlugin}
            showProposalCreationSettings={false}
            membershipSettings={membershipSettings}
        />
    );
};
