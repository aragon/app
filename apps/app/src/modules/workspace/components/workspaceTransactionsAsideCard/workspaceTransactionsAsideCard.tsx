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
import { WorkspaceSafeTransactionsAsideCard } from './workspaceSafeTransactionsAsideCard';

export interface IWorkspaceTransactionsAsideCardProps {
    /**
     * Accounts displayed by the list next to the card, which the aggregated card covers. The cards of a single account
     * read it from `activeOption` instead.
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
 * the same card as the DAO transactions page, a Safe account shows the Safe card, the aggregated view shows the
 * workspace totals. A new account type is added as a case here.
 *
 * The dispatch panel is DAO-only: it takes the account address as a DAO address.
 */
export const WorkspaceTransactionsAsideCard: React.FC<
    IWorkspaceTransactionsAsideCardProps
> = (props) => {
    const { accounts, activeOption, pageSize } = props;

    const { isEnabled } = useFeatureFlags();
    const isAutomationEnabled = isEnabled('capitalFlowAutomation');

    switch (activeOption?.account?.type) {
        case WorkspaceAccountType.DAO:
            return (
                <>
                    <WorkspaceDaoTransactionsAsideCard
                        account={activeOption.account}
                        label={activeOption.label}
                        pageSize={pageSize}
                    />
                    {isAutomationEnabled && (
                        <DispatchPanel
                            daoAddress={activeOption.account.address}
                            network={activeOption.account.network}
                        />
                    )}
                </>
            );
        case WorkspaceAccountType.SAFE:
            return (
                <WorkspaceSafeTransactionsAsideCard
                    account={activeOption.account}
                    label={activeOption.label}
                    pageSize={pageSize}
                />
            );
        default:
            return (
                <WorkspaceAllTransactionsAsideCard
                    accounts={accounts}
                    pageSize={pageSize}
                />
            );
    }
};
