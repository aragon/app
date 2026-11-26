import { workspaceWelcomeUtils } from './workspaceWelcomeUtils';

describe('workspaceWelcomeUtils', () => {
    afterEach(() => localStorage.clear());

    describe('isWelcomePending', () => {
        it('returns false when no workspace was created in this browser', () => {
            expect(workspaceWelcomeUtils.isWelcomePending()).toBe(false);
        });

        it('returns true while the welcome is owed', () => {
            workspaceWelcomeUtils.markPendingWelcome();

            expect(workspaceWelcomeUtils.isWelcomePending()).toBe(true);
        });

        it('returns false once the welcome was seen', () => {
            workspaceWelcomeUtils.markPendingWelcome();
            workspaceWelcomeUtils.markWelcomeSeen();

            expect(workspaceWelcomeUtils.isWelcomePending()).toBe(false);
        });
    });

    describe('markPendingWelcome', () => {
        it('owes the welcome', () => {
            workspaceWelcomeUtils.markPendingWelcome();

            expect(workspaceWelcomeUtils.isWelcomePending()).toBe(true);
        });

        it('keeps a seen welcome seen', () => {
            workspaceWelcomeUtils.markWelcomeSeen();

            workspaceWelcomeUtils.markPendingWelcome();

            expect(workspaceWelcomeUtils.isWelcomePending()).toBe(false);
        });
    });

    describe('markWelcomeSeen', () => {
        it('stops owing the welcome', () => {
            workspaceWelcomeUtils.markPendingWelcome();

            workspaceWelcomeUtils.markWelcomeSeen();

            expect(workspaceWelcomeUtils.isWelcomePending()).toBe(false);
        });
    });
});
