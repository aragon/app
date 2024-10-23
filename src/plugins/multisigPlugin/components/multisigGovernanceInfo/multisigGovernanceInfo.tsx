import type { IDaoPlugin } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
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

    const { t } = useTranslations();

    const settings = useMultisigGovernanceSettings({ daoId, settings: plugin.settings, pluginAddress: plugin.address });

    return (
        <Page.Section title={t('app.governance.daoProposalsPage.aside.settings.title')} inset={false}>
            <DefinitionList.Container>
                {settings.map((governanceSetting, index) => (
                    <DefinitionList.Item key={index} term={governanceSetting.term}>
                        <p className="text-neutral-500">{governanceSetting.definition}</p>
                    </DefinitionList.Item>
                ))}
            </DefinitionList.Container>
        </Page.Section>
    );
};
