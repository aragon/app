import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreatePolicyDetailsDialog } from '../dialogs/createPolicyDetailsDialog';
import {
    DispatchDialog,
    DispatchSimulationDialog,
    DispatchTransactionDialog,
} from '../dialogs/dispatchDialog';
import { PreparePolicyDialog } from '../dialogs/preparePolicyDialog';
import { RouterSelectorDialog } from '../dialogs/routerSelectorDialog';
import { SetupStrategyDialog } from '../dialogs/setupStrategyDialog';
import { CapitalFlowDialogId } from './capitalFlowDialogId';

export const capitalFlowDialogsDefinitions: Record<
    CapitalFlowDialogId,
    IDialogComponentDefinitions
> = {
    [CapitalFlowDialogId.CREATE_POLICY_DETAILS]: {
        Component: CreatePolicyDetailsDialog,
        size: 'lg',
    },
    [CapitalFlowDialogId.SETUP_STRATEGY]: {
        Component: SetupStrategyDialog,
        size: 'xl',
        hiddenDescription:
            'app.capitalFlow.setupStrategyDialog.a11y.description',
    },
    [CapitalFlowDialogId.PREPARE_POLICY]: { Component: PreparePolicyDialog },
    [CapitalFlowDialogId.ROUTER_SELECTOR]: {
        Component: RouterSelectorDialog,
        size: 'lg',
    },
    [CapitalFlowDialogId.DISPATCH]: { Component: DispatchDialog, size: 'lg' },
    [CapitalFlowDialogId.DISPATCH_SIMULATION]: {
        Component: DispatchSimulationDialog,
        size: 'lg',
    },
    [CapitalFlowDialogId.DISPATCH_TRANSACTION]: {
        Component: DispatchTransactionDialog,
        size: 'lg',
    },
};
