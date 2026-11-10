'use client';

import {
    AlertInline,
    Button,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    type DataListState,
    IconType,
    type IDataListContainerState,
    TransactionDataListItem,
} from '@aragon/gov-ui-kit';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import {
    type IWorkspaceTodoItem,
    useWorkspaceTodoData,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
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
    /**
     * Page listing every to-do. Setting it makes the list a preview: the pagination gives way to a link to that
     * page, displayed when the first page leaves to-dos out.
     */
    viewAllHref?: string;
}

const getTodoKey = (todo: IWorkspaceTodoItem): string =>
    todo.type === WorkspaceTodoType.PROPOSAL
        ? todo.proposal.id
        : `${todo.account.id}-${todo.transaction.safeTxHash}`;

/**
 * The to-dos of the connected wallet across the given accounts, as one data list: the proposals it can still vote
 * on, then the Safe transactions it can still sign.
 *
 * To-dos belong to the wallet, so without one the list asks to connect it; and when nothing is waiting it says so,
 * so a member learns that nobody is waiting on them.
 */
export const WorkspaceTodoList: React.FC<IWorkspaceTodoListProps> = (props) => {
    const { accounts, workspaceId, pageSize, isPending, viewAllHref } = props;

    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { open } = useDialogContext();

    const {
        todos,
        isPending: isTodosPending,
        isError,
        hasUnreadableAccounts,
    } = useWorkspaceTodoData({ accounts, address });

    const isWalletConnected = address != null;

    // Nothing is read without a wallet, so the list is idle and empty, and its empty state is the one asking to
    // connect.
    const listState = (): DataListState => {
        if (!isWalletConnected) {
            return 'idle';
        }

        if (isPending || isTodosPending) {
            return 'initialLoading';
        }

        return isError ? 'error' : 'idle';
    };

    const connectState: IDataListContainerState = {
        heading: t('app.workspace.workspaceTodoList.connect.heading'),
        description: t('app.workspace.workspaceTodoList.connect.description'),
        objectIllustration: { object: 'WALLET' },
        isStacked: false,
        primaryButton: {
            label: t('app.workspace.workspaceTodoList.connect.action'),
            iconLeft: IconType.BLOCKCHAIN_WALLET,
            onClick: () => open(ApplicationDialogId.CONNECT_WALLET),
        },
    };

    const emptyState: IDataListContainerState = {
        heading: t('app.workspace.workspaceTodoList.emptyState.heading'),
        description: t(
            'app.workspace.workspaceTodoList.emptyState.description',
        ),
        objectIllustration: { object: 'SUCCESS' },
        isStacked: false,
    };

    // The read fails as a whole, so its error replaces the rows; a Safe that could not be read is reported by the
    // endpoint and warned about above the rows instead.
    const errorState: IDataListContainerState = {
        heading: t('app.workspace.workspaceTodoList.errorState.heading'),
        description: t(
            'app.workspace.workspaceTodoList.errorState.description',
        ),
        isStacked: false,
    };

    return (
        <DataListRoot
            entityLabel={t('app.workspace.workspaceTodoList.entity')}
            itemsCount={todos.length}
            pageSize={pageSize}
            state={listState()}
        >
            {hasUnreadableAccounts && (
                <AlertInline
                    message={t('app.workspace.workspaceTodoList.partial')}
                    variant="warning"
                />
            )}
            <DataListContainer
                emptyState={isWalletConnected ? emptyState : connectState}
                errorState={errorState}
                SkeletonElement={TransactionDataListItem.Skeleton}
            >
                {todos.map((todo) => (
                    <WorkspaceTodoListItem
                        key={getTodoKey(todo)}
                        todo={todo}
                        workspaceId={workspaceId}
                    />
                ))}
            </DataListContainer>
            {viewAllHref == null && <DataListPagination />}
            {viewAllHref != null && todos.length > pageSize && (
                <Button
                    className="self-start"
                    href={viewAllHref}
                    iconRight={IconType.CHEVRON_RIGHT}
                    size="md"
                    variant="tertiary"
                >
                    {t('app.workspace.workspaceTodoList.viewAll')}
                </Button>
            )}
        </DataListRoot>
    );
};
