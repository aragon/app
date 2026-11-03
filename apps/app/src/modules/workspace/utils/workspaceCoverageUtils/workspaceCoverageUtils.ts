import {
    type IWorkspaceCoverage,
    WorkspaceCoverageStatus,
} from '../../api/workspaceQueryService';

class WorkspaceCoverageUtils {
    /**
     * The coverage entries whose source could not be read right now. Answers "which accounts could not be read";
     * callers that only need "is anything unreadable" use `hasUnreadableAccounts`.
     *
     * Only `unavailable` is a read failure. `unverified` is the permanent state of every Safe account (and of any
     * non-indexed address), so counting it would warn forever. `partial` does not mean a read failed either, and
     * `unsupported` is deliberately excluded too: an unsupported source holds no rows to begin with, so nothing is
     * missing from the list the caller is warning about.
     */
    getUnreadableAccounts = (
        coverage?: IWorkspaceCoverage[],
    ): IWorkspaceCoverage[] =>
        coverage?.filter(
            (item) => item.status === WorkspaceCoverageStatus.UNAVAILABLE,
        ) ?? [];

    /**
     * Whether the source of at least one account could not be read right now, i.e. the list is missing rows it
     * should have. Drives the "this list is incomplete" warning. See `getUnreadableAccounts` for what counts as
     * unreadable.
     */
    hasUnreadableAccounts = (coverage?: IWorkspaceCoverage[]): boolean =>
        this.getUnreadableAccounts(coverage).length > 0;

    /**
     * Whether a count built from the coverage is only a lower bound. Drives the `N+` display.
     *
     * `unavailable` accounts are missing from the count, and `partial` means the source holds more than was read,
     * so both make the count a lower bound. `unverified` does not: it says the history is not guaranteed complete,
     * not that something was left unread. Nor does `unsupported`, for the reason above — a source that holds no
     * rows cannot be keeping any out of the count.
     */
    hasIncompleteCount = (coverage?: IWorkspaceCoverage[]): boolean =>
        coverage?.some(
            (item) =>
                item.status === WorkspaceCoverageStatus.UNAVAILABLE ||
                item.status === WorkspaceCoverageStatus.PARTIAL,
        ) ?? false;
}

export const workspaceCoverageUtils = new WorkspaceCoverageUtils();
