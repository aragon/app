import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IRawActionTuple } from '@/modules/governance/types';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type ITransaction,
    type ITransactionExecution,
    TransactionSide,
} from '../api/financeService';

/**
 * Decoded actions of an execution, in the shape shared by the backend endpoints that return them (DAO and Safe).
 */
export interface IExecutionActionData {
    /**
     * Whether the backend is still decoding the actions.
     */
    decoding: boolean;
    /**
     * Decoded actions.
     */
    actions: IProposalAction[];
    /**
     * Raw actions the decoded ones are checked against.
     */
    rawActions?: IRawActionTuple[];
}

/**
 * State of a query reading the decoded actions of an execution, as read by its refetch interval.
 */
export interface IExecutionActionsQuery {
    /**
     * State of the query.
     */
    state: {
        /**
         * Last data returned by the query.
         */
        data?: Pick<IExecutionActionData, 'decoding'>;
        /**
         * Number of times the query received data.
         */
        dataUpdateCount: number;
    };
}

const actionDecodingRefetchInterval = 2000;
const maxActionDecodingRequests = 10;

class TransactionExecutionUtils {
    /**
     * Narrows a transaction to an execution.
     */
    isExecution = (
        transaction: ITransaction,
    ): transaction is ITransactionExecution =>
        transaction.side === TransactionSide.EXECUTION;

    /**
     * Label displayed next to an execution: the name of the plugin that emitted it, or else its raw source or sender
     * address. The address is returned untruncated, so that it can be rendered through `AddressOutput`.
     */
    getExecutionLabel = (
        transaction: ITransactionExecution,
        dao: IDao | undefined,
    ): string => {
        const sourcePlugin = this.getSourcePlugin(transaction.source, dao);

        if (sourcePlugin != null) {
            return daoUtils.getPluginName(sourcePlugin);
        }

        return transaction.source ?? transaction.fromAddress;
    };

    /**
     * Refetch interval of a decoded-actions query: polls while the backend is still decoding, up to a fixed number
     * of attempts.
     */
    getActionsRefetchInterval = (
        query: IExecutionActionsQuery,
    ): number | false =>
        query.state.data?.decoding &&
        query.state.dataUpdateCount < maxActionDecodingRequests
            ? actionDecodingRefetchInterval
            : false;

    /**
     * Actions to display for an execution: the decoded ones when they match the raw actions, raw-calldata stubs
     * attributed to `fromAddress` otherwise.
     */
    resolveActions = (
        actionData: IExecutionActionData | undefined,
        fromAddress: string,
    ): IProposalAction[] =>
        actionData == null
            ? []
            : proposalActionUtils.resolveActions(
                  actionData.actions,
                  actionData.rawActions,
                  fromAddress,
              );

    /**
     * Resolves the DAO plugin that initiated an execution from its backend `source`
     * identifier (process key, slug, subdomain or interface type).
     */
    getSourcePlugin = (
        source: string | undefined,
        dao: IDao | undefined,
    ): IDaoPlugin | undefined =>
        daoUtils
            .getDaoPlugins(dao)
            ?.find(
                (plugin) =>
                    plugin.processKey === source ||
                    plugin.slug === source ||
                    plugin.subdomain === source ||
                    plugin.interfaceType === source,
            );
}

export const transactionExecutionUtils = new TransactionExecutionUtils();
