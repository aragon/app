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

    it('does not require a wallet to create a workspace', () => {
        // Workspaces are stored locally, so creating one does not read the connected address. Flagging it
        // would make `DialogRoot` render null for a disconnected user, and saving would silently do nothing.
        expect(
            workspaceDialogsDefinitions[WorkspaceDialogId.PUBLISH_WORKSPACE]
                .requiresWallet,
        ).toBeFalsy();
    });

    it('does not require a wallet to edit the workspace details', () => {
        expect(
            workspaceDialogsDefinitions[WorkspaceDialogId.EDIT_DETAILS]
                .requiresWallet,
        ).toBeFalsy();
    });

    it("requires a wallet to add accounts, as the suggestions are the wallet's", () => {
        expect(
            workspaceDialogsDefinitions[WorkspaceDialogId.ADD_ACCOUNTS]
                .requiresWallet,
        ).toBe(true);
    });

    it('requires a wallet to create an account', () => {
        expect(
            workspaceDialogsDefinitions[WorkspaceDialogId.CREATE_ACCOUNT]
                .requiresWallet,
        ).toBe(true);
    });

    it('does not require a wallet for the welcome dialog', () => {
        expect(
            workspaceDialogsDefinitions[WorkspaceDialogId.WELCOME]
                .requiresWallet,
        ).toBeFalsy();
    });
});
