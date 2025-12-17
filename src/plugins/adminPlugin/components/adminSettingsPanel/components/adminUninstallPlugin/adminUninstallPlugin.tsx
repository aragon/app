import { Button } from '@aragon/gov-ui-kit';
import { SettingsDialogId } from '@/modules/settings/constants/settingsDialogId';
import type { IGovernanceProcessRequiredDialogParams } from '@/modules/settings/dialogs/governanceProcessRequiredDialog';
import type { IUninstallPluginAlertDialogParams } from '@/modules/settings/dialogs/uninstallPluginAlertDialog';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';

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

    const processPlugins = useDaoPlugins({
        daoId,
        type: PluginType.PROCESS,
        hasExecute: true,
    })!;
    const adminPlugin = useDaoPlugins({
        daoId,
        interfaceType: PluginInterfaceType.ADMIN,
    })![0]?.meta;

    const handleOpenDialog = () => {
        if (processPlugins.length > 1) {
            const params: IUninstallPluginAlertDialogParams = {
                daoId,
                uninstallPlugin: adminPlugin,
            };
            open(SettingsDialogId.UNINSTALL_PLUGIN_ALERT, { params });
        } else {
            const dialogTitle = t('app.plugins.admin.adminUninstallPlugin.fallbackDialogTitle');
            const params: IGovernanceProcessRequiredDialogParams = {
                daoId,
                plugin: adminPlugin,
                title: dialogTitle,
            };
            open(SettingsDialogId.GOVERNANCE_PROCESS_REQUIRED, { params });
        }
    };

    return (
        <Button onClick={() => handleOpenDialog()} size="md" variant="critical">
            {t('app.plugins.admin.adminUninstallPlugin.label')}
        </Button>
    );
};
