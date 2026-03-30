import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CapitalFlowDialogId } from './capitalFlowDialogId';

export const capitalFlowDialogsDefinitions: Record<
    CapitalFlowDialogId,
    IDialogComponentDefinitions
> = {
    [CapitalFlowDialogId.CREATE_POLICY_DETAILS]: {
        Component: dynamic(() =>
            import('../dialogs/createPolicyDetailsDialog').then(
                (m) => m.CreatePolicyDetailsDialog,
            ),
        ),
        size: 'lg',
    },
    [CapitalFlowDialogId.SETUP_STRATEGY]: {
        Component: dynamic(() =>
            import('../dialogs/setupStrategyDialog').then(
                (m) => m.SetupStrategyDialog,
            ),
        ),
        size: 'xl',
        hiddenDescription:
            'app.capitalFlow.setupStrategyDialog.a11y.description',
    },
    [CapitalFlowDialogId.PREPARE_POLICY]: {
        Component: dynamic(() =>
            import('../dialogs/preparePolicyDialog').then(
                (m) => m.PreparePolicyDialog,
            ),
        ),
    },
    [CapitalFlowDialogId.ROUTER_SELECTOR]: {
        Component: dynamic(() =>
            import('../dialogs/routerSelectorDialog').then(
                (m) => m.RouterSelectorDialog,
            ),
        ),
        size: 'lg',
    },
    [CapitalFlowDialogId.DISPATCH]: {
        Component: dynamic(() =>
            import('../dialogs/dispatchDialog').then((m) => m.DispatchDialog),
        ),
        size: 'lg',
    },
    [CapitalFlowDialogId.DISPATCH_SIMULATION]: {
        Component: dynamic(() =>
            import('../dialogs/dispatchDialog').then(
                (m) => m.DispatchSimulationDialog,
            ),
        ),
        size: 'lg',
    },
    [CapitalFlowDialogId.DISPATCH_TRANSACTION]: {
        Component: dynamic(() =>
            import('../dialogs/dispatchDialog').then(
                (m) => m.DispatchTransactionDialog,
            ),
        ),
        size: 'lg',
    },
};
