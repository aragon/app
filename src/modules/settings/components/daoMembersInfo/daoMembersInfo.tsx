import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';

export interface IDaoMembersInfoProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * DAO plugin to display the governance info for. Renders the info for all DAO plugins when not set.
     */
    plugin?: IDaoPlugin;
}

export const daoMembersInfoFilterParam = 'membersInfo';

export const DaoMembersInfo: React.FC<IDaoMembersInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const daoPlugins = useDaoPlugins({
        daoId,
        pluginAddress: plugin?.address,
        type: PluginType.BODY,
        includeSubPlugins: true,
    })!;
    const processedPlugins = daoPlugins.map((plugin) => ({ ...plugin, props: { plugin: plugin.meta } }));

    return (
        <PluginTabComponent
            slotId={SettingsSlotId.SETTINGS_MEMBERS_INFO}
            plugins={processedPlugins}
            daoId={daoId}
            searchParamName={daoMembersInfoFilterParam}
        />
    );
};
