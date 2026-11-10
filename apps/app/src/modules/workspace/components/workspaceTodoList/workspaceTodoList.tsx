'use client';

import {
    AlertInline,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    TransactionDataListItem,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceTodoListData } from '../../hooks/useWorkspaceTodoListData';
import { workspaceTodoUtils } from '../../utils/workspaceTodoUtils';
import { WorkspaceTodoListItem } from './workspaceTodoListItem';

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
}

/**
 * The to-dos of the connected wallet across the given accounts, as one data list: the proposals it can still vote
 * on, then the Safe transactions it can still sign. Its states are the ones of `useWorkspaceTodoListData`.
 */
export const WorkspaceTodoList: React.FC<IWorkspaceTodoListProps> = (props) => {
    const { accounts, workspaceId, pageSize, isPending } = props;

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
                SkeletonElement={TransactionDataListItem.Skeleton}
            >
                {todoList.map((todo) => (
                    <WorkspaceTodoListItem
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
