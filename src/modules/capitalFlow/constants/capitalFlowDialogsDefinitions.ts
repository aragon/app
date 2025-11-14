import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreatePolicyDetailsDialog } from '../dialogs/createPolicyDetailsDialog';
import { CapitalFlowDialogId } from './capitalFlowDialogId';

export const capitalFlowDialogsDefinitions: Record<CapitalFlowDialogId, IDialogComponentDefinitions> = {
    [CapitalFlowDialogId.CREATE_POLICY_DETAILS]: { Component: CreatePolicyDetailsDialog, size: 'lg' },
};
