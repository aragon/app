import { useAdminStatus } from '@/plugins/adminPlugin/hooks/useAdminStatus';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Card, IconType } from '@aragon/gov-ui-kit';
import { AdminGovernanceInfo } from '../adminGovernanceInfo';
import { useState } from 'react';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { ManageAdminsDialog } from './dialogs/manageAdminsDialog';

export interface IAdminSettingsPanelProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminSettingsPanel: React.FC<IAdminSettingsPanelProps> = (props) => {
    const { daoId } = props;
    const [isManageAdminsDialogOpen, setIsManageAdminsDialogOpen] = useState(false);

    const { t } = useTranslations();

    const { hasAdminPlugin } = useAdminStatus({ daoId });

    const [adminPlugin] = useDaoPlugins({ daoId, subdomain: 'admin' })!;

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: () => setIsManageAdminsDialogOpen(true),
        plugin: adminPlugin.meta,
        daoId,
    });

    const handleManageAdminsClick = () => {
        if (canCreateProposal) {
            setIsManageAdminsDialogOpen(true);
        } else {
            createProposalGuard();
        }
    };

    if (!hasAdminPlugin) {
        return null;
    }

    return (
        <Page.MainSection title={t('app.plugins.admin.adminSettingsPanel.title')} icon={IconType.WARNING}>
            <Card className="flex flex-col gap-4 p-6">
                <AdminGovernanceInfo />
                <div className="flex items-center justify-between">
                    <Button onClick={handleManageAdminsClick} size="md" variant="secondary">
                        {t('app.plugins.admin.adminSettingsPanel.buttons.manage')}
                    </Button>
                    <Button size="md" variant="critical">
                        {t('app.plugins.admin.adminSettingsPanel.buttons.remove')}
                    </Button>
                </div>
            </Card>
            <ManageAdminsDialog
                open={isManageAdminsDialogOpen}
                onOpenChange={setIsManageAdminsDialogOpen}
                daoId={daoId}
                pluginAddress={adminPlugin.meta.address}
            />
        </Page.MainSection>
    );
};
