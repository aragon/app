import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';

export interface ICreateProposalFormSettingsProps {
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const CreateProposalFormSettings: React.FC<ICreateProposalFormSettingsProps> = ({ daoId }) => {
    const pluginIds = useDaoPluginIds(daoId);

    return (
        <PluginComponent
            slotId={GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM}
            pluginIds={pluginIds}
            daoId={daoId}
        />
    );
};
