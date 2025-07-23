import { AdminPluginDialogId } from '@/plugins/adminPlugin/constants/adminPluginDialogId';
import type { IAdminUninstallProcessDialogCreateParams } from '@/plugins/adminPlugin/dialogs/adminUninstallProcessDialogCreate';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { Button } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { AdminUninstallProcessDialogSelect } from './dialogs/adminUninstallProcessDialogSelect';

export interface IAdminUninstallPluginProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminUninstallPlugin: React.FC<IAdminUninstallPluginProps> = (props) => {
    const { daoId } = props;

    const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const daoPluginsWithExecute = useDaoPlugins({
        daoId,
        type: PluginType.PROCESS,
        hasExecute: true,
    })!;
    const adminPlugin = useDaoPlugins({ daoId, interfaceType: PluginInterfaceType.ADMIN })![0]?.meta;

    const handleOpenDialog = () => {
        if (daoPluginsWithExecute.length > 1) {
            setIsSelectDialogOpen(true);
            return;
        }

        const params: IAdminUninstallProcessDialogCreateParams = {
            daoId,
            adminPlugin,
        };
        open(AdminPluginDialogId.UNINSTALL_PROCESS_CREATE, { params });
    };

    const handleCloseSelectDialog = () => {
        setIsSelectDialogOpen(false);
    };

    return (
        <>
            <Button size="md" variant="critical" onClick={() => handleOpenDialog()}>
                {t('app.plugins.admin.adminUninstallPlugin.label')}
            </Button>
            <AdminUninstallProcessDialogSelect
                daoId={daoId}
                adminPlugin={adminPlugin}
                open={isSelectDialogOpen}
                onClose={handleCloseSelectDialog}
            />
        </>
    );
};
