'use client';

import { DispatchPanel } from '@/modules/capitalFlow/components/dispatchPanel/dispatchPanel';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider/featureFlagsProvider';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import { WorkspaceAllTransactionsAsideCard } from './workspaceAllTransactionsAsideCard';
import { WorkspaceDaoTransactionsAsideCard } from './workspaceDaoTransactionsAsideCard';

export interface IWorkspaceTransactionsAsideCardProps {
    /**
     * Accounts the stats cover, i.e. the selection displayed by the list next to the card. Resolved by the page, so
     * the card and the list never disagree on what is being looked at.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Account option selected on the page. The whole workspace is described when unset or set to the aggregated
     * option.
     */
    activeOption?: IWorkspaceAccountOption;
    /**
     * Page size of the transaction list displayed next to the card. The stats are read from the list's own first
     * page, so both must match for the card to add no request.
     */
    pageSize: number;
}

/**
 * Aside card of the workspace transactions page, picking the card matching the selected account.
 *
 * Each account type describes itself differently, so the card of a type is its own component: a DAO account shows
 * the same card as the DAO transactions page, the aggregated view shows the workspace totals. A new account type is
 * added by branching on it here.
 *
 * The aggregated branch is also the Safe branch: a Safe is an option (`useWorkspaceAccountOptions`) with no card of
 * its own, so it gets the totals card, titled by the option's label. With no account selected, or the aggregated
 * option, no title is passed and the card titles itself. The dispatch panel is DAO-only: it takes the account
 * address as a DAO address.
 */
export const WorkspaceTransactionsAsideCard: React.FC<
    IWorkspaceTransactionsAsideCardProps
> = (props) => {
    const { accounts, activeOption, pageSize } = props;

    const { isEnabled } = useFeatureFlags();
    const isAutomationEnabled = isEnabled('capitalFlowAutomation');

    const account = activeOption?.account;

    const isDaoAccountSelected =
        activeOption != null && account?.type === WorkspaceAccountType.DAO;

    const title =
        activeOption?.isAllAccounts === false ? activeOption.label : undefined;

    return (
        <>
            {isDaoAccountSelected ? (
                <WorkspaceDaoTransactionsAsideCard
                    account={account}
                    label={activeOption.label}
                    pageSize={pageSize}
                />
            ) : (
                <WorkspaceAllTransactionsAsideCard
                    accounts={accounts}
                    pageSize={pageSize}
                    title={title}
                />
            )}
            {isAutomationEnabled && isDaoAccountSelected && (
                <DispatchPanel
                    daoAddress={account.address}
                    network={account.network}
                />
            )}
        </>
    );
};
