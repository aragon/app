import { WorkspaceDialogId } from './workspaceDialogId';
import { workspaceDialogsDefinitions } from './workspaceDialogsDefinitions';

describe('workspaceDialogsDefinitions', () => {
    it('does not require a wallet to select the account to create a proposal for', () => {
        // `DialogRoot` renders null and closes a wallet-requiring dialog whenever there is no address, so flagging
        // this one makes the "New proposal" button do nothing at all for a disconnected user. The wallet is
        // prompted for after the selection, by `usePermissionCheckGuard`, exactly as on the DAO pages.
        expect(
            workspaceDialogsDefinitions[WorkspaceDialogId.SELECT_ACCOUNT]
                .requiresWallet,
        ).toBeFalsy();
    });

    it('requires a wallet to publish a workspace, which sends a transaction', () => {
        expect(
            workspaceDialogsDefinitions[WorkspaceDialogId.PUBLISH_WORKSPACE]
                .requiresWallet,
        ).toBe(true);
    });
});
