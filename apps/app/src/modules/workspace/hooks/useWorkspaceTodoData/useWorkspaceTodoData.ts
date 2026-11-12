'use client';

import { ProposalStatus } from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import {
    type IWorkspaceTodoProposal,
    type IWorkspaceTodoTransaction,
    useWorkspaceTodo,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceCoverageUtils } from '../../utils/workspaceCoverageUtils';
import { workspaceTodoUtils } from '../../utils/workspaceTodoUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { useWorkspaceDaos } from '../useWorkspaceDaos';

export interface IUseWorkspaceTodoDataParams {
    /**
     * Accounts of the workspace, DAOs and Safes alike.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Address of the connected wallet. Nothing is read without one: eligibility is a property of the wallet.
     */
    address?: string;
}

export enum WorkspaceTodoType {
    PROPOSAL = 'PROPOSAL',
    TRANSACTION = 'TRANSACTION',
}

export interface IWorkspaceTodoProposalItem {
    /**
     * A proposal to vote on.
     */
    type: WorkspaceTodoType.PROPOSAL;
    /**
     * Proposal awaiting the wallet's vote.
     */
    proposal: IWorkspaceTodoProposal;
    /**
     * DAO the proposal belongs to, needed to link and title the row.
     */
    dao: IDao;
}

export interface IWorkspaceTodoTransactionItem {
    /**
     * A Safe transaction to sign.
     */
    type: WorkspaceTodoType.TRANSACTION;
    /**
     * Safe account the transaction is queued on.
     */
    account: IWorkspaceAccount;
    /**
     * Current nonce, threshold and version of the Safe, null when its chain read failed.
     */
    safeInfo: IWorkspaceTodoTransaction['safe'];
    /**
     * Queued transaction awaiting the wallet's confirmation.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Another live transaction of the same Safe holds this nonce, so at most one of them can ever execute.
     */
    hasNonceRival: boolean;
}

export type IWorkspaceTodoItem =
    | IWorkspaceTodoProposalItem
    | IWorkspaceTodoTransactionItem;

export interface IUseWorkspaceTodoDataResult {
    /**
     * What is waiting on the wallet, as one list: the active proposals it can vote on and has not voted on yet,
     * newest first, then the live transactions of the Safes it owns that it has not confirmed yet, in account
     * order then by nonce.
     */
    todos: IWorkspaceTodoItem[];
    /**
     * Whether the read is still pending. False without a wallet or without accounts, where nothing is read.
     */
    isPending: boolean;
    /**
     * Whether the read failed. The list is then empty, and an eligibility that cannot be checked is reported as an
     * error rather than as "nothing to do".
     */
    isError: boolean;
    /**
     * Whether a Safe could not be read, in which case the list is missing its transactions. The other accounts are
     * still listed: one unreachable queue should not hide the work waiting on the others.
     */
    hasUnreadableAccounts: boolean;
}

/**
 * What the connected wallet can still act on across the accounts of a workspace, read in one request from the
 * workspace to-do endpoint, which computes eligibility from its stored memberships, proposals, votes and Safe
 * queues.
 *
 * Two things are settled here rather than on the backend. The process plugin of each proposal has the final word on
 * "active", so a proposal the backend keeps for its open vote window but the plugin no longer calls active (one
 * already approved, say) drops out. And the rows need the real DAO for their link and title, which the endpoint only
 * embeds the metadata of, so the DAOs are read through the shared `useWorkspaceDaos` queries.
 */
export const useWorkspaceTodoData = (
    params: IUseWorkspaceTodoDataParams,
): IUseWorkspaceTodoDataResult => {
    const { accounts, address } = params;

    const isEnabled = address != null && accounts.length > 0;

    const {
        data,
        isPending: isTodoPending,
        isError,
    } = useWorkspaceTodo(
        {
            body: {
                accounts: accounts.map(
                    ({ network, address: accountAddress }) => ({
                        network,
                        address: accountAddress,
                    }),
                ),
                memberAddress: address ?? '',
            },
        },
        { enabled: isEnabled },
    );

    const daoAccounts = accounts.filter(
        (account) => account.type === WorkspaceAccountType.DAO,
    );
    const { daos, isPending: isDaosPending } = useWorkspaceDaos(daoAccounts);

    const proposals = (data?.proposals ?? []).flatMap(
        (proposal): IWorkspaceTodoProposalItem[] => {
            if (
                workspaceTodoUtils.getProposalStatus(proposal) !==
                ProposalStatus.ACTIVE
            ) {
                return [];
            }

            const dao =
                daos[
                    workspaceUtils.buildAccountId({
                        network: proposal.network,
                        address: proposal.daoAddress,
                    })
                ];

            // The row needs the DAO for its link and title, so a proposal whose DAO failed to load is dropped
            // rather than rendered half-broken.
            return dao == null
                ? []
                : [{ type: WorkspaceTodoType.PROPOSAL, proposal, dao }];
        },
    );

    const transactions = (data?.transactions ?? []).flatMap(
        (todoTransaction): IWorkspaceTodoTransactionItem[] => {
            const { safe, transaction, hasNonceRival } = todoTransaction;
            const account = accounts.find((candidate) =>
                workspaceUtils.isSameNetworkAddress(
                    candidate,
                    todoTransaction.account,
                ),
            );

            return account == null
                ? []
                : [
                      {
                          type: WorkspaceTodoType.TRANSACTION,
                          account,
                          safeInfo: safe,
                          transaction,
                          hasNonceRival,
                      },
                  ];
        },
    );

    return {
        todos: [...proposals, ...transactions],
        isPending: isEnabled && (isTodoPending || isDaosPending),
        isError,
        hasUnreadableAccounts: workspaceCoverageUtils.hasUnreadableAccounts(
            data?.coverage,
        ),
    };
};
