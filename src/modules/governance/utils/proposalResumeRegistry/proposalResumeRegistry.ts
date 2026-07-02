import type { IPublishProposalDialogParams } from '../../dialogs/publishProposalDialog';

/**
 * Session-scoped registry mapping a proposal's `intentId` to the params needed to reopen its publish
 * dialog. Populated when a publish dialog is opened, read by the duplicate-proposal warning so it can
 * offer "Return to transaction" — reopening the in-flight proposal's dialog (which then resumes from
 * the pending-transaction manager) instead of forcing a duplicate.
 *
 * In-memory only: the entry is a rebuilt dialog input, not persisted, so "Return" is available for the
 * lifetime of the tab. After a reload the warning degrades to informational details + a transaction link.
 */
class ProposalResumeRegistry {
    private entries = new Map<string, IPublishProposalDialogParams>();

    set = (intentId: string, params: IPublishProposalDialogParams): void => {
        this.entries.set(intentId, params);
    };

    get = (intentId: string): IPublishProposalDialogParams | undefined =>
        this.entries.get(intentId);
}

export const proposalResumeRegistry = new ProposalResumeRegistry();
