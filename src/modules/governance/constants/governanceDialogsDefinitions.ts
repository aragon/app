import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GovernanceDialogId } from './governanceDialogId';

export const governanceDialogsDefinitions: Record<
    GovernanceDialogId,
    IDialogComponentDefinitions
> = {
    [GovernanceDialogId.PUBLISH_PROPOSAL]: {
        Component: dynamic(() =>
            import('../dialogs/publishProposalDialog').then(
                (m) => m.PublishProposalDialog,
            ),
        ),
    },
    [GovernanceDialogId.EXECUTE]: {
        Component: dynamic(() =>
            import('../dialogs/executeDialog').then((m) => m.ExecuteDialog),
        ),
    },
    [GovernanceDialogId.VOTE]: {
        Component: dynamic(() =>
            import('../dialogs/voteDialog').then((m) => m.VoteDialog),
        ),
    },
    [GovernanceDialogId.SELECT_PLUGIN]: {
        Component: dynamic(() =>
            import('../dialogs/selectPluginDialog').then(
                (m) => m.SelectPluginDialog,
            ),
        ),
    },
    [GovernanceDialogId.VERIFY_SMART_CONTRACT]: {
        Component: dynamic(() =>
            import('../dialogs/verifySmartContractDialog').then(
                (m) => m.VerifySmartContractDialog,
            ),
        ),
        useFocusTrap: false,
    },
    [GovernanceDialogId.PERMISSION_CHECK]: {
        Component: dynamic(() =>
            import('../dialogs/permissionCheckDialog').then(
                (m) => m.PermissionCheckDialog,
            ),
        ),
        hiddenDescription:
            'app.governance.permissionCheckDialog.a11y.description',
    },
    [GovernanceDialogId.EXECUTE_CHECK]: {
        Component: dynamic(() =>
            import('../dialogs/executeCheckDialog').then(
                (m) => m.ExecuteCheckDialog,
            ),
        ),
        hiddenDescription: 'app.governance.executeCheckDialog.a11y.description',
    },
    [GovernanceDialogId.WALLET_CONNECT_ACTION]: {
        Component: dynamic(() =>
            import('../dialogs/walletConnectActionDialog').then(
                (m) => m.WalletConnectActionDialog,
            ),
        ),
    },
    [GovernanceDialogId.SIMULATE_ACTIONS]: {
        Component: dynamic(() =>
            import('../dialogs/simulateActionsDialog').then(
                (m) => m.SimulateActionsDialog,
            ),
        ),
        size: 'lg',
    },
};
