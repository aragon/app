import { useAdminStatus } from '@/plugins/adminPlugin/hooks/useAdminStatus';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Card, IconType } from '@aragon/gov-ui-kit';
import { AdminGovernanceInfo } from '../adminGovernanceInfo';

export interface IAdminSettingsPanelProps {
    /**
     * ID of the Dao
     */
    daoId: string;
}

export const AdminSettingsPanel: React.FC<IAdminSettingsPanelProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const { hasAdminPlugin } = useAdminStatus({ daoId });

    if (!hasAdminPlugin) {
        return null;
    }

    return (
        <Page.MainSection title={t('app.plugins.admin.adminSettingsPanel.title')} icon={IconType.WARNING}>
            <Card className="p-6">
                <AdminGovernanceInfo />
            </Card>
        </Page.MainSection>
    );
};
