'use client';

import {
    AlertInline,
    DataListContainer,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceTodoListData } from '../../hooks/useWorkspaceTodoListData';
import { workspaceTodoUtils } from '../../utils/workspaceTodoUtils';
import {
    WorkspaceTodoListItem,
    WorkspaceTodoListItemSkeleton,
} from './workspaceTodoListItem';

export interface IWorkspaceTodoListProps {
    /**
     * Accounts to read the to-dos of.
     */
    accounts: IWorkspaceAccount[];
    /**
     * ID of the workspace, which the rows link into.
     */
    workspaceId: string;
    /**
     * Number of to-dos displayed per page.
     */
    pageSize: number;
    /**
     * Keeps the list in its loading state while the accounts are still being resolved.
     */
    isPending?: boolean;
    /**
     * Leaves the account out of the rows, for a list scoped to one account.
     */
    hideAccount?: boolean;
}

/**
 * The to-dos of the connected wallet across the given accounts, as one data list: the proposals it can still vote
 * on, soonest deadline first, then the Safe transactions it can still sign. Its states are the ones of `useWorkspaceTodoListData`.
 */
export const WorkspaceTodoList: React.FC<IWorkspaceTodoListProps> = (props) => {
    const { accounts, workspaceId, pageSize, isPending, hideAccount } = props;

    const { t } = useTranslations();

    const { todoList, state, emptyState, errorState, partialMessage } =
        useWorkspaceTodoListData({ accounts, isPending });

    return (
        <DataListRoot
            entityLabel={t('app.workspace.workspaceTodoList.entity')}
            itemsCount={todoList.length}
            pageSize={pageSize}
            state={state}
        >
            {partialMessage != null && (
                <AlertInline message={partialMessage} variant="warning" />
            )}
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={WorkspaceTodoListItemSkeleton}
            >
                {todoList.map((todo) => (
                    <WorkspaceTodoListItem
                        hideAccount={hideAccount}
                        key={workspaceTodoUtils.getTodoKey(todo)}
                        todo={todo}
                        workspaceId={workspaceId}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
