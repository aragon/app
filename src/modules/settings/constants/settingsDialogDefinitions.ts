import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PrepareDaoContractsUpdateDialog } from '../dialogs/prepareDaoContractsUpdateDialog';
import { UpdateDaoContractsListDialog } from '../dialogs/updateDaoContractsListDialog';
import { SettingsDialogId } from './settingsDialogId';

export const settingsDialogDefinitions: Record<SettingsDialogId, IDialogComponentDefinitions> = {
    [SettingsDialogId.UPDATE_DAO_CONTRACTS_LIST]: { Component: UpdateDaoContractsListDialog, size: 'lg' },
    [SettingsDialogId.PREPARE_DAO_CONTRACTS_UPDATE]: { Component: PrepareDaoContractsUpdateDialog },
};
