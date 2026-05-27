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
    // The three dispatch dialogs all advertise `hiddenTitle` + `hiddenDescription`
    // so Radix never warns about a missing `DialogTitle` while the dialog
    // shell is mounted but the inner component is still resolving (e.g.
    // `DispatchTransactionDialog` returns `null` while the LMM manifest
    // loads).  Once the inner component renders its own visible `Dialog.Header`,
    // Radix prefers that one and the hidden values are inert.
    [CapitalFlowDialogId.DISPATCH]: {
        Component: DispatchDialog,
        size: 'lg',
        hiddenTitle: 'app.capitalFlow.dispatchDialog.a11y.title',
        hiddenDescription: 'app.capitalFlow.dispatchDialog.a11y.description',
    },
    [CapitalFlowDialogId.DISPATCH_SIMULATION]: {
        Component: DispatchSimulationDialog,
        size: 'lg',
        hiddenTitle: 'app.capitalFlow.dispatchSimulationDialog.a11y.title',
        hiddenDescription:
            'app.capitalFlow.dispatchSimulationDialog.a11y.description',
    },
    [CapitalFlowDialogId.DISPATCH_TRANSACTION]: {
        Component: DispatchTransactionDialog,
        size: 'lg',
        hiddenTitle: 'app.capitalFlow.dispatchTransactionDialog.a11y.title',
        hiddenDescription:
            'app.capitalFlow.dispatchTransactionDialog.a11y.description',
    },
};
