import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';

export interface ICreateProcessFormSettingsProps {
    /**
     * The ID of the DAO.
     */
    daoId: string;
}

export const CreateProcessFormSettings: React.FC<ICreateProcessFormSettingsProps> = (props) => {
    const { daoId } = props;

    const pluginIds = useDaoPluginIds(daoId);

    return (
        <PluginComponent
            slotId={GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM}
            pluginIds={pluginIds}
            daoId={daoId}
        />
    );
};
