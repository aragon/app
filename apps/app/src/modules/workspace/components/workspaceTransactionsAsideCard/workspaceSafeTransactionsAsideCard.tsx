'use client';

import type { IWorkspaceAccount } from '../../api/workspaceService';
import { WorkspaceSafeAsideCard } from '../workspaceSafeAsideCard';
import { useWorkspaceTransactionStats } from './useWorkspaceTransactionStats';

export interface IWorkspaceSafeTransactionsAsideCardProps {
    /**
     * Safe account selected on the page.
     */
    account: IWorkspaceAccount;
    /**
     * Label of the account, used as the title of the card.
     */
    label: string;
    /**
     * Page size of the transaction list displayed next to the card. The stats are read from the list's own first
     * page, so both must match for the card to add no request.
     */
    pageSize: number;
}

/**
 * Transactions aside card of a Safe account of a workspace: the Safe card fed with the transaction stats of that
 * single account.
 */
export const WorkspaceSafeTransactionsAsideCard: React.FC<
    IWorkspaceSafeTransactionsAsideCardProps
> = (props) => {
    const { account, label, pageSize } = props;

    const stats = useWorkspaceTransactionStats([account], pageSize);

    return (
        <WorkspaceSafeAsideCard account={account} stats={stats} title={label} />
    );
};
