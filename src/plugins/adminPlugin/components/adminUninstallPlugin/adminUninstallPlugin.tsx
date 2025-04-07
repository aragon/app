import { AdminPluginDialog } from '@/plugins/adminPlugin/constants/pluginDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { Button } from '@aragon/gov-ui-kit';
import { IAdminUninstallProcessDialogCreateParams } from './dialogs/adminUninstallProcessDialogCreate';
import { IAdminUninstallProcessDialogSelectParams } from './dialogs/adminUninstallProcessDialogSelect';

export interface IAdminUninstallPluginProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const AdminUninstallPlugin: React.FC<IAdminUninstallPluginProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const daoPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS })!;
    const adminPlugin = daoPlugins.find((plugin) => plugin.id === 'admin')!.meta;

    const handleOpenDialog = () => {
        if (daoPlugins.length > 1) {
            const params: IAdminUninstallProcessDialogSelectParams = {
                daoId,
                adminPlugin,
            };
            open(AdminPluginDialog.UNINSTALL_PROCESS_SELECT, { params, disableOutsideClick: true });
            return;
        }

        const params: IAdminUninstallProcessDialogCreateParams = {
            daoId,
            adminPlugin,
        };
        open(AdminPluginDialog.UNINSTALL_PROCESS_CREATE, { params, disableOutsideClick: true });
    };

    return (
        <Button size="md" variant="critical" onClick={() => handleOpenDialog()}>
            {t('app.plugins.admin.adminUninstallPlugin.label')}
        </Button>
    );
};
