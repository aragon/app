/**
 * First-run state of the welcome dialog, per browser: `pending` while the dialog is owed to a user who just created
 * a workspace, `seen` once they have acknowledged it. An absent key means neither, so users who already hold a
 * workspace are never greeted: only creating a workspace owes the welcome.
 *
 * Workspaces themselves live in this browser's storage (see `workspaceStorageKey`), so the first-run state is kept
 * beside them rather than on a server that does not know the user. Another device reads as absent and is never
 * greeted, because only a workspace created there marks it pending.
 */
type WelcomeState = 'pending' | 'seen';

/**
 * Tracks the one-off welcome owed to the user who created a workspace. Creating marks it pending; acknowledging the
 * dialog marks it seen, so a dialog closed without acknowledgement stays owed.
 */
class WorkspaceWelcomeUtils {
    private welcomeStorageKey = 'aragon-ftue-workspace-welcome';

    /**
     * Marks the welcome dialog owed to the user who just created a workspace. Creating another workspace does not
     * owe it again: once seen, it stays seen.
     */
    markPendingWelcome = () => {
        if (this.readState() !== 'seen') {
            this.writeState('pending');
        }
    };

    /**
     * Records that the user has acknowledged the welcome, so it is never shown again.
     */
    markWelcomeSeen = () => this.writeState('seen');

    /**
     * @returns Whether the welcome dialog is still owed, which only a workspace created in this browser makes it.
     */
    isWelcomePending = () => this.readState() === 'pending';

    private readState = (): WelcomeState | undefined => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const state = window.localStorage.getItem(this.welcomeStorageKey);

        return state === 'pending' || state === 'seen' ? state : undefined;
    };

    private writeState = (state: WelcomeState) => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(this.welcomeStorageKey, state);
    };
}

export const workspaceWelcomeUtils = new WorkspaceWelcomeUtils();
