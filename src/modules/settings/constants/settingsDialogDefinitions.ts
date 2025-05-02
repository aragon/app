import type { IDialogComponentDefinitions } from "@/shared/components/dialogProvider";
import { SettingsDialogId } from "./settingsDialogId";
import { UpdateContractsDialog } from "../dialogs/updateContractsDialog";

export const settingsDialogDefinitions: Record<SettingsDialogId, IDialogComponentDefinitions> = {
  [SettingsDialogId.UPDATE_CONTRACTS]: { Component: UpdateContractsDialog, size: 'lg'}
}
