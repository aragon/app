import type { IDaoPlugin } from '@/shared/api/daoService';
import { DefinitionList } from '@aragon/gov-ui-kit';
import { useMultisigGovernanceSettings } from '../../hooks/useMultisigGovernanceSettings';
import type { IMultisigPluginSettings } from '../../types';

export interface IMultisigGovernanceInfoProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * DAO plugin to display the governance info for.
     */
    plugin: IDaoPlugin<IMultisigPluginSettings>;
}

export const MultisigGovernanceInfo: React.FC<IMultisigGovernanceInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const settings = useMultisigGovernanceSettings({ daoId, settings: plugin.settings, pluginAddress: plugin.address });

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
