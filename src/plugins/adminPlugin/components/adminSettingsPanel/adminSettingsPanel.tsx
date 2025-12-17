'use client';

import { Card, IconType } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
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
        <Page.MainSection icon={IconType.WARNING} title={t('app.plugins.admin.adminSettingsPanel.title')}>
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
