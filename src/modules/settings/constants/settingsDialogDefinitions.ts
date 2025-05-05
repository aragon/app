import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { UpdateContractsDialog } from '../dialogs/updateContractsDialog';
import { SettingsDialogId } from './settingsDialogId';

export const settingsDialogDefinitions: Record<SettingsDialogId, IDialogComponentDefinitions> = {
    [SettingsDialogId.UPDATE_CONTRACTS]: { Component: UpdateContractsDialog, size: 'lg' },
};
