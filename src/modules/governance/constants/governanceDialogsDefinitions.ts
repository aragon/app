import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ExecuteCheckDialog } from '../dialogs/executeCheckDialog/executeCheckDialog';
import { ExecuteDialog } from '../dialogs/executeDialog';
import { PermissionCheckDialog } from '../dialogs/permissionCheckDialog';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { SelectPluginDialog } from '../dialogs/selectPluginDialog';
import { SimulateActionsDialog } from '../dialogs/simulateActionsDialog';
import { VerifySmartContractDialog } from '../dialogs/verifySmartContractDialog';
import { VoteDialog } from '../dialogs/voteDialog';
import { WalletConnectActionDialog } from '../dialogs/walletConnectActionDialog';
import { GovernanceDialogId } from './governanceDialogId';

export const governanceDialogsDefinitions: Record<GovernanceDialogId, IDialogComponentDefinitions> = {
    [GovernanceDialogId.PUBLISH_PROPOSAL]: { Component: PublishProposalDialog },
    [GovernanceDialogId.EXECUTE]: { Component: ExecuteDialog },
    [GovernanceDialogId.VOTE]: { Component: VoteDialog },
    [GovernanceDialogId.SELECT_PLUGIN]: { Component: SelectPluginDialog },
    [GovernanceDialogId.VERIFY_SMART_CONTRACT]: { Component: VerifySmartContractDialog, useFocusTrap: false },
    [GovernanceDialogId.PERMISSION_CHECK]: {
        Component: PermissionCheckDialog,
        hiddenDescription: 'app.governance.permissionCheckDialog.a11y.description',
    },
    [GovernanceDialogId.EXECUTE_CHECK]: {
        Component: ExecuteCheckDialog,
        hiddenDescription: 'app.governance.executeCheckDialog.a11y.description',
    },
    [GovernanceDialogId.WALLET_CONNECT_ACTION]: { Component: WalletConnectActionDialog },
    [GovernanceDialogId.SIMULATE_ACTIONS]: { Component: SimulateActionsDialog, size: 'lg' },
};
