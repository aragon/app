import { useAdminStatus } from '@/plugins/adminPlugin/hooks/useAdminStatus';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Card, IconType } from '@aragon/gov-ui-kit';
import { AdminGovernanceInfo } from '../adminGovernanceInfo';
import { AdminUninstallPlugin } from '../adminUninstallPlugin';

export interface IAdminSettingsPanelProps {
    /**
     * ID of the DAO.
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
            <Card className="flex flex-col gap-y-4 p-6">
                <AdminGovernanceInfo />
                <div className="flex w-full justify-between">
                    <Button size="md" variant="secondary">
                        Manage admins
                    </Button>
                    <AdminUninstallPlugin daoId={daoId} />
                </div>
            </Card>
        </Page.MainSection>
    );
};
