import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreatePolicyDetailsDialog } from '../dialogs/createPolicyDetailsDialog';
import { SetupStrategyDialog } from '../dialogs/setupStrategyDialog';
import { CapitalFlowDialogId } from './capitalFlowDialogId';

export const capitalFlowDialogsDefinitions: Record<CapitalFlowDialogId, IDialogComponentDefinitions> = {
    [CapitalFlowDialogId.CREATE_POLICY_DETAILS]: { Component: CreatePolicyDetailsDialog, size: 'lg' },
    [CapitalFlowDialogId.SETUP_STRATEGY]: {
        Component: SetupStrategyDialog,
        size: 'xl',
        hiddenDescription: 'app.capitalFlow.setupStrategyDialog.a11y.description',
    },
};
