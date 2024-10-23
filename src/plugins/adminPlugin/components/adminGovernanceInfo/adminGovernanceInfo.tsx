import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/gov-ui-kit';
import { useAdminGovernanceSettings } from '../../hooks/useAdminGovernanceSettings';

export interface IAdminGovernanceInfoProps {}

export const AdminGovernanceInfo: React.FC<IAdminGovernanceInfoProps> = () => {
    const settings = useAdminGovernanceSettings();

    const { t } = useTranslations();

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
