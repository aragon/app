import { useWatch } from 'react-hook-form';
import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogMembershipProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const SetupBodyDialogMembership: React.FC<ISetupBodyDialogMembershipProps> = (props) => {
    const selectedPlugin = useWatch<Record<string, ISetupBodyForm['plugin']>>({ name: 'plugin' });
    const { daoId } = props;

    return (
        <PluginSingleComponent
            daoId={daoId}
            formPrefix="membership"
            pluginId={selectedPlugin}
            slotId={CreateDaoSlotId.CREATE_DAO_SETUP_MEMBERSHIP}
        />
    );
};
