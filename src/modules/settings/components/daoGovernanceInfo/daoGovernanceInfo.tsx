import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';

export interface IDaoGovernanceInfoProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * DAO plugin to display the governance info for.
     */
    plugin: IDaoPlugin;
}

export const DaoGovernanceInfo: React.FC<IDaoGovernanceInfoProps> = (props) => {
    const { daoId, plugin } = props;

    return (
        <PluginSingleComponent
            slotId={SettingsSlotId.SETTINGS_GOVERNANCE_INFO}
            pluginId={plugin.subdomain}
            daoId={daoId}
            plugin={plugin}
        />
    );
};
