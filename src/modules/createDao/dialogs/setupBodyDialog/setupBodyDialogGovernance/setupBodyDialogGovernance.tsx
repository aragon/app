import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useWatch } from 'react-hook-form';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogGovernanceProps {}

export const SetupBodyDialogGovernance: React.FC<ISetupBodyDialogGovernanceProps> = () => {
    const selectedPlugin = useWatch<Record<string, ISetupBodyForm['plugin']>>({ name: 'plugin' });

    const membershipSettings = useWatch<Record<string, ISetupBodyForm['membership']>>({ name: 'membership' });

    return (
        <PluginSingleComponent
            slotId={CreateDaoSlotId.CREATE_DAO_SETUP_GOVERNANCE}
            pluginId={selectedPlugin}
            formPrefix="governance"
            isSubPlugin={true}
            showProposalCreationSettings={false}
            membershipSettings={membershipSettings}
        />
    );
};
