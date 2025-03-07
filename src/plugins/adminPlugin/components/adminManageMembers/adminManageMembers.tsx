import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { AdminManageMembersDialog } from './adminManageMembersDialog';

export interface IAdminMangeMembersProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminManageMembers: React.FC<IAdminMangeMembersProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const [isManageMembersDialogOpen, setIsManageMembersDialogOpen] = useState(false);

    const [adminPlugin] = useDaoPlugins({ daoId, subdomain: 'admin' })!;

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: () => setIsManageMembersDialogOpen(true),
        plugin: adminPlugin.meta,
        daoId,
    });

    const handleManageAdminsClick = () =>
        canCreateProposal ? setIsManageMembersDialogOpen(true) : createProposalGuard();

    return (
        <>
            <Button onClick={handleManageAdminsClick} size="md" variant="secondary">
                {t('app.plugins.admin.adminManageMembers.button')}
            </Button>
            <AdminManageMembersDialog
                open={isManageMembersDialogOpen}
                onOpenChange={setIsManageMembersDialogOpen}
                daoId={daoId}
                pluginAddress={adminPlugin.meta.address}
            />
        </>
    );
};
