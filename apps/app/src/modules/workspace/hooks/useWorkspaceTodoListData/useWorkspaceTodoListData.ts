'use client';

import {
    type DataListState,
    IconType,
    type IDataListContainerState,
} from '@aragon/gov-ui-kit';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import {
    type IWorkspaceTodoItem,
    useWorkspaceTodoData,
} from '../useWorkspaceTodoData';

export interface IUseWorkspaceTodoListDataParams {
    /**
     * Accounts to read the to-dos of.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Keeps the list in its loading state while the accounts are still being resolved.
     */
    isPending?: boolean;
}

/**
 * A state of the to-do list. Always illustrated, as the preview renders it in a card of its own rather than through
 * the data list container, which would default the illustration.
 */
export type IWorkspaceTodoListState = IDataListContainerState &
    Required<Pick<IDataListContainerState, 'objectIllustration'>>;

export interface IUseWorkspaceTodoListDataResult {
    /**
     * To-dos of the connected wallet, the proposals first.
     */
    todoList: IWorkspaceTodoItem[];
    /**
     * State of the list: loading, failed or idle.
     */
    state: DataListState;
    /**
     * State displayed for an idle list holding no to-do: nothing is waiting, or no wallet is connected to tell.
     */
    emptyState: IWorkspaceTodoListState;
    /**
     * State displayed when the to-dos could not be read.
     */
    errorState: IWorkspaceTodoListState;
    /**
     * Warning that the list misses the transactions of a Safe that could not be read, undefined when none did.
     */
    partialMessage?: string;
}

/**
 * The to-dos of the connected wallet across the given accounts with the states of their list, shared by the to-dos
 * page and the preview of the workspace overview so the two tell the same story.
 *
 * To-dos belong to the wallet, so without one nothing is read: the list is idle and empty, and its empty state is
 * the one asking to connect. When nothing is waiting the empty state says so, so a member learns that nobody is
 * waiting on them.
 */
export const useWorkspaceTodoListData = (
    params: IUseWorkspaceTodoListDataParams,
): IUseWorkspaceTodoListDataResult => {
    const { accounts, isPending } = params;

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

    const getState = (): DataListState => {
        if (!isWalletConnected) {
            return 'idle';
        }

        if (isPending || isTodosPending) {
            return 'initialLoading';
        }

        return isError ? 'error' : 'idle';
    };

    const connectState: IWorkspaceTodoListState = {
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

    const nothingWaitingState: IWorkspaceTodoListState = {
        heading: t('app.workspace.workspaceTodoList.emptyState.heading'),
        description: t(
            'app.workspace.workspaceTodoList.emptyState.description',
        ),
        objectIllustration: { object: 'SUCCESS' },
        isStacked: false,
    };

    // The read fails as a whole, so its error replaces the rows; a Safe that could not be read is reported by the
    // endpoint and warned about above the rows instead.
    const errorState: IWorkspaceTodoListState = {
        heading: t('app.workspace.workspaceTodoList.errorState.heading'),
        description: t(
            'app.workspace.workspaceTodoList.errorState.description',
        ),
        objectIllustration: { object: 'ERROR' },
        isStacked: false,
    };

    return {
        todoList: todos,
        state: getState(),
        emptyState: isWalletConnected ? nothingWaitingState : connectState,
        errorState,
        partialMessage: hasUnreadableAccounts
            ? t('app.workspace.workspaceTodoList.partial')
            : undefined,
    };
};
