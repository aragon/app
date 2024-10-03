import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';

export interface ICreateProposalFormSettingsProps {
    /**
     * The ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
}

export const CreateProposalFormSettings: React.FC<ICreateProposalFormSettingsProps> = (props) => {
    const { daoId, pluginAddress } = props;

    const daoPlugin = useDaoPlugins({ daoId, pluginAddress })![0];

    return (
        <PluginSingleComponent
            slotId={GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM}
            pluginId={daoPlugin.id}
            plugin={daoPlugin.meta}
        />
    );
};
