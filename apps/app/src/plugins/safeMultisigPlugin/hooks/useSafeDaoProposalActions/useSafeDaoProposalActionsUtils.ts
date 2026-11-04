import { addressUtils } from '@aragon/gov-ui-kit';
import type { ICoreActionExecute } from '@/actions/core/types/coreActionExecute';
import { CoreActionType } from '@/actions/core/types/enum/coreActionType';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IRawActionTuple } from '@/modules/governance/types';
import type { ISafeTransactionActions } from '@/shared/api/safeService';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';

const actionDecodingRefetchInterval = 2000;
const maxActionDecodingRequests = 10;

interface ISafeActionsQuery {
    state: {
        data?: ISafeTransactionActions;
        dataUpdateCount: number;
    };
}

class SafeDaoProposalActionsUtils {
    /**
     * Converts the locally verified DAO execute actions into the raw `(to, value, data)` tuple that
     * the backend decoding is validated against. The local calls are what actually execute, so this
     * tuple is authoritative.
     */
    localActionsToRawTuple = (
        localActions: ITransactionRequest[],
    ): IRawActionTuple[] =>
        localActions.map((action) => ({
            to: action.to,
            value: action.value.toString(),
            data: action.data,
        }));

    /**
     * Collects the nested DAO calls out of the backend-decoded top-level actions: every wrapper
     * action targeting the DAO contributes its decoded sub-actions. Returns undefined when no
     * wrapper carries nested actions, so the caller falls back to the authoritative raw calls rather
     * than showing a bare top-level `execute` wrapper.
     */
    flattenDaoExecuteActions = (
        actions: IProposalAction[] | undefined,
        daoAddress: string,
    ): IProposalAction[] | undefined => {
        if (actions == null) {
            return undefined;
        }

        const nested = actions
            .filter((action) => {
                if (
                    action.type !== CoreActionType.EXECUTE ||
                    !addressUtils.isAddressEqual(action.to, daoAddress)
                ) {
                    return false;
                }

                const executeAction = action as unknown as ICoreActionExecute;

                return Array.isArray(executeAction.inputData.actions);
            })
            .flatMap(
                (action) =>
                    (action as unknown as ICoreActionExecute).inputData
                        .actions ?? [],
            );

        return nested.length > 0 ? nested : undefined;
    };

    /**
     * Polls while the backend is still decoding, bounded to a fixed number of attempts, matching the
     * finance decoded-action query policy.
     */
    getRefetchInterval = (query: ISafeActionsQuery): number | false =>
        query.state.data?.decoding &&
        query.state.dataUpdateCount < maxActionDecodingRequests
            ? actionDecodingRefetchInterval
            : false;
}

export const safeDaoProposalActionsUtils = new SafeDaoProposalActionsUtils();
