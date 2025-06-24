'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Card, IconType } from '@aragon/gov-ui-kit';
import { AdminGovernanceInfo } from '../adminGovernanceInfo';
import { AdminManageMembers } from './components/adminManageMembers';
import { AdminUninstallPlugin } from './components/adminUninstallPlugin';

export interface IAdminSettingsPanelProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminSettingsPanel: React.FC<IAdminSettingsPanelProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    return (
        <Page.MainSection title={t('app.plugins.admin.adminSettingsPanel.title')} icon={IconType.WARNING}>
            <Card className="flex flex-col gap-4 p-6">
                <AdminGovernanceInfo />
                <div className="flex items-center justify-between">
                    <AdminManageMembers daoId={daoId} />
                    <AdminUninstallPlugin daoId={daoId} />
                </div>
            </Card>
        </Page.MainSection>
    );
};
