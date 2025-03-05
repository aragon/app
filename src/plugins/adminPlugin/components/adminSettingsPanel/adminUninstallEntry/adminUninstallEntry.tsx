import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { Button } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { UninstallCreateProcessDialog } from '../dialogs/uninstallCreateProcessDialog';
import { UninstallSelectProcessDialog } from '../dialogs/uninstallSelectProcessDialog';

export interface IAdminUninstallEntryProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminUninstallEntry: React.FC<IAdminUninstallEntryProps> = (props) => {
    const { daoId } = props;
    const [openDialog, setOpenDialog] = useState<'create' | 'select' | null>(null);

    const { t } = useTranslations();

    const daoPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS, includeSubPlugins: false })!;
    const adminMeta = daoPlugins.find((plugin) => plugin.id === 'admin')!.meta;

    const handleOpenDialog = () => {
        setOpenDialog(daoPlugins.length > 1 ? 'select' : 'create');
    };

    const handleCloseDialog = () => {
        setOpenDialog(null);
    };

    return (
        <>
            <Button size="md" variant="critical" onClick={() => handleOpenDialog()}>
                {t('app.plugins.admin.adminSettingsPanel.adminUninstallEntry.label')}
            </Button>
            <UninstallCreateProcessDialog
                daoId={daoId}
                adminMeta={adminMeta}
                isOpen={openDialog === 'create'}
                onClose={handleCloseDialog}
            />
            <UninstallSelectProcessDialog
                daoId={daoId}
                adminMeta={adminMeta}
                isOpen={openDialog === 'select'}
                onClose={handleCloseDialog}
            />
        </>
    );
};
