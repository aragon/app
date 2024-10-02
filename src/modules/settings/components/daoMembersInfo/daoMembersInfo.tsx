import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';

export interface IDaoMembersInfoProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Plugin to display the info for.
     */
    plugin: IDaoPlugin;
}

export const DaoMembersInfo: React.FC<IDaoMembersInfoProps> = (props) => {
    const { daoId, plugin } = props;

    return (
        <PluginSingleComponent
            slotId={SettingsSlotId.SETTINGS_MEMBERS_INFO}
            pluginId={plugin.subdomain}
            daoId={daoId}
            pluginAddress={plugin.address}
        />
    );
};
