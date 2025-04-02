import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useWatch } from 'react-hook-form';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogMembershipProps {
    /**
     * ID of the DAO to fetch the members from.
     */
    daoId: string;
}

export const SetupBodyDialogMemberhip: React.FC<ISetupBodyDialogMembershipProps> = (props) => {
    const selectedPlugin = useWatch<Record<string, ISetupBodyForm['plugin']>>({ name: 'plugin' });
    const { daoId } = props;

    return (
        <PluginSingleComponent
            slotId={CreateDaoSlotId.CREATE_DAO_SETUP_MEMBERSHIP}
            pluginId={selectedPlugin}
            formPrefix="membership"
            daoId={daoId}
        />
    );
};
