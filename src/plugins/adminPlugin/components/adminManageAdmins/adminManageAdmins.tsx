import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { AdminManageAdminsDialog } from './adminManageAdminsDialog';

export interface IAdminMangeAdminsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminMangeAdmins: React.FC<IAdminMangeAdminsProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const [isManageAdminsDialogOpen, setIsManageAdminsDialogOpen] = useState(false);

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

    return (
        <>
            <Button onClick={handleManageAdminsClick} size="md" variant="secondary">
                {t('app.plugins.admin.adminSettingsPanel.buttons.manage')}
            </Button>
            <AdminManageAdminsDialog
                open={isManageAdminsDialogOpen}
                onOpenChange={setIsManageAdminsDialogOpen}
                daoId={daoId}
                pluginAddress={adminPlugin.meta.address}
            />
        </>
    );
};
