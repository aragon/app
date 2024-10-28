import type { IDaoPlugin } from '@/shared/api/daoService';
import { DefinitionList } from '@aragon/gov-ui-kit';
import { useSppGovernanceSettings } from '../../hooks/useSppGovernanceSettings';
import type { ISppPluginSettings } from '../../types';

export interface ISppGovernanceInfoProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * DAO plugin to display the governance info for.
     */
    plugin: IDaoPlugin<ISppPluginSettings>;
}

export const SppGovernanceInfo: React.FC<ISppGovernanceInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const settings = useSppGovernanceSettings({ daoId, settings: plugin.settings, pluginAddress: plugin.address });

    return (
        <DefinitionList.Container>
            {settings.map((governanceSetting, index) => (
                <DefinitionList.Item key={index} term={governanceSetting.term}>
                    <p className="text-neutral-500">{governanceSetting.definition}</p>
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
