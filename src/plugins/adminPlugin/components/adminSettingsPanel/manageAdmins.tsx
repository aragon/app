import { useMemo, useState } from "react";
import { ManageAdminsDialog } from "../../dialogs/manageAdminsDialog";
import { Button } from "@aragon/gov-ui-kit";
import { useTranslations } from "@/shared/components/translationsProvider";
import { useDaoPlugins } from "@/shared/hooks/useDaoPlugins";
import { useMemberList } from "@/modules/governance/api/governanceService";
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';

export interface IManageAdminsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const ManageAdmins: React.FC<IManageAdminsProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const [isManageAdminsDialogOpen, setIsManageAdminsDialogOpen] = useState(false);

    const [adminPlugin] = useDaoPlugins({ daoId, subdomain: 'admin' })!;

    const memberParams = { daoId, pluginAddress: adminPlugin.meta.address };
    const { data: memberList } = useMemberList({ queryParams: memberParams });

    const allMembers = useMemo(() => {
        return memberList?.pages.flatMap((page) => page.data);
    }, [memberList]);

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
                {t('app.plugins.admin.manageAdmins.manage')}
            </Button>
            <ManageAdminsDialog
                open={isManageAdminsDialogOpen}
                onOpenChange={setIsManageAdminsDialogOpen}
                currentAdmins={allMembers ?? []}
            />
        </>
    );
};
