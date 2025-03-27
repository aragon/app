import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useWatch } from 'react-hook-form';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogGovernanceProps {}

export const SetupBodyDialogGovernance: React.FC<ISetupBodyDialogGovernanceProps> = () => {
    const selectedPlugin = useWatch<Record<string, ISetupBodyForm['plugin']>>({ name: 'plugin' });

    return (
        <PluginSingleComponent
            slotId={CreateDaoSlotId.CREATE_DAO_SETUP_GOVERNANCE}
            pluginId={selectedPlugin}
            formPrefix="governance"
            isSubPlugin={true}
            showProposalCreationSettings={false}
            // TODO: to be removed, pass the body.membership generic field instead
            token={{ symbol: 'test', decimals: 18, totalSupply: 100 }}
            membersCount={3}
        />
    );
};
