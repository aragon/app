import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { AdminPluginDialog } from '@/plugins/adminPlugin/constants/pluginDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button } from '@aragon/gov-ui-kit';
import type { IAdminManageMembersDialogParams } from '../../dialogs/adminManageMembersDialog/adminManageMembersDialog';

export interface IAdminMangeMembersProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminManageMembers: React.FC<IAdminMangeMembersProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const [adminPlugin] = useDaoPlugins({ daoId, subdomain: 'admin' })!;

    const openManageMembersDialog = () => {
        const params: IAdminManageMembersDialogParams = {
            daoId,
            pluginAddress: adminPlugin.meta.address,
        };
        open(AdminPluginDialog.MANAGE_MEMBERS, { params });
    };

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: openManageMembersDialog,
        plugin: adminPlugin.meta,
        daoId,
    });

    const handleManageAdminsClick = () => (canCreateProposal ? openManageMembersDialog() : createProposalGuard());

    return (
        <>
            <Button onClick={handleManageAdminsClick} size="md" variant="secondary">
                {t('app.plugins.admin.adminManageMembers.button')}
            </Button>
        </>
    );
};
