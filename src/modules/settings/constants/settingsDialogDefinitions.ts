import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GovernanceProcessRequiredDialog } from '../dialogs/governanceProcessRequiredDialog';
import { PrepareDaoContractsUpdateDialog } from '../dialogs/prepareDaoContractsUpdateDialog';
import { PreparePluginUninstallationDialog } from '../dialogs/preparePluginUninstallationDialog';
import { UninstallProcessAlertDialog } from '../dialogs/uninstallProcessAlertDialog';
import { UpdateDaoContractsListDialog } from '../dialogs/updateDaoContractsListDialog';
import { SettingsDialogId } from './settingsDialogId';

export const settingsDialogDefinitions: Record<SettingsDialogId, IDialogComponentDefinitions> = {
    [SettingsDialogId.UPDATE_DAO_CONTRACTS_LIST]: { Component: UpdateDaoContractsListDialog, size: 'lg' },
    [SettingsDialogId.PREPARE_DAO_CONTRACTS_UPDATE]: { Component: PrepareDaoContractsUpdateDialog },
    [SettingsDialogId.GOVERNANCE_PROCESS_REQUIRED]: {
        Component: GovernanceProcessRequiredDialog,
        size: 'lg',
        hiddenDescription: 'app.settings.governanceProcessRequiredDialog.a11y.description',
    },
    [SettingsDialogId.UNINSTALL_PROCESS_ALERT]: {
        Component: UninstallProcessAlertDialog,
        size: 'lg',
        hiddenDescription: 'app.settings.uninstallProcessDialog.a11y.description',
        variant: 'critical',
    },
    [SettingsDialogId.PREPARE_PLUGIN_UNINSTALLATION]: { Component: PreparePluginUninstallationDialog },
};
