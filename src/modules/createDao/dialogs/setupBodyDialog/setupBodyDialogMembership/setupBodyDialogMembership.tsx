import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useWatch } from 'react-hook-form';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogMembershipProps {}

export const SetupBodyDialogMemberhip: React.FC<ISetupBodyDialogMembershipProps> = () => {
    const selectedPlugin = useWatch<Record<string, ISetupBodyForm['plugin']>>({ name: 'plugin' });

    return (
        <PluginSingleComponent
            slotId={CreateDaoSlotId.CREATE_DAO_SETUP_MEMBERSHIP}
            pluginId={selectedPlugin}
            formPrefix="membership"
        />
    );
};
