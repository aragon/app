import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { DefinitionList } from '@aragon/ods';

export interface IDaoGovernanceInfoProps {
    /**
     * ID of the Dao
     */
    daoId: string;
}

export const DaoGovernanceInfo: React.FC<IDaoGovernanceInfoProps> = (props) => {
    const { daoId } = props;

    const pluginIds = useDaoPluginIds(daoId);
    const governanceParams = { daoId: daoId };
    const governanceSettings = useSlotFunction<IDaoSettingTermAndDefinition[]>({
        params: governanceParams,
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginIds,
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
