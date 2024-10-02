import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';

export interface IDaoGovernanceInfoProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * DAO plugin to display the governance info for. Renders the info for all DAO plugins when not set.
     */
    plugin?: IDaoPlugin;
}

export const DaoGovernanceInfo: React.FC<IDaoGovernanceInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const daoPlugins = useDaoPlugins({ daoId, pluginAddress: plugin?.address })!;
    const processedPlugins = daoPlugins.map((plugin) => ({ ...plugin, props: { plugin: plugin.meta } }));

    return (
        <PluginTabComponent slotId={SettingsSlotId.SETTINGS_GOVERNANCE_INFO} plugins={processedPlugins} daoId={daoId} />
    );
};
