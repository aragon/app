import type { IDaoPlugin } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/gov-ui-kit';
import { useTokenGovernanceSettings } from '../../hooks/useTokenGovernanceSettings';
import type { ITokenPluginSettings } from '../../types';

export interface ITokenGovernanceInfoProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * DAO plugin to display the governance info for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenGovernanceInfo: React.FC<ITokenGovernanceInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const { t } = useTranslations();

    const settings = useTokenGovernanceSettings({ daoId, settings: plugin.settings, pluginAddress: plugin.address });

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
