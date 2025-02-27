import { useMemo, useState } from "react";
import { ManageAdminsDialog } from "../../dialogs/manageAdminsDialog";
import { Button } from "@aragon/gov-ui-kit";
import { useTranslations } from "@/shared/components/translationsProvider";
import { useDaoPlugins } from "@/shared/hooks/useDaoPlugins";
import { useMemberList } from "@/modules/governance/api/governanceService";

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

  const [adminPlugin] = useDaoPlugins({ daoId, subdomain: 'admin' }) ?? [];

      const memberParams = { daoId, pluginAddress: adminPlugin.meta.address };
      const { data: memberList } = useMemberList({ queryParams: memberParams });

    const allMembers = useMemo(() => {
                return memberList?.pages.flatMap(page => page.data);
    }, [memberList]);

  return (
    <>
      <Button onClick={() => setIsManageAdminsDialogOpen(true)} size="md" variant="secondary">
        {t('app.plugins.admin.manageAdmins.manage')}
      </Button>
      <ManageAdminsDialog
        open={isManageAdminsDialogOpen}
        onOpenChange={setIsManageAdminsDialogOpen}
        currentAdmins={allMembers ?? []}
        pluginAddress={adminPlugin.meta.address}
      />
    </>
  )
};
