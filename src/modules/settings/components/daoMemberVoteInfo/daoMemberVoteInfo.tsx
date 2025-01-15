import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';

export interface IDaoMemberVoteInfoProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * DAO plugin to display the member vote info for. Renders the info for all DAO plugins when not set.
     */
    plugin?: IDaoPlugin;
}

export const DaoMemberVoteInfo: React.FC<IDaoMemberVoteInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const daoPlugins = useDaoPlugins({ daoId, pluginAddress: plugin?.address, type: PluginType.PROCESS })!;
    const processedPlugins = daoPlugins.map((plugin) => ({ ...plugin, props: { plugin: plugin.meta } }));

    return (
        <PluginTabComponent slotId={SettingsSlotId.SETTINGS_GOVERNANCE_INFO} plugins={processedPlugins} daoId={daoId} />
    );
};
