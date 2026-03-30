import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { SettingsDialogId } from './settingsDialogId';

export const settingsDialogDefinitions: Record<
    SettingsDialogId,
    IDialogComponentDefinitions
> = {
    [SettingsDialogId.UPDATE_DAO_CONTRACTS_LIST]: {
        Component: dynamic(() =>
            import('../dialogs/updateDaoContractsListDialog').then(
                (m) => m.UpdateDaoContractsListDialog,
            ),
        ),
        size: 'lg',
    },
    [SettingsDialogId.PREPARE_DAO_CONTRACTS_UPDATE]: {
        Component: dynamic(() =>
            import('../dialogs/prepareDaoContractsUpdateDialog').then(
                (m) => m.PrepareDaoContractsUpdateDialog,
            ),
        ),
    },
    [SettingsDialogId.GOVERNANCE_PROCESS_REQUIRED]: {
        Component: dynamic(() =>
            import('../dialogs/governanceProcessRequiredDialog').then(
                (m) => m.GovernanceProcessRequiredDialog,
            ),
        ),
        size: 'lg',
        hiddenDescription:
            'app.settings.governanceProcessRequiredDialog.a11y.description',
    },
    [SettingsDialogId.UNINSTALL_PLUGIN_ALERT]: {
        Component: dynamic(() =>
            import('../dialogs/uninstallPluginAlertDialog').then(
                (m) => m.UninstallPluginAlertDialog,
            ),
        ),
        size: 'lg',
        hiddenDescription:
            'app.settings.uninstallPluginAlertDialog.a11y.description',
        variant: 'critical',
    },
    [SettingsDialogId.PREPARE_PLUGIN_UNINSTALLATION]: {
        Component: dynamic(() =>
            import('../dialogs/preparePluginUninstallationDialog').then(
                (m) => m.PreparePluginUninstallationDialog,
            ),
        ),
    },
};
