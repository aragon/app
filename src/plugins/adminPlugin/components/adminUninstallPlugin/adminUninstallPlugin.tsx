import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { Button } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { AdminUninstallProcessDialogCreate } from './dialogs/adminUninstallProcessDialogCreate';
import { AdminUninstallProcessDialogSelect } from './dialogs/adminUninstallProcessDialogSelect';

export interface IAdminUninstallPluginProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminUninstallPlugin: React.FC<IAdminUninstallPluginProps> = (props) => {
    const { daoId } = props;
    const [openDialog, setOpenDialog] = useState<'create' | 'select' | null>(null);

    const { t } = useTranslations();

    const daoPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS })!;
    const adminPlugin = daoPlugins.find((plugin) => plugin.id === 'admin')!.meta;

    const handleOpenDialog = () => {
        setOpenDialog(daoPlugins.length > 1 ? 'select' : 'create');
    };

    const handleCloseDialog = () => {
        setOpenDialog(null);
    };

    return (
        <>
            <Button size="md" variant="critical" onClick={() => handleOpenDialog()}>
                {t('app.plugins.admin.adminUninstallPlugin.label')}
            </Button>
            <AdminUninstallProcessDialogCreate
                daoId={daoId}
                adminPlugin={adminPlugin}
                open={openDialog === 'create'}
                onClose={handleCloseDialog}
            />
            <AdminUninstallProcessDialogSelect
                daoId={daoId}
                adminPlugin={adminPlugin}
                open={openDialog === 'select'}
                onClose={handleCloseDialog}
            />
        </>
    );
};
