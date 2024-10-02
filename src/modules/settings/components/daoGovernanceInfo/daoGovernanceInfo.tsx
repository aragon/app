import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { DefinitionList } from '@aragon/ods';

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

    const governanceParams = { daoId: daoId, pluginAddress: plugin.address, settings: plugin.settings };

    const governanceSettings = useSlotSingleFunction<IDaoSettingTermAndDefinition[]>({
        params: governanceParams,
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: plugin.subdomain,
    });

    if (!governanceSettings) {
        return null;
    }

    return (
        <DefinitionList.Container>
            {governanceSettings.map((governanceSetting, index) => (
                <DefinitionList.Item key={index} term={governanceSetting.term}>
                    <p className="text-neutral-500">{governanceSetting.definition}</p>
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
